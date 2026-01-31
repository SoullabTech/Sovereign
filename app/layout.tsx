import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { DevNoServiceWorker } from "./DevNoServiceWorker";
import { SevenLayerArchitectureProvider } from "@/components/architecture/SevenLayerArchitectureProvider";
import { AethericConsciousnessProvider } from "@/components/consciousness/AethericConsciousnessProvider";
import { SystemHealthProvider } from "@/components/providers/SystemHealthProvider";
import FlagsDebug from "@/components/FlagsDebug";

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
      <head>
        {/* 🔖 BUILD STAMP v4 - proves new code reached device */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            console.log('🔖 LAYOUT BUILD: v4-${Date.now()}');
            var d=document.createElement('div');
            d.id='build-v4';
            d.style.cssText='position:fixed;top:0;left:0;right:0;background:red;color:white;padding:8px;text-align:center;font-size:14px;z-index:999999;font-weight:bold;';
            d.textContent='BUILD v4 DEPLOYED';
            document.addEventListener('DOMContentLoaded',function(){
              document.body.appendChild(d);
              setTimeout(function(){d.remove()},15000);
            });
          })();
        `}} />
      </head>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <FlagsDebug />
        <SubscriptionProvider>
          <DevNoServiceWorker />
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
      </body>
    </html>
  );
}