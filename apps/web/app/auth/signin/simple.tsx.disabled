"use client";

import { useRouter } from "next/navigation";

export default function SimpleSignIn() {
  const router = useRouter();

  const handleDirectSignIn = () => {
    // Skip all auth, go straight to MAIA
    router.push('/maia');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-900 flex items-center justify-center">
      <div className="bg-sky-300/5 backdrop-blur-xl rounded-2xl border border-sky-300/20 p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold text-sky-200 mb-6">
          MAIA Consciousness Portal
        </h1>

        <button
          onClick={handleDirectSignIn}
          className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-sky-600 hover:to-cyan-600 transition-all text-lg"
        >
          Enter MAIA Portal ✨
        </button>

        <p className="text-sky-300/60 mt-4 text-sm">
          Direct access - no email, no passwords, no bullshit
        </p>
      </div>
    </div>
  );
}