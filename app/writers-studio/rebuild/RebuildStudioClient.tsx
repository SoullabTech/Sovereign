 'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { ATMOSPHERES, atmosphereVariables } from '../atmosphere/atmospheres';
import { SERIF, SANS } from '../studioTheme';
import { useLivingWorks } from '../useLivingWorks';
import { currentWork, resolveWorkContext } from '../workContext';
import { asOutline, chapterNodeFor, chapterSpanFor, wordCount, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { OutlineNode } from '@/lib/writersStudio/focus/outlineTree';
import { focusOn, focusRequest, composerPrompt } from '@/lib/writersStudio/focus/studioFocus';
import { runChapterReview, findingsForSection, lensCounts, type ChapterReviewBundle } from '@/lib/writersStudio/rebuild/chapterReview';

interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload = ContextReady | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type Phase = 'loading' | 'ready' | 'unauthorized' | 'error';
type MaiaMode = 'chapter' | 'passage';

const C = {
  shell: 'var(--ws-ground-base, #F2F0EA)',
  panel: 'var(--ws-ground-raised, #EAE6DC)',
  field: 'var(--ws-ground-field, #F7F4ED)',
  active: 'var(--ws-ground-active, #DED5C0)',
  ink: 'var(--ws-ink-primary, #26231E)',
  secondary: 'var(--ws-ink-secondary, #4C473E)',
  muted: 'var(--ws-ink-muted, #766E61)',
  quiet: 'var(--ws-ink-quiet, #9A9185)',
  rule: 'var(--ws-rule, #CFC7B8)',
  soft: 'var(--ws-rule-soft, #DDD6CA)',
  gold: 'var(--ws-gold-text, #8A6727)',
  goldFill: 'var(--ws-gold-fill, #CDBD91)',
};

function labelWithoutPrefix(h: string | null): string {
  if (!h) return 'Untitled section';
  return h.replace(/^Chapter\s+\d+\s*:\s*/i, '').trim() || h;
}

function OutlineBranch({
  node, focusId, chapterId, onSelect, level = 0,
}: {
  node: OutlineNode; focusId: string | null; chapterId: string | null;
  onSelect: (id: string, role: OutlineNode['role']) => void; level?: number;
}) {
  const active = node.draftSectionId === focusId;
  const inChapter = node.draftSectionId === chapterId;
  const visibleLabel = node.heading ?? `Section ${node.position}`;
  const show = node.role === 'part' || node.role === 'chapter' || node.depth === 2 || level <= 2;
  if (!show) return null;
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.draftSectionId, node.role)}
        style={{
          width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
          background: inChapter ? 'color-mix(in srgb, var(--ws-gold-fill, #CDBD91) 42%, transparent)' : 'transparent',
          color: active ? C.ink : C.secondary,
          fontFamily: SANS, fontSize: level === 0 ? 13 : 12.5,
          lineHeight: 1.35, fontWeight: inChapter || active ? 650 : 480,
          padding: `7px 10px 7px ${10 + level * 14}px`,
          borderRadius: 7,
          borderLeft: active && !inChapter ? `3px solid ${C.gold}` : '3px solid transparent',
        }}
      >
        <span style={{ opacity: node.children.length ? .55 : 0, marginRight: 6 }}>⌄</span>
        {visibleLabel}
      </button>
      {node.children.length > 0 && node.children.map((child) => (
        <OutlineBranch key={child.draftSectionId} node={child} focusId={focusId}
          chapterId={chapterId} onSelect={onSelect} level={level + 1} />
      ))}
    </div>
  );
}

