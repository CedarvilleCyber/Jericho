import Image from "next/image";
import { ThemeToggle } from "../theme/theme-toggle";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export default async function AppBar() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-solid border-black/[.08] dark:border-white/[.145] bg-background backdrop-blur-sm flex">
      <div className="ml-5 flex h-14 max-w-7xl items-center">
        <Image src="/logo.svg" alt="Jericho Logo" width={40} height={40} />
        <Link
          href="/"
          className="font-medium font-[--crimson-pro] text-3xl ml-3"
        >
          Jericho
        </Link>
      </div>
      <ThemeToggle className="ml-auto my-auto mr-2" />
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
              <form
                action={async () => {
                  "use server";

                  await signOut();
                }}
              >
                <button type="submit">Sign out</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <form
          action={async () => {
            "use server";

            await signIn("microsoft-entra-id");
          }}
          className="my-auto mr-3"
        >
          <Button variant="secondary">Login</Button>
        </form>
      )}
    </div>
  );
}
