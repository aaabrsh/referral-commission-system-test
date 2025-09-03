"use client";

import { useState } from "react";
import EmailInput from "@/components/login/EmailInput";
import LoginCodeInput from "@/components/login/LoginCodeInput";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api, { ApiRoutes, Routes } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();

  const handleSendClick = async (email: string) => {
    setIsLoading(true);
    setEmail(email);

    try {
      const response = await api.post(ApiRoutes.verify_email, { email });

      toast.success(
        response.data.message || "Login code sent to your Circle DM!"
      );
      setIsEmailVerified(true);
    } catch (error: any) {
      console.error("Error sending login code:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to send login code. Please try again.";
      toast.error(errorMessage);
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = async (code: string) => {
    setIsLoading(true);
    setLoginCode(code);

    try {
      const response = await api.post(ApiRoutes.verify_code, { email, code });

      toast.success(response.data.message || "Login successful!");
      // Redirect to authenticated area
      router.push(Routes.deals);
    } catch (error: any) {
      console.error("Error verifying code:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to verify code. Please try again.";
      toast.error(errorMessage);
      setLoginCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          {isEmailVerified ? (
            <LoginCodeInput
              isLoading={isLoading}
              onLoginClick={handleLoginClick}
              onBackClick={() => {
                setIsEmailVerified(false);
                setEmail("");
              }}
            />
          ) : (
            <EmailInput isLoading={isLoading} onSendClick={handleSendClick} />
          )}
        </div>
      </div>
    </div>
  );
}
