'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { FacetOriginTrail } from '@/components/house/FacetOriginTrail';
import type { DecisionRecord, ExperienceType } from '@/lib/studio/leadership/types';
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
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [noticeType, setNoticeType] = useState<ExperienceType>('field_event');
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [revisitOpen, setRevisitOpen] = useState(false);
  const [revisitNotes, setRevisitNotes] = useState('');
  const [revisitState, setRevisitState] = useState('');
  const [revisiting, setRevisiting] = useState(false);
  const [revisitError, setRevisitError] = useState<string | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [choiceText, setChoiceText] = useState('');
  const [choiceSaving, setChoiceSaving] = useState(false);
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [reopening, setReopening] = useState(false);

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

  async function keepNotice() {
    const content = noticeText.trim();
    if (!content || noticeSaving) return;
    setNoticeSaving(true);
    setNoticeError(null);
    try {
      const response = await apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '/experiences?scope=personal', {
        method: 'POST',
        body: JSON.stringify({
          experienceType: noticeType,
          content,
          occurredAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Could not keep this moment');
      setNoticeText('');
      setNoticeType('field_event');
      setNoticeOpen(false);
      await loadDecision();
    } catch (err) {
      setNoticeError(err instanceof Error ? err.message : 'Could not keep this moment');
    } finally {
      setNoticeSaving(false);
    }
  }

  async function revisitPerspective() {
    const sessionNotes = revisitNotes.trim();
    if (!sessionNotes || revisiting) return;
    setRevisiting(true);
    setRevisitError(null);
    try {
      const response = await apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '/consult?scope=personal', {
        method: 'POST',
        body: JSON.stringify({
          sessionNotes,
          emotionalState: revisitState.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error('Perspective could not be revisited');
      setRevisitNotes('');
      setRevisitState('');
      setRevisitOpen(false);
      await loadDecision();
    } catch (err) {
      setRevisitError(err instanceof Error ? err.message : 'Perspective could not be revisited');
    } finally {
      setRevisiting(false);
    }
  }

  async function keepChoice() {
    const content = choiceText.trim();
    if (!content || choiceSaving) return;
    setChoiceSaving(true);
    setChoiceError(null);
    try {
      const response = await apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '/choice?scope=personal', {
        method: 'POST',
        body: JSON.stringify({ action: 'record_choice', choiceText: content }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Could not keep what you chose');
      }
      setChoiceText('');
      setChoiceOpen(false);
      await loadDecision();
    } catch (err) {
      setChoiceError(err instanceof Error ? err.message : 'Could not keep what you chose');
    } finally {
      setChoiceSaving(false);
    }
  }

  async function reopenDecision() {
    if (reopening) return;
    setReopening(true);
    setChoiceError(null);
    try {
      const response = await apiFetch('/api/studio/decisions/' + encodeURIComponent(decisionId) + '/choice?scope=personal', {
        method: 'POST',
        body: JSON.stringify({ action: 'reopen' }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Could not reopen this Decision');
      }
      setChoiceOpen(false);
      setChoiceText('');
      await loadDecision();
    } catch (err) {
      setChoiceError(err instanceof Error ? err.message : 'Could not reopen this Decision');
    } finally {
      setReopening(false);
    }
  }

  if (loading) return <div className={styles.decisionRoomLoading}><Loader2 className={styles.decisionSpinner} aria-hidden="true" /></div>;
  if (error && !decision) return <div className={styles.decisionRoomLoading}><p>{error}</p><Link href="/decisions">Return to Decisions →</Link></div>;
  if (!decision) return null;

  const council = decision.councilResult;
  const currentChoice = decision.currentChoice || null;
  const resolutionStanding = decision.resolutionStanding || (decision.status === 'complete' ? 'legacy_complete_without_choice' : 'open');
  const resolved = resolutionStanding === 'choice_recorded';
  const legacyComplete = resolutionStanding === 'legacy_complete_without_choice';
  const canGatherPerspective = resolutionStanding === 'open' && decision.status !== 'consulting';

  return (
    <section className={styles.personalDecisionRoom}>
      <Link href="/decisions" className={styles.namingBack}>← Decisions</Link>

      <div className={styles.decisionRoomArrival}>
        <div>
          <p className={styles.decisionKicker}>{resolved ? 'A CHOICE YOU MADE' : legacyComplete ? 'A RESOLUTION TO RECLAIM' : 'A DECISION IN VIEW'}</p>
          <h1>{decision.title}</h1>
          <p className={styles.decisionRoomDate}>Held since {dateLabel(decision.createdAt)}</p>
        </div>
        <aside>
          <small>{resolved ? 'YOUR WORDS HOLD THE RESOLUTION' : 'THE CHOICE REMAINS YOURS'}</small>
          <p>{resolved ? 'Soullab keeps what you chose in your words. Earlier perspective remains perspective.' : 'Perspective may reveal more of the field. It does not decide what you should do.'}</p>
        </aside>
      </div>

      <FacetOriginTrail targetFacet="decisions" targetRefId={decisionId} className={styles.decisionOrigin} />

      <div className={styles.decisionRoomGrid}>
        <article className={styles.choicePaper} data-resolved={resolved ? 'true' : 'false'}>
          <div className={styles.choicePaperMeta}>
            <span>{resolved ? 'What I chose' : legacyComplete ? 'Resolved before choice recording' : 'The choice'}</span>
            <span>{resolved && currentChoice ? 'Recorded ' + dateLabel(currentChoice.recordedAt) : dateLabel(decision.updatedAt || decision.createdAt)}</span>
          </div>

          {resolved && currentChoice ? (
            <>
              <h2 className={styles.chosenWords}>{currentChoice.choiceText}</h2>
              <p className={styles.chosenRecord}>Recorded in Soullab {dateLabel(currentChoice.recordedAt)}.</p>
              <section className={styles.originalDecision}>
                <small>THE DECISION I WAS HOLDING</small>
                <h3>{decision.title}</h3>
                <p>{decision.context}</p>
              </section>
            </>
          ) : (
            <>
              <h2>{decision.title}</h2>
              <p>{decision.context}</p>
            </>
          )}

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
          <section className={styles.resolutionChamber} data-standing={resolutionStanding}>
            {resolved && currentChoice ? (
              <>
                <small>WHAT I CHOSE</small>
                <p className={styles.resolutionExcerpt}>{currentChoice.choiceText}</p>
                <span>Recorded {dateLabel(currentChoice.recordedAt)}. Reopening does not erase this choice.</span>
                <button type="button" onClick={reopenDecision} disabled={reopening}>
                  {reopening ? <Loader2 className={styles.decisionSpinner} aria-hidden="true" /> : null}
                  Reopen this Decision
                </button>
              </>
            ) : legacyComplete ? (
              <>
                <small>OLDER RESOLUTION</small>
                <h3>Soullab knows this was marked resolved, but not what you chose.</h3>
                <p>No choice will be inferred from Council, notes, or memory.</p>
                {!choiceOpen ? (
                  <div className={styles.legacyActions}>
                    <button type="button" onClick={() => setChoiceOpen(true)}>Record what I chose →</button>
                    <button type="button" onClick={reopenDecision} disabled={reopening}>
                      {reopening ? 'Reopening…' : 'Reopen this Decision'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.choiceForm}>
                    <label htmlFor="legacy-choice-text">What did you choose?</label>
                    <textarea
                      id="legacy-choice-text"
                      value={choiceText}
                      onChange={(event) => setChoiceText(event.target.value)}
                      placeholder="Write the choice in your own words."
                      aria-label="What did you choose"
                      autoFocus
                    />
                    <button type="button" onClick={keepChoice} disabled={!choiceText.trim() || choiceSaving}>
                      {choiceSaving ? <Loader2 className={styles.decisionSpinner} aria-hidden="true" /> : null}
                      Keep what I chose
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {!choiceOpen ? (
                  <>
                    <small>RESOLUTION</small>
                    <h3>Have you chosen?</h3>
                    <p>You can keep what you chose without consulting the Council or accepting any earlier suggestion.</p>
                    <button type="button" onClick={() => setChoiceOpen(true)}>I have chosen →</button>
                  </>
                ) : (
                  <div className={styles.choiceForm}>
                    <header>
                      <div>
                        <small>YOUR CHOICE</small>
                        <h3>What did you choose?</h3>
                      </div>
                      <button type="button" onClick={() => setChoiceOpen(false)} aria-label="Close choice">
                        <X aria-hidden="true" />
                      </button>
                    </header>
                    <textarea
                      value={choiceText}
                      onChange={(event) => setChoiceText(event.target.value)}
                      placeholder="Put the choice in your own words. Nothing from Council is copied here."
                      aria-label="What did you choose"
                      autoFocus
                    />
                    <p>Only your words will become the recorded resolution of this Decision.</p>
                    <button type="button" className={styles.keepChoice} onClick={keepChoice} disabled={!choiceText.trim() || choiceSaving}>
                      {choiceSaving ? <Loader2 className={styles.decisionSpinner} aria-hidden="true" /> : null}
                      Keep what I chose
                    </button>
                  </div>
                )}
              </>
            )}
            {choiceError ? <p className={styles.decisionCreateError} role="alert">{choiceError}</p> : null}
          </section>

          <section className={styles.decisionNotice}>
            {!noticeOpen ? (
              <button type="button" className={styles.decisionNoticeDoor} onClick={() => setNoticeOpen(true)}>
                <span><Plus aria-hidden="true" /> Notice what changed</span>
                <span>→</span>
              </button>
            ) : (
              <div className={styles.decisionNoticeForm}>
                <header>
                  <div>
                    <small>NOTICE</small>
                    <h3>What happened around this choice?</h3>
                  </div>
                  <button type="button" onClick={() => setNoticeOpen(false)} aria-label="Close notice">
                    <X aria-hidden="true" />
                  </button>
                </header>
                <textarea
                  value={noticeText}
                  onChange={(event) => setNoticeText(event.target.value)}
                  placeholder="Write what actually happened before deciding what it means."
                  aria-label="What changed around this choice"
                  autoFocus
                />
                {noticeText.trim() ? (
                  <div className={styles.decisionNoticeKinds}>
                    <span>This was more like…</span>
                    {[
                      ['field_event', 'a moment'],
                      ['reflection', 'a reflection'],
                      ['breakthrough', 'a breakthrough'],
                      ['setback', 'a setback'],
                    ].map(([value,label]) => (
                      <button
                        type="button"
                        key={value}
                        data-active={noticeType === value ? 'true' : 'false'}
                        onClick={() => setNoticeType(value as ExperienceType)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {noticeError ? <p className={styles.decisionCreateError} role="alert">{noticeError}</p> : null}
                <button
                  type="button"
                  className={styles.keepDecisionNotice}
                  disabled={!noticeText.trim() || noticeSaving}
                  onClick={keepNotice}
                >
                  {noticeSaving ? <Loader2 className={styles.decisionSpinner} aria-hidden="true" /> : null}
                  Keep this moment
                </button>
              </div>
            )}
          </section>

          {!council ? (
            <section className={styles.gatherPerspective}>
              <small>OPTIONAL</small>
              <h3>Gather perspectives</h3>
              <p>
                Different lenses may expose assumptions, tensions, risks and possibilities. They do not produce the answer.
              </p>
              <button type="button" onClick={gatherPerspectives} disabled={consulting || !canGatherPerspective}>
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

          {canGatherPerspective ? (
            <section className={styles.revisitPerspective}>
              {!revisitOpen ? (
                <>
                  <small>WHEN REALITY CHANGES</small>
                  <h3>Look again with what has happened since</h3>
                  <p>A new round should begin from new lived evidence, not from the assumption that the earlier direction was right.</p>
                  <button type="button" onClick={() => setRevisitOpen(true)}>Revisit perspective →</button>
                </>
              ) : (
                <div className={styles.revisitForm}>
                  <header>
                    <div>
                      <small>NEW EVIDENCE</small>
                      <h3>What is different now?</h3>
                    </div>
                    <button type="button" onClick={() => setRevisitOpen(false)} aria-label="Close revisit">
                      <X aria-hidden="true" />
                    </button>
                  </header>
                  {experiences.length ? (
                    <div className={styles.recentEvidence}>
                      <small>RECENTLY KEPT</small>
                      {experiences.slice(0,3).map((experience) => (
                        <p key={experience.id}>{experience.content}</p>
                      ))}
                    </div>
                  ) : null}
                  <textarea
                    value={revisitNotes}
                    onChange={(event) => setRevisitNotes(event.target.value)}
                    placeholder="What has actually changed since the last perspective?"
                    aria-label="What is different now"
                  />
                  <input
                    value={revisitState}
                    onChange={(event) => setRevisitState(event.target.value)}
                    placeholder="Optional: what do you notice in yourself now?"
                    aria-label="What do you notice in yourself now"
                  />
                  {revisitError ? <p className={styles.decisionCreateError} role="alert">{revisitError}</p> : null}
                  <button type="button" className={styles.revisitSubmit} onClick={revisitPerspective} disabled={!revisitNotes.trim() || revisiting}>
                    {revisiting ? <Loader2 className={styles.decisionSpinner} aria-hidden="true" /> : null}
                    Gather perspective again
                  </button>
                </div>
              )}
            </section>
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

      {decision.choiceHistory && decision.choiceHistory.some((event) => event.eventType === 'choice_recorded') ? (
        <section className={styles.choiceHistory}>
          <small>CHOICES PREVIOUSLY RECORDED</small>
          <div>
            {decision.choiceHistory
              .filter((event) => event.eventType === 'choice_recorded')
              .map((event) => (
                <article key={event.id} data-current={currentChoice?.id === event.id ? 'true' : 'false'}>
                  <time>{dateLabel(event.recordedAt)}</time>
                  <p>{event.choiceText}</p>
                  {currentChoice?.id === event.id ? <span>Current recorded choice</span> : <span>Earlier choice · preserved</span>}
                </article>
              ))}
          </div>
        </section>
      ) : null}

      {error ? <p className={styles.decisionCreateError} role="alert">{error}</p> : null}
    </section>
  );
}