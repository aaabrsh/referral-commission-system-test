import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, deleteSession } from "@/lib/auth";
import { HttpStatusCode } from "axios";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    // Get session ID from cookie
    const sessionId = request.cookies.get("session")?.value;

    if (sessionId) {
      // Delete session from database
      await deleteSession(sessionId);
    }

    // Create response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
} 