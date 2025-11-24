"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to MAIA interface for preview
    router.push('/maia');
  }, [router]);

  // Show a simple loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-white/80 font-light">Entering sacred space...</p>
      </div>
    </div>
  );
}