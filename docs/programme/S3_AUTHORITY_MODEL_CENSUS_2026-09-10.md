# S3 remediation · authority-model census

```text
SUBJECT     canonical feddbaded
MODE        READ-ONLY · no repair · no tests authored · no fixtures built
QUESTION    What does the system actually recognize as valid, fresh, correctly
            scoped disclosure authority before authored characters may load?
```

⭐ Reported in two registers throughout: **what the architecture intends**, and
**what executable code enforces**. Where they differ, the executable truth governs.

---

## Q1 · THE AUTHORITY OBJECT

```text
INTENT      a permission to disclose prose
EXECUTABLE  BoundaryOutcome { kind: 'may_cross', disclosureId, receiptId }
            lib/disclosure/disclosureBoundary.ts
```

⭐⭐ **It is an in-memory, per-request value. It is never persisted, never
returned to a client, and never reconstructed.** It exists as a local binding
inside one call and dies with that call stack. `permitsCognition` and
`mayCrossBoundary` are the only readers.

---

## Q2 · CREATION

`establishDisclosureBoundary(...)`. Two preconditions, in this order, both
fail-closed:

```text
1  requireConsentState(...)   → must be established, else consent_unavailable
                                ⛔ returns BEFORE any context is assembled
2  mintDisclosureAttempt(...) → must return `minted`, else receipt_refused
```

The `requestId` supplied by the caller becomes **both** the consent row's id and
the receipt's `request_ref` — one value carried across the boundary, never
regenerated downstream.

---

## Q3 · VALIDITY

```text
mayCross = (o: MintOutcome) => o.kind === 'minted'
```

`minted` is the only authorizing outcome. Everything else refuses:

```text
existing { attempted | crossed }   ⛔ does NOT authorize
identity_mismatch                  ⛔ the id describes a DIFFERENT disclosure
unavailable                        ⛔ substrate down — fail closed
```

⭐ **Validity is enforced at the type level, not only at runtime.**
`receipt_refused` carries `Exclude<MintOutcome, { kind: 'minted' }>`, so a
refusal that also carried a mint is *unrepresentable*. A consumer cannot be
written that handles the impossible case.

---

## Q4 · FRESHNESS

```text
INTENT      "fresh authority"
EXECUTABLE  no TTL · no expires_at · no age-based pruning · no pg_cron
            (deliberate — asserted by contextDisclosureReceipt.test.ts:234)
```

⭐⭐ **Freshness is ACT-BASED AND STRUCTURAL, not time-based.** Authority is
fresh because it was minted moments ago in this request, and it cannot become
stale because it has no lifetime to spend. There is nothing to expire.

⚠️ **This partially engages a hard-stop condition** — *"freshness has no
executable representation."* Reported rather than resolved: freshness is
**structurally guaranteed** rather than **represented and checked**. Those are
not the same thing, and which one the remediation needs is a ruling, not a
finding. The distinction matters because a future consumer that *holds* an
authority across an await, a queue, or a retry would inherit no protection from
a model that assumed it never could.

---

## Q5 · SUBJECT BINDING

```text
member       memberId
Work         sourceRef
section      sectionRef  — admitted ONLY when the section IS the disclosed thing
request      requestRef  — the serving-request id, never a conversation turn id
crossing     ⭐ the SAME `req` object drives both the authority and the load
```

---

## Q6 · SCOPE

```text
DisclosureScopeKind = 'whole_work' | 'section' | 'passage'
```

⚠️ **`range` IS NOT PART OF THE AUTHORITY.** It is passed to `assemble` and never
to the boundary. This is deliberate: offsets are a locator, and the receipt's
refusal surface bans `startOffset | endOffset | range | length | wordCount |
geometry` at compile time — *provenance may be rendered into prose; it may never
be recovered from prose.*

⭐ **Consequence, stated plainly: passage authority is SECTION-GRANULAR.** An
authority minted for a passage in section S authorizes *any* range within S,
because the authority does not know which range was asked for.

⚠️ **This partially engages a hard-stop condition** — *"scope cannot distinguish
passage from section."* Precisely: `scopeKind` **does** distinguish them, and the
receipt records which occurred. What the authority does not do is **bind the
passage's extent**. This is a designed trade (locator withheld > extent bound),
not an oversight — but F5's "authority covers a different passage" is therefore
a state the model cannot express, and no fixture can be built for it.

---

## Q7 · CONSUMPTION

⭐⭐ **There is no separate "does this authority permit this load" check — and
none is needed, because there is no interval in which they could diverge.**

