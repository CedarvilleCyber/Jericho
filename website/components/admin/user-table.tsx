"use client";

import EditUserButton from "@/components/admin/edit-user-button";
import { useState } from "react";

export type UserTableRow = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export default function UserTable({ users }: { users: UserTableRow[] }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.roles.some((role) => role.toLowerCase().includes(q)),
  );

  return (
    <div className="border border-base-300 shadow-lg rounded-md p-4 mb-4">
      <input
        type="search"
        className="input input-bordered w-full mb-4"
        placeholder="Search by name, email, or role"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="overflow-auto max-h-[50vh]">
        <table className="table min-w-175">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>User Management</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.roles.join(", ")}</td>
                <td>
                  <EditUserButton userId={user.id} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-base-content/60">
                  No users match &quot;{query}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
