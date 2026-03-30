"use client";

import { EditScenarioModal } from "@/components/admin/edit-scenario-modal";
import { ScenarioCard } from "@/components/admin/scenario-card";
import { ScenarioWithQuestions } from "@/components/admin/scenario-types";
import { useState } from "react";

export default function ScenarioEditor({
  scenario,
}: {
  scenario: ScenarioWithQuestions;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <ScenarioCard scenario={scenario} onEdit={() => setEditing(true)} />
      {editing && (
        <EditScenarioModal scenario={scenario} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
