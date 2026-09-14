# JOP-04 · RB-6B-CI — Canonical Invocation Identity · Design

**Authorized:** 2026-09-14 · **Mode:** ⛔ **DESIGN ONLY — NO CODE**
⛔ No permit · no execution decision · no confirmation UI · no RB-6B repair.

> **What precisely would a future execution decision be binding itself to?**

---

## 0 · Laws frozen before this design

### L1 — Standing state cannot constitute an act

```text
scope   IS        lane        IS        session   IS
permission IS     identity    IS

execution decision   HAPPENED
```

> **A decision that can be recomputed from standing state was never a decision. It was another
> permission predicate.**

### L2 — The third accidental equivalence, ratified

```text
registered ⇔ routable      DEFEATED by RB-6A
routable   ⇔ executable    RB-6B DEFECT · real-IPC witnessed
authorized ⇔ executed      ⛔ FORBIDDEN FUTURE COLLAPSE
```

### L3 — `derivePermissionEnvelope()` is INELIGIBLE as the execution decision

It may establish that an invocation is **eligible to proceed toward** a decision. ⛔ **It cannot be
the event that makes it execute.**

### L4 — The canonical invocation law

> **The representation bound by execution authority must denote the same act the handler actually
> receives and performs.**

⛔ Not *"normalize a string then hash it."* The implementation must establish **either** that canonical
values are what the handler consumes, **or** an equally strong proof that the executed representation
is exactly bound to the canonical act. **Until then: `RB-6B IMPLEMENTATION — BLOCKED`, correctly.**

### L5 — The design reversal

⛔ **Do not invent a token and ask what makes it authoritative.** First establish **what authoritative
act happened**; then decide how the system carries proof of it.

> **The missing primitive is not a permit object. It is a decision event. The object — if one
> eventually exists — is merely evidence that the event occurred and what it was bound to.**

---

## 1 · Two identities, not one digest

```text
WHAT exact act is this?          →  ACT IDENTITY
WHICH occurrence of it is this?  →  OCCURRENCE IDENTITY
```

```text
canonical act identity  +  invocation occurrence identity  =  THIS EXACT INVOCATION
```

**Two opposite failures this prevents:**

```text
bind only occurrence  → arguments/target could be substituted
bind only act         → the decision could transfer to another occurrence
```

⚠️ **This is binding, not idempotency.** Distinguishing occurrences is a precondition for idempotency;
it is not idempotency, which is deferred.

**Census — can `newRunId()` serve the occurrence side unchanged?**
`jarvis-runtime-store.mjs:37` — `r-${randomBytes(5).toString('hex')}`, host-minted, unique per call.
✅ **Adequate as an occurrence identifier.** ⚠️ Two caveats: it is **freely mintable** (so it is an
identifier, never a grant — C1 already classified it *identity, not authority*), and it belongs to
the **work-unit lane's store**, which the executing lane never writes (host witness §5). ⛔ Reusing
the generator does **not** imply reusing that store.

## 2 · Canonicalization boundary

```text
CANONICALIZATION MUST BE HOST-SIDE.
⛔ The caller cannot supply the authoritative canonical digest.
```

⭐ Precedent already in the substrate: `main.js` passes `currentRoot()` as `cwd` — **C2 named it the
one place authority already outranks the request.** Canonicalization must sit on that side of the
boundary.

⛔ A caller-supplied digest is the RB-F5 counterfeit in a new costume: *"here is what I am asking for,
and here is its name"* is the requester naming its own act.

## 3 · Capability identity

Registry keys are matched by exact string (`hasOwnProperty`), and an unknown name throws. ✅ **No
alias mechanism exists — and none may be introduced by this work.**

> ⛔ **Unknown aliases must not silently become equivalent.** If aliasing is ever added, two names
> mapping to one capability must produce **one** act identity **explicitly**, never incidentally.

