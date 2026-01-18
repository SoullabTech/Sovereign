"use client";

/**
 * CONTACT CARD COMPONENT
 *
 * Display for marketing contacts/leads
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Phone,
  Tag,
  Calendar,
  TrendingUp,
  Star,
  UserCheck,
} from 'lucide-react';
import { MarketingContact } from '@/lib/stellium/marketing';

interface ContactCardProps {
  contact: MarketingContact;
  onClick?: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  lead: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  engaged: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  qualified: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  opportunity: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  converted: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  unsubscribed: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

const sourceIcons: Record<string, React.ReactNode> = {
  lead_magnet: <Star className="w-3 h-3" />,
  referral: <UserCheck className="w-3 h-3" />,
  organic: <TrendingUp className="w-3 h-3" />,
};

export default function ContactCard({ contact, onClick }: ContactCardProps) {
  const status = statusColors[contact.status] || statusColors.lead;
  const name = contact.first_name
    ? `${contact.first_name}${contact.last_name ? ' ' + contact.last_name : ''}`
    : contact.email.split('@')[0];

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 hover:border-gray-600/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Name & Status */}
            <div className="flex items-center space-x-2">
              <h3 className="text-gray-200 font-medium truncate">{name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                {contact.status}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-1 mt-1 text-sm text-gray-400">
              <Mail className="w-3 h-3" />
              <span className="truncate">{contact.email}</span>
            </div>

            {/* Phone if available */}
            {contact.phone && (
              <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{contact.phone}</span>
              </div>
            )}

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-1 mt-2">
                <Tag className="w-3 h-3 text-gray-600" />
                {contact.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-gray-800/50 text-gray-400 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {contact.tags.length > 3 && (
                  <span className="text-xs text-gray-600">
                    +{contact.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Lead Score */}
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-sacred-gold" />
              <span className="text-sacred-gold font-medium">{contact.lead_score}</span>
            </div>
            <span className="text-xs text-gray-600">score</span>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              {sourceIcons[contact.source] || <TrendingUp className="w-3 h-3" />}
              <span className="capitalize">{contact.source.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>{contact.emails_received} sent</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>Last: {formatDate(contact.last_email_at)}</span>
          </div>
        </div>

        {/* Engagement Indicators */}
        {contact.emails_received > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500/60 rounded-full"
                style={{
                  width: `${Math.min((contact.emails_opened / contact.emails_received) * 100, 100)}%`,
                }}
                title={`${contact.emails_opened} opened`}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round((contact.emails_opened / contact.emails_received) * 100)}% open
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
