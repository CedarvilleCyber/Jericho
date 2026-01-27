import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/prisma";

/**
 * Require authentication and return session + user
 * Redirects to home if not authenticated
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      UserRoles: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return { session, user };
}

/**
 * Get current session (may be null)
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Get current user from session (may be null)
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { UserRoles: true },
  });

  return user;
}

/**
 * For API routes - get session from request headers
 */
export async function getSessionFromRequest(headers: Headers) {
  const session = await auth.api.getSession({
    headers,
  });
  return session;
}
