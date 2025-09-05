"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { Send, UserPlus, Building2, Mail, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import api, { ApiRoutes, Routes } from "@/lib/api";
import { User } from "@/types/user";

interface ReferralFormProps {
  user: User;
}

export default function ReferralForm({ user }: ReferralFormProps) {
  const referralSchema = z
    .object({
      receiverEmail: z
        .string()
        .min(1, "Receiver email is required")
        .email("Please enter a valid email address"),
      leadCompany: z
        .string()
        .min(1, "Lead company is required")
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name must be less than 100 characters"),
      leadEmail: z
        .string()
        .min(1, "Lead email is required")
        .email("Please enter a valid email address"),
      dealValue: z
        .number()
        .positive("Deal value must be positive")
        .gt(0, "Deal value must be greater than 0"),
    })
    .refine(
      (data) => {
        // check lead email is different from introducer and receiver emails
        const emails = [user.email, data.receiverEmail];
        return !emails.includes(data.leadEmail);
      },
      {
        message:
          "Lead email must be different from introducer and receiver emails",
        path: ["leadEmail"],
      }
    )
    .refine(
      (data) => {
        // check introducer email is different from receiver email
        return user.email !== data.receiverEmail;
      },
      {
        message: "Receiver email must be different from introducer email",
        path: ["receiverEmail"],
      }
    );

  type ReferralFormData = z.infer<typeof referralSchema>;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ReferralFormData) => {
    setIsSubmitting(true);

    try {
      const response = await api.post(ApiRoutes.referrals, { data });
      toast.success(
        response.data.message || "Referral submitted successfully!"
      );
      reset();

      router.push(Routes.deals);
      router.refresh();
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to submit referral. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Referral
        </h1>
        <p className="text-gray-600">
          Submit a new referral to track potential deals and commissions.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Referral
          </CardTitle>
          <CardDescription>
            Fill in the details below to submit a new referral. All fields are
            required.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* introducer email display - not editable */}
            <div className="space-y-2">
              <Label
                htmlFor="introducerEmail"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Introducer Email
              </Label>
              <Input
                id="introducerEmail"
                type="email"
                placeholder="introducer@example.com"
                value={user.email}
                className="border-none"
                disabled={true}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="receiverEmail"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Receiver Email *
              </Label>
              <Input
                id="receiverEmail"
                type="email"
                placeholder="receiver@example.com"
                {...register("receiverEmail")}
                className={errors.receiverEmail ? "border-red-500" : ""}
              />
              {errors.receiverEmail && (
                <p className="text-xs text-red-500">
                  {errors.receiverEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadCompany" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Lead Company *
              </Label>
              <Input
                id="leadCompany"
                type="text"
                placeholder="Acme Corporation"
                {...register("leadCompany")}
                className={errors.leadCompany ? "border-red-500" : ""}
              />
              {errors.leadCompany && (
                <p className="text-xs text-red-500">
                  {errors.leadCompany.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Lead Email *
              </Label>
              <Input
                id="leadEmail"
                type="email"
                placeholder="lead@acme.com"
                {...register("leadEmail")}
                className={errors.leadEmail ? "border-red-500" : ""}
              />
              {errors.leadEmail && (
                <p className="text-xs text-red-500">
                  {errors.leadEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealValue" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Deal Value *
              </Label>
              <Input
                id="dealValue"
                type="number"
                step="0.01"
                placeholder="$10,000"
                {...register("dealValue", { valueAsNumber: true })}
                className={errors.dealValue ? "border-red-500" : ""}
              />
              {errors.dealValue && (
                <p className="text-xs text-red-500">
                  {errors.dealValue.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Referral
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
