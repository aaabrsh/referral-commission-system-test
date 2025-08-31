import NavBar from "@/components/navbar/NavBar";
import { useProtectedServerAuth } from "@/hooks/useServerAuth";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  // this will redirect to /login if user is not authenticated
  const { user } = await useProtectedServerAuth();

  return <NavBar user={user}>{children}</NavBar>;
}
