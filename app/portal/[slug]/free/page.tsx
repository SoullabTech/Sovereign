"use client";

/**
 * FREE RESOURCES / LEAD MAGNET PAGE
 *
 * Warm, earthy, holistic lead capture experience
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
  Moon,
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
  const slug = params.slug as string;

  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Warm, earthy palette
  const colors = {
    ivory: '#FFFEF9',
    linen: '#F8F4EF',
    sand: '#E8E0D5',
    warmGray: '#9A938A',
    terracotta: '#B87351',
    forest: '#4A5D4A',
    text: '#3D3532',
    textLight: '#6B6460',
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
          <Moon className="w-8 h-8" style={{ color: colors.terracotta }} />
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
            <div className="h-px w-12" style={{ backgroundColor: colors.sand }} />
            <Gift className="w-6 h-6" style={{ color: colors.terracotta }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.sand }} />
          </div>

          <h1
            className="font-display text-4xl md:text-5xl font-light mb-4"
            style={{ color: colors.text }}
          >
            Free Gift
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.textLight }}
          >
            Begin your journey with this complimentary offering, crafted with love
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
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: colors.linen,
                border: magnet.featured ? `2px solid ${colors.terracotta}` : `1px solid ${colors.sand}`,
              }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Content */}
                <div className="flex-1 p-8 lg:p-10">
                  <div className="flex items-start space-x-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${colors.terracotta}15`, color: colors.terracotta }}
                    >
                      {typeIcons[magnet.type] || <Gift className="w-6 h-6" />}
                    </div>
                    <div>
                      <div
                        className="text-xs font-medium uppercase tracking-widest mb-2"
                        style={{ color: colors.terracotta }}
                      >
                        Free {magnet.type}
                      </div>
                      <h2
                        className="font-display text-2xl md:text-3xl font-medium mb-3"
                        style={{ color: colors.text }}
                      >
                        {magnet.name}
                      </h2>
                      <p className="leading-relaxed" style={{ color: colors.textLight }}>
                        {magnet.long_description || magnet.description}
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  {magnet.benefits && magnet.benefits.length > 0 && (
                    <div className="mt-8">
                      <div
                        className="text-xs uppercase tracking-widest mb-4"
                        style={{ color: colors.warmGray }}
                      >
                        What You'll Discover
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {magnet.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <CheckCircle2
                              className="w-5 h-5 mt-0.5 flex-shrink-0"
                              style={{ color: colors.forest }}
                            />
                            <span style={{ color: colors.text }}>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form */}
                <div
                  className="lg:w-96 p-8 lg:p-10"
                  style={{ backgroundColor: colors.sand }}
                >
                  {success === magnet.id ? (
                    <div className="text-center py-8">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ backgroundColor: `${colors.forest}20` }}
                      >
                        <CheckCircle2
                          className="w-10 h-10"
                          style={{ color: colors.forest }}
                        />
                      </div>
                      <h3
                        className="font-display text-2xl font-light mb-3"
                        style={{ color: colors.text }}
                      >
                        Check Your Inbox
                      </h3>
                      <p style={{ color: colors.textLight }}>
                        {magnet.delivery_type === 'download'
                          ? 'Your download link is on its way.'
                          : 'Access instructions have been sent with love.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="text-center mb-6">
                        <Star className="w-8 h-8 mx-auto mb-3" style={{ color: colors.terracotta }} />
                        <div
                          className="font-display text-xl mb-1"
                          style={{ color: colors.text }}
                        >
                          Get Instant Access
                        </div>
                        <div className="text-sm" style={{ color: colors.textLight }}>
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
                          className="w-full px-5 py-3.5 rounded-xl text-base outline-none transition-all"
                          style={{
                            backgroundColor: colors.ivory,
                            border: `1px solid ${colors.sand}`,
                            color: colors.text,
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
                          className="w-full px-5 py-3.5 rounded-xl text-base outline-none transition-all"
                          style={{
                            backgroundColor: colors.ivory,
                            border: `1px solid ${colors.sand}`,
                            color: colors.text,
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleSubmit(magnet.id)}
                        disabled={!email || submitting === magnet.id}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
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

                      <p className="text-xs text-center" style={{ color: colors.warmGray }}>
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
          className="rounded-3xl p-16 text-center"
          style={{ backgroundColor: colors.linen }}
        >
          <Gift className="w-16 h-16 mx-auto mb-6" style={{ color: colors.warmGray }} />
          <h3
            className="font-display text-2xl font-light mb-3"
            style={{ color: colors.text }}
          >
            Something Special is Coming
          </h3>
          <p style={{ color: colors.textLight }}>
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
          <div className="h-px w-16" style={{ backgroundColor: colors.sand }} />
          <Sparkles className="w-5 h-5" style={{ color: colors.terracotta }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.sand }} />
        </div>
        <p className="italic" style={{ color: colors.textLight }}>
          "The cosmos speaks to those who listen with an open heart."
        </p>
      </motion.div>
    </div>
  );
}
