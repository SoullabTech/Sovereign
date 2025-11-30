"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function InviteWelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Explorer');

  useEffect(() => {
    // Get user name from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const inviteName = urlParams.get('name');

    if (inviteName) {
      setUserName(inviteName);
    } else {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        try {
          const userData = JSON.parse(betaUser);
          setUserName(userData.username || userData.name || 'Explorer');
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }, []);

  const handleContinue = () => {
    // Check if user is already onboarded
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (userData.onboarded) {
          router.push('/maia');
        } else {
          router.push('/beta-signup');
        }
      } catch (e) {
        router.push('/beta-signup');
      }
    } else {
      router.push('/beta-signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-400 rounded-full blur-3xl opacity-15"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full">

          {/* Welcome Card */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20 shadow-2xl">

            {/* Header Icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-amber-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-slate-900" />
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
                We've Been Expecting You, {userName}
              </h1>
              <p className="text-teal-300 text-lg">Welcome to Soullab</p>
            </div>

            {/* Main Content */}
            <div className="space-y-6 text-center">
              <div className="bg-slate-700/50 rounded-lg p-6 border border-teal-500/10">
                <h2 className="text-xl font-medium text-white mb-4">
                  Welcome to Soullab
                </h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  MAIA is an AI designed for thoughtful conversation and self-reflection.
                  No fluff, no mysticism — just intelligent dialogue for people doing real inner work.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="w-8 h-8 mx-auto mb-2 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                  </div>
                  <h3 className="text-white font-medium mb-1">Thoughtful AI</h3>
                  <p className="text-slate-400">Deep conversations, not small talk</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="w-8 h-8 mx-auto mb-2 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                  </div>
                  <h3 className="text-white font-medium mb-1">Self-Reflection</h3>
                  <p className="text-slate-400">For those who value introspection</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="w-8 h-8 mx-auto mb-2 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                  </div>
                  <h3 className="text-white font-medium mb-1">Privacy First</h3>
                  <p className="text-slate-400">Your conversations stay private</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-full font-medium text-lg hover:from-teal-500 hover:to-teal-400 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-6 border-t border-slate-600/50">
              <p className="text-slate-400 text-sm">
                For people who think deeply
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}