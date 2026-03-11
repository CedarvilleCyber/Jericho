"use client";

import { User, VM } from "@/app/generated/prisma/client";
import { ensureUserHasProxmoxId } from "@/lib/proxmox-api/user";
import { addExistingVMToUser, cloneVMTemplateToUser } from "@/lib/vms/add";
import { deleteVMFromProxmox, removeVM } from "@/lib/vms/remove";
import {
  IconDeviceFloppy,
  IconMinus,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";

export default function VMsEditor({
  user,
  proxmoxVMs,
}: {
  user: User & { vms: VM[] };
  proxmoxVMs: Array<{ vmid: number; name: string; template: boolean }>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [newVMName, setNewVMName] = useState("");
  const [popoverTab, setPopoverTab] = useState<"add-existing" | "create-new">(
    "add-existing",
  );
  const [vmSearchExisting, setVmSearchExisting] = useState("");
  const [existingDropdownOpen, setExistingDropdownOpen] = useState(false);
  const [vmSearchTemplate, setVmSearchTemplate] = useState("");
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);

  function open() {
    dialogRef.current?.showModal();
    ensureUserHasProxmoxId(user.id);
  }

  function close() {
    dialogRef.current?.close();
  }

  const getFilteredVMs = (searchValue: string, templatesOnly: boolean) => {
    const search = searchValue.toLowerCase().trim();
    const parts = search.length
      ? search.split(/\s+/).filter((p: string) => p.length > 2)
      : [];

    const filtered = proxmoxVMs.filter((vm) => {
      if (templatesOnly && !vm.template) return false;
      if (!search) return true;
      const name = vm.name.toLowerCase();
      const id = vm.vmid.toString();

      if (parts.length > 0) {
        return parts.some((p: string) => name.includes(p) || id.includes(p));
      }

      return name.includes(search) || id.includes(search);
    });

    filtered.sort((a, b) => a.vmid - b.vmid);
    return filtered;
  };

  const filteredExisting = getFilteredVMs(vmSearchExisting, false);
  const filteredTemplates = getFilteredVMs(vmSearchTemplate, true);

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
          <h3 className="font-bold text-lg mb-3">Edit VMs for {user.name}</h3>
          <hr className="mb-3" />
          <div className="flex flex-col">
            {user.vms.length === 0 ? (
              <p>This user has no VMs assigned.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>VM ID</th>
                    <th>VM Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {user.vms.map((vm) => (
                    <tr key={vm.id}>
                      <td>{vm.proxmoxId}</td>
                      <td>
                        {
                          proxmoxVMs.find(
                            (pvm) =>
                              pvm.vmid.toString() === vm.proxmoxId.toString(),
                          )?.name
                        }
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <div className="tooltip" data-tip="Remove VM">
                            <button
                              className="btn btn-outline btn-error btn-xs"
                              onClick={() => removeVM(vm.proxmoxId, user.id)}
                            >
                              <IconMinus size={16} />
                            </button>
                          </div>
                          <div className="tooltip" data-tip="Delete VM">
                            <button
                              className="btn btn-outline btn-error btn-xs"
                              onClick={() =>
                                deleteVMFromProxmox(vm.proxmoxId)
                              }
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Popover for adding VMs */}
            <div className="relative mt-2 ml-auto">
              <div className="tooltip" data-tip="Add VM">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setVmSearchExisting("");
                    setVmSearchTemplate("");
                    setExistingDropdownOpen(false);
                    setTemplateDropdownOpen(false);
                    setPopoverOpen(!popoverOpen);
                  }}
                >
                  <IconPlus size={16} />
                </button>
              </div>
              {popoverOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-base-100 border border-base-300 rounded-box shadow-lg z-50 p-3">
                  {/* Tabs */}
                  <div role="tablist" className="tabs tabs-bordered mb-3">
                    <button
                      role="tab"
                      className={`tab ${popoverTab === "add-existing" ? "tab-active" : ""}`}
                      onClick={() => setPopoverTab("add-existing")}
                    >
                      Add Existing VM
                    </button>
                    <button
                      role="tab"
                      className={`tab ${popoverTab === "create-new" ? "tab-active" : ""}`}
                      onClick={() => setPopoverTab("create-new")}
                    >
                      Create New VM
                    </button>
                  </div>

                  {popoverTab === "add-existing" && (
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input
                          className="input input-bordered input-sm w-full"
                          value={vmSearchExisting}
                          onChange={(e) => {
                            setVmSearchExisting(e.currentTarget.value);
                            setExistingDropdownOpen(true);
                          }}
                          onClick={() => setExistingDropdownOpen(true)}
                          placeholder="Search for a VM"
                        />
                        {existingDropdownOpen &&
                          filteredExisting.length > 0 && (
                            <ul className="absolute top-full left-0 w-full bg-base-100 border border-base-300 rounded-box shadow-lg z-50 max-h-48 overflow-auto">
                              {filteredExisting.map((vm) => (
                                <li
                                  key={vm.vmid}
                                  className="px-3 py-2 hover:bg-base-200 cursor-pointer text-sm"
                                  onClick={() => {
                                    setVmSearchExisting(
                                      `${vm.vmid} - ${vm.name}`,
                                    );
                                    setExistingDropdownOpen(false);
                                  }}
                                >
                                  {vm.vmid} - {vm.name}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                      <button
                        className="btn btn-outline btn-sm ml-auto"
                        onClick={() => {
                          setPopoverOpen(false);
                          if (
                            vmSearchExisting &&
                            !isNaN(
                              parseInt(vmSearchExisting.split(" - ")[0]),
                            )
                          ) {
                            addExistingVMToUser(
                              parseInt(vmSearchExisting.split(" - ")[0]),
                              user.id,
                            );
                          }
                        }}
                      >
                        <IconDeviceFloppy size={16} />
                      </button>
                    </div>
                  )}

                  {popoverTab === "create-new" && (
                    <div className="flex flex-col gap-2">
                      <div>
                        <label className="text-sm font-medium">Template</label>
                        <div className="relative">
                          <input
                            className="input input-bordered input-sm w-full mt-1"
                            value={vmSearchTemplate}
                            onChange={(e) => {
                              setVmSearchTemplate(e.currentTarget.value);
                              setTemplateDropdownOpen(true);
                            }}
                            onClick={() => setTemplateDropdownOpen(true)}
                            placeholder="Search for a template"
                          />
                          {templateDropdownOpen &&
                            filteredTemplates.length > 0 && (
                              <ul className="absolute top-full left-0 w-full bg-base-100 border border-base-300 rounded-box shadow-lg z-50 max-h-48 overflow-auto">
                                {filteredTemplates.map((vm) => (
                                  <li
                                    key={vm.vmid}
                                    className="px-3 py-2 hover:bg-base-200 cursor-pointer text-sm"
                                    onClick={() => {
                                      setVmSearchTemplate(
                                        `${vm.vmid} - ${vm.name}`,
                                      );
                                      setTemplateDropdownOpen(false);
                                    }}
                                  >
                                    {vm.vmid} - {vm.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                          className="input input-bordered input-sm w-full mt-1"
                          value={newVMName}
                          onChange={(e) => setNewVMName(e.currentTarget.value)}
                          placeholder="New VM Name"
                        />
                      </div>
                      <button
                        className="btn btn-outline btn-sm ml-auto"
                        onClick={() => {
                          setPopoverOpen(false);
                          if (
                            vmSearchTemplate &&
                            !isNaN(
                              parseInt(vmSearchTemplate.split(" - ")[0]),
                            ) &&
                            newVMName.trim().length > 0
                          ) {
                            cloneVMTemplateToUser(
                              parseInt(vmSearchTemplate.split(" - ")[0]),
                              newVMName.trim(),
                              user.id,
                            );
                          }
                        }}
                      >
                        <IconDeviceFloppy size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={close}>close</button>
        </form>
      </dialog>

      <button className="btn btn-outline btn-sm ml-2" onClick={open}>
        <IconPencil size={16} />
      </button>
    </>
  );
}