```text
boundary = establishDisclosureBoundary({ sourceRef: req.workRef,
                                         scopeKind: req.scopeKind,
                                         sectionRef: req.sectionRef })
if (!mayCrossBoundary(boundary)) return refusal        ⛔ nothing loads
focusContext = await deps.assemble({ workRef: req.workRef,
                                     scopeKind: req.scopeKind,
                                     sectionRef: req.sectionRef,
                                     range: req.range })
```

Scope-matching is **structural, not verified**: the same request fields build
both. The authority cannot be for a different Work because it was minted from
the object that is about to be read.

---

## Q8 · RECEIPT SEPARATION

```text
RECEIPT    durable row · context_disclosure_receipts · attempted → crossed
AUTHORITY  ephemeral value · BoundaryOutcome · never stored
```

⭐ **Nothing reads a receipt back as authority.** The only SELECT against the
table in application code is `unresolvedCrossings()` — a read-only governance
anomaly counter for crossings begun and never confirmed.

And the type refuses it directly: `existing { crossed }` is a documented
non-authorizing outcome. *A genuine retry mints a NEW disclosure_id.*

⛔ Hard-stop condition **"receipt and authority are the same durable object"** —
**NOT TRIGGERED.** They are cleanly separated.

---

## Q9 · F5 — WHICH INSUFFICIENT STATES ARE REPRESENTABLE

⭐ The instruction was to determine whether the canonical model can *naturally
produce* each state, not to invent fixtures. Several cannot be produced at all —
which is a finding about the model, not a gap in the test plan.

```text
AUTHORITY STATE              REPRESENTABLE?      CURRENT EFFECT
valid + fresh + right scope  YES                 mayCross → crossing proceeds
stale                        NO                  no lifetime; nothing to expire
wrong Work                   NO (Focus path)     same req builds authority + load
wrong passage                NO                  authority is section-granular;
                                                 extent is not bound (Q6)
structure-only               NO                  scopeKind has no structural
                                                 member; structure evidence never
                                                 calls the boundary at all
malformed                    YES                 identity_mismatch → refuses
                                                 unavailable       → refuses
completed receipt only       YES                 existing{crossed} → REFUSES,
                                                 explicitly and by type
```

⭐⭐ **The material consequence for the remediation:** four of the seven states
are *unrepresentable in the canonical model*. F5 therefore cannot be tested by
presenting a defective authority to the Focus path — there is no way to
construct one. **F5's real content on the S3 path is the absence of any authority
call whatsoever**, not a degraded one.

⛔ Do not manufacture a fixture for an unrepresentable state. A test that
constructs an authority shape the system cannot produce asserts a law about a
thing that does not exist — the same failure as a tautology, one layer earlier.

---

## Q10 · THE LOAD SEAM

```text
FOCUS PATH   already correct
             if (!mayCrossBoundary(boundary)) return   ← precedes assemble
             assembleFocus header: "CALLED ONLY AFTER may_cross"

S3 PATH      the seam does not exist
             loadRevisionContent runs at ask/route.ts:415 with only
             identity + ownership above it
```

---

## Hard-stop conditions — adjudicated

```text
no canonical authority object exists              NOT TRIGGERED
multiple competing prose-authority mechanisms     NOT TRIGGERED — see below
receipt and authority same durable object         NOT TRIGGERED
scope cannot distinguish passage from section     ⚠️ PARTIAL — Q6 → STOP REMAINS
freshness has no executable representation        ⚠️ PARTIAL — Q4 → STOP RELEASED
authority checked only after prose loaded         NOT TRIGGERED in Focus
                                                  ⛔ NEVER CHECKED in the S3 path
```

⭐ **On "multiple competing mechanisms":** there is ONE governed mechanism and
ONE ungoverned path. That is not two competing authority models — it is one
model and one absence. The distinction matters: the repair subordinates a path
that has no authority, rather than reconciling two that disagree.

⚠️ **The two PARTIAL conditions are reported, not designed around**, per the
stop instruction. Neither is a defect in the canonical model; both are places
where the model's guarantee is *structural* rather than *represented*, and the
remediation may need one of them made explicit.

⭐ **Both were ruled on by the founder the same day — see the next section.** Q4
is settled (structural freshness accepted; no artefact to be invented). Q6
remains a hard stop and its reason is sharpened there: the defect is not a
missing field on the authority object but a missing *participant* in the
authority decision.

---

## Founder rulings on the two PARTIAL stops — 2026-09-10

```text
Q4   STRUCTURAL FRESHNESS ACCEPTED.
     No durable freshness artefact required while authority is
     non-portable and invocation-bound.

Q6   HARD STOP REMAINS.
     Passage authority must distinguish the actual passage authorized.
     Representation not yet selected.
```

