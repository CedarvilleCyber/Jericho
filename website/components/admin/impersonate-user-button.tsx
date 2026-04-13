"use client";

import { impersonateUserAction } from "@/lib/users/impersonation-actions";
import { IconExternalLink } from "@tabler/icons-react";
import { useState } from "react";

export default function ImpersonateUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImpersonate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await impersonateUserAction(userId);

      if ("error" in result) {
        const message = result.error;
        setError(message);
      } else {
        // Redirect to home page as the impersonated user
        window.location.href = "/";
      }
    } catch (_err) {
      setError("Failed to impersonate user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="btn btn-secondary btn-outline"
        onClick={handleImpersonate}
        disabled={isLoading}
      >
        <IconExternalLink size={16} />
        {isLoading ? "Impersonating..." : `Impersonate ${userName}`}
      </button>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}
