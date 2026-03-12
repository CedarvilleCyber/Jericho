"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function requestPasswordReset(): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Not authenticated" };

  const existing = await prisma.passwordResetRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });
  if (existing) return { error: "You already have a pending reset request." };

  await prisma.passwordResetRequest.create({
    data: { userId: session.user.id },
  });
  return {};
}

export async function requestPasswordResetByIdentifier(
  identifier: string
): Promise<{ error?: string }> {
  const trimmed = identifier.trim();
  if (!trimmed) return { error: "Please enter your email or username." };

  const isEmail = trimmed.includes("@");
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: trimmed } : { username: trimmed },
  });

  // Return success even if not found to avoid user enumeration
  if (!user) return {};

  const existing = await prisma.passwordResetRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
  });
  if (existing) return {};

  await prisma.passwordResetRequest.create({
    data: { userId: user.id },
  });
  return {};
}
