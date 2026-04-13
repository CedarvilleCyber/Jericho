import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { joinScenario } from "@/lib/scenarios/join";
import { IconExternalLink } from "@tabler/icons-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }
  const { id } = await params;
  const scenario = await prisma.scenario.findUnique({
    where: {
      id,
    },
  });
  const prismaUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      userScenarios: true,
    },
  });
  const alreadyJoined = prismaUser?.userScenarios.some(
    (us) => us.scenarioId === id,
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/scenarios">Scenarios</Link>
          </li>
          <li>{scenario?.name || "Scenario Not Found"}</li>
        </ul>
      </div>
      <div className="flex items-center gap-4 mb-4">
        {scenario?.teaserImageURL ? (
          <Image
            src={scenario.teaserImageURL}
            alt={scenario.name || "Scenario Image"}
            width={64}
            height={64}
            className="rounded-md"
          />
        ) : (
          <div className="w-16 h-16 bg-base-300 rounded-md flex items-center justify-center">
            <span className="text-base-content/60">No Image</span>
          </div>
        )}
        <h2 className="text-2xl font-bold">
          {scenario?.name || "Scenario Not Found"}
        </h2>
      </div>
      <p className="text-base-content/60 mb-4 whitespace-pre-wrap">
        {scenario?.description ||
          "The scenario you are looking for does not exist."}
      </p>
      {scenario && (
        <div className="flex justify-end w-full">
          <form action={joinScenario}>
            <input type="hidden" name="userId" value={session.user.id} />
            <input type="hidden" name="scenarioId" value={id} />
            {alreadyJoined ? (
              <Link href={`/me/scenarios/${id}`}>
                <button className="btn btn-outline mt-4">
                  <IconExternalLink size={16} className="mr-1" />
                  View Scenario
                </button>
              </Link>
            ) : (
              <button className="btn btn-primary mt-4" type="submit">
                {alreadyJoined ? "Already Joined" : "Join Scenario"}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
