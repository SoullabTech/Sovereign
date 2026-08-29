/**
 * WS2-02C — depictions of controls, for the fixture only.
 *
 * 04 carries an editor toolbar, a Materials search field, filter chips and a
 * gold "+ Add Material". None of that capability is built, and each of them
 * materially affects an axis this pass exists to calibrate:
 *
 *   toolbar          vertical density and writing-field hierarchy
 *   search + chips   Materials panel density and rhythm
 *   + Add Material   action hierarchy and gold distribution
 *
 * Omitting them makes the room read empty in exactly the places we already
 * know why it is empty, which would send the eventual authenticated capture to
 * rediscover a known fixture omission.
 *
 * ── THE RULE THESE FOLLOW ──────────────────────────────────────────────────
 *
 * A non-member-facing fixture may depict the FORM of an unavailable
 * capability, provided it never presents that depiction as an operable
 * control. So: div and span only. No button, no input, no href, no handler, no
 * tabindex, no role, no form semantics — nothing a browser or assistive
 * technology would offer as actionable. A disabled button and a readOnly input
 * are equally refused: both still announce themselves as controls.
 *
 * This is not lying to a member, because no member can reach this composition.
 * These files are exported by no route, and the suite asserts it.
 *
 * They live here rather than in the Studio primitives on purpose. A generic
 * operable Toolbar or SearchField belongs in the primitives only when a real
 * product capability needs one — not because a fixture wanted its shape.
 */
'use client';

import { GOLD, GROUND, INK, RADIUS, RULE, SPACE, TYPE } from '../../studioTheme';
import { StudioText } from '../StudioType';

const fixtureOnly = { 'data-fixture-only': 'true', 'aria-hidden': true } as const;

/** Glyphs read off 04's toolbar row, left to right. */
const TOOLBAR_GLYPHS = ['↶', '↷', '|', 'Aa', '|', 'B', 'I', 'U', '|', '•—', '1—', '|', '🔗', '▣'];

export function EditorToolbarDepiction() {
  return (
    <div
      {...fixtureOnly}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE.base,
        padding: `${SPACE.snug}px ${SPACE.base}px`,
        borderBottom: `1px solid ${RULE.soft}`,
        color: INK.quiet,
        fontFamily: TYPE.metadata.family,
        fontSize: `${TYPE.navItem.size}rem`,
      }}
    >
      {TOOLBAR_GLYPHS.map((g, i) => (
        <span key={`${g}-${i}`} style={{ opacity: g === '|' ? 0.35 : 0.75 }}>
          {g}
        </span>
      ))}
    </div>
  );
}

/** The breadcrumb row above the toolbar: chapter, element, running count. */
export function EditorContextDepiction() {
  return (
    <div
      {...fixtureOnly}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE.comfortable,
        padding: `${SPACE.snug}px ${SPACE.base}px`,
        borderBottom: `1px solid ${RULE.soft}`,
      }}
    >
      <StudioText role="metadata" tone="secondary" as="span">
        Chapter 7
      </StudioText>
      <StudioText role="metadata" as="span">
        Air
      </StudioText>
      <StudioText role="metadata" as="span">
        7,842 words
      </StudioText>
    </div>
  );
}

/** A search field's shape. Deliberately not an input, not even a readOnly one. */
export function MaterialsSearchDepiction() {
  return (
    <div
      {...fixtureOnly}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE.snug,
        height: 30,
        padding: `0 ${SPACE.snug}px`,
        marginBottom: SPACE.snug,
        border: `1px solid ${RULE.soft}`,
        borderRadius: RADIUS.base,
        background: GROUND.deepest,
        color: INK.quiet,
        fontFamily: TYPE.metadata.family,
        fontSize: `${TYPE.metadata.size}rem`,
      }}
    >
      <span>⌕</span>
      <span>Search materials…</span>
    </div>
  );
}

const FILTERS = ['All', 'Sources', 'Notes', 'Media'];

export function MaterialsFilterDepiction() {
  return (
    <div {...fixtureOnly} style={{ display: 'flex', gap: SPACE.tight, marginBottom: SPACE.comfortable }}>
      {FILTERS.map((f, i) => (
        <span
          key={f}
          style={{
            padding: `${SPACE.hairline}px ${SPACE.snug}px`,
            borderRadius: RADIUS.pill,
            border: `1px solid ${RULE.soft}`,
            background: i === 0 ? GROUND.active : 'transparent',
            color: i === 0 ? INK.secondary : INK.quiet,
            fontFamily: TYPE.metadata.family,
            fontSize: `${TYPE.metadata.size}rem`,
          }}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

/**
 * The one gold affordance inside a panel. Its weight is the point: gold marks
 * where the member acts on their own material, and 04 spends it here and on
 * "+ New Work" and nowhere else in the chrome.
 */
export function AddMaterialDepiction() {
  return (
    <div
      {...fixtureOnly}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE.snug,
        height: 32,
        marginTop: SPACE.snug,
        background: GOLD.fill,
        border: `1px solid ${GOLD.edge}`,
        borderRadius: RADIUS.base,
        color: INK.primary,
        fontFamily: TYPE.navItem.family,
        fontSize: `${TYPE.navItem.size}rem`,
        fontWeight: 600,
      }}
    >
      <span>+</span>
      Add Material
    </div>
  );
}
