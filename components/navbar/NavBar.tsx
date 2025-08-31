import { User } from "@prisma/client";
import React from "react";
import { Button } from "@/components/ui/button";
import api, { ApiRoutes, Routes } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface NavBarProps {
  user: User;
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
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Referral Commission System</h1>
            <div className="flex items-center gap-4">
              <a href="/referral" className="text-sm hover:underline">
                Submit Referral
              </a>
              <a href="/deals" className="text-sm hover:underline">
                Deal Pipeline
              </a>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name || user.email}
                </span>

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
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
