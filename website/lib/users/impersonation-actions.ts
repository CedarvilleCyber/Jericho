"use server";

import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type ActionResult = { success: true } | { error: string };

export async function impersonateUserAction(userId: string): Promise<ActionResult> {
  if (!userId) {
    return { error: "Missing userId" };
  }

  const adminError = await requireAdminSession();
  if (adminError) {
    return adminError;
  }

  try {
    const currentSession = await auth.api.getSession({ headers: await headers() });
    if (!currentSession?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Better Auth admin permissions use user.role; keep it aligned with app roles.
    if (currentSession.user.role !== "admin") {
      await prisma.user.update({
        where: { id: currentSession.user.id },
        data: { role: "admin" },
      });
    }

    await auth.api.impersonateUser({
      body: { userId },
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    console.error("Impersonation error:", error);
    return { error: "Failed to impersonate user" };
  }
}

export async function stopImpersonatingAction(): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { error: "No active session" };
    }

    const currentSession = session.session as { impersonatedBy?: string | null };
    if (!currentSession.impersonatedBy) {
      return { error: "Not impersonating a user" };
    }

    await auth.api.stopImpersonating({
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    console.error("Stop impersonation error:", error);
    return { error: "Failed to stop impersonating" };
  }
}