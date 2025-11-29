"use server";

import { Role, User } from "@prisma/client";
import { prisma } from "@/prisma";

export async function updateUserRoles(user: User, roles: Array<Role>) {
  await prisma?.user.update({
    where: { id: user.id },
    data: {
      UserRoles: {
        deleteMany: {}, // Remove existing roles
        create: roles.map((role) => ({ role })), // Add new roles
      },
    },
  });
}
