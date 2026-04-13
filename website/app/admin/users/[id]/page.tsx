import DeleteUserButton from "@/components/admin/delete-user";
import ImpersonateUserButton from "@/components/admin/impersonate-user-button";
import RoleSelect from "@/components/admin/role-select";
import VMsTabContent from "@/components/admin/vms-tab-content";
import AddExistingScenarioPage from "@/components/scenario/add-existing-scenario";
import EditUserScenario from "@/components/scenario/edit-user-scenario";
import prisma from "@/lib/prisma";
import { getAllVMs } from "@/lib/proxmox-api/vms";
import { deleteUserScenario } from "@/lib/scenarios/delete";
import { IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      userScenarios: { include: { scenario: true } },
      vms: true,
      userRoles: true,
    },
  });
  const allVMs = (await getAllVMs()).map((vm) => ({
    vmid: vm.vmid,
    name: vm.name ?? "",
    template: vm.template === 1,
  }));

  const allScenarios = (await prisma.scenario.findMany()).map((scenario) => ({
    ...scenario,
    joined:
      user?.userScenarios.some((us) => us.scenarioId === scenario.id) ?? false,
  }));
  if (!user) {
    redirect("/admin");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 mt-4">
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
          <li>{user?.name}</li>
        </ul>
      </div>
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <div className="tabs tabs-bordered">
        <input
          type="radio"
          name="user_tabs"
          role="tab"
          className="tab"
          aria-label="Details"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content py-4">
          <div className="flex flex-col gap-2 p-4 bg-neutral rounded-lg">
            <label className="text-neutral-content">User Roles</label>
            <RoleSelect
              userId={user.id}
              initialRoles={user.userRoles.map((ur) => ur.role)}
            />
          </div>
          <div className="mt-4">
            <ImpersonateUserButton userId={user.id} userName={user.name || user.email} />
          </div>
          <DeleteUserButton userId={user.id} />
        </div>

        <input
          type="radio"
          name="user_tabs"
          role="tab"
          className="tab"
          aria-label="VMs"
        />
        <div role="tabpanel" className="tab-content py-4">
          <VMsTabContent user={user} proxmoxVMs={allVMs} />
        </div>

        <input
          type="radio"
          name="user_tabs"
          role="tab"
          className="tab"
          aria-label="Scenarios"
        />
        <div role="tabpanel" className="tab-content py-4">
          <p className="text-lg mb-4">Scenarios for {user?.name}</p>
          <div className="flex flex-col gap-4">
            {user?.userScenarios.map((us) => (
              <div
                key={us.id}
                className="card bg-base-100 border border-base-300"
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 mr-auto">
                      <div className="flex items-center gap-2">
                        <Image
                          src={us.scenario.teaserImageURL ?? "/placeholder.png"}
                          alt={us.scenario.name}
                          width={48}
                          height={48}
                          className="mb-3 rounded-md"
                        />
                        <span className="text-lg">{us.scenario.name}</span>
                      </div>
                      <p className="text-sm text-base-content/60">
                        Added on {us.startedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <EditUserScenario userScenarioId={us.id} />
                    <form action={deleteUserScenario}>
                      <input
                        type="hidden"
                        name="userScenarioId"
                        value={us.id}
                      />
                      <button type="submit" className="btn btn-error btn-sm">
                        <IconTrash size={16} className="mr-2" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <AddExistingScenarioPage
                userId={user.id}
                scenarios={allScenarios}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
