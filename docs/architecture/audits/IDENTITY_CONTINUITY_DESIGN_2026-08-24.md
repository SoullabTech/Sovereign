# IDENTITY-CONTINUITY-01 — design only

> **Standing:** DESIGN ONLY. This document authorizes **nothing**. No migration, no writes, no
> rebinding, no merge, no relink, no survivor choice. It compares architectures and states what
> each would require. Adoption of any option requires a separate founder ruling.

**Question:** Can Soullab introduce a durable-person / identity-link layer that makes both
inhabited member histories available as one human continuity **without rewriting either history**?

**Predecessor:** `IDENTITY_PARTITION_MAP_2026-08-24.md` (measurement complete).

---

## 1. Two findings that constrain the design

### 1.1 The partition is systemic, not a Kelly anomaly

There are **8 member-creation sites** across the auth surface:

```text
app/api/auth/apple/native-callback        app/api/auth/signin/apple/callback
app/api/auth/google/native-callback       app/api/auth/signin/google/callback
app/api/team/invite/[token]/register      app/api/members/enter
app/api/members/register-local            app/api/members/register
```

and auth doors for apple · credentials · dev-login · device · google · microsoft · passkeys ·
native-biometry. Any door that mints a `members` row when it cannot match an existing one can
produce a new partition. **Kelly's split is the first observed instance of a structural property,
not a one-off defect.** A design that repairs only Kelly leaves the mechanism intact.

### 1.2 `person` is already taken — referent collision

The name `person`/`people` already denotes **other humans a member knows**:

```text
studio_people          practitioner's people
studio_person_roles    their roles
rl_people              relational-ledger people
soul_portrait_subject_person   portrait subject
```

Introducing `person_id` for the durable self would put two unrelated referents under one word in
one schema — exactly the "names are not identity" failure. **Any adopted design must choose a
non-colliding term.** Candidates: `principal_id`, `human_id`, `continuity_id`, `self_id`.
This document uses **`principal`** as a placeholder, not a recommendation of the word.

### 1.3 The natural seam already exists

`oauth_accounts` is already **1:N member → provider account** (`member_id`, `provider`,
`provider_user_id`). It holds 3 google rows today, one of which is B. The seam for
"many doors, one holder" is therefore partially built at the credential layer — it is the
*member* layer that has no such indirection.

---

## 2. The three architectures

### A. DESTRUCTIVE MERGE — rebind B → A

Rewrite `member_id` on B's 2,738 rows; delete or tombstone B.

- **Rejects on evidence.** 7 relations collide under naive rebinding (`usage_daily` on 8 date
  keys, `team_channel_members`, `studio_team_members`, and the 4 one-row-per-member relations).
- Destroys provenance on APPEND_ONLY_HISTORY and PROVENANCE_LEDGER classes: rows would assert
  they were created under an identity that did not create them.
- Forces an unrulable choice on 4 disagreeing current-state relations, **including two
  consent-bearing fields**.
- Does not address §1.1 — the next door mints the next partition.
- **Assessment: reject.** Recorded for completeness, not as a live option.

### B. CANONICAL MEMBER + ALIASES

Keep B's rows where they are; mark B as an alias of A; redirect access through A.

- Preserves history in place. No collisions at write time.
- **But** it answers "whose row is this?" with A while the row says B — the same provenance lie
  as (A), deferred to read time rather than write time.
- Asymmetry is arbitrary: A is "canonical" only because it is larger and older. If Kelly's daily
  use continues through the Google door, the canonical member becomes the less-inhabited one.
- Current-state conflict is unresolved, merely hidden behind A's row winning by definition.
- **Assessment: viable but weak.** It buys history preservation at the cost of an
  unearned canonical claim.

### C. PRINCIPAL ABOVE MEMBERS  ← strongest candidate

```text
                    PRINCIPAL  (durable human)
                            │
             ┌──────────────┴──────────────┐
        member A                       member B
       ce284751…                      49ae4717…
     passkey/password                    Google
             │                             │
     history stays attached         history stays attached
             └──────────────┬──────────────┘
                      PRESENT EXPERIENCE
```

- `members` becomes an **account/identity object**; the principal becomes the human.
- All 54,276 attributed rows stay exactly where they are, provenance intact.
- Symmetric: neither member is canonical; both are doors.
- Addresses §1.1 — a new door mints a member **bound to an existing principal**, so future
  partitions are absorbed rather than created.
- **Cost:** every read that means "this person" must span a set of member ids, not one.
  That is a wide change surface and the main argument against.
- **Assessment: strongest candidate.** Not authorized.

---

## 3. The eight questions

