"use client";

import { User } from "@prisma/client";
import React from "react";
import { Button } from "@/components/ui/button";
import api, { ApiRoutes, Routes } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StripeConnectButton } from "@/components/stripe/StripeConnectButton";

interface NavBarProps {
  user: Omit<User, "login_code" | "login_code_expires_at" | "created_at">;
  children: React.ReactNode;
}

export default function NavBar({ user, children }: NavBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post(ApiRoutes.logout);
      toast.success("Logged out successfully");
      router.push(Routes.login);
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Referral Commission System</h1>
            <div className="flex items-center gap-4">
              <Link
                href={Routes.referral}
                className="text-sm hover:font-semibold transition-all"
              >
                Submit Referral
              </Link>
              <Link
                href={Routes.deals}
                className="text-sm hover:font-semibold transition-all"
              >
                Deals Pipeline
              </Link>
              <div className="flex items-center gap-3 pl-5 border-l">
                <StripeConnectButton />
                <Avatar>
                  <AvatarImage src={user.avatar_url ?? ""} />
                  <AvatarFallback>
                    {user.name ? user.name[0] + user.name[1] : ""}
                  </AvatarFallback>
                </Avatar>

                <div className="text-sm text-muted-foreground">
                  Welcome,&nbsp;
                  {user.name || user.email}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main className="max-w-[55rem] mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
