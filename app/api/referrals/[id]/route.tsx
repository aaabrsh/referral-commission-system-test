import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { HttpStatusCode } from "axios";
import { z } from "zod";
import { DealStage } from "@prisma/client";

// validation schema for stage update
const updateStageSchema = z.object({
  stage: z.enum(DealStage),
});

// update referral stage
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateStageSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { stage } = validationResult.data;

    // check if referral exists
    const referral = await prisma.referral.findFirst({
      where: {
        id,
        introducer_user_id: currentUser.id,
      },
      include: {
        introducer: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar_url: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // update referral stage
    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: { stage },
    });

    return NextResponse.json({
      success: true,
      message: "Referral stage updated successfully",
      referral: { ...referral, stage: updatedReferral.stage },
    });
  } catch (error) {
    console.error("Error updating referral stage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
