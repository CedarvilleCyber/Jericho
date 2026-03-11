import prisma from "@/lib/prisma";
import Link from "next/link";
import UserScenarioVMEditor from "./vm-editor";

export default async function UserScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userScenario = await prisma.userScenario.findUnique({
    where: {
      id,
    },
    include: {
      scenario: true,
      vm: true,
      user: {
        include: { vms: true },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="breadcrumbs text-sm mb-6 mt-4">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/admin">Admin</Link>
          </li>
          <li>
            {userScenario?.user.name} - {userScenario?.scenario.name}
          </li>
        </ul>
      </div>
      <p className="text-xl mb-4">
        {userScenario?.scenario.name} scenario for {userScenario?.user.name}
      </p>
      <div className="tabs tabs-bordered">
        <input
          type="radio"
          name="us_tabs"
          role="tab"
          className="tab"
          aria-label="VMs"
          defaultChecked
        />
        <div role="tabpanel" className="tab-content py-4">
          {userScenario && (
            <UserScenarioVMEditor
              userScenarioId={userScenario.id}
              currentVM={userScenario.vm}
              availableVMs={userScenario.user.vms}
            />
          )}
        </div>
        <input
          type="radio"
          name="us_tabs"
          role="tab"
          className="tab"
          aria-label="Questions"
        />
        <div role="tabpanel" className="tab-content py-4"></div>
      </div>
    </div>
  );
}
