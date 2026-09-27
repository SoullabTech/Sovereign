'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramGlyph from '@/components/iching/HexagramGlyph';
import { FacetOriginTrail } from '@/components/house/FacetOriginTrail';
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

  const experiences = useMemo(
    () => [...(change?.experiences ?? [])].sort((a, b) =>
      new Date(a.occurredAt || a.createdAt).getTime() - new Date(b.occurredAt || b.createdAt).getTime()),
    [change?.experiences],
  );

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
                <section className={styles.quiet}>
                  <small>NO SYMBOLIC LENS ADDED</small>
                  <p>This Change stands on its own without a consultation.</p>
                </section>
              )}

              <section className={styles.quiet}>
                <small>DEEPER PRACTICES REMAIN QUIET</small>
                <p>I Ching consultation, MAIA encounter, and pattern work are not opened in this act.</p>
              </section>
            </aside>
          </div>

          <section className={styles.trace} aria-label="The movement so far">
            <div className={styles.traceHead}>
              <span>THE MOVEMENT SO FAR</span>
              <em>Not progress. Just what has happened.</em>
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
        </div>
      </section>

      <aside className={styles.rightMembrane}>
        <span className={styles.orb} aria-hidden="true" />
        <strong>MAIA</strong>
        <p>Present when invited.</p>
        <div className={styles.maiaBoundary}>
          This first live shell does not open a conversation. The Change is allowed to exist before anyone interprets it.
        </div>
      </aside>

      <footer className={styles.footer}>CHANGE IS NOT A TASK TO COMPLETE. IT IS A MOVEMENT TO LIVE WITH.</footer>
    </main>
  );
}
