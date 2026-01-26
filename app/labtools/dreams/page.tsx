'use client';

/**
 * Dreams Laboratory
 *
 * Access to dream journaling, morning capture, and sleep pattern analysis.
 * Connects existing DreamJournalInterface and MorningDreamCaptureInterface components.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Moon,
  Sunrise,
  BookOpen,
  Mic,
  PenTool,
  Sparkles,
  Clock,
  Brain,
  Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the dream components to avoid SSR issues with speech recognition
const DreamJournalInterface = dynamic(
  () => import('@/components/dreams/DreamJournalInterface'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 animate-pulse">Loading Dream Journal...</div>
      </div>
    )
  }
);

const MorningDreamCaptureInterface = dynamic(
  () => import('@/components/dreams/MorningDreamCaptureInterface'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 animate-pulse">Loading Morning Capture...</div>
      </div>
    )
  }
);

type DreamMode = 'select' | 'morning' | 'journal';

export default function DreamsLabPage() {
  const router = useRouter();
  const [mode, setMode] = useState<DreamMode>('select');
  const [userName, setUserName] = useState('Dreamer');
  const [timeGreeting, setTimeGreeting] = useState('');

  useEffect(() => {
    // Get user name
    const storedName = localStorage.getItem('explorerName');
    if (storedName) setUserName(storedName);

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setTimeGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setTimeGreeting('Good afternoon');
    } else if (hour >= 17 && hour < 21) {
      setTimeGreeting('Good evening');
    } else {
      setTimeGreeting('Deep night greetings');
    }
  }, []);

  const handleDreamCaptured = async (content: string, captureMode: 'voice' | 'text') => {
    console.log('Dream captured:', { content, mode: captureMode });
    // TODO: Save to local storage or API
    const dreams = JSON.parse(localStorage.getItem('maia_dreams') || '[]');
    dreams.push({
      content,
      captureMode,
      timestamp: new Date().toISOString(),
      id: `dream_${Date.now()}`
    });
    localStorage.setItem('maia_dreams', JSON.stringify(dreams));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Dreamy background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(${
                i % 2 === 0 ? '147, 197, 253' : '196, 181, 253'
              }, ${Math.random() * 0.4 + 0.1}) 0%, transparent 70%)`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
          <button
            onClick={() => mode === 'select' ? router.push('/labtools') : setMode('select')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{mode === 'select' ? 'Back to Labs' : 'Dream Selection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-slate-300 text-sm font-medium">Dreams Laboratory</span>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 max-w-4xl mx-auto"
            >
              {/* Welcome */}
              <div className="text-center mb-12 mt-8">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Moon className="w-10 h-10 text-indigo-400" />
                  </div>
                </motion.div>

                <h1 className="text-3xl font-light text-white mb-3">
                  {timeGreeting}, {userName}
                </h1>
                <p className="text-slate-400 max-w-md mx-auto">
                  The dream realm holds wisdom from your unconscious mind.
                  Capture and explore the messages from within.
                </p>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Morning Capture */}
                <motion.button
                  onClick={() => setMode('morning')}
                  className="group p-8 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20 backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/50 rounded-2xl text-left transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Sunrise className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-2">Morning Capture</h2>
                      <p className="text-slate-400 text-sm mb-4">
                        Quick voice or text capture for those fleeting dream memories upon waking.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                          <Mic className="w-3 h-3" /> Voice
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                          <PenTool className="w-3 h-3" /> Text
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Quick
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Full Journal */}
                <motion.button
                  onClick={() => setMode('journal')}
                  className="group p-8 bg-gradient-to-br from-purple-600/20 via-violet-600/10 to-indigo-600/20 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 rounded-2xl text-left transition-all"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <BookOpen className="w-7 h-7 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-2">Dream Journal</h2>
                      <p className="text-slate-400 text-sm mb-4">
                        Full dream journaling with archetypal analysis, pattern recognition, and sleep tracking.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Analysis
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Lucidity
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Archetypes
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Recent Dreams Summary */}
              <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Dream Wisdom
                </h3>
                <p className="text-slate-400 text-sm">
                  "Dreams are the guiding words of the soul." — Carl Jung
                </p>
                <p className="text-slate-500 text-xs mt-4">
                  Your dreams are stored locally on your device, honoring your sovereignty.
                </p>
              </div>
            </motion.div>
          )}

          {mode === 'morning' && (
            <motion.div
              key="morning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[calc(100vh-64px)]"
            >
              <MorningDreamCaptureInterface
                onDreamCaptured={handleDreamCaptured}
                userName={userName}
              />
            </motion.div>
          )}

          {mode === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <DreamJournalInterface />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
