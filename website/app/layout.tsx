import "@mantine/core/styles.css";
import "./globals.css";

import AppBar from "@/components/app-bar";
import Providers from "@/components/providers";
import {
  ColorSchemeScript,
  mantineHtmlProps
} from "@mantine/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jericho Web",
  description: "Interact with cyber in the real world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="min-h-screen bg-[--mantine-color-body] text-[--mantine-color-text]">
        <Providers>
          <AppBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
