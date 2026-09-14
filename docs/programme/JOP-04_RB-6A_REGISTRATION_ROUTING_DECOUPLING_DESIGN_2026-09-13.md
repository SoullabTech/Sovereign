# JOP-04 · RB-6A — Registration → Routing Decoupling Design

**Authorized:** 2026-09-13 (founder act) · **Mode:** ⛔ **DESIGN ONLY — NO CODE**
**Judge:** instrument `0b9aaec4`, calibrated 8/8 against subject `e1c6f527`

⛔ No `route()` change · no IPC change · no effect vocabulary · no execution-authority object.

> ⭐ **A repair no longer gets to define its own success. The judge recognized the defect before
> seeing the cure.**

---

## 0 · Repair sequence — frozen

```text
RB-6A   break registration → routing grant     ← THIS ACT (design only)
          witness
RB-6B   break routing → execution grant
          witness
then    full RB acceptance
```

⭐ Repairing both at once would make it impossible to know **which boundary produced the
improvement.**

## 1 · The exact current grant chain

```text
task { capability: 'git.rev_parse' }
   │
   │  router.mjs:33
   │  if (task.capability && Object.prototype.hasOwnProperty.call(CAPABILITIES, task.capability))
   ▼
{ execution_lane: 'C0', reason: "Deterministic capability '…' is registered; no model required." }
   │
   │  main.js:748   if (decision.execution_lane === 'C0')
   ▼
runCapability(task.capability, task.args || {}, currentRoot())        main.js:751
```

**Behaviorally witnessed** (calibration run 1, RB-F2): two otherwise identical tasks differ **only**
in registry membership → `C0` vs `C3`. **Membership is the sole causal differentiator.**

⭐ The subject names its own coupling in its reason string. The grant is not hidden; it is stated.

## 2 · The unresolved design question — and the testable form it must take

> **What fact, distinct from registry membership, is sufficient for routing *consideration*?**
> Not execution. Not authorization. Not confirmation. **Only routing consideration.**

⭐ **Restated as a property the instrument can falsify**, which is what makes it a design constraint
rather than a preference:

> **A registered-but-NOT-routable state must be REPRESENTABLE and REACHABLE.**

**Why this is the crux.** If every registered capability necessarily carries whatever the new fact
is, then `registered ⟺ has-the-fact ⟺ routable`, and the coupling has survived under a new name —
the founder's `isEligible()` anti-pattern, which RB-F2 must still condemn.

```text
⛔ NOT A REPAIR                              ✅ A REPAIR
function isEligible(name) {                 a registered capability exists for which
  return hasOwnProperty(CAPABILITIES, name) routing consideration is legitimately
}                                           withheld — and it does not route
```

**The discriminating test:** *can a capability be registered and not routable?* If no, RB-F2 stays
RED however the predicate is spelled.

## 3 · Candidate designs

### A · Pre-adjudicated routing eligibility

```text
registration → separate admission/adjudication → routing eligibility → route(…)
```

**Precedent is real and stronger than assumed.** `lib/maia/canonical-turn/adjudicate.ts:35` —
`adjudicateParticipation(input): Participation` consumes `candidates` **plus** `identity`,
`encounter`, `sovereignty`: facts **not derivable from the registry**. ⭐ And `:39-41` already
carries RB-F8's shape — *"an unregistered producer refuses the whole turn, never degrades."*

- ✅ Registered-but-not-routable is **naturally representable** (adjudication not performed, or refused).
- ⚠️ Introduces an adjudication object and its lifecycle.

### B · Capability descriptor + independent policy

```text
registered capability description + routing policy + task facts → placement
```

- ✅ Smaller.
- 🔴 **Fails unless the descriptor is not registry-intrinsic.** If the descriptor lives in the
  registry entry, membership implies descriptor implies placement and §2's coupling returns.
- Survivable **only** if the policy can withhold every placement for a given descriptor — i.e. only
  if it reproduces §2's property anyway.

### C · Router returns a placement candidate, not an executable lane

```text
route(…) → placement candidate
```

