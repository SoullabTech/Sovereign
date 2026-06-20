# Soul Portrait — Path B Spec (Generalization Gates)

- **Date**: 2026-06-20
- **Status**: SPEC — awaiting Kelly's explicit go before any build. No code changed by this document.
- **Governs**: the four hard prerequisites in [`SOUL_PORTRAIT_DEPLOY_POSTURE.md`](./SOUL_PORTRAIT_DEPLOY_POSTURE.md) §"Path B". Read that doc first; this is its implementation design.
- **Governing principle (restated, load-bearing)**: *A sacred exception may precede the system pattern, but it must not become invisible precedent.* The Augusten instance is family-held consent held by the author-as-parent. The platform pattern requires consent **architecture** — recorded, verifiable, revocable — before any second portrait.
- **Distinction preserved throughout**: the **portrait text is immutable + traceable** (a gift; read-access surface); the **Mentor is live, guardrailed dialogue** (a conversation surface). These are two distinct surfaces with two distinct gates. A guardian revoke must close **both**.

---

## 0. Why this is needed (verified current state)

| Fact | Evidence | Consequence |
|---|---|---|
| `/soul-portrait/*` and `/api/soul-portrait/*` are **unmapped** in the access matrix | absent from `config/accessMatrix.ts` | They load **only** because middleware defaults to permissive **Mode A** (`ACCESS_CONTROL_MODE`, `middleware.ts`). In strict Mode B they 404. Today's safety is *environmental*, not *structural*. |
| The page is statically generated per slug | `generateStaticParams()` in `app/soul-portrait/[slug]/page.tsx` | A generated, member-bound, **revocable** portrait cannot be statically pre-rendered — Path B portraits must be **dynamic**. |
| The registry is **slug-only, not member-bound** | `lib/soulPortrait/registry.ts` — `Record<slug, SoulPortrait>` | There is no binding of a portrait to an owning/consenting member. This is the core gap Gate 2 fills. |
| `person.isMinor` is only a **tone hint** | `lib/soulPortrait/schema.ts` (`Person`), consumed in `mentor/route.ts` `systemPrompt()` | `isMinor` softens the Mentor's voice; it enforces **no access control** today. |
| Mentor rate-limit is **in-memory, per-IP-per-slug** | `mentor/route.ts` lines 27–53 (10 / 60s) | Fine for one unlisted URL; insufficient as an abuse limit on an authenticated multi-user surface (Gate 4). |
| Mentor retention posture is correct already | `mentor/route.ts` logs only `{ slug }`, `Cache-Control: no-store` | **Keep this exactly.** Gate 4 extends, never weakens it. |

**Primitives already in the codebase that Path B reuses (do not reinvent):**

- **Append-only consent ledger** — `session_consent_events` (migration `20260614000001_session_agreements.sql`): `actor_type`, `actor_id`, `action ∈ {set, accept, refuse, change, revoke}`, `agreement_version`. The canonical revocable-consent shape.
- **Denormalized-gate + authoritative-ledger-check** — the `video_link_reveal_allowed` boolean alongside the live ledger query in the same migration. Path B mirrors this: a fast boolean + an authoritative "latest event is a live accept" check.
- **Explicit recorded consent on a contact** — `client_contacts.consent_given / consent_given_at / consent_source ∈ {verbal, written, digital}`, `role ∈ {parent, caregiver, teacher, other}`.
- **Pre-send consent gate** — `session_artifacts.consent_confirmed`.
- **Youth tiers** — `members.developmental_tier ∈ {under13, tier2, tier3, adult}`, `guardian_required`, `compute_developmental_tier(birth_date)` (migration `20260209000001_youth_developmental_tier.sql`). **Gap:** no guardian-entity table, no guardian-consent ledger.
- **DB-backed rate limiter** — `lib/auth/rateLimiter.ts`: `checkRateLimit(identifier, 'ip'|'email'|'member_id', endpoint)`, `getClientIP`, `buildRateLimitHeaders`.
- **Sanctuary / no-retention** — `agreement_mode='sanctuary'`, `is_sanctuary` on `runtime_events`; pattern = no identifying content logged.

