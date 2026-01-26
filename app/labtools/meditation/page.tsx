'use client';

/**
 * Meditation Laboratory
 *
 * Access to meditation practices, consciousness evolution tracking,
 * and awakening progress monitoring.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Brain, Heart, Flame, Droplets, Mountain, Wind, CircleDot } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the meditation platform
const MeditationAwakeningPlatform = dynamic(
  () => import('@/components/consciousness/MeditationAwakeningPlatform'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center"
          >
            <CircleDot className="w-8 h-8 text-purple-400" />
          </motion.div>
          <p className="text-slate-400 animate-pulse">Preparing sacred space...</p>
        </motion.div>
      </div>
    )
  }
);

export default function MeditationLabPage() {
  const router = useRouter();
  const [showPlatform, setShowPlatform] = useState(false);
  const [userName, setUserName] = useState('Seeker');

  useEffect(() => {
    const storedName = localStorage.getItem('explorerName');
    if (storedName) setUserName(storedName);
  }, []);

  if (showPlatform) {
    return (
      <div className="min-h-screen relative">
        {/* Back button overlay */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setShowPlatform(false)}
            className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-black/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Exit Meditation</span>
          </button>
        </div>
        <MeditationAwakeningPlatform />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Meditation background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Central glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-400/30"
            style={{
              width: 2,
              height: 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Labs</span>
          </button>

          <div className="flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-purple-400" />
            <span className="text-slate-300 text-sm font-medium">Meditation Laboratory</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Welcome */}
          <div className="text-center mb-12 mt-8">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Brain className="w-12 h-12 text-purple-400" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-light text-white mb-3">
              Welcome, {userName}
            </h1>
            <p className="text-slate-400 max-w-md mx-auto">
              The meditation laboratory offers consciousness evolution practices
              with sacred geometry, elemental guidance, and awakening tracking.
            </p>
          </div>

          {/* Practice Types Preview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { icon: Heart, label: 'Presence', color: 'text-rose-400', bg: 'bg-rose-500/20' },
              { icon: Sparkles, label: 'Loving-Kindness', color: 'text-pink-400', bg: 'bg-pink-500/20' },
              { icon: CircleDot, label: 'Unity', color: 'text-purple-400', bg: 'bg-purple-500/20' },
              { icon: Brain, label: 'Wisdom', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
              { icon: Flame, label: 'Sacred Geometry', color: 'text-amber-400', bg: 'bg-amber-500/20' },
            ].map((practice, i) => (
              <motion.div
                key={practice.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 ${practice.bg} rounded-xl border border-white/10 text-center`}
              >
                <practice.icon className={`w-6 h-6 ${practice.color} mx-auto mb-2`} />
                <span className="text-xs text-slate-300">{practice.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Elemental Guidance */}
          <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-lg font-medium text-white mb-4">Elemental Guidance</h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { icon: Flame, label: 'Fire', color: 'text-orange-400' },
                { icon: Droplets, label: 'Water', color: 'text-blue-400' },
                { icon: Mountain, label: 'Earth', color: 'text-emerald-400' },
                { icon: Wind, label: 'Air', color: 'text-cyan-400' },
                { icon: Sparkles, label: 'Aether', color: 'text-purple-400' },
              ].map((element) => (
                <div key={element.label} className="text-center">
                  <element.icon className={`w-5 h-5 ${element.color} mx-auto mb-1`} />
                  <span className="text-xs text-slate-400">{element.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enter Button */}
          <motion.button
            onClick={() => setShowPlatform(true)}
            className="w-full p-6 bg-gradient-to-r from-purple-600/30 via-violet-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:via-violet-600/40 hover:to-indigo-600/40 border border-purple-500/40 hover:border-purple-400/60 rounded-2xl transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <CircleDot className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Enter Meditation Platform</h2>
                <p className="text-slate-400 text-sm">Begin your consciousness evolution journey</p>
              </div>
            </div>
          </motion.button>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              The platform includes McGilchrist hemispheric attending analysis,
              sacred geometry visualization, and thermodynamic efficiency tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
