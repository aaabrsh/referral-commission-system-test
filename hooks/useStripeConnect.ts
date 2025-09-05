import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { ApiRoutes } from "@/lib/api";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { KycStatus } from "@prisma/client";

interface StripeConnectStatusResponse {
  has_account: boolean;
  account_id?: string;
  onboarding_url?: string | null;
  kyc_status?: KycStatus;
}

interface CreateAccountResponse {
  account_id: string;
  onboarding_url: string;
  kyc_status: KycStatus;
}

export const useStripeConnect = () => {
  const [hasAccount, setHasAccount] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    getStripeConnectStatus();
  }, []);

  const getStripeConnectStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<StripeConnectStatusResponse>(
        ApiRoutes.stripeConnect
      );

      setKycStatus(res.data.kyc_status || null);
      setHasAccount(res.data.has_account || false);
      setOnboardingUrl(res.data.onboarding_url || null);
    } catch (error: any) {
      console.log("error checking stripe connect status: ", error);
      toast.error(
        error.response?.data?.error || "Failed to get Stripe account status"
      );

      setKycStatus(null);
      setHasAccount(false);
      setOnboardingUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createStripeConnectAccount = async () => {
    setIsCreating(true);
    try {
      const res = await api.post<CreateAccountResponse>(
        ApiRoutes.stripeConnect
      );

      setHasAccount(true);
      setOnboardingUrl(res.data.onboarding_url || null);
      setKycStatus(res.data.kyc_status || null);
      return res.data.onboarding_url;
    } catch (error: any) {
      console.error("Failed to create Stripe Connect account:", error);
      toast.error(
        error.response?.data?.error || "Failed to create Stripe Connect account"
      );

      setHasAccount(false);
      setOnboardingUrl(null);
      setKycStatus(null);
    } finally {
      setIsCreating(false);
    }
  };

  const redirectToOnboarding = () => {
    if (onboardingUrl) {
      redirect(onboardingUrl);
    }
  };

  return {
    isLoading,
    isCreating,
    createStripeConnectAccount,
    redirectToOnboarding,
    hasAccount,
    onboardingUrl,
    kycStatus,
  };
};
