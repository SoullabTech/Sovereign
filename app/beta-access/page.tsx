'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Shield, Star, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export default function BetaAccessPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const validatePasscode = () => {
    setIsValidating(true);
    setError('');

    // Check for SOULLAB-[name] format
    const passcodeTrimmed = passcode.trim().toUpperCase();

    if (!passcodeTrimmed.startsWith('SOULLAB-')) {
      setError('Invalid passcode format. Use: SOULLAB-[YourName]');
      setIsValidating(false);
      return;
    }

    const name = passcodeTrimmed.replace('SOULLAB-', '');

    if (name.length < 2) {
      setError('Please provide a valid name after SOULLAB-');
      setIsValidating(false);
      return;
    }

    // Activate premium access for the beta tester
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 90); // 90 days beta access

    const betaUser = {
      id: `beta-${Date.now()}`,
      name: name.replace(/[-_]/g, ' '),
      subscription: {
        status: 'active',
        tier: 'premium',
        expiresAt: expiresAt.toISOString(),
        features: [
          'lab_tools',
          'community_commons',
          'voice_synthesis',
          'brain_trust',
          'advanced_oracle',
          'field_protocol',
          'scribe_mode',
          'birth_chart',
          'elder_council'
        ],
        planId: 'beta-premium',
        customerId: `beta-${name.toLowerCase()}`
      },
      createdAt: now.toISOString(),
      lastActive: now.toISOString()
    };

    // Store in localStorage
    localStorage.setItem('maia_user_subscription', JSON.stringify(betaUser));

    // Store in beta testers list
    const existingTesters = JSON.parse(localStorage.getItem('maia_beta_testers') || '[]');
    const updatedTesters = [...existingTesters, {
      ...betaUser,
      addedAt: now.toISOString(),
      notes: `Activated via passcode: ${passcodeTrimmed}`
    }];
    localStorage.setItem('maia_beta_testers', JSON.stringify(updatedTesters));

    setTimeout(() => {
      setIsValidating(false);
      // Redirect to MAIA with success message
      router.push('/maia?welcome=beta');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validatePasscode();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-8 text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-amber-100 mb-2">MAIA Beta Access</h1>
            <p className="text-amber-300/70">
              Enter your SOULLAB passcode to unlock premium features
            </p>
          </div>

          {/* Access Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2 text-left">
                Beta Passcode
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="SOULLAB-YourName"
                  className="w-full px-4 py-3 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                  disabled={isValidating}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 text-left">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!passcode.trim() || isValidating}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-amber-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-50 border-t-transparent rounded-full animate-spin" />
                  Activating Access...
                </>
              ) : (
                <>
                  Activate Premium Access
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Beta Features Preview */}
          <div className="mt-8 pt-6 border-t border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-100 mb-4">Premium Features Include:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Lab Tools
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Community Commons
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Voice Synthesis
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Brain Trust
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Advanced Oracle
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Field Protocol
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Elder Council
              </div>
              <div className="flex items-center gap-2 text-amber-300/80">
                <Star className="w-4 h-4 text-amber-400" />
                Member Access
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-amber-500/20">
            <p className="text-amber-300/50 text-xs">
              Beta access provides 90 days of premium features
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}