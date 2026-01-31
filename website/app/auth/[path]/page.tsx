"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { use } from "react";

export default function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = use(params);

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
  