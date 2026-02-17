import EditUserButton from "@/components/admin/edit-user-button";
import ScenarioTriggers from "@/components/admin/scenario-triggers";
import VMsEditor from "@/components/admin/vms-editor";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAllVMs } from "@/lib/proxmox-api/vms";
import {
  Box,
  Button,
  Container,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userRoles: true },
  });

  if (!user?.userRoles?.find((role) => role.role === "ADMIN")) {
    redirect("/");
  }

  const users = (
    await prisma.user.findMany({
      include: { userRoles: true, vms: true },
    })
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const allVMs = (await getAllVMs()).map((vm) => ({
    vmid: vm.vmid,
    name: vm.name ?? "",
    template: vm.template === 1,
  }));

  return (
    <Container size="lg">
      <h1 className="text-xl my-5">Admin Dashboard</h1>

      <Box className="border border-gray-700 shadow-lg rounded-md p-4 mb-4">
        <Box mah="50vh" className="overflow-auto">
          <Table miw={700} stickyHeader>
            <TableThead>
              <TableTr>
                <TableTh>Name</TableTh>
                <TableTh>Email</TableTh>
                <TableTh>Roles</TableTh>
                <TableTh>VM Management</TableTh>
                <TableTh>User Management</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {users.map((user) => (
                <TableTr key={user.id}>
                  <TableTd>{user.name}</TableTd>
                  <TableTd>{user.email}</TableTd>
                  <TableTd>
                    {user.userRoles.map((role) => role.role).join(", ")}
                  </TableTd>
                  <TableTd>
                    <Box className="flex items-center gap-2">
                      <span>{user.vms.length} VMs</span>
                      <VMsEditor user={user} proxmoxVMs={allVMs} />
                    </Box>
                  </TableTd>
                  <TableTd>
                    <EditUserButton userId={user.id} />
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Box>
      <ScenarioTriggers />
    </Container>
  );
}
