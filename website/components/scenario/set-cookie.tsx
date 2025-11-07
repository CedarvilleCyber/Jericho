"use client";

import { setCookie } from "@/lib/proxmox/cookies";
import { useEffect, useRef } from "react";

export default function SetCookieForm({ authTicket }: { authTicket: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (formRef.current && !hasSubmitted.current) {
      hasSubmitted.current = true;
      formRef.current.requestSubmit();
    }
  }, []);

  return (
    <form
      ref={formRef}
      action={async () => {
        await setCookie(authTicket);
      }}
      className="hidden"
    >
      <button type="submit">Set Cookie</button>
    </form>
  );
}
