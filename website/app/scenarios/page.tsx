import prisma from "@/lib/prisma";
import { IconDeviceDesktop } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default async function ScenariosPage() {
  const scenarios = await prisma.scenario.findMany();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>Scenarios</li>
        </ul>
      </div>
      <h2 className="text-2xl font-bold mb-4">Available Scenarios</h2>
      <div className="grid grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/scenarios/${scenario.id}`}
            className="no-underline"
          >
            <div className="card bg-base-100 border border-base-300 shadow-sm h-full transition-transform duration-200 hover:scale-[1.03]">
              <div className="card-body p-6">
                {scenario.teaserImageURL ? (
                  <Image
                    src={scenario.teaserImageURL}
                    alt={scenario.name}
                    width={48}
                    height={48}
                    className="mb-3 rounded-md"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 inline-block mb-3">
                    <IconDeviceDesktop size={24} />
                  </div>
                )}
                <h4 className="text-lg font-semibold mb-2">{scenario.name}</h4>
                <p className="text-sm text-base-content/60">
                  {scenario.teaserText || "No description available."}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
