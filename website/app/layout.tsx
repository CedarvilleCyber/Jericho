import "@mantine/core/styles.css";
import "./globals.css";

import AppBar from "@/components/layout/app-bar";
import Footer from "@/components/layout/footer";
import Providers from "@/components/providers";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen bg-[--mantine-color-body] text-[--mantine-color-text]">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <AppBar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
