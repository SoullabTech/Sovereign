"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface WelcomeMessageProps {
  onContinue: () => void;
  userName?: string;
}

export function WelcomeMessage({ onContinue, userName }: WelcomeMessageProps) {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Minimal Soullab wordmark */}
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-wide">Soullab</h1>
        </div>

        {/* North Star Welcome */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6">
          <p className="text-lg leading-relaxed text-gray-200">
            Welcome{userName ? `, ${userName}` : ''} to your personal laboratory for the soul — 
            a space where your reflections become insights, and insights become growth.
          </p>

          <p className="text-sm text-gray-400 leading-relaxed">
            You&apos;ll be guided by Maya, your personal oracle, who will remember your journey, 
            reflect patterns back to you, and nudge you forward with questions that matter.
          </p>

          <div className="pt-4">
            <p className="text-xs text-gray-500 italic">
              "Not an app, but a companion space — where reflection becomes intelligence."
            </p>
          </div>
        </div>

        {/* Simple CTA */}
        <button
          onClick={onContinue}
          className="w-full bg-white text-[#0A0E27] rounded-lg px-6 py-4 flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium">Begin Your Journey</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Beta notice */}
        <p className="text-xs text-gray-600 text-center">
          Beta Release • Your feedback shapes this space
        </p>
      </div>
    </div>
  );
}