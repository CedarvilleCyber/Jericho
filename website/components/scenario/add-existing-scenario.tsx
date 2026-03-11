"use client";

import { Scenario } from "@/app/generated/prisma/client";
import { addExistingScenarioToUser } from "@/lib/scenarios/add";
import {
  IconDeviceDesktop,
  IconDeviceFloppy,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function AddExistingScenarioPage({
  userId,
  scenarios,
}: {
  userId: string;
  scenarios: (Scenario & { joined: boolean })[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function addSelectedScenarios() {
    await Promise.all(
      selectedScenarios.map((scenarioId) => {
        const formData = new FormData();
        formData.append("scenarioId", scenarioId);
        formData.append("userId", userId);
        return addExistingScenarioToUser(formData);
      }),
    );
    close();
  }

  return (
    <>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4">Add Existing Scenario</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="card bg-base-100 border border-base-300"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {scenario.teaserImageURL ? (
                            <Image
                              src={scenario.teaserImageURL ?? "/placeholder.png"}
                              alt={scenario.name}
                              width={48}
                              height={48}
                              className="mb-3 rounded-md"
                            />
                          ) : (
                            <IconDeviceDesktop size={48} className="mb-3" />
                          )}
                          <span>{scenario.name}</span>
                        </div>
                        <p className="text-sm text-base-content/60">
                          {scenario.teaserText}
                        </p>
                      </div>
                      <button
                        className={`btn btn-square btn-sm ${
                          selectedScenarios.includes(scenario.id)
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                        onClick={() => {
                          if (selectedScenarios.includes(scenario.id)) {
                            setSelectedScenarios(
                              selectedScenarios.filter(
                                (id) => id !== scenario.id,
                              ),
                            );
                          } else {
                            setSelectedScenarios([
                              ...selectedScenarios,
                              scenario.id,
                            ]);
                          }
                        }}
                        disabled={scenario.joined}
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={addSelectedScenarios}>
                <IconDeviceFloppy size={16} className="mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={close}>close</button>
        </form>
      </dialog>
      <button className="btn btn-primary" onClick={open}>
        <IconPlus size={16} className="mr-1" />
        Add Existing Scenario
      </button>
    </>
  );
}
