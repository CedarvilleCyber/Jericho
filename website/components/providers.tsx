"use client";

import { authClient } from "@/lib/auth-client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { MantineProvider } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isMounted = useMounted();

  return (
    <MantineProvider defaultColorScheme="auto">
      {isMounted ? (
        <AuthUIProvider
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          onSessionChange={() => router.refresh()}
          Link={Link}
        >
          {children}
        </AuthUIProvider>
      ) : (
        children
      )}
    </MantineProvider>
  );
}
