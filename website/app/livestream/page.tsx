import { LivestreamViewer } from "@/components/livestream/livestream-viewer";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LivestreamPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.session) {
    redirect("/auth/sign-in");
  }

  const config = await prisma.livestreamPageConfig.findFirst({
    include: { streams: { orderBy: { position: "asc" } } },
  });

  return (
    <div className="flex flex-col mt-3 px-4 max-w-7xl mx-auto w-full">
      {config ? (
        <LivestreamViewer configLayout={config.layout} streams={config.streams} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold">No livestream configured yet.</p>
          <p className="text-sm text-base-content/50 mt-1">
            An admin needs to set up the livestream page first.
          </p>
        </div>
      )}
    </div>
  );
}
