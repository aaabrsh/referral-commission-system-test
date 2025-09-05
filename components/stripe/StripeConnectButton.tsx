"use client";

import { Button } from "@/components/ui/button";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { KycStatus } from "@prisma/client";
import { CreditCard, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export const StripeConnectButton = () => {
  const {
    isLoading,
    isCreating,
    hasAccount,
    onboardingUrl,
    kycStatus,
    createStripeConnectAccount,
    redirectToOnboarding,
  } = useStripeConnect();

  const handleClick = async () => {
    if (!hasAccount) {
      const link = await createStripeConnectAccount();
      if (link) {
        toast.success(
          "Stripe Connect account created! Redirecting to onboarding..."
        );
        redirect(link);
      }
    } else {
      redirectToOnboarding();
    }
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        disabled
        className="cursor-pointer w-full text-wrap"
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (hasAccount) {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className="cursor-pointer w-full text-wrap"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {kycStatus !== KycStatus.VERIFIED
          ? "Complete Onboarding"
          : "Edit Stripe Account"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isCreating}
      className="cursor-pointer w-full text-wrap"
    >
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
