'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { DecisionRecord } from '@/lib/studio/leadership/types';
import styles from './decision-house.module.css';

type PersonalDecision = DecisionRecord & {
  childCount?: number;
  experienceCount?: number;
};

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(status: DecisionRecord['status']) {
  if (status === 'complete') return 'Resolved';
  if (status === 'consulting') return 'Gathering perspectives';
  if (status === 'active') return 'In view';
  if (status === 'draft') return 'Still forming';
  return status;
}

export default function PersonalDecisionsPage() {
  const [decisions, setDecisions] = useState<PersonalDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch('/api/studio/decisions?scope=personal');
        if (!response.ok) throw new Error('Decisions unavailable');
        const data = await response.json();
        if (live) setDecisions(Array.isArray(data.decisions) ? data.decisions : []);
      } catch {
        if (live) setError('Your Decisions could not be gathered just now.');
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => { live = false; };
  }, []);

  const openDecisions = useMemo(
    () => decisions.filter((decision) => decision.status !== 'complete' && decision.status !== 'archived'),
    [decisions],
  );
  const resolvedDecisions = useMemo(
    () => decisions.filter((decision) => decision.status === 'complete'),
    [decisions],
  );

  return (
    <section className={styles.decisionsThreshold}>
      <div className={styles.decisionArrival}>
        <div>
          <p className={styles.decisionKicker}>PERSONAL DECISIONS</p>
          <h1>What choice is asking something of you?</h1>
          <p className={styles.decisionLead}>
            Hold a real choice in view, gather perspective, and notice what changes — without handing the decision away.
          </p>
        </div>

        <aside className={styles.perspectiveNote}>
          <small>PERSPECTIVE WITHOUT SURRENDER</small>
          <p>
            Soullab can help expose tensions, assumptions, possibilities and questions. The choice remains yours.
          </p>
        </aside>
      </div>

      <div className={styles.decisionBegin}>
        <Link href="/decisions/new" className={styles.decisionBeginCard}>
          <small>BEGIN</small>
          <h2>Bring a decision into view</h2>
          <p>
            Name the choice in your own words first. You do not need to know the answer before you enter the room.
          </p>
          <span><span>What am I choosing?</span><b>→</b></span>
        </Link>

        <section className={styles.decisionOrientation}>
          <small>THIS ROOM IS FOR</small>
          <h3>Discernment, not optimization.</h3>
          <p>
            A Decision may gather perspective, lived consequences and later reconsideration. It is not a scorecard for the “best” answer.
          </p>
        </section>
      </div>

      <section className={styles.openChoices} aria-label="Open decisions">
        <div className={styles.openChoicesHead}>
          <div>
            <small>CHOICES STILL IN VIEW</small>
            <h2>Return without starting over</h2>
          </div>
          <p>{openDecisions.length ? openDecisions.length + ' open' : 'Nothing is asking to be held here yet.'}</p>
        </div>

        {loading ? (
          <div className={styles.decisionLoading}><Loader2 className={styles.decisionSpinner} aria-hidden="true" /></div>
        ) : error ? (
          <div className={styles.decisionError}>{error}</div>
        ) : openDecisions.length === 0 ? (
          <div className={styles.decisionEmpty}>
            <div>
              <h3>No open Decisions.</h3>
              <p>When a real choice needs room, begin with the question rather than the answer.</p>
            </div>
          </div>
        ) : (
          <div className={styles.decisionGrid}>
            {openDecisions.map((decision) => (
              <Link href={'/decisions/' + decision.id} className={styles.decisionCard} key={decision.id}>
                <div className={styles.decisionCardMeta}>
                  <span>{statusLabel(decision.status)}</span>
                  <time>{dateLabel(decision.updatedAt || decision.createdAt)}</time>
                </div>
                <h3>{decision.title}</h3>
                <p>{decision.context}</p>
                <footer>
                  <span>
                    {decision.consultedAt
                      ? 'Perspectives gathered'
                      : (decision.experienceCount || 0) > 0
                        ? (decision.experienceCount || 0) + ' lived moment' + (decision.experienceCount === 1 ? '' : 's')
                        : 'No perspective gathered yet'}
                  </span>
                  <b>Open this Decision →</b>
                </footer>
              </Link>
            ))}
          </div>
        )}
      </section>

      {!loading && resolvedDecisions.length > 0 ? (
        <section className={styles.resolvedChoices} aria-label="Resolved decisions">
          <header>
            <small>CHOICES ALREADY MADE</small>
            <p>Resolved does not mean the council was right. It means you chose.</p>
          </header>
          <div>
            {resolvedDecisions.slice(0, 6).map((decision) => (
              <Link href={'/decisions/' + decision.id} key={decision.id}>
                <span>{decision.title}</span>
                <time>{dateLabel(decision.updatedAt || decision.createdAt)}</time>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}