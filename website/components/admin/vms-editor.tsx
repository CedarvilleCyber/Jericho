"use client";

import { User, VM } from "@/app/generated/prisma/client";
import { ensureUserHasProxmoxId } from "@/lib/proxmox-api/user";
import { addExistingVMToUser, cloneVMTemplateToUser } from "@/lib/vms/add";
import { deleteVMFromProxmox, removeVM } from "@/lib/vms/remove";
import {
  ActionIcon,
  Box,
  Combobox,
  ComboboxDropdown,
  ComboboxEmpty,
  ComboboxOption,
  ComboboxOptions,
  ComboboxTarget,
  Group,
  Input,
  InputLabel,
  Modal,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  ScrollAreaAutosize,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tooltip,
  useCombobox
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconMinus,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

export default function VMsEditor({ user, proxmoxVMs }: { user: User & { vms: VM[] }; proxmoxVMs: Array<{ vmid: number; name: string; template: boolean }> }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [popoverOpened, { open: openPopover, close: closePopover }] =
    useDisclosure(false);
  const [newVMName, setNewVMName] = useState("");

  const comboboxExisting = useCombobox({
    onDropdownClose: () => comboboxExisting.resetSelectedOption(),
    onDropdownOpen: () => comboboxExisting.updateSelectedOptionIndex("active"),
  });

  const comboboxTemplate = useCombobox({
    onDropdownClose: () => comboboxTemplate.resetSelectedOption(),
    onDropdownOpen: () => comboboxTemplate.updateSelectedOptionIndex("active"),
  });

  const [vmSearchExisting, setVmSearchExisting] = useState("");
  const [vmSearchTemplate, setVmSearchTemplate] = useState("");

  const handleVMSelectExisting = (vmid: string) => {
    const vm = proxmoxVMs.find((v) => v.vmid.toString() === vmid);
    console.log("Selected VM:", vm);
    if (vm) {
      setVmSearchExisting(`${vm.vmid} - ${vm.name}`);
      comboboxExisting.closeDropdown();
    }
  };

  const handleVMSelectTemplate = (vmid: string) => {
    const vm = proxmoxVMs.find((v) => v.vmid.toString() === vmid);
    console.log("Selected Template:", vm);
    if (vm) {
      setVmSearchTemplate(`${vm.vmid} - ${vm.name}`);
      comboboxTemplate.closeDropdown();
    }
  };

  const getFilteredVMs = (searchValue: string, templatesOnly: boolean) => {
    const search = searchValue.toLowerCase().trim();
    const parts = search.length
      ? search.split(/\s+/).filter((p: string) => p.length > 2)
      : [];

    const filtered = proxmoxVMs.filter((vm) => {
      if (templatesOnly && !vm.template) return false;
      if (!search) return true; // no filter
      const name = vm.name.toLowerCase();
      const id = vm.vmid.toString();

      if (parts.length > 0) {
        return parts.some((p: string) => name.includes(p) || id.includes(p));
      }

      return name.includes(search) || id.includes(search);
    });

    filtered.sort((a, b) => a.vmid - b.vmid);

    return filtered.map((vm) => (
      <ComboboxOption
        key={vm.vmid}
        value={vm.vmid.toString()}
      >{`${vm.vmid} - ${vm.name}`}</ComboboxOption>
    ));
  };

  const valuesExisting = getFilteredVMs(vmSearchExisting, false);
  const valuesTemplate = getFilteredVMs(vmSearchTemplate, true);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={`Edit VMs for ${user.name}`}
      >
        <Box className="flex flex-col">
          <hr className="mb-3" />
          {user.vms.length === 0 ? (
            <p>This user has no VMs assigned.</p>
          ) : (
            <Table>
              <TableThead>
                <TableTr>
                  <TableTh>VM ID</TableTh>
                  <TableTh>VM Name</TableTh>
                  <TableTh>Actions</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {user.vms.map((vm) => (
                  <TableTr key={vm.id}>
                    <TableTd>{vm.proxmoxId}</TableTd>
                    <TableTd>
                      {
                        proxmoxVMs.find(
                          (pvm) =>
                            pvm.vmid.toString() === vm.proxmoxId.toString(),
                        )?.name
                      }
                    </TableTd>
                    <TableTd>
                      <Group>
                        <Tooltip label="Remove VM" withArrow>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            size="xs"
                            onClick={() => {
                              removeVM(vm.proxmoxId, user.id);
                            }}
                          >
                            <IconMinus size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete VM" withArrow>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            size="xs"
                            onClick={() => {
                              deleteVMFromProxmox(vm.proxmoxId);
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          )}
          <Popover opened={popoverOpened} onClose={closePopover} withArrow>
            <PopoverTarget>
              <Tooltip label="Add VM" withArrow>
                <ActionIcon
                  variant="outline"
                  size="sm"
                  className="mt-2 ml-auto"
                  onClick={() => {
                    comboboxExisting.closeDropdown();
                    comboboxTemplate.closeDropdown();
                    comboboxExisting.resetSelectedOption();
                    comboboxTemplate.resetSelectedOption();
                    openPopover();
                  }}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
            </PopoverTarget>
            <PopoverDropdown w={300}>
              <Box className="flex flex-col">
                <Tabs defaultValue="add-existing">
                  <TabsList>
                    <TabsTab value="add-existing">Add Existing VM</TabsTab>
                    <TabsTab value="create-new">Create New VM</TabsTab>
                  </TabsList>

                  <TabsPanel value="add-existing" pt="xs">
                    <Combobox
                      store={comboboxExisting}
                      onOptionSubmit={handleVMSelectExisting}
                    >
                      <ComboboxTarget>
                        <Input
                          value={vmSearchExisting}
                          onChange={(event) =>
                            setVmSearchExisting(event.currentTarget.value)
                          }
                          onClick={() => comboboxExisting.openDropdown()}
                          placeholder="Search for a VM"
                        />
                      </ComboboxTarget>

                      <ComboboxDropdown>
                        <ComboboxOptions>
                          <ScrollAreaAutosize mah={300}>
                            {valuesExisting.length > 0 ? (
                              valuesExisting
                            ) : (
                              <ComboboxEmpty>No VMs found</ComboboxEmpty>
                            )}
                          </ScrollAreaAutosize>
                        </ComboboxOptions>
                      </ComboboxDropdown>
                    </Combobox>
                    <ActionIcon
                      className="mt-2 ml-auto"
                      variant="outline"
                      size="md"
                      onClick={() => {
                        closePopover();
                        if (
                          vmSearchExisting &&
                          !isNaN(parseInt(vmSearchExisting.split(" - ")[0]))
                        ) {
                          addExistingVMToUser(
                            parseInt(vmSearchExisting.split(" - ")[0]),
                            user.id,
                          );
                        }
                      }}
                    >
                      <IconDeviceFloppy size={16} />
                    </ActionIcon>
                  </TabsPanel>

                  <TabsPanel value="create-new" pt="xs">
                    <Combobox
                      store={comboboxTemplate}
                      onOptionSubmit={handleVMSelectTemplate}
                    >
                      <ComboboxTarget>
                        <Group justify="space-between" className="mb-2">
                          <InputLabel>Template</InputLabel>
                          <Input
                            value={vmSearchTemplate}
                            onChange={(event) =>
                              setVmSearchTemplate(event.currentTarget.value)
                            }
                            onClick={() => comboboxTemplate.openDropdown()}
                            placeholder="Search for a template"
                            w={175}
                          />
                        </Group>
                      </ComboboxTarget>
                      <Group justify="space-between">
                        <InputLabel>Name</InputLabel>
                        <Input
                          value={newVMName}
                          onChange={(event) =>
                            setNewVMName(event.currentTarget.value)
                          }
                          placeholder="New VM Name"
                        />
                      </Group>

                      <ComboboxDropdown>
                        <ComboboxOptions>
                          <ScrollAreaAutosize mah={300}>
                            {valuesTemplate.length > 0 ? (
                              valuesTemplate
                            ) : (
                              <ComboboxEmpty>No templates found</ComboboxEmpty>
                            )}
                          </ScrollAreaAutosize>
                        </ComboboxOptions>
                      </ComboboxDropdown>
                    </Combobox>
                    <ActionIcon
                      className="mt-2 ml-auto"
                      variant="outline"
                      size="md"
                      onClick={() => {
                        closePopover();
                        if (
                          vmSearchTemplate &&
                          !isNaN(parseInt(vmSearchTemplate.split(" - ")[0])) &&
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
                    </ActionIcon>
                  </TabsPanel>
                </Tabs>
              </Box>
            </PopoverDropdown>
          </Popover>
        </Box>
      </Modal>

      <ActionIcon
        className="ml-auto"
        variant="outline"
        size="sm"
        onClick={() => {
          open();
          comboboxExisting.closeDropdown();
          comboboxTemplate.closeDropdown();
          ensureUserHasProxmoxId(user.id);
        }}
      >
        <IconPencil size={16} />
      </ActionIcon>
    </>
  );
}
