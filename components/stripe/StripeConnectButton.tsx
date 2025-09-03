"use client";

import { Button } from "@/components/ui/button";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export const StripeConnectButton = () => {
  const {
    status,
    isLoading,
    isCreating,
    hasAccount,
    onboardingUrl,
    createAccount,
    redirectToOnboarding,
  } = useStripeConnect();

  const handleClick = async () => {
    if (!hasAccount) {
      try {
        await createAccount();
        toast.success(
          "Stripe Connect account created! Redirecting to onboarding..."
        );

        setTimeout(() => {
          if (onboardingUrl) {
            redirect(onboardingUrl);
          }
        }, 1000);
      } catch (error) {
        toast.error("Failed to create Stripe Connect account");
      }
    } else {
      redirectToOnboarding();
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (hasAccount) {
    return (
      <Button variant="outline" onClick={handleClick}>
        <CreditCard className="h-4 w-4 mr-2" />
        Complete Onboarding
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isCreating}>
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Creating Account...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Connect Stripe
        </>
      )}
    </Button>
  );
};
