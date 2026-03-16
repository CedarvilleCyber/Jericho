"use server";

import { requireEnv } from "@/lib/require-env";
import { NodeSSH } from "node-ssh";

async function runSSHTrigger(
  targetIp: string,
  onCommand: string,
  offCommand: string,
  delayMs: number,
): Promise<{ success: boolean; error?: string }> {
  const privateKey = requireEnv("SSH_PRIVATE_KEY");
  const jumpSSH = new NodeSSH();
  const targetSSH = new NodeSSH();
  try {
    await jumpSSH.connect({ host: "192.168.2.3", username: "pi", privateKey });
    const tunnel = await jumpSSH.forwardOut("127.0.0.1", 0, targetIp, 22);
    await targetSSH.connect({ sock: tunnel, username: "pi", privateKey });
    await targetSSH.execCommand(onCommand);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await targetSSH.execCommand(offCommand);
    return { success: true };
  } catch (error) {
    console.error("SSH Error:", error);
    return { success: false, error: String(error) };
  } finally {
    targetSSH.dispose();
    jumpSSH.dispose();
  }
}

export async function triggerNuclear() {
  return runSSHTrigger(
    "192.168.8.11",
    'echo "1" > /home/pi/Documents/env/trigger.txt',
    'echo "0" > /home/pi/Documents/env/trigger.txt',
    10000,
  );
}

export async function triggerTraffic() {
  return runSSHTrigger(
    "192.168.8.12",
    'echo "1" > /home/pi/Documents/env/trigger.txt',
    'echo "0" > /home/pi/Documents/env/trigger.txt',
    10000,
  );
}

export async function triggerWaterTreatment() {
  return runSSHTrigger(
    "192.168.8.13",
    'echo "00" > /home/pi/Documents/env/trigger.txt',
    'echo "11" > /home/pi/Documents/env/trigger.txt',
    10000,
  );
}

export async function triggerDatacenter() {
  return runSSHTrigger(
    "192.168.8.15",
    'echo "1" > /home/pi/Documents/env/trigger.txt',
    'echo "0" > /home/pi/Documents/env/trigger.txt',
    3000,
  );
}
