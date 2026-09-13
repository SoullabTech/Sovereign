import type { RefusalCheck } from './harness';

/**
 * Refusal 32 — No externally acquired member-specific context may be acquired for,
 * attached to, or admitted into MAIA cognition without an explicit authorized
 * acquisition/admission path.
 *
 * Provenance: JARVIS-SOVEREIGN-ACTION-SUBSTRATE-01 MCP substrate census (2026-09-13)
 * found lib/consciousness/maiaOrchestrator.ts calling
 * getMCPConsciousnessIntegration().generateOracleEnrichment(userId, message) on every
 * turn — acquiring Apple Health biometrics, calendar timing, task workload and
 * "consciousness markers" for a member and attaching them to the cognition context —
 * with no consent gate on the crossing.
 *
 * It reached no member (no readers; npx transports unresolvable in a Linux container;
 * no server registered). The founder ruling refused that as a defence:
 *
 *   "Dormancy is not sovereignty. A path nobody currently consumes is still a path."
 *
 * The law is deliberately NOT written about MCP. MCP was the instance; the crossing is
 * the subject. Two boundaries, held separate because consent to one is not consent to
 * the other:
 *
 *   ACQUISITION — may Soullab obtain this information for this turn?
 *   ADMISSION   — may this information participate in MAIA cognition?
 *
 * Connecting Apple Health is not consent to read it on every conversational turn.
 *
 * This is the inward mirror of the outward custody boundary: information crossing OUT
 * needs custody; member-specific information crossing IN needs admission authority, not
 * merely a technical connector.
 */

/** Modules that constitute MAIA cognition assembly. A crossing here is a crossing into the mind. */
const COGNITION = [
  'lib/consciousness/maiaOrchestrator.ts',
  'lib/maia/maiaRuntimeContext.ts',
  'lib/sovereign/maiaService.ts',
  'lib/sovereign/maiaVoice.ts',
];

/** The external-context substrate. Present in the tree, inert, and out of bounds to cognition. */
const EXTERNAL_SUBSTRATE = /@\/lib\/mcp|['"]\.\.?\/(\.\.\/)*lib\/mcp/;

/**
 * Strip block and line comments before scanning.
 *
 * Same discipline as C6/C21 (Circles) and R26. A quarantine comment necessarily NAMES the
 * thing it quarantines; a detector that scans prose fails on the file precisely because
 * that file documents its own compliance. A prose ban must never read as the banned
 * behavior returning.
 */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export const check: RefusalCheck = {
  id: 'R32',
  refusal:
    'No externally acquired member-specific context may be acquired for, attached to, or admitted into MAIA cognition without an explicit authorized acquisition/admission path',
  grade: 'Proposed',
  enforcedBy:
    'absence of any lib/mcp import or enrichment call in the cognition assembly modules (lib/consciousness/maiaOrchestrator.ts and siblings)',
  evidence:
    'maiaOrchestrator.ts:440-465 (pre-quarantine) called generateOracleEnrichment(userId, message) every turn and assigned mcpContext/mcpEnrichment onto the cognition context with no consent gate',
  violationAttempted:
    'find an import of lib/mcp, a *ConsciousnessIntegration acquisition call, or an external-context field attached to the cognition context, in any cognition assembly module',
  passingAuthorizes:
    'that no external member-context crossing into MAIA cognition currently exists in these modules',
  passingDoesNotAuthorize:
    'that lib/mcp is safe, that its adapters are consent-correct, or that an acquisition/admission path has been designed — none of that is built, and this refusal does not substitute for it',
  hostileForkMustChange:
    're-import lib/mcp into a cognition module, or re-attach an enrichment field to the cognition context — visible diff, no silent reactivation',

  run(io) {
    let crossings = 0;

    for (const mod of COGNITION) {
      if (!io.exists(mod)) {
        io.warn('cognition module absent from tree', mod);
        continue;
      }
      const src = code(io.read(mod));

      // 1. ACQUISITION — the cognition module may not reach the external-context substrate at all.
      if (EXTERNAL_SUBSTRATE.test(src)) {
        io.fail('cognition module imports the external-context substrate (lib/mcp)', mod);
        crossings++;
      }

      // 2. ACQUISITION — no per-turn enrichment call for a member.
      const acquisition = /generateOracleEnrichment\s*\(|getMCPConsciousnessIntegration\s*\(|ConsciousnessIntegration\s*\(\s*\)/;
      if (acquisition.test(src)) {
        io.fail('cognition module acquires external member context per turn', mod);
        crossings++;
      }

      // 3. ADMISSION — no external-context field attached to the cognition context object.
      const admission = /\b(mcpContext|mcpEnrichment|biometricCorrelation|externalContext)\s*:/;
      if (admission.test(src)) {
        io.fail('external member context attached to the cognition context', mod);
        crossings++;
      }
    }

    if (crossings === 0) {
      io.pass('no external member-context crossing into MAIA cognition', COGNITION.join(', '));
    }

    // The substrate is expected to still EXIST. Quarantine is not deletion, and this
    // refusal must not be read as a claim that lib/mcp was removed or made safe.
    if (io.exists('lib/mcp/config.ts')) {
      io.note(
        'lib/mcp/** remains in the tree as inert legacy',
        'four integrations still default ON via `!== \'false\'` (config.ts:96-120) with no MCP_* in .env.example; acquisition/admission authority is UNBUILT — JARVIS-SOVEREIGN-ACTION-SUBSTRATE-01 Q2 open',
      );
    }
  },
};
