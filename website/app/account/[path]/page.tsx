"use client";

import { AccountView } from "@daveyplate/better-auth-ui";
import { use } from "react";

export default function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = use(params);

  return (
    <main className="container p-4 md:p-6">
      <AccountView path={path} />
    </main>
  );
}
