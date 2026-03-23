/**
 * Developmental Mission System
 *
 * Missions are not tasks. They are:
 *   consecrated next movements emerging from what MAIA has already seen.
 *
 * MAIA reveals the pattern. Missions provide the practice. Journey holds the arc.
 *
 * Three categories:
 *   - Clarifying  → sharpen perception (early/unclear)
 *   - Integrating → embody what is already seen (clarity without movement)
 *   - Threshold   → act before certainty (readiness detected)
 *
 * Guardrails:
 *   - Never "You should..." — always "A possible practice..."
 *   - Always optional, contextual, interpretable, alive
 *   - Missions emerge from state, not from a content library
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type DevelopmentalMissionType = 'clarifying' | 'integrating' | 'threshold';
export type DevelopmentalMissionStatus = 'available' | 'accepted' | 'completed' | 'released';
export type MissionOrigin = 'first_descent' | 'maia_session' | 'pattern_return' | 'attunement';
export type MissionDuration = 'today' | '24h' | 'until_next_return';

export interface DevelopmentalMission {
  id: string;
  member_id: string;
  type: DevelopmentalMissionType;
  title: string;
  invitation: string;     // 2-3 lines, the practice itself
  duration: MissionDuration;
  origin: MissionOrigin;
  status: DevelopmentalMissionStatus;
  origin_data?: DescentSeed;  // what generated this mission
  created_at: Date;
  accepted_at?: Date;
  completed_at?: Date;
  released_at?: Date;       // when user chose "let it pass"
}

/** Data from First Descent that feeds mission generation */
export interface DescentSeed {
  pattern_seed?: string;
  meaning_frame?: string;
  micro_action?: string;
  revisit_anchor?: string;
  element?: string;
}

// ─── Generation Logic ──────────────────────────────────────────────────────

/**
 * Determine mission type from readiness signals.
 *
 * Heuristic (v1 — simple, refine from real usage):
 *   - No meaning_frame or vague pattern_seed → clarifying
 *   - Has meaning_frame + micro_action → integrating
 *   - Has all four fields with strong language → threshold
 */
function inferMissionType(seed: DescentSeed): DevelopmentalMissionType {
  const hasMeaningFrame = !!seed.meaning_frame?.trim();
  const hasMicroAction = !!seed.micro_action?.trim();
  const hasRevisitAnchor = !!seed.revisit_anchor?.trim();
  const hasPatternSeed = !!seed.pattern_seed?.trim();

  // Threshold: all signals present — person is ready
  if (hasPatternSeed && hasMeaningFrame && hasMicroAction && hasRevisitAnchor) {
    return 'threshold';
  }

  // Integrating: they see something but haven't moved
  if (hasMeaningFrame && hasMicroAction) {
    return 'integrating';
  }

  // Default: clarifying — perception still forming
  return 'clarifying';
}

/**
 * Generate a mission from First Descent output.
 *
 * This is the bridge between perception and participation.
 * The mission is not advice. It is the next meaningful movement
 * available from what has already been seen.
 */
export function generateMissionFromDescent(
  memberId: string,
  seed: DescentSeed
): Omit<DevelopmentalMission, 'id' | 'created_at'> {
  const type = inferMissionType(seed);

  switch (type) {
    case 'clarifying':
      return {
        member_id: memberId,
        type: 'clarifying',
        title: 'Name what is present',
        invitation: buildClarifyingInvitation(seed),
        duration: '24h',
        origin: 'first_descent',
        status: 'available',
        origin_data: seed,
      };

    case 'integrating':
      return {
        member_id: memberId,
        type: 'integrating',
        title: 'Move from what you see',
        invitation: buildIntegratingInvitation(seed),
        duration: 'until_next_return',
        origin: 'first_descent',
        status: 'available',
        origin_data: seed,
      };

    case 'threshold':
      return {
        member_id: memberId,
        type: 'threshold',
        title: 'Cross the edge you recognize',
        invitation: buildThresholdInvitation(seed),
        duration: 'until_next_return',
        origin: 'first_descent',
        status: 'available',
        origin_data: seed,
      };
  }
}

// ─── Invitation Builders ───────────────────────────────────────────────────

function buildClarifyingInvitation(seed: DescentSeed): string {
  if (seed.pattern_seed) {
    return [
      `There's something here that hasn't fully formed yet.`,
      `A possible practice:`,
      `Return to the moment where ${seed.pattern_seed}. Name what is actually happening there — in one clear sentence. Not why. Just what.`,
    ].join('\n');
  }
  return [
    `Something is stirring, but it doesn't have a name yet.`,
    `A possible practice:`,
    `Sit with what is present. When a single word or image arrives, write it down. That is enough.`,
  ].join('\n');
}

function buildIntegratingInvitation(seed: DescentSeed): string {
  if (seed.micro_action && seed.meaning_frame) {
    return [
      `Something is already visible.`,
      `A possible practice:`,
      `${seed.micro_action} — not to prove anything, but because ${seed.meaning_frame}. Let it be simple and real.`,
    ].join('\n');
  }
  if (seed.micro_action) {
    return [
      `Something is already visible.`,
      `A possible practice:`,
      `Take one action from what you've already seen: ${seed.micro_action}. Without improving it or explaining it further.`,
    ].join('\n');
  }
  return [
    `Something is already visible.`,
    `A possible practice:`,
    `Take one action from clarity rather than urgency. Let it be simple and real.`,
  ].join('\n');
}

function buildThresholdInvitation(seed: DescentSeed): string {
  if (seed.revisit_anchor && seed.pattern_seed) {
    return [
      `You've been near this edge before.`,
      `A possible movement:`,
      `Where ${seed.pattern_seed} meets ${seed.revisit_anchor} — act once, before certainty arrives. Not to prove anything. To cross the threshold you already recognize.`,
    ].join('\n');
  }
  return [
    `You've been near this edge before.`,
    `A possible movement:`,
    `Act once, before certainty arrives. Not to prove anything. To cross the threshold you already recognize.`,
  ].join('\n');
}

// ─── Duration Display ──────────────────────────────────────────────────────

export function formatMissionDuration(duration: MissionDuration): string {
  switch (duration) {
    case 'today': return 'Available today. It does not need to be completed. Only entered.';
    case '24h': return 'This lives for the next 24 hours. It does not need to be completed. Only entered.';
    case 'until_next_return': return 'This lives until you return. It does not need to be completed. Only entered.';
  }
}
