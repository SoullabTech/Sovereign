"use client";

/**
 * REFERRAL INBOX
 *
 * View incoming and sent referrals.
 * Accept or decline warm handoffs from colleagues.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Inbox,
  Send,
  Clock,
  Check,
  X,
  Loader2,
  User,
  AlertTriangle,
  Lock,
  Calendar,
} from 'lucide-react';

interface ReferralView {
  id: string;
  from_practitioner_id: string;
  to_practitioner_id: string;
  status: 'draft' | 'sent' | 'received' | 'accepted' | 'declined' | 'closed';
  client_age_range: string | null;
  client_pronouns: string | null;
  presenting_themes: string[];
  urgency: 'routine' | 'soon' | 'time_sensitive';
  constraints: string[];
  client_consent_given: boolean;
  client_name_shared: boolean;
  client_name: string | null;
  client_contact: string | null;
  consent_recorded_at: string | null;
  my_note: string | null;
  their_note_exists: boolean;
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  from_name?: string;
  to_name?: string;
}

interface ReferralInboxProps {
  onSelectReferral?: (referral: ReferralView) => void;
}

export default function ReferralInbox({ onSelectReferral }: ReferralInboxProps) {
  const [inbox, setInbox] = useState<ReferralView[]>([]);
  const [sent, setSent] = useState<ReferralView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/practitioner/referrals/requests');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setInbox(data.inbox || []);
      setSent(data.sent || []);
    } catch (err) {
      console.error('[ReferralInbox] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (referralId: string, response: 'accepted' | 'declined') => {
    try {
      setRespondingTo(referralId);

      const res = await fetch(`/api/practitioner/referrals/requests/${referralId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response,
          recipient_note: responseNote || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to respond');

      setResponseNote('');
      await fetchReferrals();
    } catch (err) {
      console.error('[ReferralInbox] Respond error:', err);
    } finally {
      setRespondingTo(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: ReferralView['status']) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
      sent: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      received: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      accepted: 'bg-green-500/10 text-green-400 border-green-500/30',
      declined: 'bg-red-500/10 text-red-400 border-red-500/30',
      closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: ReferralView['urgency']) => {
    if (urgency === 'routine') return null;

    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
          urgency === 'time_sensitive'
            ? 'bg-red-500/10 text-red-400 border-red-500/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}
      >
        <AlertTriangle className="w-3 h-3" />
        {urgency === 'time_sensitive' ? 'Urgent' : 'Soon'}
      </span>
    );
  };

  const ReferralCard = ({
    referral,
    type,
  }: {
    referral: ReferralView;
    type: 'inbox' | 'sent';
  }) => {
    const isActionable =
      type === 'inbox' && ['sent', 'received'].includes(referral.status);

    return (
      <div
        className={`p-4 rounded-lg border transition-colors ${
          isActionable
            ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge(referral.status)}
            {getUrgencyBadge(referral.urgency)}
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(referral.created_at)}
          </span>
        </div>

        {/* Client descriptors */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User className="w-4 h-4 text-gray-500" />
            <span>
              {[
                referral.client_age_range,
                referral.client_pronouns,
              ]
                .filter(Boolean)
                .join(', ') || 'No demographics specified'}
            </span>
          </div>

          {referral.presenting_themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {referral.presenting_themes.map((theme, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {referral.constraints.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {referral.constraints.map((constraint, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded"
                >
                  {constraint}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Consent/identity info */}
        {referral.client_consent_given && referral.client_name_shared && referral.client_name && (
          <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg mb-3">
            <p className="text-xs text-green-400 mb-1 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Consent recorded
            </p>
            <p className="text-sm text-gray-200">{referral.client_name}</p>
            {referral.client_contact && (
              <p className="text-xs text-gray-400">{referral.client_contact}</p>
            )}
          </div>
        )}

        {/* My note */}
        {referral.my_note && (
          <div className="p-2 bg-gray-800/50 rounded-lg mb-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {type === 'inbox' ? 'Your note' : 'Your private note'}
            </p>
            <p className="text-sm text-gray-300">{referral.my_note}</p>
          </div>
        )}

        {/* Action buttons for inbox */}
        {isActionable && (
          <div className="space-y-3 pt-3 border-t border-gray-700/50">
            <Textarea
              value={respondingTo === referral.id ? responseNote : ''}
              onChange={(e) => setResponseNote(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 resize-none text-sm"
              placeholder="Add a note (optional)..."
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleRespond(referral.id, 'accepted')}
                disabled={respondingTo === referral.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {respondingTo === referral.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRespond(referral.id, 'declined')}
                disabled={respondingTo === referral.id}
                className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const pendingInbox = inbox.filter((r) =>
    ['sent', 'received'].includes(r.status)
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Inbox className="w-5 h-5 text-sacred-gold" />
          Referrals
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="inbox" className="space-y-4">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="inbox" className="data-[state=active]:bg-gray-700">
              <Inbox className="w-4 h-4 mr-1" />
              Inbox ({pendingInbox.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-gray-700">
              <Send className="w-4 h-4 mr-1" />
              Sent ({sent.length})
            </TabsTrigger>
          </TabsList>

          {/* Inbox */}
          <TabsContent value="inbox" className="space-y-3">
            {inbox.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No referrals received</p>
                <p className="text-gray-500 text-sm mt-1">
                  Connect with colleagues to receive warm handoffs
                </p>
              </div>
            ) : (
              inbox.map((referral) => (
                <ReferralCard key={referral.id} referral={referral} type="inbox" />
              ))
            )}
          </TabsContent>

          {/* Sent */}
          <TabsContent value="sent" className="space-y-3">
            {sent.length === 0 ? (
              <div className="text-center py-8">
                <Send className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No referrals sent</p>
                <p className="text-gray-500 text-sm mt-1">
                  Send warm handoffs to trusted colleagues
                </p>
              </div>
            ) : (
              sent.map((referral) => (
                <ReferralCard key={referral.id} referral={referral} type="sent" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
