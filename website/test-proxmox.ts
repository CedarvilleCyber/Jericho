import proxmoxApi from "proxmox-api";

const proxmox = proxmoxApi({
  host: process.env.PVE_HOST || "pve.jericho.local",
  port: process.env.PVE_PORT ? parseInt(process.env.PVE_PORT) : 8006,
  tokenID: process.env.PVE_TOKEN_ID || "api-super@pve!new-webapp",
  tokenSecret: process.env.PVE_TOKEN_SECRET || "",
});

async function test() {
  console.log("Testing Proxmox connection...");
  console.log(`Host: ${process.env.PVE_HOST}`);
  console.log(`Port: ${process.env.PVE_PORT}`);
  console.log(`Token ID: ${process.env.PVE_TOKEN_ID}`);
  console.log();

  try {
    const version = await proxmox.version.$get();
    console.log("Version:", JSON.stringify(version, null, 2));
  } catch (e) {
    console.error("Failed to get version:", e);
  }

  try {
    const nodes = await proxmox.nodes.$get();
    console.log("Nodes:", JSON.stringify(nodes, null, 2));
  } catch (e) {
    console.error("Failed to get nodes:", e);
  }

  try {
    const node = process.env.PVE_NODE || "jericho01";
    const vms = await proxmox.nodes.$(node).qemu.$get();
    console.log(`VMs on ${node}:`, JSON.stringify(vms, null, 2));
  } catch (e) {
    console.error("Failed to get VMs:", e);
  }
}

test();