---

## 1. The core design tension (and its resolution)

Path B must hold two truths at once:

1. **The Augusten instance keeps working** exactly as the deploy posture promises — unlisted, noindex, parent-mediated, **no auth gate** — because it is a sanctioned family-held exception.
2. **Every other portrait** requires authentication **and** a live, recorded consent binding — no reliance on URL obscurity.

**Resolution: exploit the access matrix's exact-before-prefix matching** (`config/accessMatrix.ts` matches `exact` → `prefix` → `regex`).

- A single **grandfathered `exact` rule** keeps `augusten` public-unlisted.
- A **`prefix` rule** gates *all other* slugs behind auth.
- The route handler then enforces the *fine-grained* consent binding the matrix cannot express (mirroring how `video_link` reveal is gated by a denormalized boolean **and** an authoritative ledger check).

This cleanly separates the deploy doc's two easily-conflated things:
- **public-unlisted allow-entry** (makes the page *loadable* under strict middleware — **no auth**) → applies only to `augusten`.
- **Path B auth gate** (authentication + consent) → applies to everything else.

---

## 2. Gate 1 — AccessMatrix entries

Add to `config/accessMatrix.ts` (exact rules listed before prefix rules so precedence is explicit):

```ts
// ── Soul Portrait ──────────────────────────────────────────────────────────
// Grandfathered family-held exception (see SOUL_PORTRAIT_DEPLOY_POSTURE.md §Path A).
// Public-unlisted: loadable WITHOUT auth, but unlisted + noindex. NOT a Path B gate.
{ exact: '/soul-portrait/augusten', public: true,
  notes: 'Augusten — author\'s own minor child; family-held consent; unlisted exception only' },
{ exact: '/api/soul-portrait/augusten/mentor', public: true,
  notes: 'Augusten Mentor — family-held exception; rate-limited; no retention' },

// Path B: every OTHER portrait requires an authenticated member session.
// Per-portrait consent binding is enforced in the route handler (matrix is coarse).
{ prefix: '/soul-portrait/', minTier: 'free',
  notes: 'Path B: generalized portraits require auth + live consent binding (route-enforced)' },
{ prefix: '/api/soul-portrait/', minTier: 'free',
  notes: 'Path B: Mentor/API require auth + live consent binding (route-enforced)' },
```

**Why `minTier: 'free'` not a role:** auth ("is there a member session?") is the coarse gate the matrix owns. *Authorization* ("does THIS member have a live consent binding to THIS portrait?") is finer than the matrix can express and lives in the handler (Gate 2). This matches the existing `video_link` precedent exactly.

**Strict-mode note:** these entries also satisfy the deploy doc's separate concern — they make the routes load if/when prod is switched to strict Mode B. The `augusten` exact rules are the "public-unlisted allow-entry" the deploy doc calls out; the prefix rules are the Path B auth gate. They must not be conflated.

**Verification:** `checkAccess('/soul-portrait/augusten', …)` → allowed, public. `checkAccess('/soul-portrait/anyone-else', 'free', [], false)` → denied `unauthenticated`. (Add to a matrix unit test.)

---

## 3. Gate 2 — Auth + consent gate (member-bound portraits)

**Make portraits member-bound and dynamic.** The static registry stays **only** for the Augusten exact route. Generated portraits resolve at request time.

### New table: `soul_portraits`