> ## ⭐ R0 · RECONCILED TO D4 — 2026-09-14
>
> This design was written **before D4 was ratified**. D4 rules: **omission belongs to the caller;
> default resolution belongs to the host.** Every claim below that treated a caller omission and an
> explicit host-default value as **one act** is **superseded in place** — struck, never erased, with
> the pre-D4 reading kept beneath it. ⛔ **This is a record consequence of D4, not a new semantic
> ruling**, and no product code changes with it.
>
> ```text
> H1 OLD            caller omission + explicit host-default value  → SAME canonical act
> H1 D4-RATIFIED    caller omission + explicit value               → DIFFERENT canonical invocation
>
>                   caller omission  → caller_terms preserve ABSENCE
>                                    → host resolves the effective value SEPARATELY
>                                    → host_terms retain source=host_default
> ```

## 4 · Argument identity — ⭐⭐ two hazards found in the registry

### H1 · Defaults are applied INSIDE handlers, invisible to the boundary

```js
'git.rev_parse'      const ref = args.ref || 'HEAD';
'git.show_stat'      const ref = args.ref || 'HEAD';
'git.branch_contains' const commit = args.commit || 'HEAD';
'repo.grep'          const max_results = args.max_results || 200;
'inventory.migrations' const dir = args.dir || 'database/migrations';
'inventory.routes'   const dir = args.dir || 'app';
```

`runCapability` forwards only the **supplied** keys. So:

~~```text
{}                and   { ref: 'HEAD' }
two different REQUESTS  ·  one ACT
```~~

⭐ **SUPERSEDED BY D4.** They are **two DIFFERENT canonical invocations that presently share one
effective execution.**

```text
{}                                        { ref: 'HEAD' }
caller_terms: ref = UNSPECIFIED           caller_terms: ref = 'HEAD'   (caller-authored)
host_terms:   ref = 'HEAD'
              source = host_default
→ DIFFERENT canonical invocations · SAME current effective execution ONLY
```

⛔ **The hazard H1 names is real and unchanged** — the default is applied *inside the handler* and is
therefore **an unrecorded host contribution**. ⭐ **What changed is the repair shape**: the defect is
that the host's contribution is **invisible and unattributed**, NOT that two spellings need collapsing
into one identity. *Collapsing them is now itself a defect (D3-F7 · D3.2).*

> 🔴 **A digest over `validatedArgs` would bind `{}` while the handler performs `HEAD`.** That is
> deliverable 9's failure, already present at this SHA.

### H2 · `git.log` DECLARES `format` and never uses it

The schema accepts `format`; the handler hardcodes `--pretty=format:"%H %an %ad %s"` and **never
~~reads `args.format`.**~~ ⭐ **SUPERSEDED BY D2 (RATIFIED 2026-09-14 · A · SCHEMA WRONG).** `format`
is **not an authorized caller term**, so `{format:'a'}` and `{format:'b'}` are **NOT an equivalence
pair — they are two INADMISSIBLE requests**, each carrying an undeclared argument. ⛔ A canonicalizer
must **refuse** such an invocation, never normalize or silently erase the field: *accept + ignore*
would preserve the exact false affordance D2 closes (D2.6 · D2-F6). The original wording is kept
below as the hazard as it was understood before the ruling.
Pre-D2 reading: the handler hardcodes `--pretty=format:"%H %an %ad %s"` and never
reads `args.format`, so `{format:'a'}` and `{format:'b'}` were read as **different requests denoting one
act**.

- Binding it **over-distinguishes** — a decision for one would not cover the other though the act is
  identical.
- Ignoring it requires **knowing the handler ignores it**.

### ⭐⭐ The finding H1 and H2 jointly establish

> **Canonical act identity cannot be derived from the declared argument schema alone. It depends on
> what the handler actually consumes.**

**Consequences for the design:**

- **Syntactic normalization** (key order, absent vs explicit-default, value spelling) is mechanical.
- **Semantic equivalence** (which declared arguments actually participate in the act) is a **property
  of each capability**, not of the schema — and today it is **undocumented**.
