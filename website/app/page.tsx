"use client";

import { authClient } from "@/lib/auth-client";
import { getUserRoles } from "@/lib/user/roles";
import { Container, Loader, useComputedColorScheme } from "@mantine/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import Logo1024 from "@/public/logo1024.png";
import PhysicalJericho from "@/public/physical-jericho.png";
import { LandingPage } from "@/components/home/landing-page";
import { NavigationHub } from "@/components/home/navigation-hub";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const computedColorScheme = useComputedColorScheme("dark");

  useEffect(() => {
    if (data?.user?.id) {
      setIsLoadingAdmin(true);
      getUserRoles(data.user.id)
        .then((roles) => {
          setIsAdmin(roles.includes("ADMIN"));
        })
        .finally(() => {
          setIsLoadingAdmin(false);
        });
    } else {
      setIsLoadingAdmin(false);
      setIsAdmin(false);
    }
  }, [data?.user?.id]);

  return (
    <>
      {/* Diagonal split background */}
      <div
        className="w-full h-full antialiased fixed left-0 top-0 overflow-hidden -z-10"
        style={{ clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 40% 100%)" }}
      >
        <Image
          src={PhysicalJericho}
          alt="Jericho Physical"
          fill
          priority
          className={`object-cover blur-md ${computedColorScheme === "dark" ? "dark:brightness-50" : ""}`}
        />
      </div>
      <div
        className="w-full h-full antialiased fixed left-0 top-0 overflow-hidden -z-10"
        style={{ clipPath: "polygon(0% 0%, 60% 0%, 40% 100%, 0% 100%)" }}
      >
        <Image
          src={Logo1024}
          alt="Jericho Logo"
          fill
          priority
          className={`object-cover blur-md ${computedColorScheme === "dark" ? "dark:brightness-50" : ""}`}
        />
      </div>

      {/* Content */}
      {isPending || isLoadingAdmin ? (
        <Container size="sm" className="py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader size="xl" />
          </div>
        </Container>
      ) : !data?.session ? (
        <LandingPage />
      ) : (
        <NavigationHub userName={data.user.name ?? "User"} isAdmin={isAdmin} />
      )}
    </>
  );
}
