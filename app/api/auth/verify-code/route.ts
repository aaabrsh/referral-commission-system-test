import { NextRequest, NextResponse } from "next/server";
import {
  validateLoginCode,
  clearLoginCode,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { HttpStatusCode } from "axios";

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Login code is required" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Validate the login code
    const user = await validateLoginCode(email, code);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired login code" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Clear the login code after successful validation
    await clearLoginCode(user.id);

    // Create session
    const sessionId = await createSession(user.id);

    // Set session cookie
    await setSessionCookie(sessionId);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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
