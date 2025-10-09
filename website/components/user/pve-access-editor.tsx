"use client";

import { createPVEUser, deletePVEUser } from "@/lib/users/pve";
import { createId } from "@paralleldrive/cuid2";
import { User } from "@prisma/client";
import { Edit } from "lucide-react";
import { Proxmox } from "proxmox-api";
import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function PVEAccessEditor({
  user,
  permissions,
}: {
  user: User;
  permissions:
    | { userId: number; permissions: Proxmox.accessUsersReadUser }
    | undefined;
}) {
  const [isChecked, setIsChecked] = useState(user.proxmoxId !== null);

  const onChange = async (checked: boolean) => {
    setIsChecked(checked);
    if (checked) {
      const newPVEId = user.proxmoxId || createId();
      await createPVEUser(newPVEId, [], user.id);
    } else {
      await deletePVEUser(user.proxmoxId!);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox checked={isChecked} onCheckedChange={onChange} />
      <Popover>
        <PopoverTrigger asChild>
          <Button disabled={!isChecked} size="sm">
            <Edit />
            Permissions
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          {permissions ? (
            <div className="max-h-64 overflow-y-auto">
              {JSON.stringify(permissions.permissions, null, 2)}
            </div>
          ) : (
            <div>No Proxmox user linked.</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
