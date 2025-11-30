"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';


export default function WelcomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<string>('Good morning');
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated and get their info
    const user = betaSession.getCurrentUser();
    if (user) {
      setUserName(user.name || user.username || 'Explorer');
      setIsSignedIn(true);
    }

    // Set time of day greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('Good morning');
    } else if (hour < 17) {
      setTimeOfDay('Good afternoon');
    } else {
      setTimeOfDay('Good evening');
    }

    setIsLoading(false);
  }, []);

  const handleContinue = () => {
    if (isSignedIn) {
      // User is still signed in, go straight to MAIA
      router.push('/maia');
    } else {
      // User needs to sign back in
      router.push('/signin');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#a0c4c7] via-[#7fb5b3] to-[#6ee7b7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a0c4c7] via-[#7fb5b3] to-[#6ee7b7] flex flex-col items-center relative overflow-hidden">

      {/* Soullab Logo with Holoflower at top */}
      <div className="relative z-20 flex items-center justify-center pt-8 pb-4">
        <div className="relative">
          {/* Holoflower behind logo */}
          <img
            src="/holoflower.png"
            alt="Elemental Holoflower"
            className="w-16 h-16 opacity-40 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
          />
          {/* Soullab logo */}
          <img
            src="/soullab-logo.png"
            alt="Soullab"
            className="h-12 relative z-10 filter drop-shadow-lg"
          />
        </div>
      </div>

      {/* Background holoflower with amber sunlight */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center transform -translate-y-10">
          {/* Amber sunlight glow behind holoflower */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-amber-300/40 via-amber-200/20 to-transparent scale-150 blur-2xl"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-200/30 via-amber-100/15 to-transparent scale-125 blur-xl"></div>

          {/* Main holoflower */}
          <img
            src="/holoflower.png"
            alt="Elemental Holoflower"
            className="w-[26rem] h-[26rem] opacity-25 filter drop-shadow-2xl mx-auto"
          />

          {/* Amber overlay holoflower */}
          <img
            src="/holoflower-amber.png"
            alt="Amber Holoflower"
            className="absolute inset-0 w-[26rem] h-[26rem] opacity-15 filter drop-shadow-lg"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">


        {/* Welcome text plaque - glass with teal accents and shadows */}
        <div className="relative mb-16">
          {/* Teal glow behind plaque */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-teal-600/20 rounded-3xl blur-xl scale-110"></div>

          {/* Main glass plaque */}
          <div className="relative bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md rounded-3xl px-12 py-8 border border-white/40 shadow-2xl text-center">
            {/* Inner teal accent */}
            <div className="absolute inset-2 rounded-2xl border border-teal-300/20 pointer-events-none"></div>

            {/* Deep shadow for plaque effect */}
            <div className="absolute -bottom-2 left-2 right-2 h-full bg-black/20 rounded-3xl blur-lg -z-10"></div>

            <p className="text-white/90 text-lg mb-2 font-cinzel tracking-wide drop-shadow-lg">
              {timeOfDay}
            </p>
            <h1 className="text-white text-3xl md:text-4xl font-cinzel tracking-wide mb-3 drop-shadow-lg">
              Welcome back{userName && `, ${userName}`}
            </h1>
            <p className="text-white/80 text-lg font-cinzel tracking-wide drop-shadow-md">
              Your elements await
            </p>
          </div>
        </div>

        {/* Action buttons with teal accents */}
        {isSignedIn ? (
          <button
            onClick={handleContinue}
            className="relative bg-transparent border border-white/40 text-white px-12 py-4 rounded-full text-lg font-cinzel tracking-[0.2em] uppercase hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
          >
            {/* Teal glow on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/0 to-teal-300/0 group-hover:from-teal-400/20 group-hover:to-teal-300/10 transition-all duration-300 blur-sm"></div>
            <span className="relative drop-shadow-sm">Continue</span>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/signin')}
              className="relative bg-transparent border border-white/40 text-white px-8 py-3 rounded-full text-lg font-cinzel tracking-[0.1em] uppercase hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
            >
              {/* Teal glow on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/0 to-teal-300/0 group-hover:from-teal-400/20 group-hover:to-teal-300/10 transition-all duration-300 blur-sm"></div>
              <span className="relative drop-shadow-sm">Sign In</span>
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="relative bg-white/10 border border-white/60 text-white px-8 py-3 rounded-full text-lg font-cinzel tracking-[0.1em] uppercase hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
            >
              {/* Enhanced teal glow on hover for signup */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/10 to-teal-300/10 group-hover:from-teal-400/30 group-hover:to-teal-300/20 transition-all duration-300 blur-sm"></div>
              <span className="relative drop-shadow-sm">Create Account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