```sql
CREATE TABLE IF NOT EXISTS soul_portraits (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT NOT NULL UNIQUE,           -- URL slug (random, not guessable)
  subject_member_id  UUID REFERENCES members(id),    -- who the portrait is ABOUT (nullable: minor may lack own account)
  owner_member_id    UUID NOT NULL REFERENCES members(id), -- who created/holds it (adult; guardian for a minor)
  subject_is_minor   BOOLEAN NOT NULL DEFAULT FALSE,
  subject_age        INT,                            -- at authoring time; informs age-appropriate handling
  portrait_kind      TEXT NOT NULL                   -- 'self' | 'gift' | 'parent_child' | 'legacy'
                       CHECK (portrait_kind IN ('self','gift','parent_child','legacy')),
  consent_state      TEXT NOT NULL DEFAULT 'pending' -- denormalized gate; authoritative = ledger (Gate 3)
                       CHECK (consent_state IN ('pending','active','revoked')),
  immutable_text     JSONB NOT NULL,                 -- the SoulPortrait gift; immutable after publish (Traceability Covenant)
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- **`immutable_text` is write-once-at-publish.** Enforce with a trigger that rejects updates to `immutable_text` once `published_at IS NOT NULL` (the Traceability Covenant is structural, not a promise). The Mentor reads from this; it never rewrites it.
- **`slug` is random/un-guessable** (e.g. 16+ bytes base32). Obscurity is *defense in depth*, never the gate.

### Route enforcement (both surfaces)

A shared `assertPortraitAccess(slug, viewer)` helper, called by **both** `page.tsx` (read) and `mentor/route.ts` (dialogue):

1. **Augusten short-circuit:** if `slug === 'augusten'` → serve as today (no auth), return. (Single grandfathered branch; everything below is Path B.)
2. Resolve viewer identity (`x-member-id` header / `maia_session` cookie — same as middleware).
3. Load `soul_portraits` by slug → 404 if absent.
4. **Authorization:** viewer must be one of: `owner_member_id`, `subject_member_id`, or an explicitly-granted recipient (Gift/Legacy — see §6 deferrals). Otherwise **404** (not 403 — do not confirm existence).
5. **Consent liveness:** `consent_state = 'active'` **AND** the authoritative ledger check (Gate 3) confirms latest guardian event is a live `accept`/`set` with no later `refuse`/`revoke`. On revoke → **both** page and Mentor return a calm "this portrait is no longer available" (404-class).
6. **Dynamic rendering:** Path B portraits set `dynamic = 'force-dynamic'` (or `dynamicParams` + no static gen for non-Augusten slugs) so a revoke takes effect immediately — never served from a static cache.

**Portrait vs Mentor stay distinct:** read-access (immutable text) and dialogue (Mentor) call the *same* gate but are *separate* surfaces. The Mentor additionally carries the no-retention + abuse posture of Gate 4. A revoke closes both; a rate-limit closes only the Mentor.

---

## 4. Gate 3 — Minor / guardian consent pattern

The real gap: **no guardian entity, no guardian-consent ledger** exists today. Mirror the proven `session_consent_events` shape.

### New table: `member_guardians` (the missing link)

```sql
CREATE TABLE IF NOT EXISTS member_guardians (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_member_id UUID REFERENCES members(id),  -- nullable: minor may have no own account
  minor_ref       TEXT,                          -- stable ref when no account (e.g. portrait subject key)
  guardian_member_id UUID NOT NULL REFERENCES members(id),
  relationship    TEXT NOT NULL                  -- reuse client_contacts vocabulary
                    CHECK (relationship IN ('parent','caregiver','legal_guardian','other')),
  verified_at     TIMESTAMPTZ,                   -- how guardianship was established (manual/admin for v1)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (minor_member_id IS NOT NULL OR minor_ref IS NOT NULL)
);
```

### New ledger: `soul_portrait_consents` (append-only, mirrors `session_consent_events`)

```sql
CREATE TABLE IF NOT EXISTS soul_portrait_consents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portrait_id  UUID NOT NULL REFERENCES soul_portraits(id),
  actor_type   TEXT NOT NULL CHECK (actor_type IN ('guardian','subject','system')),
  actor_member_id UUID REFERENCES members(id),
  action       TEXT NOT NULL CHECK (action IN ('set','accept','refuse','change','revoke')),
  consent_source TEXT CHECK (consent_source IN ('verbal','written','digital')),
  agreement_version TEXT NOT NULL,               -- the consent statement frozen at decision time
  flags        JSONB,                            -- { portrait_read, mentor_dialogue, retention:false }
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Authoritative liveness query (mirrors the `video_link` reveal check)

