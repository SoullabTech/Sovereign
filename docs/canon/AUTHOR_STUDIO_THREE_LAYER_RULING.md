# Author Studio — Three-Layer Ruling

**Ruled:** 2026-07-30 (Kelly) · **Status:** ratified · **Scope:** navigation architecture, route
identity, and access policy for the Author Studio. Governance only — this document authorizes no
implementation.

## Why this exists

This ruling governed PR #833 while living only in session memory and commit messages. It was cited as
authority but was not version-controlled, not portable, and not citable from repository history.
Promoting it here closes that gap. It records what was ruled — it does not extend it.

---

## 1. The three layers (ratified)

| Layer | Name | What it does | Route |
|---|---|---|---|
| 1 | **House** | chooses the working environment | — |
| 2 | **Author Studio** | orients the writer within the life of the book | `/press/studio` |
| 3 | **Manuscript Room** | supports close work inside one manuscript | `/press/manuscript` |

**The defect this corrected.** The House opened straight onto `/press/manuscript` — a working
surface. The member landed on an upload form with no Studio around it. The Manuscript Room already
had a seven-tab bar, but it renders only once a manuscript is *saved*, so the shell was conditional
on having already finished the thing the member arrived to start. Structurally the app jumped
**Layer 1 → Layer 3**, and Layer 2 — the Studio as an *environment* — did not exist.

**Navigation grammar:**

```
House → Author Studio → Manuscript Room → Working Draft
```

not

```
House → Manuscript Room labeled as Studio
```

### Layer ownership

**Layer 2 owns:** Studio Home · orientation across the life of the book · writer-journey **phases** ·
desktop shell navigation · mobile room switcher · availability of rooms · return paths between Studio
and Room.

**Layer 3 owns:** Manuscript · Working Draft · Keeps · Collections · Emerging Books · Export · Your
Book · editor tabs · manuscript-local states and actions.

> **Phases belong to Layer 2. Tabs and editing states remain Layer 3.**

The manuscript tabs are **not** the Studio's information architecture — they are local tools inside
one room. Studio navigation is held separate from them precisely so the tabs can change without the
environment changing.

---

## 2. Route identity (ratified — supersedes prior interim language)

- **`/press/studio` = Author Studio** (Layer 2 environment). The House's Author Studio destination
  points here.
- **`/press/manuscript` = Manuscript Room** (Layer 3 writing surface). It remains a valid direct
  route and deep-link target, but is **no longer described as "the member Author Studio."**
- **`/studio` = Pro Studio** (practitioner). Unchanged.
- **`/book-studio` = Book Studio** (founder-facing). Unchanged.

Layer 2 may send the writer into Layer 3. **Layer 3 does not inherit the identity of the whole
Studio.** Earlier documents equating the Author Studio with `/press/manuscript` are superseded on that
point only; their `/studio` and `/book-studio` assignments stand.

---

## 3. Access policy (ratified; implementation outstanding)

`/press/studio` and `/press/manuscript` are **one governed Author Studio path**. A member permitted
into the Author Studio must be able to move from its home into the Manuscript Room.

**R1 audience — ruled 2026-07-30/31: the Author Studio is MEMBER-FACING.**

It is a member environment for working with one's own book. No paying-Steward or founder tier gate is
ruled for it: a commercial tier or an internal role would stand in for an audience distinction that
has not been established, and authorship has not been shown to belong only to those groups. The
founder-gated editorial workspace remains `/book-studio`, which this ruling does not touch.

**Ruled:**

- **Both** `/press/studio` (Layer 2) and `/press/manuscript` (Layer 3) **must be represented
  explicitly in `config/accessMatrix.ts`**, under the **same** member-facing policy — deliberately
  the same, because they are one governed path.
- Neither route may rely on the permissive unmapped-route default.
- **Route authorization answers who may ENTER. API authorization answers which data operations are
  allowed.** Both remain in force; neither substitutes for the other.

