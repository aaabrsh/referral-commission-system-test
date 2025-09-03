"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Spinner from "@/components/ui/spinner";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface EmailInputProps {
  isLoading: boolean;
  onSendClick: (email: string) => void;
}

const emailSchema = z.object({
  email: z.string().min(1, "email is required").email("Invalid email"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function EmailInput({
  isLoading,
  onSendClick,
}: EmailInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const onSubmit = ({ email }: EmailFormData) => {
    onSendClick(email);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome</CardTitle>
        <CardDescription>
          Enter your email to receive a login code in your Circle DM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full flex gap-2 hover:gap-3 transition-all cursor-pointer"
                disabled={isLoading || !isValid}
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <span>Send Login Code</span>
                    <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
