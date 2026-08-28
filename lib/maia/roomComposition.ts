/**
 * Ephemeral-room prompt composition — the shared block the What Now? family of
 * interview routes composes turn prompts through:
 *
 *   /api/now-what/interview
 *   /api/maia/vision-studio/interview
 *
 * Extracted so the two sibling routes cannot drift (the addenda-channel
 * divergence lesson, docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md):
 * one composition order, one field resolution, one provenance shape.
 *
 * Constitutional ordering (the same order maiaVoice enforces for guidance) —
 * whenever anything beyond the room's own config is composed, MAIA's
 * constitutional floor is composed above it:
 *
 *   MAIA_RUNTIME_PROMPT   — constitutional floor, FIRST
 *   presence              — member's read-only constitutional-memory addenda
 *   field                 — the practitioner's field, as context never instructions
 *   position              — where the MEMBER declared they stand in the program
 *                           (program-position spec; absent if the field is absent)
 *   roomPrompt            — the room's own Field Configuration; carries the
 *                           standing hard limits LAST
 *
 * Everything here is read-only and non-fatal by construction: these rooms
 * persist nothing, and any loader failure degrades to the room's own prompt.
 *
 * Env flags are shared across the family (one kill-switch, one register pin —
 * the vision-studio room is the deployment surface of the same What Now?
 * program, not a separate product):
 *   NOW_WHAT_MAIA_PRESENCE_ENABLED — '1' composes MAIA presence (Stage 1, ADR-013)
 *   NOW_WHAT_FIELD_CONTEXT_ENABLED — kill-switch for field composition (default ON;
 *                                    eligibility originates from the room URL's
 *                                    fieldContext, mirroring the anchors model)
 *   NOW_WHAT_PRACTICE_FIELD_ID     — room-wide DEFAULT field pin, applied only when
 *                                    no fieldContext arrives with the request
 *   NOW_WHAT_CLOUD_REGISTER        — '1' pins the family's voice to Claude
 *                                    (see cloudRegisterPinned)
 */