export default function RebuildStudioClient() {
  const params = useSearchParams();
  const requested = params?.get('m') ?? null;
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [maiaMode, setMaiaMode] = useState<MaiaMode>('chapter');
  const [mobilePane, setMobilePane] = useState<'outline' | 'manuscript' | 'maia'>('manuscript');
  const [review, setReview] = useState<ChapterReviewBundle | null>(null);
  const [reviewPhase, setReviewPhase] = useState<'idle' | 'reading' | 'ready' | 'partial'>('idle');
  const [reviewProgress, setReviewProgress] = useState<{ done: number; total: number; lens: string } | null>(null);
  const [maiaAsk, setMaiaAsk] = useState('');
  const [maiaResponse, setMaiaResponse] = useState<string | null>(null);
  const [maiaFailure, setMaiaFailure] = useState<string | null>(null);
  const [maiaBusy, setMaiaBusy] = useState(false);
  const sessionIdRef = useRef('');
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const { phase: worksPhase, works } = useLivingWorks();

  const load = useCallback(async () => {
    setPhase('loading'); setMessage(null);
    let manuscriptId = requested;
    try {
      if (!manuscriptId) {
        const list = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (list.status === 401) { setPhase('unauthorized'); return; }
        if (!list.ok) throw new Error('manuscript list');
        const body = await list.json();
        const manuscripts = Array.isArray(body?.manuscripts) ? body.manuscripts : [];
        if (manuscripts.length !== 1) {
          setPhase('error');
          setMessage('Open the rebuild with a specific manuscript.');
          return;
        }
        manuscriptId = manuscripts[0].id;
      }
      const resolvedManuscriptId = manuscriptId;
      if (!resolvedManuscriptId) throw new Error('manuscript identity');
      const res = await apiFetch(`/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(resolvedManuscriptId)}`);
      if (res.status === 401) { setPhase('unauthorized'); return; }
      if (!res.ok) throw new Error('context');
      const body = await res.json() as ContextPayload;
      if (body.state !== 'section_aware') {
        setPhase('error');
        setMessage('This manuscript is not section-addressable yet. The rebuild will not guess at its structure.');
        return;
      }
      setContext(body);
      const chapter10 = body.sections.find((s) => /^Chapter 10\b/i.test(s.heading ?? ''));
      setFocusId(chapter10?.draftSectionId ?? body.sections[0]?.draftSectionId ?? null);
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('The rebuilt Studio could not read this manuscript just now. Nothing has changed.');
    }
  }, [requested]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!sessionIdRef.current && typeof crypto !== 'undefined') {
      sessionIdRef.current = `writers-studio-rebuild-${crypto.randomUUID()}`;
    }
  }, []);

  const tree = useMemo(() => context ? asOutline(context.sections) : [], [context]);
  const focusSection = context?.sections.find((s) => s.draftSectionId === focusId) ?? null;
  const chapter = context && focusId ? chapterSpanFor(context.sections, focusId) : null;
  const chapterNode = focusId ? chapterNodeFor(tree, focusId) : null;
  const workContext = resolveWorkContext(worksPhase, works, context?.manuscriptId ?? null);
  const work = currentWork(workContext);
  const chapterRootId = chapter?.root.draftSectionId ?? null;

  useEffect(() => {
    setReview(null);
    setReviewPhase('idle');
    setReviewProgress(null);
  }, [chapterRootId]);

  const reviewFindingsForMovement = useCallback((section: RebuildSection) => {
    if (!review || !chapter) return [];
    const movements = chapter.sections.filter((s) => s.headingDepth === 2);
    const idx = movements.findIndex((s) => s.draftSectionId === section.draftSectionId);
    if (idx < 0) return findingsForSection(review.findings, section.draftSectionId);
    const next = movements[idx + 1]?.position ?? Number.POSITIVE_INFINITY;
    const ids = new Set(chapter.sections.filter((s) => s.position >= section.position && s.position < next).map((s) => s.draftSectionId));
    return review.findings.filter((f) => f.sectionIds.some((id) => ids.has(id)));
  }, [review, chapter]);

  const runReview = useCallback(async () => {
    if (!chapter || !context || reviewPhase === 'reading') return;
    setReviewPhase('reading');
    setReviewProgress({ done: 0, total: 7, lens: 'development' });
    const bundle = await runChapterReview(context.manuscriptId, chapter.sections, (done, total, lens) => {
      setReviewProgress({ done, total, lens });
    });
    setReview(bundle);
    setReviewPhase(bundle.failures.length === 0 ? 'ready' : 'partial');
  }, [chapter, context, reviewPhase]);

  const selectSection = useCallback((id: string, role: OutlineNode['role']) => {
    setFocusId(id);
    setMaiaMode(role === 'chapter' ? 'chapter' : 'passage');
    requestAnimationFrame(() => sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const title = context?.title ?? 'Writer’s Studio';
  const chapterTitle = chapter?.root.heading ?? focusSection?.heading ?? 'Manuscript';
  const chapterName = labelWithoutPrefix(chapter?.root.heading ?? null);
  const focusName = focusSection?.heading ?? 'this section';
  const chapterWords = chapter ? wordCount(chapter.sections) : 0;
  const counts = review ? lensCounts(review.findings) : {};
  const focusReviewFindings = focusSection && review ? findingsForSection(review.findings, focusSection.draftSectionId) : [];
  const passageReviewFindings = focusSection?.headingDepth === 2
    ? reviewFindingsForMovement(focusSection) : focusReviewFindings;
  const focusForMaia = focusSection && work && context ? focusOn({
    workRef: work.id,
    manuscriptId: context.manuscriptId,
    section: {
      draftSectionId: focusSection.draftSectionId,
      sourceSectionId: focusSection.sourceSectionId,
      position: focusSection.position,
      heading: focusSection.heading,
      depth: focusSection.headingDepth === 1 || focusSection.headingDepth === 2 || focusSection.headingDepth === 3
        ? focusSection.headingDepth : null,
    },
  }) : null;
  const focusWire = focusForMaia ? focusRequest(focusForMaia) : null;
  const askPlaceholder = focusForMaia ? composerPrompt(focusForMaia) : 'Ask MAIA about this section…';

  const askMaia = useCallback(async () => {
    if (!context || !work || !focusWire || !maiaAsk.trim() || maiaBusy) return;
    setMaiaBusy(true); setMaiaFailure(null);
    try {
      const sessionId = sessionIdRef.current || `writers-studio-rebuild-${Date.now()}`;
      sessionIdRef.current = sessionId;
      const res = await apiFetch('/api/writers-studio/focus', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId, workRef: focusWire.workRef, scopeKind: focusWire.scopeKind,
          sectionRef: focusWire.sectionRef, range: focusWire.range,
          gesture: 'ask_maia', ask: maiaAsk,
        }),
      });
      if (res.status === 404) {
        setMaiaFailure('Passage cognition is not enabled in this build yet. Nothing was sent.');
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMaiaFailure(typeof body?.message === 'string' ? body.message : 'MAIA could not receive this Focus.');
        return;
      }
      if (typeof body?.response === 'string' && body.response.trim()) {
        setMaiaResponse(body.response);
        setMaiaAsk('');
      } else {
        setMaiaFailure(typeof body?.message === 'string' ? body.message : 'MAIA received the Focus but did not return wording.');
      }
    } catch {
      setMaiaFailure('MAIA could not be reached just now. Nothing in the manuscript changed.');
    } finally { setMaiaBusy(false); }
  }, [context, work, focusWire, maiaAsk, maiaBusy]);

  const cloud = atmosphereVariables(ATMOSPHERES.cloud);

  if (phase !== 'ready' || !context) {
    return (
      <main style={{ minHeight: '100vh', background: '#F2F0EA', color: '#26231E', display: 'grid', placeItems: 'center', fontFamily: SANS }}>
        <div style={{ maxWidth: 480, textAlign: 'center', padding: 32 }}>
          {phase === 'loading' && 'Opening the rebuilt Writer’s Studio…'}
          {phase === 'unauthorized' && 'Sign in to open your Writer’s Studio.'}
          {phase === 'error' && (message ?? 'The Studio could not be opened.')}
        </div>
      </main>
    );
  }

  return (
    <main style={{ ...cloud, height: '100vh', overflow: 'hidden', background: C.shell, color: C.ink, fontFamily: SANS } as React.CSSProperties}>
      <header className="wsr-header" style={{ height: 58, display: 'grid', gridTemplateColumns: '300px 1fr 300px', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${C.soft}`, background: C.field }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <strong style={{ letterSpacing: '.18em', fontSize: 13 }}>SOULLAB</strong>
          <span style={{ color: C.quiet, fontSize: 13 }}>|</span>
          <span style={{ fontFamily: SERIF, fontSize: 17 }}>Writer’s Studio</span>
        </div>
        <nav className="wsr-modebar" style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 12.5 }}>
          {['Write', 'Develop', 'Explore', 'Review', 'Publish'].map((x) => (
            <span key={x} style={{ padding: '7px 13px', borderRadius: 999, background: x === 'Write' ? C.goldFill : 'transparent', fontWeight: x === 'Write' ? 650 : 450 }}>{x}</span>
          ))}
        </nav>
        <div className="wsr-preview" style={{ textAlign: 'right', fontSize: 12, color: C.muted }}>Rebuild preview</div>
      </header>

      <div className="wsr-grid" style={{ height: 'calc(100vh - 58px)', display: 'grid', gridTemplateColumns: '286px minmax(520px, 1fr) 390px' }}>
        <aside className={`wsr-outline ${mobilePane !== 'outline' ? 'wsr-mobile-hidden' : ''}`} style={{ borderRight: `1px solid ${C.soft}`, background: C.panel, overflowY: 'auto', padding: 16 }}>
          <button type="button" style={{ border: 0, background: 'transparent', color: C.muted, fontSize: 12, padding: '3px 2px 15px', cursor: 'pointer' }}>‹ All Works</button>
          <div style={{ border: `1px solid ${C.soft}`, borderRadius: 12, background: C.field, padding: 14, marginBottom: 18 }}>
            <div style={{ fontFamily: SERIF, fontSize: 17, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.45, color: C.muted }}>
              {work?.purpose ?? 'A living manuscript in progress.'}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 2, marginBottom: 20, fontSize: 12.5 }}>
            {['Manuscript', 'Materials', 'Notes', 'Versions', 'Goals'].map((x, i) => (
              <div key={x} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 9px', borderRadius: 7, background: i === 0 ? C.active : 'transparent', fontWeight: i === 0 ? 650 : 450 }}>
                <span>{x}</span><span style={{ color: C.quiet }}>{x === 'Versions' ? '5' : x === 'Materials' ? '0' : ''}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 6px 8px', color: C.quiet, fontSize: 10.5, letterSpacing: '.14em', fontWeight: 700 }}><span>OUTLINE</span><span>＋</span></div>
          <div style={{ display: 'grid', gap: 1 }}>
            {tree.map((node) => <OutlineBranch key={node.draftSectionId} node={node} focusId={focusId} chapterId={chapterNode?.draftSectionId ?? null} onSelect={selectSection} />)}
          </div>
        </aside>

        <section className={`wsr-manuscript ${mobilePane !== 'manuscript' ? 'wsr-mobile-hidden' : ''}`} style={{ background: C.field, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ minHeight: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '10px 24px', borderBottom: `1px solid ${C.soft}` }}>
            <div style={{ minWidth: 0, fontSize: 12.5, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: C.secondary, fontWeight: 600 }}>{title}</strong>
              <span style={{ padding: '0 7px', color: C.quiet }}>/</span>{chapterTitle}
            </div>
            <button type="button" onClick={() => setMaiaMode(maiaMode === 'chapter' ? 'passage' : 'chapter')}
              style={{ flexShrink: 0, border: `1px solid ${C.rule}`, borderRadius: 999, background: C.panel, padding: '8px 12px', color: C.secondary, fontSize: 11.5, cursor: 'pointer' }}>
              {maiaMode === 'chapter' ? `▣ Reviewing entire chapter` : `◎ Focused section: ${focusName}`}&nbsp;⌄
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '48px clamp(34px, 7vw, 100px) 90px' }}>
            <article style={{ maxWidth: 760, margin: '0 auto', fontFamily: SERIF }}>
              <div style={{ color: C.gold, fontFamily: SANS, fontSize: 10.5, letterSpacing: '.16em', fontWeight: 700, marginBottom: 9 }}>CHAPTER {chapter?.root.heading?.match(/Chapter\s+(\d+)/i)?.[1] ?? ''}</div>
              <h1 style={{ fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.05, fontWeight: 420, margin: '0 0 14px' }}>{chapterName}</h1>
              <div style={{ height: 1, background: C.soft, marginBottom: 28 }} />

              {maiaMode === 'chapter' && (
                <div style={{ border: `1px solid ${C.soft}`, background: C.panel, borderRadius: 12, padding: '13px 15px', marginBottom: 34, fontFamily: SANS, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                  <div><strong style={{ fontSize: 12.5 }}>Full chapter in review</strong><div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>MAIA will read positions {chapter?.sections[0]?.position}–{chapter?.sections.at(-1)?.position}. Select any section to work there directly.</div></div>
                  <span style={{ color: C.gold, fontSize: 12, whiteSpace: 'nowrap' }}>{chapter?.sections.length ?? 0} sections</span>
                </div>
              )}

              {(chapter?.sections ?? [focusSection].filter(Boolean) as RebuildSection[]).map((section) => {
                const focused = section.draftSectionId === focusId && maiaMode === 'passage';
                const isRoot = section.draftSectionId === chapter?.root.draftSectionId;
                return (
                  <section key={section.draftSectionId}
                    ref={(el) => { if (el) sectionRefs.current.set(section.draftSectionId, el); else sectionRefs.current.delete(section.draftSectionId); }}
                    data-rebuild-section={section.draftSectionId}
                    style={{ scrollMarginTop: 24, marginBottom: 34, padding: focused ? '18px 20px' : 0, borderRadius: 12, background: focused ? 'color-mix(in srgb, var(--ws-gold-fill, #CDBD91) 24%, transparent)' : 'transparent', outline: focused ? `1px solid ${C.soft}` : 'none' }}>
                    {!isRoot && section.heading && (
                      <h2 style={{ fontSize: section.headingDepth === 2 ? 24 : 18, lineHeight: 1.2, fontWeight: 480, margin: '0 0 14px', color: C.ink }}>{section.heading}</h2>
                    )}
                    {section.body.split(/\n{2,}/).filter(Boolean).map((p, i) => (
                      <p key={i} style={{ fontSize: 17.5, lineHeight: 1.74, margin: '0 0 18px', color: C.ink, whiteSpace: 'pre-wrap' }}>{p}</p>
                    ))}
                  </section>
                );
              })}
            </article>
          </div>
          <footer style={{ height: 44, borderTop: `1px solid ${C.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 11.5, color: C.muted }}>
            <span>{chapterWords.toLocaleString()} words · draft v{context.version}</span>
            <span>✦ Ask MAIA &nbsp;&nbsp; Aa⌄ &nbsp;&nbsp; ☷</span>
          </footer>
        </section>

        <aside className={`wsr-maia ${mobilePane !== 'maia' ? 'wsr-mobile-hidden' : ''}`} style={{ borderLeft: `1px solid ${C.soft}`, background: C.panel, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.soft}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div><div style={{ fontFamily: SERIF, fontSize: 19 }}>✦ MAIA</div><div style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>In relation to: <strong style={{ color: C.secondary }}>{work?.title ?? title}</strong></div></div>
              <span style={{ color: C.quiet }}>•••</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: C.field, border: `1px solid ${C.soft}`, borderRadius: 999, padding: 3 }}>
              <button type="button" onClick={() => setMaiaMode('chapter')} style={{ border: 0, borderRadius: 999, padding: '8px 10px', cursor: 'pointer', background: maiaMode === 'chapter' ? C.goldFill : 'transparent', color: C.ink, fontWeight: maiaMode === 'chapter' ? 700 : 450, fontSize: 11.5 }}>Chapter Review</button>
              <button type="button" onClick={() => setMaiaMode('passage')} style={{ border: 0, borderRadius: 999, padding: '8px 10px', cursor: 'pointer', background: maiaMode === 'passage' ? C.goldFill : 'transparent', color: C.ink, fontWeight: maiaMode === 'passage' ? 700 : 450, fontSize: 11.5 }}>Passage Work</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
            {maiaMode === 'chapter' ? (
              <div>
                <div style={{ border: `1px solid ${C.soft}`, borderRadius: 14, background: C.field, padding: 18, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 750, letterSpacing: '.08em', marginBottom: 8 }}>CHAPTER REVIEW</div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, margin: '0 0 8px' }}>
                    {reviewPhase === 'ready' ? 'Chapter review complete'
                      : reviewPhase === 'partial' ? 'Chapter review partially complete'
                      : `Read ${chapterName} as a whole`}
                  </h3>
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, color: C.muted, margin: '0 0 16px' }}>
                    {reviewPhase === 'reading' && reviewProgress
                      ? `MAIA is reading ${reviewProgress.lens} · ${Math.min(reviewProgress.done + 1, reviewProgress.total)} of ${reviewProgress.total}.`
                      : reviewPhase === 'ready'
                        ? `MAIA read all ${chapter?.sections.length ?? 0} sections through seven developmental lenses. Her frozen findings stay available as you work.`
                        : reviewPhase === 'partial'
                          ? `MAIA kept every reading that completed. ${review?.failures.length ?? 0} lens${review?.failures.length === 1 ? '' : 'es'} could not complete, so this is not labeled a full review.`
                          : 'MAIA will read this chapter first, then keep her findings available while you move into individual sections.'}
                  </p>
                  <button type="button" data-review-chapter onClick={() => void runReview()} disabled={reviewPhase === 'reading'}
                    style={{ width: '100%', border: 0, borderRadius: 10, padding: '11px 14px', background: C.goldFill, color: C.ink, fontWeight: 750, cursor: reviewPhase === 'reading' ? 'wait' : 'pointer', opacity: reviewPhase === 'reading' ? .65 : 1 }}>
                    {reviewPhase === 'reading' ? '✦ MAIA is reading…' : review ? '↻ Review this chapter again' : '✦ Review this chapter'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 18 }}>
                  {([
                    ['Development', counts.development ?? 0],
                    ['Structure', counts.structure ?? 0],
                    ['Arc', counts.arc ?? 0],
                    ['Reader', counts.reader ?? 0],
                  ] as const).map(([name, count]) => (
                    <div key={name} style={{ border: `1px solid ${C.soft}`, borderRadius: 11, background: C.field, padding: 12, minHeight: 74 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11.5, fontWeight: 700 }}><span>{name}</span><span style={{ color: C.gold }}>{review ? count : '—'}</span></div>
                      <div style={{ fontSize: 11, color: C.quiet, marginTop: 6 }}>{review ? 'Frozen observations from this lens.' : 'Waiting for MAIA’s chapter reading.'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.quiet, letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>FINDINGS BY SECTION</div>
                {(chapter?.sections.filter((s) => s.headingDepth === 2) ?? []).map((movement) => {
                  const findings = reviewFindingsForMovement(movement);
                  const first = findings[0];
                  return (
                    <button key={movement.draftSectionId} type="button" onClick={() => selectSection(movement.draftSectionId, 'section')}
                      style={{ width: '100%', textAlign: 'left', border: `1px solid ${C.soft}`, borderRadius: 10, background: C.field, padding: '11px 12px', marginBottom: 7, cursor: 'pointer', color: C.secondary }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, fontWeight: 650 }}>{movement.heading}</span>
                        <span style={{ color: C.quiet, fontSize: 11 }}>{findings.length ? `${findings.length} finding${findings.length === 1 ? '' : 's'} ›` : '›'}</span>
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.45, color: C.muted, marginTop: 4 }}>
                        {first?.summary ?? (review ? 'No section-specific observation in this review.' : 'Review the chapter to see MAIA’s findings here.')}
                      </div>
                      {first && <div style={{ marginTop: 6, display: 'inline-block', borderRadius: 999, background: C.active, padding: '3px 7px', fontSize: 9.5, textTransform: 'capitalize', color: C.gold }}>{first.lens}</div>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <button type="button" onClick={() => setMaiaMode('chapter')} style={{ border: 0, background: 'transparent', color: C.gold, padding: 0, fontSize: 11.5, cursor: 'pointer', marginBottom: 14 }}>← Back to chapter findings</button>
                <div style={{ border: `1px solid ${C.soft}`, borderRadius: 11, background: C.field, padding: 12, marginBottom: 14 }}>
                  <div style={{ color: C.quiet, fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em' }}>FROM CHAPTER REVIEW</div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: C.muted, marginTop: 5 }}>
                    {passageReviewFindings[0]?.summary
                      ?? (review ? 'No section-specific finding was attached here; you can still ask MAIA directly.' : 'Run Chapter Review first and its section-linked findings will stay here while you work.')}
                  </div>
                  {passageReviewFindings.length > 1 && <div style={{ fontSize: 10.5, color: C.quiet, marginTop: 6 }}>+ {passageReviewFindings.length - 1} more finding{passageReviewFindings.length === 2 ? '' : 's'}</div>}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 7 }}>◎ Working on</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, margin: '0 0 14px', fontWeight: 500 }}>{focusName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${C.soft}`, marginBottom: 16 }}>
                  {['Interpret', 'Suggest', 'Explore', 'Ask'].map((x, i) => <button key={x} style={{ border: 0, borderBottom: i === 3 ? `2px solid ${C.gold}` : '2px solid transparent', background: 'transparent', padding: '9px 2px', color: i === 3 ? C.ink : C.muted, fontSize: 11, cursor: 'pointer' }}>{x}</button>)}
                </div>
                <div style={{ border: `1px solid ${C.soft}`, borderRadius: 12, background: C.field, padding: 15, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7 }}>MAIA’s perspective</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.58, color: C.muted, whiteSpace: 'pre-wrap' }}>
                    {maiaResponse ?? 'Ask MAIA about this exact section. The rebuilt Focus sends the Source identity for the same section you are visibly working in.'}
                  </div>
                  {maiaFailure && <div role="status" style={{ fontSize: 11, lineHeight: 1.45, color: C.gold, marginTop: 9 }}>{maiaFailure}</div>}
                </div>
                <textarea value={maiaAsk} onChange={(e) => setMaiaAsk(e.target.value)} placeholder={askPlaceholder}
                  style={{ width: '100%', minHeight: 92, resize: 'vertical', border: `1px solid ${C.rule}`, borderRadius: 12, background: C.field, color: C.ink, padding: 12, fontFamily: SANS, fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => void askMaia()} disabled={maiaBusy || !focusWire || !work || !maiaAsk.trim()}
                  style={{ marginTop: 9, width: '100%', border: 0, borderRadius: 10, padding: '11px 14px', background: C.goldFill, color: C.ink, fontWeight: 750, cursor: maiaBusy ? 'wait' : 'pointer', opacity: maiaBusy || !focusWire || !work || !maiaAsk.trim() ? .55 : 1 }}>
                  {maiaBusy ? 'MAIA is reading…' : 'Ask MAIA'}
                </button>
                {!work && <div style={{ fontSize: 10.5, color: C.quiet, marginTop: 7 }}>Passage Work needs one unambiguous declared Work before MAIA can receive manuscript context.</div>}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="wsr-mobile-nav">
        <button type="button" onClick={() => setMobilePane('outline')} data-active={mobilePane === 'outline'}>Outline</button>
        <button type="button" onClick={() => setMobilePane('manuscript')} data-active={mobilePane === 'manuscript'}>Manuscript</button>
        <button type="button" onClick={() => setMobilePane('maia')} data-active={mobilePane === 'maia'}>MAIA</button>
      </div>
    </main>
  );
}
