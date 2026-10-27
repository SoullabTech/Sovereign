'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { WriterStudioFeature, WriterStudioPlan } from '@/lib/writersStudio/planPolicy';

type WriterPlanReply = {
  plan?: WriterStudioPlan;
  pilotEligible?: boolean;
  complimentary?: boolean;
  paymentEnabled?: boolean;
  publicEnrollmentEnabled?: boolean;
  included?: Partial<Record<WriterStudioFeature, boolean>>;
  heldSeparately?: readonly string[];
};

const HELD_LABELS: Readonly<Record<string, string>> = {
  new_original_file_ingest: 'new original-file ingest',
  member_pdf_epub_delivery: 'member PDF / EPUB delivery',
  live_provider_inference: 'live provider-backed MAIA inference',
  deletion_safe_recovery: 'deletion-safe backup and recovery',
  cloud_offline_sync: 'cloud / offline sync',
  automatic_publisher_submission: 'automatic publisher submission',
};

/**
 * Product orientation only. The server resolves the member's plan; this
 * component never grants a room, interprets a query parameter, or changes an
 * operation held by its own source/security authority.
 */
export default function WriterStudioPlanNotice() {
  const [decision, setDecision] = useState<WriterPlanReply | null>(null);

  useEffect(() => {
    let current = true;
    void apiFetch('/api/sovereign/writers-studio/plan', { method: 'GET' })
      .then(async (response) => response.ok ? response.json() as Promise<WriterPlanReply> : null)
      .then((body) => { if (current && body?.plan) setDecision(body); })
      .catch(() => { if (current) setDecision(null); });
    return () => { current = false; };
  }, []);

  if (!decision) return null;

  const pro = decision.plan === 'pro';
  const complimentaryPro = pro &&
    decision.pilotEligible === true &&
    decision.complimentary === true &&
    decision.paymentEnabled === false;
  const held = (decision.heldSeparately ?? [])
    .map((item) => HELD_LABELS[item] ?? item.replaceAll('_', ' '));

  return (
    <aside className="ws-plan-notice" aria-label="Writer’s Studio plan">
      <details>
        <summary>
          {complimentaryPro ? 'Studio Pro · Complimentary beta' : pro ? 'Studio Pro' : 'Studio Free'}
        </summary>
        <div className="ws-plan-notice-body">
          <strong>
            {complimentaryPro
              ? 'Your invited beta access includes every currently approved Pro room at no charge.'
              : pro
                ? 'Your current Studio plan is Pro.'
                : 'Your current Studio plan is Free.'}
          </strong>
          <p>
            {pro
              ? 'Write, Develop, Review, Publish preparation and Listen remain one author-owned Studio. MAIA proposes; you decide.'
              : 'Free preserves real writing, foundational Develop and Review, foundational MAIA, author-controlled change, essential ownership and privacy.'}
          </p>
          {held.length > 0 ? (
            <p className="ws-plan-notice-held">
              Held independently for every plan: {held.join(', ')}.
            </p>
          ) : null}
          <Link href="/writers-studio/plans">See the complete Free + Pro experience</Link>
        </div>
      </details>
    </aside>
  );
}
