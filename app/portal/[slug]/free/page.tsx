"use client";

/**
 * FREE RESOURCES / LEAD MAGNET PAGE
 *
 * Capture leads with free offerings
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';

interface LeadMagnet {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  type: 'ebook' | 'guide' | 'video' | 'audio' | 'course' | 'template' | 'checklist';
  delivery_type: 'download' | 'email' | 'access';
  benefits?: string[];
}

interface PortalConfig {
  brand: {
    name: string;
    accent_color: string;
  };
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
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const [magnetsRes, configRes] = await Promise.all([
        fetch(`/api/portal/${slug}/lead-magnets`),
        fetch(`/api/portal/${slug}/config`),
      ]);

      if (magnetsRes.ok) {
        const data = await magnetsRes.json();
        setLeadMagnets(data.lead_magnets || []);
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config);
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

  const accentColor = config?.brand?.accent_color || '#D4AF37';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Gift className="w-8 h-8" style={{ color: accentColor }} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-light text-gray-100 mb-4"
        >
          Free Resources
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          Start your transformation journey with these complimentary offerings
        </motion.p>
      </div>

      {/* Lead Magnets */}
      {leadMagnets.length > 0 ? (
        <div className="space-y-6">
          {leadMagnets.map((magnet, index) => (
            <motion.div
              key={magnet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card
                className="overflow-hidden border-2"
                style={{
                  borderColor: `${accentColor}20`,
                  background: `linear-gradient(135deg, ${accentColor}05, transparent)`,
                }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Content */}
                    <div className="flex-1 p-8">
                      <div className="flex items-start space-x-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
                          {typeIcons[magnet.type] || <Gift className="w-6 h-6" />}
                        </div>
                        <div>
                          <div
                            className="text-xs font-medium uppercase tracking-wider mb-1"
                            style={{ color: accentColor }}
                          >
                            Free {magnet.type}
                          </div>
                          <h2 className="text-xl text-gray-100 font-medium mb-2">
                            {magnet.name}
                          </h2>
                          <p className="text-gray-400">
                            {magnet.long_description || magnet.description}
                          </p>
                        </div>
                      </div>

                      {/* Benefits */}
                      {magnet.benefits && magnet.benefits.length > 0 && (
                        <div className="mt-6 space-y-2">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            What You'll Get
                          </div>
                          {magnet.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <CheckCircle2
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                style={{ color: accentColor }}
                              />
                              <span className="text-sm text-gray-300">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Form */}
                    <div className="lg:w-80 p-8 bg-gray-900/50 border-t lg:border-t-0 lg:border-l border-gray-800">
                      {success === magnet.id ? (
                        <div className="text-center py-8">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: `${accentColor}20` }}
                          >
                            <CheckCircle2
                              className="w-8 h-8"
                              style={{ color: accentColor }}
                            />
                          </div>
                          <h3 className="text-lg text-gray-100 mb-2">Check Your Email!</h3>
                          <p className="text-sm text-gray-400">
                            {magnet.delivery_type === 'download'
                              ? 'Your download link has been sent.'
                              : 'Access instructions have been sent.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center mb-4">
                            <div className="text-sm text-gray-300 mb-1">Get Instant Access</div>
                            <div className="text-xs text-gray-500">
                              {magnet.delivery_type === 'download'
                                ? 'Download link sent to your email'
                                : 'Sent directly to your inbox'}
                            </div>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder="Your name"
                              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                            />
                          </div>

                          <div>
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="Your email"
                              required
                              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={() => handleSubmit(magnet.id)}
                            disabled={!email || submitting === magnet.id}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-gray-900 font-medium transition-all disabled:opacity-50"
                            style={{ backgroundColor: accentColor }}
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
                                <span>Get Free Access</span>
                              </>
                            )}
                          </button>

                          <p className="text-xs text-gray-500 text-center">
                            No spam. Unsubscribe anytime.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-12 text-center">
            <Gift className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg text-gray-300 mb-2">Coming Soon</h3>
            <p className="text-gray-500">
              Free resources are being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
