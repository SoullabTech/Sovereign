'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  CONSTELLATION_ARRIVAL_PARAM,
  CONSTELLATION_AUDIENCE_PARAM,
  CONSTELLATION_CAMPAIGN_PARAM,
  writerArrivalContext,
} from '@/lib/constellation/arrival';

export function ConstellationArrival() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDoorwayArrival = searchParams?.get(CONSTELLATION_ARRIVAL_PARAM) === 'doorway';
  const audienceId = searchParams?.get(CONSTELLATION_AUDIENCE_PARAM);
  const context = useMemo(() => writerArrivalContext(audienceId), [audienceId]);

  if (!isDoorwayArrival) return null;

  const clearArrival = () => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.delete(CONSTELLATION_ARRIVAL_PARAM);
    next.delete(CONSTELLATION_AUDIENCE_PARAM);
    next.delete(CONSTELLATION_CAMPAIGN_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <section
      aria-label="Writer’s Studio arrival"
      data-constellation-arrival=""
      style={{
        margin: '18px auto 0',
        width: 'min(920px, calc(100% - 32px))',
        border: '1px solid rgba(73, 66, 55, 0.16)',
        borderRadius: 18,
        background: 'rgba(249, 246, 239, 0.92)',
        boxShadow: '0 12px 42px rgba(45, 38, 29, 0.06)',
        padding: '22px 24px',
        color: '#38332d',
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          color: '#777064',
        }}
      >
        Welcome to Writer’s Studio
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--fr-serif), Georgia, serif',
          fontSize: 'clamp(18px, 2vw, 23px)',
          lineHeight: 1.45,
        }}
      >
        {context.opening}
      </p>
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: 16,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <button
          type="button"
          onClick={clearArrival}
          style={{
            border: 0,
            borderRadius: 999,
            padding: '10px 16px',
            background: '#35564f',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Begin with my work
        </button>
        <span style={{ fontSize: 12, color: '#7e776c' }}>
          This arrival context is temporary. It does not become a label on you.
        </span>
      </div>
    </section>
  );
}