> A portrait is consent-live iff the **latest** guardian `accept`/`set` for the current `agreement_version` has **no** later `refuse`/`revoke` by that guardian.

`consent_state` on `soul_portraits` is the denormalized fast-path; **the ledger is authoritative.** On any `revoke` event, flip `consent_state = 'revoked'` (denormalize) *and* let the live query enforce it even if denormalization lags.

### Rules

- **For any `subject_is_minor` portrait, a live guardian `accept` is mandatory** before `consent_state` can be `active`. No guardian accept → portrait never serves. Reuse `compute_developmental_tier` / `guardian_required` to *classify*, but the *gate* is the explicit ledger accept, not the computed tier alone.
- **Age-appropriate handling:** carry `subject_age` into the Mentor system prompt (it already branches on `isMinor`/`age`) so the existing minor-safety language (warmth + nudge toward a trusted adult, no fate/diagnosis) is always engaged for minors.
- **Guardian's right to revoke is structural:** one `revoke` row → both surfaces closed on the next request (dynamic rendering guarantees immediacy). Revocation needs no counterpart's approval.
- **Consent statement is versioned + snapshotted** (`agreement_version`, like `agreement_text_snapshot`) so we can prove *what* was consented to, not just *that* it was.

---

## 5. Gate 4 — Production exposure rules

### Who reaches what

| Viewer | Self portrait | Minor's portrait (Gift/Parent-Child) | Legacy |
|---|---|---|---|
| Subject (adult) | read + Mentor | — | — |
| Minor subject | read + Mentor *iff* guardian consent live + age-appropriate | (same) | — |
| Owner / guardian | read + Mentor | read + Mentor | read + Mentor |
| Explicit recipient | — | — | read (Mentor per-grant) |
| Anyone else | **404** | **404** | **404** |
| Augusten URL | unchanged family-held exception (no auth) | — | — |

### Retention / Sanctuary posture under multi-user load

- **Keep the Mentor's current no-retention posture verbatim** — log only `{ slug }` (consider `{ portrait_id }`), never question content; `Cache-Control: no-store`. This *is* the Sanctuary posture for this surface; do not add transcript storage.
- The **immutable portrait text** is retained by design (it is the gift, traceable). The **dialogue** is not retained. This is the portrait/Mentor distinction expressed as a retention rule.
- A guardian `revoke` removes *access*; define separately (open question) whether it also tombstones `immutable_text`.

### Abuse limits on an authenticated surface

- Replace the Mentor's in-memory per-IP limiter with `lib/auth/rateLimiter.ts` keyed on **`member_id`** (authenticated) with an **IP** fallback for the Augusten unlisted path. Authenticated members get a real, DB-backed, per-identity budget; the unlisted exception keeps IP limiting.
- Cap Mentor turns per portrait per member per window; `buildRateLimitHeaders` for honest `Retry-After`.
- Keep `MAX_INPUT` / `MAX_CONTEXT` truncation; keep "answers only for portraits that exist" (now: *that the viewer is authorized for*).

---

## 6. What this spec deliberately does NOT build (earn-before-name)

Path B is the **gate**, not the product. The following are **separate, named follow-up crossings**, each requiring its own go:

- **The generator / creation flow** (chart + stage → `SoulPortrait`). Path B gates a portrait that exists; it does not author one.
- **Gift / Parent-Child / Legacy delivery flows** (recipient grants, hand-off, any send). The `portrait_kind` column anticipates them; the *flows* are deferred. **No system-initiated send to any minor** — preserved from Path A.
- **Self-serve guardianship verification.** v1 establishes `member_guardians` rows by **admin/manual** review (`verified_at`). Automated guardian verification (a real COPPA-adjacent problem) is its own spec.
- **Migrating Augusten into the DB tables.** The exception stays in the static registry + exact rule. It is *not* retrofitted into the consent ledger — it is family-held, and folding it in would erase the very distinction this doc protects.
- **Listing / discovery.** Portraits remain unlisted; no index, no gallery.

