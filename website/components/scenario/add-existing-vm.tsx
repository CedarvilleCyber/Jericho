"use client";

import { VM } from "@/app/generated/prisma/browser";
import { authClient } from "@/lib/auth-client";
import { addVMToScenario } from "@/lib/scenarios/add";
import { Button, Card, Group, List, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function AddExistingVMToScenarioPage({
  scenarioId,
  vms,
}: {
  scenarioId: string;
  vms?: VM[];
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: session } = authClient.useSession();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        title="Add Existing VM to Scenario"
      >
        {vms && vms.length > 0 ? (
          <Stack>
            {vms.map((vm) => (
              <Card key={vm.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <Text>
                    VM ID: {vm.proxmoxId} - {vm.name}
                  </Text>
                  <Button variant="outline" size="xs" onClick={async () => {
                    const formData = new FormData();
                    formData.append("vmId", vm.id);
                    formData.append("scenarioId", scenarioId);
                    formData.append("userId", session.user.id);
                    await addVMToScenario(formData);
                  }}>
                    Add to Scenario
                  </Button>
                </Group>
              </Card>
            ))}

            <Group justify="end">
              <Button component={Link} href="/me/request/vm">
                Request a new VM
                <IconExternalLink className="ml-2" />
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text>No VMs available to add.</Text>
        )}
      </Modal>
      <Button onClick={open}>Add an existing VM</Button>
    </>
  );
}
