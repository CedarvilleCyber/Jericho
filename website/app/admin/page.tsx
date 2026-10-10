import BulkCreateUsers from "@/components/admin/bulk-create-users";
import ScenarioTriggers from "@/components/admin/scenario-triggers";
import UserTable from "@/components/admin/user-table";
import prisma from "@/lib/prisma";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

export default async function AdminPage() {
  const users = (
    await prisma.user.findMany({
      include: { userRoles: true },
    })
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between my-5">
        <h1 className="text-xl">Admin Dashboard</h1>
        <div className="flex gap-2">
          <BulkCreateUsers />
          <Link href={"/admin/scenarios"} className="btn btn-primary">
            <IconExternalLink /> Manage Scenarios
          </Link>
        </div>
      </div>

      <UserTable
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.userRoles.map((role) => role.role),
        }))}
      />
      <ScenarioTriggers />
    </div>
  );
}
