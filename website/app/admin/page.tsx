import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PVEAccessEditor from "@/components/user/pve-access-editor";
import RoleEditor from "@/components/user/role-editor";
import { getUserPermissions } from "@/lib/users/pve/read";
import prisma from "@/prisma";

export default async function AdminPage() {
  const usersWithRoles = await prisma?.user.findMany({
    include: { UserRoles: true },
  });

  const userPermissions = await Promise.all(
    usersWithRoles
      ?.filter((user) => user.proxmoxId)
      .map(async (user) => {
        const permissions = await getUserPermissions(user.proxmoxId!);
        return { userId: user.id, permissions };
      }) || []
  );

  return (
    <div className="m-2 p-2 bg-muted rounded-lg w-2xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Proxmox User</TableHead>
            <TableHead>Roles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithRoles?.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                <PVEAccessEditor
                  user={user}
                  permissions={userPermissions[index]}
                />
              </TableCell>
              <TableCell>
                <RoleEditor user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
