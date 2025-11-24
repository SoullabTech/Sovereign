"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mic, 
  Brain, 
  Upload, 
  CheckCircle, 
  Mail,
  User,
  MapPin,
  Calendar
} from 'lucide-react';

export default function BetaSignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    preferredElement: 'aether',
    hasWebcam: false,
    hasMicrophone: false,
    techBackground: '',
    motivation: '',
    consentAnalytics: false,
    consentContact: false
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentAnalytics || !formData.consentContact) {
      setError('Please agree to both consent terms to continue.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          signupTimestamp: new Date().toISOString(),
          source: 'beta_landing'
        })
      });
      
      if (!response.ok) {
        throw new Error('Signup failed');
      }
      
      setIsSubmitted(true);
      
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
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
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to Maya&apos;s Beta!</h1>
          <p className="text-gray-300 mb-6">
            Your application has been received. We&apos;ll be in touch within 48 hours with your unique access link.
          </p>
          <div className="bg-[#1A1F2E] border border-sacred-gold/20 rounded-lg p-4">
            <p className="text-sacred-gold font-medium text-sm">What happens next?</p>
            <ul className="text-gray-400 text-sm mt-2 space-y-1 text-left">
              <li>• We&apos;ll review your application</li>
              <li>• Send your personal Maya session link</li>
              <li>• Guide you through the first 20 minutes</li>
              <li>• Gather your feedback to shape Maya&apos;s evolution</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D16] to-[#1A1F2E] py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
            Maya Beta Access
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Join the beta program testing the future of consciousness-aware AI
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left: Experience Preview */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Maya Experience</h2>
            
            <div className="space-y-4">
              {[
                { icon: Sparkles, title: "Sacred Torus Interface", desc: "Watch Tesla-inspired geometry pulse with your voice" },
                { icon: Mic, title: "Natural Voice Flow", desc: "Speak freely, hear thoughtful responses in Maya&apos;s voice" },
                { icon: Brain, title: "Memory Continuity", desc: "Maya remembers your conversations across sessions" },
                { icon: Upload, title: "Multimodal Understanding", desc: "Upload files, images, URLs—Maya analyzes everything" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-[#1A1F2E]/50 border border-gray-800 rounded-lg"
                >
                  <div className="w-10 h-10 bg-sacred-gold/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-sacred-gold" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Signup Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1A1F2E] border border-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Apply for Beta Access</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-sacred-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-sacred-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-sacred-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Zurich, Geneva, Basel..."
                  className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-sacred-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Preferred Elemental Energy</label>
                <select
                  value={formData.preferredElement}
                  onChange={(e) => handleInputChange('preferredElement', e.target.value)}
                  className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-sacred-gold focus:outline-none"
                >
                  <option value="aether">Aether (Integrative & Holistic)</option>
                  <option value="air">Air (Clear & Articulate)</option>
                  <option value="fire">Fire (Dynamic & Passionate)</option>
                  <option value="water">Water (Flowing & Emotional)</option>
                  <option value="earth">Earth (Grounding & Practical)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-300 text-sm">Tech Setup (check all that apply)</label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasMicrophone}
                    onChange={(e) => handleInputChange('hasMicrophone', e.target.checked)}
                    className="rounded border-gray-600 bg-[#0A0D16] text-sacred-gold focus:ring-sacred-gold"
                  />
                  <span className="text-gray-300 text-sm">I have a working microphone</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasWebcam}
                    onChange={(e) => handleInputChange('hasWebcam', e.target.checked)}
                    className="rounded border-gray-600 bg-[#0A0D16] text-sacred-gold focus:ring-sacred-gold"
                  />
                  <span className="text-gray-300 text-sm">I have a webcam (for future features)</span>
                </label>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">What draws you to Maya?</label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  rows={3}
                  className="w-full bg-[#0A0D16] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-sacred-gold focus:outline-none resize-none"
                  placeholder="Tell us what interests you about consciousness-aware AI..."
                />
              </div>

              {/* Consent */}
              <div className="space-y-3 border-t border-gray-700 pt-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.consentAnalytics}
                    onChange={(e) => handleInputChange('consentAnalytics', e.target.checked)}
                    className="mt-1 rounded border-gray-600 bg-[#0A0D16] text-sacred-gold focus:ring-sacred-gold"
                  />
                  <span className="text-gray-300 text-sm">
                    I consent to anonymous analytics being collected during my beta testing session to improve Maya&apos;s performance.
                  </span>
                </label>
                
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.consentContact}
                    onChange={(e) => handleInputChange('consentContact', e.target.checked)}
                    className="mt-1 rounded border-gray-600 bg-[#0A0D16] text-sacred-gold focus:ring-sacred-gold"
                  />
                  <span className="text-gray-300 text-sm">
                    I agree to be contacted by the Soullab team regarding this beta test and future updates.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-sacred-gold text-black hover:bg-sacred-gold/90'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Apply for Beta Access'}
              </button>
            </form>

            <p className="text-gray-500 text-xs mt-4 text-center">
              Limited to 25 beta testers. Applications reviewed within 48 hours.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}