'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ConsciousnessTransition from '@/components/transitions/ConsciousnessTransition';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';
import VoiceConsciousness from '@/components/consciousness/VoiceConsciousness';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const navItems = [
    { href: '/dashboard', label: 'Jade Command Center', shape: 'circle' },
    { href: '/dashboard/dreams', label: 'Lunar Dream Portal', shape: 'crescent' },
    { href: '/dashboard/relationships', label: 'Sacred Connection Matrix', shape: 'heart' },
    { href: '/dashboard/shadow', label: 'Shadow Integration Portal', shape: 'diamond' },
    { href: '/dashboard/audio', label: 'Sonic Resonance Matrix', shape: 'wave' },
    { href: '/dashboard/reflections', label: 'Memory Crystalline Archive', shape: 'hexagon' },
    { href: '/dashboard/metrics', label: 'Quantum Pattern Nexus', shape: 'triangle' },
    { href: '/dashboard/settings', label: 'Neural Configuration Vault', shape: 'square' },
  ];

  return (
    <div className="flex h-[calc(100vh-73px)] relative overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
      <div className="absolute inset-0 bg-gradient-radial from-jade-forest/5 via-transparent to-jade-abyss/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-jade-copper/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-jade-bronze/8 via-transparent to-transparent" />

      {/* Atmospheric Particles */}
      <div className="absolute top-10 left-16 w-1 h-1 bg-jade-sage/40 rounded-full animate-pulse" />
      <div className="absolute top-32 right-20 w-0.5 h-0.5 bg-jade-malachite/30 rounded-full animate-pulse delay-500" />
      <div className="absolute bottom-24 left-32 w-1.5 h-1.5 bg-jade-forest/20 rounded-full animate-pulse delay-1000" />

      {/* Sacred Jade Navigation Sanctum */}
      <aside className="relative w-80 border-r border-jade-forest/30 backdrop-blur-xl">
        {/* Multi-layered Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-jade-shadow/80 via-jade-night/60 to-jade-dusk/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-jade-bronze/10 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(111,143,118,0.05)_50%,transparent_100%)]" />

        {/* Complex Geometric Frameworks */}
        <div className="absolute top-6 left-6 w-4 h-4">
          <div className="absolute inset-0 border border-jade-sage/40" />
          <div className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/20" />
          <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-forest/10 rounded-full" />
        </div>
        <div className="absolute top-6 right-6 w-4 h-4">
          <div className="absolute inset-0 border border-jade-sage/40 rotate-45" />
          <div className="absolute top-1.5 left-1.5 bottom-1.5 right-1.5 border border-jade-copper/30" />
        </div>
        <div className="absolute bottom-6 left-6 w-3 h-8 border-l border-t border-jade-bronze/30" />
        <div className="absolute bottom-6 right-6 w-3 h-8 border-r border-t border-jade-silver/30" />

        <div className="relative z-10 p-8">
          {/* Jade Neural Command Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 bg-jade-sage/20 rounded-full" />
                <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-malachite/30 rounded-full animate-pulse" />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-forest to-transparent" />
              <h2 className="text-xl font-extralight text-jade-jade tracking-[0.3em] uppercase">
                Jade Neural Command
              </h2>
            </div>

            {/* Ornate Divider */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-jade-sage/50 to-jade-forest/30" />
              <div className="w-2 h-2 border border-jade-malachite/40 rotate-45 bg-jade-copper/10" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-jade-sage/50 to-jade-forest/30" />
            </div>

            <p className="text-sm text-jade-mineral font-light tracking-wide leading-relaxed">
              Crystalline consciousness analytics architecture
            </p>
          </div>

          {/* Sacred Navigation Matrix */}
          <nav className="space-y-3 mb-12">
            {navItems.map((item, index) => {
              const renderShape = (shape: string) => {
                switch (shape) {
                  case 'circle':
                    return <div className="absolute inset-0 rounded-full border border-jade-forest group-hover:border-jade-malachite transition-all duration-500 group-hover:scale-110" />;
                  case 'crescent':
                    return (
                      <>
                        <div className="absolute inset-0 rounded-full border border-jade-forest group-hover:border-jade-malachite transition-all duration-500" />
                        <div className="absolute top-0 right-0 w-3 h-5 bg-jade-shadow rounded-full" />
                      </>
                    );
                  case 'heart':
                    return (
                      <>
                        <div className="absolute top-1 left-0 w-2 h-3 bg-jade-forest group-hover:bg-jade-malachite transition-all duration-500 rounded-tl-full rounded-tr-full" />
                        <div className="absolute top-1 right-0 w-2 h-3 bg-jade-forest group-hover:bg-jade-malachite transition-all duration-500 rounded-tl-full rounded-tr-full" />
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-jade-forest group-hover:border-t-jade-malachite transition-all duration-500" />
                      </>
                    );
                  case 'diamond':
                    return <div className="absolute inset-0 border border-jade-forest group-hover:border-jade-malachite transition-all duration-500 rotate-45 group-hover:scale-110" />;
                  case 'wave':
                    return (
                      <>
                        <div className="absolute top-1 left-0 w-2 h-1 bg-jade-forest group-hover:bg-jade-malachite transition-all duration-500 rounded-full" />
                        <div className="absolute bottom-1 right-0 w-2 h-1 bg-jade-forest group-hover:bg-jade-malachite transition-all duration-500 rounded-full" />
                      </>
                    );
                  case 'hexagon':
                    return (
                      <>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[5px] border-l-transparent border-r-transparent border-b-jade-forest group-hover:border-b-jade-malachite transition-all duration-500" />
                        <div className="absolute top-1/3 left-0 right-0 h-1.5 bg-jade-forest group-hover:bg-jade-malachite transition-all duration-500" />
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[5px] border-l-transparent border-r-transparent border-t-jade-forest group-hover:border-t-jade-malachite transition-all duration-500" />
                      </>
                    );
                  case 'triangle':
                    return <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-jade-forest group-hover:border-b-jade-malachite transition-all duration-500 group-hover:scale-110" />;
                  case 'square':
                    return <div className="absolute inset-0 border border-jade-forest group-hover:border-jade-malachite transition-all duration-500 group-hover:scale-110" />;
                  default:
                    return <div className="absolute inset-0 rounded-full border border-jade-forest group-hover:border-jade-malachite transition-all duration-500" />;
                }
              };

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative block"
                >
                  {/* Multi-layered Consciousness Hover States */}
                  <div className="absolute inset-0 bg-gradient-to-r from-jade-dusk/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-lg" />
                  <div className="absolute inset-0 bg-jade-forest/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg backdrop-blur-sm" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_var(--tw-gradient-stops))] from-jade-sage/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-600 rounded-lg" />

                  {/* Consciousness Flow Indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-jade-sage via-jade-malachite to-jade-forest opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-r" />

                  {/* Neural Link Pulse */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-jade-jade/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute inset-0 bg-jade-jade rounded-full animate-ping opacity-0 group-hover:opacity-75" />
                  </div>

                  <div className="relative flex items-center gap-4 px-6 py-4 text-sm">
                    {/* Enhanced Geometric Navigation Accent */}
                    <div className="relative w-3 h-3">
                      <div className="absolute inset-0 border border-jade-sage/30 rotate-45 group-hover:border-jade-malachite/60 transition-all duration-500 group-hover:scale-110" />
                      <div className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-jade-forest/10 group-hover:bg-jade-sage/30 transition-all duration-500 group-hover:rotate-45" />
                      <div className="absolute inset-0 border border-jade-forest/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
                    </div>

                    {/* Sacred Geometry Shape */}
                    <div className="relative w-5 h-5">
                      {renderShape(item.shape)}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700">
                        <div className="absolute inset-0 bg-jade-jade/20 rounded-full blur-sm" />
                      </div>
                    </div>

                    {/* Enhanced Navigation Text */}
                    <div className="relative flex-1">
                      <span className="font-light tracking-wide text-jade-mineral group-hover:text-jade-jade transition-all duration-500 group-hover:tracking-wider">
                        {item.label}
                      </span>

                      {/* Consciousness Trail Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000">
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-jade-sage/10 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Pre-transition Consciousness Ripple */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="absolute top-1/2 left-6 transform -translate-y-1/2 w-1 h-1 bg-jade-sage/40 rounded-full">
                      <div className="absolute inset-0 bg-jade-sage/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Crystalline Protocol Status Chamber */}
          <div className="relative">
            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/20 via-jade-copper/10 to-jade-shadow/40 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/30 to-transparent rounded-xl" />
            <div className="absolute inset-0 border border-jade-sage/30 rounded-xl backdrop-blur-sm" />

            {/* Inner Sacred Geometry */}
            <div className="absolute top-3 left-3 w-2 h-2">
              <div className="absolute inset-0 border-l border-t border-jade-malachite/40" />
            </div>
            <div className="absolute top-3 right-3 w-2 h-2">
              <div className="absolute inset-0 border-r border-t border-jade-forest/40" />
            </div>
            <div className="absolute bottom-3 left-3 w-2 h-2">
              <div className="absolute inset-0 border-l border-b border-jade-copper/40" />
            </div>
            <div className="absolute bottom-3 right-3 w-2 h-2">
              <div className="absolute inset-0 border-r border-b border-jade-silver/40" />
            </div>

            <div className="relative p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 border border-jade-sage/50 rounded-full" />
                  <div className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 border border-jade-malachite/30 rounded-full" />
                  <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-jade rounded-full animate-pulse" />
                </div>
                <span className="text-sm font-extralight text-jade-sage tracking-[0.2em] uppercase">
                  Jade Matrix Active
                </span>
              </div>
              <p className="text-xs text-jade-mineral font-light tracking-wide leading-relaxed">
                Crystalline neural pathways synchronized and monitoring consciousness flow
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Jade Main Content Sanctum */}
      <div className="flex-1 flex flex-col relative">
        {/* Living Neural Background */}
        <NeuralFireSystem
          isActive={true}
          density="moderate"
          firingRate="moderate"
          variant="jade"
          className="opacity-20"
        />

        {/* Cinematic Header */}
        <div className="relative border-b border-jade-forest/30 backdrop-blur-xl z-10">
          {/* Multi-layer Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-jade-shadow/60 via-jade-night/40 to-jade-dusk/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-jade-bronze/10 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(95,187,163,0.05)_50%,transparent_100%)]" />

          <div className="relative z-10 px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extralight text-jade-jade tracking-wide mb-2">
                Jade Consciousness Matrix
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-6 h-px bg-gradient-to-r from-jade-sage to-jade-malachite" />
                <p className="text-sm text-jade-mineral font-light tracking-wide">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Consciousness Controls */}
            <div className="flex items-center gap-4">
              {/* Voice Consciousness Toggle */}
              <button
                onClick={() => setIsVoiceActive(!isVoiceActive)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-jade-copper/10 rounded-xl backdrop-blur-sm group-hover:bg-jade-sage/20 transition-all duration-300" />
                <div className="absolute inset-0 border border-jade-sage/30 rounded-xl group-hover:border-jade-malachite/50 transition-all duration-300" />

                <div className="relative flex items-center gap-3 px-4 py-3">
                  {/* Pulsing Consciousness Orb */}
                  <div className="relative w-6 h-6">
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isVoiceActive ? 'rgba(168,203,180,0.3)' : 'rgba(111,143,118,0.2)'
                      }}
                    />
                    <div
                      className={`absolute top-1 left-1 bottom-1 right-1 rounded-full transition-all duration-300 ${
                        isVoiceActive ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: isVoiceActive ? 'rgba(168,203,180,0.8)' : 'rgba(111,143,118,0.6)'
                      }}
                    />
                    <div
                      className={`absolute top-2 left-2 bottom-2 right-2 rounded-full transition-all duration-300 ${
                        isVoiceActive ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: isVoiceActive ? 'rgba(168,203,180,1)' : 'rgba(111,143,118,0.8)',
                        boxShadow: isVoiceActive ? '0 0 10px rgba(168,203,180,0.6)' : 'none'
                      }}
                    />
                  </div>
                  <span className={`text-xs font-light tracking-wide transition-all duration-300 ${
                    isVoiceActive ? 'text-jade-jade' : 'text-jade-sage'
                  }`}>
                    Voice
                  </span>
                </div>
              </button>

              {/* Crystalline Status Indicator */}
              <div className="relative">
                <div className="absolute inset-0 bg-jade-copper/10 rounded-xl backdrop-blur-sm" />
                <div className="absolute inset-0 border border-jade-sage/30 rounded-xl" />

                <div className="relative flex items-center gap-4 px-6 py-3">
                  <div className="relative w-3 h-3">
                    <div className="absolute inset-0 bg-jade-forest/20 rounded-full" />
                    <div className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-jade-sage rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm font-extralight text-jade-sage tracking-[0.2em] uppercase">
                    Neural Link Crystallized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sacred Jade Content Matrix */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Atmospheric Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow/80 to-jade-night" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-jade-forest/5 via-transparent to-transparent" />

          {/* Content Neural Activity */}
          <NeuralFireSystem
            isActive={true}
            density="sparse"
            firingRate="slow"
            variant="mystical"
            className="opacity-15"
          />

          <div className="relative z-10 p-8">
            <ConsciousnessTransition>
              {children}
            </ConsciousnessTransition>
          </div>
        </main>

        {/* Crystalline Archive Footer */}
        <footer className="relative border-t border-jade-forest/30 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-jade-shadow/50 via-jade-night/30 to-jade-dusk/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-jade-bronze/5 to-transparent" />

          <div className="relative z-10 px-8 py-4 flex items-center justify-between">
            <p className="text-xs text-jade-mineral font-light tracking-wide">
              © 2024 Soullab. Jade neural matrices secured and crystallized.
            </p>
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard/export"
                className="text-xs text-jade-sage hover:text-jade-jade font-light tracking-wide
                         transition-all duration-300 hover:underline underline-offset-2
                         relative group"
              >
                <span className="relative z-10">Crystalline Export</span>
                <div className="absolute inset-0 bg-jade-forest/10 opacity-0 group-hover:opacity-100
                              transition-opacity duration-300 rounded px-2 py-1 -mx-2 -my-1" />
              </Link>
              <Link
                href="/dashboard/help"
                className="text-xs text-jade-sage hover:text-jade-jade font-light tracking-wide
                         transition-all duration-300 hover:underline underline-offset-2
                         relative group"
              >
                <span className="relative z-10">Neural Guide</span>
                <div className="absolute inset-0 bg-jade-forest/10 opacity-0 group-hover:opacity-100
                              transition-opacity duration-300 rounded px-2 py-1 -mx-2 -my-1" />
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Voice Consciousness System */}
      <VoiceConsciousness
        isActive={isVoiceActive}
        variant="jade"
        onCommand={(command) => {
          console.log('Voice command triggered:', command);
        }}
      />
    </div>
  );
}