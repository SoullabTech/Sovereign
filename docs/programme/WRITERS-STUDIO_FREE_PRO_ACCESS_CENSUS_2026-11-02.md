# Writer's Studio — Free / Pro access census (2026-11-02)

**Lane:** access-tier census for Writer's Studio (split off from the Writers Academy session).
**Founder requirement (Kelly, 2026-11-02):** *"we need to confirm we have both a free Writers Studio and a Pro version- both accessible- free fully and Pro partially to explore for non paying Pro testers and becoming a Pro member".*
**Standing:** READ-ONLY census. ⛔ No code changed · ⛔ no access changed · ⛔ no deploy · ⛔ no production write.

## 0. Evidence base

| Item | Value | Evidence class |
|---|---|---|
| Canonical (`origin/clean-main-no-secrets`) | `afbbc65aa` | git |
| Production runtime | `da55740ae` (`docker exec maia-sovereign printenv GIT_COMMIT`) | runtime read |
| Canonical vs production | `da55740ae` is an ancestor of canonical; the 2 commits after it are docs only (`fd72cce0e`, `afbbc65aa`) | git |
| Production DB | counts only, read-only `SELECT` on `maia-postgres` | runtime read |

Code statements below are **code-read** (what the code says). Production statements are a runtime read of env names and row counts. ⛔ No member walked any of these paths for this record, so nothing here claims what a member experiences.

## 1. What the code says

The Free/Pro split already exists as a **product definition**: `lib/writersStudio/planPolicy.ts`, added 2026-10-26 (`0f726b4db`, `aa86e3869`).

- `WRITER_STUDIO_FEATURE_INCLUSION` lists 17 features.
  - **Free and Pro both get:** author-owned writing · inspiration compass · basic develop · basic review · basic MAIA · author-controlled edits · text copy · privacy controls · Academy foundations.
  - **Pro only:** advanced develop · advanced review · whole-work continuity · multiple active Works · expanded MAIA · advanced Academy · listen · publish preparation.
- `decideWriterStudioPlan()` returns:
  - **`pro`** (`complimentary: true`) for anyone who is pilot-eligible;
  - **`free`** (`basis: 'public_not_launched'`) for everyone else.
  - **Both** hard-code `publicEnrollmentEnabled: false` and `paymentEnabled: false`.
- Admission (`lib/writersStudio/admissionServer.ts`, enforced in `proxy.ts` "WRITER'S STUDIO INVITATION AUTHORITY") allows a member in **only if `pilotEligible`**:
  - the member is on the private roster (`ops_contacts`: `beta_tester` · `active` · `metadata.writers_studio_beta = true`, member-linked), **or**
  - the member's `admin_role` is `founder`/`cto`.
- Members who aren't pilot-eligible are refused across the whole corridor (`restrictedCorridor.ts`: `/writers-studio/**`, `/api/writers-studio/**`, `/api/sovereign/writers-studio/**`, and 15 advanced manuscript actions):
  - API calls get a 403 `WRITER_STUDIO_INVITATION_REQUIRED`;
  - pages redirect to `/explore/writers-studio?access=invitation-required`. PR #2075, which is open and not deployed, changes that redirect to `/house`.
- **The 17 inclusion flags are not enforced by anything.** Outside its own test, the only consumer of the plan decision is admission, which reads `pilotEligible` alone. No route or UI checks `included[feature]`. Inside the Studio, every admitted member gets the same surface.
- `members.tier`, Stripe membership and `config/accessMatrix.ts` `minTier: 'pro'` **don't open Writer's Studio**. The proxy comment states this deliberately: "Query flags, member tier, and browser state cannot open this corridor".
- Stripe membership checkout (`app/api/stripe/membership/checkout/route.ts`) sells `personal` ($12) and `pro` ("Stewardship — Serve others", $35). That is the **general MAIA membership** tier. Nothing in `app/api/stripe`, `app/api/billing`, `lib/stripe` or `lib/subscription` mentions Writer.
- The in-Studio menu `WriterPreferencesMenu.tsx:125` links to `/writers-studio/plans` ("See the planned Free and Pro experience"). **No such route exists on canonical**, so it's a dead link. Also, because that link sits inside the restricted corridor, a Free member couldn't reach it even if it existed.

**Astrology Pro precedent.** `lib/astrology/proAccess.ts`, `scripts/astro-pro-tester-grant.ts`, table `astro_pro_tester_grant_events`:
- phases `founder-only` and `tester-grant`, chosen by deploy setting;
- tester grants are audited, append-only and revocable, and the latest event wins;
- it fails closed;
- a tier, tester flag, allowlist or subscription never admits anyone.

This is the closest existing pattern for named, revocable, non-paying Pro testers. It is **astrology-scoped**: nothing in Writer reads it.

## 2. Production (`da55740ae`, read-only)

