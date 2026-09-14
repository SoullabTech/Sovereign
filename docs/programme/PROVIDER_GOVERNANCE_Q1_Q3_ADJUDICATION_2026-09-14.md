# Provider Governance — Q1 · Q2 · Q3 adjudication

**Status:** ⭐ **SEALED.** Record-only adjudication of the three questions raised by the reachability
census. ⛔ **No policy edit, no guard change, no code change, no secret read.**
**Census subject:** `ce6b32f09` — `docs/programme/PROVIDER_DEBT_REACHABILITY_CENSUS_2026-09-14.md`
**Witness:** `scripts/provider/q1-q3-adjudication-witness.mjs` — read-only.
**Lane:** provider governance. ⛔ **Not JOP-04**; sealed separately and decides nothing there.

---

## Withdrawals carried forward (retained, not erased)

```text
⛔ check:no-cloud-ai       WITHDRAWN — contradicts ratified provider tiers and duplicates an
                           existing guard badly. No universal "no cloud AI" law exists.
⛔ "the guard cannot see    WITHDRAWN — false. The rule set has FOUR rules; I transcribed it by
   api.openai.com"         hand and missed `openai REST endpoint` at line 37.
```

---

# Q1 — the environment finding · **CLOSED**

> **Provider policy authors the class. The environment may affect technical activation only.**

⚠️ **A correction to my own framing, accepted.** I wrote that *"a debt surface's effective class is
decided by the environment, not by code."* That is wrong in the way that matters:

```text
WRONG   the environment decides the provider's effective policy class
RIGHT   provider policy decides the AUTHORIZED class
        the environment may decide whether some quarantined code is technically
        CAPABLE of activating that provider
```

⛔ **OpenAI remains lab-tier whether or not `OPENAI_API_KEY` exists.** Credential presence is not a
classification act, and a scanner or census must never be allowed to imply it is.

**And the two surfaces are not mechanically identical** — a distinction the census flattened:

```text
lib/voice/maiaVoiceService.ts   constructs its OpenAI client ONLY IF OPENAI_API_KEY exists
                                (module-level `if (process.env.OPENAI_API_KEY)`, then `if (!openai)`)
lib/tts/openaiTts.ts            does NOT conditionally gate on key presence. When invoked it lazily
                                constructs a client with whatever the env contains; absence is left
                                to initialization / SDK failure.
```

### F-PG1 · runtime provider activation is partly environment-dependent

```text
PROVEN        some quarantined OpenAI paths consult OPENAI_API_KEY directly rather than a
              provider-governance decision at the act boundary
UNOBSERVED    whether OPENAI_API_KEY exists in production
NOT CLAIMED   that credential presence changes OpenAI's authorized tier
```

⛔ **A read of production secrets or environment is a SEPARATE DEPLOYMENT-CUSTODY ACT**, not an
extension of this source census. It is not authorized here.

---

# Q2 — `app/api/_backend/**` · **CLOSED at source-classification level**

> **Neither "known-live" nor "unreachable legacy."** A stronger answer is available from source than
> either label allows.

```text
app/api/oracle/memory/route.ts

SOURCE STATUS       PRODUCTION-ADDRESSABLE     a real Next route exporting GET and POST
IMPORT STATUS       _backend REACHABLE          it directly imports several _backend modules
TRAFFIC STATUS      ⛔ UNOBSERVED
KNOWN-LIVE          ⛔ NOT PROVEN
DEAD / LEGACY       ⛔ NOT PROVEN
```

⭐ **The 60-file figure is NOT discarded — it is labelled correctly:** *60 `_backend` files are
structurally production-reachable through a production-addressable Next route. Runtime execution and
traffic are unobserved.*

**Why the fan-out is not merely a dumb unused-import artifact.** The route imports
`personalOracleAgent`; that binding is unused *in the route*, but its module exports a **top-level
singleton `new PersonalOracleAgent()`**, whose constructor creates an `AgentRegistry`, and the
registry module imports the elemental agents. ⭐ **There is genuinely a load-time module chain in
source.** Whether Next's production bundler eliminates part of it is a **different build/runtime
witness** — not grounds for calling it unreachable now.

