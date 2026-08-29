/**
 * WS2-02B — the Writing Field composition, derived from 04-writing-field-wide.
 *
 * A FIXTURE, not a room. It lives under __fixtures__ and is exported by no
 * route, because its job is to let DERIVED and PROVISIONAL tokens meet a
 * screen — not to show a member a Studio that does not work yet.
 *
 * INERT BY CONSTRUCTION. There are no handlers, no fetches, no save, no MAIA
 * exchange, no material retrieval. Every string below is reference content
 * carried over from the pack so proportions can be judged against something
 * of the right length. Nothing here pretends a capability exists.
 *
 * ── THE HONEST RAIL ────────────────────────────────────────────────────────
 *
 * This composition draws its rail through StudioRail, which reads
 * visibleDestinations. So the rail shows what is BUILT, and it therefore does
 * not match 04's rail: 04 draws sixteen destinations, and most of them have no
 * substrate. The MAIA band does not appear at all, because all four of its
 * destinations are `later`.
 *
 * That divergence is the render-boundary rule working, not a defect in the
 * composition. It is recorded here because it is the central question WS2-02
 * acceptance has to answer: 04 is a picture of the finished room, and an
 * honest shell today is a smaller room. The proportions, ramp, typography and
 * panel behaviour can still be judged; the rail's inventory cannot.
 */
'use client';

import {
  GOLD,
  GROUND,
  INK,
  MEASURE,
  RADIUS,
  RULE,
  SPACE,
  TYPE,
  writingFieldLayout,
} from '../../studioTheme';
import { MaiaInsightCard, MaiaVoice } from '../MaiaReading';
import { StudioPanel } from '../StudioPanel';
import { CanonicalRail } from './CanonicalRail';
import { StudioText, typeStyle } from '../StudioType';

const MODES = ['Write', 'Develop', 'Explore', 'Review', 'Publish'] as const;

const OUTLINE = [
  { part: 'Part I — Remembering', items: ['The Call to Remember', 'The Language of Elements', 'The Living World'] },
  { part: 'Part II — Initiation', items: ['Earth', 'Water', 'Fire', 'Air', 'Ether'] },
];

const INSIGHTS = [
  { kind: 'theme' as const, reading: 'The theme of "ordinary life as sacred practice" emerges strongly in Chapters 6–8.', evidenceCount: 3, evidenceNoun: 'passages' as const },
  { kind: 'structure' as const, reading: 'Consider the transition between the elements and integration in Chapter 9.', evidenceCount: 2, evidenceNoun: 'suggestions' as const },
  { kind: 'continuity' as const, reading: 'You introduced "the river" in Chapter 4. It reappears in Chapter 8.', evidenceCount: 4, evidenceNoun: 'passages' as const },
];

/* 04's lower band carries four regions, not two. Versions and the structural
   band (Outline / Threads / Timeline / Word Web) were missing from the first
   pass, which is part of why the composition read emptier than the reference.
   Reference content only — inert, unlinked, no controls. */
const VERSIONS = [
  { label: 'Current Draft', when: '2m ago', current: true },
  { label: 'Air Chapter Revisions', when: 'Yesterday' },
  { label: 'Integration notes', when: 'Aug 21' },
  { label: 'Chapter 6 Expanded', when: 'Aug 19' },
];

const STRUCTURE_BAND = ['Outline', 'Threads', 'Timeline', 'Word Web'];

/** Writer-declared goals. Quantified because the writer set both ends. */
const GOALS = [
  { label: 'Finish first complete draft', pct: 82 },
  { label: 'Integrate interviews', pct: 60 },
  { label: 'Clarify core framework', pct: 75 },
];

export interface WritingFieldCompositionProps {
  /** 'wide' follows 04; 'compact' follows the observed 04→08 difference. */
  architecture?: 'wide' | 'compact';
}