- ⛔ Therefore canonicalization requires a **per-capability declaration of participating arguments**,
  or a proof that every declared argument participates. **Neither exists.**

⚠️ **Do not solve this by hashing everything declared.** That is safe against substitution and wrong
about equivalence — and quietly re-creates H2 as a *feature*.

## 5 · Path / resource identity — the C2 split, confronted

```text
containment check   uses  resolve(cwd, value)        the RESOLVED form
handler             receives  value                  the UNRESOLVED spelling
```

> 🔴 **A digest over today's request would be epistemically false.** Authority binding `/foo/bar` while
> execution consumes `/foo/x/../bar` has **authorized one representation and executed another** — even
> where they resolve identically *this time*.

**Also unresolved and material:**

- **Prefix containment.** `fullPath.startsWith(cwd)` — a sibling sharing a prefix passes. ⛔ A future
  scope binding must not inherit prefix matching.
- **Symlink / realpath.** ⛔ Not currently consulted. If `realpath` semantics matter for identity —
  two spellings resolving through a link to one file — that must be **decided explicitly**, not
  inherited from whatever `resolve()` happens to do.
- **The guarded branch.** Containment is only checked when the value starts with `/` or contains
  `../`. A relative path takes no check at all.

⛔ **None of this may be hidden behind hashing.**

## 6 · Scope binding

The bound target (`currentRoot()`, and a Work/repository scope where applicable) must be **part of
act identity**.

> ⛔ **A decision must not be transferable to a different bound target.** The same capability and
> arguments against a different repository is a **different act**, not the same act elsewhere.

## 7 · Versioning — the canonicalization rules need their own identity

> ⛔ **A future rule change must not make an old decision silently mean something new.**

⭐ Without a rule version, fixing H1 ~~(folding defaults into canonical form)~~ — ⛔ **that repair
shape is SUPERSEDED BY D4; see §4. The ratified shape is *canonicalize only what the caller supplied,
and resolve omissions into a separately-authored execution plan*** — would **silently change
the meaning of every previously bound act identity**. Any bound identity must therefore carry the
version of the rules that produced it, and a decision produced under one version must not be honoured
under another without an explicit ruling.

## 8 · Equivalence corpus — frozen before implementation

```text
same act, different spelling       → SAME act identity
different argument                 → DIFFERENT
different capability               → DIFFERENT
different bound root               → DIFFERENT
same act, second occurrence        → SAME act / DIFFERENT occurrence
```

**Concrete pairs from §4–§5, to be frozen with the corpus:**

```text
git.rev_parse {}          vs  git.rev_parse { ref: 'HEAD' }      ⛔ SUPERSEDED BY D4 —
                                                                 DIFFERENT canonical invocations,
                                                                 SAME current effective execution
git.log { format: 'a' }   vs  git.log { format: 'b' }            ⛔ SUPERSEDED BY D2 —
                                                                 both INADMISSIBLE, not an
                                                                 equivalence pair; refuse, do
                                                                 not normalize (D2.6 · D2-F6)
verify.file_exists './a/../b'  vs  verify.file_exists 'b'        → SAME act      (§5)
repo.grep { max_results: 200 } vs repo.grep {}                    ⛔ SUPERSEDED BY D4 + D3.2 —
                                                                 DIFFERENT canonical invocations;
                                                                 200 is source=host_default in the
                                                                 second and caller-authored in the
                                                                 first (D3-F7)
git.rev_parse { ref: 'HEAD' }  vs  git.rev_parse { ref: 'HEAD~1' } → DIFFERENT
same act in root A        vs  same act in root B                 → DIFFERENT     (§6)
```

⚠️ Each pair is a **claim about handler behaviour** and must be verified against the handler, not the
schema.

## 9 · Execution-equivalence requirement

> **Prove the handler performs the act that was bound.**
> ⛔ **A canonical digest over values the handler never uses is insufficient** — and, per H1, a digest
> over values the handler *replaces* is worse: it is false.

The eventual implementation must establish one of:

