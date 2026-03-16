import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyScenarios() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }
  const prismaUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      userScenarios: {
        include: {
          scenario: true,
        },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="breadcrumbs text-sm mb-6">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>My Scenarios</li>
        </ul>
      </div>
      <h1 className="text-2xl font-bold mb-4">My Scenarios</h1>
      <p className="text-base-content/60 mb-6">
        Click on a scenario to enter the lab
      </p>
      <div className="grid grid-cols-2 gap-6">
        {prismaUser?.userScenarios.map((us) => (
          <Link key={us.id} href={`/me/scenarios/${us.scenario.id}`}>
            <div className="card bg-base-100 border border-base-300 shadow-sm h-full transition-transform duration-200 hover:scale-[1.03]">
              <div className="card-body p-6">
                <div className="flex items-center gap-2">
                  {us.scenario.teaserImageURL ? (
                    <Image
                      src={us.scenario.teaserImageURL}
                      alt={us.scenario.name}
                      width={48}
                      height={48}
                      className="mb-3 rounded-md"
                    />
                  ) : null}
                  <h2 className="text-xl font-semibold mb-2">
                    {us.scenario.name}
                  </h2>
                </div>
                <p className="text-sm text-base-content/60 mb-2">
                  Joined on {us.startedAt.toLocaleDateString()}
                </p>
                <p>{us.scenario.teaserText}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
