import { auth } from "@/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OpenVMConsole from "@/components/vms/open-vm-console";
import prisma from "@/prisma";
import { proxmox } from "@/proxmox";

export default async function VMsPage() {
  const node = proxmox.nodes.$("jericho01");
  const vms = await node.qemu.$get();
  const vmDetails = vms
    .sort((a, b) => a.vmid - b.vmid)
    .map((vm) => ({
      vmid: vm.vmid,
      name: vm.name,
      status: vm.status,
    }));

  const session = await auth();
  if (!session?.user) {
    return <div>Please log in to view your VMs.</div>;
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email || undefined },
  });
  const proxmoxTicket = await proxmox.access.ticket.$post({
    username: `${user?.proxmoxId}@pve`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "password",
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>VM ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Console Link</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vmDetails.map((vm) => (
          <TableRow key={vm.vmid}>
            <TableCell>{vm.vmid}</TableCell>
            <TableCell>{vm.name}</TableCell>
            <TableCell>{vm.status}</TableCell>
            <TableCell>
              <OpenVMConsole
                proxmoxTicket={proxmoxTicket}
                redirectUrl={`https://${
                  process.env.PVE_HOST || "proxmox.alexthetaylor.com"
                }:${process.env.PVE_PORT || "443"}?console=kvm&novnc=1&node=${
                  process.env.PVE_NODE
                }&vmid=${vm.vmid}&ticket=${encodeURIComponent(
                  proxmoxTicket.ticket || ""
                )}`}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
