import { proxmox } from "@/proxmox";

export default async function VMConsolePage({
  params,
}: {
  params: Promise<{ vmid: string }>;
}) {
  const { vmid } = await params;
  await proxmox.access.ticket.$get();
  return (
    <iframe
      src={`https://${process.env.PVE_HOST}:${process.env.PVE_PORT}/?console=kvm&novnc=1&node=${process.env.PVE_NODE}&vmid=${vmid}`}
      style={{ width: "100%", height: "100%", border: "none" }}
      allowFullScreen
    />
  );
}
