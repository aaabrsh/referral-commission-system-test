"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import api, { ApiRoutes, Routes } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StripeConnectButton } from "@/components/stripe/StripeConnectButton";
import { User } from "@/types/user";

interface NavBarProps {
  user: User;
  children: React.ReactNode;
}

export default function NavBar({ user, children }: NavBarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <h1 className="text-lg sm:text-xl font-bold">
              Referral Commission System
            </h1>
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-4">
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
                <div>
                  <StripeConnectButton />
                </div>
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
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>
          </nav>
          {isMenuOpen && (
            <div className="md:hidden mt-3 flex flex-col gap-3">
              <Link
                href={Routes.referral}
                className="text-sm hover:font-semibold transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Referral
              </Link>
              <Link
                href={Routes.deals}
                className="text-sm hover:font-semibold transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals Pipeline
              </Link>
              <div className="flex flex-col items-center gap-3 pt-3 border-t">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url ?? ""} />
                    <AvatarFallback>
                      {user.name ? user.name[0] + user.name[1] : ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-muted-foreground">
                    Welcome,&nbsp;{user.name || user.email}
                  </div>
                </div>
                <StripeConnectButton />
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-[55rem] mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
