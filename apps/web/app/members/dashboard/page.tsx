"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Video,
  Heart,
  BookOpen,
  Users,
  Sparkles,
  Clock,
  TrendingUp,
  Moon,
  Sun,
  Waves,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface MemberData {
  id: string;
  name: string;
  email: string;
  energyType: 'solar' | 'lunar' | 'elemental';
  primaryElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  joinedDate: string;
  totalSessions: number;
  nextSession?: {
    date: string;
    time: string;
    type: string;
  };
  recentInsights: string[];
  transformationProgress: {
    emotional: number;
    spiritual: number;
    relational: number;
    somatic: number;
  };
}

export default function MemberDashboardPage() {
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch member data - for now using mock data
    setTimeout(() => {
      setMemberData({
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        energyType: 'lunar',
        primaryElement: 'water',
        joinedDate: '2024-01-15',
        totalSessions: 8,
        nextSession: {
          date: '2024-11-20',
          time: '2:00 PM',
          type: 'Personal Growth Session'
        },
        recentInsights: [
          'Deep emotional release around childhood patterns',
          'Breakthrough in creative expression',
          'New awareness of somatic holding patterns'
        ],
        transformationProgress: {
          emotional: 75,
          spiritual: 60,
          relational: 85,
          somatic: 40
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const getEnergyIcon = (type: string) => {
    switch (type) {
      case 'solar': return Sun;
      case 'lunar': return Moon;
      case 'elemental': return Waves;
      default: return Sparkles;
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'from-red-500 to-orange-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      case 'earth': return 'from-green-600 to-emerald-500';
      case 'air': return 'from-purple-400 to-pink-400';
      case 'aether': return 'from-indigo-500 to-purple-600';
      default: return 'from-jade-glow to-jade-ocean';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-jade-glow to-jade-ocean rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-jade-whisper" />
          </div>
          <p className="text-jade-whisper/80">Loading your sacred space...</p>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night flex items-center justify-center">
        <div className="text-center">
          <p className="text-jade-whisper/80">Unable to load member data</p>
          <Link
            href="/auth/signin"
            className="text-jade-glow hover:text-jade-ocean mt-4 inline-block"
          >
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  const EnergyIcon = getEnergyIcon(memberData.energyType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-jade-whisper mb-2">
              Welcome back, {memberData.name.split(' ')[0]}
            </h1>
            <p className="text-jade-whisper/70 text-lg">
              Your transformation journey continues...
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-jade-whisper/10 rounded-lg px-4 py-2 border border-jade-whisper/20">
              <EnergyIcon className="w-5 h-5 text-jade-glow" />
              <span className="text-jade-whisper capitalize">{memberData.energyType}</span>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getElementColor(memberData.primaryElement)} flex items-center justify-center`}>
              <span className="text-white font-bold">{memberData.primaryElement[0].toUpperCase()}</span>
            </div>
            <Link
              href="/members/settings"
              className="p-2 bg-jade-whisper/10 rounded-lg border border-jade-whisper/20 hover:bg-jade-whisper/20 transition-colors"
            >
              <Settings className="w-5 h-5 text-jade-whisper/70" />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/10"
            >
              <h2 className="text-2xl font-bold text-jade-whisper mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link
                  href="/book/enhanced"
                  className="group p-4 bg-jade-whisper/10 rounded-xl border border-jade-whisper/20 hover:bg-jade-glow/20 hover:border-jade-glow transition-all duration-200"
                >
                  <Calendar className="w-8 h-8 text-jade-glow mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-jade-whisper">Book Session</div>
                  <div className="text-sm text-jade-whisper/70">Schedule your next meeting</div>
                </Link>

                <Link
                  href="/session/join"
                  className="group p-4 bg-jade-whisper/10 rounded-xl border border-jade-whisper/20 hover:bg-jade-glow/20 hover:border-jade-glow transition-all duration-200"
                >
                  <Video className="w-8 h-8 text-jade-glow mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-jade-whisper">Join Session</div>
                  <div className="text-sm text-jade-whisper/70">Enter video call</div>
                </Link>

                <Link
                  href="/members/library"
                  className="group p-4 bg-jade-whisper/10 rounded-xl border border-jade-whisper/20 hover:bg-jade-glow/20 hover:border-jade-glow transition-all duration-200"
                >
                  <BookOpen className="w-8 h-8 text-jade-glow mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-jade-whisper">Library</div>
                  <div className="text-sm text-jade-whisper/70">Session recordings & resources</div>
                </Link>

                <Link
                  href="/members/community"
                  className="group p-4 bg-jade-whisper/10 rounded-xl border border-jade-whisper/20 hover:bg-jade-glow/20 hover:border-jade-glow transition-all duration-200"
                >
                  <Users className="w-8 h-8 text-jade-glow mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-jade-whisper">Community</div>
                  <div className="text-sm text-jade-whisper/70">Connect with others</div>
                </Link>

                <Link
                  href="/members/astrology"
                  className="group p-4 bg-jade-whisper/10 rounded-xl border border-jade-whisper/20 hover:bg-jade-glow/20 hover:border-jade-glow transition-all duration-200"
                >
                  <Sparkles className="w-8 h-8 text-jade-glow mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold text-jade-whisper">Astrology</div>
                  <div className="text-sm text-jade-whisper/70">Cosmic profile & chart</div>
                </Link>
              </div>
            </motion.div>

            {/* Transformation Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/10"
            >
              <h2 className="text-2xl font-bold text-jade-whisper mb-6">Transformation Progress</h2>
              <div className="space-y-6">
                {Object.entries(memberData.transformationProgress).map(([area, progress]) => (
                  <div key={area}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-jade-whisper capitalize font-medium">{area}</span>
                      <span className="text-jade-glow text-sm">{progress}%</span>
                    </div>
                    <div className="w-full bg-jade-whisper/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-2 bg-gradient-to-r from-jade-glow to-jade-ocean rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-jade-glow/10 rounded-lg border border-jade-glow/20">
                <div className="flex items-center gap-2 text-jade-glow">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Growth Insight</span>
                </div>
                <p className="text-jade-whisper/80 mt-2">
                  Your relational awareness has grown significantly. Consider exploring deeper patterns in your next session.
                </p>
              </div>
            </motion.div>

            {/* Recent Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/10"
            >
              <h2 className="text-2xl font-bold text-jade-whisper mb-6">Recent Insights</h2>
              <div className="space-y-4">
                {memberData.recentInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-jade-whisper/5 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-jade-glow rounded-full mt-2 flex-shrink-0" />
                    <p className="text-jade-whisper/80">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Session */}
            {memberData.nextSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/10"
              >
                <h3 className="text-xl font-bold text-jade-whisper mb-4">Next Session</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-jade-glow" />
                    <span className="text-jade-whisper">{new Date(memberData.nextSession.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-jade-glow" />
                    <span className="text-jade-whisper">{memberData.nextSession.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-jade-glow" />
                    <span className="text-jade-whisper">{memberData.nextSession.type}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-jade-whisper/20">
                  <Link
                    href="/session/prepare"
                    className="w-full bg-jade-glow text-jade-night px-4 py-2 rounded-lg hover:bg-jade-ocean transition-colors font-semibold text-center block"
                  >
                    Prepare for Session
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/10"
            >
              <h3 className="text-xl font-bold text-jade-whisper mb-4">Your Journey</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-jade-whisper/5 rounded-lg">
                  <div className="text-3xl font-bold text-jade-glow">{memberData.totalSessions}</div>
                  <div className="text-jade-whisper/70">Total Sessions</div>
                </div>
                <div className="text-center p-4 bg-jade-whisper/5 rounded-lg">
                  <div className="text-3xl font-bold text-jade-glow">
                    {Math.floor((new Date().getTime() - new Date(memberData.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-jade-whisper/70">Days of Growth</div>
                </div>
              </div>
            </motion.div>

            {/* Integration Practices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-jade-whisper/5 backdrop-blur-xl rounded-2xl p-6 border border-jade-whisper/10"
            >
              <h3 className="text-xl font-bold text-jade-whisper mb-4">Today's Practice</h3>
              <div className="p-4 bg-jade-glow/10 rounded-lg border border-jade-glow/20">
                <div className="flex items-center gap-2 mb-2">
                  <Waves className="w-5 h-5 text-jade-glow" />
                  <span className="font-semibold text-jade-whisper">Water Element Meditation</span>
                </div>
                <p className="text-jade-whisper/80 text-sm mb-3">
                  Connect with your primary water element through a 10-minute flowing breath practice.
                </p>
                <button className="w-full bg-jade-whisper/20 text-jade-whisper px-3 py-2 rounded-lg hover:bg-jade-whisper/30 transition-colors text-sm">
                  Start Practice
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}