import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jericho | Reset Password",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}