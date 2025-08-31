import { NextRequest, NextResponse } from "next/server";
import {
  sendCircleDirectMessage,
  verifyCircleMemberByEmail,
} from "@/lib/circle";
import { createLoginCode } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HttpStatusCode } from "axios";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // verify if user exists in Circle
    const circleMember = await verifyCircleMemberByEmail(email);

    if (!circleMember) {
      return NextResponse.json(
        { error: "User not found in Circle community" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // check if user exists in database, create if not
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          circle_member_id: circleMember.id,
          email: circleMember.email.toLowerCase(),
          name: circleMember.name,
          avatar_url: circleMember.avatar_url,
        },
      });
    }

    // generate and store login code
    const loginCode = await createLoginCode(user.id);

    // send generated code in user's DM
    const messageSent = await sendCircleDirectMessage({
      member_id: circleMember.id,
      body: `Your one-time login code is: ${loginCode}`,
    });

    if (!messageSent) {
      return NextResponse.json(
        { error: "Failed to send login code" },
        { status: HttpStatusCode.InternalServerError }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login code sent successfully",
    });
  } catch (error) {
    console.error("Error in verify-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
