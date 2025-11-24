import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/ios-fallbacks.css";
import { ErrorOverlay } from "@/components/system/ErrorOverlay";
import { AudioUnlockBanner } from "@/components/system/AudioUnlockBanner";
import { ToastProvider } from "@/components/system/ToastProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import IOSFixInitializer from "@/components/system/IOSFixInitializer";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soullab - Maya Voice Chat",
  description:
    "Sacred Mirror - Maya Voice AI companion for consciousness exploration",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soullab",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFD700",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-soul-background text-soul-textPrimary transition-colors duration-200 overflow-x-hidden`}>
        <ThemeProvider>
          <IOSFixInitializer />
          <ToastProvider>
            {/* Conditional Header */}
            <HeaderWrapper />
            
            {/* Main Content */}
            <main className="min-h-[calc(100vh-73px)]">
              {children}
            </main>
            
            <AudioUnlockBanner />
            <ErrorOverlay />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
