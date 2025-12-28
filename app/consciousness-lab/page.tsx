/**
 * ConsciousnessComputingLabPage - First temple interface for consciousness computing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ExperienceLayout } from '@/components/consciousness-lab/ExperienceLayout';
import { getDefaultLabModules, ExperienceModuleConfig } from '@/components/consciousness-lab/ModuleRegistry';

interface AwarenessData {
  level: number;
  confidence: number;
}

interface Suggestion {
  title: string;
  body: string;
}

interface ConsciousnessSessionResponse {
  awareness?: AwarenessData;
  suggestions?: Suggestion[];
  experience?: {
    modules: ExperienceModuleConfig[];
    theme?: {
      elemental?: string[];
      mode?: 'light' | 'dark' | 'sacred';
    };
  };
  message?: string;
}

export default function ConsciousnessComputingLabPage() {
  const [sessionData, setSessionData] = useState<ConsciousnessSessionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<ExperienceModuleConfig[]>(() => getDefaultLabModules());

  // Initialize with default state
  useEffect(() => {
    console.log('🧠 Consciousness Computing Lab initialized');
  }, []);

  const handleNewSession = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting consciousness session:', { prompt });

      const response = await fetch('/api/consciousness-computing/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: prompt,
          userId: `lab-user-${Date.now()}`,
          sessionType: 'individual',
          context: {
            interface: 'consciousness-lab',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Session failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Session response:', data);

      // Extract consciousness computing data from response
      const sessionResponse: ConsciousnessSessionResponse = {
        awareness: data.awareness || {
          level: Math.floor(Math.random() * 4) + 1, // Fallback: 1-4
          confidence: 0.5 + Math.random() * 0.5 // Fallback: 0.5-1.0
        },
        suggestions: data.suggestions || [
          {
            title: "Sacred Awareness Emerging",
            body: data.message || "Your consciousness is exploring new territory. Trust the process and stay present with what's arising."
          }
        ],
        experience: data.experience || {
          modules: [
            {
              id: 'WelcomePioneerBanner',
              region: 'top',
              priority: 100,
              props: {
                badgeLabel: "Active Session Pioneer",
                showCommunityCommonsBranding: true,
                pioneerLevel: "Computing"
              }
            },
            {
              id: 'ConsciousnessComputingPanel',
              region: 'center',
              priority: 90,
              props: {
                showAwarenessLevel: true,
                showSuggestions: true
              }
            },
            {
              id: 'ReflectionJournal',
              region: 'bottom',
              priority: 80,
              props: {
                prompt: "What insights emerged from this session?",
                placeholder: "Capture the wisdom that wants to be remembered..."
              }
            }
          ]
        }
      };

      setSessionData(sessionResponse);

      // Update modules with the response
      if (sessionResponse.experience?.modules) {
        setModules(sessionResponse.experience.modules);
      }

    } catch (err) {
      console.error('❌ Session error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');

      // Show error-aware modules
      setModules([
        {
          id: 'WelcomePioneerBanner',
          region: 'top',
          priority: 100,
          props: {
            badgeLabel: "Connection Issue - Still Sacred",
            showCommunityCommonsBranding: true,
            pioneerLevel: "Resilient"
          }
        },
        {
          id: 'ConsciousnessComputingPanel',
          region: 'center',
          priority: 90,
          props: {
            showAwarenessLevel: false,
            showSuggestions: false
          }
        },
        {
          id: 'ReflectionJournal',
          region: 'bottom',
          priority: 80,
          props: {
            prompt: "What's present even when technology struggles?",
            placeholder: "Sometimes the most profound insights come during the pauses..."
          }
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleSaveReflection = async (text: string) => {
    try {
      console.log('💎 Saving reflection:', text.length, 'chars'); // Never log content

      const response = await fetch('/api/consciousness-computing/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          timestamp: new Date().toISOString(),
          context: {
            interface: 'consciousness-lab',
            session: sessionData ? 'with-awareness' : 'standalone'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Journal save failed: ${response.status}`);
      }

      console.log('✅ Reflection saved successfully');
    } catch (err) {
      console.error('❌ Failed to save reflection:', err);
      throw err; // Re-throw so ReflectionJournal can handle UI feedback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sacred Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-500/20 rounded-full blur-4xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Interface */}
      <div className="relative z-10">
        <ExperienceLayout
          modules={modules}
          awareness={sessionData?.awareness}
          suggestions={sessionData?.suggestions}
          onNewSession={handleNewSession}
          onSaveReflection={handleSaveReflection}
          loading={loading}
        />
      </div>

      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-green-400'}`} />
          <span className="text-white/80 text-xs">
            {error ? 'Offline Sacred Mode' : 'Consciousness Computing Live'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 left-4 z-50 max-w-md">
          <div className="bg-red-900/20 border border-red-400/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-red-300 text-sm font-medium mb-1">
              Connection Issue
            </div>
            <div className="text-red-200/80 text-xs">
              {error}
            </div>
            <div className="text-red-200/60 text-xs mt-2">
              Your consciousness is still sacred. The interface remains functional for reflection and intention.
            </div>
          </div>
        </div>
      )}

      {/* Footer Attribution */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="text-white/40 text-xs text-right">
          <div>Consciousness Computing Lab</div>
          <div>Community Commons • Beta</div>
        </div>
      </div>
    </div>
  );
}