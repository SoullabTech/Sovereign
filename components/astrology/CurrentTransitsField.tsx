'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiUrl } from '@/lib/http/apiBase';
import styles from './current-transits-field.module.css';

interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
  retrograde?: boolean;
}

interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  applying: boolean;
}

type NatalPoint = { sign?: string; degree?: number };
type BirthChartLike = Record<string, NatalPoint | unknown>;

export function CurrentTransitsField({
  birthChart,
  variant = 'astrology',
}: {
  birthChart?: BirthChartLike | null;
  variant?: 'astrology' | 'house';
}) {
  const [positions, setPositions] = useState<TransitPosition[]>([]);
  const [aspects, setAspects] = useState<TransitAspect[]>([]);
  const [calculatedAt, setCalculatedAt] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(apiUrl('/api/astrology/current-transits'), {
          method: birthChart ? 'POST' : 'GET',
          ...(birthChart ? {
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ birthChart }),
          } : {}),
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('current transits unavailable');
        const body = await response.json();
        if (!active) return;
        const nextPositions = Array.isArray(body?.data?.positions) ? body.data.positions : [];
        const nextAspects = Array.isArray(body?.data?.aspects) ? body.data.aspects : [];
        setPositions(nextPositions);
        setAspects(nextAspects);
        setCalculatedAt(typeof body?.calculatedAt === 'string' ? body.calculatedAt : null);
        setState('ready');
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === 'AbortError')) return;
        setState('unavailable');
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [birthChart]);

  const sky = useMemo(() => {
    const preferred = ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const ordered = [...positions].sort((a, b) => {
      const ai = preferred.indexOf(a.planet);
      const bi = preferred.indexOf(b.planet);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return ordered.slice(0, variant === 'house' ? 4 : 6);
  }, [positions, variant]);

  const activeAspects = useMemo(
    () => aspects.filter((aspect) => aspect.orb <= 3).slice(0, 4),
    [aspects],
  );

  return (
    <section
      className={styles.field}
      data-variant={variant}
      aria-label="Current transits"
    >
      <div className={styles.heading}>
        <div>
          <small>NOW · CURRENT TRANSITS</small>
          <h2>{variant === 'house' ? 'The sky is moving.' : 'The sky now.'}</h2>
        </div>
        <p>
          {variant === 'house'
            ? 'A living layer of the moment — weather, not fate.'
            : 'Current positions are calculated sky facts. Personal activation is shown only where an aspect to your natal chart is actually calculated.'}
        </p>
      </div>

      {state === 'loading' ? (
        <p className={styles.status}>Calculating the current sky…</p>
      ) : state === 'unavailable' ? (
        <p className={styles.status}>The current sky could not be reached just now.</p>
      ) : (
        <>
          <div className={styles.positions}>
            {sky.map((transit) => (
              <div key={transit.planet}>
                <small>{transit.planet}</small>
                <strong>
                  {transit.sign} · {transit.degree.toFixed(1)}°
                  {transit.retrograde ? ' ℞' : ''}
                </strong>
              </div>
            ))}
          </div>

          {variant === 'astrology' && activeAspects.length > 0 ? (
            <div className={styles.activations}>
              <small>ACTIVE NATAL CONTACTS</small>
              {activeAspects.map((aspect, index) => (
                <p key={`${aspect.transitPlanet}-${aspect.natalPlanet}-${aspect.aspectType}-${index}`}>
                  <strong>{aspect.transitPlanet}</strong> {aspect.aspectType} natal {aspect.natalPlanet}
                  <span> · {aspect.orb.toFixed(1)}° {aspect.applying ? 'applying' : 'separating'}</span>
                </p>
              ))}
            </div>
          ) : null}

          <div className={styles.footer}>
            <span>
              {calculatedAt ? `Calculated ${new Date(calculatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Current sky'}
            </span>
            <Link href="/astrology">
              {variant === 'house' ? 'Open Astrology →' : 'Explore the moment in your chart →'}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
