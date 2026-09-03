/**
 * Legacy assembly digest for /list — CMT-01, Step 3b.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4.1
 *
 * Reduces what `app/api/sovereign/app/maia/list/route.ts` ALREADY LOADED for a
 * turn into the comparable `AssemblyDigest` shape. It takes the route's in-scope
 * artifacts by value: nothing here loads, nothing here writes, and the legacy
 * path is untouched by being measured.
 *
 * ── WHAT THE ROUTE ASSEMBLES, FROM SOURCE, IN THIS ORDER ────────────────────
 *
 *   member_web      buildMemberLiveContext → certifyMemberWeb → formatMemberWebForPrompt
 *   developmental   loadRecentDevelopmentalMemories ┐ buildMemoryInfluencePlan → ONE block,
 *   themes          loadRecentThemeSignals          ┘ keyed on `developmental`
 *   atoms           loadMemberMemoryAtomsForPrompt → formatAtomsForPrompt
 *   conversation    loadPriorCrossSessionExchanges → formatPriorExchangesForPrompt
 *   episodes        loadRecentMarkedEpisodes → formatMarkedEpisodesForPrompt
 *
 * The constructor composes with the SAME formatters, in profile order, so the
 * block digests are comparable by construction.
 *
 * What the route does NOT assemble — these run INSIDE `getMaiaResponse`
 * (`lib/sovereign/maiaService.ts:748`, `:895`), below the seam:
 *
 *   relationship, session_recall                → `unobserved:below_seam`
 *
 * Every other registry provider is `not_in_profile` here: the route never had
 * it, and an absent row must never be mistaken for a held one.
 */

import type { MemoryAtomSnapshot } from '../memoryAtomsLoader';
import type { DevelopmentalMemorySnapshot, ThemeSignalSnapshot } from '../types/memoryOrchestrator';
import type { PriorExchangeSnapshot, MarkedEpisodeSnapshot } from '../memoryLoaders';
import type { CertifiedMemberWeb } from '@/lib/memory/MemberLiveContext';
import type { ProviderId } from './providers';
import {
  ALL_PROVIDERS,
  bodyDigest,
  floorDigestOf,
  fieldDigestOf,
  type AssemblyDigest,
  type ProviderDigest,
  type HeldReasonDigest,
} from './shadowCompare';

export interface LegacyListAssembly {
  isSanctuary: boolean;
  isRecognizedUser: boolean;
  allowCrossSessionMemory: boolean;
  certifiedWeb: CertifiedMemberWeb | null;
  developmental: DevelopmentalMemorySnapshot[] | null;
  themes: ThemeSignalSnapshot[] | null;
  atoms: MemoryAtomSnapshot[] | null;
  conversation: { enabled: boolean; rows: PriorExchangeSnapshot[]; suppressedReason?: string; emitted: boolean } | null;
  episodes: { enabled: boolean; rows: MarkedEpisodeSnapshot[]; suppressedReason?: string; emitted: boolean } | null;
  /** The composed addenda the route actually produced. */
  composed: Partial<Record<'member_web' | 'developmental' | 'atoms' | 'conversation' | 'episodes', string | undefined>>;
  errors?: Partial<Record<ProviderId, string>>;
  observation?: Record<string, string | number | boolean | null | undefined>;
}

const notInvoked = (held: HeldReasonDigest): ProviderDigest => ({
  invoked: false, held, returned: 0, admitted: 0, excluded: 0, excludedByReason: {}, classes: {},
});

/** The route loads, then the formatter decides. 'opt-out'/'sanctuary' mean the constructor would have HELD; others are formatter suppression after admission. */
function legacySuppression(reason: string | undefined): { held?: HeldReasonDigest; suppressed?: string } {
  if (reason === 'opt-out') return { held: 'consent_gate_off' };
  if (reason === 'sanctuary') return { held: 'sanctuary' };
  if (reason && reason !== 'empty') return { suppressed: reason };
  return {};
}

