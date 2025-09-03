import ReferralForm from "@/components/referral/ReferralForm";
import { useProtectedServerAuth } from "@/hooks/useServerAuth";

export default async function ReferralPage() {
  const { user } = await useProtectedServerAuth();
  return <ReferralForm user={user} />;
}
