import EditUserButton from "@/components/admin/edit-user-button";
import ResolvePasswordResetButton from "@/components/admin/resolve-password-reset-button";
import ScenarioTriggers from "@/components/admin/scenario-triggers";
import VMsEditor from "@/components/admin/vms-editor";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAllVMs } from "@/lib/proxmox-api/vms";
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
      include: { userRoles: true, vms: true },
    })
  ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const allVMs = (await getAllVMs()).map((vm) => ({
    vmid: vm.vmid,
    name: vm.name ?? "",
    template: vm.template === 1,
  }));

  const pendingResets = await prisma.passwordResetRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-xl my-5">Admin Dashboard</h1>

      <div className="border border-base-300 shadow-lg rounded-md p-4 mb-4">
        <div className="overflow-auto max-h-[50vh]">
          <table className="table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>VM Management</th>
                <th>User Management</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.userRoles.map((role) => role.role).join(", ")}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span>{user.vms.length} VMs</span>
                      <VMsEditor user={user} proxmoxVMs={allVMs} />
                    </div>
                  </td>
                  <td>
                    <EditUserButton userId={user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pendingResets.length > 0 && (
        <div className="border border-base-300 shadow-lg rounded-md p-4 mb-4">
          <h2 className="text-lg mb-3">Pending Password Reset Requests</h2>
          <div className="overflow-auto">
            <table className="table" style={{ minWidth: 500 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingResets.map((req) => (
                  <tr key={req.id}>
                    <td>{req.user.name}</td>
                    <td>{req.user.email}</td>
                    <td>{req.createdAt.toLocaleDateString()}</td>
                    <td>
                      <ResolvePasswordResetButton
                        requestId={req.id}
                        userName={req.user.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ScenarioTriggers />
    </div>
  );
}
