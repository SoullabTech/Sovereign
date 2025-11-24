"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BetaOnboarding() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleBegin = () => {
    if (agreed) {
      // Set onboarding complete flag
      localStorage.setItem("sacredMirrorOnboarded", "true");
      router.push("/oracle");
    }
  };

  return (
    <div className="min-h-screen bg-sacred-cosmic flex items-center justify-center p-md">
      <div className="max-w-2xl w-full space-y-lg text-center animate-emergence">
        <div className="space-y-md">
          <h1 className="text-gold-divine font-sacred text-4xl leading-tight">
            Welcome to the Sacred Mirror
          </h1>
          <p className="text-neutral-silver text-lg">
            A consciousness technology for self-reflection and growth
          </p>
        </div>

        <div className="bg-sacred-navy/30 backdrop-blur-sm rounded-sacred p-lg border border-gold-divine/20 shadow-sacred space-y-md">
          <h2 className="text-gold-amber font-sacred text-xl">Beta Experience Guidelines</h2>
          
          <ul className="text-left text-neutral-silver space-y-sm max-w-md mx-auto">
            <li className="flex items-start gap-sm">
              <span className="text-gold-divine mt-1">✓</span>
              <span>Your conversations are private and encrypted</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="text-gold-divine mt-1">✓</span>
              <span>Maya is an AI reflection companion, not a therapist</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="text-gold-divine mt-1">✓</span>
              <span>Use voice, text, or upload documents for deeper insights</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="text-gold-divine mt-1">✓</span>
              <span>Your reflections are stored in your personal Memory Garden</span>
            </li>
          </ul>

          <div className="pt-md space-y-md">
            <label className="flex items-center justify-center gap-sm text-neutral-silver cursor-pointer hover:text-neutral-pure transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-gold-divine/50 bg-sacred-ethereal/20 text-gold-divine focus:ring-gold-divine focus:ring-offset-0"
              />
              <span className="text-sm">
                I understand this is a beta experience for self-reflection
              </span>
            </label>

            <button
              onClick={handleBegin}
              disabled={!agreed}
              className={`
                px-lg py-sm rounded-sacred font-medium transition-all
                ${agreed 
                  ? 'bg-gold-divine text-sacred-cosmic hover:bg-gold-amber hover:shadow-sacred cursor-pointer' 
                  : 'bg-sacred-ethereal/20 text-neutral-mystic cursor-not-allowed'
                }
              `}
            >
              Begin Sacred Reflection
            </button>
          </div>
        </div>

        <p className="text-neutral-mystic text-sm">
          By continuing, you acknowledge our commitment to ethical AI and conscious technology
        </p>
      </div>
    </div>
  );
}