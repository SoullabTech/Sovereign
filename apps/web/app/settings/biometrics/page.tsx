'use client';

import React, { useState, useEffect } from 'react';
import { HealthDataUploader } from '@/components/biometrics/HealthDataUploader';
import { FieldCoherenceDashboard } from '@/components/biometrics/FieldCoherenceDashboard';
import { FasciaLogger } from '@/components/biometrics/FasciaLogger';
import { ArrowLeft, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SacredHoloflower } from '@/components/sacred/SacredHoloflower';
import { realtimeBiometricService } from '@/lib/biometrics/RealtimeBiometricService';
import type { BiometricUpdate } from '@/lib/biometrics/RealtimeBiometricService';

type TabView = 'upload' | 'coherence' | 'fascia';

export default function BiometricsSettingsPage() {
  // Tab navigation
  const [activeTab, setActiveTab] = useState<TabView>('upload');

  // Pulsing heart coherence animation state
  const [pulseAmplitude, setPulseAmplitude] = useState(0.5);
  const [userBPM, setUserBPM] = useState(50); // Default to calm 50 BPM

  // Real-time biometric status
  const [biometricUpdate, setBiometricUpdate] = useState<BiometricUpdate | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);

  // Load user's actual heart rate on mount
  useEffect(() => {
    const loadUserHeartRate = async () => {
      try {
        const { biometricStorage } = await import('@/lib/biometrics/BiometricStorage');
        const hasData = await biometricStorage.hasHealthData();

        if (hasData) {
          const healthData = await biometricStorage.getLatestHealthData();
          if (healthData && healthData.heartRate.length > 0) {
            // Get most recent resting heart rate
            const restingHR = healthData.heartRate.find(r => r.context === 'resting');
            const recentHR = restingHR || healthData.heartRate[0];

            if (recentHR) {
              console.log(`💓 Using user's heart rate: ${recentHR.value} BPM`);
              setUserBPM(recentHR.value);
            }
          }
        }
      } catch (error) {
        console.log('No health data yet, using default BPM');
      }
    };

    loadUserHeartRate();
  }, []);

  // Start real-time biometric service
  useEffect(() => {
    console.log('🚀 Starting real-time biometric service');
    realtimeBiometricService.start(30000); // Poll every 30 seconds

    const unsubscribe = realtimeBiometricService.subscribe((update) => {
      console.log('💓 Biometric update received:', update);
      setBiometricUpdate(update);
      setIsLiveStreaming(true);

      // Update BPM from live data
      if (update.heartRate) {
        setUserBPM(update.heartRate);
      }
    });

    return () => {
      realtimeBiometricService.stop();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Heartbeat pulse synced to user's actual BPM
    const beatsPerSecond = userBPM / 60;

    const interval = setInterval(() => {
      setPulseAmplitude(prev => {
        // Create a heartbeat pattern: quick rise, slow fall
        const time = Date.now() / 1000;
        const heartbeat = Math.sin(time * Math.PI * 2 * beatsPerSecond) * 0.3 + 0.5; // Sine wave 0.2-0.8
        return heartbeat;
      });
    }, 50); // 20 FPS for smooth animation

    return () => clearInterval(interval);
  }, [userBPM]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dune-spice-sand via-dune-desert-rose to-dune-rose-gold p-4 md:p-8">
      {/* Back Button */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="gap-2 hover:bg-dune-sunset-blush/20 text-dune-deep-sand hover:text-dune-rose-deep transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Button>
        </Link>
      </div>

      {/* Pulsing Holoflower - Heart Coherence Symbol */}
      <div className="max-w-2xl mx-auto mb-8 flex flex-col items-center gap-4">
        <div className="relative w-[200px] h-[200px]">
          {/* Glow layer behind */}
          <div
            className="absolute inset-0 rounded-full blur-3xl pointer-events-none -z-10"
            style={{
              background: `radial-gradient(circle, rgba(212, 93, 121, ${pulseAmplitude * 0.5}) 0%, rgba(255, 123, 156, ${pulseAmplitude * 0.3}) 50%, transparent 70%)`,
              transform: `scale(${1.2 + pulseAmplitude * 0.3})`,
              transition: 'transform 0.1s ease-out'
            }}
          />

          {/* Holoflower SVG */}
          <img
            src="/holoflower-sacred.svg"
            alt="Sacred Holoflower"
            className="w-full h-full object-contain"
            style={{
              filter: `drop-shadow(0 0 ${10 + pulseAmplitude * 20}px rgba(212, 93, 121, ${0.4 + pulseAmplitude * 0.4}))`,
              transform: `scale(${1 + pulseAmplitude * 0.1})`,
              transition: 'all 0.1s ease-out'
            }}
          />
        </div>

        {/* BPM Display & Live Status */}
        <div className="flex flex-col items-center gap-3">
          {/* Heart Rate */}
          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-dune-rose-gold/40">
            <span className="text-dune-heart-coral text-xl">♥</span>
            <span className="text-dune-deep-sand font-semibold">{Math.round(userBPM)} BPM</span>
          </div>

          {/* Live Streaming Status */}
          {biometricUpdate && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Live Indicator */}
              <div className="flex items-center gap-1.5 bg-dune-sunset-blush/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dune-heart-coral/40">
                <div className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-dune-wellness-crimson animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs font-medium text-dune-deep-sand">
                  {isLiveStreaming ? 'Live' : 'Standby'}
                </span>
              </div>

              {/* HRV */}
              {biometricUpdate.hrv && (
                <div className="flex items-center gap-1.5 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dune-rose-gold/30">
                  <Activity className="w-3 h-3 text-dune-wellness-crimson" />
                  <span className="text-xs font-semibold text-dune-deep-sand">
                    {Math.round(biometricUpdate.hrv)}ms HRV
                  </span>
                </div>
              )}

              {/* Coherence Level */}
              <div className="flex items-center gap-1.5 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dune-rose-gold/30">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: `rgba(212, 93, 121, ${biometricUpdate.coherenceLevel})`,
                    boxShadow: `0 0 8px rgba(212, 93, 121, ${biometricUpdate.coherenceLevel * 0.5})`
                  }}
                />
                <span className="text-xs font-semibold text-dune-deep-sand">
                  {Math.round(biometricUpdate.coherenceLevel * 100)}% Coherence
                </span>
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dune-rose-gold/30">
                {biometricUpdate.coherenceTrend === 'rising' && (
                  <TrendingUp className="w-3 h-3 text-dune-bloom-magenta" />
                )}
                {biometricUpdate.coherenceTrend === 'falling' && (
                  <TrendingDown className="w-3 h-3 text-dune-wellness-crimson" />
                )}
                {biometricUpdate.coherenceTrend === 'stable' && (
                  <Minus className="w-3 h-3 text-dune-deep-sand" />
                )}
                <span className="text-xs font-medium text-dune-deep-sand capitalize">
                  {biometricUpdate.coherenceTrend}
                </span>
              </div>

              {/* Recommended Mode */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-dune-spice-trance-pink/30 to-dune-bloom-magenta/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dune-bloom-magenta/40">
                <span className="text-xs font-semibold text-dune-wellness-crimson capitalize">
                  {biometricUpdate.recommendedMode} Mode
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-dune-wellness-crimson via-dune-heart-coral to-dune-bloom-magenta bg-clip-text text-transparent">
          Biometric Integration
        </h1>
        <p className="text-dune-rose-deep text-lg font-medium">
          Connect your health data and track your embodiment journey through fascial consciousness.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('✅ Upload Data tab clicked');
              setActiveTab('upload');
            }}
            tabIndex={0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-dune-wellness-crimson text-white'
                : 'bg-white/40 text-dune-deep-sand hover:bg-white/60'
            }`}
          >
            Upload Data
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('✅ Field Coherence tab clicked');
              setActiveTab('coherence');
            }}
            tabIndex={0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'coherence'
                ? 'bg-dune-wellness-crimson text-white'
                : 'bg-white/40 text-dune-deep-sand hover:bg-white/60'
            }`}
          >
            Field Coherence
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('✅ Log Fascia tab clicked');
              setActiveTab('fascia');
            }}
            tabIndex={0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'fascia'
                ? 'bg-dune-wellness-crimson text-white'
                : 'bg-white/40 text-dune-deep-sand hover:bg-white/60'
            }`}
          >
            Log Fascia
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'upload' && <HealthDataUploader />}
        {activeTab === 'coherence' && <FieldCoherenceDashboard />}
        {activeTab === 'fascia' && (
          <FasciaLogger
            onComplete={() => {
              // Refresh coherence dashboard when fascia log is complete
              setActiveTab('coherence');
            }}
          />
        )}
      </div>

      {/* Explanation */}
      <div className="max-w-2xl mx-auto mt-8 prose prose-lg prose-dune">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-dune-rose-gold/30">
          <h2 className="text-3xl font-bold text-dune-wellness-crimson mb-6">How it works</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-dune-heart-coral pl-6">
              <h3 className="text-2xl font-semibold text-dune-rose-deep mb-2">1. Privacy First</h3>
              <p className="text-dune-deep-sand leading-relaxed">
                Your health data is stored <strong className="text-dune-wellness-crimson">only in your browser</strong> (IndexedDB).
                It never leaves your device or gets sent to our servers unless you explicitly
                opt into anonymous Field contribution.
              </p>
            </div>

            <div className="border-l-4 border-dune-bloom-magenta pl-6">
              <h3 className="text-2xl font-semibold text-dune-rose-deep mb-2">2. Real-Time Coherence Detection</h3>
              <p className="text-dune-deep-sand leading-relaxed mb-4">
                MAIA monitors your Heart Rate Variability (HRV) - the gold standard for
                measuring nervous system coherence. Based on your HRV:
              </p>
              <ul className="space-y-2 text-dune-deep-sand">
                <li className="flex items-start gap-3">
                  <span className="text-dune-heart-coral text-2xl">♥</span>
                  <span><strong className="text-dune-wellness-crimson">Low HRV</strong> (stressed) → Dialogue mode (gentle 4s breathing)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-dune-bloom-magenta text-2xl">♥</span>
                  <span><strong className="text-dune-wellness-crimson">Medium HRV</strong> (balanced) → Patient mode (deep 8s breathing)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-dune-spice-trance-pink text-2xl">♥</span>
                  <span><strong className="text-dune-wellness-crimson">High HRV</strong> (coherent) → Scribe mode (witnessing 12s breathing)</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-dune-sunset-blush pl-6 mt-6">
              <h3 className="text-2xl font-semibold text-dune-rose-deep mb-2">3. Automatic State Transitions</h3>
              <p className="text-dune-deep-sand leading-relaxed">
                As your coherence builds during a session, the interface automatically
                deepens into slower breathing rhythms and warmer desert rose hues. You don't need
                to think about it - your nervous system guides the journey.
              </p>
            </div>

            <div className="border-l-4 border-dune-arrakis-mauve pl-6 mt-6">
              <h3 className="text-2xl font-semibold text-dune-rose-deep mb-2">4. Breath Entrainment Validation</h3>
              <p className="text-dune-deep-sand leading-relaxed">
                MAIA can compare your actual breathing rate (from Apple Watch respiratory sensor)
                with the visual breathing animation. This validates whether the interface is
                successfully entraining your physiology.
              </p>
            </div>

            <div className="border-l-4 border-dune-spice-trance-pink pl-6 mt-6">
              <h3 className="text-2xl font-semibold text-dune-rose-deep mb-2">5. Session Improvement Tracking</h3>
              <p className="text-dune-deep-sand leading-relaxed">
                After each session, MAIA shows how your HRV changed from beginning to end.
                Over time, this reveals whether the work is building your baseline coherence.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-dune-spice-trance-pink/30 to-dune-arrakis-mauve/30 backdrop-blur-sm rounded-2xl p-8 mt-8 shadow-xl border-2 border-dune-spice-trance-pink/40">
          <h2 className="text-3xl font-bold text-dune-spice-trance-pink mb-4">Fascia as Consciousness Antenna</h2>
          <p className="text-dune-deep-sand leading-relaxed mb-6">
            Groundbreaking research reveals that <strong className="text-dune-bloom-magenta">fascia is not just connective tissue</strong>—it's the body's liquid crystalline quantum antenna system.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-dune-heart-coral pl-4">
              <h4 className="font-semibold text-dune-rose-deep mb-1">Physical Storage</h4>
              <p className="text-dune-deep-sand text-sm">
                Trauma, toxins, and emotional content literally get stuck in fascial adhesions. When fascia is restricted, consciousness transmission is dampened.
              </p>
            </div>

            <div className="border-l-4 border-dune-bloom-magenta pl-4">
              <h4 className="font-semibold text-dune-rose-deep mb-1">Piezoelectric Properties</h4>
              <p className="text-dune-deep-sand text-sm">
                Healthy fascia generates electricity when compressed and conducts bioelectric signals 1000x faster than the nervous system.
              </p>
            </div>

            <div className="border-l-4 border-dune-wellness-crimson pl-4">
              <h4 className="font-semibold text-dune-rose-deep mb-1">Quantum Connection</h4>
              <p className="text-dune-deep-sand text-sm">
                When you touch earth barefoot, your fascial network literally plugs into the mycelium/quantum field—enhancing intuition, synchronicity, and downloads.
              </p>
            </div>

            <div className="border-l-4 border-dune-sunset-blush pl-4">
              <h4 className="font-semibold text-dune-rose-deep mb-1">90-Day Remodeling Cycle</h4>
              <p className="text-dune-deep-sand text-sm">
                <strong className="text-dune-wellness-crimson">Phase 1 (Days 1-30):</strong> Physical tissue remodeling<br />
                <strong className="text-dune-heart-coral">Phase 2 (Days 31-60):</strong> Emotional release<br />
                <strong className="text-dune-bloom-magenta">Phase 3 (Days 61-90):</strong> Quantum/energetic activation
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-dune-sunset-blush/30 to-dune-spice-pink/30 backdrop-blur-sm rounded-2xl p-8 mt-8 shadow-xl border-2 border-dune-heart-coral/30">
          <h2 className="text-3xl font-bold text-dune-bloom-magenta mb-4">Future Integrations</h2>
          <p className="text-dune-deep-sand leading-relaxed mb-4">
            We're working on direct API integrations with:
          </p>
          <ul className="space-y-3 text-dune-deep-sand">
            <li className="flex items-start gap-3">
              <span className="text-dune-wellness-crimson font-bold">⌚</span>
              <span><strong className="text-dune-rose-deep">Oura Ring</strong> - Sleep quality & readiness scores</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-dune-heart-coral font-bold">💪</span>
              <span><strong className="text-dune-rose-deep">WHOOP</strong> - Recovery & strain tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-dune-bloom-magenta font-bold">♥</span>
              <span><strong className="text-dune-rose-deep">HeartMath</strong> - Gold standard coherence measurement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-dune-spice-trance-pink font-bold">🧠</span>
              <span><strong className="text-dune-rose-deep">Muse Headband</strong> - Brainwave states (EEG)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 mt-8 shadow-xl border-2 border-dune-wellness-crimson/30">
          <h2 className="text-3xl font-bold text-dune-wellness-crimson mb-4">The Research</h2>
          <p className="text-dune-deep-sand leading-relaxed mb-4">
            Heart Rate Variability is one of the most well-researched biomarkers for:
          </p>
          <ul className="grid grid-cols-2 gap-4 text-dune-deep-sand mb-6">
            <li className="flex items-center gap-2">
              <span className="text-dune-heart-coral text-xl">✦</span>
              <span>Stress resilience</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-dune-bloom-magenta text-xl">✦</span>
              <span>Emotional regulation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-dune-wellness-crimson text-xl">✦</span>
              <span>Meditative depth</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-dune-spice-trance-pink text-xl">✦</span>
              <span>Nervous system flexibility</span>
            </li>
          </ul>
          <p className="text-dune-deep-sand leading-relaxed text-lg border-t-2 border-dune-rose-gold/30 pt-6">
            By integrating HRV feedback into the interface, MAIA becomes a
            <strong className="text-dune-bloom-magenta"> biofeedback device</strong> - helping you learn coherence
            through unconscious entrainment rather than conscious effort.
          </p>
        </div>
      </div>
    </div>
  );
}
