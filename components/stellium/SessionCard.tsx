"use client";

/**
 * STELLIUM SESSION CARD
 *
 * A card representing a session - past, present, or future
 * Containers for the ongoing work
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  Calendar,
  Video,
  MapPin,
  Phone,
  Brain,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { PractitionerSession } from '@/lib/stellium/types';

interface SessionCardProps {
  session: PractitionerSession;
  onClick?: () => void;
  showClient?: boolean;
  variant?: 'default' | 'compact' | 'upcoming';
}

export default function SessionCard({
  session,
  onClick,
  showClient = true,
  variant = 'default',
}: SessionCardProps) {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    scheduled: {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    confirmed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    completed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-sacred-gold',
      bg: 'bg-sacred-gold/10 border-sacred-gold/30',
    },
    cancelled: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-gray-400',
      bg: 'bg-gray-500/10 border-gray-500/30',
    },
    no_show: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
    },
  };

  const locationIcons: Record<string, React.ReactNode> = {
    video: <Video className="w-3 h-3" />,
    phone: <Phone className="w-3 h-3" />,
    'in-person': <MapPin className="w-3 h-3" />,
  };

  const status = statusConfig[session.status] || statusConfig.scheduled;
  const clientName = session.client?.preferred_name || session.client?.name || 'Unknown';

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasMaiaPrep = !!session.maia_prep;

  if (variant === 'upcoming') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-sacred-gold/30 transition-colors">
          {/* Time */}
          <div className="text-center min-w-[60px]">
            <div className="text-lg font-medium text-sacred-gold">
              {session.scheduled_at ? formatTime(session.scheduled_at) : '--:--'}
            </div>
            <div className="text-xs text-gray-500">
              {session.duration_minutes}min
            </div>
          </div>

          <div className="w-px h-12 bg-gray-700/50" />

          {/* Client & Type */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{clientName}</p>
            <p className="text-xs text-gray-500">{session.session_type}</p>
          </div>

          {/* Indicators */}
          <div className="flex items-center space-x-2">
            {hasMaiaPrep && (
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center" title="MAIA prep ready">
                <Brain className="w-3 h-3 text-indigo-400" />
              </div>
            )}
            <div className={`p-1 rounded ${status.bg}`}>
              <span className={status.color}>{status.icon}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className={`p-2 rounded-lg ${status.bg}`}>
            <span className={status.color}>{status.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {showClient ? clientName : session.session_type}
            </p>
            <p className="text-xs text-gray-500">
              {session.scheduled_at ? formatDate(session.scheduled_at) : 'Unscheduled'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 hover:border-sacred-gold/30 transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              {showClient && (
                <h3 className="text-base font-medium text-gray-200">{clientName}</h3>
              )}
              <p className="text-sm text-gray-400">{session.session_type}</p>
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${status.bg}`}>
              <span className={status.color}>{status.icon}</span>
              <span className={`text-xs ${status.color}`}>{session.status}</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {session.scheduled_at && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(session.scheduled_at)}</span>
                <span className="text-sacred-gold">{formatTime(session.scheduled_at)}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{session.duration_minutes} min</span>
            </div>

            {session.location_type && (
              <div className="flex items-center space-x-1">
                {locationIcons[session.location_type]}
                <span className="capitalize">{session.location_type}</span>
              </div>
            )}
          </div>

          {/* Themes */}
          {session.themes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {session.themes.slice(0, 4).map((theme, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* MAIA Prep Indicator */}
          {hasMaiaPrep && (
            <div className="flex items-center space-x-2 mt-3 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-300">MAIA has prepared for this session</span>
            </div>
          )}

          {/* Notes Preview */}
          {session.prep_notes && !hasMaiaPrep && (
            <p className="text-xs text-gray-500 mt-3 line-clamp-2">
              {session.prep_notes}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
