import LiveStreamImage from "@/components/ui/livestreamimage";
import { ScenarioWithQuestions } from "@/types/scenario";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import NotFound from "@/public/not-found.svg";
import CurriculumLayout from "../layout/curriculum";
import PVEViewer from "./pve-viewer";

export default function ScenarioLayout({
  scenario,
}: {
  scenario: ScenarioWithQuestions;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 p-6 h-full">
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-bold">{scenario.name}</h1>

        <Tabs defaultValue="topology" className="mt-4 h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="topology">Topology</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
          </TabsList>

          <div className="border border-border rounded-md p-4 shadow-lg grow overflow-hidden">
            <TabsContent value="topology" className="h-full flex flex-col">
              <p>Topology Map: {scenario.topologyMap}</p>
              <Image
                src={scenario.topologyMap || NotFound}
                alt={`${scenario.name} Topology Map`}
                width={600}
                height={400}
                className="m-auto object-contain bg-muted"
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-2">
              <p>{scenario.description}</p>
              <p>
                Created At: {new Date(scenario.createdAt).toLocaleDateString()}
              </p>
            </TabsContent>

            <TabsContent value="advanced">
              <p>Advanced settings and configurations will go here.</p>
            </TabsContent>

            {/* NEW: Live stream tab */}

            <TabsContent value="live" className="h-full">
              <LiveStreamImage height="28rem" />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="border border-border rounded-md p-4 shadow-lg flex flex-col h-full">
        <div className="border-b border-border pb-4 mb-4 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Web Console</h2>
          <PVEViewer vmid="801" className="flex-1" />
        </div>
        <div className="flex-1">
          <CurriculumLayout curriculum={scenario.questions} />
        </div>
      </div>
    </div>
  );
}