**Current state, recorded honestly:** `/press/studio` is declared `public: true` in `accessMatrix`,
which short-circuits before any auth check; its data protection rests on **API** authorization (every
manuscript read is member-scoped by credential and returns 401). `/press/manuscript` is **absent**
from `accessMatrix` and rides the permissive unmapped-route default.

That disagreement — middleware permitting entry while `accessMatrix` does not name the route — is
**not an acceptable lasting state**, because it leaves two competing declarations of who may enter.
Mapping `/press/manuscript` explicitly under the member-facing policy **removes the ambiguity without
changing who can currently reach the route**, since the unmapped default already permits entry.

**Reconciling it is a release precondition.** It is *not* a prerequisite for reviewing the shell's
behavior.

### 3.1 Correction — what this section previously asserted, and why it was wrong

As first ratified (PR #837, merged `045ab1200`), this section required `/press/manuscript` to be
mapped *"under the same paying-Steward / founder-gated policy **already ruled** for the Author
Studio,"* and forbade *"silent broadening to all members."*

**No such ruling existed.** At the time that text was written, `config/accessMatrix.ts` described
`/press/studio` as a *member-facing Layer 2 shell*, and the founder gate was recorded against
`/book-studio`. The phrase "already ruled" asserted a provenance it did not carry. The R1 audience was
in fact **open and unruled** until 2026-07-30/31, when it was ruled **member-facing**.

The correction is recorded rather than silently patched, because the failure is instructive:

- **A docs-only change may be runtime-inert while still being constitutionally active.** #837 was
  reviewed as "+133/−0, zero runtime" — all true. `git diff --stat` proves that *code* did not change;
  it cannot prove that *authority* did not change.
- **Access implementation may EXPRESS an audience decision. It may never DECIDE one.** This section is
  the place the audience is ruled; `accessMatrix` is the place it is expressed. A permissions repair
  must not become a product-definition change while presenting itself as cleanup.
- **Canon follows the ruling; the ruling does not follow canon.** The resolution here corrects the
  document to match the decision, and explicitly not the reverse.

---

## 4. Rejected alternatives (recorded so they are not re-proposed)

- **Build the shell around the seven deployed Manuscript Room tabs.** Rejected: those are
  implementation artifacts, not architecture. Building the environment around them bakes an
  implementation accident into the product.
- **Adopt a five-surface vocabulary (Capture · Gatherings · Shape · Write · Release) wholesale.**
  Rejected: Gatherings, Shape and Release do not exist. Navigation would promise rooms that are not
  there.

**Standing constraint:** deferred surfaces may appear for orientation but must render **inert and
clearly marked unavailable**. No placeholder links, no dead routes, no clickable controls for
capabilities that are absent.

---

## 5. Deferred — open questions, not rulings

These are recorded to prevent them being mistaken for settled:

- **Writer-journey phase set.** That phases live at Layer 2 is ruled. *Which* phases, and their
  names, are not.
- **Fate of the Layer 3 tab vocabulary.** Renaming or regrouping Manuscript · Working Draft · Keeps ·
  Collections · Emerging Books · Export · Your Book remains a local Layer 3 decision, unruled.
- **Multi-book semantics.** The Studio names a current book. Whether the Author Studio becomes a
  multi-book container, and what that would mean for identity and navigation, is unruled.
- **Rooms beyond the current set.** Not authorized, not designed, not scheduled.

---

## 6. Provenance

Ruled in session on 2026-07-30 and implemented in PR #833 (merged `c8e38c5a7`). The architectural
premise appears in commit `abd24e009`; that commit message carries the premise **only** — not the
layer assignments, the access ruling, or the deferred list. This document is the citable record.

**Amended 2026-07-31** — §3 corrected to record the R1 audience ruling (**member-facing**) and to
withdraw the unsupported "already ruled" paying-Steward / founder claim carried by the original
ratification. See §3.1. No other section changed.

Related: [`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`](./CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md) —
the same discipline applied to developmental layers rather than navigational ones.
