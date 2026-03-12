"use client";

import { setUserScenarioVM } from "@/lib/scenarios/admin";
import { VM } from "@/app/generated/prisma/browser";
import { useRef } from "react";

export default function UserScenarioVMEditor({
  userScenarioId,
  currentVM,
  availableVMs,
}: {
  userScenarioId: string;
  currentVM: VM | null;
  availableVMs: VM[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function assign(vmId: string) {
    const formData = new FormData();
    formData.append("userScenarioId", userScenarioId);
    formData.append("vmId", vmId);
    await setUserScenarioVM(formData);
    close();
  }

  async function unassign() {
    const formData = new FormData();
    formData.append("userScenarioId", userScenarioId);
    await setUserScenarioVM(formData);
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
          <h3 className="font-bold text-lg mb-4">Assign VM to Scenario</h3>
          {availableVMs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {availableVMs.map((vm) => (
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
                        className={`btn btn-xs ${
                          currentVM?.id === vm.id
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                        onClick={() => assign(vm.id)}
                      >
                        {currentVM?.id === vm.id ? "Assigned" : "Assign"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No VMs available for this user.</p>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={close}>close</button>
        </form>
      </dialog>

      <div className="flex flex-col gap-3">
        <p className="font-medium">Assigned VM</p>
        {currentVM ? (
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>
                    VM ID: {currentVM.proxmoxId} - {currentVM.name}
                  </span>
                  <span className="badge badge-success">Assigned</span>
                </div>
                <button
                  className="btn btn-outline btn-error btn-xs"
                  onClick={unassign}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-base-content/60">No VM assigned.</p>
        )}
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={open}>
            {currentVM ? "Change VM" : "Assign VM"}
          </button>
        </div>
      </div>
    </>
  );
}
