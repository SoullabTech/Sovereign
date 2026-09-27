'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { FacetOriginTrail } from '@/components/house/FacetOriginTrail';
import type { DecisionRecord } from '@/lib/studio/leadership/types';
import styles from '../decision-house.module.css';

function dateLabel(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function timePressureLabel(value: string | null) {
  if (!value || value === 'none') return 'No real deadline';
  if (value === 'low') return 'Some room';
  if (value === 'medium') return 'A decision is approaching';
  if (value === 'high') return 'Time is tight';
  return 'This needs attention now';
}

export default function PersonalDecisionRoom() {
  const params = useParams();
  const decisionId = String(params?.id || '');
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consulting, setConsulting] = useState(false);

  async function loadDecision() {
    const response = await apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '?scope=personal');
    if (!response.ok) throw new Error(response.status === 404 ? 'Decision not found' : 'Decision unavailable');
    const data = await response.json();
    setDecision(data.decision || null);
  }

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    void apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '?scope=personal')
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'Decision not found' : 'Decision unavailable');
        const data = await response.json();
        if (live) setDecision(data.decision || null);
      })
      .catch((err) => { if (live) setError(err instanceof Error ? err.message : 'Decision unavailable'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [decisionId]);

  async function gatherPerspectives() {
    if (!decision || consulting) return;
    setConsulting(true);
    setError(null);
    try {
      const response = await apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '/consult?scope=personal', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Perspective could not be gathered');
      await loadDecision();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Perspective could not be gathered');
    } finally {
      setConsulting(false);
    }
  }

  const experiences = useMemo(
    () => [...(decision?.experiences || [])].sort((a,b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [decision?.experiences],
  );

  if (loading) return <div className={styles.decisionRoomLoading}><Loader2 className={styles.decisionSpinner} aria-hidden="true" /></div>;
  if (error && !decision) return <div className={styles.decisionRoomLoading}><p>{error}</p><Link href="/decisions">Return to Decisions →</Link></div>;
  if (!decision) return null;

  const council = decision.councilResult;
  const resolved = decision.status === 'complete';

  return (
    <section className={styles.personalDecisionRoom}>
      <Link href="/decisions" className={styles.namingBack}>← Decisions</Link>

      <div className={styles.decisionRoomArrival}>
        <div>
          <p className={styles.decisionKicker}>{resolved ? 'A CHOICE ALREADY MADE' : 'A DECISION IN VIEW'}</p>
          <h1>{decision.title}</h1>
          <p className={styles.decisionRoomDate}>Held since {dateLabel(decision.createdAt)}</p>
        </div>
        <aside>
          <small>THE CHOICE REMAINS YOURS</small>
          <p>Perspective may reveal more of the field. It does not decide what you should do.</p>
        </aside>
      </div>

      <FacetOriginTrail targetFacet="decisions" targetRefId={decisionId} className={styles.decisionOrigin} />

      <div className={styles.decisionRoomGrid}>
        <article className={styles.choicePaper}>
          <div className={styles.choicePaperMeta}>
            <span>{resolved ? 'Resolved' : 'The choice'}</span>
            <span>{dateLabel(decision.updatedAt || decision.createdAt)}</span>
          </div>
          <h2>{decision.title}</h2>
          <p>{decision.context}</p>

          <div className={styles.choiceContext}>
            {decision.stakes ? <section><small>WHAT FEELS AT STAKE</small><p>{decision.stakes}</p></section> : null}
            <section><small>TIME</small><p>{timePressureLabel(decision.timePressure)}</p></section>
            {decision.emotionalState ? <section><small>WHAT YOU NOTICED IN YOURSELF</small><p>{decision.emotionalState}</p></section> : null}
          </div>

          <a
            className={styles.holdToday}
            href={'/maia/anchor?from=house&sourceFacet=decisions&sourceRefId=' + encodeURIComponent(decisionId) + '&crossingId=decision-hold-today'}
          >
            Hold this choice today →
          </a>
        </article>

        <aside className={styles.perspectiveRail}>
          {!council ? (
            <section className={styles.gatherPerspective}>
              <small>OPTIONAL</small>
              <h3>Gather perspectives</h3>
              <p>
                Different lenses may expose assumptions, tensions, risks and possibilities. They do not produce the answer.
              </p>
              <button type="button" onClick={gatherPerspectives} disabled={consulting || resolved}>
                {consulting ? <><Loader2 className={styles.decisionSpinner} aria-hidden="true" /> Gathering…</> : 'Gather perspectives'}
              </button>
            </section>
          ) : (
            <section className={styles.perspectivesHeld}>
              <small>PERSPECTIVES GATHERED · {dateLabel(decision.consultedAt)}</small>
              <h3>More than one way to see the choice</h3>
              <p>The material below is provisional. Keep what helps you see; leave what does not.</p>
            </section>
          )}

          {experiences.length ? (
            <section className={styles.decisionMoments}>
              <small>WHAT HAS HAPPENED SINCE</small>
              {experiences.slice(0,3).map((experience) => (
                <div key={experience.id}>
                  <time>{dateLabel(experience.occurredAt || experience.createdAt)}</time>
                  <p>{experience.content}</p>
                </div>
              ))}
            </section>
          ) : null}
        </aside>
      </div>

      {council ? (
        <section className={styles.councilField} aria-label="Gathered perspectives">
          <header>
            <div>
              <small>THE FIELD FROM SEVERAL SIDES</small>
              <h2>Perspectives to think with</h2>
            </div>
            <p>None of these is the decision.</p>
          </header>

          {council.insights?.length ? (
            <div className={styles.councilSection}>
              <h3>What became visible</h3>
              <div className={styles.perspectiveCards}>
                {council.insights.map((item,index) => <p key={index}>{item}</p>)}
              </div>
            </div>
          ) : null}

          {council.tensions?.length ? (
            <div className={styles.councilSection}>
              <h3>Tensions worth holding</h3>
              <div className={styles.tensionList}>
                {council.tensions.map((item,index) => <p key={index}>{item}</p>)}
              </div>
            </div>
          ) : null}

          {council.risks?.length ? (
            <div className={styles.councilSection}>
              <h3>Risks and uncertainties</h3>
              <ul>{council.risks.map((item,index) => <li key={index}>{item}</li>)}</ul>
            </div>
          ) : null}

          {council.recommendation ? (
            <div className={styles.possibleDirection}>
              <small>ONE POSSIBLE DIRECTION</small>
              <p>{council.recommendation}</p>
              <span>A council suggestion, not a verdict.</span>
            </div>
          ) : null}
        </section>
      ) : null}

      {decision.iterations && decision.iterations.length > 1 ? (
        <section className={styles.earlierPerspective}>
          <small>EARLIER PERSPECTIVES</small>
          <div>
            {decision.iterations.slice(0,-1).map((iteration) => (
              <article key={iteration.id}>
                <time>{dateLabel(iteration.consultedAt)}</time>
                <p>{iteration.sessionNotes || 'A prior round of perspective was gathered here.'}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className={styles.decisionCreateError} role="alert">{error}</p> : null}
    </section>
  );
}