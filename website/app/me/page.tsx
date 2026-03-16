"use client";

import ChangeEmailForm from "@/components/me/change-email-form";
import ChangePasswordForm from "@/components/me/change-password-form";
import DeleteAccountSection from "@/components/me/delete-account-section";
import ProfileForm from "@/components/me/profile-form";
import SessionsList from "@/components/me/sessions-list";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MePage() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.push("/sign-in");
    }
  }, [data, isPending, router]);

  if (isPending) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <span className="loading loading-spinner loading-xl" />
        </div>
      </div>
    );
  }

  if (!data?.session) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>My Profile</li>
        </ul>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Profile</h2>
          <p className="text-sm text-base-content/60">
            Update your account information
          </p>
        </div>

        <ProfileForm
          initialName={data.user.name || ""}
          initialUsername={(data.user as { username?: string }).username || ""}
          email={data.user.email || ""}
        />
        <SessionsList currentToken={data.session.token} />
        <ChangePasswordForm />
        <ChangeEmailForm currentEmail={data.user.email || ""} />
        <DeleteAccountSection />
      </div>
    </div>
  );
}
