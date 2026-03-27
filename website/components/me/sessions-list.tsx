"use client";

import { authClient } from "@/lib/auth-client";
import { parseUserAgent } from "@/lib/utils/user-agent";
import { useEffect, useState } from "react";

type Session = {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
};

export default function SessionsList({
  currentToken,
}: {
  currentToken: string;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const result = await authClient.listSessions();
      if (result.data) {
        setSessions(result.data as Session[]);
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeSession = async (token: string) => {
    await authClient.revokeSession({ token });
    await loadSessions();
  };

  const handleRevokeOtherSessions = async () => {
    setRevokeAllLoading(true);
    try {
      await authClient.revokeOtherSessions();
      await loadSessions();
    } finally {
      setRevokeAllLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg">Active Sessions</h3>
          <button
            className="btn btn-ghost btn-sm text-error"
            onClick={handleRevokeOtherSessions}
            disabled={revokeAllLoading || sessions.length <= 1}
          >
            {revokeAllLoading && (
              <span className="loading loading-spinner loading-xs" />
            )}
            Revoke All Others
          </button>
        </div>
        <p className="text-sm text-base-content/60 mb-4">
          Manage devices and sessions with access to your account.
        </p>
        {sessionsLoading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-sm" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((session) => {
              const isCurrent = session.token === currentToken;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-base-200 last:border-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {session.userAgent
                          ? parseUserAgent(session.userAgent)
                          : "Unknown device"}
                      </span>
                      {isCurrent && (
                        <span className="badge badge-primary badge-sm">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-base-content/50">
                      {session.ipAddress ?? "Unknown IP"} &middot;{" "}
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!isCurrent && (
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRevokeSession(session.token)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
