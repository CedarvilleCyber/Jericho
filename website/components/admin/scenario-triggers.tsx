"use client";

import {
  triggerDatacenter,
  triggerNuclear,
  triggerTraffic,
  triggerWaterTreatment,
} from "@/lib/scenarios/demo";
import {
  IconRadioactive,
  IconRotate,
  IconServer,
  IconTrafficLights,
} from "@tabler/icons-react";

export default function ScenarioTriggers() {
  return (
    <div className="border border-base-300 shadow-lg rounded-md p-4 flex flex-col gap-2 mb-3">
      <h2 className="text-xl">Trigger Scenarios</h2>
      <div>
        <button className="btn btn-error" onClick={() => triggerNuclear()}>
          <IconRadioactive className="mr-3" /> Trigger Nuclear Scenario
        </button>
      </div>
      <div>
        <button className="btn btn-warning" onClick={() => triggerTraffic()}>
          <IconTrafficLights className="mr-3" /> Trigger Traffic Scenario
        </button>
      </div>
      <div>
        <button
          className="btn btn-info"
          onClick={() => triggerWaterTreatment()}
        >
          <IconRotate className="mr-3" /> Trigger Water Treatment Scenario
        </button>
      </div>
      <div>
        <button className="btn btn-success" onClick={() => triggerDatacenter()}>
          <IconServer className="mr-3" /> Trigger Datacenter Sound
        </button>
      </div>
    </div>
  );
}
