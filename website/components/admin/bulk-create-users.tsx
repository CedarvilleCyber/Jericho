"use client";

import { bulkCreateUsers, type CreateUserResult } from "@/lib/users/create";
import {
  IconCheck,
  IconClipboard,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  autoPassword: boolean;
  password: string;
};

type ResultWithPassword = CreateUserResult & { generatedPassword?: string };

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(14);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("");
}

function newRow(): UserRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    email: "",
    autoPassword: true,
    password: "",
  };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-xs btn-ghost"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <IconCheck size={14} /> : <IconClipboard size={14} />}
    </button>
  );
}

export default function BulkCreateUsers() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<UserRow[]>([newRow()]);
  const [results, setResults] = useState<ResultWithPassword[] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateRow(id: string, patch: Partial<UserRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function open() {
    setRows([newRow()]);
    setResults(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    if (results?.some((r) => r.success)) {
      router.refresh();
    }
  }

  async function handleSubmit() {
    const prepared = rows.map((r) => ({
      ...r,
      password: r.autoPassword ? generatePassword() : r.password,
    }));

    setLoading(true);
    const res = await bulkCreateUsers(
      prepared.map((r) => ({ name: r.name, email: r.email, password: r.password })),
    );

    setResults(
      res.map((r, i) => ({
        ...r,
        generatedPassword: prepared[i].autoPassword ? prepared[i].password : undefined,
      })),
    );
    setLoading(false);
  }

  const canSubmit = rows.every(
    (r) => r.name.trim() && r.email.trim() && (r.autoPassword || r.password),
  );

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <>
      <button className="btn btn-primary" onClick={open}>
        <IconPlus size={16} />
        Create Users
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-3xl w-full">
          <h3 className="font-bold text-lg mb-4">Create Users</h3>

          {results ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                {successCount > 0 && (
                  <div className="badge badge-success gap-1">
                    <IconCheck size={12} />
                    {successCount} created
                  </div>
                )}
                {failCount > 0 && (
                  <div className="badge badge-error gap-1">
                    <IconX size={12} />
                    {failCount} failed
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i}>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td>
                          {r.generatedPassword ? (
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-base-200 px-1.5 py-0.5 rounded">
                                {r.generatedPassword}
                              </code>
                              <CopyButton text={r.generatedPassword} />
                            </div>
                          ) : (
                            <span className="text-base-content/40 text-xs">manual</span>
                          )}
                        </td>
                        <td>
                          {r.success ? (
                            <span className="badge badge-success badge-sm">
                              <IconCheck size={12} />
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="badge badge-error badge-sm">
                                <IconX size={12} />
                                Failed
                              </span>
                              {r.error && (
                                <span className="text-xs text-error/80">{r.error}</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-action">
                <button className="btn btn-primary" onClick={close}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <input
                            className="input input-sm input-bordered w-full"
                            placeholder="Full name"
                            value={row.name}
                            onChange={(e) =>
                              updateRow(row.id, { name: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="input input-sm input-bordered w-full"
                            placeholder="email@example.com"
                            type="email"
                            value={row.email}
                            onChange={(e) =>
                              updateRow(row.id, { email: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          {row.autoPassword ? (
                            <button
                              className="btn btn-sm btn-ghost gap-1 text-base-content/60"
                              onClick={() =>
                                updateRow(row.id, { autoPassword: false })
                              }
                            >
                              <IconRefresh size={14} />
                              Auto-generate
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                className="input input-sm input-bordered w-full"
                                placeholder="Password"
                                type="text"
                                value={row.password}
                                onChange={(e) =>
                                  updateRow(row.id, { password: e.target.value })
                                }
                              />
                              <button
                                className="btn btn-sm btn-ghost btn-square shrink-0"
                                title="Switch to auto-generate"
                                onClick={() =>
                                  updateRow(row.id, {
                                    autoPassword: true,
                                    password: "",
                                  })
                                }
                              >
                                <IconRefresh size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-ghost btn-square text-error"
                            disabled={rows.length === 1}
                            onClick={() =>
                              setRows((prev) =>
                                prev.filter((r) => r.id !== row.id),
                              )
                            }
                          >
                            <IconTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="btn btn-sm btn-ghost self-start gap-1"
                onClick={() => setRows((prev) => [...prev, newRow()])}
              >
                <IconPlus size={14} />
                Add row
              </button>

              <div className="modal-action">
                <button
                  className="btn"
                  onClick={close}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                >
                  {loading && <span className="loading loading-spinner loading-sm" />}
                  Create {rows.length} user{rows.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={close}>close</button>
        </form>
      </dialog>
    </>
  );
}
