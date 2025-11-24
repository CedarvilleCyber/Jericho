"use client";

import { setCookie } from "@/lib/users/set-cookie";
import { Proxmox } from "proxmox-api";
import { useEffect } from "react";

export default function SetAuthCookie({
  ticket,
}: {
  ticket: Proxmox.accessTicketCreateTicket;
}) {
  useEffect(() => {
    setCookie("PVEAuthCookie", ticket.ticket || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
}
