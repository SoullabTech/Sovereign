'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { FacetCarryNotice, type FacetCarryRef } from '@/components/house/FacetCarryNotice';
import styles from '../decision-house.module.css';

const TIME_PRESSURES = [
  ['none', 'No real deadline'],
  ['low', 'Some room'],
  ['medium', 'A decision is approaching'],
  ['high', 'Time is tight'],
  ['urgent', 'This needs attention now'],
] as const;

export default function NewPersonalDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams?.get('parent') || null;
  const sourceFacet = searchParams?.get('sourceFacet');
  const sourceRefId = searchParams?.get('sourceRefId');
  const crossingId = searchParams?.get('crossingId');
  const carrySourceRef: FacetCarryRef | null =
    (sourceFacet === 'journal' || sourceFacet === 'reflections' || sourceFacet === 'ideas' || sourceFacet === 'relationships') && sourceRefId && crossingId
      ? { sourceFacet, sourceRefId, crossingId }
      : null;

  const [carryReady, setCarryReady] = useState(carrySourceRef ? false : true);
  const [parentTitle, setParentTitle] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [stakes, setStakes] = useState('');
  const [timePressure, setTimePressure] = useState('none');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!parentId) return;
    let live = true;
    void apiFetch('/api/studio/decisions/' + encodeURIComponent(parentId) + '?scope=personal')
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (live) setParentTitle(data.decision?.title || null);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [parentId]);

  const wordsExist = title.trim().length > 0 && context.trim().length > 0;
  const canKeep = wordsExist && carryReady && !saving;

  async function keepDecision() {
    if (!canKeep) return;
    setSaving(true);
    setError(null);
    try {
      const response = await apiFetch('/api/studio/decisions', {
        method: 'POST',
        body: JSON.stringify({
          scope: 'personal',
          title: title.trim(),
          context: context.trim(),
          stakes: stakes.trim() || null,
          timePressure,
          emotionalState: state.trim() || null,
          situationType: 'self',
          parentDecisionId: parentId || undefined,
          sourceRef: carrySourceRef || undefined,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Could not keep this Decision');
      }
      const data = await response.json();
      router.push('/decisions/' + data.decision.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not keep this Decision');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.namingDecision}>
      <Link href="/decisions" className={styles.namingBack}>← Decisions</Link>

      <div className={styles.namingDecisionIntro}>
        <p className={styles.decisionKicker}>BEGIN WITH THE CHOICE</p>
        <h1>What are you deciding?</h1>
        <p>
          Put the choice into your own words before asking for perspective. It can be unfinished, conflicted, or hard to name.
        </p>
      </div>

      {parentTitle ? (
        <div className={styles.parentDecision}>
          <small>CONTINUING FROM</small>
          <p>{parentTitle}</p>
          <span>The earlier Decision is context. It does not pre-write this one.</span>
        </div>
      ) : null}

      {carrySourceRef ? (
        <div className={styles.decisionCarry}>
          <FacetCarryNotice
            targetFacet="decisions"
            sourceRef={carrySourceRef}
            onResolved={(source) => setCarryReady(Boolean(source))}
          />
        </div>
      ) : null}

      <div className={styles.decisionPaper}>
        <section className={styles.decisionWriteField}>
          <header>
            <label htmlFor="decision-title">The choice</label>
            <p>Say the choice as plainly as you can.</p>
          </header>
          <input
            ref={titleRef}
            id="decision-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Do I stay, leave, begin, decline, ask, wait…?"
          />
        </section>

        <section className={styles.decisionWriteField}>
          <header>
            <label htmlFor="decision-context">What makes this a real choice now?</label>
            <p>Write what you actually know. Uncertainty can stay visible.</p>
          </header>
          <textarea
            id="decision-context"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="What is happening around this choice? What do you know, and what is still uncertain?"
            rows={7}
          />
        </section>

        <p className={styles.decisionPaperNote}>Clarity is not required before the Decision can be held.</p>
      </div>

      <section className={styles.decisionContextThreshold} data-open={wordsExist ? 'true' : 'false'}>
        {!wordsExist ? (
          <p>Once the choice is in your own words, you can add the context that may matter.</p>
        ) : (
          <>
            <header>
              <div>
                <small>ONLY WHAT HELPS YOU SEE</small>
                <h2>What else belongs around this choice?</h2>
              </div>
              <p>These details inform perspective. They do not determine an answer.</p>
            </header>

            <div className={styles.decisionContextGrid}>
              <label>
                <span>What feels at stake?</span>
                <textarea
                  value={stakes}
                  onChange={(event) => setStakes(event.target.value)}
                  placeholder="What could be gained, lost, protected, changed, or disappointed?"
                  rows={4}
                />
              </label>

              <label>
                <span>How much time is actually here?</span>
                <select value={timePressure} onChange={(event) => setTimePressure(event.target.value)}>
                  {TIME_PRESSURES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label>
                <span>What do you notice in yourself?</span>
                <input
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  placeholder="Pulled, relieved, afraid, clear, divided, ready…"
                />
              </label>
            </div>
          </>
        )}
      </section>

      <div className={styles.decisionKeep}>
        <div>
          <small>{canKeep ? 'READY TO KEEP' : 'NOTHING IS KEPT YET'}</small>
          <p>{canKeep ? 'Perspective can be gathered after the Decision exists.' : 'Your words remain yours until you choose to keep this Decision.'}</p>
        </div>
        <button type="button" disabled={!canKeep} onClick={keepDecision}>
          {saving ? <Loader2 className={styles.decisionSpinner} aria-hidden="true" /> : null}
          Keep this Decision
        </button>
      </div>

      {error ? <p className={styles.decisionCreateError} role="alert">{error}</p> : null}
    </section>
  );
}