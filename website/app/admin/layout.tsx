import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userRoles: true },
  });

  if (!user?.userRoles?.find((role) => role.role === "ADMIN")) {
    redirect("/");
  }

  return <>{children}</>;
}
