'use client';

import Link from 'next/link';
import PartnerBoard from './PartnerBoard';
import PartnerCommsPanel from './PartnerCommsPanel';
import FieldActivityFeed from './FieldActivityFeed';
import DecisionLedger from './DecisionLedger';
import IdeaField from './IdeaField';

const PALETTE = {
  primary: '#B08060',
  background: '#1A140E',
  text: '#E8DDD0',
  accent: '#8A6040',
};

// Partner relationship constants
const DM_THREAD_ID = '06221c92-9244-4dd5-a4fb-fc328e5d3576';
const MEMBER_IDS: Record<string, string> = {
  kelly: 'ce284751-e457-42f6-89b6-bc07d0876682',
  nathan: '7ce3b84c-a33c-4fcb-9aa8-03cf7a7eae78',
};
const PARTNER_NAMES: Record<string, string> = {
  kelly: 'Nathan Kane',
  nathan: 'Kelly',
};
const BACK_LINKS: Record<string, string> = {
  kelly: '/fields/kelly',
  nathan: '/fields/nathan',
};
const BACK_LABELS: Record<string, string> = {
  kelly: "← Kelly's Field",
  nathan: "← Nathan's Field",
};

interface Props {
  viewerSlug?: string;
}

export default function PartnerWorkspace({ viewerSlug = 'kelly' }: Props) {
  const palette = PALETTE;
  const viewerMemberId = MEMBER_IDS[viewerSlug] ?? MEMBER_IDS.kelly;
  const partnerName = PARTNER_NAMES[viewerSlug] ?? 'Partner';
  const backHref = BACK_LINKS[viewerSlug] ?? '/fields/kelly';
  const backLabel = BACK_LABELS[viewerSlug] ?? "← Field";

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: palette.background,
        fontFamily: 'sans-serif',
        padding: '2.5rem 2rem',
      }}
    >
      {/* Back */}
      <Link
        href={backHref}
        style={{
          fontSize: '0.7rem',
          color: `${palette.text}40`,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '2.5rem',
        }}
      >
        {backLabel}
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 300,
          color: palette.text,
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          Partner Workspace
        </h1>
        <p style={{
          margin: '0.4rem 0 0',
          fontSize: '0.85rem',
          color: `${palette.text}50`,
          fontWeight: 300,
        }}>
          {partnerName}
        </p>
        <div style={{
          width: '2.5rem',
          height: '1px',
          background: `${palette.primary}50`,
          marginTop: '1.25rem',
        }} />
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60fr 40fr',
        gap: '2rem',
        alignItems: 'start',
      }}>
        {/* Left: PartnerBoard */}
        <div style={{
          background: `${palette.primary}06`,
          border: `1px solid ${palette.primary}15`,
          padding: '1.5rem',
          borderRadius: '2px',
        }}>
          <PartnerBoard
            viewerSlug={viewerSlug}
            partnerSlug={viewerSlug === 'kelly' ? 'nathan' : 'kelly'}
            palette={palette}
          />
        </div>

        {/* Right: PartnerCommsPanel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ height: '520px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              margin: '0 0 0.75rem',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${palette.text}40`,
              fontWeight: 400,
            }}>
              Direct Thread
            </h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PartnerCommsPanel
                threadId={DM_THREAD_ID}
                viewerMemberId={viewerMemberId}
                partnerName={partnerName}
                palette={palette}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Idea Field — pre-decisional creative intelligence */}
      <div style={{
        marginTop: '2.5rem',
        background: `${palette.primary}06`,
        border: `1px solid ${palette.primary}15`,
        padding: '1.5rem',
        borderRadius: '2px',
      }}>
        <IdeaField fieldSlug="nathan" palette={palette} />
      </div>

      {/* Decision Ledger */}
      <div style={{
        marginTop: '2.5rem',
        background: `${palette.primary}06`,
        border: `1px solid ${palette.primary}15`,
        padding: '1.5rem',
        borderRadius: '2px',
      }}>
        <DecisionLedger fieldSlug="nathan" palette={palette} />
      </div>

      {/* Activity Feed */}
      <div style={{
        marginTop: '2.5rem',
        background: `${palette.primary}06`,
        border: `1px solid ${palette.primary}15`,
        padding: '1.25rem 1.5rem',
        borderRadius: '2px',
      }}>
        <FieldActivityFeed fieldSlug="kelly" palette={palette} />
      </div>

      {/* Bottom ambient rule */}
      <div style={{
        marginTop: '3rem',
        height: '1px',
        background: `${palette.primary}15`,
      }} />
    </div>
  );
}
