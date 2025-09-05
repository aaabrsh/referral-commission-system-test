import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  verifyCircleMemberByEmail,
  sendCircleDirectMessage,
} from "@/lib/circle";
import prisma from "@/lib/prisma";
import { HttpStatusCode } from "axios";
import { z } from "zod";
import { DealStage } from "@prisma/client";

const referralSchema = z.object({
  receiverEmail: z.string().email("Invalid receiver email"),
  leadCompany: z.string().min(2, "Company name must be at least 2 characters"),
  leadEmail: z.string().email("Invalid lead email"),
  dealValue: z.number().positive("Deal value must be positive"),
});

// create a referral
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { data } = await request.json();
    const validationResult = referralSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const { receiverEmail, leadCompany, leadEmail, dealValue } =
      validationResult.data;

    // check for duplicate referrals (same lead email within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existingReferral = await prisma.referral.findFirst({
      where: {
        lead_email: leadEmail.toLowerCase(),
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        {
          error:
            "A referral with this lead email already exists within the last 30 days",
        },
        { status: HttpStatusCode.Conflict }
      );
    }

    // verify receiver exists in Circle
    let receiverMember = await verifyCircleMemberByEmail(receiverEmail);
    if (!receiverMember) {
      if (process.env.SKIP_CIRCLE_INTEGRATION === "true") {
        receiverMember = {
          id: crypto.randomUUID(),
          name: "Test Circle Member",
          email: receiverEmail,
          avatar_url: "",
        };
      } else {
        return NextResponse.json(
          { error: "Receiver not found in Circle community" },
          { status: HttpStatusCode.NotFound }
        );
      }
    }

    // get or create receiver user
    let receiverUser = await prisma.user.findUnique({
      where: { email: receiverEmail.toLowerCase() },
    });
    if (!receiverUser) {
      receiverUser = await prisma.user.create({
        data: {
          circle_member_id: receiverMember.id,
          email: receiverMember.email.toLowerCase(),
          name: receiverMember.name,
          avatar_url: receiverMember.avatar_url,
        },
      });
    }

    // create the referral
    const referral = await prisma.referral.create({
      data: {
        introducer_user_id: currentUser.id,
        receiver_user_id: receiverUser.id,
        lead_company: leadCompany,
        lead_email: leadEmail.toLowerCase(),
        deal_value: dealValue,
        stage: DealStage.NEW,
      },
    });

    // send Circle DM to receiver
    const dmMessage = `🎯 New Referral Opportunity!

You've received a new referral from ${currentUser.name || currentUser.email}.

**Lead Details:**
• Company: ${leadCompany}
• Email: ${leadEmail}
• Deal Value: $${dealValue.toLocaleString()}

This referral has been added to your pipeline. You can view and manage it in the deals section.

Best of luck with this opportunity! 🚀`;

    const messageSent = await sendCircleDirectMessage({
      member_id: receiverMember.id,
      body: dmMessage,
    });

    if (!messageSent) {
      console.warn(
        "Failed to send Circle DM to receiver, but referral was created"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Referral submitted successfully",
      referral,
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
