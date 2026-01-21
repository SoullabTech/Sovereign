"use client";

/**
 * SESSION PREP CARD
 *
 * The "Before They Walk In" summary for practitioners.
 * Everything you need to know before a session, at a glance.
 *
 * This is what makes the Guild different — optimizing for the relationship.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Calendar,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Shield,
  Target,
  History,
  Sparkles,
  User,
} from 'lucide-react';
import type { SessionPrepData } from '@/lib/practitioner/sessionPrep';
import type { PractitionerClient } from '@/lib/stellium/types';
import { MessageDigestCard, DigestSynthesisLine } from '@/components/stellium';

interface SessionPrepCardProps {
  prep: SessionPrepData;
  onViewEmergencyKit?: () => void;
  onViewFullHistory?: () => void;
  onViewProgressArc?: () => void;
  onViewMessages?: () => void;
  variant?: 'full' | 'compact' | 'dashboard';
}

export default function SessionPrepCard({
  prep,
  onViewEmergencyKit,
  onViewFullHistory,
  onViewProgressArc,
  onViewMessages,
  variant = 'full',
}: SessionPrepCardProps) {
  const { client, last_session, journey, flags, recent_sessions, message_digest } = prep;

  const displayName = client.preferred_name || client.name;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Not recorded';
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDaysAgo = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  // Compact variant for dashboard lists
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="cursor-pointer"
      >
        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-sacred-gold/30 transition-colors">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
              <span className="text-sm font-medium text-sacred-gold">{initials}</span>
            </div>
            {flags.has_risk_factors && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{displayName}</p>
            <p className="text-xs text-gray-500">
              {last_session
                ? `Last: ${formatDaysAgo(last_session.days_ago)}`
                : 'First session'}
            </p>
          </div>

          {/* Themes */}
          {journey.recurring_themes.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {journey.recurring_themes.slice(0, 2).map((theme, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </motion.div>
    );
  }

  // Dashboard variant - medium detail for upcoming sessions list
  if (variant === 'dashboard') {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 hover:border-sacred-gold/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
                <span className="text-base font-medium text-sacred-gold">{initials}</span>
              </div>
              {flags.has_risk_factors && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-200">{displayName}</h3>
                <div className="flex items-center space-x-2">
                  {flags.has_emergency_info && (
                    <button
                      onClick={onViewEmergencyKit}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      title="View Emergency Kit"
                    >
                      <Shield className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Journey Summary */}
              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center space-x-1">
                  <History className="w-3 h-3" />
                  <span>{journey.total_sessions} sessions</span>
                </span>
                {journey.months_together > 0 && (
                  <span>
                    {journey.months_together} mo{journey.months_together > 1 ? 's' : ''} together
                  </span>
                )}
              </div>

              {/* Last Session Note */}
              {last_session?.notes && (
                <div className="mt-2 p-2 bg-gray-800/30 rounded-lg">
                  <p className="text-xs text-gray-400 line-clamp-2">
                    <span className="text-gray-500">Last time:</span>{' '}
                    {last_session.notes}
                  </p>
                </div>
              )}

              {/* Themes */}
              {journey.recurring_themes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {journey.recurring_themes.slice(0, 3).map((theme, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {/* Message Digest Synthesis (dashboard) */}
              {message_digest && message_digest.messages_since_last_session > 0 && (
                <div className="mt-2">
                  <DigestSynthesisLine
                    digest={message_digest}
                    onClick={onViewMessages}
                    variant="default"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant - complete prep view
  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
                <span className="text-xl font-medium text-sacred-gold">{initials}</span>
              </div>
              {client.has_chart && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
              )}
            </div>

            <div>
              <CardTitle className="text-xl text-gray-100">{displayName}</CardTitle>
              {client.pronouns && (
                <p className="text-sm text-gray-500">({client.pronouns})</p>
              )}
              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <History className="w-4 h-4" />
                  <span>{journey.total_sessions} sessions</span>
                </span>
                {journey.months_together > 0 && (
                  <span>
                    {journey.months_together} month{journey.months_together > 1 ? 's' : ''} together
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {(flags.has_emergency_info || flags.has_risk_factors) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onViewEmergencyKit}
                className={`p-2 rounded-lg transition-colors ${
                  flags.has_risk_factors
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/30'
                }`}
                title="Emergency Kit"
              >
                <Shield className={`w-5 h-5 ${flags.has_risk_factors ? 'text-red-400' : 'text-gray-400'}`} />
              </motion.button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flags Alert */}
        {flags.has_risk_factors && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Risk Factors Noted</p>
              <p className="text-xs text-red-400/70 mt-1">
                Review emergency kit before session
              </p>
            </div>
          </div>
        )}

        {flags.has_safety_plan && !flags.has_risk_factors && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Safety Plan on File</p>
              <p className="text-xs text-amber-400/70 mt-1">
                Client has an established safety plan
              </p>
            </div>
          </div>
        )}

        {/* Message Digest Synthesis - Prominent one-liner */}
        {message_digest && message_digest.messages_since_last_session > 0 && (
          <DigestSynthesisLine
            digest={message_digest}
            onClick={onViewMessages}
            variant="prominent"
          />
        )}

        {/* Last Session */}
        {last_session ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-sacred-gold" />
                <span>Last Time We Talked About</span>
              </h4>
              <span className="text-xs text-gray-500">
                {formatDaysAgo(last_session.days_ago)}
              </span>
            </div>

            {last_session.notes ? (
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {last_session.notes}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No notes from last session</p>
            )}

            {/* Last Session Themes */}
            {last_session.themes && last_session.themes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {last_session.themes.map((theme, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}

            {/* Open Threads / Insights */}
            {last_session.insights && last_session.insights.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Open threads:</p>
                <ul className="space-y-1">
                  {last_session.insights.slice(0, 3).map((insight, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start space-x-2">
                      <span className="text-sacred-gold">-</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-br from-sacred-gold/5 to-amber-600/5 rounded-lg border border-sacred-gold/10">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-sacred-gold" />
              <div>
                <p className="text-sm font-medium text-gray-200">First Session</p>
                <p className="text-xs text-gray-400">
                  No previous session history
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stated Goals / Intentions */}
        {journey.stated_goals && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
              <Target className="w-4 h-4 text-sacred-gold" />
              <span>Their Intentions</span>
            </h4>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <p className="text-sm text-gray-300 leading-relaxed">
                {journey.stated_goals}
              </p>
            </div>
          </div>
        )}

        {/* Recurring Themes */}
        {journey.recurring_themes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Recurring Themes</h4>
            <div className="flex flex-wrap gap-1.5">
              {journey.recurring_themes.map((theme, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 bg-gray-800/50 text-gray-300 rounded-full border border-gray-700/30"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Intake Highlights */}
        {journey.intake_highlights && Object.keys(journey.intake_highlights).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">From Their Intake</h4>
            <div className="space-y-2">
              {Object.entries(journey.intake_highlights).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-800/20 rounded-lg">
                  <p className="text-xs text-gray-500 capitalize mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-300">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Life Events */}
        {flags.upcoming_life_events && flags.upcoming_life_events.length > 0 && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <h4 className="text-sm font-medium text-amber-400 flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Life Events</span>
            </h4>
            <ul className="space-y-1">
              {flags.upcoming_life_events.map((event, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start space-x-2">
                  <span className="text-amber-500">-</span>
                  <span>{event}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Between-Session Messages */}
        {message_digest && message_digest.messages_since_last_session > 0 && (
          <MessageDigestCard
            digest={message_digest}
            onViewAll={onViewMessages || (() => {})}
            variant="full"
          />
        )}

        {/* Quick Links */}
        <div className="pt-2 flex items-center justify-end space-x-2">
          <button
            onClick={onViewFullHistory}
            className="text-xs text-gray-400 hover:text-sacred-gold transition-colors flex items-center space-x-1"
          >
            <History className="w-3.5 h-3.5" />
            <span>Full History</span>
          </button>
          <span className="text-gray-700">|</span>
          <button
            onClick={onViewProgressArc}
            className="text-xs text-gray-400 hover:text-sacred-gold transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Progress Arc</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