🔴 **REJECTED FOR RB-6A — and not because it is wrong.**

⭐ **C does not defeat RB-F2.** RB-F2 forbids membership conferring *"C0 **or equivalent execution
eligibility**."* If `route()` returns `placement_candidate: 'C0'` and `main.js` still executes on it,
the grant is intact and merely renamed. C only bites when something **downstream must separately
constitute execution** — which is exactly **RB-6B**.

> **C is RB-6B's repair wearing RB-6A's clothes.** Selecting it here would collapse the two-defect
> split the sequence was frozen to preserve, and would make it impossible to attribute the
> improvement. ⛔ Deferred to RB-6B, not discarded.

## 4 · Selected minimal design

> **ROUTING MUST CONSUME A FACT IT CANNOT DERIVE FROM THE REGISTRY.**
> Absent that fact, no executable placement is produced.

**A-shaped property at B-shaped cost.** The eligibility fact is an **input to routing**, not a
function of the capability name. Whether it is an adjudication record (A), a policy artifact (B), or
a supplied parameter is **implementation, not this design** — RB-3's freeze explicitly withholds the
signature (*"route()'s present information is insufficient" is frozen; "requires this exact
parameter/type" is not*).

**What the design DOES fix:**

| | |
|---|---|
| Binding property | routing consumes a non-derivable eligibility fact |
| Falsifiable consequence | **registered ∧ ¬routable** is representable and reachable |
| Preserved | `unregistered ⇒ never executable` (§7) |
| Untouched | `CAPABILITIES` contents · `runCapability` · IPC · execution |

⛔ **`C0` is not abolished.** It may remain a legitimate placement class. What must disappear is
`registered ∴ executable C0`.

## 5 · Interfaces affected — named, not implemented

| Interface | Effect of RB-6A | ⛔ Not decided here |
|---|---|---|
| `route(task)` | must consume an eligibility fact it does not have today | parameter, type, or name |
| `router.mjs:33` predicate | ceases to be sufficient; may remain **necessary** | replacement expression |
| eligibility producer | must exist and be **separate from the registry** | adjudication vs policy vs parameter |
| `CAPABILITIES` | ⛔ **unchanged** — no effect metadata, no new fields | — |
| `main.js` C0 branch | ⛔ **unchanged** — that is RB-6B | — |

## 6 · ⭐ Predeclared post-repair verdict matrix — FROZEN BEFORE CODE

| Falsifier | At `e1c6f527` | Predicted after RB-6A | Reasoning |
|---|---|---|---|
| **RB-F1** | RED | ⭐ **GREEN** | with no eligibility fact supplied, registration alone yields no placement and therefore no execution |
| **RB-F2** | RED | ✅ **GREEN** | the target |
| **RB-F3** | RED | **RED** | supply a valid placement, withhold authority → still executes. RB-6B's defect |
| **RB-F4** | RED | **RED** | no effect contract introduced (§8) |
| **RB-F5** | UNINSTANTIATED | **UNINSTANTIATED** | repaired request shape still absent |
| **RB-F6** | RED | **RED** | varying only routing output still decides whether the act occurs |
| **RB-F7** | N/A | **N/A** | no re-expression |
| **RB-F8** | GREEN | 🟢 **GREEN** | must not weaken (§7) |

⚠️ **RB-F1 is the prediction most likely to be wrong, and it is flagged deliberately.** At the
baseline F1 and F3 overlap — there is only one gap, so both observe the same execution. After RB-6A
they **separate**, and F1's verdict depends on whether its specimen supplies the eligibility fact.
The frozen prediction is **GREEN with nothing supplied**.

⛔ **If implementation moves any verdict other than RB-F1 and RB-F2, that is a FINDING.** It may be a
welcome finding. **It may not be silently absorbed into the repair story.** Same discipline as
calibration and mutation testing: `STOP → show the contradiction → ruling → re-freeze → resume`.

⛔ **Do not demand 8/8 GREEN after RB-6A.** Two GREENs and one preserved GREEN is legitimate
incremental progress.

## 7 · Proof that RB-F8 cannot be weakened

**RB-6A adds a necessary condition to routing. It removes none.**

```text
BEFORE   registered                      → executable placement
AFTER    registered ∧ eligibility-fact   → executable placement
```

An unregistered name fails the **first** conjunct, exactly as it does today — witnessed at
calibration: `lane C3` (not `C0`) **and** the seam refuses (`Unknown capability: …`). ⭐ **Adding a
second required condition cannot create a path for a name that already fails the first.**

⛔ **The one way RB-6A could weaken RB-F8, named so it can be refused:** introducing a *generic* or
*fallback* capability as the carrier of the eligibility fact — an entry that accepts a name it does
not itself register. That is precisely the *"generic command path introduced during repair"* RB-F8's
frozen meaning forbids. **The eligibility fact must never be a capability.**

## 8 · ⛔ The effect system is NOT forced into RB-6A

**RB-F4 stays RED, and that is correct.** Defeating the registration grant does not require
classifying effects. ⛔ **Do not introduce a half-reconstructed effect vocabulary to make this repair
possible.**

**Standing governance debt, unchanged:**

```text
Effect Substrate Specification   UNFILED · NOT INHERITABLE AS AN INDEPENDENT SOURCE
```

F12's requirement is safe **only** because RB-F7 carries it inline. ⛔ **Before implementing
RB-F4 / effect-contract admission, the effect-substrate source must be filed or freshly ratified.**
⭐ At that point it stops being documentary hygiene and becomes **executable governance** — a test
would be enforcing a rule whose source no one can open.

## 9 · Instrument implications

```text
SUBJECT SHA      e1c6f527    calibrated known-bad substrate
INSTRUMENT SHA   0b9aaec4    trusted judge
REPAIR SHA       <future>    candidate substrate under judgment
```

⛔ **The instrument is never rebuilt from the repair branch in a way that lets the repair alter its
judge.** If RB-6A creates a legitimate new interface the harness must address — supplying or
withholding the eligibility fact in RB-F1/RB-F2 specimens — that is an **instrument amendment with
its own SHA and justification**, ⛔ never an incidental part of the substrate patch.

**Anticipated amendment (not authorized here):** RB-F2's post-repair specimen must construct the
**registered ∧ ¬routable** case of §2 — a state that does not exist today and therefore cannot be
expressed by the current harness.

⭐ **The IPC gap does not block RB-6A.** RB-F2 is behaviorally visible without an Electron host, as
calibration proved. *"We cannot yet execute the complete IPC witness"* and *"therefore we cannot
repair `router.mjs:33`"* are different evidentiary questions.

⛔ **Before RB-6B goes GREEN, the host-run Layer B witness is MANDATORY** — otherwise we would claim
to have defeated the actual execution path without ever exercising it.

## 10 · Deferred to RB-6B

- the `C0 → execution` grant in `main.js:748-751`
- any execution decision, `ExecutionPermit`, or constituted invocation authority
- candidate design **C** (placement candidate + downstream constitution)
- RB-F3 and RB-F6 discharge — **both require the host-run Layer B witness**
- RB-F5 instantiation — waits on the repaired request shape
- RB-F4 / effect contract — waits on §8's filing
- RB-F7 / re-expression — waits on the new registration model
- invocation canonicality (C2-Q12) — ⛔ must not be solved incidentally

---

```text
RB-6A DESIGN            COMPLETE
SELECTED                routing consumes a non-derivable eligibility fact
FALSIFIABLE FORM        registered ∧ ¬routable must be reachable
CANDIDATE C             DEFERRED TO RB-6B (it is that repair, renamed)
POST-REPAIR MATRIX      FROZEN — only RB-F1 and RB-F2 may move
RB-F8                   PROOF OF NON-WEAKENING RECORDED
EFFECT SYSTEM           EXCLUDED · SPEC STILL UNFILED
INSTRUMENT              AMENDMENT ANTICIPATED · SEPARATE SHA REQUIRED

NO CODE · NO ROUTER CHANGE · NO IPC CHANGE · RB-6 EMBARGO ACTIVE
```

> **STOP.**
