"use server";

import { NodeSSH } from "node-ssh";

export async function triggerNuclear() {
  const jumpSSH = new NodeSSH();
  const targetSSH = new NodeSSH();

  try {
    await jumpSSH.connect({
      host: "192.168.2.3",
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    const tunnel = await jumpSSH.forwardOut("127.0.0.1", 0, "192.168.8.11", 22);

    await targetSSH.connect({
      sock: tunnel,
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    await targetSSH.execCommand(
      'echo "1" > /home/pi/Documents/env/trigger.txt',
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await targetSSH.execCommand(
      'echo "0" > /home/pi/Documents/env/trigger.txt',
    );

    targetSSH.dispose();
    jumpSSH.dispose();

    return { success: true };
  } catch (error) {
    console.error("SSH Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function triggerTraffic() {
  const jumpSSH = new NodeSSH();
  const targetSSH = new NodeSSH();

  try {
    await jumpSSH.connect({
      host: "192.168.2.3",
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    const tunnel = await jumpSSH.forwardOut("127.0.0.1", 0, "192.168.8.12", 22);

    await targetSSH.connect({
      sock: tunnel,
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    await targetSSH.execCommand(
      'echo "1" > /home/pi/Documents/env/trigger.txt',
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await targetSSH.execCommand(
      'echo "0" > /home/pi/Documents/env/trigger.txt',
    );

    targetSSH.dispose();
    jumpSSH.dispose();

    return { success: true };
  } catch (error) {
    console.error("SSH Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function triggerWaterTreatment() {
  const jumpSSH = new NodeSSH();
  const targetSSH = new NodeSSH();

  try {
    await jumpSSH.connect({
      host: "192.168.2.3",
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    const tunnel = await jumpSSH.forwardOut("127.0.0.1", 0, "192.168.8.13", 22);

    await targetSSH.connect({
      sock: tunnel,
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    await targetSSH.execCommand(
      'echo "00" > /home/pi/Documents/env/trigger.txt',
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await targetSSH.execCommand(
      'echo "11" > /home/pi/Documents/env/trigger.txt',
    );

    targetSSH.dispose();
    jumpSSH.dispose();

    return { success: true };
  } catch (error) {
    console.error("SSH Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function triggerDatacenter() {
  const jumpSSH = new NodeSSH();
  const targetSSH = new NodeSSH();

  try {
    await jumpSSH.connect({
      host: "192.168.2.3",
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    const tunnel = await jumpSSH.forwardOut("127.0.0.1", 0, "192.168.8.15", 22);

    await targetSSH.connect({
      sock: tunnel,
      username: "pi",
      privateKey: process.env.SSH_PRIVATE_KEY!,
    });

    await targetSSH.execCommand(
      'echo "1" > /home/pi/Documents/env/trigger.txt',
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await targetSSH.execCommand(
      'echo "0" > /home/pi/Documents/env/trigger.txt',
    );

    targetSSH.dispose();
    jumpSSH.dispose();

    return { success: true };
  } catch (error) {
    console.error("SSH Error:", error);
    return { success: false, error: String(error) };
  }
}