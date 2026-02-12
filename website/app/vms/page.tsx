"use client";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/lib/db/user";
import { getTicket } from "@/lib/proxmox-api/ticket";
import { getUserVMs } from "@/lib/vms/get";
import {
  Button,
  Container,
  Paper,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@mantine/core";
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
    <Container
      size="xl"
      className="pb-5 bt-2 mt-3 h-[90vh] border border-gray-500 rounded-md shadow-lg"
    >
      <Tabs
        value={selectedTab}
        onChange={(v) => setSelectedTab(v ?? "open-new")}
        className="h-full"
      >
        <TabsList>
          <TabsTab value="open-new">Open New VM</TabsTab>
          {openVMs.map((vmId) => (
            <TabsTab key={vmId} value={vmId}>
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
                  className="hover:cursor-pointer hover:text-red-600 transition-colors"
                />
              </div>
            </TabsTab>
          ))}
        </TabsList>
        <TabsPanel value="open-new" className="h-full pt-3">
          <div className="h-full overflow-y-auto flex flex-wrap gap-4">
            {vmsLoading ? (
              <Container className="h-full flex flex-col justify-center items-center">
                <IconFidgetSpinner className="animate-spin mb-2" size={48} />
                <p>Loading your VMs...</p>
              </Container>
            ) : userVMs.length === 0 ? (
              <p>You have no VMs assigned.</p>
            ) : (
              userVMs.map((vm) => (
                <Paper
                  key={vm.id}
                  className="mb-4 p-4 w-64 h-64"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
                    borderRadius: "0.375rem",
                    border: "1px solid #4B5563",
                  }}
                >
                  <h2 className="text-lg font-semibold mb-2">
                    VM ID: {vm.proxmoxId}
                  </h2>
                  <p className="mb-4">Name: {vm.name}</p>
                  <Button
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
                  </Button>
                </Paper>
              ))
            )}
          </div>
        </TabsPanel>
        {openVMs.map((vmId) => (
          <TabsPanel key={vmId} value={vmId} className="h-full pt-3">
            <iframe
              src={
                `https://${process.env.NEXT_PUBLIC_PVE_HOST || "jericho-pve.alexthetaylor.com"}` +
                `:${process.env.NEXT_PUBLIC_PVE_PORT || "443"}?console=kvm&novnc=1&` +
                `node=${process.env.NEXT_PUBLIC_PVE_NODE || "jericho01"}&vmid=${vmId}`
              }
              className="w-full h-[calc(100%-2rem)] border-0 rounded-md shadow-lg"
            />
          </TabsPanel>
        ))}
      </Tabs>
    </Container>
  );
}
