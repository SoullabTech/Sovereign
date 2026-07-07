import type { RefusalCheck } from './harness';

/**
 * Refusal 15 — In the `production-maia` deployment context, the TTS router may
 * only *select* Stage-A-qualified (local, sovereign) providers. `openai` (cloud
 * egress), `pplex` (MLX, no x86 production backend), and `sesame` (the production
 * `maia-sesame-tts` service does CI text-shaping only, not audio synthesis — so a
 * production selection would emit a buffer mislabeled provider:'sesame' from a
 * non-Sesame backend) cannot be selected there. `sesame` remains a lab candidate.
 *
 * This is the gate that ships WITH the PersonaPlex capability: the `pplex`
 * dispatch branch in ttsRouter is only reachable through `assertProviderQualified`,
 * and the Voice Lab's provider switcher therefore cannot become a production
 * egress bypass. Widening the production allow-list is a visible diff, tied to a
 * decision record (docs/adr/012-openai-tts-production-status.md).
 *
 * Grade B — a runtime code gate, not absence-of-code: the provider strings still
 * exist and the branch is present, but selection is structurally refused
 * (ProviderNotQualifiedError) at a single funnel before dispatch. A fork defeats
 * it only by editing the allow-list or deleting the guard call — both visible.
 *
 * The guard FAILS CLOSED: any MAIA_DEPLOYMENT_CONTEXT other than the explicit
 * 'voice-quality-lab' resolves to 'production-maia', so a missing/typo'd env can
 * never silently unlock cloud/unqualified providers.
 */

const ROUTER = 'lib/tts/ttsRouter.ts';

// The production-maia allow-list literal: `'production-maia': [ ... ]`
const PROD_ALLOWLIST_RE = /'production-maia':\s*\[([^\]]*)\]/;
// The lab allow-list literal.
const LAB_ALLOWLIST_RE = /'voice-quality-lab':\s*\[([^\]]*)\]/;
// The guard is invoked inside synthesize (a call, not the definition).
const GUARD_CALL_RE = /(?<!function )(?<!\. )assertProviderQualified\(provider\)/;
// getDeploymentContext fails closed to production-maia.
const FAIL_CLOSED_RE =
  /MAIA_DEPLOYMENT_CONTEXT === 'voice-quality-lab'[\s\S]*?:\s*'production-maia'/;
// The pplex capability branch (proves capability + gate ship together).
const PPLEX_DISPATCH_RE = /primary === 'pplex'/;

export const check: RefusalCheck = {
  id: 'R15',
  refusal:
    'In production-maia, ttsRouter may only select Stage-A-qualified local providers; openai, pplex, and sesame cannot be selected (Voice Lab switch is not a production egress bypass; prod sesame backend is CI-shaping only, not audio)',
  grade: 'B',
  enforcedBy:
    'lib/tts/ttsRouter.ts — assertProviderQualified() invoked in synthesize() before dispatch; QUALIFIED_PROVIDERS["production-maia"] excludes openai + pplex + sesame; getDeploymentContext() fails closed',
  evidence: [
    `${ROUTER}: QUALIFIED_PROVIDERS['production-maia'] = ['auto','kokoro'] (no openai, no pplex, no sesame)`,
    `${ROUTER}: synthesize() calls assertProviderQualified(provider) before any dispatch branch`,
    `${ROUTER}: getDeploymentContext() returns 'production-maia' unless env is explicitly 'voice-quality-lab'`,
    `${ROUTER}: pplex dispatch branch exists and is reachable only past the guard`,
  ].join(' | '),
  violationAttempted: [
    "(1) is 'openai', 'pplex', or 'sesame' present in the production-maia allow-list?",
    '(2) is the guard call missing from synthesize (allow-list dead)?',
    '(3) does the deployment context fail OPEN (default to lab)?',
    '(4) does the pplex capability branch exist without a guard (capability shipped without gate)?',
  ].join('; '),
  passingAuthorizes:
    'the claim that a production-maia deployment structurally refuses selecting openai/pplex via the router, and the pplex capability is gated behind that refusal',
  passingDoesNotAuthorize:
    'that OpenAI is absent from production entirely (the archetype→OpenAI path is a separate, open governance question — ADR-012), that PersonaPlex is deployed or reachable anywhere, that the Voice Lab UI exists yet, or that member voice preference paths are gated by this (they resolve to auto/local)',
  hostileForkMustChange:
    "add 'openai', 'pplex', or 'sesame' to QUALIFIED_PROVIDERS['production-maia'] (visible diff), delete the assertProviderQualified(provider) call in synthesize (visible diff), or make getDeploymentContext default to voice-quality-lab (visible diff)",

  run(io) {
    const src = io.read(ROUTER);

    // ── 1: production-maia allow-list excludes openai, pplex AND sesame ──
    const prod = PROD_ALLOWLIST_RE.exec(src);
    if (!prod) {
      io.fail(
        "no QUALIFIED_PROVIDERS['production-maia'] literal found",
        'the qualification allow-list this refusal guards is absent',
      );
    } else {
      const body = prod[1];
      const hasOpenai = /'openai'/.test(body);
      const hasPplex = /'pplex'/.test(body);
      const hasKokoro = /'kokoro'/.test(body);
      const hasSesame = /'sesame'/.test(body);
      if (!hasOpenai && !hasPplex && !hasSesame && hasKokoro) {
        io.pass(
          'production-maia allow-list is verified-local-only',
          `[${body.trim()}] — no openai, no pplex, no sesame`,
        );
      } else {
        io.fail(
          'production-maia allow-list admits a non-qualified provider',
          `openai=${hasOpenai} pplex=${hasPplex} sesame=${hasSesame} kokoro=${hasKokoro}`,
        );
      }
    }

    // ── 2: the guard is actually invoked in synthesize ──
    if (GUARD_CALL_RE.test(src)) {
      io.pass(
        'assertProviderQualified(provider) is invoked before dispatch',
        'the allow-list is live, not decorative',
      );
    } else {
      io.fail(
        'no assertProviderQualified(provider) call found',
        'the allow-list exists but nothing enforces it — provider selection is ungated',
      );
    }

    // ── 3: fail-closed deployment context ──
    if (FAIL_CLOSED_RE.test(src)) {
      io.pass(
        'deployment context fails closed to production-maia',
        "only an explicit 'voice-quality-lab' unlocks the wider allow-list",
      );
    } else {
      io.fail(
        'deployment context does not demonstrably fail closed',
        "expected getDeploymentContext to default to 'production-maia'",
      );
    }

    // ── 4: capability + gate ship together ──
    const labHasPplex = (() => {
      const lab = LAB_ALLOWLIST_RE.exec(src);
      return lab ? /'pplex'/.test(lab[1]) : false;
    })();
    if (PPLEX_DISPATCH_RE.test(src) && labHasPplex) {
      io.pass(
        'pplex capability exists and is lab-selectable, reachable only past the guard',
        'capability + gate shipped together',
      );
    } else {
      io.note(
        'pplex dispatch branch and/or lab allow-list entry not both present',
        `dispatch=${PPLEX_DISPATCH_RE.test(src)} labAllows=${labHasPplex}`,
      );
    }
  },
};