### Q4 — STOP RELEASED

Freshness is enforced structurally, not by expiry metadata:

```text
establish authority
      ↓
may_cross exists only inside this invocation
      ↓
load happens in this invocation
      ↓
authority disappears with the call
```

⛔ **Do NOT add `expires_at`, persistence, refresh logic, or a reusable
authority token merely to make freshness testable.** That would weaken the
design to satisfy a test.

**Ratified law:** *Fresh authority means authority established for the present
crossing and incapable of surviving that crossing as authority.*

⭐ **F5 is amended accordingly.** A "stale `may_cross`" object that production
cannot construct must NOT be fabricated for testing. F5 tests the structural
properties instead:

```text
F5-A  no prior receipt can reconstruct may_cross
F5-B  may_cross cannot be supplied by the caller
F5-C  may_cross cannot be loaded from persistence
F5-D  body loading is reachable only inside the invocation in which
      establishDisclosureBoundary returned may_cross
F5-E  failure/refusal from that invocation cannot fall through to load
```

⚠️ **Reopening condition:** if some future architecture makes authority portable
across a request/process boundary, freshness governance reopens at that moment.

### Q6 — STOP REMAINS, and the reason is sharpened

⛔ The defect is **not** that `BoundaryOutcome` lacks `range`. `BoundaryOutcome`
does not need to become a portable bag of authorization claims. The defect is
**earlier**: the thing that distinguishes this passage from another passage never
participates in establishing authority.

```text
passage request
     ↓
establishDisclosureBoundary(workRef, scopeKind='passage', sectionRef)
     ↓            ← the passage itself is absent here
may_cross
     ↓
req.range → assembler → slice
             ← the assembler knows the passage; the authority decision does not
```

⭐ **Proximity does not cure this.** That authority and assembly happen
microseconds apart from the same `req` protects against token substitution. It
does not establish that the member authorized *these particular authored
characters*.

**Prior ruling survives:** *passage authority may not silently become section
authority.* Therefore Q6 is NOT to be resolved by declaring that `passage` means
whatever the assembler happens to slice from the authorized section.

**Ratified invariants (representation NOT yet selected):**

```text
Two different passages in the same Work must not be indistinguishable to the
disclosure authority merely because both say scopeKind='passage'.

Authority for passage A must provide zero authority for authored characters
belonging only to passage B.
```

The shape indicated — not ruled — is a normalized disclosure scope carrying the
**exact subject of disclosure**, driving both `establishDisclosureBoundary` and
the authorized load. For a passage the exact subject may be a range, a stable
evidence locator, a digest-bound selector, or another representation already
native to the manuscript model. ⛔ **Not selected here.**

### F7 becomes behavioural

```text
F7-A  Given two distinct passages A and B in the same Work / structural
      context, authority established for A → A may cross · B may NOT cross.

F7-B  Changing the downstream passage selector after authority has been
      established cannot change what authored characters are permitted
      to cross.

F7-C  The evidence/receipt for a completed passage crossing must identify
      the crossing sufficiently to distinguish it from a different passage
      crossing, WITHOUT becoming reusable authority.
```

⭐ F7-C preserves **receipt ≠ authority**.

### Next authorized act — READ-ONLY LOAD-SCOPE CENSUS

One narrow question, surfaced indirectly by this census:

> When a passage is authorized, what authored characters does
> `loadRevisionContent` actually bring across the protected load boundary
> before `recoverEvidence` slices them?

If it loads the entire revision and the constitutional boundary is genuinely
*before authored characters are loaded*, there is a second scope problem:

```text
passage authority → whole revision loaded → passage later sliced
```

— passage-scoped at cognition, but not at the protected load boundary.

⛔ **Do not assume lawful or unlawful from function names.** Trace exactly what
`loadRevisionContent` returns and exactly which boundary is being protected.

---

## Standing

```text
AUTHORITY CENSUS         COMPLETE
Q4 FRESHNESS             SETTLED — invocation-bound freshness accepted
                         no TTL / token invention
Q6 PASSAGE               HARD STOP — nominal passage scope insufficient
                         exact passage binding required
NEXT ACT                 READ-ONLY LOAD-SCOPE CENSUS
S3 IMPLEMENTATION        NOT YET AUTHORIZED
F1–F7 TEST AUTHORING     NOT YET
FIXTURES                 NOT BUILT
A / C                    HELD
#1277 D9                 UNTOUCHED · DRAFT
FOCUS WITNESS            UNSPENT
PRODUCTION               UNTOUCHED
```

⭐ *The current Focus authority model is unusually strong in time, but
potentially too coarse in space. Preserve the first; resolve the second before
using it to repair S3.*
