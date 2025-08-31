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
import { useState } from "react";
import Spinner from "@/components/ui/spinner";

interface LoginCodeInputProps {
  isLoading: boolean;
  onLoginClick: (code: string) => void;
  onBackClick: () => void;
}

export default function LoginCodeInput({
  isLoading,
  onLoginClick,
  onBackClick,
}: LoginCodeInputProps) {
  const [code, setCode] = useState("");

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLoginClick(code);
          }}
        >
          <div className="grid gap-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Login Code</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full flex gap-2 hover:gap-3 transition-all cursor-pointer"
                disabled={isLoading || !code}
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
