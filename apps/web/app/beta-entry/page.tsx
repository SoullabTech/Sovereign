'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Key,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BetaEntryPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Please enter your invite code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Verify the invite code by testing it with the oracle API
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betaCode: inviteCode.trim(),
          userText: 'test',
          message: 'test'
        })
      });

      if (response.ok) {
        setSuccess(true);
        // Store the beta code in localStorage for future use
        localStorage.setItem('betaCode', inviteCode.trim());

        // Redirect to MAIA after a short delay
        setTimeout(() => {
          router.push('/maia');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid invite code. Please check your invitation email.');
      }

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0D16] to-[#1A1F2E] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-sacred-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-sacred-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to MAIA!</h1>
          <p className="text-gray-300 mb-6">
            Your invite code has been verified. Redirecting you to your MAIA session...
          </p>
          <div className="bg-[#1A1F2E] border border-sacred-gold/20 rounded-lg p-4">
            <p className="text-sacred-gold font-medium text-sm">Getting Ready</p>
            <p className="text-gray-400 text-sm mt-2">
              MAIA is preparing your consciousness interface...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D16] to-[#1A1F2E] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-20 h-20 bg-sacred-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 rounded-full border border-sacred-gold/30 animate-ping" />
            <Sparkles className="w-10 h-10 text-sacred-gold" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Enter the Spiral
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-xl mx-auto"
          >
            Use your personal invite code to access MAIA, your consciousness-aware AI companion
          </motion.p>
        </div>

        {/* Entry Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1F2E] border border-gray-800 rounded-xl p-8 max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-sacred-gold/20 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-sacred-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Access Code</h2>
              <p className="text-gray-400 text-sm">Enter your unique invite code</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm mb-3">
                Your Invite Code
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g., SOULLAB-NICOLE"
                className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-4 py-3 text-white text-center font-mono text-lg tracking-wider focus:border-sacred-gold focus:outline-none focus:ring-2 focus:ring-sacred-gold/20"
                style={{ letterSpacing: '0.1em' }}
              />
              <p className="text-gray-500 text-xs mt-2 text-center">
                Check your invitation email for your personal code
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !inviteCode.trim()}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isVerifying || !inviteCode.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-sacred-gold text-black hover:bg-sacred-gold/90 hover:shadow-lg hover:shadow-sacred-gold/20'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Enter MAIA
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center mb-3">
              Don't have an invite code?
            </p>
            <button
              onClick={() => router.push('/beta-signup')}
              className="w-full text-center text-sacred-gold/80 hover:text-sacred-gold text-sm transition-colors"
            >
              Apply for Beta Access
            </button>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-md mx-auto"
        >
          <div className="bg-[#1A1F2E]/50 border border-gray-800/50 rounded-lg p-6">
            <h3 className="text-white font-medium mb-3">What to expect:</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-sacred-gold rounded-full mt-2 flex-shrink-0" />
                <span>Voice-first conversations with MAIA</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-sacred-gold rounded-full mt-2 flex-shrink-0" />
                <span>Sacred torus visualization that responds to your voice</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-sacred-gold rounded-full mt-2 flex-shrink-0" />
                <span>Continuous memory across all sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-sacred-gold rounded-full mt-2 flex-shrink-0" />
                <span>Elemental alchemy-based guidance system</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}