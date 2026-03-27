"use client";

import { IconPencil } from "@tabler/icons-react";
import Link from "next/link";

export default function EditUserScenario({
  userScenarioId,
}: {
  userScenarioId: string;
}) {
  return (
    <Link
      href={`/admin/user-scenario/${userScenarioId}`}
      className="btn btn-primary btn-sm"
    >
      <IconPencil size={16} className="mr-1" />
      Edit
    </Link>
  );
}
