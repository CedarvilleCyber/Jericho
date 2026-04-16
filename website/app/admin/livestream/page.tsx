import { LivestreamPageEditor } from "@/components/admin/livestream-page-editor";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLivestreamPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { userRoles: true },
  });

  if (!user?.userRoles?.find((role) => role.role === "ADMIN")) {
    redirect("/");
  }

  const config = await prisma.livestreamPageConfig.findFirst({
    include: { streams: { orderBy: { position: "asc" } } },
  });

  return (
    <div className="flex flex-col mt-3">
      <div className="mx-auto w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Livestream Page</h2>
        </div>
        <p className="text-sm text-base-content/60 mb-4">
          Configure the layout and stream keys shown on the{" "}
          <a href="/livestream" className="link link-primary" target="_blank">
            /livestream
          </a>{" "}
          page.
        </p>
        <LivestreamPageEditor config={config} />
      </div>
    </div>
  );
}
