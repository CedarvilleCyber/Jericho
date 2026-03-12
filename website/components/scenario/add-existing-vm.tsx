"use client";

import { VM } from "@/app/generated/prisma/browser";
import { authClient } from "@/lib/auth-client";
import { addVMToScenario } from "@/lib/scenarios/add";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRef } from "react";

export default function AddExistingVMToScenarioPage({
  scenarioId,
  vms,
}: {
  scenarioId: string;
  vms?: VM[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data: session } = authClient.useSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-2xl">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4">
            Add Existing VM to Scenario
          </h3>
          {vms && vms.length > 0 ? (
            <div className="flex flex-col gap-3">
              {vms.map((vm) => (
                <div
                  key={vm.id}
                  className="card bg-base-100 border border-base-300 shadow-sm"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center">
                      <span>
                        VM ID: {vm.proxmoxId} - {vm.name}
                      </span>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={async () => {
                          const formData = new FormData();
                          formData.append("vmId", vm.id);
                          formData.append("scenarioId", scenarioId);
                          formData.append("userId", session.user.id);
                          await addVMToScenario(formData);
                        }}
                      >
                        Add to Scenario
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Link href="/me/request/vm" className="btn btn-primary">
                  Request a new VM
                  <IconExternalLink className="ml-2" />
                </Link>
              </div>
            </div>
          ) : (
            <p>No VMs available to add.</p>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={close}>close</button>
        </form>
      </dialog>
      <button className="btn btn-primary" onClick={open}>
        Add an existing VM
      </button>
    </>
  );
}
