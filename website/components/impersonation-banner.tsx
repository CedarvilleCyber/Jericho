"use client";

import { authClient } from "@/lib/auth-client";
import { stopImpersonatingAction } from "@/lib/users/impersonation-actions";
import { IconAlertCircle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ImpersonationBanner() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if currently impersonating
    const checkImpersonation = async () => {
      const response = await authClient.getSession();
      const session = response.data?.session as
        | { impersonatedBy?: string | null }
        | undefined;

      if (session?.impersonatedBy) {
        setIsImpersonating(true);
      }
    };

    checkImpersonation();
  }, []);

  const handleStopImpersonating = async () => {
    setIsLoading(true);
    try {
      const response = await stopImpersonatingAction();

      if ("success" in response) {
        // Refresh and redirect
        router.refresh();
        window.location.href = "/admin";
      }
    } catch (error) {
      console.error("Failed to stop impersonating", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-warning text-warning-content p-4 mb-4 rounded-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <IconAlertCircle size={20} />
        <span className="font-semibold">
          You are currently impersonating a user.
        </span>
      </div>
      <button
        className="btn btn-sm btn-warning"
        onClick={handleStopImpersonating}
        disabled={isLoading}
      >
        {isLoading ? "Stopping..." : "Stop Impersonating"}
      </button>
    </div>
  );
}
