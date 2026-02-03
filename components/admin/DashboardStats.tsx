"use client";

/**
 * DASHBOARD STATS
 *
 * Stat cards for the admin dashboard
 * Displays key metrics with cosmic styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Clock, Star, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtext?: string;
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
};

function StatCard({ label, value, icon, trend, subtext, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="rounded-xl p-5 backdrop-blur-xl border"
      style={{
        backgroundColor: `${colors.nebula}90`,
        borderColor: colors.stardust,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.gold}20 0%, ${colors.violet}20 100%)`,
          }}
        >
          {icon}
        </div>
        {trend && (
          <div
            className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: trend.isPositive ? `${colors.success}20` : `${colors.warning}20`,
              color: trend.isPositive ? colors.success : colors.warning,
            }}
          >
            <TrendingUp className={`w-3 h-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold mb-1" style={{ color: colors.starlight }}>
          {value}
        </p>
        <p className="text-sm" style={{ color: colors.muted }}>
          {label}
        </p>
        {subtext && (
          <p className="text-xs mt-1" style={{ color: colors.dim }}>
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface DashboardStatsProps {
  totalClients: number;
  activeClients: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  revenueThisMonth?: number;
  upcomingSessionsCount: number;
}

export function DashboardStats({
  totalClients,
  activeClients,
  sessionsThisWeek,
  sessionsThisMonth,
  revenueThisMonth,
  upcomingSessionsCount,
}: DashboardStatsProps) {
  const stats: StatCardProps[] = [
    {
      label: 'Total Clients',
      value: totalClients,
      icon: <Users className="w-5 h-5" style={{ color: colors.gold }} />,
      subtext: `${activeClients} active`,
      delay: 0,
    },
    {
      label: 'Sessions This Week',
      value: sessionsThisWeek,
      icon: <Calendar className="w-5 h-5" style={{ color: colors.violet }} />,
      subtext: `${sessionsThisMonth} this month`,
      delay: 1,
    },
    {
      label: 'Upcoming Sessions',
      value: upcomingSessionsCount,
      icon: <Clock className="w-5 h-5" style={{ color: colors.gold }} />,
      delay: 2,
    },
  ];

  if (revenueThisMonth !== undefined) {
    stats.push({
      label: 'Revenue This Month',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" style={{ color: colors.success }} />,
      delay: 3,
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} delay={index} />
      ))}
    </div>
  );
}

export default DashboardStats;
