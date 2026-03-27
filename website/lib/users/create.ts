"use server";

import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserResult {
  name: string;
  email: string;
  success: boolean;
  error?: string;
}

export async function bulkCreateUsers(
  users: CreateUserInput[],
): Promise<CreateUserResult[]> {
  const guard = await requireAdminSession();
  if (guard) {
    return users.map((u) => ({
      name: u.name,
      email: u.email,
      success: false,
      error: guard.error,
    }));
  }

  const results: CreateUserResult[] = [];

  for (const user of users) {
    try {
      const hashed = await hashPassword(user.password);
      const created = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          emailVerified: true,
          userRoles: { create: { role: "STUDENT" } },
        },
      });
      await prisma.account.create({
        data: {
          accountId: created.id,
          providerId: "credential",
          userId: created.id,
          password: hashed,
        },
      });
      results.push({ name: user.name, email: user.email, success: true });
    } catch (e: unknown) {
      console.error("Failed to create user", user.email, e);
      const msg = e instanceof Error ? e.message : "Unknown error";
      results.push({ name: user.name, email: user.email, success: false, error: msg });
    }
  }

  return results;
}
