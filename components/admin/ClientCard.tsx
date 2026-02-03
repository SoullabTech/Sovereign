"use client";

/**
 * CLIENT CARD
 *
 * Card component for displaying client info in lists
 * Shows birth data, session info, and status
 */

import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Star, Clock, ChevronRight, MapPin } from 'lucide-react';
import type { PractitionerClient } from '@/lib/stellium/types';

interface ClientCardProps {
  client: PractitionerClient;
  onClick?: () => void;
  delay?: number;
}

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  warning: '#E5A858',
  error: '#D98B8B',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: `${colors.success}20`, text: colors.success },
  inactive: { bg: `${colors.dim}20`, text: colors.dim },
  archived: { bg: `${colors.dim}20`, text: colors.dim },
  waitlist: { bg: `${colors.warning}20`, text: colors.warning },
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getZodiacSign(birthDate?: string): string | null {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const signs = [
    { name: 'Capricorn', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', start: [2, 19], end: [3, 20] },
    { name: 'Aries', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', start: [6, 21], end: [7, 22] },
    { name: 'Leo', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', start: [8, 23], end: [9, 22] },
    { name: 'Libra', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
  ];

  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if (startMonth === 12) {
      if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
        return sign.name;
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign.name;
      }
    }
  }

  return null;
}

export function ClientCard({ client, onClick, delay = 0 }: ClientCardProps) {
  const zodiacSign = client.key_placements?.sun_sign || getZodiacSign(client.birth_date);
  const status = statusColors[client.status] || statusColors.inactive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05 }}
      onClick={onClick}
      className="rounded-xl p-4 backdrop-blur-xl border cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: `${colors.nebula}80`,
        borderColor: colors.stardust,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
            style={{
              background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.violet}30 100%)`,
              color: colors.gold,
            }}
          >
            {(client.preferred_name || client.name || 'C')[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium truncate" style={{ color: colors.starlight }}>
                {client.preferred_name || client.name}
              </h3>
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: status.bg, color: status.text }}
              >
                {client.status}
              </span>
            </div>

            {/* Email */}
            {client.email && (
              <p className="text-sm truncate" style={{ color: colors.muted }}>
                {client.email}
              </p>
            )}

            {/* Birth Info */}
            <div className="flex items-center flex-wrap gap-3 mt-2">
              {zodiacSign && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5" style={{ color: colors.gold }} />
                  <span className="text-xs" style={{ color: colors.dim }}>
                    {zodiacSign}
                  </span>
                </div>
              )}
              {client.birth_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: colors.violet }} />
                  <span className="text-xs" style={{ color: colors.dim }}>
                    {formatDate(client.birth_date)}
                  </span>
                </div>
              )}
              {client.birth_location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: colors.muted }} />
                  <span className="text-xs truncate max-w-[120px]" style={{ color: colors.dim }}>
                    {client.birth_location}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-1.5 mt-2">
                {client.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: `${colors.violet}20`,
                      color: colors.violet,
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {client.tags.length > 3 && (
                  <span className="text-xs" style={{ color: colors.dim }}>
                    +{client.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Session Info & Arrow */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm" style={{ color: colors.muted }}>
              {client.total_sessions} sessions
            </p>
            {client.last_session && (
              <p className="text-xs" style={{ color: colors.dim }}>
                Last: {formatDate(client.last_session)}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: colors.dim }} />
        </div>
      </div>
    </motion.div>
  );
}

export default ClientCard;
