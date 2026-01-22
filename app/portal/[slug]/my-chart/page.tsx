'use client';

/**
 * MY CHART PAGE (Protected)
 *
 * Client's personal chart portal - only accessible after claiming invite.
 * Shows birth data, chart visualization, session history, and resources.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  FileText,
  Download,
  LogOut,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#D0C5E8',
  border: '#4A3D5C',
  error: '#D98B8B',
};

interface ChartData {
  client: {
    id: string;
    name: string;
    portalClaimedAt: string | null;
    birthData: {
      date: string;
      time: string | null;
      location: string | null;
      timezone: string | null;
    } | null;
    hasChart: boolean;
    chartImageUrl: string | null;
    keyPlacements: {
      sun_sign?: string;
      moon_sign?: string;
      rising_sign?: string;
      saturn_sign?: string;
      saturn_house?: number;
      north_node_sign?: string;
    } | null;
  };
  sessions: Array<{
    type: string;
    date: string;
    themes: string[];
    followUp: string;
  }>;
  resources: Array<{
    id: string;
    name: string;
    description: string;
    resource_type: string;
    url: string;
  }>;
}

export default function MyChartPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetchChart();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch(`/api/portal/${slug}/client-auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push(`/portal/${slug}/client-signin`);
    } catch {
      setSigningOut(false);
    }
  }

  async function fetchChart() {
    try {
      const res = await fetch(`/api/portal/${slug}/my-chart`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        // Not authenticated - redirect to signin
        router.push(`/portal/${slug}/client-signin`);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load chart');
      }

      const chartData = await res.json();
      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Star className="w-12 h-12" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-display mb-4" style={{ color: colors.starlight }}>
          Your Chart
        </h1>
        <p className="mb-6" style={{ color: colors.error }}>
          {error || 'Unable to load your chart'}
        </p>
        <Link
          href={`/portal/${slug}/client-signin`}
          className="inline-block px-6 py-3 rounded-xl font-medium"
          style={{ backgroundColor: colors.gold, color: colors.void }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { client, sessions, resources } = data;
  const placements = client.keyPlacements;

  return (
    <div className="space-y-12 pb-12">
      {/* Sign Out Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5 disabled:opacity-50"
          style={{ color: colors.muted }}
        >
          <LogOut className="w-4 h-4" />
          <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </div>

      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          <Star className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
        </div>

        <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-2" style={{ color: colors.starlight }}>
          Welcome, {client.name}
        </h1>

        {client.portalClaimedAt && (
          <p className="text-sm mb-4" style={{ color: colors.muted }}>
            Portal activated{' '}
            {new Date(client.portalClaimedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}

        {/* Big Three Summary */}
        {placements && (
          <div className="flex items-center justify-center gap-6 flex-wrap mt-6">
            {placements.sun_sign && (
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5" style={{ color: colors.gold }} />
                <span style={{ color: colors.muted }}>
                  Sun in <strong style={{ color: colors.starlight }}>{placements.sun_sign}</strong>
                </span>
              </div>
            )}
            {placements.moon_sign && (
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5" style={{ color: colors.violet }} />
                <span style={{ color: colors.muted }}>
                  Moon in <strong style={{ color: colors.starlight }}>{placements.moon_sign}</strong>
                </span>
              </div>
            )}
            {placements.rising_sign && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: colors.gold }} />
                <span style={{ color: colors.muted }}>
                  Rising <strong style={{ color: colors.starlight }}>{placements.rising_sign}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* Chart Image or "Being Prepared" */}
      {client.chartImageUrl ? (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <img
              src={client.chartImageUrl}
              alt="Your birth chart"
              className="w-full h-auto"
            />
          </div>
        </motion.section>
      ) : !client.hasChart ? (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 text-center backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: colors.gold }} />
          <h2 className="font-display text-xl tracking-wide mb-3" style={{ color: colors.starlight }}>
            Your Chart is Being Prepared
          </h2>
          <p style={{ color: colors.muted }}>
            Your personalized birth chart is being created. Check back soon or reach out to your astrologer for updates.
          </p>
          {sessions.length > 0 && (
            <p className="text-sm mt-4" style={{ color: colors.muted }}>
              Last session:{' '}
              {new Date(sessions[0].date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </motion.section>
      ) : null}

      {/* Birth Data */}
      {client.birthData && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2 className="font-display text-xl tracking-wide mb-4" style={{ color: colors.starlight }}>
            Birth Data
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p style={{ color: colors.muted }}>Date</p>
              <p style={{ color: colors.starlight }}>
                {new Date(client.birthData.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            {client.birthData.time && (
              <div>
                <p style={{ color: colors.muted }}>Time</p>
                <p style={{ color: colors.starlight }}>{client.birthData.time}</p>
              </div>
            )}
            {client.birthData.location && (
              <div>
                <p style={{ color: colors.muted }}>Location</p>
                <p style={{ color: colors.starlight }}>{client.birthData.location}</p>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2 className="font-display text-xl tracking-wide mb-6" style={{ color: colors.starlight }}>
            Session History
          </h2>
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-xl"
                style={{ backgroundColor: `${colors.nebula}80` }}
              >
                <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.gold }} />
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.starlight }}>
                    {session.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm" style={{ color: colors.muted }}>
                    {new Date(session.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {session.themes && session.themes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {session.themes.map((theme, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: `${colors.violet}20`, color: colors.violet }}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2 className="font-display text-xl tracking-wide mb-6" style={{ color: colors.starlight }}>
            Your Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
                style={{ backgroundColor: `${colors.nebula}80`, border: `1px solid ${colors.border}` }}
              >
                <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.gold }} />
                <div className="flex-1">
                  <p className="font-medium" style={{ color: colors.starlight }}>
                    {resource.name}
                  </p>
                  {resource.description && (
                    <p className="text-sm mt-1" style={{ color: colors.muted }}>
                      {resource.description}
                    </p>
                  )}
                </div>
                <Download className="w-4 h-4 flex-shrink-0" style={{ color: colors.muted }} />
              </a>
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA to Book */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center rounded-2xl p-10 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, rgba(229, 193, 88, 0.1), rgba(45, 38, 64, 0.6))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h2 className="font-display text-2xl tracking-wide mb-4" style={{ color: colors.starlight }}>
          Ready for your next session?
        </h2>
        <p className="mb-6" style={{ color: colors.muted }}>
          Book a follow-up reading to explore current transits and themes.
        </p>
        <Link
          href={`/portal/${slug}/book`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
          style={{
            backgroundColor: colors.gold,
            color: colors.void,
            boxShadow: `0 4px 20px ${colors.gold}40`,
          }}
        >
          <span>Book a Session</span>
        </Link>
      </motion.section>
    </div>
  );
}
