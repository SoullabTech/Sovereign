"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SacredLayout from "@/components/SacredLayout";
import OracleInterface from "@/components/OracleInterface";

export default function OraclePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has been onboarded
    const isOnboarded = localStorage.getItem("sacredMirrorOnboarded");
    if (!isOnboarded) {
      router.push("/welcome");
    }
  }, [router]);

  return (
    <SacredLayout>
      <OracleInterface />
    </SacredLayout>
  );
}