import { Prisma } from "@prisma/client";

export type ReferralWithUser = Prisma.ReferralGetPayload<{
  include: {
    receiver: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
    introducer: {
      select: { id: true; name: true; email: true; avatar_url: true };
    };
  };
}>;
