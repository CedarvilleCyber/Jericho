import { LivestreamPageEditor } from "@/components/admin/livestream-page-editor";
import prisma from "@/lib/prisma";

export default async function AdminLivestreamPage() {
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