| Question | Under C |
|---|---|
| **Login → durable person** | Door authenticates → resolves to a `members` row as it does today → member resolves to principal. Auth path unchanged; one indirection added after it. |
| **Where new writes go** | To the member the session authenticated as — **unchanged**. Provenance stays truthful. The principal is a read-time and identity-time concept, not a write-time one. |
| **How reads span history** | Person-scoped reads resolve principal → member id set → `WHERE member_id = ANY(set)`. Member-scoped reads (audit, provenance, session) keep using one id. **The two read modes must be explicitly distinguished, never silently unified.** |
| **How current settings are established** | Not by merge. Present values are **newly established at principal level**, with each member's historical value retained as a superseded record carrying identity, timestamp, and source. |
| **How consent is handled** | `storage_consent` and `allow_research_participation` disagree across A and B. Consent may **never** be resolved by newest-wins, canonical-wins, true-wins, union, or majority. A principal-level consent value must be **explicitly established by Kelly**, and until then the system must treat consent as *unresolved*, not as either side's value. This is the hardest constraint in the design. |
| **Projections** | `member_theme_signals`, `state_vectors`, `member_relational_signals` are DERIVED — recompute over the union of both histories rather than migrating. A projection built from half a life was never the truth; recomputation is the honest repair. |
| **Joint content/practitioner ownership** | Yes, without rebinding: `member_manuscripts` etc. stay attached to their creating identity, and a principal-scoped reader surfaces them together. This is exactly the manuscript case that opened the investigation. |
| **Does `members` become an account object?** | Under C, yes — that is the substantive claim of the design, and the reason it is a canon-level question rather than a schema question. |

---

## 4. What this design must not be allowed to do

- Present `dominant_element` water|fire as a collision to resolve. These are **two historically
  derived states from two partial streams**; choosing one destroys information. A principal-level
  element, if ever wanted, is a *new* derivation, not a survivor.
- Treat B as debris. B is 2,738 rows spanning 2026-02-03 → 2026-08-24, continuing today.
- Repair Kelly while leaving the 8 minting sites unchanged.

## 5. Open governance question (not asked here)

Whether `members` may cease to denote the human is a **canon-level** question touching the
sovereignty invariants, not an implementation choice. It is recorded as `RULING_REQUIRED` and is
**not** asked in this document — this unit was authorized to compare architectures, not to seek
adoption.

---

## FOUNDER RULING — 2026-08-24

> A member record remains an **authenticated historical identity** within Soullab. A higher
> continuity subject may bind multiple member records that are **established** to belong to one
> durable self. The continuity layer **does not rewrite historical attribution.**

This ruling is **narrower** than §5's open question and **supersedes the need to ask it now**.
`members` is **NOT** ruled to cease denoting the human. No repository-wide semantic migration is
authorized. Existing code continues to understand `member` exactly as it does today unless it
**explicitly opts into** principal-scoped reasoning. Migration path, not flag day.

### Three kinds of principal-level state (ruled)

```text
                    PRINCIPAL

HISTORY             DERIVED              PRESENT AUTHORITY
--------            -------              -----------------
A + B rows          recomputed           explicit current choice
preserved           projections          / governed decision
row attribution     from aggregated      consent + certain
intact              evidence             settings live here
```

These are **different operations** and must not be collapsed into one another.

### Read-mode distinction (ruled)

A function named `getMemory(id)` must never silently decide whether `id` means a member or a
continuity subject. Conceptually explicit APIs only:

```text
readMemberHistory(memberId)        never expands
readPrincipalHistory(principalId)  may expand to several member ids
```

Binding on: evidence/provenance · practitioner actions · manuscripts · relationship records ·
audit trails · sessions · auth credentials. **Without this, the principal layer becomes the
laundering mechanism this whole investigation exists to avoid.**

### Consent (ruled)

```text
principal.storage_consent          = UNRESOLVED
principal.research_participation   = UNRESOLVED
```

Not X, not Y, not newest(X,Y). Historical member-level values remain intact with provenance.
A later explicit principal-level choice governs **future** behavior without rewriting what either
identity historically recorded.

### Binding must be evidenced, never inferred (ruled)

A principal link may **not** be created because two records share an email, name, device cohort,
or behavioral similarity. A binding carries `basis` · `evidence` · `standing` and is revocable.
**This prevents the continuity layer from becoming an automated account-merging machine.**

---

## CLOSURE — IDENTITY-CONTINUITY-01

```text
A  destructive merge                 REJECT
B  canonical member + aliases        INSUFFICIENT / transitional
C  continuity subject above members  PREFERRED

historical rebinding                 NO
new writes                           authenticating member
principal reads                      explicit opt-in
derived projections                  may recompute
credentials/sessions                 remain member/auth scoped
consent conflicts                    UNRESOLVED until explicit choice
naming                               `principal` remains a PLACEHOLDER
```

**State: DESIGN CONCLUDED (founder ruling, 2026-08-24).** Succeeded by
`IDENTITY_BINDING_SUBSTRATE_2026-08-24.md`.
