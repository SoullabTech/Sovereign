'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MessageCircle, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramGlyph from '@/components/iching/HexagramGlyph';
import { FacetOriginTrail } from '@/components/house/FacetOriginTrail';
import { OracleConversation } from '@/components/OracleConversation';
import type { ChangeExperienceType, ChangeRecord } from '@/lib/studio/changes/types';
import styles from './change-room.module.css';

const TYPE_LABELS: Record<string, string> = {
  dissolution: 'Dissolution',
  emergence: 'Emergence',
  threshold: 'Threshold',
  integration: 'Integration',
  upheaval: 'Upheaval',
  ripening: 'Ripening',
};

const STATUS_LABELS: Record<string, string> = {
  naming: 'Named',
  casting: 'Casting',
  consulting: 'Consulting',
  active: 'Active',
  integrating: 'Integrating',
  complete: 'Complete',
  archived: 'Archived',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  reflection: 'Reflection',
  field_event: 'Moment',
  breakthrough: 'Breakthrough',
  setback: 'Setback',
  dream: 'Dream',
  synchronicity: 'Synchronicity',
};

function formatDate(value?: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getHexagramLines(hexagramNumber: number | null): boolean[] {
  if (!hexagramNumber) return [true, true, true, true, true, true];
  return hexagramNumber.toString(2).padStart(6, '0').split('').map((bit) => bit === '1');
}

export default function ChangeRoom({ changeId }: { changeId: string }) {
  const [change, setChange] = useState<ChangeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [noticeType, setNoticeType] = useState<ChangeExperienceType>('field_event');
  const [noticeSaving, setNoticeSaving] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [consultOpen, setConsultOpen] = useState(false);
  const [castMethod, setCastMethod] = useState<'coin' | 'yarrow'>('coin');
  const [casting, setCasting] = useState(false);
  const [castError, setCastError] = useState<string | null>(null);
  const [maiaOpen, setMaiaOpen] = useState(false);
  const [maiaInjection, setMaiaInjection] = useState<{ text: string; nonce: number } | null>(null);
  const [changeContextShared, setChangeContextShared] = useState(false);
  const [patternOpen, setPatternOpen] = useState(false);
  const [meaningText, setMeaningText] = useState('');
  const [meaningSaving, setMeaningSaving] = useState(false);
  const [meaningError, setMeaningError] = useState<string | null>(null);

  async function loadChange() {
    const response = await apiFetch('/api/changes/' + encodeURIComponent(changeId));
    if (!response.ok) throw new Error(response.status === 404 ? 'Change not found' : 'Could not load this Change');
    const json = await response.json();
    setChange(json.change ?? null);
  }

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);

    void apiFetch('/api/changes/' + encodeURIComponent(changeId))
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'Change not found' : 'Could not load this Change');
        const json = await response.json();
        if (live) setChange(json.change ?? null);
      })
      .catch((err) => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load this Change');
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => { live = false; };
  }, [changeId]);

  async function keepNotice() {
    const content = noticeText.trim();
    if (!content || noticeSaving) return;
    setNoticeSaving(true);
    setNoticeError(null);
    try {
      const response = await apiFetch('/api/changes/' + encodeURIComponent(changeId) + '/experiences', {
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
      await loadChange();
    } catch (err) {
      setNoticeError(err instanceof Error ? err.message : 'Could not keep this moment');
    } finally {
      setNoticeSaving(false);
    }
  }


  async function castIChing() {
    if (casting || change?.hexagramNumber) return;
    setCasting(true);
    setCastError(null);
    try {
      const response = await apiFetch('/api/changes/' + encodeURIComponent(changeId) + '/cast', {
        method: 'POST',
        body: JSON.stringify({ method: castMethod }),
      });
      if (!response.ok) throw new Error('The cast could not be kept');
      await loadChange();
      setConsultOpen(false);
    } catch (err) {
      setCastError(err instanceof Error ? err.message : 'The cast could not be kept');
    } finally {
      setCasting(false);
    }
  }

  const experiences = useMemo(
    () => [...(change?.experiences ?? [])].sort((a, b) =>
      new Date(a.occurredAt || a.createdAt).getTime() - new Date(b.occurredAt || b.createdAt).getTime()),
    [change?.experiences],
  );



  const recurrenceEvidence = useMemo(() => {
    const STOP = new Set([
      'about','after','again','against','because','before','being','between','could','didnt','doesnt',
      'from','have','into','just','more','much','only','other','really','that','their','there','these',
      'they','this','through','very','what','when','where','which','while','with','would','your',
      'felt','feel','feels','something','thing','things','today','still','than','then','them','were',
    ]);
    const byWord = new Map<string, Set<string>>();
    const byType = new Map<string, number>();

    for (const exp of experiences) {
      byType.set(exp.experienceType, (byType.get(exp.experienceType) || 0) + 1);
      const words = new Set(
        exp.content.toLowerCase()
          .replace(/[^a-z0-9'\s-]/g, ' ')
          .split(/\s+/)
          .map((word) => word.replace(/^'+|'+$/g, ''))
          .filter((word) => word.length >= 5 && !STOP.has(word)),
      );
      for (const word of words) {
        const ids = byWord.get(word) || new Set<string>();
        ids.add(exp.id);
        byWord.set(word, ids);
      }
    }

    const repeatedWords = [...byWord.entries()]
      .filter(([, ids]) => ids.size >= 2)
      .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([word, ids]) => ({ word, count: ids.size }));

    const repeatedTypes = [...byType.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        label: EXPERIENCE_LABELS[type] || type,
        count,
      }));

    return { repeatedWords, repeatedTypes };
  }, [experiences]);


  function askMaiaAboutRecurrence() {
    if (!change || experiences.length === 0) return;
    const words = recurrenceEvidence.repeatedWords.map((item) => item.word + ' ×' + item.count).join(', ');
    const kinds = recurrenceEvidence.repeatedTypes.map((item) => item.label + ' ' + item.count).join(', ');
    const evidence = experiences.map((exp) =>
      '- ' + formatDate(exp.occurredAt || exp.createdAt) + ' · ' +
      (EXPERIENCE_LABELS[exp.experienceType] || 'Moment') + ': ' + exp.content
    );
    const text = [
      'I am explicitly bringing the temporal evidence from my Living Change into this conversation.',
      'Change: ' + change.title,
      words ? 'Exact words that reappear across distinct moments: ' + words : 'No repeated words are being surfaced.',
      kinds ? 'Kinds of moments that recur: ' + kinds : 'No repeated experience kinds are being surfaced.',
      'The moments themselves:',
      ...evidence,
      'Please offer at most one tentative hypothesis about what may be recurring. Name it clearly as a possibility, distinguish it from the evidence above, and ask me what I make of it. Do not treat your hypothesis as established meaning.',
    ].join('\n\n');
    setMaiaInjection({ text, nonce: Date.now() });
    setPatternOpen(false);
    setMaiaOpen(true);
  }

  async function keepMemberMeaning() {
    const content = meaningText.trim();
    if (!content || meaningSaving) return;
    setMeaningSaving(true);
    setMeaningError(null);
    try {
      const response = await apiFetch('/api/changes/' + encodeURIComponent(changeId) + '/experiences', {
        method: 'POST',
        body: JSON.stringify({
          experienceType: 'reflection',
          content,
          occurredAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Could not keep your meaning');
      setMeaningText('');
      await loadChange();
    } catch (err) {
      setMeaningError(err instanceof Error ? err.message : 'Could not keep your meaning');
    } finally {
      setMeaningSaving(false);
    }
  }

  function bringChangeContextToMaia() {
    if (!change) return;
    const parts = [
      'Context I am explicitly bringing from my Living Change:',
      'Title: ' + change.title,
      'What I wrote about what is changing: ' + (change.description || '(no description yet)'),
    ];
    if (change.followUpIntention) parts.push('What I am carrying now: ' + change.followUpIntention);
    else if (change.emotionalState) parts.push('What feels current now: ' + change.emotionalState);
    const recent = experiences.slice(-1)[0];
    if (recent) parts.push('Most recent moment I kept: ' + recent.content);
    parts.push('Please stay close to what I have actually written here. Help me explore it without deciding what this Change means for me.');
    setMaiaInjection({ text: parts.join('\n\n'), nonce: Date.now() });
    setChangeContextShared(true);
  }

  if (loading) {
    return <main className={styles.loading}><Loader2 className={styles.spinner} /> <span>Gathering this Change.</span></main>;
  }

  if (error || !change) {
    return (
      <main className={styles.loading}>
        <p>{error || 'Change not found'}</p>
        <Link href="/changes">Return to Changes →</Link>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <div className={styles.fieldAsset} aria-hidden="true" />

      <aside className={styles.leftMembrane}>
        <Link className={styles.brand} href="/house">Soullab</Link>
        <small>THE INNER LIFE<br />LIVES HERE</small>
        <nav>
          <Link href="/house">Home</Link>
          <span>Changes</span>
          <Link href="/journal">Journal</Link>
          <Link href="/relationships">Relationships</Link>
          <Link href="/dream?from=house">Dream</Link>
          <Link href="/maia">MAIA</Link>
        </nav>
        <blockquote>A life can change<br />before we know<br />what to call it.</blockquote>
      </aside>

      <section className={styles.room}>
        <header className={styles.topline}>
          <span>SOULLAB HOUSE&nbsp;&nbsp;/&nbsp;&nbsp;CHANGES</span>
          <em>Stay close to what is moving.</em>
        </header>

        <div className={styles.stage}>
          <Link className={styles.back} href="/changes"><ArrowLeft aria-hidden="true" /> All Changes</Link>
          <p className={styles.kicker}>A change you are living</p>
          <h1>{change.title}</h1>
          <p className={styles.lead}>You do not have to understand the whole movement to stay in relationship with it.</p>

          <FacetOriginTrail targetFacet="changes" targetRefId={changeId} className={styles.origin} />

          {!maiaOpen && !patternOpen ? (
            <button type="button" className={styles.mobileMaiaDoor} onClick={() => setMaiaOpen(true)}>
              <MessageCircle aria-hidden="true" />
              <span>Explore with MAIA</span>
            </button>
          ) : null}

          {patternOpen ? (
            <section className={styles.patternView} aria-label="Temporal pattern view">
              <div className={styles.patternTop}>
                <div>
                  <p className={styles.kicker}>Member-grounded evidence</p>
                  <h2>What has been recurring?</h2>
                  <p>These are observable recurrences in what you have kept here. No meaning is assigned to them.</p>
                </div>
                <button type="button" onClick={() => setPatternOpen(false)}>Return to the Change</button>
              </div>

              <div className={styles.patternField}>
                <section className={styles.patternTimeline}>
                  <div className={styles.patternTimelineHead}>
                    <span>YOUR MOMENTS, IN TIME</span>
                    <em>Each point is something you actually kept.</em>
                  </div>
                  <div className={styles.patternLine}>
                    {experiences.length === 0 ? (
                      <p className={styles.patternEmpty}>There are not enough kept moments yet to show recurrence.</p>
                    ) : experiences.map((exp, index) => (
                      <article className={styles.patternNode} key={exp.id}>
                        <span className={styles.patternPoint} data-now={index === experiences.length - 1 ? 'true' : 'false'} />
                        <small>{formatDate(exp.occurredAt || exp.createdAt)}</small>
                        <strong>{EXPERIENCE_LABELS[exp.experienceType] || 'Moment'}</strong>
                        <p>{exp.content}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className={styles.evidenceRail}>
                  <section>
                    <small>WORDS THAT REAPPEAR</small>
                    {recurrenceEvidence.repeatedWords.length ? (
                      <div className={styles.evidenceChips}>
                        {recurrenceEvidence.repeatedWords.map((item) => (
                          <span key={item.word}>{item.word} <b>×{item.count}</b></span>
                        ))}
                      </div>
                    ) : <p>No exact word recurrence is strong enough to show yet.</p>}
                  </section>

                  <section>
                    <small>KINDS OF MOMENTS THAT RECUR</small>
                    {recurrenceEvidence.repeatedTypes.length ? (
                      <div className={styles.evidenceList}>
                        {recurrenceEvidence.repeatedTypes.map((item) => (
                          <div key={item.label}><span>{item.label}</span><b>{item.count}</b></div>
                        ))}
                      </div>
                    ) : <p>No experience type repeats yet.</p>}
                  </section>

                  <section className={styles.maiaHypothesisDoor}>
                    <small>MAIA MAY OFFER A HYPOTHESIS</small>
                    <p>She can look at the same evidence and offer one possibility. It stays a hypothesis unless you make something of it.</p>
                    <button type="button" onClick={askMaiaAboutRecurrence}>Ask MAIA what she notices →</button>
                  </section>

                  <section className={styles.memberMeaning}>
                    <small>YOUR MEANING</small>
                    <p>If something has become clear to you, put it in your own words. Only your words are kept as part of this Change.</p>
                    <textarea
                      value={meaningText}
                      onChange={(event) => setMeaningText(event.target.value)}
                      placeholder="What do you make of what has been recurring?"
                      aria-label="What this recurrence means to me"
                    />
                    {meaningError ? <p className={styles.noticeError} role="alert">{meaningError}</p> : null}
                    <button type="button" onClick={keepMemberMeaning} disabled={!meaningText.trim() || meaningSaving}>
                      {meaningSaving ? <Loader2 className={styles.spinner} aria-hidden="true" /> : null}
                      Keep my meaning
                    </button>
                  </section>

                  <section className={styles.hypothesisBoundary}>
                    <small>MEANING IS STILL OPEN</small>
                    <p>A recurrence is evidence that something appeared more than once. MAIA's hypothesis is not your meaning, and neither becomes part of this Change unless you choose your own words to keep.</p>
                  </section>
                </aside>
              </div>
            </section>
          ) : maiaOpen ? (
            <section className={styles.encounter} aria-label="Explore this Change with MAIA">
              <article className={styles.changeAnchor}>
                <div className={styles.paperMeta}>
                  <span>THE CHANGE REMAINS IN VIEW</span>
                  <span>{formatDate(change.createdAt)}</span>
                </div>
                <h2>{change.title}</h2>
                <p>{change.description || 'This Change has been named, but no description has been added yet.'}</p>
                {experiences.length > 0 ? (
                  <div className={styles.encounterMoment}>
                    <small>MOST RECENT MOMENT</small>
                    <p>{experiences[experiences.length - 1].content}</p>
                  </div>
                ) : null}
                <div className={styles.contextConsent}>
                  <small>CONTEXT STAYS WITH YOU UNTIL YOU SEND IT</small>
                  <p>MAIA knows only that you are in Changes until you explicitly bring this Change into the conversation.</p>
                  <button type="button" onClick={bringChangeContextToMaia}>
                    {changeContextShared ? 'Bring the current context again' : 'Bring this Change to MAIA'} <span>→</span>
                  </button>
                </div>
              </article>

              <div className={styles.maiaChamber}>
                <div className={styles.maiaChamberHead}>
                  <div className={styles.maiaChamberIdentity}>
                    <span className={styles.orb} aria-hidden="true" />
                    <div>
                      <small>MAIA · LIVING CHANGE</small>
                      <strong>Stay with what is moving</strong>
                    </div>
                  </div>
                  <button type="button" onClick={() => setMaiaOpen(false)} aria-label="Return to Change">
                    <X aria-hidden="true" />
                  </button>
                </div>
                <div className={styles.maiaConversation}>
                  <OracleConversation
                    userId={change.memberId || undefined}
                    sessionId={'living-change-' + changeId}
                    presentationMode="contained"
                    initialShowChatInterface
                    voiceEnabled
                    showAnalytics={false}
                    shouldRenderArrival={false}
                    surface="maia"
                    placeContext={{
                      placeId: 'changes',
                      placeName: 'Changes',
                      route: '/changes',
                      purpose: 'A room for noticing and reflecting on transitions over time.',
                      objectType: 'change',
                      objectId: changeId,
                    }}
                    injectedMessage={maiaInjection}
                    onSessionEnd={() => setMaiaOpen(false)}
                  />
                </div>
              </div>
            </section>
          ) : (
            <>
          <div className={styles.field}>
            <article className={styles.changePaper}>
              <div className={styles.paperMeta}>
                <span>Living Change</span>
                <span>{formatDate(change.createdAt)}</span>
              </div>

              <h2>What is changing?</h2>
              <p className={styles.description}>{change.description || 'This Change has been named, but no description has been added yet.'}</p>

              {(change.emotionalState || change.followUpIntention) && (
                <div className={styles.present}>
                  <small>{change.followUpIntention ? 'WHAT YOU ARE CARRYING NOW' : 'WHAT FEELS CURRENT NOW'}</small>
                  <p>{change.followUpIntention || change.emotionalState}</p>
                </div>
              )}

              <footer className={styles.paperFooter}>
                <span>{TYPE_LABELS[change.changeType] || change.changeType}</span>
                <span>{STATUS_LABELS[change.status] || change.status}</span>
              </footer>
            </article>

            <aside className={styles.side}>
              {experiences.slice(-2).reverse().map((exp) => (
                <section className={styles.moment} key={exp.id}>
                  <small>{EXPERIENCE_LABELS[exp.experienceType] || 'Moment'} · {formatDate(exp.occurredAt || exp.createdAt)}</small>
                  <p>{exp.content}</p>
                </section>
              ))}

              <section className={styles.notice}>
                {!noticeOpen ? (
                  <button type="button" className={styles.noticeDoor} onClick={() => setNoticeOpen(true)}>
                    <span><Plus aria-hidden="true" /> Notice what happened</span>
                    <span>→</span>
                  </button>
                ) : (
                  <div className={styles.noticeForm}>
                    <div className={styles.noticeHead}>
                      <div>
                        <small>NOTICE</small>
                        <h3>What happened?</h3>
                      </div>
                      <button type="button" className={styles.closeNotice} onClick={() => setNoticeOpen(false)} aria-label="Close notice">
                        <X aria-hidden="true" />
                      </button>
                    </div>
                    <textarea
                      value={noticeText}
                      onChange={(event) => setNoticeText(event.target.value)}
                      placeholder="Write what happened before you decide what kind of moment it was."
                      aria-label="What happened"
                      autoFocus
                    />
                    {noticeText.trim() ? (
                      <div className={styles.noticeKinds}>
                        <span>This was more like…</span>
                        {[
                          ['field_event', 'a moment'],
                          ['reflection', 'a reflection'],
                          ['dream', 'a dream'],
                          ['breakthrough', 'a breakthrough'],
                          ['setback', 'a setback'],
                          ['synchronicity', 'a synchronicity'],
                        ].map(([value, label]) => (
                          <button
                            type="button"
                            key={value}
                            data-active={noticeType === value}
                            onClick={() => setNoticeType(value as ChangeExperienceType)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {noticeError ? <p className={styles.noticeError} role="alert">{noticeError}</p> : null}
                    <button type="button" className={styles.keepNotice} disabled={!noticeText.trim() || noticeSaving} onClick={keepNotice}>
                      {noticeSaving ? <Loader2 className={styles.spinner} aria-hidden="true" /> : null}
                      Keep this moment
                    </button>
                  </div>
                )}
              </section>

              {change.hexagramNumber ? (
                <section className={styles.symbolic}>
                  <div>
                    <small>SYMBOLIC LENS ALREADY HELD</small>
                    <h3>{change.hexagramName || 'Hexagram ' + change.hexagramNumber}</h3>
                    <p>Hexagram {change.hexagramNumber}{change.changingLines?.length ? ' · changing lines ' + change.changingLines.join(', ') : ''}</p>
                  </div>
                  <HexagramGlyph
                    lines={getHexagramLines(change.hexagramNumber)}
                    changingLines={change.changingLines}
                    size="sm"
                  />
                </section>
              ) : (
                <section className={styles.consult}>
                  {!consultOpen ? (
                    <>
                      <small>AN OPTIONAL SYMBOLIC PRACTICE</small>
                      <p>This Change does not need a reading. If you want another lens, you can bring it to the Book of Changes.</p>
                      <button type="button" className={styles.consultDoor} onClick={() => setConsultOpen(true)}>
                        Consult the I Ching <span>→</span>
                      </button>
                    </>
                  ) : (
                    <div className={styles.consultForm}>
                      <div className={styles.consultHead}>
                        <div>
                          <small>THE BOOK OF CHANGES</small>
                          <h3>How would you like to ask?</h3>
                        </div>
                        <button type="button" className={styles.closeNotice} onClick={() => setConsultOpen(false)} aria-label="Close I Ching consultation">
                          <X aria-hidden="true" />
                        </button>
                      </div>
                      <p className={styles.consultLead}>The cast is a symbolic mirror for this Change. It does not decide what the Change means or what you should do.</p>
                      <div className={styles.castMethods}>
                        <button type="button" data-active={castMethod === 'coin'} onClick={() => setCastMethod('coin')}>
                          <strong>Three Coins</strong>
                          <span>Six tosses of three coins.</span>
                        </button>
                        <button type="button" data-active={castMethod === 'yarrow'} onClick={() => setCastMethod('yarrow')}>
                          <strong>Yarrow Stalks</strong>
                          <span>A slower contemplative method.</span>
                        </button>
                      </div>
                      {castError ? <p className={styles.noticeError} role="alert">{castError}</p> : null}
                      <button type="button" className={styles.castButton} disabled={casting} onClick={castIChing}>
                        {casting ? <><Loader2 className={styles.spinner} aria-hidden="true" /> Casting…</> : 'Cast the hexagram'}
                      </button>
                    </div>
                  )}
                </section>
              )}

              <section className={styles.quiet}>
                <small>DEEPER PRACTICES REMAIN QUIET</small>
                <p>Pattern work remains unopened in this act.</p>
              </section>
            </aside>
          </div>

          <section className={styles.trace} aria-label="The movement so far">
            <div className={styles.traceHead}>
              <div>
                <span>THE MOVEMENT SO FAR</span>
                <em>Not progress. Just what has happened.</em>
              </div>
              <button type="button" onClick={() => setPatternOpen(true)} disabled={experiences.length === 0}>
                See what has been recurring →
              </button>
            </div>

            {experiences.length > 0 ? (
              <div className={styles.timeline}>
                <div className={styles.node}>
                  <small>WHEN THIS BEGAN</small>
                  <p>{change.description || change.title}</p>
                </div>
                {experiences.map((exp, index) => (
                  <div className={styles.node + ' ' + (index === experiences.length - 1 ? styles.now : '')} key={exp.id}>
                    <small>{EXPERIENCE_LABELS[exp.experienceType] || 'MOMENT'} · {formatDate(exp.occurredAt || exp.createdAt)}</small>
                    <p>{exp.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyTrace}>
                <span className={styles.traceDot} aria-hidden="true" />
                <p>This Change has a beginning. Nothing else has been recorded yet.</p>
              </div>
            )}
          </section>

            </>
          )}
        </div>
      </section>

      <aside className={styles.rightMembrane}>
        <span className={styles.orb} aria-hidden="true" />
        <strong>MAIA</strong>
        <p>{maiaOpen ? 'Here with this Change.' : patternOpen ? 'Quiet while you look across time.' : 'Present when invited.'}</p>
        {maiaOpen ? (
          <button type="button" className={styles.maiaReturn} onClick={() => setMaiaOpen(false)}>
            Return to the Change
          </button>
        ) : !patternOpen ? (
          <button type="button" className={styles.maiaDoor} onClick={() => setMaiaOpen(true)}>
            <MessageCircle aria-hidden="true" />
            <span>Explore with MAIA</span>
          </button>
        ) : null}
        <div className={styles.maiaBoundary}>
          {maiaOpen
            ? 'Opening the chamber does not send the Change to MAIA. You choose whether to bring its context into the conversation.'
            : 'The Change is allowed to exist before anyone interprets it.'}
        </div>
      </aside>

      <footer className={styles.footer}>CHANGE IS NOT A TASK TO COMPLETE. IT IS A MOVEMENT TO LIVE WITH.</footer>
    </main>
  );
}