export function WritingFieldComposition({
  architecture = 'wide',
}: WritingFieldCompositionProps) {
  const compact = architecture === 'compact';
  /* Geometry comes from writingFieldLayout, which allocates the MEASURED
     gutters first and then divides the remainder in the measured ratio. The
     writing field is an explicit width, never a `flex: 1` remainder — that is
     what let the first pass render it at 33.3% while the token table said
     35.2%. See assertLayoutMatchesReference. */
  const vw = compact ? 1180 : 1680;
  const L = writingFieldLayout(
    vw,
    compact
      ? ['rail', 'outlinePanel', 'writingField', 'maiaPanel']
      : ['rail', 'outlinePanel', 'writingField', 'maiaPanel', 'materialsPanel'],
  );

  return (
    <div
      data-architecture={architecture}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: GROUND.base,
        color: INK.primary,
        overflow: 'hidden',
      }}
    >
      {/* ── Header: work identity + the five modes ───────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE.roomy,
          padding: `${SPACE.base}px ${SPACE.roomy}px`,
          borderBottom: `1px solid ${RULE.soft}`,
          background: GROUND.raised,
          flexShrink: 0,
        }}
      >
        <StudioText role="bandLabel" tone="muted">
          Soullab · Writer&rsquo;s Studio
        </StudioText>
        <div style={{ minWidth: 0 }}>
          <StudioText role="workIdentity">Elemental Alchemy</StudioText>
          <StudioText role="quiet">The Art of Living a Phenomenal Life</StudioText>
        </div>
        {/* The five modes are the shell 04 is built around. Inert here: this
            fixture may not pretend a mode switch works. */}
        {!compact && (
          <nav style={{ display: 'flex', gap: SPACE.tight, marginLeft: SPACE.roomy }}>
            {MODES.map((m, i) => (
              <span
                key={m}
                style={{
                  ...typeStyle('navItem'),
                  color: i === 0 ? INK.primary : INK.quiet,
                  padding: `${SPACE.tight}px ${SPACE.base}px`,
                  borderRadius: RADIUS.pill,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.75rem',
                  ...(i === 0
                    ? { background: GROUND.active, boxShadow: `inset 0 -2px 0 ${GOLD.DEFAULT}` }
                    : {}),
                }}
              >
                {m}
              </span>
            ))}
          </nav>
        )}
        <span style={{ flex: 1 }} />
        <StudioText role="metadata">7,842 words</StudioText>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          gap: L.gutter,
          padding: L.gutter,
        }}
      >
        {/* The canonical grammar, inert. See CanonicalRail. */}
        <CanonicalRail style={{ width: L.rail, flexShrink: 0, borderRadius: RADIUS.panel }} />

        <StudioPanel
          role="manuscript-outline"
          label="Manuscript"
          style={{ width: L.outlinePanel, flexShrink: 0 }}
        >
          <StudioText role="metadata" style={{ marginBottom: SPACE.base }}>
            Draft · 209 pages
          </StudioText>
          {OUTLINE.map((section) => (
            <div key={section.part} style={{ marginBottom: SPACE.comfortable }}>
              <StudioText role="bandLabel" style={{ marginBottom: SPACE.tight }}>
                {section.part}
              </StudioText>
              {section.items.map((item) => {
                const current = item === 'Air';
                return (
                  <div
                    key={item}
                    style={{
                      padding: `${SPACE.tight}px ${SPACE.snug}px`,
                      borderRadius: RADIUS.sm,
                      ...(current
                        ? { background: GROUND.active, boxShadow: `inset 2px 0 0 ${GOLD.DEFAULT}` }
                        : {}),
                    }}
                  >
                    <StudioText role="navItem" tone={current ? 'primary' : 'quiet'}>
                      {item}
                    </StudioText>
                  </div>
                );
              })}
            </div>
          ))}
        </StudioPanel>

        {/* ── The writing field: the largest, quietest surface ───────────── */}
        <main
          style={{
            width: L.writingField,
            flexShrink: 0,
            minWidth: MEASURE.fieldMinWidth,
            background: GROUND.field,
            border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.panel,
            overflow: 'auto',
            padding: `${SPACE.band}px ${MEASURE.roomGutter}px`,
          }}
        >
          <div style={{ maxWidth: `${MEASURE.prose}ch`, margin: '0 auto' }}>
            <StudioText role="chapterTitle" as="h1" style={{ textAlign: 'center' }}>
              Chapter Seven
            </StudioText>
            <StudioText
              role="chapterSubtitle"
              as="h2"
              style={{ textAlign: 'center', fontStyle: 'italic', marginTop: SPACE.snug }}
            >
              Air
            </StudioText>
            <StudioText
              role="epigraph"
              style={{
                textAlign: 'center',
                fontStyle: 'italic',
                color: GOLD.text,
                margin: `${SPACE.generous}px 0`,
              }}
            >
              Air is the unseen matrix in which all movement, communication and thought arise.
              It is the bridge between worlds.
            </StudioText>
            <hr style={{ border: 'none', borderTop: `1px solid ${RULE.soft}`, margin: `${SPACE.generous}px 0` }} />
            {[
              'We do not always notice the air. It is the most subtle of the elements, yet without it nothing moves, nothing speaks, nothing thinks.',
              'In the traditions of the East, air is associated with prāṇa, the life breath that animates the body and the world. In the West, the Greeks called air pneuma, the spirit that gives form to formlessness. In both views, air is the medium of relationship.',
              'To work with air is to become conscious of the space in which life unfolds. It is to listen more deeply, to speak more honestly, and to think with greater clarity.',
            ].map((para) => (
              <StudioText key={para.slice(0, 24)} role="prose" as="p" style={{ marginBottom: SPACE.roomy }}>
                {para}
              </StudioText>
            ))}
          </div>
        </main>

        {/* MAIA stays present in both architectures — 08 keeps her, and §1
            makes her a persistent companion across the modes. */}
        <StudioPanel role="maia" label="MAIA" style={{ width: L.maiaPanel, flexShrink: 0 }}>
          <MaiaVoice>Good morning, Kelly. What would you like to explore in your writing today?</MaiaVoice>
          <StudioText role="panelLabel" style={{ margin: `${SPACE.roomy}px 0 ${SPACE.snug}px` }}>
            Developmental insights
          </StudioText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.snug }}>
            {INSIGHTS.map((i) => (
              <MaiaInsightCard key={i.reading.slice(0, 20)} {...i} />
            ))}
          </div>
        </StudioPanel>

        {/* Materials holds the right rail in 04 and yields to a bottom strip
            in 08. That is the one collapse step any reference establishes. */}
        {!compact && (
          <StudioPanel
            role="materials"
            label="Materials"
            count={24}
            style={{ width: L.materialsPanel, flexShrink: 0 }}
          >
            {['Elemental Alchemy — Early Draft', 'Larry Interview — Elements & Practice', 'Thought on Air Element'].map(
              (m) => (
                <div
                  key={m}
                  style={{
                    padding: SPACE.snug,
                    marginBottom: SPACE.snug,
                    border: `1px solid ${RULE.soft}`,
                    borderRadius: RADIUS.sm,
                  }}
                >
                  <StudioText role="navItem">{m}</StudioText>
                </div>
              ),
            )}
          </StudioPanel>
        )}
      </div>

      {/* ── Lower band: goals (writer-declared, so quantified) ───────────── */}
      <footer
        style={{
          display: 'flex',
          gap: SPACE.generous,
          padding: `${SPACE.base}px ${SPACE.roomy}px`,
          borderTop: `1px solid ${RULE.soft}`,
          background: GROUND.raised,
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        {compact && (
          <div style={{ display: 'flex', gap: SPACE.snug, alignItems: 'center' }}>
            <StudioText role="panelLabel">Materials</StudioText>
            <StudioText role="metadata">24</StudioText>
          </div>
        )}

        <div style={{ minWidth: 190 }}>
          <StudioText role="panelLabel" style={{ marginBottom: SPACE.snug }}>
            Versions
          </StudioText>
          {VERSIONS.map((v) => (
            <div
              key={v.label}
              style={{ display: 'flex', justifyContent: 'space-between', gap: SPACE.base }}
            >
              <StudioText role="metadata" tone={v.current ? 'secondary' : 'quiet'} as="span">
                {v.label}
              </StudioText>
              <StudioText role="metadata" as="span">
                {v.when}
              </StudioText>
            </div>
          ))}
        </div>

        {/* The structural band. Tabs in 04; inert labels here, because a tab
            that cannot switch anything is a control that does nothing. */}
        <div style={{ minWidth: 240 }}>
          <div style={{ display: 'flex', gap: SPACE.comfortable, marginBottom: SPACE.snug }}>
            {STRUCTURE_BAND.map((t, i) => (
              <StudioText
                key={t}
                role="panelLabel"
                tone={i === 0 ? 'secondary' : 'quiet'}
                as="span"
                style={i === 0 ? { boxShadow: `0 2px 0 ${GOLD.DEFAULT}`, paddingBottom: 2 } : {}}
              >
                {t}
              </StudioText>
            ))}
          </div>
          <div style={{ display: 'flex', gap: SPACE.snug }}>
            {['Remembering', 'Initiation', 'Integration'].map((part, i) => (
              <div
                key={part}
                style={{
                  padding: `${SPACE.tight}px ${SPACE.snug}px`,
                  border: `1px solid ${i === 1 ? GOLD.edge : RULE.soft}`,
                  borderRadius: RADIUS.sm,
                  background: i === 1 ? GROUND.active : 'transparent',
                }}
              >
                <StudioText role="metadata" tone={i === 1 ? 'secondary' : 'quiet'}>
                  {part}
                </StudioText>
              </div>
            ))}
          </div>
        </div>

        <div style={{ minWidth: 260, flex: 1, maxWidth: 420 }}>
          <StudioText role="panelLabel" style={{ marginBottom: SPACE.snug }}>
            Goals
          </StudioText>
          {GOALS.map((g) => (
            <div key={g.label} style={{ marginBottom: SPACE.snug }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <StudioText role="metadata" tone="secondary" as="span">
                  {g.label}
                </StudioText>
                <StudioText role="metadata" as="span">
                  {g.pct}%
                </StudioText>
              </div>
              <div
                style={{
                  height: 3,
                  background: GROUND.deepest,
                  borderRadius: RADIUS.pill,
                  marginTop: SPACE.hairline,
                }}
              >
                <div
                  style={{
                    width: `${g.pct}%`,
                    height: '100%',
                    background: GOLD.DEFAULT,
                    borderRadius: RADIUS.pill,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ minWidth: 180 }}>
          <StudioText role="panelLabel" style={{ marginBottom: SPACE.snug }}>
            Statistics
          </StudioText>
          <StudioText role="chapterSubtitle" style={{ fontSize: `${TYPE.workIdentity.size}rem` }}>
            82,193 words
          </StudioText>
          {[
            ['Manuscript', '82,193'],
            ['Materials', '24'],
            ['Notes', '12'],
            ['Comments', '8'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: SPACE.base }}>
              <StudioText role="metadata" as="span">
                {k}
              </StudioText>
              <StudioText role="metadata" tone="secondary" as="span">
                {v}
              </StudioText>
            </div>
          ))}
          <StudioText role="metadata" style={{ marginTop: SPACE.tight }}>
            Reading time 4h 27m
          </StudioText>
        </div>
      </footer>
    </div>
  );
}
