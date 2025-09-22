import { Scenario } from "@/types/scenario";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Image from "next/image";
import CurriculumLayout from "../layout/curriculum";

export default function ScenarioLayout({ scenario }: { scenario: Scenario }) {
  return (
    <div className="grid grid-cols-2 gap-6 p-6 h-full">
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-bold">{scenario.name}</h1>
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
