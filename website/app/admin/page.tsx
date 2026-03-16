import EditUserButton from "@/components/admin/edit-user-button";
import ScenarioTriggers from "@/components/admin/scenario-triggers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

  const users = (
    await prisma.user.findMany({
      include: { userRoles: true },
    })
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-xl my-5">Admin Dashboard</h1>

      <div className="border border-base-300 shadow-lg rounded-md p-4 mb-4">
        <div className="overflow-auto max-h-[50vh]">
          <table className="table min-w-175">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>User Management</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.userRoles.map((role) => role.role).join(", ")}</td>
                  <td>
                    <EditUserButton userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ScenarioTriggers />
    </div>
  );
}
