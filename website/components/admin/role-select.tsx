"use client";

import { Role } from "@/app/generated/prisma/browser";
import { updateUserRoles } from "@/lib/users/roles";
import { useState } from "react";

export default function RoleSelect({
  userId,
  initialRoles,
}: {
  userId: string;
  initialRoles: Role[];
}) {
  const [selected, setSelected] = useState<Set<Role>>(new Set(initialRoles));
  const [saving, setSaving] = useState(false);

  const toggle = async (role: Role) => {
    const next = new Set(selected);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    setSelected(next);
    setSaving(true);
    await updateUserRoles(userId, Array.from(next));
    setSaving(false);
  };

  return (
    <div className="dropdown w-full max-w-xs">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost bg-base-100 w-full justify-start font-normal border border-base-300"
      >
        {selected.size === 0 ? (
          <span className="text-base-content/50">No roles assigned</span>
        ) : (
          <div className="flex gap-1 flex-wrap">
            {Array.from(selected).map((r) => (
              <span key={r} className="badge badge-primary badge-sm">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box border border-base-300 shadow-md z-10 w-full p-2"
      >
        {Object.values(Role).map((role) => (
          <li key={role}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={selected.has(role)}
                onChange={() => toggle(role)}
                disabled={saving}
              />
              {role}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
