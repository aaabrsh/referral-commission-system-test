import { Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    circle_member_id: true;
    email: true;
    name: true;
    avatar_url: true;
    stripe_connect_id: true;
    kyc_status: true;
  };
}>;