- The Writer admission code above is what's live, because production is an ancestor of canonical and the commits after it are docs only.
- **Writer roster:** 4 active, marked, member-linked Writer pilot contacts, plus 2 `founder`/`cto` members. So at most 6 members can enter Writer's Studio, fewer if they overlap.
- **Membership tiers:** 94 members — `free` 50 · `personal` 38 · `pro` 6. None of these tiers is an admission basis for Writer.
- **Writer env names present:** `WRITERS_STUDIO_EDITORIAL_ENABLED` · `_FOCUS_ENABLED` · `_REVIEW_DISCUSS_ENABLED` · `WRITER_SOURCE_*` (KMS). Values were not read.
- **Astro Pro:** `ASTRO_PRO_ACCESS_PHASE` and `ASTRO_PRO_PREVIEW_ENABLED` are **unset**, so Astrology Pro admits no one. The table `astro_pro_tester_grant_events` exists.
- **Stripe:** `STRIPE_SECRET_KEY` and the webhook secrets are present. There is no Writer price anywhere.

## 3. Tier by tier

| Tier the founder wants | In code on canonical | Deployed (`da55740ae`) | Missing |
|---|---|---|---|
| **Free Writer's Studio**, usable fully by any signed-in member | Defined as a plan (`free`, 9 included features), but admission refuses it: `pilotEligible` is required. The code comment is explicit: "everyone else remains outside the Studio while the meaningful Free product is preserved for later admission." | **Not available.** An ordinary member (50 `free` + 38 `personal` + 6 `pro`, all off the roster) is refused or redirected. | A ruling that Free members are admitted · admission of `plan: 'free'` · enforcement of the Pro-only features, or Free would silently equal Pro · an honest entry path for members who aren't invited. |
| **Pro, partly explorable** by non-paying Pro testers and members considering Pro | Only the full complimentary Pro for the roster. There's no partial or "explore" state, no named Pro-tester grant for Writer (the roster is an `ops_contacts` jsonb flag, not an audited revocable grant), and no Pro preview for Free members. | Roster testers (≤ 6 incl. founder/cto) get **full** Pro, not partial. Nobody else gets anything. | Decide whether "tester" means full complimentary Pro or partial · a preview or explore surface for Free members · the missing `/writers-studio/plans` page · an audited grant mechanism if testers must be named and revocable (Astrology Pro pattern). |
| **Paying Pro writer** (becoming a Pro member) | Nothing. `paymentEnabled: false` and `publicEnrollmentEnabled: false` are hard-coded. No Writer price or checkout. The general MAIA `pro` membership doesn't map to Writer Pro. | Not available. | A pricing and product ruling · checkout · a mapping from payment to Writer entitlement through the route-owned entitlement layer. |

**Answer to the founder's question:** **No, neither half exists today as described.**
- Free Writer's Studio is **defined but closed** to ordinary members.
- Pro is **full and complimentary for an invited roster of at most six**.
- There's **no partial Pro exploration** and **no path to becoming a paying Pro member**.

## 4. Naming collisions (found, not decided)

1. **"Pro Studio"** is the public practitioner house (`lib/launch/publicDoorwaysP0.ts`, slug `pro-studio`, "For practitioners…", and Layer 1 in `studioMap.ts`). A "Pro" plan inside Writer's Studio means a member could be "on Writer Pro" while Pro Studio is a different house. WRITERS-STUDIO-FACETS-01 §9.7 already retired the facet name "Pro" for exactly this reason (it's now **Direct**). The plan name `pro` in `planPolicy.ts` re-introduces the collision at the commercial layer.
2. **"Pro" membership** (`members.tier = 'pro'`, Stripe "Stewardship — Serve others", $35) is a third meaning. A member who paid for MAIA "Pro" today would reasonably expect Writer Pro, and they'd be refused at the Writer's Studio door.
3. Seen in passing, not in scope: the doorway copy for Writer's Studio still says "Private manuscript beta is held pending encrypted custody and recovery verification." `releaseAuthority.ts` now has `sourceIntakeReleased: true` (manifest `…-encrypted-source-intake-released-20261102`). That is a claim-discipline item for the publication lane, not this one.

## 5. The one question for the founder

> **Should an ordinary signed-in Soullab member be admitted to Writer's Studio as Free now, with Pro-only features enforced as an exploration boundary, or does Writer's Studio stay invitation-only until Free and Pro launch together with payment?**

Implementation questions follow from that answer and don't need separate rulings now:
- where to enforce `included[feature]`;
- whether to reuse the Astrology Pro grant log for Writer testers;
- the content of `/writers-studio/plans`.

**Recommended ruling (offered, not taken):**
- **Admit Free now, behind a deliberate founder act.** Free is already defined, and the plan policy itself says it is preserved for later admission. The founder's requirement is "free fully".
- **Before admission, make the Free/Pro inclusion table enforced server-side, not decorative.** An admitted Free member must not silently receive Pro. Pro-only features show as **visible, reachable descriptions with a path to Pro**, never hidden.
- **Writer Pro testers** should become **named, audited, revocable grants**, reusing the Astrology Pro event-log pattern, scoped to Writer, rather than the current `ops_contacts` jsonb flag.
- **Keep payment out of scope** (`paymentEnabled: false`) until a separate pricing ruling. "Becoming a Pro member" starts as an honest *request or waitlist*, not a checkout.
- **Rename the commercial plan away from "Pro"** (for example *Writer Plus* or *Studio Plus*) before any member sees it, to avoid three meanings of Pro.

