import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { KycStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not found");
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "account.updated":
        const account = event.data.object;

        // Check if this is a user's Stripe Connect account
        if (account.metadata?.user_id) {
          const userId = account.metadata.user_id;

          // update user's KYC status based on account requirements
          const requirements = account.requirements;
          let kycStatus: KycStatus = KycStatus.IN_PROGRESS;

          if (
            requirements?.currently_due?.length === 0 &&
            requirements?.eventually_due?.length === 0 &&
            requirements?.past_due?.length === 0
          ) {
            kycStatus = KycStatus.VERIFIED;
          } else if (
            (requirements?.past_due && requirements.past_due.length > 0) ||
            (requirements?.errors && requirements?.errors.length > 0) ||
            requirements?.disabled_reason
          ) {
            kycStatus = KycStatus.FAILED;
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              kyc_status: kycStatus,
            },
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook: ", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
