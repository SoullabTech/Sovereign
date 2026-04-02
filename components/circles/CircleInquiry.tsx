'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import type { CircleInquiryRow, CircleInquiryResponseRow, ResponseType } from '@/lib/circles/types';

const RESPONSE_TYPE_LABELS: Record<ResponseType, string> = {
  reflection: 'Reflection',
  witness: 'Witness',
  offering: 'Offering',
};

const RESPONSE_TYPE_DESCRIPTIONS: Record<ResponseType, string> = {
  reflection: 'What arises in you in response',
  witness: 'What you notice without interpreting',
  offering: 'Something you bring to the question',
};

interface CircleInquiryProps {
  circleId: string;
  inquiryId: string;
  memberId: string;
  memberRole: string;
}

type InquiryData = {
  inquiry: CircleInquiryRow & { opener_name: string | null };
  responses: (CircleInquiryResponseRow & { responder_name: string | null })[];
  hasResponded: boolean;
};

export function CircleInquiry({ circleId, inquiryId, memberId, memberRole }: CircleInquiryProps) {
  const [data, setData] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState<ResponseType>('reflection');
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiry = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/circles/${circleId}/inquiries/${inquiryId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Graceful
    }
  }, [circleId, inquiryId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchInquiry();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchInquiry]);

  const handleSubmit = async () => {
    if (!responseText.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/circles/${circleId}/inquiries/${inquiryId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseText: responseText.trim(), responseType }),
      });

      if (!res.ok) {
        const json = await res.json();
        if (res.status === 409 && json.error?.includes('already responded')) {
          // Already responded — refetch to reveal responses
          await fetchInquiry();
        } else {
          setError(json.error || 'Failed to submit response');
        }
        return;
      }

      // Success — refetch to get all responses (now visible post-contribution)
      setResponseText('');
      await fetchInquiry();
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (closing) return;
    setClosing(true);
    try {
      await apiFetch(`/api/circles/${circleId}/inquiries/${inquiryId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      // Reload page to reflect closed state
      window.location.reload();
    } catch {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <div className="h-2 w-2 animate-pulse rounded-full bg-maia-ink-20" />
        <span className="text-sm text-maia-ink-30">Loading inquiry...</span>
      </div>
    );
  }

  if (!data) return null;

  const { inquiry, responses, hasResponded } = data;
  const isOpener = inquiry.opened_by === memberId;
  const isOpen = inquiry.status === 'open';

  return (
    <div className="space-y-4">
      {/* Question card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-800/30 bg-amber-900/10 p-5"
      >
        <p className="text-xs text-amber-400/60 mb-2">
          {inquiry.opener_name ? `${inquiry.opener_name} asks` : 'An inquiry'}
        </p>
        <p className="text-lg text-maia-ink-90 font-medium italic leading-relaxed">
          &ldquo;{inquiry.question}&rdquo;
        </p>
      </motion.div>

      {/* Field synthesis (if integrating/closed) */}
      {inquiry.field_synthesis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-teal-800/30 bg-teal-900/10 p-4"
        >
          <p className="text-xs text-teal-400/60 mb-2">Field synthesis</p>
          <p className="text-sm text-maia-ink-70 leading-relaxed">{inquiry.field_synthesis}</p>
        </motion.div>
      )}

      {/* Response form — only if open and hasn't responded */}
      {isOpen && !hasResponded && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-maia-navy-700 bg-maia-navy-900/50 p-5"
        >
          <p className="text-xs text-maia-ink-40 mb-3">
            Others&apos; responses become visible after you offer yours.
          </p>

          {/* Response type selector */}
          <div className="flex gap-2 mb-3">
            {(['reflection', 'witness', 'offering'] as ResponseType[]).map((type) => (
              <button
                key={type}
                onClick={() => setResponseType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  responseType === type
                    ? 'bg-maia-spice-500/10 text-maia-spice-400 border border-maia-spice-500/30'
                    : 'text-maia-ink-40 hover:text-maia-ink-60 border border-transparent'
                }`}
                title={RESPONSE_TYPE_DESCRIPTIONS[type]}
              >
                {RESPONSE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder={RESPONSE_TYPE_DESCRIPTIONS[responseType]}
            className="w-full resize-none rounded-lg border border-maia-navy-700 bg-maia-navy-850 px-4 py-3 text-sm text-maia-ink-80 placeholder-maia-ink-20 focus:border-maia-spice-500/30 focus:outline-none"
            rows={4}
            maxLength={2000}
          />

          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!responseText.trim() || responseText.trim().length < 5 || submitting}
              className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 transition-colors hover:bg-maia-spice-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? 'Offering...' : 'Offer your response'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Already responded notice */}
      {isOpen && hasResponded && responses.length === 0 && (
        <p className="text-sm text-maia-ink-40 italic py-2">
          You have offered your response. Waiting for others.
        </p>
      )}

      {/* Responses — only visible after contributing (enforced server-side) */}
      <AnimatePresence>
        {responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-maia-ink-30 uppercase tracking-widest">
              What emerged
            </p>
            {responses.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl border p-4 ${
                  r.member_id === memberId
                    ? 'border-maia-spice-500/20 bg-maia-spice-500/5'
                    : 'border-maia-navy-700 bg-maia-navy-900/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-maia-ink-50">
                    {r.responder_name || 'Member'}
                  </span>
                  <span className="text-xs text-maia-ink-20">
                    {RESPONSE_TYPE_LABELS[r.response_type as ResponseType] || r.response_type}
                  </span>
                </div>
                <p className="text-sm text-maia-ink-70 leading-relaxed">{r.response_text}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button — opener only, open inquiries only */}
      {isOpen && isOpener && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleClose}
            disabled={closing}
            className="rounded-lg px-3 py-1.5 text-xs text-maia-ink-30 transition-colors hover:text-maia-ink-50 border border-transparent hover:border-maia-navy-700"
          >
            {closing ? 'Closing...' : 'Close inquiry'}
          </button>
        </div>
      )}
    </div>
  );
}
