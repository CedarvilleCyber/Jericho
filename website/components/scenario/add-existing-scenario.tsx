"use client";

import { Scenario } from "@/app/generated/prisma/client";
import { addExistingScenarioToUser } from "@/lib/scenarios/add";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceDesktop,
  IconDeviceFloppy,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

export default function AddExistingScenarioPage({
  userId,
  scenarios,
}: {
  userId: string;
  scenarios: (Scenario & { joined: boolean })[];
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

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
      <Modal
        opened={opened}
        onClose={close}
        size={"lg"}
        title="Add Existing Scenario"
      >
        <Stack>
          <SimpleGrid cols={2} spacing="md">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <Group justify="space-between">
                  <Stack>
                    <Group>
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
                      {scenario.name}
                    </Group>
                    <Text size="sm" c="dimmed">
                      {scenario.teaserText}
                    </Text>
                  </Stack>
                  <ActionIcon
                    variant={
                      selectedScenarios.includes(scenario.id)
                        ? "filled"
                        : "outline"
                    }
                    onClick={() => {
                      if (selectedScenarios.includes(scenario.id)) {
                        setSelectedScenarios(
                          selectedScenarios.filter((id) => id !== scenario.id),
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
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          <Group justify="end" onClick={addSelectedScenarios}>
            <Button>
              <IconDeviceFloppy size={16} className="mr-1" />
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Button onClick={open}>
        <IconPlus size={16} className="mr-1" />
        Add Existing Scenario
      </Button>
    </>
  );
}
