"use client";

/**
 * STELLIUM PRO LAYOUT
 *
 * Session cockpit for evolutionary astrologers
 * A space for chart work, session prep, and client care
 *
 * Design Philosophy (from the plan):
 * - "Apprenticeship energy" - reflection, preparation, learning
 * - "Support thresholds, not readiness" - meet practitioners where they are
 * - "Session notes are for your learning, not judgment"
 * - The system remembers what it was like to begin
 */

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Compass,
  Users,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { PractitionerProGate } from '@/components/admin/PractitionerProGate';

// Stellium Pro sub-navigation items
interface StelliumNavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const stelliumNavItems: StelliumNavItem[] = [
  { path: '', label: 'Session Cockpit', icon: <Compass className="w-4 h-4" /> },
  { path: '/clients', label: 'Client Library', icon: <Users className="w-4 h-4" /> },
];

// Cosmic palette - celestial theme from design system
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
};

export default function StelliumProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = params?.slug as string;
  const basePath = `/portal/${slug}/admin/stellium`;

  const isActive = (path: string) => {
    const fullPath = `${basePath}${path}`;
    if (path === '') {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname?.startsWith(fullPath);
  };

  return (
    <PractitionerProGate>
      <div className="space-y-6">
        {/* Stellium Pro Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            {/* Back to main admin */}
            <button
              onClick={() => router.push(`/portal/${slug}/admin`)}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: colors.muted }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{
                    background: `linear-gradient(135deg, ${colors.celestialBlue}20 0%, ${colors.violet}20 100%)`,
                    borderColor: `${colors.celestialBlue}40`,
                  }}
                >
                  <Compass className="w-5 h-5" style={{ color: colors.celestialBlue }} />
                </div>
                <div>
                  <h1
                    className="text-xl font-display"
                    style={{ color: colors.starlight }}
                  >
                    Stellium Pro
                  </h1>
                  <p className="text-xs" style={{ color: colors.dim }}>
                    Session cockpit for chart work
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-navigation tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-lg" style={{ backgroundColor: `${colors.nebula}80` }}>
            {stelliumNavItems.map(item => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(`${basePath}${item.path}`)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm"
                  style={{
                    backgroundColor: active ? `${colors.celestialBlue}20` : 'transparent',
                    color: active ? colors.celestialBlue : colors.muted,
                    border: active ? `1px solid ${colors.celestialBlue}30` : '1px solid transparent',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main content area */}
        <div>
          {children}
        </div>
      </div>
    </PractitionerProGate>
  );
}