import { MAIA_RUNTIME_PROMPT } from '@/lib/consciousness/MAIA_RUNTIME_PROMPT';
import { buildMemoryInfluencePlan } from '@/lib/maia/memoryOrchestrator';
import {
  loadRecentDevelopmentalMemories,
  loadRecentThemeSignals,
  loadPriorCrossSessionExchanges,
  loadConversationalRecallPref,
} from '@/lib/maia/memoryLoaders';
import { loadMemberMemoryAtomsForPrompt, formatAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';
import {
  formatPriorExchangesForPrompt,
  computeLastPriorSessionMinutesAgo,
} from '@/lib/maia/conversationalRecallBlock';
import {
  assembledContext,
  renderAssembledContext,
  type AssembledBlock,
} from '@/lib/maia/context-assembly/contextAssembly';
import { memberRef } from '../privacy/memberRef';
import {
  getPracticeFieldById,
  getPracticeFieldBySlug,
  formatFieldContextForRoom,
} from '@/lib/practiceField/practiceFieldService';
import { memberMayComposeField } from '@/lib/practiceField/compositionBoundary';
import { composeProgramPositionBlock } from '@/lib/practiceField/programPositionService';
import { composeLessonContext } from '@/lib/practiceField/programAuthoringService';

/**
 * NOW_WHAT_CLOUD_REGISTER=1 pins this room family's voice to Claude regardless
 * of LOCAL_TIER_ENABLED's core→Ollama routing. Scoped to these routes only —
 * the register decision for client-facing field presence at full capability,
 * not a platform-wide routing change. Flag-gated, reversible; the local-first
 * default remains the platform posture.
 */
export function cloudRegisterPinned(): boolean {
  return process.env.NOW_WHAT_CLOUD_REGISTER === '1';
}

/**
 * Field-composition provenance, carried on every turn reply (same discipline as
 * `served`): whether a practitioner's field was in the prompt is answerable
 * from the artifact, not the deploy env. `source` names how the field was
 * selected — 'request' (the room URL's fieldContext) or 'room-default' (the
 * NOW_WHAT_PRACTICE_FIELD_ID deploy pin). No silent composition either way.
 */
export interface RoomFieldProvenance {
  slug: string | null;
  composed: true;
  source: 'request' | 'room-default';
}

export interface ComposedRoomPrompt {
  systemPrompt: string;
  field: RoomFieldProvenance | null;
}

/**
 * Resolve which practitioner field (if any) enters this turn, and render it.
 *
 * Selection rules:
 * - An explicit fieldContext resolves by slug, or composes NOTHING — an
 *   unresolved slug never falls back to a different field than the URL named.
 * - Absent fieldContext, the room-wide env pin (if set) selects the default
 *   field. Its provenance is labeled source:'room-default', never hidden.
 * - Render is formatFieldContextForRoom for BOTH paths: guardrail header,
 *   knowledge stance, the field's corpus in full — depth is the product, and
 *   the slug path must not be a thinner sibling of the pinned path.
 */
async function resolveFieldBlock(
  fieldContext: unknown,
  roomTag: string,
  memberId: string,
): Promise<{ block: string; provenance: RoomFieldProvenance | null }> {
  if (process.env.NOW_WHAT_FIELD_CONTEXT_ENABLED === '0') return { block: '', provenance: null };
  const slug =
    typeof fieldContext === 'string'
      ? fieldContext.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
      : '';
  try {
    if (slug) {
      const field = await getPracticeFieldBySlug(slug);
      // NW-A02 repair 2 — the slug arrives in the REQUEST. Composing it without
      // establishing that this member is authorized for this field let any
      // authenticated member pull any practitioner's governing text into their
      // own room prompt (NW-A01 F4). Refusal is the default.
      const auth = await memberMayComposeField(memberId, field);
      if (!auth.authorized) {
        console.warn(`[${roomTag}/field] REFUSED — member not authorized for field`, { slug });
        return { block: '', provenance: null };
      }
      const block = formatFieldContextForRoom(field);
      if (block) {
        console.log(`[${roomTag}/field] composed`, { slug, source: 'request', blockChars: block.length });
        return { block, provenance: { slug, composed: true, source: 'request' } };
      }
      console.warn(`[${roomTag}/field] no field for slug (room continues without field):`, slug);
      return { block: '', provenance: null };
    }
    const roomFieldId = process.env.NOW_WHAT_PRACTICE_FIELD_ID;
    if (roomFieldId) {
      const field = await getPracticeFieldById(roomFieldId);
      const block = formatFieldContextForRoom(field);
      if (block) {
        const defaultSlug = field?.field_slug ?? null;
        console.log(`[${roomTag}/field] composed`, {
          slug: defaultSlug,
          source: 'room-default',
          fieldIdPrefix: roomFieldId.slice(0, 8),
          blockChars: block.length,
        });
        return { block, provenance: { slug: defaultSlug, composed: true, source: 'room-default' } };
      }
    }
  } catch (err) {
    console.warn(`[${roomTag}/field] load failed (non-fatal; room continues without field):`, err);
  }
  return { block: '', provenance: null };
}

/**
 * Assemble the member's read-only presence context: constitutional-memory addenda
 * (developmental influence, member-placed atoms, opt-out-gated cross-session recall).
 * Read-only and non-fatal by construction — the room persists nothing, and any failure
 * degrades silently to the base Field Configuration rather than breaking the encounter.
 * The room holds no server session, so cross-session recall is passed an ephemeral marker
 * id (nothing excluded, nothing written).
 *
 * First embodiment of the Context Assembly interface (lib/maia/context-assembly).
 * Builds named AssembledBlocks from the SHARED loader/orchestrator layer — the same
 * primitives /maia composes — then renders them. Behavior is byte-identical to the
 * prior hand-joined string: same blocks, same order, same '\n\n' separator. The only
 * addition is provenance keys on each block, which never reach the prompt text.
 */
async function assemblePresenceContext(
  memberId: string,
  message: string,
  roomTag: string,
  ephemeralSessionId: string,
): Promise<string> {
  const blocks: AssembledBlock[] = [];
  try {
    const [developmental, themeSignals] = await Promise.all([
      loadRecentDevelopmentalMemories(memberId, 3),
      loadRecentThemeSignals(memberId, 10),
    ]);
    const memoryPlan = buildMemoryInfluencePlan({
      message,
      userId: memberId,
      conversationHistory: [],
      recentDevelopmentalMemories: developmental,
      recentThemeSignals: themeSignals,
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    if (memoryPlan.promptBlock) blocks.push({ key: 'memoryInfluence', text: memoryPlan.promptBlock });

    const atoms = await loadMemberMemoryAtomsForPrompt(memberId);
    const atomsBlock = formatAtomsForPrompt(atoms);
    if (atomsBlock) blocks.push({ key: 'atoms', text: atomsBlock });

    const recallEnabled = await loadConversationalRecallPref(memberId);
    const prior = await loadPriorCrossSessionExchanges(memberId, ephemeralSessionId, 6);
    const recall = formatPriorExchangesForPrompt(prior, {
      recallEnabled,
      mode: null,
      currentSessionTurnCount: 0,
      lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(prior),
    });
    if (recall.block) blocks.push({ key: 'conversational', text: recall.block });

    console.log(`[${roomTag}/presence] assembled`, {
      memberRef: memberRef(memberId),
      developmental: developmental.length,
      atoms: atoms.length,
      priorExchanges: prior.length,
      blockChars: renderAssembledContext(assembledContext(blocks)).length,
    });
  } catch (err) {
    console.warn(`[${roomTag}/presence] assembly failed (non-fatal; degraded to base):`, err);
  }
  return renderAssembledContext(assembledContext(blocks));
}

/**
 * Compose a live-turn system prompt for an ephemeral What Now?-family room.
 *
 * Turn-only — 'propose' stays a thin JSON extractor (a utility, not an
 * encounter) and must not pass through here. With presence off and no field,
 * the returned systemPrompt is exactly the room's own prompt, unchanged.
 */
/**
 * Compose the constitutional floor above a room's own prompt — nothing else.
 *
 * NW-I01 (2026-08-26). For call sites that must carry the floor but must NOT
 * receive the full turn composition (presence, field, position, lesson): most
 * immediately the interview route's `propose` mode, a thin JSON extractor that
 * previously ran on its own string with no floor at all (NW-S01, bypass 1).
 *
 * SCOPE (founder ruling, NW-I01): this makes the floor structurally reliable.
 * It does NOT invent or broaden the floor's substantive meaning — the content
 * of MAIA_RUNTIME_PROMPT is unchanged by this unit, and the safety content it
 * still lacks is blocked on qualified clinical review, not on this repair.
 *
 * Ordering matches `composeRoomTurnPrompt`: floor FIRST, the room's own grammar
 * LAST, so a room's standing hard limits keep the final word.
 */
export function composeConstitutionalFloor(roomPrompt: string): string {
  return [MAIA_RUNTIME_PROMPT, roomPrompt].filter(Boolean).join('\n\n');
}

export async function composeRoomTurnPrompt(opts: {
  /** The room's own Field Configuration (grammar + standing hard limits). */
  roomPrompt: string;
  memberId: string;
  /** The member's most recent message — steers the memory-influence plan. */
  lastMemberMessage: string;
  /** Raw request value; sanitized here. */
  fieldContext?: unknown;
  /** Raw request value (program door / member-named engagement); sanitized downstream. */
  program?: unknown;
  /** Log-marker family, e.g. 'NowWhat' | 'VisionStudio'. */
  roomTag: string;
  /** Ephemeral marker id for cross-session recall (nothing excluded, nothing written). */
  ephemeralSessionId: string;
}): Promise<ComposedRoomPrompt> {
  const { roomPrompt, memberId, lastMemberMessage, fieldContext, program, roomTag, ephemeralSessionId } = opts;
  const presenceEnabled = process.env.NOW_WHAT_MAIA_PRESENCE_ENABLED === '1';

  const { block: fieldBlock, provenance } = await resolveFieldBlock(fieldContext, roomTag, memberId);

  // Program position (NOW_WHAT_PROGRAM_POSITION_SPEC + catalog spec): composed
  // strictly downstream of the field and only when the field composed —
  // position without program is not composed (v1 §6). Context, not
  // instruction; read-only and non-fatal like everything else here.
  let positionBlock = '';
  let lessonBlock = '';
  if (fieldBlock && provenance?.slug) {
    try {
      const composed = await composeProgramPositionBlock(
        provenance.slug,
        typeof program === 'string' ? program : null,
        memberId,
      );
      positionBlock = composed.block;
      if (positionBlock) {
        console.log(`[${roomTag}/position] composed`, {
          program: composed.programSlug,
          footing: composed.footing,
          blockChars: positionBlock.length,
        });
      }
      // Lesson context (PRACTITIONER_PROGRAM_PLATFORM_ADR §G): the
      // practitioner-authored enrichment of the step this turn composed
      // around — RATIFIED materials only, re-checked at read time; strictly
      // downstream of the position block and only when a position composed.
      // Absence composes as absence.
      if (positionBlock && composed.focalPoint) {
        lessonBlock = await composeLessonContext(
          provenance.slug,
          composed.programSlug,
          composed.focalPoint,
        );
        if (lessonBlock) {
          console.log(`[${roomTag}/lesson] composed`, {
            program: composed.programSlug,
            step: composed.focalPoint,
            blockChars: lessonBlock.length,
          });
        }
      }
    } catch (err) {
      console.warn(`[${roomTag}/position] load failed (non-fatal; room continues without position):`, err);
    }
  }

  // NW-I01 (2026-08-26): the constitutional floor composes UNCONDITIONALLY.
  //
  // This function previously short-circuited here when presence was flagged off
  // and no field resolved, returning the room's own prompt alone — so
  // MAIA_RUNTIME_PROMPT, the constitutional floor, was skippable by an env flag.
  // A floor a flag can remove is not a floor (NW-S01, bypass 2).
  //
  // `presenceEnabled` still gates PRESENCE and nothing else. The two were
  // conflated; they are now separate. When presence is off and no field
  // resolves, the composition is [floor, roomPrompt] — never roomPrompt alone.
  const presence = presenceEnabled
    ? await assemblePresenceContext(memberId, lastMemberMessage, roomTag, ephemeralSessionId)
    : '';
  const systemPrompt = [MAIA_RUNTIME_PROMPT, presence, fieldBlock, positionBlock, lessonBlock, roomPrompt]
    .filter(Boolean)
    .join('\n\n');
  console.log(`[${roomTag}/presence] composed`, {
    systemPromptChars: systemPrompt.length,
    field: provenance?.slug ?? null,
  });
  return { systemPrompt, field: provenance ?? null };
}