```text
(a) the canonical values ARE what the handler consumes
(b) an equally strong proof that the executed representation is exactly bound to the canonical act
```

~~⭐ **(a) is the stronger and probably the smaller repair**: canonicalize before dispatch and let the
handler receive the canonical values — which incidentally repairs H1 and the §5 split at the same
point.~~ ⛔ **Not selected here.**

> ⭐ **SUPERSEDED BY D4.** *"Canonicalize before dispatch and let the handler receive the canonical
> values"* is the **pre-D4 repair shape**: it repairs H1 by folding the host's default into the
> caller's canonical terms, which is exactly what D4 forbids. The ratified shape is:
>
> ```text
> canonicalize ONLY what the caller supplied
>   +
> resolve omissions into a SEPARATELY-AUTHORED execution plan
> ```
>
> ⛔ **If an inner execution-operation representation later treats the two effective operations alike,
> that representation MAY NOT be the sole identity bound by authority** — the exact invocation must
> still preserve caller-versus-host authorship. The §5 path-normalization question is untouched by
> this correction and remains as written.

## 10 · Transferability falsifier

> **A decision for invocation A cannot become valid for occurrence B merely because their canonical
> act identities match.**

⭐ This is the falsifier that makes §1's two-identity split testable rather than decorative: two
genuinely identical requests must consume **two** decisions.

---

## 11 · ⛔ The decision's author is NOT ruled here

D1 is `ABSENT` — no confirmation-of-an-act path exists anywhere. ⛔ **That does not prove a person
must perform the decision.** Candidate classes remain open:

```text
explicit human act · trusted host dispatcher act
trusted policy/adjudication act · other independently authorized actor
```

**What matters is not whether it is human. It must satisfy all six:**

```text
EVENTFUL          something happened
HOST-TRUSTED      not caller-carried authority
INVOCATION-BOUND  this occurrence + this act
ROUTE-INDEPENDENT the same valid route can exist without it
WITHHOLDABLE      the host can choose not to constitute it
NON-REDERIVABLE   cannot be reconstructed from standing permission state
```

⭐ **Choosing "human" now would be designing the authority source before we know what the invocation
is.** If the design later concludes only a human gesture satisfies the governance obligation, **then**
D1 becomes a real prerequisite and confirmation is built from zero.

## 12 · The lifecycle this clarifies

```text
REQUEST OCCURRED
    ↓  canonical invocation established      ← RB-6B-CI (this act, design only)
    ↓  route established                     ← RB-6A, CLOSED at host boundary
    ↓  authority requirements resolved
    ↓  ⛔ STILL NOT EXECUTABLE
    ↓  EXECUTION DECISION OCCURRED           ← RB-6B
    ↓  attempt
       → tool report → observation → receipt ← separate lane (RECEIPT: ABSENT here)
```

---

```text
TWO IDENTITIES        act ≠ occurrence · newRunId adequate for occurrence only
CANONICALIZATION      HOST-SIDE · caller may not name its own act
HAZARD H1             handler-applied defaults — a digest would bind {} and perform HEAD
                      ⭐ RECLASSIFIED BY D4 (R0): the defect is an UNRECORDED HOST CONTRIBUTION,
                      not a canonicalization collapse. Omission stays absent in caller_terms;
                      the host default is recorded separately with source=host_default.
                      ⛔ Folding defaults into canonical form is now itself a defect.
HAZARD H2             git.log declares `format`, never uses it
                      ⭐ DISPOSED BY D2 — the field is NOT AUTHORIZED; the repair is removal
                      from the public language, not consumption (F-E disposed with it)
JOINT FINDING         act identity is NOT derivable from the declared schema
PATH IDENTITY         resolved-check / unresolved-handler split · prefix containment · realpath undecided
VERSIONING            canonicalization rules need their own identity
CORPUS                frozen, with concrete pairs
AUTHOR OF THE ACT     ⛔ NOT RULED — six properties instead of a category

RB-6B IMPLEMENTATION  BLOCKED (correctly)
NOTHING BUILT
```

> **STOP.**
