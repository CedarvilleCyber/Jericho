import NuclearPlant from "@/public/nuclear-plant.png";
import TrafficLight from "@/public/traffic-light.png";
import WaterTreatment from "@/public/water-treatment.png";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export function LandingPage() {
  const scenarios = [
    {
      title: "Traffic Light",
      image: TrafficLight,
      description:
        "You've found a website for your local traffic advisory and light control system. This website looks like it could be vulnerable to some clever attacks. Build your skills in web exploitation and white-hat hacking with this fun entry-level scenario.",
      href: "/scenarios/traffic-light",
    },
    {
      title: "Water Treatment",
      image: WaterTreatment,
      description:
        "Dive into the critical infrastructure of water treatment systems. Learn about SCADA security, industrial control systems, and the challenges of protecting essential utilities from cyber threats.",
      href: "/scenarios/water-treatment",
    },
    {
      title: "Nuclear Plant",
      image: NuclearPlant,
      description:
        "Explore the high-stakes world of nuclear facility security. Understand the complex layers of protection, safety systems, and cybersecurity measures that keep critical nuclear infrastructure secure.",
      href: "/scenarios/nuclear-plant",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 pb-24">
      {/* Header */}
      <div className="card bg-base-100 border border-base-300 shadow-md mb-6">
        <div className="card-body p-6">
          <h1 className="text-4xl font-bold mb-4">Explore Scenarios</h1>
          <p className="text-lg text-base-content/60 mb-6 max-w-2xl">
            Hands-on cyber-physical infrastructure scenarios for learning and
            experimentation. Sign up to get started with interactive labs.
          </p>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="flex flex-col gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.title}
            className="card bg-base-100 border border-base-300 shadow-md"
          >
            <div className="card-body p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0">
                  <Image
                    src={scenario.image}
                    alt={scenario.title}
                    width={256}
                    height={256}
                    className="rounded-lg shadow-lg w-64 h-64 object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-3">
                      {scenario.title}
                    </h2>
                    <p className="leading-relaxed">{scenario.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/sign-in?mode=signup">
                      <button className="btn btn-primary">
                        Sign Up to Get Started
                        <IconArrowRight size={18} />
                      </button>
                    </Link>
                    <Link href="/sign-in">
                      <button className="btn btn-ghost">
                        Already have an account?
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
