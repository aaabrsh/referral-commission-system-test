import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export const createStripeConnectAccount = async (
  email: string,
  userId: string
) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      metadata: {
        user_id: userId,
      },
    });

    return account;
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    throw error;
  }
};

export const createAccountLink = async (
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return accountLink;
  } catch (error) {
    console.error("Error creating account link:", error);
    throw error;
  }
};