### Policy debt named, ⛔ NOT repaired here

```text
scripts/provider-policy.json · openai_removal.legacy_backend.description

OLD         "app/api/_backend/** — unreachable legacy Express backend, pending wholesale deletion."
SUPPORTED   legacy backend tree · much of it may be obsolete, but portions are imported by current
            Next production routes; runtime use is not established by this classification
```

⛔ **The machine-readable policy is NOT edited in this act.** The correction does not require deciding
whether the route is actively used, and it is recorded as debt so a future governance act can make it.

---

# Q3 — reachability invariant · ⭐ **RATIFIED**

> ### Provider Debt Reachability Invariant
> **Quarantined provider debt may lose reachability. It may not gain new reachability from a more
> privileged runtime surface without an explicit provider-governance act.**

The census proved the structural hole directly: a dormant allowlisted debt surface can become
production-reachable while the source-pattern guard stays green (probe 0 hits · control 1 hit).

### ⛔ Not "production root yes/no" — the invariant is about PRIVILEGE MOVEMENT

The census called **every** Next route/page/layout a production root. That puts the **admin Voice Lab**
route and an ordinary member-facing route in one category, while Provider Governance permits OpenAI
**only inside explicit gated lab evaluation.** So the enforcement model needs one specification step
first: **root classes.**

```text
MEMBER / ORDINARY PRODUCTION
ADMIN PRODUCTION
EXPLICIT LAB-GATED
LEGACY / NONPRODUCTION
TEST
```

Freeze each debt surface's current reachable-root set and class. The **monotonic law**:

```text
WITHOUT AN EXPLICIT PROVIDER-GOVERNANCE ACT

ALLOWED     the reachable-root set shrinks
            a privileged class disappears
            the debt file disappears

REFUSED     DORMANT            → reachable
            LAB-GATED          → ordinary production
            one ordinary production door → additional production doors
            legacy-only        → production
```

⭐ This catches the `maia-router.ts` probe **without** falsely treating an explicitly governed Voice
Lab as equivalent to a normal member route — which a flat reachable/unreachable rule would have done.

### Pre-declared probe/control set for the eventual witness

```text
PROBE     dormant quarantined module + new ORDINARY-PRODUCTION importer   → MUST FAIL
CONTROL   same tree, no widening                                          → PASS
SHRINK    remove an existing importer                                     → PASS
LAB       existing explicitly lab-gated reachability                      → stays correctly
                                                                            classified, NOT silently
                                                                            promoted to ordinary
NEGATIVE  merely mentioning or importing a production-APPROVED provider
          (e.g. Anthropic)                                                → MUST NOT TRIP
```

⭐ The negative control is the one that keeps the invariant honest: **it must govern quarantine, not
the word "provider."**

---

## Standing

```text
PROVIDER CENSUS             ✅ FILED · ce6b32f09
Q1                          ✅ CLOSED — policy authors the class; production credential state UNOBSERVED
Q2                          ✅ CLOSED at source-classification level; traffic UNOBSERVED;
                               the blanket "unreachable legacy backend" description is STALE (debt)
Q3                          ⭐ RATIFIED — reachability invariant, privilege-movement shaped

ROOT-CLASS SPEC             ⭐ AUTHORIZED
READ-ONLY WITNESS           ⭐ AUTHORIZED

⛔ NOT AUTHORIZED IN THIS ACT
   provider-policy.json edit · check:no-openai modification · new reachability CI guard
   OPENAI_API_KEY / production secret read · OpenAI debt deletion · route deletion
   any claim that oracle/memory receives production traffic
   any reclassification of OpenAI out of lab tier
```

**Next provider artifact:** a small **reachability-invariant specification + predeclared witness** —
⛔ **not code enforcement.**
