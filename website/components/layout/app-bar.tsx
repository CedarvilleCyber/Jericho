import Image from "next/image";
export const runtime = "nodejs";
import { ThemeToggle } from "../theme/theme-toggle";
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { signInAction, signOutAction } from "@/app/actions/auth";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import LogoImage from "@/public/logo.svg";
import { prisma } from "@/prisma";

export default async function AppBar() {
  let session = null;
  try {
    session = await getSession();
  } catch (e) {
    console.error("getSession() failed:", e);
  }
  const user = session?.user;

  // Fetch scenarios from database
  const scenarios = await prisma.scenario.findMany({
    select: { id: true, slug: true, name: true, teaser: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="sticky top-0 z-50 w-full border-b border-solid border-black/[.08] dark:border-white/[.145] bg-background backdrop-blur-sm flex">
      <div className="ml-5 flex h-14 max-w-7xl items-center">
        <Image src={LogoImage} alt="Jericho Logo" width={40} height={40} />
        <Link
          href="/"
          className="font-medium font-[--crimson-pro] text-3xl ml-3"
        >
          Jericho
        </Link>
      </div>
      <NavigationMenu className="ml-4 my-auto mr-auto">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-9 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent/50">
              Scenarios
            </NavigationMenuTrigger>
            <NavigationMenuContent className="min-w-[200px] p-2">
              <div className="grid gap-1">
                <NavigationMenuLink asChild>
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
                
                {/* Dynamic scenarios from database */}
                {scenarios.map((scenario) => (
                  <NavigationMenuLink key={scenario.id} asChild>
                    <Link
                      href={`/scenarios/${scenario.slug}`}
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">
                        {scenario.name}
                      </div>
                      <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                        {scenario.teaser || "No description available"}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                ))}

                <NavigationMenuLink asChild>
                  <Link
                    href="/scenarios"
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">
                      All Scenarios
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                      Browse all available scenarios
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                Leaderboard
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {user && (
        <Button variant="secondary" className="my-auto" asChild>
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <ThemeToggle className="ml-2 my-auto mr-2" />
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="my-auto mr-3">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>{user.name?.[0] ?? "?"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={signOutAction}>
                <button type="submit">Sign out</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <form action={signInAction} className="my-auto mr-3">
          <Button variant="secondary">Login</Button>
        </form>
      )}
    </div>
  );
}
