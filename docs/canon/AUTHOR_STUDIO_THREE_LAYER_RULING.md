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

## 3. Access policy (ratified and implemented)

`/press/studio` and `/press/manuscript` are **one governed Author Studio path**. A member permitted
into the Author Studio must be able to move from its home into the Manuscript Room.

### 3.1 R1 audience — ruled 2026-07-30

**Author Studio is member-facing at R1.** It is a member environment for working with one's book —
not a founder or practitioner instrument.

**No Steward/founder tier gate.** Such a gate would make **commercial tier or internal role stand in
for the actual audience distinction**, without evidence that authorship belongs only to those groups.
An existing permission mechanism can *implement* a ruling; it cannot *supply* one.

> **Supersedes an earlier draft of this section**, which recorded the access policy as
> "paying-Steward / founder-gated" and forbade "broadening to all members." That language was written
> before the audience question was ruled, and it treated an available tier as though it were a
> settled audience. The audience ruling replaces it. The rest of §3 — that the two routes are one
> governed path, and that route authorization is distinct from API authorization — is unchanged.

**Ruled:**

- Keep `/press/studio` under the member-facing policy.
- Map `/press/manuscript` to **that same policy**.
- Do not add a Steward/founder tier gate.
- **Deployment implements this ruling; it does not decide it.** Production verification and founder
  acceptance remain subsequent, separate states.

### 3.2 Implementation

Both routes are mapped explicitly in `config/accessMatrix.ts` with the same policy —
**`minTier: 'free'`, no `requiredRoles`** — so neither relies on the permissive unmapped-route
default (#717).

`minTier: 'free'` is the mechanism that states *member-facing*: **auth is required before the door**,
and **every authenticated member qualifies regardless of tier**. Same shape as `/now-what/room`.

> **Corrected 2026-07-31.** Both entries first shipped as `public: true`, and this section described
> them that way. A **two-identity runtime check found the contradiction before activation**: an
> unauthenticated visitor received `200` on *both* routes, while control routes (`/studio`, `/maia`)
> correctly redirected to `/signin`. `public: true` short-circuits middleware *before* any auth
> check, so the routes were public at the route layer no matter what the surrounding prose claimed.
>
> No data was exposed — the pages self-gate and render "sign in to enter" once loaded. But **a page
> that hides its own contents is not an access boundary.** Route authorization was absent, and that
> is the control which answers who may enter.
>
> The lesson is the reason the check existed: *the ruling names an audience; only the mechanism
> enforces it. Prose in a config file is not a gate.*

> **Route authorization answers who may ENTER. API authorization answers which data operations are
> allowed.** They can reinforce each other; the second does not substitute for the first.

**The defect this closed:** `/press/manuscript` was absent from the matrix while middleware permitted
entry — **two competing declarations of who may enter**. That was not an acceptable lasting state.

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
