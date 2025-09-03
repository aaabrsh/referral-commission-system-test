import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { ApiRoutes } from "@/lib/api";
import { toast } from "sonner";

interface StripeConnectStatus {
  has_account: boolean;
  account_id?: string;
  onboarding_url?: string;
}

interface CreateAccountResponse {
  account_id: string;
  onboarding_url: string;
}

export const useStripeConnect = () => {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // query to get current stripe connect status
  const {
    data: status,
    isLoading,
    error,
  } = useQuery<StripeConnectStatus>({
    queryKey: ["stripe-connect-status"],
    queryFn: async () => {
      const response = await api.get(ApiRoutes.stripeConnect);
      return response.data;
    },
    retry: false,
  });

  // mutation to create stripe connect account
  const createAccountMutation = useMutation<CreateAccountResponse, Error>({
    mutationFn: async () => {
      setIsCreating(true);
      try {
        const response = await api.post(ApiRoutes.stripeConnect);
        return response.data;
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: () => {
      // invalidate and refetch the status
      queryClient.invalidateQueries({ queryKey: ["stripe-connect-status"] });
    },
    onError: (error: any) => {
      console.error("Failed to create Stripe Connect account:", error);
      toast.error(
        error.response?.data?.error || "Failed to create Stripe Connect account"
      );
    },
  });

  const createAccount = () => {
    createAccountMutation.mutate();
  };

  const redirectToOnboarding = () => {
    if (status?.onboarding_url) {
      window.open(status.onboarding_url, "_blank");
    }
  };

  return {
    status,
    isLoading,
    error,
    isCreating: isCreating || createAccountMutation.isPending,
    createAccount,
    redirectToOnboarding,
    hasAccount: status?.has_account || false,
    onboardingUrl: status?.onboarding_url,
  };
};