export function legacyDigestFromListAssembly(a: LegacyListAssembly): AssemblyDigest {
  const providers: AssemblyDigest['providers'] = {};
  const consent: Partial<Record<string, boolean>> = {};
  const classes = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).filter(([, n]) => n > 0));
  const err = (id: ProviderId) => (a.errors?.[id] ? { error: a.errors[id]! } : {});
  /** A loader that FAILED is invoked-and-failed, whatever the route captured after it. Never `held`, never empty. */
  const failed = (id: ProviderId): ProviderDigest | null =>
    a.errors?.[id] ? { invoked: true, returned: 0, admitted: 0, excluded: 0, excludedByReason: {}, classes: {}, error: a.errors[id]! } : null;
  const gatedOff: HeldReasonDigest = a.isSanctuary ? 'sanctuary' : 'not_in_profile';

  // member_web — ONE certified object (R27), with what it withheld counted.
  if (failed('member_web')) providers.member_web = failed('member_web')!;
  else if (a.certifiedWeb) {
    const ex = a.certifiedWeb.excluded;
    const excludedCount = ex.patterns + ex.sessions + ex.themes + (ex.fieldState ? 1 : 0);
    providers.member_web = { invoked: true, returned: 1, admitted: 1, excluded: excludedCount, excludedByReason: excludedCount ? { unendorsed_inference: excludedCount } : {}, classes: {}, ...err('member_web') };
  } else providers.member_web = notInvoked(gatedOff);

  // developmental / themes — R24 unions already carry their verdicts.
  const union = (id: 'developmental' | 'themes', rows: Array<{ participation: string; exclusionReason?: string }> | null) => {
    if (failed(id)) { providers[id] = failed(id)!; return; }
    if (!a.allowCrossSessionMemory || rows === null) { providers[id] = notInvoked(gatedOff); return; }
    const byReason: Record<string, number> = {}; let admitted = 0;
    for (const r of rows) {
      if (r.participation === 'admitted') admitted++;
      else { const k = r.exclusionReason ?? 'uncertified_provenance'; byReason[k] = (byReason[k] ?? 0) + 1; }
    }
    providers[id] = { invoked: true, returned: rows.length, admitted, excluded: rows.length - admitted, excludedByReason: byReason, classes: {}, ...err(id) };
  };
  union('developmental', a.developmental as never);
  union('themes', a.themes as never);

  // atoms — the loader applies P6 / R04; every returned row is admitted.
  if (failed('atoms')) providers.atoms = failed('atoms')!;
  else if (a.allowCrossSessionMemory && a.atoms) {
    const practitioner = a.atoms.filter((x) => x.sourceType === 'practitioner_observation').length;
    providers.atoms = { invoked: true, returned: a.atoms.length, admitted: a.atoms.length, excluded: 0, excludedByReason: {}, classes: classes({ 'member:member_act': a.atoms.length - practitioner, 'practitioner:observation': practitioner }), ...err('atoms') };
  } else providers.atoms = notInvoked(gatedOff);

  // conversation — legacy loads then the formatter decides.
  if (failed('conversation')) providers.conversation = failed('conversation')!;
  else if (a.allowCrossSessionMemory && a.conversation) {
    consent.conversational_recall_enabled = a.conversation.enabled;
    const s = legacySuppression(a.conversation.suppressedReason);
    if (s.held) providers.conversation = notInvoked(s.held);
    else {
      const n = a.conversation.rows.length;
      providers.conversation = { invoked: true, returned: n, admitted: n, excluded: 0, excludedByReason: {}, classes: classes({ 'member:testimony': a.conversation.rows.filter((r) => r.role === 'user').length }), ...(s.suppressed ? { suppressed: s.suppressed } : {}), ...err('conversation') };
    }
  } else providers.conversation = notInvoked(gatedOff);

  // episodes — marked_by_member rows are testimony.
  if (failed('episodes')) providers.episodes = failed('episodes')!;
  else if (a.allowCrossSessionMemory && a.episodes) {
    consent.episodic_recall_enabled = a.episodes.enabled;
    const s = legacySuppression(a.episodes.suppressedReason);
    if (s.held) providers.episodes = notInvoked(s.held);
    else {
      const n = a.episodes.rows.length;
      providers.episodes = { invoked: true, returned: n, admitted: n, excluded: 0, excludedByReason: {}, classes: classes({ 'member:testimony': n }), ...(s.suppressed ? { suppressed: s.suppressed } : {}), ...err('episodes') };
    }
  } else providers.episodes = notInvoked(gatedOff);

  // Below the seam on this side. Reported, never guessed.
  providers.relationship = notInvoked('unobserved:below_seam');
  providers.session_recall = notInvoked('unobserved:below_seam');

  // Everything the route never had.
  for (const id of ALL_PROVIDERS) if (!providers[id]) providers[id] = notInvoked('not_in_profile');

  // Composed sections, in the route's own order, keyed by provider.
  const routeOrder: Array<'member_web' | 'developmental' | 'atoms' | 'conversation' | 'episodes'> =
    ['member_web', 'developmental', 'atoms', 'conversation', 'episodes'];
  const sections: AssemblyDigest['sections'] = {};
  const sectionOrder: ProviderId[] = [];
  for (const id of routeOrder) {
    const block = a.composed[id];
    if (block && block.length > 0) {
      sections[id] = { digest: bodyDigest(block), items: providers[id]?.admitted ?? 0 };
      sectionOrder.push(id);
    }
  }

  const partial = {
    profile: 'legacy:A',
    gates: { sanctuary: a.isSanctuary, crossSessionAllowed: a.allowCrossSessionMemory, consent },
    providers, sections, sectionOrder,
    floorDigest: floorDigestOf(sectionOrder, sections),
  };
  return { side: 'legacy', ...partial, fieldDigest: fieldDigestOf(partial), observation: a.observation ?? {} };
}
