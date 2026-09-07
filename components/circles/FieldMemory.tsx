'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import type { CircleInquiryRow } from '@/lib/circles/types';

type InquiryListItem = CircleInquiryRow & {
  opener_name: string | null;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface FieldMemoryProps {
  circleId: string;
}

export function FieldMemory({ circleId }: FieldMemoryProps) {
  const [inquiries, setInquiries] = useState<InquiryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch closed and integrating inquiries
        const [closedRes, integratingRes] = await Promise.all([
          apiFetch(`/api/circles/${circleId}/inquiries?status=closed`),
          apiFetch(`/api/circles/${circleId}/inquiries?status=integrating`),
        ]);

        const closedJson = closedRes.ok ? await closedRes.json() : { inquiries: [] };
        const integratingJson = integratingRes.ok ? await integratingRes.json() : { inquiries: [] };

        if (!cancelled) {
          const all = [
            ...(integratingJson.inquiries || []),
            ...(closedJson.inquiries || []),
          ].sort((a: any, b: any) =>
            new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime()
          );
          setInquiries(all);
        }
      } catch {
        // Graceful
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [circleId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <div className="h-2 w-2 animate-pulse rounded-full bg-maia-ink-20" />
        <span className="text-sm text-maia-ink-30">Loading journey...</span>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-maia-ink-30 leading-relaxed">
          This circle&apos;s journey has just begun.
        </p>
        <p className="mt-1 text-xs text-maia-ink-20">
          Past inquiries and their syntheses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-maia-ink-30 uppercase tracking-widest">
        The journey so far
      </p>

      {inquiries.map((inquiry, i) => (
        <motion.div
          key={inquiry.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-maia-navy-700 bg-maia-navy-900/30 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-maia-ink-70 italic leading-relaxed">
                &ldquo;{inquiry.question}&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-maia-ink-20">
                <span>{formatDate(inquiry.opened_at)}</span>
                {inquiry.opener_name && <span>{inquiry.opener_name}</span>}
                <span
                  className={`rounded-md px-1.5 py-0.5 ${
                    inquiry.status === 'integrating'
                      ? 'bg-teal-900/20 text-teal-400/60'
                      : 'bg-maia-navy-800 text-maia-ink-30'
                  }`}
                >
                  {inquiry.status}
                </span>
              </div>
            </div>
          </div>

          {inquiry.field_synthesis && (
            <div className="mt-3 rounded-lg border border-teal-800/20 bg-teal-900/5 px-3 py-2">
              <p className="text-xs text-teal-400/50 mb-1">Synthesis</p>
              <p className="text-sm text-maia-ink-50 leading-relaxed">
                {inquiry.field_synthesis}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
