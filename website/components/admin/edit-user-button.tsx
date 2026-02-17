"use client";

import { Button } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

export default function EditUserButton({ userId }: { userId: string }) {
  return (
    <Button component={Link} href={`/admin/users/${userId}`}>
      Edit <IconExternalLink className="ml-1" />
    </Button>
  );
}
