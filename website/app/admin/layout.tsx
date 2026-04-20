import { requireAdminSession } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const error = await requireAdminSession();
  if (error?.error === "Not authenticated") redirect("/auth/sign-in");
  if (error) redirect("/");

  return <>{children}</>;
}
