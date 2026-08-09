# Cross-Episode Finding — Latent Capability / Default-Path Failure

**Status: PROVISIONAL OBSERVATION. n=3, one week, one domain, one investigator.**
**Deliberately NOT canon.** Filed inside the experiment folder to mark it as unpromoted.
Promotion criteria are stated at the bottom and are not yet met.

**Named by:** founder, 2026-08-09 · **Evidence:** three independent traces run 2026-08-09

---

## The observation

> The system possesses the capability, but the ordinary path does not cause the capability to be used.

A capability is not operationally real merely because (1) its implementation exists, (2) its
configuration is correct, (3) its documentation exists, and (4) a human knows how to invoke it. It
becomes part of the operating system only when **the architecture routes appropriate work through it
without depending on remembered operator discipline.**

Corollary, in the founder's formulation:

> **Defaults are part of the architecture.**
> **An optional path competing with an unrestricted default is not an operational capability; it is an invitation.**

## The three instances

| capability | architecturally | behaviorally | evidence |
|---|---|---|---|
| **Kimi delegation** | sound — a coherent division of labor, cost-modeled | inert. A *pasted session header*; 7 CLI sessions Jul 21–23, then dark. **0 of 97,313 Claude Code requests** non-Anthropic | [Kimi trace](../KIMI_INTEGRATION_HISTORICAL_TRACE_2026-08-09.md) |
| **`Read` → `ctx_execute_file`** | sound — the isolating tool exists and works (497 tok/call vs 3,169) | bypassed. Prose rule with a self-suspending carve-out. `ctx_execute_file` **84 calls** vs `Read` **3,625**; one Read = **167,063 tokens** | [routing audit §1](../CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md) |
| **local Claude Code lane** | sound — and *more* deterministic after the Feb-18 refactor | unused. Ollama log: **136 `/api/chat` vs 2 `/v1/messages`** — the endpoint Claude Code actually uses | [local lane trace](../LOCAL_LANE_DISABLEMENT_TRACE_2026-08-09.md) |

In none of the three was anything broken, removed, or badly designed. In all three, choosing the good
path stayed voluntary and effortful while the default path stayed free.

## The sharpest form of the finding — the project already knows the technique

This is the part that makes the pattern actionable rather than merely descriptive. AIN **already
enforces structurally**, reliably, in one domain:

| enforced control | mechanism | domain |
|---|---|---|
| deploy lane lock | kernel `flock`, refuses second deploy | ops |
| deploy provenance | `DEPLOY_LANE_TOKEN` build tripwire — bare compose **fails in under a second** | ops |
| no Supabase | `check:no-supabase` in the pre-commit hook | repo |
| typecheck no-regression | baseline comparison, fails on any new diagnostic | repo |
| curl / WebFetch interception | PreToolUse hook rewrites the call | dev harness |

Every one of those works. And the one enforced dev-harness control — the Bash hook — produced the
best-behaved high-volume tool in the system (**258 tok/call**), while its unenforced neighbour `Read`
produced the worst (**3,169**).

**So the technique is not missing. It is unevenly applied.** AIN enforces structurally where the
failure would be loud and immediate (a bad deploy, a broken build) and relies on memory where the
failure is quiet and cumulative (context burden, model routing, evidence isolation). Quiet failures
are exactly the ones that need structure most, because nothing surfaces them.

## Why this matters beyond token economics

A function can be lost without a line of code disappearing. It stays intact, correct, and documented —
and simply falls outside the lived path of the system. That is a harder loss to detect than deletion:
there is no diff, no missing file, no failing test. Every audit says the capability is present.

This reframes the recurring "we already built that" experience. In at least these three cases the
problem was never preservation or implementation. It was **activation, routing, enforcement, and
observability.**

## Limits — why this is not canon yet

1. **n=3, and the sample is selected.** All three came from investigations that *went looking for
   failed integrations*. Successful defaults were found only afterward, as counter-evidence. A
   deliberate survey of *all* AIN capabilities — hit and miss — has not been done.
2. **One domain.** Every instance is in the development harness. Whether the pattern holds for
   member-facing surfaces, canon adherence, or practitioner tooling is untested.
3. **One investigator, one day.** No independent confirmation.
4. **The prescription is unproven.** "Enforce structurally" is the obvious inference, but Week 1 is
   precisely the test of whether the alternative workflow *completes equivalent work*. If isolation
   turns out to cost more than it saves, enforcing it would be the wrong move. **The finding
   diagnoses; it does not yet prescribe.**
5. **Enforcement has its own failure modes** — a hard hook that fires mid-migration, or blocks a
   legitimate exception, is its own damage. The Week 1 charter's advisory-not-blocking posture exists
   for this reason and should not be abandoned on the strength of a pattern.

## Promotion criteria — what would make this canon

- Week 1 closes with evidence that the isolated workflow **completes equivalent work** (not merely
  fewer tokens), including rebound rates with R4/R5 separated.
- At least one instance found **outside the development harness**.
- One deliberate survey of capabilities that *are* reliably used, to test whether "enforced default"
  actually distinguishes them — rather than confirming a pattern we already believe.
- A worked example where structural enforcement was added and the capability's usage measurably
  changed, without a new failure mode appearing.

Until then this is a working hypothesis with unusually good evidence, held in the experiment folder
where hypotheses belong.

## Concepts arising — preserved, explicitly deferred (founder, 2026-08-09)

Recorded here only so they survive session compaction. **No work authorized from either during Week 1.**

⚠️ **The two are orthogonal, not nested — do not collapse them** (founder correction, 2026-08-09).
**Capability lifecycle** describes *operational participation*: where a capability stalls.
**Silent degradation** describes an *observability/failure class*: why the stall goes unnoticed.
A capability can stall loudly, and a system can degrade silently without any capability stalling.

**1. Silent degradation** — an observability/failure class:

> A failure mode in which every individual operation remains valid while the system progressively
> departs from its intended operating architecture.

Sharper than "lost capability," because nothing need be lost. The system stays fully functional while
becoming more expensive, less sovereign, less efficient, or less epistemically disciplined. It maps
directly onto the loud/quiet distinction above: AIN has strong immune responses to failures that break
immediately, and none to failures that accumulate.

**2. Capability lifecycle, not capability registry** — the possible downstream response:

```
implemented → available → reachable → selected → exercised → verified → sustained
```

A registry answers *does this exist?* A lifecycle answers *is this participating in the living
system?* All three instances in this document were `implemented`/`available` and stalled before
`selected`. Explicitly downstream — noted, not designed.

## Related, not yet connected

The eventual destination the founder sketched — *task classification → cheapest competent lane →
explicit escalation → cloud only when warranted* — is the structural form of this finding applied to
model routing. `maia-coder`'s Modelfile **already contains the escalation half of that contract**
("attempted the same fix twice and still failing → say 'This needs cloud-level reasoning' and stop").
What is missing is the classification and routing half. Deferred until after Week 1 by explicit
decision — adding an inference lane mid-experiment would contaminate the measurement.
