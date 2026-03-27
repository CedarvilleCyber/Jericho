"use client";

import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

export default function EditUserButton({ userId }: { userId: string }) {
  return (
    <Link href={`/admin/users/${userId}`} className="btn btn-primary btn-sm">
      Edit <IconExternalLink className="ml-1" size={14} />
    </Link>
  );
}
