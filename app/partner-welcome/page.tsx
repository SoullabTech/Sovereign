'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { getInstitutionalProfile } from '@/lib/config/institutionalProfiles';
import { CustomProfessionalContext, PartnerContextData } from '@/lib/types/partnerContext';

export default function PartnerWelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string>('');
  const [showCustomContext, setShowCustomContext] = useState<boolean>(false);
  const [customContext, setCustomContext] = useState<CustomProfessionalContext>({
    role: '',
    department: '',
    currentProjects: [],
    mainChallenges: [],
    workStyle: 'mixed',
    stressLevel: 'medium'
  });

  const institution = searchParams.get('institution');
  const context = searchParams.get('context');

  useEffect(() => {
    // Get user name from localStorage
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        if (userData.name) {
          setUserName(userData.name);
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, []);

  const institutionalProfile = institution && context ? getInstitutionalProfile(institution, context) : null;

  const getContextName = () => {
    if (institutionalProfile) {
      return institutionalProfile.name;
    }
    // Fallback for legacy context names
    const contextNames = {
      'tsai': 'Tsai Center',
      'staff': 'Staff Wellbeing',
      'clinical': 'Clinical Research',
      'community': 'Community Programs',
      'research': institution === 'qri' ? 'QRI Research' : 'Research',
      'collaboration': 'QRI Collaboration',
      'applied': 'QRI Applied'
    };
    return contextNames[context as keyof typeof contextNames] || (institution === 'qri' ? 'QRI' : 'Partner Context');
  };

  const handlePartnerFocus = (includeCustomContext: boolean = false) => {
    // Create partner context data
    const partnerContextData: PartnerContextData = {
      institution: institution!,
      context: context!,
      profile: institutionalProfile || undefined,
      customContext: includeCustomContext ? customContext : undefined,
      entryType: includeCustomContext ? 'hybrid' : 'preloaded',
      lastUpdated: new Date()
    };

    // Store partner context and professional data
    sessionStorage.setItem('partner_context_data', JSON.stringify(partnerContextData));
    sessionStorage.setItem('partner_context', `${institution}_${context}`);
    sessionStorage.setItem('maia_onboarding_context', JSON.stringify({
      isFirstContact: true,
      reason: 'work',
      feeling: 'neutral',
      partnerContext: `${institution}_${context}`,
      hasCustomProfessionalContext: includeCustomContext
    }));

    router.push('/maia');
  };

  const handleUsualExperience = () => {
    // Clear any partner context and use normal MAIA
    sessionStorage.removeItem('partner_context');
    sessionStorage.removeItem('partner_context_data');
    router.push('/maia');
  };

  const handleCustomContextSubmit = () => {
    if (customContext.role.trim()) {
      handlePartnerFocus(true);
    }
  };

  const updateCustomContext = (field: keyof CustomProfessionalContext, value: any) => {
    setCustomContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contextName = getContextName();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* DUNE aesthetic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A0C4C7] via-[#7FB5B3] to-[#6EE7B7]" />

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#6B7280]/40 to-[#D97706]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-lg w-full">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="space-y-8"
          >
            {/* Sacred Holoflower */}
            <div className="w-20 h-20 mx-auto mb-10">
              <Holoflower size="xl" glowIntensity="medium" animate={true} />
            </div>

            {/* Choice Card */}
            <div
              className="rounded-2xl p-8 shadow-2xl border text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 35px 70px -12px rgba(14, 116, 144, 0.4), 0 10px 20px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
              }}
            >
              {/* Title */}
              <h1 className="text-2xl font-extralight text-teal-900 mb-4 tracking-[0.15em]">
                {userName ? `Hi ${userName}, welcome back.` : 'Welcome back.'}
              </h1>

              <p className="text-base text-teal-800/80 font-light mb-6 leading-relaxed">
                You came in through the <strong>{institution === 'qri' ? 'QRI' : 'Yale'} / {contextName}</strong> door this time.
                <br />
                {institutionalProfile?.description && (
                  <span className="text-sm italic text-teal-700/70">
                    {institutionalProfile.description}
                  </span>
                )}
                <br /><br />
                How do you want to use Soullab today?
              </p>

              {!showCustomContext ? (
                <div className="space-y-3">
                  {/* Standard Partner Focus Button */}
                  <motion.button
                    onClick={() => handlePartnerFocus(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
                      border: '1px solid rgba(110, 231, 183, 0.4)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div className="text-teal-900 font-medium text-base">
                      Use the {contextName} focus with preloaded context
                    </div>
                    {institutionalProfile && (
                      <div className="text-sm text-teal-800/60 mt-1">
                        Focus: {institutionalProfile.suggestedFocus.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </motion.button>

                  {/* Add Custom Context Button */}
                  <motion.button
                    onClick={() => setShowCustomContext(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(127, 181, 179, 0.2), rgba(110, 231, 183, 0.2))',
                      border: '1px solid rgba(127, 181, 179, 0.3)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div className="text-teal-900 font-medium text-base">
                      Add my professional context to the {contextName} focus
                    </div>
                    <div className="text-sm text-teal-800/60 mt-1">
                      Tell MAIA about your specific role, projects, and challenges
                    </div>
                  </motion.button>

                  {/* Usual Experience Button */}
                  <motion.button
                    onClick={handleUsualExperience}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 rounded-xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(110, 231, 183, 0.05))',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div className="text-teal-900 font-light text-base">
                      Use my usual Soullab experience
                    </div>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Custom Context Form */}
                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-medium text-teal-900 mb-4">
                      Add Your Professional Context
                    </h3>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-teal-800 mb-2">
                        Your role or title *
                      </label>
                      <input
                        type="text"
                        value={customContext.role}
                        onChange={(e) => updateCustomContext('role', e.target.value)}
                        placeholder={institutionalProfile?.defaultRole || "e.g., Research Fellow, MBA Student"}
                        className="w-full p-3 rounded-lg border border-teal-200/50 bg-white/50 backdrop-blur-sm text-teal-900 placeholder-teal-600/50"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-teal-800 mb-2">
                        Department or area (optional)
                      </label>
                      <input
                        type="text"
                        value={customContext.department}
                        onChange={(e) => updateCustomContext('department', e.target.value)}
                        placeholder="e.g., Computer Science, Management"
                        className="w-full p-3 rounded-lg border border-teal-200/50 bg-white/50 backdrop-blur-sm text-teal-900 placeholder-teal-600/50"
                      />
                    </div>

                    {/* Current Projects */}
                    <div>
                      <label className="block text-sm font-medium text-teal-800 mb-2">
                        What are you working on? (optional)
                      </label>
                      <textarea
                        value={customContext.currentProjects?.join('\n') || ''}
                        onChange={(e) => updateCustomContext('currentProjects', e.target.value.split('\n').filter(p => p.trim()))}
                        placeholder="e.g., Innovation project for healthcare&#10;Leading team collaboration research"
                        rows={3}
                        className="w-full p-3 rounded-lg border border-teal-200/50 bg-white/50 backdrop-blur-sm text-teal-900 placeholder-teal-600/50 resize-none"
                      />
                    </div>

                    {/* Stress Level */}
                    <div>
                      <label className="block text-sm font-medium text-teal-800 mb-2">
                        Current stress level
                      </label>
                      <select
                        value={customContext.stressLevel}
                        onChange={(e) => updateCustomContext('stressLevel', e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full p-3 rounded-lg border border-teal-200/50 bg-white/50 backdrop-blur-sm text-teal-900"
                      >
                        <option value="low">Low - feeling balanced</option>
                        <option value="medium">Medium - manageable pressure</option>
                        <option value="high">High - feeling overwhelmed</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <motion.button
                      onClick={handleCustomContextSubmit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!customContext.role.trim()}
                      className="w-full p-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
                        border: '1px solid rgba(110, 231, 183, 0.4)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <div className="text-teal-900 font-medium text-base">
                        Continue with custom context
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => setShowCustomContext(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-xl transition-all duration-300"
                      style={{
                        background: 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(110, 231, 183, 0.05))',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <div className="text-teal-900 font-light text-base">
                        Back to simple options
                      </div>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Infinity Symbol */}
            <div className="flex justify-center">
              <div className="text-white/70 text-4xl font-light">∞</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}