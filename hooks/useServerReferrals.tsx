import prisma from "@/lib/prisma";
import { ReferralWithUser } from "@/types/referral";

// get referrals from server
export const useServerReferrals = async (
  userId: string
): Promise<ReferralWithUser[]> => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { introducer: { id: userId } },
      include: {
        introducer: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
      },
    });

    return referrals;
  } catch (error) {
    console.error("Error while fetching referrals: ", error);
    return [];
  }
};