⛔ Until the founder rules: nothing is built and no access changes. The independently held operations (`WRITER_INDEPENDENT_RELEASE_HOLDS`: PDF/EPUB delivery, deletion-safe recovery, etc.) stay held whatever the plan decision.

## 6. Founder ruling (Kelly, 2026-11-02, in this session)

**Ruling: ADMIT FREE NOW.** The founder chose "Admit Free now" over "Stay invitation-only", in answer to the §5 question.

- **AUTHORIZED** (direction): ordinary signed-in members will be admitted to Writer's Studio on the Free plan. This takes the §5 recommendation, including its preconditions:
  - the Free/Pro boundary is enforced server-side before admission opens;
  - Pro-only capabilities stay visible and reachable as descriptions, with a way to ask for Pro;
  - Writer Pro testers become named, audited, revocable grants (the Astrology Pro pattern, scoped to Writer);
  - payment stays out of scope;
  - the commercial plan is renamed away from "Pro" before any member sees it.
- **NOT AUTHORIZED by this ruling:**
  - flipping admission in production. That is a deploy act and belongs to the Writer's Studio walk session, after the enforcement lands and is witnessed;
  - any change to `WRITER_INDEPENDENT_RELEASE_HOLDS`;
  - payment or checkout;
  - a choice of the new plan name.
- **Custody check** (canonical `afbbc65aa`):
  - no preserve branch carries unmerged changes to `planPolicy` / `admissionServer` / `betaAccessServer` / `restrictedCorridor`;
  - no earlier founder ruling on Writer Free/Pro was found in `docs/`;
  - open PRs #2075 (refusal redirect) and #2076 (Design 1B) touch adjacent Studio code. Implementation must rebase over whichever lands first.

### 6.1 What the ruling leaves open: the Free/Pro boundary has no referent

`planPolicy.ts` names features: `basic_develop` vs `advanced_develop`, `basic_review` vs `advanced_review`, `basic_maia` vs `expanded_maia`. **Nothing in canonical defines which route or action is "basic" and which is "advanced".**

- All 19 manuscript actions and all `api/writers-studio/**` routes are currently one undivided surface.
- Three Pro-only lines have **no capability to gate at all**: `listen` and `publish_preparation` have no route, and `multiple_active_works` has no Work limit anywhere.
- So two competent implementers would draw this line differently. It is a product definition, not an implementation detail.

**Question owed (one, of principle):** what does Free include inside the Studio as it exists today?

**Recommended ruling:**
- **Free = the whole Studio as built today, on one active Work.**
- **Pro = more than one active Work, plus each Pro-only capability as it ships.**

Why this line:
- It makes "free fully" literally true.
- It needs exactly one enforcement point: a Work-count check at Work creation or activation.
- It avoids splitting develop/review/MAIA routes along a line nobody has defined.
- It means Pro is never marketed as a capability that doesn't exist yet. (`assertStudioMapHonest()` already applies that principle to navigation.)

The alternative is to split develop/review/MAIA now, which would need a per-action table ratified first.

**Standing:**
- the ruling to admit Free is TAKEN;
- the boundary definition (§6.1) is RULING_REQUIRED;
- the plan name is RULING_REQUIRED;
- implementation is not started;
- production is unchanged.

### 6.2 Founder ruling on the boundary (Kelly, 2026-11-02, in this session)

**Ruling: ONE-WORK FREE.** The founder chose "Yes, one-Work Free" in answer to §6.1.

- **Free** = the whole Writer's Studio as built today, on **one active Work**.
- **Pro** = more than one active Work, plus each Pro-only capability *as it ships*. A Pro capability that doesn't exist yet (today: `listen`, `publish_preparation`, `advanced_academy`) is never offered or marketed as available.
- In `planPolicy.ts` terms, this moves today's develop/review/MAIA surface into Free. The `advanced_*` / `expanded_maia` lines describe future capability, not a split of what exists.

Implementation this now permits, each part landing as its own reviewed change:
1. **One enforcement point.** A server-side active-Work-count check where a Work is created or activated, refusing a second active Work on Free, honestly and without losing data. Before building, it must be confirmed which object counts as an "active Work" (`living_works` vs manuscripts).
2. **Admission of `plan: 'free'`** in `admissionServer.ts`. Built **dark** behind a server switch, so it lands without opening the door.
3. **A plans surface** that Free members can actually reach. It replaces the dead `/writers-studio/plans` link and describes Pro with a request path, not a checkout.
4. **Writer Pro tester grants.** An audited, revocable event log on the Astrology Pro pattern, replacing the `ops_contacts` jsonb flag as the Pro basis. The current roster migrates to grants, so nobody loses access.

Still **not authorized**: opening the switch in production (a deploy act for the Writer's Studio walk session, after a witness) · payment · any change to the independent release holds.

**Still RULING_REQUIRED:** the member-facing name of the paid plan. It is needed before step 3 shows any copy to members; steps 1, 2 and 4 don't need it.
