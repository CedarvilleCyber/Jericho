import { auth } from "@/auth";
import SetCookieForm from "@/components/scenario/set-cookie";
import prisma from "@/prisma";
import { proxmox } from "@/proxmox";
import { redirect } from "next/navigation";
import Script from "next/script";

export default async function VMConsolePage({
  params,
}: {
  params: Promise<{ vmid: string }>;
}) {
  const { vmid } = await params;
  const session = await auth();
  if (!session?.user || !session.user.email) {
    redirect("/api/auth/signin");
  }
  const user = await prisma.user.findFirst({
    where: { email: session?.user?.email },
  });
  if (!user) {
    redirect("/api/auth/signin");
  }
  // const api = proxmoxApi({
  //   host: process.env.PVE_HOST || "pve.jericho.local",
  //   port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
  //   username: process.env.PVE_USER || "root@pam",
  //   password: process.env.PVE_PASSWORD || "password",
  // });
  const authTicket = await proxmox.access.ticket.$post({
    username: `${user.proxmoxId}@pve`,
    password: process.env.PVE_CREATE_USER_PASSWORD || "password",
  });

  return (
    <>
      <iframe
        src={`https://${process.env.PVE_HOST}:${
          process.env.PVE_PORT
        }/?console=kvm&novnc=1&node=${
          process.env.PVE_NODE
        }&vmid=${vmid}&PVEAuthCookie=${encodeURIComponent(
          authTicket.ticket ?? ""
        )}`}
        style={{ width: "100%", height: "100%", border: "none" }}
        allowFullScreen
        sandbox="allow-same-origin allow-scripts"
        loading="lazy"
      />
      <Script src="/set-cookie.js"></Script>
      {/* <object
        data={`https://${process.env.PVE_HOST}:${
          process.env.PVE_PORT
        }/?console=kvm&novnc=1&node=${
          process.env.PVE_NODE
        }&vmid=${vmid}&PVEAuthCookie=${encodeURIComponent(
          authTicket.ticket ?? ""
        )}`}
        type="text/html"
        className="w-full h-full border-none"
      ></object> */}
    </>
  );
}
