"use server";

import { redirect } from "next/navigation";

export async function signInAction() {
  // Redirect to BetterAuth Microsoft sign-in endpoint
  redirect("/api/auth/signin/microsoft");
}

export async function signOutAction() {
  // Redirect to BetterAuth sign-out endpoint
  redirect("/api/auth/signout");
}
