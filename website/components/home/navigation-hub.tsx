import {
  IconDeviceDesktop,
  IconShieldCheck,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

interface NavigationHubProps {
  userName: string;
  isAdmin: boolean;
}

export function NavigationHub({ userName, isAdmin }: NavigationHubProps) {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 pb-24">
      <div className="card bg-base-100 border border-base-300 shadow-md mb-6">
        <div className="card-body p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              Welcome, <span className="text-blue-500">{userName}</span>
            </h2>
            <p className="text-base-content/60">What would you like to do?</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/vms" className="no-underline">
          <div className="card bg-base-100 border border-base-300 shadow-sm h-full transition-transform duration-200 hover:scale-[1.03]">
            <div className="card-body p-6">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 inline-block mb-3 mr-auto">
                <IconDeviceDesktop size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                My Virtual Machines
              </h4>
              <p className="text-sm text-base-content/60">
                Access and manage your virtual machine labs.
              </p>
            </div>
          </div>
        </Link>
        {isAdmin && (
          <Link href="/admin" className="no-underline">
            <div className="card bg-base-100 border border-base-300 shadow-sm h-full transition-transform duration-200 hover:scale-[1.03]">
              <div className="card-body p-6">
                <div className="p-3 rounded-lg bg-red-500/10 text-red-500 inline-block mb-3 mr-auto">
                  <IconShieldLock size={24} />
                </div>
                <h4 className="text-lg font-semibold mb-2">Admin Dashboard</h4>
                <p className="text-sm text-base-content/60">
                  Manage users, VMs, and platform settings.
                </p>
              </div>
            </div>
          </Link>
        )}
        <Link href="/me/scenarios" className="no-underline">
          <div className="card bg-base-100 border border-base-300 shadow-sm h-full transition-transform duration-200 hover:scale-[1.03]">
            <div className="card-body p-6">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500 inline-block mb-3 mr-auto">
                <IconShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-2">My Scenarios</h4>
              <p className="text-sm text-base-content/60">
                View and manage your scenario progress.
              </p>
            </div>
          </div>
        </Link>
        <Link href="/scenarios" className="no-underline">
          <div className="card bg-base-100 border border-base-300 shadow-sm h-full transition-transform duration-200 hover:scale-[1.03]">
            <div className="card-body p-6">
              <div className="p-3 rounded-lg bg-teal-500/10 text-teal-500 inline-block mb-3 mr-auto">
                <IconUser size={24} />
              </div>
              <h4 className="text-lg font-semibold mb-2">Explore Scenarios</h4>
              <p className="text-sm text-base-content/60">
                Browse and start new cyber-physical scenarios.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
