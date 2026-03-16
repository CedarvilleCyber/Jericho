"use client";

import { deleteUser } from "@/lib/users/delete";
import { IconTrash } from "@tabler/icons-react";
import { useRef } from "react";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div className="mt-6 rounded-lg border-2 border-error/60 overflow-hidden">
        <div className="px-4 py-2 pb-0">
          <span className="text-error font-bold text-sm uppercase tracking-widest">
            Danger Zone
          </span>
        </div>
        <div className="p-4 pt-2 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-base-content">Delete this user</p>
            <p className="text-sm text-base-content/60">
              Permanently remove this user and all associated data. This cannot
              be undone.
            </p>
          </div>
          <button
            className="btn btn-error btn-outline shrink-0"
            onClick={() => dialogRef.current?.showModal()}
          >
            <IconTrash size={16} />
            Delete User
          </button>
        </div>
      </div>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete User</h3>
          <p className="py-4">
            Are you sure you want to permanently delete this user? This action
            cannot be undone.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() => deleteUser(userId)}
            >
              <IconTrash size={16} />
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
