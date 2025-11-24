import { ScenarioWithQuestions } from "@/types/scenario";
import CurriculumLayout from "../layout/curriculum";
import ClearAnswersDialog from "../ui/clear-answers-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import PVEViewer from "./pve-viewer";
import TopologyImage from "./topology-image";
import YouTubeStream from "./youtube-stream";

export default function ScenarioLayout({
  scenario,
}: {
  scenario: ScenarioWithQuestions;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 p-3 h-full">
      <div className="h-full flex flex-col">
        <div className="border border-border rounded-md p-4 shadow-lg grow overflow-hidden flex flex-col">
          <h2 className="text-xl font-semibold mb-2">{scenario.name}</h2>
          <div className="border-b border-border pb-4 flex-1 flex flex-col">
            <YouTubeStream channelId={scenario.youtubeChannelId} />
          </div>
          <Tabs defaultValue="topology" className="mt-4 h-[35vh] flex flex-col">
            <TabsList>
              <TabsTrigger value="topology">Topology</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="topology" className="h-full flex flex-col">
              <TopologyImage
                src={scenario.topologyMap}
                alt={`${scenario.name} Topology Map`}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-2">
              <p>{scenario.description}</p>
              <p>
                Created At: {new Date(scenario.createdAt).toLocaleDateString()}
              </p>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <p>Advanced settings and configurations.</p>
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold mb-2">Danger Zone</h3>
                <ClearAnswersDialog scenarioId={scenario.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="border border-border rounded-md p-4 shadow-lg flex flex-col h-full">
        <div className="border-b border-border pb-4 mb-4 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Web Console</h2>
          <PVEViewer vmid="115" className="flex-1" />
        </div>
        <div className="flex-1">
          <CurriculumLayout
            curriculum={scenario.questions}
            scenarioId={scenario.id}
            scenarioName={scenario.name}
          />
        </div>
      </div>
    </div>
  );
}
