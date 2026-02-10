"use client";

import {
  triggerDatacenter,
  triggerNuclear,
  triggerTraffic,
  triggerWaterTreatment,
} from "@/lib/scenarios/demo";
import { Box, Button } from "@mantine/core";
import {
  IconRadioactive,
  IconRotate,
  IconServer,
  IconTrafficLights,
} from "@tabler/icons-react";

export default function ScenarioTriggers() {
  return (
    <Box className="border border-gray-700 shadow-lg rounded-md p-4 flex flex-col gap-2 mb-3">
      <h2 className="text-xl">Trigger Scenarios</h2>
      <div>
        <Button onClick={() => triggerNuclear()} color="red">
          <IconRadioactive className="mr-3" /> Trigger Nuclear Scenario
        </Button>
      </div>
      <div>
        <Button onClick={() => triggerTraffic()} color="yellow">
          <IconTrafficLights className="mr-3" /> Trigger Traffic Scenario
        </Button>
      </div>
      <div>
        <Button onClick={() => triggerWaterTreatment()} color="blue">
          <IconRotate className="mr-3" /> Trigger Water Treatment Scenario
        </Button>
      </div>
      <div>
        <Button onClick={() => triggerDatacenter()} color="green">
          <IconServer className="mr-3" /> Trigger Datacenter Sound
        </Button>
      </div>
    </Box>
  );
}
