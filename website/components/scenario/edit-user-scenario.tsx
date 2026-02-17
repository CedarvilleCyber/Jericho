"use client";

import { Button } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import Link from "next/link";

export default function EditUserScenario({ userScenarioId }: { userScenarioId: string }) {
  return (
    <Button component={Link} href={`/admin/user-scenario/${userScenarioId}`}>
      <IconPencil size={16} className="mr-1" />
      Edit
    </Button>
  );
}