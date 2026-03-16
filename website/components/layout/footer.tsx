"use client";

import { authClient } from "@/lib/auth-client";
import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";

export default function Footer() {
  const { data } = authClient.useSession();

  if (!data?.session) {
    return null;
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 flex gap-2 justify-end px-4 py-3 border-t backdrop-blur-sm z-10 bg-base-100/80 border-base-300">
      <Link href="/me">
        <button className="btn btn-ghost btn-sm">
          <IconUser size={16} />
          Account
        </button>
      </Link>
      <button
        className="btn btn-ghost btn-sm text-error"
        onClick={() => authClient.signOut()}
      >
        <IconLogout size={16} />
        Sign Out
      </button>
    </div>
  );
}
