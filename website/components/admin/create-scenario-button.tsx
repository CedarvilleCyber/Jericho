"use client";

import { createScenario } from "@/app/admin/scenarios/actions";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

export default function CreateScenarioButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    slug: "",
    topologyURL: "",
    teaserText: "",
    teaserImageURL: "",
    youtubeChannelId: "",
    learningObjectives: "",
  });

  async function handleCreate() {
    setSaving(true);
    await createScenario({ ...form, topology: null });
    setSaving(false);
    setOpen(false);
    setForm({
      name: "",
      description: "",
      slug: "",
      topologyURL: "",
      teaserText: "",
      teaserImageURL: "",
      youtubeChannelId: "",
      learningObjectives: "",
    });
  }

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <IconPlus size={16} /> New Scenario
      </button>

      {open && (
        <div className="modal modal-open">
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
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, teaserText: e.target.value })
                  }
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
                    onChange={(e) =>
                      setForm({ ...form, teaserImageURL: e.target.value })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, topologyURL: e.target.value })
                    }
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
                  onChange={(e) =>
                    setForm({ ...form, youtubeChannelId: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, learningObjectives: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
