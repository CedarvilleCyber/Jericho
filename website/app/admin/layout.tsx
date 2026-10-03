import { requireAdminSession } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import AdminSessionGuard from "@/components/admin/session-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const error = await requireAdminSession();
  if (error?.error === "Not authenticated") redirect("/sign-in");
  if (error) redirect("/");

  return <AdminSessionGuard>{children}</AdminSessionGuard>;
}
