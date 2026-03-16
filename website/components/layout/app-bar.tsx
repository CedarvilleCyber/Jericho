"use client";

import {
  IconDeviceDesktop,
  IconLogout,
  IconSettings,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import ColorSchemeToggle from "../color-scheme-toggle";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getUserRoles } from "@/lib/user/roles";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/logo256.png";

export default function AppBar() {
  const { data } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (data?.user?.id) {
      getUserRoles(data.user.id).then((roles) => {
        setIsAdmin(roles.includes("ADMIN"));
      });
    }
  }, [data?.user?.id]);

  return (
    <header className="h-14 border-b sticky top-0 z-50 bg-base-100 border-base-300">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex gap-3">
            <Image src={logo} alt="Jericho Logo" width={32} height={32} />
            <h1 className="text-2xl font-semibold">Jericho</h1>
          </Link>
          <div className="flex items-center gap-2">
            <ColorSchemeToggle />
            {data?.session ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  {data.user.image ? (
                    <div className="w-8 rounded-full">
                      <img src={data.user.image} alt={data.user.name ?? "User"} />
                    </div>
                  ) : (
                    <div className="w-8 rounded-full bg-base-300 flex items-center justify-center">
                      <IconUser size={18} />
                    </div>
                  )}
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box shadow z-50 mt-3 w-52 p-2"
                >
                  <li className="menu-title">
                    {data.user.name ?? data.user.email}
                  </li>
                  <li>
                    <Link href="/vms">
                      <IconDeviceDesktop size={16} />
                      My VMs
                    </Link>
                  </li>
                  <li>
                    <Link href="/me">
                      <IconSettings size={16} />
                      Account
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link href="/admin">
                        <IconShieldLock size={16} />
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => authClient.signOut()}
                      className="text-error"
                    >
                      <IconLogout size={16} />
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/sign-in">
                <button className="btn btn-outline btn-sm">Sign In</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
