'use client';

/**
 * PORTAL INQUIRY FORM
 *
 * Contact form component for practitioner portals
 * Celestial aesthetic matching the portal design system
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, AlertCircle, Sparkles } from 'lucide-react';

interface InquiryFormProps {
  portalSlug: string;
  practitionerName: string;
  topics?: string[];
  showTimezone?: boolean;
  className?: string;
}

// Cosmic color palette (matches PortalClientLayout)
const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  starlight: '#FFFFFF',
  violet: '#B8A5D9',
  gold: '#E5C158',
  rose: '#D4B0C5',
  light: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

export default function InquiryForm({
  portalSlug,
  practitionerName,
  topics = [],
  showTimezone = true,
  className = '',
}: InquiryFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    timezone: '',
    topic: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/portal/${portalSlug}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setSuccessMessage(data.message);
      setForm({ name: '', email: '', phone: '', timezone: '', topic: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const inputStyles = {
    backgroundColor: colors.stardust,
    color: colors.light,
    border: `1px solid ${colors.nebula}`,
  };

  const labelStyles = {
    color: colors.muted,
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 text-center ${className}`}
        style={{
          background: `linear-gradient(135deg, ${colors.nebula}, ${colors.stardust})`,
          border: `1px solid ${colors.violet}40`,
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: `linear-gradient(135deg, ${colors.violet}, ${colors.gold})`,
            boxShadow: `0 4px 20px rgba(229, 193, 88, 0.4)`,
          }}
        >
          <Check className="w-8 h-8" style={{ color: colors.void }} />
        </div>
        <h3
          className="text-xl font-display tracking-wide mb-4"
          style={{ color: colors.light }}
        >
          Message Sent
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: colors.muted }}>
          {successMessage}
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm tracking-wide transition-colors hover:opacity-80"
          style={{ color: colors.gold }}
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`rounded-2xl p-8 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.nebula}, ${colors.stardust})`,
        border: `1px solid ${colors.nebula}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.violet}, ${colors.gold})`,
            boxShadow: `0 4px 20px rgba(229, 193, 88, 0.3)`,
          }}
        >
          <Sparkles className="w-6 h-6" style={{ color: colors.void }} />
        </div>
        <div>
          <h3 className="text-lg font-display tracking-wide" style={{ color: colors.light }}>
            Reach Out
          </h3>
          <p className="text-sm" style={{ color: colors.muted }}>
            Connect with {practitionerName}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <div
          className="flex items-center space-x-3 p-4 rounded-xl mb-6"
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#F87171' }} />
          <p className="text-sm" style={{ color: '#F87171' }}>
            {errorMessage}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {/* Name & Email Row */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs tracking-wide uppercase mb-2" style={labelStyles}>
              Your Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="How may I address you?"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{
                ...inputStyles,
                '--tw-ring-color': colors.violet,
              } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-xs tracking-wide uppercase mb-2" style={labelStyles}>
              Email <span style={{ color: colors.gold }}>*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="For my response"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{
                ...inputStyles,
                '--tw-ring-color': colors.violet,
              } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Phone & Timezone Row */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs tracking-wide uppercase mb-2" style={labelStyles}>
              Phone (optional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="For scheduling calls"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{
                ...inputStyles,
                '--tw-ring-color': colors.violet,
              } as React.CSSProperties}
            />
          </div>
          {showTimezone && (
            <div>
              <label className="block text-xs tracking-wide uppercase mb-2" style={labelStyles}>
                Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 appearance-none cursor-pointer"
                style={{
                  ...inputStyles,
                  '--tw-ring-color': colors.violet,
                } as React.CSSProperties}
              >
                <option value="">Select your timezone</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Central Europe (CET)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>
          )}
        </div>

        {/* Topic */}
        {topics.length > 0 && (
          <div>
            <label className="block text-xs tracking-wide uppercase mb-2" style={labelStyles}>
              What brings you here?
            </label>
            <select
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 appearance-none cursor-pointer"
              style={{
                ...inputStyles,
                '--tw-ring-color': colors.violet,
              } as React.CSSProperties}
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-xs tracking-wide uppercase mb-2" style={labelStyles}>
            Your Message <span style={{ color: colors.gold }}>*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Share what's on your mind..."
            required
            rows={5}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 resize-none"
            style={{
              ...inputStyles,
              '--tw-ring-color': colors.violet,
            } as React.CSSProperties}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading' || !form.message.trim()}
          className="w-full flex items-center justify-center space-x-3 py-4 rounded-xl font-display tracking-wide transition-all disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${colors.violet}, ${colors.gold})`,
            color: colors.void,
            boxShadow: `0 4px 20px rgba(229, 193, 88, 0.3)`,
          }}
        >
          {status === 'loading' ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 rounded-full"
                style={{ borderColor: colors.void, borderTopColor: 'transparent' }}
              />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: colors.dim }}>
        Your information is treated with care and never shared
      </p>
    </motion.form>
  );
}
