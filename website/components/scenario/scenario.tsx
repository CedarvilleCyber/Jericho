"use client";

import { Scenario } from "@/types/scenario";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Image from "next/image";
import CurriculumLayout from "../layout/curriculum";
import { useState } from "react";

export default function ScenarioLayout({ scenario }: { scenario: Scenario }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("Waiting to start…");
  const [consoleWsUrl, setConsoleWsUrl] = useState<string | null>(null);

  // NOTE: adjust this if your Scenario model uses a different id/slug field
  const scenarioId = (scenario as any).id ?? (scenario as any).slug ?? scenario.name;

  async function handleStart() {
    setBusy(true);
    setStatus("Starting scenario infrastructure…");
    setConsoleWsUrl(null);

    try {
      // 1) Start the scenario's core VMs (DC/web/db/etc.)
      //    Endpoint from our earlier code: POST /api/scenarios/:id/start
      {
        const r = await fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}/start`, {
          method: "POST",
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `Start failed: ${r.status}`);
      }

      // 2) Ensure/create the per-user Kali jump VM (clone on first run, otherwise reuse)
      //    Endpoint from canvas: POST /api/scenarios/:id/jump/start
      setStatus("Provisioning your personal jump box…");
      let node: string, vmid: number;
      {
        const r = await fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}/jump/start`, {
          method: "POST",
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `Jump VM failed: ${r.status}`);
        node = data.node;
        vmid = data.vmid;
      }

      // 3) Prepare a web console session (short-lived JWT + WS proxy URL)
      //    Endpoint from canvas: POST /api/console/qemu/[node]/[vmid]
      setStatus("Preparing web console…");
      {
        const r = await fetch(`/api/console/qemu/${encodeURIComponent(node)}/${encodeURIComponent(String(vmid))}`, {
          method: "POST",
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `Console failed: ${r.status}`);
        setConsoleWsUrl(data.wsUrl as string); // e.g., "/console/ws?token=…"
      }

      setStatus("Ready! Click “Open Console” to launch.");
    } catch (e: any) {
      setStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  function openConsole() {
    // Step 2: you’ll embed noVNC here.
    // For now, navigate to a /console page you control, or keep this as a placeholder.
    // Example: route to /scenarios/[id]/console where you load noVNC and use consoleWsUrl.
    if (!consoleWsUrl) return;
    // If you already have a dedicated console page, push router there with scenarioId & pass wsUrl via query or state.
    // For a quick test, just open a new tab that your console page can read from sessionStorage:
    sessionStorage.setItem("wsUrl", consoleWsUrl);
    window.open(`/scenarios/${encodeURIComponent(scenarioId)}/console`, "_blank");
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6 h-full">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{scenario.name}</h1>
          <button
            onClick={handleStart}
            disabled={busy}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Starting…" : "START"}
          </button>
        </div>

        <Tabs defaultValue="topology" className="mt-4 h-full">
          <TabsList>
            <TabsTrigger value="topology">Topology</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <div className="border border-border rounded-md p-4 shadow-lg grow">
            <TabsContent value="topology">
              <p>Topology Map: {scenario.topologyMap}</p>
              <Image
                src={scenario.topologyMap}
                alt={`${scenario.name} Topology Map`}
                width={600}
                height={400}
              />
            </TabsContent>
            <TabsContent value="details">
              <p>{scenario.description}</p>
              <p>Curriculum: {scenario.curriculum}</p>
              <p>
                Created At: {new Date(scenario.createdAt).toLocaleDateString()}
              </p>
            </TabsContent>
            <TabsContent value="advanced">
              <p>Advanced settings and configurations will go here.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="border border-border rounded-md p-4 shadow-lg flex flex-col h-full">
        <div className="border-b border-border pb-4 mb-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Web Console</h2>
            <button
              onClick={openConsole}
              disabled={!consoleWsUrl}
              className="rounded-md bg-secondary text-secondary-foreground px-3 py-1.5 text-sm font-semibold shadow hover:opacity-90 disabled:opacity-50"
              title={consoleWsUrl ? "Open Console" : "Console not ready yet"}
            >
              Open Console
            </button>
          </div>
          <div className="bg-black text-green-500 font-mono p-2 rounded h-72 overflow-y-auto whitespace-pre-wrap">
            {status}
            {consoleWsUrl && `\n(ws prepared: ${consoleWsUrl.slice(0, 64)}…)`}
          </div>
        </div>

        <div className="flex-1">
          <CurriculumLayout curriculum={scenario.curriculum} />
        </div>
      </div>
    </div>
  );
}
