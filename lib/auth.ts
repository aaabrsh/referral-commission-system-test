import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { User } from "@/types/user";
import { Routes } from "@/lib/api";

export const generateLoginCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createLoginCode = async (user_id: string) => {
  const code = generateLoginCode();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user_id },
    data: {
      login_code: code,
      login_code_expires_at: expires_at,
    },
  });

  return code;
};

export const validateLoginCode = async (email: string, code: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      login_code: code,
      login_code_expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return null;
  }

  return user;
};

export const clearLoginCode = async (user_id: string) => {
  await prisma.user.update({
    where: { id: user_id },
    data: {
      login_code: null,
      login_code_expires_at: null,
    },
  });
};

export const createSession = async (user_id: string) => {
  const session = await prisma.session.create({
    data: {
      user_id: user_id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2), // 48 hours
    },
  });

  return session.id;
};

export const getSession = async (session_id: string) => {
  const session = await prisma.session.findUnique({
    where: { id: session_id },
    include: {
      user: {
        select: {
          id: true,
          circle_member_id: true,
          email: true,
          name: true,
          avatar_url: true,
          stripe_connect_id: true,
          kyc_status: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await deleteSession(session_id);
    }
    return null;
  }

  return session;
};

export const deleteSession = async (session_id: string) => {
  await prisma.session.delete({
    where: { id: session_id },
  });
};

export const setSessionCookie = async (session_id: string) => {
  const cookieStore = await cookies();
  cookieStore.set("session", session_id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 2, // 48 hours
    path: "/",
  });
};

export const getCurrentSession = async () => {
  const cookieStore = await cookies();
  const session_id = cookieStore.get("session")?.value;

  if (!session_id) {
    return null;
  }

  const session = await getSession(session_id);
  if (!session) {
    return null;
  }

  return session;
};

export const getCurrentUser = async () => {
  const session = await getCurrentSession();
  return session ? session.user : null;
};

export const requireAuth = async () => {
  const user: User | null = await getCurrentUser();
  if (!user) {
    redirect(Routes.login);
  }
  return user as User;
};
