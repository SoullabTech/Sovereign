"use client";

/**
 * STELLIUM CLIENT CARD
 *
 * A card representing a single client in the practice
 * Shows key info and quick actions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, Star, ChevronRight, Sparkles } from 'lucide-react';
import { PractitionerClient } from '@/lib/stellium/types';

interface ClientCardProps {
  client: PractitionerClient;
  onClick?: () => void;
  showLastSession?: boolean;
  variant?: 'default' | 'compact';
}

export default function ClientCard({
  client,
  onClick,
  showLastSession = true,
  variant = 'default',
}: ClientCardProps) {
  const displayName = client.preferred_name || client.name;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    archived: 'bg-red-500/20 text-red-400 border-red-500/30',
    waitlist: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-sacred-gold/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
            <span className="text-sm font-medium text-sacred-gold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{displayName}</p>
            {(client.themes?.length ?? 0) > 0 && (
              <p className="text-xs text-gray-500 truncate">
                {client.themes!.slice(0, 2).join(', ')}
              </p>
            )}
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
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
                <span className="text-lg font-medium text-sacred-gold">{initials}</span>
              </div>
              {client.has_chart && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-200 truncate">
                  {displayName}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[client.status]}`}>
                  {client.status}
                </span>
              </div>

              {client.email && (
                <p className="text-sm text-gray-500 truncate">{client.email}</p>
              )}

              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                {showLastSession && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {client.last_session
                        ? `Last: ${formatDate(client.last_session)}`
                        : 'No sessions yet'}
                    </span>
                  </div>
                )}
                {client.total_sessions > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>{client.total_sessions} sessions</span>
                  </div>
                )}
              </div>

              {/* Themes */}
              {(client.themes?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {client.themes!.slice(0, 3).map((theme, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-full"
                    >
                      {theme}
                    </span>
                  ))}
                  {client.themes!.length > 3 && (
                    <span className="text-xs text-gray-500">+{client.themes!.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
