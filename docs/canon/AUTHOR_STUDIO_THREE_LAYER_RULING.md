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

**Ruled:**

- `/press/manuscript` **must be represented explicitly in `config/accessMatrix.ts`**, under the same
  paying-Steward / founder-gated policy already ruled for the Author Studio.
- **No silent broadening to all members.**

**Current state, recorded honestly:** `/press/studio` is declared `public: true` in `accessMatrix`,
which short-circuits before any auth check; its data protection rests on **API** authorization (every
manuscript read is member-scoped by credential and returns 401). `/press/manuscript` is **absent**
from `accessMatrix` and rides the permissive unmapped-route default.

That disagreement — middleware permitting entry while `accessMatrix` does not name the route — is
**not an acceptable lasting state**, because it leaves two competing declarations of who may enter.

**Reconciling it is a release precondition.** It is *not* a prerequisite for reviewing the shell's
behavior.

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

Related: [`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`](./CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md) —
the same discipline applied to developmental layers rather than navigational ones.
