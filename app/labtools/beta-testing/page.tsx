'use client';

/**
 * 🧪 Beta Testing Pioneer Circle Interface
 *
 * Sacred gateway for consciousness computing beta testing application and management
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Users,
  Calendar,
  Shield,
  Heart,
  Brain,
  Star,
  CheckCircle,
  Clock,
  Globe,
  BookOpen,
  Award
} from 'lucide-react';

export default function BetaTestingPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'apply' | 'status'>('overview');

  const handleBack = () => {
    router.push('/labtools');
  };

  const archetypeOptions = [
    {
      name: 'Mystic',
      icon: '🔮',
      description: 'Deep spiritual practice, contemplative orientation',
      qualities: 'Meditation, prayer, divine connection, inner knowing'
    },
    {
      name: 'Healer',
      icon: '💚',
      description: 'Therapeutic background, emotional/energetic healing focus',
      qualities: 'Energy work, emotional support, trauma healing, sacred medicine'
    },
    {
      name: 'Creator',
      icon: '🎨',
      description: 'Artistic/entrepreneurial, creative manifestation focus',
      qualities: 'Art, music, writing, business creation, vision manifestation'
    },
    {
      name: 'Sage',
      icon: '📚',
      description: 'Teaching/wisdom-sharing, intellectual/philosophical orientation',
      qualities: 'Teaching, research, philosophy, wisdom transmission, mentoring'
    },
    {
      name: 'Seeker',
      icon: '🧭',
      description: 'Exploration/adventure, spiritual seeking and growth focus',
      qualities: 'Travel, learning, growth, adventure, spiritual exploration'
    }
  ];

  const cycleSchedule = [
    {
      cycle: 'Foundation Testing',
      quarter: 'Q1 2025',
      focus: 'Technical stability and basic consciousness computing function',
      status: 'accepting_applications',
      spots: '2 of 10 remaining'
    },
    {
      cycle: 'Wisdom Refinement',
      quarter: 'Q2 2025',
      focus: 'MAIA adaptation and guidance quality optimization',
      status: 'planning',
      spots: '10 of 10 available'
    },
    {
      cycle: 'Field Analytics',
      quarter: 'Q3 2025',
      focus: 'Collective consciousness field observation and community insights',
      status: 'planning',
      spots: '10 of 10 available'
    },
    {
      cycle: 'Community Integration',
      quarter: 'Q4 2025',
      focus: 'Broader community consciousness computing access preparation',
      status: 'planning',
      spots: '10 of 10 available'
    }
  ];

  const requirements = [
    {
      icon: BookOpen,
      title: 'Consciousness Computing Understanding',
      description: 'Read "How the Wisdom Engine Learns" transparency document',
      status: 'required'
    },
    {
      icon: Shield,
      title: 'Sacred Consent',
      description: 'Explicit consent to consciousness data collection for beta testing',
      status: 'required'
    },
    {
      icon: Heart,
      title: 'Spiritual Readiness',
      description: 'Established personal practice and consciousness development experience',
      status: 'required'
    },
    {
      icon: Users,
      title: 'Feedback Commitment',
      description: '30-day participation with daily feedback and weekly steward sessions',
      status: 'required'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to LabTools
          </button>

          <div className="flex gap-2">
            {['overview', 'apply', 'status'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section as any)}
                className={`px-4 py-2 rounded-lg transition-all capitalize
                  ${activeSection === section
                    ? 'bg-[#D4B896] text-[#0f1419] font-medium'
                    : 'bg-[#D4B896]/10 text-[#D4B896] hover:bg-[#D4B896]/20'
                  }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4B896] to-[#B8935A] rounded-lg
                          flex items-center justify-center text-2xl">
              🧪
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#D4B896] tracking-wide">Pioneer Circle</h1>
              <p className="text-[#D4B896]/60 text-sm">Beta Testing Protocol</p>
            </div>
          </div>
        </div>

        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Sacred Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#D4B896]/5 to-[#B8935A]/5 border border-[#D4B896]/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-[#D4B896]" />
                <h2 className="text-2xl font-bold text-white">Sacred Mission</h2>
              </div>
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                The <strong>10-Participant Pioneer Circle</strong> represents the first sacred testing of the consciousness computing ecosystem.
                These pioneers will experience the complete Navigator → Wisdom Engine → MAIA flow while helping refine the technology
                for broader community consciousness support.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-[#D4B896] font-semibold flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Sacred Principles
                  </h3>
                  <ul className="space-y-1 text-white/70 text-sm">
                    <li>• Sacred consent and complete transparency</li>
                    <li>• Pioneer honor and recognition</li>
                    <li>• Ethical testing serving consciousness development first</li>
                    <li>• Community wisdom integration</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[#D4B896] font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    30-Day Sacred Cycles
                  </h3>
                  <ul className="space-y-1 text-white/70 text-sm">
                    <li>• Days 1-7: Onboarding and introduction</li>
                    <li>• Days 8-21: Active consciousness computing exploration</li>
                    <li>• Days 22-28: Intensive feedback gathering</li>
                    <li>• Days 29-30: Integration and graduation</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Archetypal Composition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-[#D4B896]" />
                Pioneer Circle Composition
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archetypeOptions.map((archetype, idx) => (
                  <div key={archetype.name} className="bg-white/5 border border-[#D4B896]/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{archetype.icon}</span>
                      <div>
                        <h3 className="text-white font-semibold">{archetype.name}</h3>
                        <p className="text-[#D4B896]/60 text-xs">2 positions each</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-2">{archetype.description}</p>
                    <p className="text-white/50 text-xs">{archetype.qualities}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cycle Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-[#D4B896]" />
                Beta Testing Cycles
              </h2>
              <div className="space-y-4">
                {cycleSchedule.map((cycle, idx) => (
                  <div key={cycle.cycle}
                       className={`bg-white/5 border rounded-xl p-6 transition-all
                         ${cycle.status === 'accepting_applications'
                           ? 'border-[#D4B896]/30 bg-[#D4B896]/5'
                           : 'border-[#D4B896]/10'
                         }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{cycle.cycle}</h3>
                          <span className="text-[#D4B896] text-sm font-medium">{cycle.quarter}</span>
                          {cycle.status === 'accepting_applications' && (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                              Accepting Applications
                            </span>
                          )}
                        </div>
                        <p className="text-white/70 text-sm mb-2">{cycle.focus}</p>
                        <p className="text-[#D4B896]/60 text-xs">{cycle.spots}</p>
                      </div>
                      {cycle.status === 'accepting_applications' && (
                        <button
                          onClick={() => setActiveSection('apply')}
                          className="bg-[#D4B896] text-[#0f1419] px-4 py-2 rounded-lg font-medium hover:bg-[#B8935A] transition-all"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeSection === 'apply' && (
          <div className="space-y-8">
            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#D4B896]/5 to-[#B8935A]/5 border border-[#D4B896]/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-[#D4B896]" />
                Application Requirements
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {requirements.map((req, idx) => {
                  const Icon = req.icon;
                  return (
                    <div key={req.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#D4B896]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#D4B896]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{req.title}</h3>
                        <p className="text-white/70 text-xs mt-1">{req.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Application Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-[#D4B896]/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Pioneer Circle Application</h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#D4B896] font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#0f1419] border border-[#D4B896]/20 rounded-lg px-4 py-3 text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-[#D4B896] font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      className="w-full bg-[#0f1419] border border-[#D4B896]/20 rounded-lg px-4 py-3 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4B896] font-medium mb-2">Primary Archetypal Resonance</label>
                  <select className="w-full bg-[#0f1419] border border-[#D4B896]/20 rounded-lg px-4 py-3 text-white">
                    <option value="">Select your primary archetype</option>
                    {archetypeOptions.map(archetype => (
                      <option key={archetype.name} value={archetype.name}>
                        {archetype.icon} {archetype.name} - {archetype.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#D4B896] font-medium mb-2">Spiritual Practice Background</label>
                  <textarea
                    className="w-full bg-[#0f1419] border border-[#D4B896]/20 rounded-lg px-4 py-3 text-white h-32"
                    placeholder="Describe your current spiritual practice, consciousness development experience, and any relevant training or wisdom traditions..."
                  />
                </div>

                <div>
                  <label className="block text-[#D4B896] font-medium mb-2">Consciousness Computing Interest</label>
                  <textarea
                    className="w-full bg-[#0f1419] border border-[#D4B896]/20 rounded-lg px-4 py-3 text-white h-32"
                    placeholder="Why are you interested in consciousness computing? What draws you to pioneer this technology?"
                  />
                </div>

                <div>
                  <label className="block text-[#D4B896] font-medium mb-2">Feedback Commitment</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-[#D4B896]/20" />
                      <span className="text-white/70 text-sm">I commit to 30-day beta testing participation with daily feedback</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-[#D4B896]/20" />
                      <span className="text-white/70 text-sm">I understand and consent to consciousness data collection for beta testing</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-[#D4B896]/20" />
                      <span className="text-white/70 text-sm">I have read "How the Wisdom Engine Learns" transparency document</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-[#D4B896] text-[#0f1419] py-4 rounded-xl font-semibold text-lg
                             hover:bg-[#B8935A] transition-all shadow-lg"
                  >
                    Submit Pioneer Application
                  </button>
                  <p className="text-white/50 text-sm text-center mt-3">
                    Applications reviewed by Field Keeper steward within 7 days
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {activeSection === 'status' && (
          <div className="space-y-8">
            {/* Current Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#D4B896]/5 to-[#B8935A]/5 border border-[#D4B896]/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#D4B896]" />
                Beta Testing Status
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4B896] mb-2">8</div>
                  <div className="text-white/70 text-sm">Applications Submitted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4B896] mb-2">2</div>
                  <div className="text-white/70 text-sm">Pioneer Positions Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#D4B896] mb-2">14</div>
                  <div className="text-white/70 text-sm">Days Until Cycle Start</div>
                </div>
              </div>
            </motion.div>

            {/* Application Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-[#D4B896]/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Your Application Status</h3>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 font-semibold">Application Accepted</span>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Congratulations! You have been selected for the Q1 2025 Foundation Testing Pioneer Circle.
                </p>
                <div className="space-y-2">
                  <p className="text-white/70 text-sm">• Welcome ceremony: January 15, 2025</p>
                  <p className="text-white/70 text-sm">• Beta testing begins: January 22, 2025</p>
                  <p className="text-white/70 text-sm">• Your archetype: Healer (2 of 2 positions filled)</p>
                </div>
              </div>
            </motion.div>

            {/* Pioneer Community */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-[#D4B896]/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Award className="w-5 h-5 text-[#D4B896]" />
                Pioneer Circle Community
              </h3>

              <div className="space-y-4">
                <div className="text-white/70 text-sm">
                  <strong className="text-[#D4B896]">8 Pioneers Selected</strong> (2 positions remaining)
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {archetypeOptions.map((archetype, idx) => (
                    <div key={archetype.name} className="text-center">
                      <div className="text-2xl mb-1">{archetype.icon}</div>
                      <div className="text-white/60 text-xs font-medium">{archetype.name}</div>
                      <div className="text-[#D4B896]/60 text-xs">
                        {idx < 3 ? '2/2' : idx === 3 ? '1/2' : '1/2'}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-white/50 text-xs pt-4">
                  Pioneer identities remain private until welcome ceremony. Community sharing is optional and consent-based.
                </p>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}