---

## 7. The Augusten exception under Path B (explicit)

After Path B ships, Augusten is the **single grandfathered exact-rule public-unlisted portrait**. It is *not* migrated into `soul_portraits` / consent tables. The deploy doc's Path A guarantees remain its governing posture. Path B makes the exception *visible as an exception* in the access matrix (a named `notes` entry) rather than an invisible consequence of permissive middleware — directly satisfying the governing principle.

---

## 8. Build sequence (only if approved — ordered, reversible)

1. **Gate 1 matrix entries** + matrix unit test (no behavior change for Augusten; closes the strict-mode hole). *Smallest, safest, independently shippable.*
2. **Migrations** for `soul_portraits`, `member_guardians`, `soul_portrait_consents` (idempotent; self-protecting per the migration-PR standard: orphan audit + `RAISE` on bad state). No callers yet → zero runtime change.
3. **`assertPortraitAccess` helper** + the authoritative liveness query (unit-tested against the ledger).
4. **Wire the page + Mentor** through the helper; make non-Augusten slugs dynamic; swap Mentor rate-limit to `member_id`-keyed.
5. **Admin path** to create a `member_guardians` row + record the founding guardian `accept` (manual v1).
6. **Verification pass** (below) before any second real portrait is created.

Each step is reversible and independently verifiable. Nothing in steps 1–3 changes what a user experiences; the gate goes live only at step 4.

---

## 9. Verification plan (per artifact, per the project's attribution discipline)

- **Gate 1:** matrix unit test — Augusten allowed-public; arbitrary slug denied-unauthenticated; `/api/soul-portrait/*` same. Confirm in strict Mode B the routes resolve (no 404 hole) and Augusten still loads.
- **Gate 2:** authed non-owner → 404; owner → 200; immutable-text update after publish → DB trigger rejects.
- **Gate 3:** create minor portrait → not serveable until guardian `accept`; insert guardian `revoke` → next page **and** Mentor request both closed; liveness query returns false. Prove revoke immediacy (dynamic, not cached).
- **Gate 4:** Mentor abuse cap fires per-member; logs contain **no** question content (grep the container logs for absence); `no-store` on responses.
- **Regression:** Augusten page + Mentor unchanged end-to-end (the exception must not be disturbed by the gate around it).

---

## 10. Decisions (RESOLVED — Kelly, 2026-06-20)

These four govern the build **when Path B is authorized**. The §11 Katie prototype deliberately needs **none** of them (adult · no guardian · no consent table · Mentor off).

1. **Tier** — **viewing** an existing portrait → **authenticated members** (`minTier: 'free'`). **Creating / generating** new portraits is **NOT** self-serve: it stays **admin / manual / founder-led** until the consent pattern is proven. (Read-access and create-access split, as §2 anticipated.)
2. **Revoke semantics** — a guardian revoke removes **access only**; it does **not** tombstone/delete the immutable portrait text in v1. Deletion is a **separate irreversible crossing** needing its own warrant — do not fold it into revoke.
3. **Guardian verification** — **manual / admin** for v1. No automated guardian verification yet.
4. **No-account minor** — **supported** in v1. The subject needs **no member record**; access is mediated through the creating/requesting adult member or guardian (`subject_member_id` nullable + `minor_ref`, per §3/§4).

**Scope guard (Kelly):** *Do not build the generator yet.* §1–§9 (the consent architecture) are **not** authorized to build by these answers. The only authorized build today is §11.

---

## 11. Katie — Gift Portrait prototype (BUILT + verified on branch, NOT deployed — 2026-06-20)

The first **Gift Portrait** — and deliberately **not** a Path B exercise. It is the safest possible next instance after Augusten: an **adult** recipient, so **no minor, no guardian gate, no consent table** is touched. It proves the Gift-Portrait *rendering path* (relationship-aware voice · Mentor-off) before any child / member-wide flow.

