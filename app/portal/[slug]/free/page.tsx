"use client";

/**
 * FREE RESOURCES / LEAD MAGNET PAGE
 *
 * Cosmic, celestial aesthetic - Starlight Muse theme
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Gift,
  Mail,
  Download,
  CheckCircle2,
  Loader2,
  Sparkles,
  FileText,
  Video,
  Headphones,
  BookOpen,
  Star,
} from 'lucide-react';

interface LeadMagnet {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  type: 'ebook' | 'guide' | 'video' | 'audio' | 'course' | 'template' | 'checklist';
  delivery_type: 'download' | 'email' | 'access';
  benefits?: string[];
  featured?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  ebook: <BookOpen className="w-6 h-6" />,
  guide: <FileText className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
  audio: <Headphones className="w-6 h-6" />,
  course: <Sparkles className="w-6 h-6" />,
  template: <FileText className="w-6 h-6" />,
  checklist: <CheckCircle2 className="w-6 h-6" />,
};

export default function FreeResourcesPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Cosmic Starlight Muse palette - high contrast
  const colors = {
    void: '#0D0B14',
    cosmos: '#1A1625',
    nebula: '#251F33',
    stardust: '#2D2640',
    cardBg: 'rgba(45, 38, 64, 0.6)',
    gold: '#E5C158',
    violet: '#B8A5D9',
    starlight: '#FFFFFF',
    muted: '#D0C5E8',
    dim: '#A99DC4',
    border: '#4A3D5C',
    success: '#8FB89A',
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/lead-magnets`);
      if (response.ok) {
        const data = await response.json();
        setLeadMagnets(data.lead_magnets || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (magnetId: string) => {
    if (!email) return;

    setSubmitting(magnetId);
    try {
      const response = await fetch(`/api/portal/${slug}/lead-magnets/${magnetId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        setSuccess(magnetId);
        setEmail('');
        setName('');
      }
    } catch (err) {
      console.error('Failed to claim resource:', err);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <Gift className="w-6 h-6" style={{ color: colors.gold }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <h1
            className="font-display text-4xl md:text-5xl tracking-wide mb-4"
            style={{ color: colors.starlight }}
          >
            Free Gift
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.muted }}
          >
            Begin your cosmic journey with this complimentary offering, crafted with starlight
          </p>
        </motion.div>
      </div>

      {/* Lead Magnets */}
      {leadMagnets.length > 0 ? (
        <div className="space-y-8">
          {leadMagnets.map((magnet, index) => (
            <motion.div
              key={magnet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="rounded-3xl overflow-hidden backdrop-blur-xl"
              style={{
                background: magnet.featured
                  ? `linear-gradient(135deg, rgba(229, 193, 88, 0.15), ${colors.cardBg})`
                  : `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
                border: magnet.featured ? `2px solid ${colors.gold}` : `1px solid ${colors.border}`,
              }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <div className="flex-1 p-8 lg:p-10">
                  <div className="flex items-start space-x-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
                    >
                      {typeIcons[magnet.type] || <Gift className="w-6 h-6" />}
                    </div>
                    <div>
                      <div
                        className="text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: colors.gold }}
                      >
                        Free {magnet.type}
                      </div>
                      <h2
                        className="font-display text-2xl md:text-3xl font-semibold tracking-wide mb-3"
                        style={{ color: colors.starlight }}
                      >
                        {magnet.name}
                      </h2>
                      <p className="leading-relaxed" style={{ color: colors.muted }}>
                        {magnet.long_description || magnet.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  {magnet.benefits && magnet.benefits.length > 0 && (
                    <div className="mt-8">
                      <div
                        className="text-xs uppercase tracking-widest mb-4 font-semibold"
                        style={{ color: colors.dim }}
                      >
                        What You'll Discover
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {magnet.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <CheckCircle2
                              className="w-5 h-5 mt-0.5 flex-shrink-0"
                              style={{ color: colors.success }}
                            />
                            <span className="font-medium" style={{ color: colors.starlight }}>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form */}
                <div
                  className="lg:w-96 p-8 lg:p-10"
                  style={{
                    background: `linear-gradient(135deg, ${colors.stardust}, ${colors.nebula})`,
                  }}
                >
                  {success === magnet.id ? (
                    <div className="text-center py-8">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ backgroundColor: `${colors.success}25` }}
                      >
                        <CheckCircle2
                          className="w-10 h-10"
                          style={{ color: colors.success }}
                        />
                      </div>
                      <h3
                        className="font-display text-2xl tracking-wide mb-3"
                        style={{ color: colors.starlight }}
                      >
                        Check Your Inbox
                      </h3>
                      <p style={{ color: colors.muted }}>
                        {magnet.delivery_type === 'download'
                          ? 'Your download link is on its way.'
                          : 'Access instructions have been sent with cosmic love.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="text-center mb-6">
                        <Star className="w-8 h-8 mx-auto mb-3" style={{ color: colors.gold }} />
                        <div
                          className="font-display text-xl mb-1 font-semibold"
                          style={{ color: colors.starlight }}
                        >
                          Get Instant Access
                        </div>
                        <div className="text-sm font-medium" style={{ color: colors.muted }}>
                          {magnet.delivery_type === 'download'
                            ? 'Download link sent to your email'
                            : 'Delivered directly to your inbox'}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-5 py-3.5 rounded-xl text-base outline-none transition-all font-medium"
                          style={{
                            backgroundColor: colors.void,
                            border: `1px solid ${colors.border}`,
                            color: colors.starlight,
                          }}
                        />
                      </div>

                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Your email"
                          required
                          className="w-full px-5 py-3.5 rounded-xl text-base outline-none transition-all font-medium"
                          style={{
                            backgroundColor: colors.void,
                            border: `1px solid ${colors.border}`,
                            color: colors.starlight,
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleSubmit(magnet.id)}
                        disabled={!email || submitting === magnet.id}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{
                          backgroundColor: colors.gold,
                          color: colors.void,
                          boxShadow: `0 4px 20px ${colors.gold}40`,
                        }}
                      >
                        {submitting === magnet.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {magnet.delivery_type === 'download' ? (
                              <Download className="w-5 h-5" />
                            ) : (
                              <Mail className="w-5 h-5" />
                            )}
                            <span>Send My Free Gift</span>
                          </>
                        )}
                      </button>

                      <p className="text-xs text-center font-medium" style={{ color: colors.dim }}>
                        Your privacy is sacred. No spam, ever.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-3xl p-16 text-center backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Gift className="w-16 h-16 mx-auto mb-6" style={{ color: colors.violet }} />
          <h3
            className="font-display text-2xl tracking-wide mb-3"
            style={{ color: colors.starlight }}
          >
            Something Cosmic is Coming
          </h3>
          <p style={{ color: colors.muted }}>
            Free offerings are being lovingly prepared. Check back soon.
          </p>
        </div>
      )}

      {/* Trust Element */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
          <Sparkles className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
        </div>
        <p className="italic font-medium" style={{ color: colors.muted }}>
          "The cosmos speaks to those who listen with an open heart."
        </p>
      </motion.div>
    </div>
  );
}
