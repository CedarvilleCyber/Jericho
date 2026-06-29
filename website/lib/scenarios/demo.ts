"use server";

const NUCLEAR  = "http://nuclear.jericho.local";
const TRAFFIC   = "http://traffic.jericho.local";
const WATER     = "http://water.jericho.local";
const SOUND     = "http://sound.jericho.local";
const DATACENTER = "http://datacenter.jericho.local";

async function piPost(url: string, body?: object): Promise<Response> {
  console.log(`[demo] POST ${url}`, body ?? "");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    console.log(`[demo] POST ${url} → ${res.status}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[demo] POST ${url} error body: ${text}`);
    }
    return res;
  } catch (err) {
    console.error(`[demo] POST ${url} threw:`, err);
    throw err;
  }
}

async function piGet(url: string): Promise<Response> {
  console.log(`[demo] GET ${url}`);
  try {
    const res = await fetch(url);
    console.log(`[demo] GET ${url} → ${res.status}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[demo] GET ${url} error body: ${text}`);
    }
    return res;
  } catch (err) {
    console.error(`[demo] GET ${url} threw:`, err);
    throw err;
  }
}

function wrapResult(
  res: PromiseSettledResult<Response>[],
): { success: boolean; error?: string } {
  const failed = res.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok));
  if (failed.length === 0) return { success: true };
  const msgs = failed.map((r) =>
    r.status === "rejected"
      ? String(r.reason)
      : `HTTP ${(r as PromiseFulfilledResult<Response>).value.status}`,
  );
  return { success: false, error: msgs.join("; ") };
}

export async function triggerNuclear(): Promise<{ success: boolean; error?: string }> {
  console.log("[demo] triggerNuclear start");
  const results = await Promise.allSettled([
    piPost(`${NUCLEAR}/smoke`, { duration: 10 }),
    piPost(`${SOUND}/play`, { sound: "nuclear5.wav" }),
  ]);
  const result = wrapResult(results);
  console.log("[demo] triggerNuclear result:", result);
  return result;
}

export async function triggerTraffic(): Promise<{ success: boolean; error?: string }> {
  console.log("[demo] triggerTraffic start");
  try {
    const stop = await piPost(`${TRAFFIC}/idle/stop`);
    if (!stop.ok) {
      const result = { success: false, error: `HTTP ${stop.status}` };
      console.log("[demo] triggerTraffic result:", result);
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    const start = await piPost(`${TRAFFIC}/idle/start`);
    if (!start.ok) {
      const result = { success: false, error: `restore failed: HTTP ${start.status}` };
      console.log("[demo] triggerTraffic result:", result);
      return result;
    }
    console.log("[demo] triggerTraffic result: success");
    return { success: true };
  } catch (error) {
    const result = { success: false, error: String(error) };
    console.log("[demo] triggerTraffic result:", result);
    return result;
  }
}

export async function triggerWaterTreatment(): Promise<{ success: boolean; error?: string }> {
  console.log("[demo] triggerWaterTreatment start");
  try {
    const results = await Promise.allSettled([
      piGet(`${WATER}/stop`),
      piPost(`${SOUND}/play`, { sound: "water5.wav" }),
    ]);

    const stopResult = wrapResult(results);
    if (!stopResult.success) {
      console.log("[demo] triggerWaterTreatment result:", stopResult);
      return stopResult;
    }

    await new Promise((resolve) => setTimeout(resolve, 5_000));

    const start = await piGet(`${WATER}/start`);
    if (!start.ok) {
      const result = { success: false, error: `restore failed: HTTP ${start.status}` };
      console.log("[demo] triggerWaterTreatment result:", result);
      return result;
    }

    console.log("[demo] triggerWaterTreatment result: success");
    return { success: true };
  } catch (error) {
    const result = { success: false, error: String(error) };
    console.log("[demo] triggerWaterTreatment result:", result);
    return result;
  }
}

export async function triggerDatacenter(): Promise<{ success: boolean; error?: string }> {
  console.log("[demo] triggerDatacenter start");
  try {
    const res = await piPost(`${DATACENTER}/flash?text=HACK&color=R`);
    if (!res.ok) {
      const result = { success: false, error: `HTTP ${res.status}` };
      console.log("[demo] triggerDatacenter result:", result);
      return result;
    }
    console.log("[demo] triggerDatacenter result: success");
    return { success: true };
  } catch (error) {
    const result = { success: false, error: String(error) };
    console.log("[demo] triggerDatacenter result:", result);
    return result;
  }
}
