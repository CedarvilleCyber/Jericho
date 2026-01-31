import VMsEditor from "@/components/admin/vms-editor";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Box,
  Container,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { headers } from "next/headers";
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

  const users = (await prisma.user.findMany({
    include: { userRoles: true, vms: true },
  })).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <Container size="lg">
      <h1 className="text-xl my-5">Admin Dashboard</h1>

      <Box className="border border-gray-700 shadow-lg rounded-md p-4">
        <Table miw={700}>
          <TableThead>
            <TableTr>
              <TableTh>Name</TableTh>
              <TableTh>Email</TableTh>
              <TableTh>Roles</TableTh>
              <TableTh>VM Management</TableTh>
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
                    <VMsEditor user={user} />
                  </Box>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Box>
    </Container>
  );
}
