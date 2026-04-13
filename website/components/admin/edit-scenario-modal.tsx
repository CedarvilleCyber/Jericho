"use client";

import {
  addSection,
  deleteQuestion,
  deleteSection,
  updateScenario,
  updateSection,
} from "@/app/admin/scenarios/actions";
import { Section } from "@/app/generated/prisma/client";
import { AddQuestionModal, EditQuestionModal } from "@/components/admin/question-modal";
import { QuestionWithSection, ScenarioWithQuestions, QuestionType } from "@/components/admin/scenario-types";
import { TopologyEditor } from "@/components/admin/topology-editor";
import { EMPTY_TOPOLOGY, parseTopology, Topology } from "@/lib/scenarios/topology-types";
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useSaveGuard } from "./save-guard";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  TEXT: "Short Answer",
  LONG_TEXT: "Long Answer",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  NUMERIC: "Numeric",
  ORDERING: "Ordering",
};

function SectionsList({
  sections,
  scenarioId,
}: {
  sections: Section[];
  scenarioId: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [addingTitle, setAddingTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingSaving, setAddingSaving] = useState(false);

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  async function handleSaveEdit(section: Section) {
    setSavingId(section.id);
    await updateSection(section.id, { title: editTitle, order: section.order });
    setSavingId(null);
    setEditingId(null);
  }

  async function handleMoveUp(section: Section) {
    const idx = sorted.findIndex((s) => s.id === section.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    await Promise.all([
      updateSection(section.id, { title: section.title, order: prev.order }),
      updateSection(prev.id, { title: prev.title, order: section.order }),
    ]);
  }

  async function handleMoveDown(section: Section) {
    const idx = sorted.findIndex((s) => s.id === section.id);
    if (idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    await Promise.all([
      updateSection(section.id, { title: section.title, order: next.order }),
      updateSection(next.id, { title: next.title, order: section.order }),
    ]);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteSection(id);
    setDeletingId(null);
  }

  async function handleAdd() {
    if (!addingTitle.trim()) return;
    setAddingSaving(true);
    const maxOrder = sorted.length > 0 ? Math.max(...sorted.map((s) => s.order)) + 1 : 0;
    await addSection(scenarioId, { title: addingTitle.trim(), order: maxOrder });
    setAddingSaving(false);
    setAddingTitle("");
    setShowAdd(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label-text font-semibold">Sections</span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowAdd(true)}>
          <IconPlus size={16} /> Add
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.length === 0 && (
          <p className="text-sm text-base-content/50">No sections yet.</p>
        )}
        {sorted.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
            {editingId === s.id ? (
              <input
                className="input input-bordered input-sm flex-1"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(s)}
                autoFocus
              />
            ) : (
              <span className="flex-1 text-sm font-medium truncate">{s.title}</span>
            )}

            {editingId === s.id ? (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square text-success"
                  onClick={() => handleSaveEdit(s)}
                  disabled={savingId === s.id}
                >
                  {savingId === s.id ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <IconCheck size={14} />
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => setEditingId(null)}
                >
                  <IconX size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => { setEditingId(s.id); setEditTitle(s.title); }}
                >
                  <IconPencil size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => handleMoveUp(s)}
                  disabled={idx === 0}
                >
                  <IconArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={() => handleMoveDown(s)}
                  disabled={idx === sorted.length - 1}
                >
                  <IconArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square text-error"
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                >
                  {deletingId === s.id ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <IconTrash size={14} />
                  )}
                </button>
              </>
            )}
          </div>
        ))}

        {showAdd && (
          <div className="flex items-center gap-2">
            <input
              className="input input-bordered input-sm flex-1"
              value={addingTitle}
              onChange={(e) => setAddingTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Section title"
              autoFocus
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAdd}
              disabled={addingSaving || !addingTitle.trim()}
            >
              {addingSaving ? <span className="loading loading-spinner loading-xs" /> : "Add"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setShowAdd(false); setAddingTitle(""); }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionsList({
  questions,
  sections,
  scenarioId,
}: {
  questions: QuestionWithSection[];
  sections: Section[];
  scenarioId: string;
}) {
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithSection | null>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const nextOrder = sorted.length > 0 ? Math.max(...sorted.map((q) => q.order)) + 1 : 0;

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteQuestion(id);
    setDeletingId(null);
  }

  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s.title]));

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="label-text font-semibold">Questions</span>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setAddingQuestion(true)}
          >
            <IconPlus size={16} /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {sorted.length === 0 && (
            <p className="text-sm text-base-content/50">No questions yet.</p>
          )}
          {sorted.map((q) => (
            <div key={q.id} className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{q.title}</p>
                <p className="text-xs text-base-content/60 flex items-center gap-2">
                  <span>{q.pointValue} pts</span>
                  <span className="badge badge-ghost badge-xs">{QUESTION_TYPE_LABELS[q.type]}</span>
                  {q.sectionId && sectionMap[q.sectionId] && (
                    <span className="badge badge-outline badge-xs">{sectionMap[q.sectionId]}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setEditingQuestion(q)}
              >
                <IconPencil size={16} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-square text-error"
                onClick={() => handleDelete(q.id)}
                disabled={deletingId === q.id}
              >
                {deletingId === q.id ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <IconTrash size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          sections={sections}
          onClose={() => setEditingQuestion(null)}
        />
      )}
      {addingQuestion && (
        <AddQuestionModal
          scenarioId={scenarioId}
          sections={sections}
          nextOrder={nextOrder}
          onClose={() => setAddingQuestion(false)}
        />
      )}
    </>
  );
}

export function EditScenarioModal({
  scenario,
  onClose,
}: {
  scenario: ScenarioWithQuestions;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: scenario.name,
    description: scenario.description,
    slug: scenario.slug,
    topologyURL: scenario.topologyURL ?? "",
    teaserText: scenario.teaserText ?? "",
    teaserImageURL: scenario.teaserImageURL ?? "",
    youtubeChannelId: scenario.youtubeChannelId ?? "",
    learningObjectives: scenario.learningObjectives ?? "",
  });
  const [topology, setTopology] = useState<Topology>(
    parseTopology(scenario.topology),
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateScenario(scenario.id, {
      ...form,
      topology: topology.nodes.length > 0 ? topology : null,
    });
    setSaving(false);
    onClose();
  }

  const dialogRef = useRef<HTMLDialogElement>(null);
  const { handleCancelAttempt, handleDialogCancel, confirmDialog } = useSaveGuard(onClose);
  useEffect(() => { dialogRef.current?.showModal(); }, []);

  return (
    <>
    <dialog ref={dialogRef} className="modal" onCancel={handleDialogCancel}>
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain">
        <h3 className="font-bold text-lg mb-4">Edit Scenario</h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="form-control">
              <div className="label"><span className="label-text">Name</span></div>
              <input className="input input-bordered w-full" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="form-control">
              <div className="label"><span className="label-text">Slug</span></div>
              <input className="input input-bordered w-full" value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
          </div>
          <label className="form-control">
            <div className="label"><span className="label-text">Description</span></div>
            <textarea className="textarea textarea-bordered w-full" rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">Teaser Text</span></div>
            <textarea className="textarea textarea-bordered w-full" rows={2}
              value={form.teaserText} placeholder="Optional"
              onChange={(e) => setForm({ ...form, teaserText: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="form-control">
              <div className="label"><span className="label-text">Teaser Image URL</span></div>
              <input className="input input-bordered w-full" value={form.teaserImageURL}
                placeholder="Optional"
                onChange={(e) => setForm({ ...form, teaserImageURL: e.target.value })} />
            </label>
            <label className="form-control">
              <div className="label"><span className="label-text">Topology URL</span></div>
              <input className="input input-bordered w-full" value={form.topologyURL}
                placeholder="Optional"
                onChange={(e) => setForm({ ...form, topologyURL: e.target.value })} />
            </label>
          </div>
          <label className="form-control">
            <div className="label"><span className="label-text">YouTube Channel ID</span></div>
            <input className="input input-bordered w-full" value={form.youtubeChannelId}
              placeholder="Optional"
              onChange={(e) => setForm({ ...form, youtubeChannelId: e.target.value })} />
          </label>
          <label className="form-control">
            <div className="label"><span className="label-text">Learning Objectives</span></div>
            <textarea className="textarea textarea-bordered w-full" rows={3}
              value={form.learningObjectives} placeholder="Optional"
              onChange={(e) => setForm({ ...form, learningObjectives: e.target.value })} />
          </label>
          <TopologyEditor value={topology} onChange={setTopology} />
          <SectionsList sections={scenario.sections} scenarioId={scenario.id} />
          <QuestionsList
            questions={scenario.questions}
            sections={scenario.sections}
            scenarioId={scenario.id}
          />
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleCancelAttempt}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm" /> : "Save"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleCancelAttempt} />
    </dialog>
    {confirmDialog}
    </>
  );
}
