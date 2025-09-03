import Deals from "@/components/deals/Deals";
import { useProtectedServerAuth } from "@/hooks/useServerAuth";
import { useServerReferrals } from "@/hooks/useServerReferrals";

export default async function DealsPage() {
  const { user } = await useProtectedServerAuth();
  const referrals = await useServerReferrals(user.id);

  return <Deals allReferrals={referrals} />;
}
