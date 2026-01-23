"use client";

/**
 * CLIENT CARD
 *
 * Individual client card for the library grid
 * Shows mini chart, key placements, session count
 *
 * Design: These are people, not data points
 * - Avatar with initial (no placeholder faces)
 * - Sun/Moon/Rising as quick identifiers
 * - Session count as relationship indicator
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronRight, Star } from 'lucide-react';
import type { PractitionerClient } from '@/lib/stellium/types';

interface ClientCardProps {
  client: PractitionerClient;
  basePath: string;
}

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  fire: '#FF6B6B',
  earth: '#8BC34A',
  air: '#64B5F6',
  water: '#26C6DA',
};

// Element colors for border accents
const SIGN_ELEMENTS: Record<string, string> = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: colors.fire,
  Earth: colors.earth,
  Air: colors.air,
  Water: colors.water,
};

const SIGN_GLYPHS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

function MiniChartPlaceholder({ sunSign, moonSign, risingSign }: {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}) {
  // Simple visualization: three concentric arcs representing Sun, Moon, Rising
  const sunElement = sunSign ? SIGN_ELEMENTS[sunSign] : null;
  const moonElement = moonSign ? SIGN_ELEMENTS[moonSign] : null;
  const risingElement = risingSign ? SIGN_ELEMENTS[risingSign] : null;

  return (
    <svg viewBox="0 0 60 60" className="w-full h-full">
      {/* Background circle */}
      <circle
        cx="30"
        cy="30"
        r="28"
        fill="none"
        stroke={`${colors.stardust}60`}
        strokeWidth="1"
      />

      {/* Rising arc (outer) */}
      {risingElement && (
        <circle
          cx="30"
          cy="30"
          r="26"
          fill="none"
          stroke={ELEMENT_COLORS[risingElement]}
          strokeWidth="3"
          strokeDasharray="40 180"
          strokeDashoffset="-20"
          opacity="0.6"
        />
      )}

      {/* Moon arc (middle) */}
      {moonElement && (
        <circle
          cx="30"
          cy="30"
          r="20"
          fill="none"
          stroke={ELEMENT_COLORS[moonElement]}
          strokeWidth="3"
          strokeDasharray="35 180"
          strokeDashoffset="60"
          opacity="0.7"
        />
      )}

      {/* Sun center */}
      {sunElement && (
        <circle
          cx="30"
          cy="30"
          r="8"
          fill={ELEMENT_COLORS[sunElement]}
          opacity="0.5"
        />
      )}

      {/* If no chart data, show placeholder */}
      {!sunSign && !moonSign && !risingSign && (
        <text
          x="30"
          y="34"
          textAnchor="middle"
          fill={colors.dim}
          fontSize="10"
        >
          ?
        </text>
      )}
    </svg>
  );
}

export function ClientCard({ client, basePath }: ClientCardProps) {
  const router = useRouter();

  const displayName = client.preferred_name || client.name;
  const sunSign = client.key_placements?.sun_sign;
  const moonSign = client.key_placements?.moon_sign;
  const risingSign = client.key_placements?.rising_sign;

  // Element-based accent color
  const sunElement = sunSign ? SIGN_ELEMENTS[sunSign] : null;
  const accentColor = sunElement ? ELEMENT_COLORS[sunElement] : colors.celestialBlue;

  // Format last session date
  const lastSessionText = client.last_session
    ? new Date(client.last_session).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      onClick={() => router.push(`${basePath}/chart/${client.id}`)}
      className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg group"
      style={{
        backgroundColor: `${colors.nebula}60`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      {/* Top Section: Avatar + Mini Chart */}
      <div className="flex items-start space-x-3 mb-3">
        {/* Avatar Initial */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-medium shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30 0%, ${colors.violet}20 100%)`,
            color: accentColor,
          }}
        >
          {displayName[0].toUpperCase()}
        </div>

        {/* Mini Chart Visualization */}
        <div className="w-12 h-12 shrink-0">
          <MiniChartPlaceholder
            sunSign={sunSign}
            moonSign={moonSign}
            risingSign={risingSign}
          />
        </div>
      </div>

      {/* Name */}
      <h3
        className="font-medium truncate mb-1 group-hover:text-white transition-colors"
        style={{ color: colors.starlight }}
      >
        {displayName}
      </h3>

      {/* Key Placements */}
      {(sunSign || moonSign || risingSign) ? (
        <div className="flex items-center space-x-2 mb-3">
          {sunSign && (
            <span className="text-xs" style={{ color: colors.gold }} title={`Sun in ${sunSign}`}>
              ☉ {SIGN_GLYPHS[sunSign]}
            </span>
          )}
          {moonSign && (
            <span className="text-xs" style={{ color: colors.muted }} title={`Moon in ${moonSign}`}>
              ☽ {SIGN_GLYPHS[moonSign]}
            </span>
          )}
          {risingSign && (
            <span className="text-xs" style={{ color: colors.violet }} title={`Rising ${risingSign}`}>
              ↑ {SIGN_GLYPHS[risingSign]}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-1 mb-3">
          <Star className="w-3 h-3" style={{ color: colors.dim }} />
          <span className="text-xs" style={{ color: colors.dim }}>
            No chart data
          </span>
        </div>
      )}

      {/* Footer: Session count + Last session */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: `${colors.stardust}60` }}
      >
        <div className="flex items-center space-x-1">
          <span className="text-xs" style={{ color: colors.dim }}>
            {client.total_sessions} session{client.total_sessions !== 1 ? 's' : ''}
          </span>
        </div>

        {lastSessionText && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" style={{ color: colors.dim }} />
            <span className="text-xs" style={{ color: colors.dim }}>
              {lastSessionText}
            </span>
          </div>
        )}

        <ChevronRight
          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: colors.celestialBlue }}
        />
      </div>

      {/* Tags (if any) */}
      {client.tags && client.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {client.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded"
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
  );
}

export default ClientCard;
