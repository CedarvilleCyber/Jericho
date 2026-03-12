"use client";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/lib/db/user";
import { getTicket } from "@/lib/proxmox-api/ticket";
import { getUserVMs } from "@/lib/vms/get";
import {
  IconExternalLink,
  IconFidgetSpinner,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { VM } from "../generated/prisma/client";

export default function VMsPage() {
  const [openVMs, setOpenVMs] = useState<string[]>([]);
  const [userVMs, setUserVMs] = useState<VM[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("open-new");
  const [vmsLoading, setVMsLoading] = useState<boolean>(true);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function fetchUserVMs() {
      if (!session?.user) return;
      const vms = await getUserVMs(session?.user.id);
      setUserVMs(vms);
      setVMsLoading(false);
    }

    async function setAuthCookie() {
      if (!session?.user) return;
      const user = await getUser(session.user.id);
      if (!user?.proxmoxId) return;

      await getTicket(user.proxmoxId);
      await fetchUserVMs();
    }

    setAuthCookie();
  }, [session?.user]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 pb-5 mt-3 h-[90vh] border border-base-300 rounded-md shadow-lg flex flex-col">
      {/* Tab list */}
      <div role="tablist" className="tabs tabs-bordered flex-shrink-0">
        <button
          role="tab"
          className={`tab ${selectedTab === "open-new" ? "tab-active" : ""}`}
          onClick={() => setSelectedTab("open-new")}
        >
          Open New VM
        </button>
        {openVMs.map((vmId) => (
          <button
            key={vmId}
            role="tab"
            className={`tab ${selectedTab === vmId ? "tab-active" : ""}`}
            onClick={() => setSelectedTab(vmId)}
          >
            <div className="flex items-center gap-2">
              <p className="my-auto text-xs">
                {userVMs.find((vm) => vm.proxmoxId.toString() === vmId)
                  ?.name || `VM ${vmId}`}
              </p>
              <IconX
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenVMs((prev) => prev.filter((id) => id !== vmId));
                  if (selectedTab === vmId) {
                    setSelectedTab("open-new");
                  }
                }}
                size={16}
                className="hover:cursor-pointer hover:text-error transition-colors"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === "open-new" && (
          <div className="h-full overflow-y-auto pt-3 flex flex-wrap gap-4">
            {vmsLoading ? (
              <div className="h-full flex flex-col justify-center items-center w-full">
                <IconFidgetSpinner className="animate-spin mb-2" size={48} />
                <p>Loading your VMs...</p>
              </div>
            ) : userVMs.length === 0 ? (
              <p>You have no VMs assigned.</p>
            ) : (
              userVMs.map((vm) => (
                <div
                  key={vm.id}
                  className="card bg-base-100 shadow-md mb-4 w-64 h-64 flex flex-col justify-center p-4"
                  style={{
                    borderRadius: "0.375rem",
                    border: "1px solid #4B5563",
                  }}
                >
                  <h2 className="text-lg font-semibold mb-2">
                    VM ID: {vm.proxmoxId}
                  </h2>
                  <p className="mb-4">Name: {vm.name}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setOpenVMs((prev) => {
                        if (!prev.includes(vm.proxmoxId.toString())) {
                          return [...prev, vm.proxmoxId.toString()];
                        }
                        return prev;
                      });
                      setSelectedTab(vm.proxmoxId.toString());
                    }}
                  >
                    Open VM
                    <IconExternalLink className="ml-2" size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {openVMs.map((vmId) => (
          <div
            key={vmId}
            className={`h-full pt-3 ${selectedTab === vmId ? "block" : "hidden"}`}
          >
            <iframe
              src={
                `https://${process.env.NEXT_PUBLIC_PVE_HOST || "jericho-pve.alexthetaylor.com"}` +
                `:${process.env.NEXT_PUBLIC_PVE_PORT || "443"}?console=kvm&novnc=1&` +
                `node=${process.env.NEXT_PUBLIC_PVE_NODE || "jericho01"}&vmid=${vmId}`
              }
              className="w-full h-[calc(100%-2rem)] border-0 rounded-md shadow-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
