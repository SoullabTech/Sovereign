"use client";

import { ReactNode } from "react";
// NUCLEAR ISOLATION: All providers and components temporarily disabled for build
// import { ThemeProvider } from "@/components/providers/ThemeProvider";
// import { SecureAuthProvider } from "@/components/SecureAuthProvider";
// import IOSFixInitializer from "@/components/system/IOSFixInitializer";
// import { ToastProvider } from "@/components/system/ToastProvider";
// import { ErrorOverlay } from "@/components/system/ErrorOverlay";
// import { HeaderWrapper } from "@/components/layout/HeaderWrapper";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NUCLEAR ISOLATION: Completely bare layout for build testing */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}