**Authorized scope (Kelly):** adult recipient · offered by her uncle · no guardian gate · private / unlisted / noindex · relationship-aware voice · **no automatic sending** · **no production deploy until Kelly reviews the content**. Build list = (1) static portrait data object · (2) route `/soul-portrait/katie` · (3) **same renderer** · (4) noindex · (5) **no Mentor binding yet** · (6) **no MAIA memory binding yet**.

**What shipped to the branch (not deployed):**
- `lib/soulPortrait/portraits/katie.ts` — Katie Claire McCullen, `mode: 'gift'`, `isMinor: false`, `offeredBy` (her uncle, Kelly). Authored from her **affirmed** natal data — no fabrication; Traceability Covenant honored.
- Registered in `lib/soulPortrait/registry.ts` (slug `katie`). Route + renderer reused unchanged; **noindex inherited** from the route's `generateMetadata` (`robots: { index: false, follow: false }`).
- **Mentor-off enforcement — the load-bearing safety change:** a new opt-in, default-deny `mentorEnabled?: boolean` on `SoulPortrait`. The Mentor **route** returns an identical **404** for any portrait without `mentorEnabled === true` (no info-leak vs. "not found"); the **renderer** mounts `<SoulPortraitMentor>` only when enabled. **Augusten** carries `mentorEnabled: true` — his Mentor is now an **explicit, visible grant**, not an implicit default. Katie omits it → Mentor off on both surfaces. Renderer Section 9 (Parent/Guide Notes) also guarded (optional → a gift portrait has none).

**Why the Mentor gate matters here:** the Mentor route answers for *any registered slug*. Without this gate, merely registering Katie would have silently exposed live guardrailed dialogue about a **non-consented adult** — the exact "invisible precedent" the deploy posture forbids. The immutable **gift text** (rendered) and the live **Mentor** (off) stay distinct, per the governing distinction.

**Runtime verification (dev, localhost:3000, 2026-06-20):**

| Check | Result |
|---|---|
| `POST /api/soul-portrait/katie/mentor` | **404** — Mentor off (gate fires) |
| `POST /api/soul-portrait/zzz-nope/mentor` | **404** — identical to Katie (no info leak) |
| `POST /api/soul-portrait/augusten/mentor` | **400** — Mentor on (passed gate → empty-message); no regression |
| `GET /soul-portrait/katie` | **200**, renders gift (no crash from empty guidance notes) |
| `GET /soul-portrait/augusten` | **200**, unchanged |
| `npm run typecheck` | clean |

**Reconciliation note:** built **concurrently in two sessions**. The parallel session authored the real `katie.ts` (affirmed chart) + registry entry; this session authored the structural **Mentor-off gate** + route/renderer guards. On collision the tooling **blocked an overwrite** of the real content with a placeholder scaffold — the scaffold was discarded, the real content kept, and both contributions verified as one composed state above. (Standing lesson reaffirmed: a parallel agent/session may be building the same feature — verify before overwriting; reconcile, don't clobber.)

**Display fixes settled (single-owner renderer) + live-DOM verified (2026-06-20):** (a) `offeredBy.giftOpening` is **surfaced as a card directly under the hero** — the relational doorway, met before "how to read this". Settled copy: eyebrow label **"Offered with love"** (rendered uppercase per the portrait's eyebrow style) · subline **"From {giverName}"** (→ "From Kelly") · then the giver's opening prose. (b) the hero **age line is hidden for `gift` / `legacy` portraits** (age stays in data). Verified in the hydrated DOM: Katie's hero = `["A Spiralogic Soul Portrait"]` (no age) + gift card label `textContent` "Offered with love" / subline "From Kelly"; Augusten's `parent-child` hero still = `["A Spiralogic Soul Portrait", "age 14"]`, no gift card, Mentor live (sacred instance untouched).

**Still NOT done (by design):** content review by Kelly before any deploy · Mentor for Katie · any memory binding · production deploy.

---

*The Path B **consent architecture** (§1–§9) remains **unbuilt and unauthorized** — only §11's adult Gift Portrait prototype is built, and it is held **pre-deploy pending your content review**. On your go for Path B, I implement in the §8 order, smallest gate first.*
