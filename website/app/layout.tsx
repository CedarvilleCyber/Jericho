import "./globals.css";

import ErrorBoundary from "@/components/error-boundary";
import AppBar from "@/components/layout/app-bar";
import Footer from "@/components/layout/footer";
import ImpersonationBanner from "@/components/impersonation-banner";
import Providers from "@/components/providers";
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
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body className="min-h-screen">
        <Providers>
          <ErrorBoundary>
            <div className="flex flex-col h-dvh">
              <AppBar />
              <div className="px-4">
                <ImpersonationBanner />
              </div>
              <div className="flex-1 min-h-0 overflow-auto flex flex-col">{children}</div>
              <Footer />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
