# Provider Debt Reachability Census — read-only

**Status:** 🔎 **CENSUS ONLY. ⛔ Nothing ruled. No guard built. No policy, handler, dependency or
production code changed.**
**Subject:** `2d3a39904` · **Instrument:** `scripts/provider/debt-reachability-census.mjs`
**Lane note:** this is **provider governance**, not JOP-04. It shares a branch for custody
convenience only and decides nothing in the capability-contract lane.

---

## 0 · Two corrections that precede the findings

**⛔ `check:no-cloud-ai` — DO NOT BUILD.** Proposed earlier in this session; **withdrawn.** It would
contradict ratified Provider Governance (Anthropic is an authorized production-tier provider for
chat/member data through `sovereignRouter`; OpenAI is lab-tier, removal-in-progress), and it would
duplicate an existing guard badly. **A universal "no cloud AI" law does not exist and must not be
manufactured by a scanner.**

**⛔ A second claim of mine is WITHDRAWN.** I asserted the guard could not see a raw
`fetch('https://api.openai.com/…')`, and therefore that `lib/maia/maia-router.ts` was invisible to it.
**False.** The rule set has **four** rules, not two — I transcribed it by hand and stopped at line 36,
missing `{ rule: "openai REST endpoint", re: /api\.openai\.com/ }` at line 37. `maia-router.ts` **is**
seen and **is** legitimately tracked debt.

> ⭐ **Method consequence, applied:** the gap probe below **derives the rules from source** rather than
> retyping them. *An instrument that restates its subject can only ever test the restatement.*

---

## 1 · The guard, as it actually is

```text
npm run check:no-openai  →  scripts/check-provider-governance.ts
wired into               →  preflight  ·  ci:sovereignty
policy                   →  scripts/provider-policy.json  (docs/canon/PROVIDER_GOVERNANCE.md)
baseline at 2d3a39904    →  ✅ green · "Migration debt on allowlist: 53 file(s) tracked toward zero"

RULES (derived from source, 4)
  openai client/import         from 'openai' | require('openai') | new OpenAI(
  langchain-openai import      from '@langchain/openai'
  openai REST endpoint         api.openai.com
  browser api key (FORBIDDEN)  NEXT_PUBLIC_*OPENAI*      — never allowlistable
```

⭐ **It governs SOURCE SURFACES, and does so correctly.** A file that authors a new OpenAI surface
outside the allowlist fails. That is a real, working control.

---

## 2 · Reachability classification

Graph: **7,197** tracked source files · **1,494** production roots (`app/**/{route,page,layout}`,
`middleware.ts`, tests excluded) · **3,644** production-reachable.

```text
NAMED SURFACES — 34 explicit policy entries
   7  PRODUCTION-REACHABLE
  11  REACHABLE, not from a production root
  16  DORMANT · no importers

BULK PREFIX  app/api/_backend/ — 889 files
  60  PRODUCTION-REACHABLE     412  reachable, not from a production root
 410  DORMANT                    7  test-only importers
```

**The seven named production-reachable surfaces:**

```text
lib/voice/maiaVoiceService.ts   ← app/api/sovereign/app/maia/voice/route.ts
lib/tts/openaiTts.ts            ← app/api/admin/voice-lab/synthesize/route.ts
app/api/voice/openai-tts/route.ts          (a route itself)
app/api/voice/webrtc-session/route.ts      (a route itself)
lib/agents/PersonalOracleAgent.ts   ← app/api/empowerment/orchestrate/route.ts → … → ElementalVoiceOrchestrator
lib/utils/modelService.ts           ← the same chain → AetherAgent → modelService
lib/elemental-oracle-2-bridge.ts    ← app/api/empowerment/orchestrate/route.ts → … → maia-consciousness-lattice
```

All 60 `_backend` surfaces reach production through **one** door:
`app/api/oracle/memory/route.ts → _backend/PersonalOracleAgent → AgentRegistry → {Fire,Water,Earth,Air,Aether,Archetype,oracle}Agent`.

⛔ **Import-reachable is NOT "OpenAI is being called."** This census measures the module graph and
nothing else. Whether any of these execute, and under what runtime conditions, is **unmeasured here**.

---

## 3 · ⭐ The finding the census was authorized to test — CONFIRMED

Probe run in memory against the source-derived rules; **the tree was not modified**:

```text
PROBE    a new production route importing the DORMANT, ALLOWLISTED lib/maia/maia-router.ts
         → 0 rule hits  ·  the guard stays GREEN
CONTROL  the same file authoring its OWN OpenAI surface
         → 1 hit (openai REST endpoint)  ·  the guard catches it correctly
```

> ### ⚠️ PROVIDER-DEBT ACTIVATION IS NOT GOVERNED
>
> **An allowlisted quarantined surface can acquire new production reachability without producing a
> single new OpenAI-pattern hit.** The importer contains no `openai`, no `api.openai.com`, no
> `new OpenAI(` — because the offending surface is the file it *imports*, already on the allowlist.
>
> ⭐ **The guard governs what a file SAYS. Nothing governs what a file can now REACH.**

This is the "dormant precedent gets wired back in" failure mode — the same mechanism as the lane's
*merge-to-canonical* finding: **quarantine that can be exited by an ordinary, individually innocent
act.**

**Shape of the invariant this argues for** (⛔ not authorized, not built):

```text
provider quarantine MAY shrink
provider quarantine MAY become less reachable
provider quarantine MAY NOT gain new production reachability
    without an explicit provider-governance act
```

⭐ Strictly stronger than "grep the tree for cloud AI", and it governs the property that actually
changed.

---

## 4 · ⛔ Two questions this census RAISES and does not answer

**Q1 — the runtime gate is an environment variable.** Both production-reachable TTS surfaces gate on
**`process.env.OPENAI_API_KEY` being present** (`lib/voice/maiaVoiceService.ts:8`,
`lib/tts/openaiTts.ts:11`) — not a provider-router decision, not a governance flag.

```text
⭐ a debt surface's EFFECTIVE class is decided by the ENVIRONMENT, not by code
⛔ whether OPENAI_API_KEY is set in production is UNOBSERVED — not checked from here, not inferred
```

Does that belong to this census, or is it a separate provider-governance question? **Founder call.**

**Q2 — is `app/api/oracle/memory/route.ts` live or legacy?** All 60 `_backend` surfaces depend on that
single door. ⛔ **If the route is dead, the bulk figure overstates exposure considerably.** This census
has no basis to decide it, and deliberately does not guess.

---

```text
CENSUS            COMPLETE · read-only · tree unmodified by the probe
GUARD             ✅ green at 2d3a39904 · unchanged
NEW FINDING       provider-debt activation NOT GOVERNED — confirmed by probe + control
WITHDRAWN         check:no-cloud-ai · and the "guard cannot see api.openai.com" claim
OWED              Q1 · Q2 · then whether a reachability invariant is authorized
AUTHORIZED HERE   nothing further
```
