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

interface EmailInputProps {
  isLoading: boolean;
  onSendClick: (email: string) => void;
}

export default function EmailInput({
  isLoading,
  onSendClick,
}: EmailInputProps) {
  const [email, setEmail] = useState("");

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome</CardTitle>
        <CardDescription>
          Enter your email to receive a login code in your Circle DM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendClick(email);
          }}
        >
          <div className="grid gap-6">
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full flex gap-2 hover:gap-3 transition-all cursor-pointer"
                disabled={isLoading || !email}
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
