import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { proxmox } from "@/proxmox";
import Link from "next/link";

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>VM ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Console URL</TableHead>
          <TableHead>Console</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vmDetails.map((vm) => (
          <TableRow key={vm.vmid}>
            <TableCell>{vm.vmid}</TableCell>
            <TableCell>{vm.name}</TableCell>
            <TableCell>{vm.status}</TableCell>
            <TableCell>
              <Link
                href={`https://${process.env.PVE_HOST}:${process.env.PVE_PORT}/?console=kvm&novnc=1&node=${process.env.PVE_NODE}&vmid=${vm.vmid}`}
                target="_blank"
              >
                Console
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/vms/${vm.vmid}/console`}>Console</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
