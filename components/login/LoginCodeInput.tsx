"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
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
import Spinner from "@/components/ui/spinner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface LoginCodeInputProps {
  isLoading: boolean;
  onLoginClick: (code: string) => void;
  onBackClick: () => void;
}

const loginCodeSchema = z.object({
  code: z.string().min(1, "login code is required"),
});

type LoginCodeFormData = z.infer<typeof loginCodeSchema>;

export default function LoginCodeInput({
  isLoading,
  onLoginClick,
  onBackClick,
}: LoginCodeInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginCodeFormData>({
    resolver: zodResolver(loginCodeSchema),
    mode: "onChange",
  });

  const onSubmit = ({ code }: LoginCodeFormData) => {
    onLoginClick(code);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex gap-2">
          <ArrowLeft
            onClick={onBackClick}
            className="cursor-pointer"
            size={"20px"}
          />
          <CardDescription>
            Enter the login code sent to your Circle DM
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="code">Login Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  {...register("code")}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code.message}</p>
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
                    <span>Verify</span>
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
