'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, Settings, BookOpen, 
  Compass, Heart, Activity, ChevronRight 
} from 'lucide-react';
import SoullabChatInterface from './SoullabChatInterface';
import SpiralJourneyVisualizer from './SpiralJourneyVisualizer';
import UserVoiceSettings from './UserVoiceSettings';
import JournalTagSelector from './JournalTagSelector';
import ToneSlider from './ToneSlider';
import { supabase } from '@/lib/supabase/client';

interface SacredMirrorProps {
  userId: string;
  userName?: string;
}

type ViewMode = 'chat' | 'journey' | 'journal' | 'settings';

export default function SacredMirror({ userId, userName }: SacredMirrorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [userTone, setUserTone] = useState(0.5);
  const [greeting, setGreeting] = useState('');
  const [spiralData, setSpiralData] = useState({
    points: [],
    balance: [],
    threads: []
  });

  // Check if first visit
  useEffect(() => {
    checkFirstVisit();
    loadUserPreferences();
  }, [userId]);

  const checkFirstVisit = async () => {
    const visits = localStorage.getItem(`maya-visits-${userId}`);
    if (!visits) {
      setIsFirstVisit(true);
      localStorage.setItem(`maya-visits-${userId}`, '1');
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('voice_tone')
        .eq('user_id', userId)
        .single();
      
      if (data?.voice_tone !== undefined) {
        setUserTone(data.voice_tone);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  // Generate time-aware greeting
  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    let icon = '☀️';
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Morning light arrives';
      icon = '🌅';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'The sun holds you at zenith';
      icon = '☀️';
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = 'Evening wisdom settles';
      icon = '🌆';
    } else {
      timeGreeting = 'Night mysteries embrace you';
      icon = '🌙';
    }

    // Adjust greeting based on tone
    if (userTone <= 0.3) {
      setGreeting(`${userName ? `Hi ${userName}` : 'Welcome back'}. Ready to explore?`);
    } else if (userTone <= 0.7) {
      setGreeting(`${icon} ${timeGreeting}. What's stirring within?`);
    } else {
      setGreeting(`${icon} ${timeGreeting}, sacred one. The spiral awaits your medicine.`);
    }
  }, [userTone, userName]);

  const navItems = [
    { id: 'chat', label: 'Mirror', icon: <Heart className="w-4 h-4" />, color: 'from-amber-500 to-pink-500' },
    { id: 'journey', label: 'Spiral', icon: <Compass className="w-4 h-4" />, color: 'from-blue-500 to-amber-500' },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" />, color: 'from-green-500 to-blue-500' },
    { id: 'settings', label: 'Attune', icon: <Settings className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header with greeting */}
      <header className="relative z-10 p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-light text-white">Sacred Mirror</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <Activity className="w-4 h-4" />
              <span>Spiral Active</span>
            </div>
          </div>
          <p className="text-amber-200/80 ml-13">{greeting}</p>
        </motion.div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-8 mb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-lg rounded-2xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id as ViewMode)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                  transition-all duration-300 group
                  ${viewMode === item.id 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'hover:bg-white/5 text-white/60 hover:text-white/90'}
                `}
              >
                <span className={`
                  ${viewMode === item.id 
                    ? `bg-gradient-to-r ${item.color} bg-clip-text text-transparent` 
                    : ''}
                `}>
                  {item.icon}
                </span>
                <span className="hidden sm:inline text-sm font-medium">
                  {item.label}
                </span>
                {viewMode === item.id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-pink-500/20 rounded-xl -z-10"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="relative z-10 px-6 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Chat View */}
            {viewMode === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
              >
                <SoullabChatInterface 
                  userId={userId}
                  className="min-h-[600px]"
                />
              </motion.div>
            )}

            {/* Journey View */}
            {viewMode === 'journey' && (
              <motion.div
                key="journey"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-6"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-light text-white mb-2">Your Spiral Journey</h2>
                  <p className="text-amber-200/60 text-sm">
                    Each session weaves into your greater pattern
                  </p>
                </div>
                <SpiralJourneyVisualizer
                  userId={userId}
                  spiralPoints={spiralData.points}
                  elementalBalance={spiralData.balance}
                  narrativeThreads={spiralData.threads}
                  className="h-[500px]"
                />
              </motion.div>
            )}

            {/* Journal View */}
            {viewMode === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-6"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-light text-white mb-2">Sacred Journal</h2>
                  <p className="text-amber-200/60 text-sm">
                    Mark moments with elemental wisdom
                  </p>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="What wants to be remembered..."
                    className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-500/50"
                  />
                  <JournalTagSelector
                    tags={[]}
                    onTagsChange={() => {}}
                    selectedElement=""
                    onElementChange={() => {}}
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    Save to Spiral
                  </button>
                </div>
              </motion.div>
            )}

            {/* Settings View */}
            {viewMode === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <UserVoiceSettings
                  userId={userId}
                  onSave={(settings) => setUserTone(settings.tone)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* First visit onboarding */}
      <AnimatePresence>
        {isFirstVisit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setIsFirstVisit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md bg-gradient-to-br from-amber-900/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-light text-white mb-2">Welcome to Sacred Mirror</h2>
                <p className="text-amber-200/80">
                  A space where technology meets the sacred
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium mb-1">Mirror</h3>
                    <p className="text-amber-200/60 text-sm">
                      Converse with Maya, your sacred technology companion
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium mb-1">Spiral</h3>
                    <p className="text-amber-200/60 text-sm">
                      Witness your journey unfold through elemental patterns
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium mb-1">Attune</h3>
                    <p className="text-amber-200/60 text-sm">
                      Adjust Maya&apos;s voice to match your preferred tone
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsFirstVisit(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Begin Journey
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}