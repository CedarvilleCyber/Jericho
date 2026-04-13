"use client";

import { createScenario } from "@/app/admin/scenarios/actions";
import { IconPlus } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useSaveGuard } from "./save-guard";

const EMPTY_FORM = {
  name: "",
  description: "",
  slug: "",
  topologyURL: "",
  teaserText: "",
  teaserImageURL: "",
  youtubeChannelId: "",
  learningObjectives: "",
};

export default function CreateScenarioButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { handleCancelAttempt, handleDialogCancel, confirmDialog } = useSaveGuard(
    () => dialogRef.current?.close(),
    { title: "Discard new scenario?" },
  );

  function open() {
    setForm(EMPTY_FORM);
    dialogRef.current?.showModal();
  }

  async function handleCreate() {
    setSaving(true);
    await createScenario({ ...form, topology: null });
    setSaving(false);
    dialogRef.current?.close();
  }

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={open}>
        <IconPlus size={16} /> New Scenario
      </button>

      <dialog ref={dialogRef} className="modal" onCancel={handleDialogCancel}>
        <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">Create Scenario</h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Name</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Slug</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </label>
            </div>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Teaser Text</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                value={form.teaserText}
                placeholder="Optional"
                onChange={(e) => setForm({ ...form, teaserText: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Teaser Image URL</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={form.teaserImageURL}
                  placeholder="Optional"
                  onChange={(e) => setForm({ ...form, teaserImageURL: e.target.value })}
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Topology URL</span>
                </div>
                <input
                  className="input input-bordered w-full"
                  value={form.topologyURL}
                  placeholder="Optional"
                  onChange={(e) => setForm({ ...form, topologyURL: e.target.value })}
                />
              </label>
            </div>
            <label className="form-control">
              <div className="label">
                <span className="label-text">YouTube Channel ID</span>
              </div>
              <input
                className="input input-bordered w-full"
                value={form.youtubeChannelId}
                placeholder="Optional"
                onChange={(e) => setForm({ ...form, youtubeChannelId: e.target.value })}
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Learning Objectives</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                value={form.learningObjectives}
                placeholder="Optional"
                onChange={(e) => setForm({ ...form, learningObjectives: e.target.value })}
              />
            </label>
          </div>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={handleCancelAttempt}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : "Create"}
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={handleCancelAttempt} />
      </dialog>
      {confirmDialog}
    </>
  );
}
