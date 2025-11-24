"use client";

import { Button } from "../ui/button";
import { setCookieAndRedirect } from "@/lib/users/set-cookie";
import { Proxmox } from "proxmox-api";

export default function OpenVMConsole({
  proxmoxTicket,
  redirectUrl,
}: {
  proxmoxTicket: Proxmox.accessTicketCreateTicket;
  redirectUrl: string;
}) {
  return (
    <Button
      onClick={() =>
        setCookieAndRedirect(
          "PVEAuthCookie",
          proxmoxTicket.ticket || "",
          redirectUrl
        )
      }
    >
      Open Console
    </Button>
  );
}
