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
scope cannot distinguish passage from section     ⚠️ PARTIAL — Q6
freshness has no executable representation        ⚠️ PARTIAL — Q4
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

---

## Standing

```text
AUTHORITY MODEL          CENSUSED
FIXTURES                 NOT BUILT — four states are unrepresentable
TESTS                    NOT AUTHORED
REPAIR                   NOT IMPLEMENTED
TWO PARTIAL STOPS        reported for ruling (Q4 freshness · Q6 passage extent)
A / C                    HELD
FOCUS WITNESS            UNSPENT
PRODUCTION               UNTOUCHED
```
