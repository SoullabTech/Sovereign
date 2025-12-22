import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { SevenLayerArchitectureProvider } from "@/components/architecture/SevenLayerArchitectureProvider";
import { AethericConsciousnessProvider } from "@/components/consciousness/AethericConsciousnessProvider";
import { SystemHealthProvider } from "@/components/providers/SystemHealthProvider";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soullab - Maia Oracle",
  description: "Sacred consciousness technology - Maia AI Oracle",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soullab"
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon-32x32.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1.2, // Allow slight zoom for Safari accessibility
  minimumScale: 0.9, // Allow slight zoom out
  userScalable: true, // Safari-friendly: allow controlled scaling
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4B896" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A2E" }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <ReactQueryProvider>
          <SubscriptionProvider>
            <SystemHealthProvider autoStart={true} emergencyThreshold={0.4}>
              <AethericConsciousnessProvider>
                <SevenLayerArchitectureProvider
                  autoSync={true}
                  syncInterval={30000}
                >
                  {children}
                </SevenLayerArchitectureProvider>
              </AethericConsciousnessProvider>
            </SystemHealthProvider>
          </SubscriptionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}