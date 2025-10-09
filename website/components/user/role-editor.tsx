"use client";

import { Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Role, User } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { updateUserRoles } from "@/lib/users/db";

export default function RoleEditor({
  user,
}: {
  user: User & { UserRoles: { role: Role }[] };
}) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(
    user.UserRoles.map((ur) => ur.role)
  );
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onClose = async () => {
    if (
      JSON.stringify(selectedRoles.sort()) ===
      JSON.stringify(user.UserRoles.map((ur) => ur.role).sort())
    ) {
      return;
    }
    await updateUserRoles(user, selectedRoles);
  };

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={(open) => {
        setPopoverOpen(open);
        if (!open) {
          onClose();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Roles
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 bg-popover p-4 text-popover-foreground shadow-md border border-border rounded-md mt-2"
      >
        {Object.values(Role).map((role) => (
          <div key={role} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedRoles.includes(role)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedRoles((prev) => [...prev, role]);
                } else {
                  setSelectedRoles((prev) => prev.filter((r) => r !== role));
                }
              }}
            />
            <span>
              {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
