import { Scenario } from "@/types/scenario";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Image from "next/image";
import CurriculumLayout from "../layout/curriculum";
import LiveStreamImage from "@/components/ui/livestreamimage";

// If you want to make the path configurable per-scenario,
// you can add scenario.streamPath and pass it into <img src=...>
export default function ScenarioLayout({ scenario }: { scenario: Scenario }) {
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
            <TabsContent value="topology" className="h-full">
              <p>Topology Map: {scenario.topologyMap}</p>
              <Image
                src={scenario.topologyMap}
                alt={`${scenario.name} Topology Map`}
                width={600}
                height={400}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-2">
              <p>{scenario.description}</p>
              <p>Curriculum: {scenario.curriculum}</p>
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
        <div className="border-b border-border pb-4 mb-4 flex-1">
          <h2 className="text-xl font-semibold mb-2">Web Console</h2>
          <div className="bg-black text-green-500 font-mono p-2 rounded h-72 overflow-y-auto">
            Connecting to console...
          </div>
        </div>
        <div className="flex-1">
          <CurriculumLayout curriculum={scenario.curriculum} />
        </div>
      </div>
    </div>
  );
}
