import type { RefusalCheck } from './harness';

/**
 * Refusal 17 — System-inferred member themes cannot reach Circle-visible output.
 *
 * Sovereignty correction (2026-07-17, Kelly ruling): system-inferred themes may
 * support private tentative reflection, but they may not enter a shared field
 * without explicit member ratification and collective eligibility. The Circles
 * field pulse previously JOINed member_theme_signals across circle members
 * (cohort floor of 2) — that path is removed.
 *
 * Companion label discipline (same ruling): inferred themes surfacing in the
 * member's own private prompt context must read as candidate recurrence, never
 * as "self-observed" / recognized / confirmed.
 *
 * See docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md
 */

// A reader = SQL FROM/JOIN against the table (comments naming the table don't match).
const THEME_READER = 'FROM\\s+member_theme_signals|JOIN\\s+member_theme_signals';
// The specific cross-member shape: theme signals joined to circle membership.
const CROSS_MEMBER_SHAPE = 'member_theme_signals[\\s\\S]{0,200}circle_memberships|circle_memberships[\\s\\S]{0,200}member_theme_signals';
const WRITER = 'INSERT\\s+INTO\\s+member_theme_signals';

export const check: RefusalCheck = {
  id: 'R17',
  refusal: 'System-inferred member themes never enter Circle-visible pulse output',
  grade: 'A',
  enforcedBy: 'Absence of any member_theme_signals reader in lib/circles/ and app/api/circles/ (lib/circles/fieldPulseService.ts)',
  evidence: 'Theme aggregation removed from getCirclePulse 2026-07-17; pulse derives only from circle_inquiries + shared activity. Writer preserved: lib/consciousness/participatoryRealityHelper.ts (private, member-scoped).',
  violationAttempted: 'find any SQL reader of member_theme_signals in the circles surface, or any theme×membership join anywhere in app/ or lib/',
  passingAuthorizes: 'no code path carries system-inferred themes into output visible to other circle members',
  passingDoesNotAuthorize: 'that private inferred themes are ratified or member-visible — only that they cannot cross into a shared field',
  hostileForkMustChange: 'reintroduce a member_theme_signals read into the circles pulse path or a theme×circle_memberships join — visible diff',

  run(io) {
    // 1. Circle-visible surface has no reader of the inferred-theme table.
    const circleReaders = io.grep(THEME_READER, ['lib/circles', 'app/api/circles', 'components/circles']);
    if (circleReaders.length === 0) {
      io.pass('No member_theme_signals reader in the circles surface');
    } else {
      io.fail('Circles surface reads member_theme_signals', circleReaders.join(' | '));
    }

    // 2. No fallback: the cross-member join shape exists nowhere in app/ or lib/.
    const crossMember = io.grep(CROSS_MEMBER_SHAPE, ['app', 'lib']);
    if (crossMember.length === 0) {
      io.pass('No theme×circle_memberships join anywhere in app/ or lib/');
    } else {
      io.fail('Cross-member theme join shape present', crossMember.join(' | '));
    }

    // 3. The pulse still has its governed inputs (non-vacuous: the surface works).
    const pulseInputs = io.grep('FROM\\s+circle_inquiries', ['lib/circles/fieldPulseService.ts']);
    if (pulseInputs.length > 0) {
      io.pass('Pulse retains circle-native inputs (inquiries/activity)');
    } else {
      io.fail('Pulse lost its remaining inputs — containment overshot', 'circle_inquiries query missing from fieldPulseService');
    }

    // 4. Private inference is preserved (writer exists) — containment, not destruction.
    const writers = io.grep(WRITER, ['lib']);
    if (writers.length > 0) {
      io.pass('Private theme inference preserved (writer present)', writers[0].split(':').slice(0, 2).join(':'));
    } else {
      io.warn('No member_theme_signals writer found', 'private candidate-recurrence detection may have been removed — outside this refusal’s ruling');
    }

    // 5. Label discipline: inferred themes are never presented as self-observed.
    const badLabel = io.grep('self-observed', ['lib/memory/MemberLiveContext.ts']);
    if (badLabel.length === 0) {
      io.pass('Inferred themes no longer labeled "self-observed" in prompt context');
    } else {
      io.fail('Prompt still labels inferred themes as self-observed', badLabel.join(' | '));
    }
    const candidateLabel = io.grep('Candidate recurrence', ['lib/memory/MemberLiveContext.ts']);
    if (candidateLabel.length > 0) {
      io.pass('Prompt labels inferred themes as candidate recurrence');
    } else {
      io.warn('Candidate-recurrence label not found', 'themes block may have been removed entirely — verify intent');
    }
  },
};
