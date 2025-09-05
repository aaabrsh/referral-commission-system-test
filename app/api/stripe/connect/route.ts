import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createStripeConnectAccount, createAccountLink } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// create a stripe account for a user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if user already has stripe connect account
    if (user.stripe_connect_id) {
      return NextResponse.json(
        { error: "User already has a Stripe Connect account" },
        { status: 400 }
      );
    }

    // create stripe connect account
    const account = await createStripeConnectAccount(user.email, user.id);

    // update stripe_connect_id
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripe_connect_id: account.id,
      },
    });

    // create onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await createAccountLink(
      account.id,
      `${baseUrl}`, // refresh_url
      `${baseUrl}` // return_url
    );

    return NextResponse.json({
      account_id: account.id,
      onboarding_url: accountLink.url,
      kyc_status: user.kyc_status,
    });
  } catch (error) {
    console.error("Error in Stripe Connect endpoint:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    );
  }
}

// get stripe onboarding link
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.stripe_connect_id) {
      return NextResponse.json({
        has_account: false,
        onboarding_url: null,
      });
    }

    // create onboarding link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await createAccountLink(
      user.stripe_connect_id,
      `${baseUrl}`,
      `${baseUrl}`
    );

    return NextResponse.json({
      has_account: true,
      account_id: user.stripe_connect_id,
      onboarding_url: accountLink.url,
      kyc_status: user.kyc_status,
    });
  } catch (error) {
    console.error("Error in Stripe Connect GET endpoint:", error);
    return NextResponse.json(
      { error: "Failed to get Stripe Connect status" },
      { status: 500 }
    );
  }
}
