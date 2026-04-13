import { ScenarioWithQuestions } from "@/components/admin/scenario-types";
import { IconPencil } from "@tabler/icons-react";
import Link from "next/link";

export function ScenarioCard({ scenario }: { scenario: ScenarioWithQuestions }) {
  return (
    <div className="card card-border bg-base-100 shadow-md mb-4">
      <div className="card-body p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="card-title text-lg">{scenario.name}</h3>
            <p className="text-xs text-base-content/50 font-mono">/{scenario.slug}</p>
          </div>
          <Link
            href={`/admin/scenarios/${scenario.id}/edit`}
            className="btn btn-sm btn-ghost shrink-0"
          >
            <IconPencil size={16} /> Edit
          </Link>
        </div>

        <p className="text-sm text-base-content/80 mt-1">{scenario.description}</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
          {scenario.teaserText && (
            <div>
              <span className="font-semibold">Teaser: </span>
              <span className="text-base-content/70">{scenario.teaserText}</span>
            </div>
          )}
          {scenario.teaserImageURL && (
            <div className="truncate">
              <span className="font-semibold">Image: </span>
              <span className="text-base-content/70 font-mono text-xs">{scenario.teaserImageURL}</span>
            </div>
          )}
          {scenario.topologyURL && (
            <div className="truncate">
              <span className="font-semibold">Topology: </span>
              <span className="text-base-content/70 font-mono text-xs">{scenario.topologyURL}</span>
            </div>
          )}
          {scenario.youtubeChannelId && (
            <div>
              <span className="font-semibold">YouTube: </span>
              <span className="text-base-content/70">{scenario.youtubeChannelId}</span>
            </div>
          )}
        </div>

        {scenario.learningObjectives && (
          <div className="mt-2 text-sm">
            <span className="font-semibold">Learning Objectives: </span>
            <span className="text-base-content/70">{scenario.learningObjectives}</span>
          </div>
        )}

        {scenario.questions.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-semibold mb-1">
              Questions ({scenario.questions.length})
            </p>
            <div className="flex flex-col gap-1">
              {scenario.questions.map((q) => (
                <div key={q.id}
                  className="text-sm bg-base-200 rounded px-3 py-1.5 flex justify-between">
                  <span>{q.title}</span>
                  <span className="text-base-content/50 text-xs">{q.pointValue} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
