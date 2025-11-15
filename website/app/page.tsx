import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhysicalJericho from "@/public/physical-jericho.png";
import Logo1024 from "@/public/logo1024.png";
import NuclearPlant from "@/public/nuclear-plant.png";
import WaterTreatment from "@/public/water-treatment.png";
import TrafficLight from "@/public/traffic-light.png";

export default function Home() {
  return (
    <div className="relative flex h-full w-full">
      <div
        className="w-full h-full antialiased fixed left-0 top-0 overflow-hidden -z-10"
        style={{ clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 40% 100%)" }}
      >
        <Image
          src={PhysicalJericho}
          alt="Jericho Logo"
          width={1920}
          height={1080}
          className="object-cover h-full blur-md"
        />
      </div>
      <div
        className="w-full h-full antialiased fixed left-0 top-0 overflow-hidden -z-10"
        style={{ clipPath: "polygon(0% 0%, 60% 0%, 40% 100%, 0% 100%)" }}
      >
        <Image
          src={Logo1024}
          alt="Jericho Logo"
          width={1920}
          height={1080}
          className="object-cover h-full blur-md"
        />
      </div>
      <div className="w-full">
        <div className="sticky top-0 p-4 w-full bg-background/95 flex z-10">
          <h1 className="ml-2 text-4xl font-semibold">Scenarios</h1>
          <Link href="/scenarios" className="text-accent ml-auto my-auto">
            View all scenarios
            <ArrowRight className="inline ml-1" />
          </Link>
        </div>
        {/* <div className="p-4 flex">
          <Image
            src={NuclearPlant}
            alt="Nuclear Plant"
            width={256}
            height={256}
            className="rounded-lg shadow-lg brightness-90 border border-solid border-black/[.08] dark:border-white/[.145]"
          />
          <div className="ml-6 my-auto bg-background/75 p-4 rounded-lg shadow-md border border-solid border-black/[.08] dark:border-white/[.145]">
            <h2 className="mt-4 text-2xl font-semibold">Nuclear Plant</h2>
            <p className="mt-2 text-lg max-w-xl">
              You are a technician at a nuclear power plant. A critical system
              has failed, and you must quickly diagnose and repair the issue to
              prevent a meltdown. Use your knowledge of nuclear physics and
              engineering to navigate the plant&apos;s complex systems and
              restore safety.
            </p>
            <Link
              href="/scenarios/nuclear-plant"
              className="mt-4 inline-block text-primary font-medium"
            >
              Start Scenario
              <ArrowRight className="inline ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-4 flex justify-end">
          <div className="mr-6 my-auto bg-background/75 p-4 rounded-lg shadow-md border border-solid border-black/[.08] dark:border-white/[.145]">
            <h2 className="mt-4 text-2xl font-semibold">Water Treatment</h2>
            <p className="mt-2 text-lg max-w-xl">
              You are an engineer at a municipal water treatment facility. A
              sudden contamination has been detected in the water supply, and
              you must identify the source and implement a solution to ensure
              safe drinking water for the community. Utilize your expertise in
              environmental engineering and chemistry to tackle this urgent
              challenge.
            </p>
            <Link
              href="/scenarios/water-treatment"
              className="mt-4 inline-block text-primary font-medium"
            >
              Start Scenario
              <ArrowRight className="inline ml-1" />
            </Link>
          </div>
          <Image
            src={WaterTreatment}
            alt="Water Treatment"
            width={256}
            height={256}
            className="rounded-lg shadow-lg brightness-90 border border-solid border-black/[.08] dark:border-white/[.145]"
          />
        </div> */}
        <div className="p-4 flex">
          <Image
            src={TrafficLight}
            alt="Traffic Light"
            width={256}
            height={256}
            className="rounded-lg shadow-lg brightness-90 border border-solid border-black/[.08] dark:border-white/[.145]"
          />
          <div className="ml-6 my-auto bg-background/75 p-4 rounded-lg shadow-md border border-solid border-black/[.08] dark:border-white/[.145]">
            <h2 className="mt-4 text-2xl font-semibold">Traffic Light</h2>
            <p className="mt-2 text-lg max-w-xl">
              You&apos;ve found a website for your local traffic advisory and
              light control system. This website looks like it could be
              vulnerable to some clever attacks. Build your skills in web
              exploitation and white-hat hacking with this fun entry-level
              scenario.
            </p>
            <Link
              href="/scenarios/traffic-light"
              className="mt-4 inline-block text-primary font-medium"
            >
              Start Scenario
              <ArrowRight className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
