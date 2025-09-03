import { useProtectedServerAuth } from "@/hooks/useServerAuth";
import { Routes } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function Home() {
  await useProtectedServerAuth(); // redirects to login if user is not authenticated
  redirect(Routes.deals);
}
