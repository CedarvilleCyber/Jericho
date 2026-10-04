// Prevents user from accessing admin pages via browser history after logging out
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AdminSessionGuard({
  children,
}: {
  children: ReactNode;
}) {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.push("/");
    }
  }, [isPending, data?.session, router]);

  if (isPending || !data?.session) {
    return null;
  }

  return children;
}