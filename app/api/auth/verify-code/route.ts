import { NextRequest, NextResponse } from "next/server";
import {
  validateLoginCode,
  clearLoginCode,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { HttpStatusCode } from "axios";
import { createStripeConnectAccount } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import z from "zod";

// login payload validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(1, "Login code is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { code, email } = body;

    // validate the login code
    const user = await validateLoginCode(email, code);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired login code" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // clear the login code
    await clearLoginCode(user.id);

    // create Stripe Connect account if one doesn't exist
    if (!user.stripe_connect_id) {
      try {
        const account = await createStripeConnectAccount(user.email, user.id);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripe_connect_id: account.id,
          },
        });
      } catch (error) {
        console.error("Failed to create Stripe Connect account:", error);
      }
    }

    // create session
    const sessionId = await createSession(user.id);

    // set session cookie
    await setSessionCookie(sessionId);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Error in verify-code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
