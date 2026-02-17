"use client";

import { setUserScenarioVM } from "@/lib/scenarios/admin";
import { VM } from "@/app/generated/prisma/browser";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function UserScenarioVMEditor({
  userScenarioId,
  currentVM,
  availableVMs,
}: {
  userScenarioId: string;
  currentVM: VM | null;
  availableVMs: VM[];
}) {
  const [opened, { open, close }] = useDisclosure(false);

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
      <Modal opened={opened} onClose={close} size="xl" title="Assign VM to Scenario">
        {availableVMs.length > 0 ? (
          <Stack>
            {availableVMs.map((vm) => (
              <Card key={vm.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text>
                    VM ID: {vm.proxmoxId} - {vm.name}
                  </Text>
                  <Button
                    variant={currentVM?.id === vm.id ? "filled" : "outline"}
                    size="xs"
                    onClick={() => assign(vm.id)}
                  >
                    {currentVM?.id === vm.id ? "Assigned" : "Assign"}
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Text>No VMs available for this user.</Text>
        )}
      </Modal>

      <Stack gap="sm">
        <Text fw={500}>Assigned VM</Text>
        {currentVM ? (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <Text>
                  VM ID: {currentVM.proxmoxId} - {currentVM.name}
                </Text>
                <Badge color="green">Assigned</Badge>
              </Group>
              <Group gap="xs">
                <Button variant="outline" color="red" size="xs" onClick={unassign}>
                  Remove
                </Button>
              </Group>
            </Group>
          </Card>
        ) : (
          <Text c="dimmed">No VM assigned.</Text>
        )}
        <Group>
          <Button variant="outline" onClick={open}>
            {currentVM ? "Change VM" : "Assign VM"}
          </Button>
        </Group>
      </Stack>
    </>
  );
}
