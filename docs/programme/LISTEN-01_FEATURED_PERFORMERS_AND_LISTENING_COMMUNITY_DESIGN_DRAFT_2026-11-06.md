# LISTEN-01 · Featured Performers & Listening Community — design note (DRAFT)

**State:** `PROPOSED` · draft only, untracked · **no owner issue edited, no source touched, nothing committed, nothing deployed, no artist contacted.**
**Owner lane:** LISTEN-01 (#1979) under AUDIO-PLATFORM-01 (#1984, DESIGN / RELEASE HOLD). Creates no second owner, branch or lane; sits beside `LISTEN-01_AMBIENT_COMPOSITION_ATLAS_CHARTER_DRAFT_2026-11-01.md`.
**Origin:** founder direction 2026-11-06 — showcase performers with credit and a platform, without per-performer permission where the platforms lawfully allow it; also a place to share with members and to build a community of members educated in ambient, world, healing and meditation soundscapes.

## ▶ RESUMED — founder, 2026-11-06 (later the same day)

> *"Let's continue with full build and after it is beta tested safely we can begin inviting artists like our member Korey Richey."*
>
> **The pause below is lifted for the BUILD.** Two things stay exactly as before: **(1) no performer is contacted or invited until the feature has been beta-tested safely** (and the counsel, wording, Helper Fund-path and consent items are settled); **(2) nothing is deployed or merged to `clean-main-no-secrets`, and no hold is lifted.** *Korey Richey* is a **member**, named by the founder as the kind of artist to invite **after beta** — **no member data was looked up, no one was contacted, and he is not mentioned on any card, in any fixture or in any test.**

### 0b. Proposed build mandate — ⚠️ AWAITING FOUNDER CONFIRMATION (nothing started)

"Full build" is not yet bounded; the lane's own rules (single source owner, review-only branches, reversible patches, independent review) need it bounded first. **Claude's proposal:**

- **Objective:** a **"Listen to someone"** section in the existing Listening Room, **web first**, behind the existing review flag (`SOULLAB_LISTEN_REVIEW_ENABLED`, which `/listen` requires and which stays off), showing the honest **"In preparation"** state until the signer has approved real entries.
- **Base (needs confirmation):** the newest LISTEN-stack tip — **`fix/listen-1999-reconcile-20261106` = `feature/listen-native-audio-session-20261030` @ `f970d347b`** (2026-11-06; contains the #1999 work). ⚠️ It is **not canonical** (the stack's #1998 and #1996 are still open). Build as a **new child branch in a new git worktree** (e.g. `feature/listen-performer-shelf-20261106`) — **not** in the current checkout and **not** in the two existing LISTEN worktrees — with a PR **into the stack, never into `clean-main-no-secrets`.**
- **Slices (smallest reversible unit first):**
  - **S1 — web, no database, no native:** a signer-approved **catalog-as-code** with a **fail-closed validator** (unknown rights or missing credit ⇒ not shown; entries are provider-hosted pointers only); the section, the card (credit, Soullab's own words, "Where to find more of their work," click-to-load YouTube/Spotify embed on web, link-out in the native app); the **audio bridge** reusing `acquireAudioOutput`, the preflight channel and focus events; the "In preparation" row. **Catalog ships EMPTY** — test fixtures are **fictional only**. Tests follow the lane's pattern, each paired with a defeat candidate.
  - **S2 — native "Now listening" sheet** (iOS plugin as a **reversible patch**, iOS owner named, device tests). *Separate go.*
  - **S3 — Members shelf + suggestion form.** Needs a **database migration** (= schema-deploy authorisation) and a consent/Sanctuary review. *Separate go.*
  - **S4 — Soullab Mixes** (link-outs). After counsel. *Separate go.*
  - **S5 — Tier 2 invitation + Helper Fund direct-invite path.** A pricing-lane change; after counsel and the fund-policy decision. *Separate go.*
- **Exclusions:** no deploy; no merge to canonical; no flag flip; no production or member data (Korey's included); no performer contact; no migration; no Helper Fund or pricing change; no provider OAuth or Web API; no Soullab-hosted audio; no Android.
- **Stopping conditions:** evidence contradicts a design assumption; the work would touch protected MAIA voice/queue files or widen scope; a new policy question appears; an independent Class A/R20 review is needed (**Claude cannot be the independent reviewer of its own work**).
- **Evidence required:** typecheck no-regression; the slice's tests green **and each defeat candidate killed**; for S1 a browser witness. Device witnesses only for S2.
- **Not authorised by this mandate:** anything above that is not S1.

## ⏸ (SUPERSEDED for the build — kept for the record) PAUSED — founder, 2026-11-06

> *"Let's pause this part for now until we get this up and running for beta."*
>
> **The performer showcase (Soullab Picks, the Members shelf, Tier 1/Tier 2, Soullab Mixes, the performer audio integration, the invitation and the teaser) is on hold until the Listening Room itself is up and running for beta.** Nothing here is to be built, sent, shown or offered in the meantime. **No performer has been contacted; no invitation, form, plugin, teaser or counsel brief has gone anywhere.** To resume: re-read §0 below and the open items first — platform terms, the owner issues and the code on the LISTEN branches may have moved by then, and every "read on 2026-11-06" statement in these notes is a dated reading.

## 0. Where this stands — summary (2026-11-06)

**Decided by the founder (direction only; nothing authorised to build):**
- **Name / place:** **Listening Room — confirmed by the founder 2026-11-06 to be the *existing* Sound Studio surface** (`app/listen/ListenRoom.tsx` on the LISTEN branches), not a new product. Soullab Picks and Members are sections of that room. ("Listening Lab" was set aside because "Lab" already means the gated tester cohort.)
- **Two shelves:** *Soullab Picks* (chosen by Soullab) and *Members* (suggested by members, curated by Soullab). No likes, counts or rankings; Members cards unnamed unless the member agrees.
- **Two tiers:** Tier 1 Spotlight (embed/link with credit, no permission asked) with an invitation to Tier 2 Featured performer (opt-in grant) on every card.
- **Signer:** Kelly Nezat signs every entry; Claude/JARVIS prepares and never signs.
- **Platforms:** embed YouTube and Spotify; link out to Tidal, Apple Music, Bandcamp (with a "where to find more of their work" link), SoundCloud and performers' own sites.
- **Private suggestion form** in the first release; public queues and discussion held until the Circles work.
- **Soullab Mixes:** Mixcloud as a link-out (its widget licence is non-commercial); embed only by Mixcloud's written agreement; other routes in §8a.
- **YouTube in the app:** preferred approach is a native player loaded with an HTTPS identity, **presented as a "Now listening" sheet (founder, 2026-11-06)**; a "Watch on YouTube" link-out fallback ships regardless. Audio-integration design: `LISTEN-01_LISTENING_ROOM_PERFORMER_AUDIO_INTEGRATION_DESIGN_DRAFT_2026-11-06.md`.
- **Audio decisions (2026-11-06, direction only):** accept the brief pre-pause sound provisionally and measure it on a real phone (switch to a no-leak gate only if clearly audible); build the native player inside the existing LISTEN native-audio work with the iOS pipeline owner reviewing (owner **to be named**); Android link-out only for now.
- **Counsel check** before launch.

**Evidence so far:** primary terms read (§8b) · Safari simulator pass for YouTube and Spotify (§8c) · in-app YouTube embed **fails** with error 153, Spotify passes (§8d) · native player prototype works in the simulator (§8e) and **on a real iPhone** for load, member-started play, page-driven pause and teardown; iOS pauses it on lock and on backgrounding and it does not restart by itself after lock (§8f).

**Still open before anything is built:**
1. **Siri / overlap:** what the video did while Siri answered; whether the post-home restart was manual (§8f).
2. **Audio-control integration:** bring the native player under `AudioSessionManager` / `VoiceController` so it never overlaps MAIA speech or recording (§8d, §8f).
3. **Real MAIA app:** the plugin, the scene-delegate trap (§8e), App Store review exposure, and the iOS pipeline owner's decision.
4. **Counsel** on the points in §9 Q4 and §8b — ✅ **brief drafted 2026-11-06, unsent** (`LISTEN-01_LISTENING_ROOM_PERFORMERS_COUNSEL_BRIEF_DRAFT_2026-11-06.md`; the founder decides whether, when and to whom it goes); **Mixcloud's written permission** if an embed is wanted.
5. **Rights registry:** use the one LISTEN-01 registry (#1979), not a sibling. #1979 §4 now **read (2026-11-06)**: the registry "must fail closed" and lists its fields (master owner, composition rights, permitted playback mode, territories, AI analysis, etc.). Performer entries are **provider-hosted pointers**, not Soullab-hosted media; the registry row must state that. A Tier 2 grant is **not** automatically all rights.
6. **Words:** ✅ **drafted 2026-11-06, unreviewed** — the Tier 2 invitation, one-time grant, the "Are you the artist?" card line and the suggestion-form consent copy are in `LISTEN-01_PERFORMER_INVITATION_AND_CONSENT_WORDING_DRAFT_2026-11-06.md` (founder review, then counsel, before any use). Still open: ~~the Members shelf name~~ (adopted, §3b); compensation stance (founder proposal recorded, final wording not); sender; retention periods.
7. **⚠️ Sequencing (from the owner issues, 2026-11-06):** the Listening Room itself is on **LISTEN-01 production HOLD with `/listen` feature-disabled and a shared-authentication blocker**, and the native Capacitor path is **unadmitted.** The performer shelves **cannot ship ahead of the room.** Everything in this note is design and evidence until the room is admitted.

## 1. Governing idea

> *Point members toward the people making this music, in their own names and on their own platforms. Teach listening; do not tell anyone what they will feel.*

Soullab is the curator and the host of the *introduction*. The performer's platform remains the host of the *music*.

## 2. Evidence standing

| Claim | Standing |
|---|---|
| LISTEN-01 / AUDIO-PLATFORM-01 rules cited below | **Read from the local Atlas charter draft only.** #1979 / #1984 and `lib/listening/soundStudioExperience.ts` not re-read this session. |
| YouTube / Spotify / Tidal / Bandcamp embed behaviour and terms | **Unverified — from general knowledge.** Each platform's current embed and developer terms must be read from the primary source before build. Tidal embed terms and pause-API support are specifically uncertain. |
| Legal risk of embedding | **Not legal advice.** US case law has been favourable to embedding; other jurisdictions less settled. A short counsel check is recommended before this is a core feature. |
| Any performer's willingness to be featured | **Unknown.** Nobody has been asked. |

## 3. Two tiers

**Tier 1 — Spotlight (no permission requested).** Link and/or official embed through the performer's own platform (YouTube, Spotify, Tidal, Bandcamp, SoundCloud, Apple Music where available). Applies only where the platform permits embedding. The performer is credited and linked; every play counts for them.

**Tier 2 — Featured performer (opt-in).** The performer chooses to be featured and grants a one-time, plain-language permission. Unlocks a short bio in their own words, their photo, a message to members, and a real relationship. Every Tier 1 card carries an unobtrusive invitation to become Tier 2.

Tier 1 never implies Tier 2: no "partner", "endorsed" or "official" wording on a Tier 1 card.

## 3a. Two shelves — founder direction 2026-11-06

> *"We can have a Soullab picks section and a members section (curated by Soullab)."*

- **Soullab Picks** — performers and Soullab Mixes chosen by Soullab; each entry signed off by the named signer (§9 Q2). Tier 1 Spotlight cards and, where a performer opts in, Tier 2 Featured performers live here.
- **Members** — performers **suggested by members and curated by Soullab.** This is the output of the private "suggest a performer" form (§9 Q5): a suggestion becomes a card only after the rights-registry step and the signer's sign-off. A member never publishes directly.

Constraints carried over, stated so the second shelf does not become a different product:
- **Curated, not crowd-ranked:** no likes, counts, "most suggested", leaderboards, streaks or badges on either shelf. Order is by date added or an explicitly editorial grouping, never by popularity.
- **Attribution is the member's choice:** a Members card shows "suggested by a member" unless that member has agreed to be named. Default is unnamed. A suggestion form that is only a private note to the signer stays private unless the member says otherwise.
- **Same rules, same registry:** both shelves use the one rights registry, the same card, the same audio contract, the same no-claims rule. "Members" is a source of suggestions, not a lower bar.
- **Discussion stays held:** comments, replies and member-to-member conversation about a card remain held until the Circles work (§7). Nothing in this shelf creates them.
- **Open:** (a) the Members shelf's name ("Members' picks" vs. "From our community") — avoid anything implying members chose it for the platform; (b) whether a member can later withdraw their suggestion and have the card removed (recommended yes, for member-named cards); (c) whether the shelves appear as two tabs or one page with two sections.

## 3b. Naming — ✅ ADOPTED AS DIRECTION by the founder 2026-11-06 ("Yes, adopt them"); originally Claude's proposals

> **Adopted (direction only; room-facing wording to be re-checked against the nav labels and the counsel answer on "featured" before build):** Soullab's choices → **"What we're listening to"** (internal *Soullab Picks*) · member-suggested → **"Passed along by members"** (alt. *"Shared with us"*) · Tier 2 card marker → **"In their own words"** · both shelves as one place → **"Listen to someone"** · mixes → **"Soullab Mixes"**, each titled, *"Mixed by Kelly Nezat"*. The *words to avoid* list below stands.

**What the existing room sounds like** (section headings read from the LISTEN branch, `app/listen/ListenRoom.tsx`): *"What did you notice?"* · *"Studies and inquiry."* · *"Bring your collections"* · *"Where would you like to go?"* · *"Sound deserves attention."* · *"What you keep, and how."* · *"Shape what you hear."* — short, human, often a question or an invitation, rarely a product noun. New names should sound like that. (A collision check is a grep of the branch, not a trademark search.)

| Thing | Internal term (kept) | Suggested room-facing title | Why |
|---|---|---|---|
| Soullab's choices | **Soullab Picks** (founder's term; 0 collisions on the branch) | **"What we're listening to"** | Present-tense, plainly true, no endorsement claim. Only shown while it is true. |
| Member-suggested, Soullab-curated | **Members shelf** | **"Passed along by members"** *(alt: "Shared with us")* | Like passing a record to a friend; **does not** say members chose it, voted for it, or that their listening is watched. ⛔ **Avoid "What members are listening to"** — it implies member listening activity is collected and shown. |
| Opted-in performers (Tier 2) | **Tier 2** | Card marker **"In their own words"** | Says what is true — the introduction is theirs — and **avoids the word "Featured"**, which counsel is being asked about (brief Q6d). |
| Both shelves, as one place in the room | — | **"Listen to someone"** *(alts: "People & sound", "Who's behind the sound")* | Verb phrase like *"Shape what you hear."* Check the final choice against the nav labels before build. |
| DJ-style mixes | **Soullab Mixes** (founder's term) | Keep **"Soullab Mixes"**, each mix carrying its own title and *"Mixed by Kelly Nezat"* | Plain and honest about who made it. |

**Words to avoid:** *Featured / Official / Partner* (affiliation or endorsement) · *Top / Popular / Trending / Most-suggested* (ranking — ruled out) · *Lab* (already the gated tester cohort) · *Picks* for the Members shelf (suggests members selected) · *Healing / Therapy / Frequency / Calm-for-X* (effect claims) · anything translating a tradition into Soullab vocabulary.

## 3c. Accord with the Soullab Stewardship Model — read 2026-11-06 (Claude's reading; founder to confirm)

**Interpretation, stated so it can be corrected:** I read "stewardship model" as the product's own **`docs/internal/STEWARDSHIP_MODEL.md`** — *"Soullab does not sell attention. It shares the cost of sustained care."* — tiers **Witness (free) · Holder · Steward · Sustainer**, **Sponsored Access (non-negotiable)**, tone rules, and *"The Line We Do Not Cross."* I did **not** read the separate JARVIS Stewardship Constitution (`docs/governance/…`, not on this branch), the Circles/Commons doctrine in full, or `RECIPROCAL_SOVEREIGNTY_INTENTION`. If "stewardship" meant one of those, say so.

**Where the design already agrees:**
- **No selling of attention** → no advertising anywhere on the shelves; performers' self-promotion is limited to **their own card**; **no paid or tier-based placement.**
- **No scarcity, urgency, streaks, countdowns** → the invitation sets no deadline; the shelves carry no counts or rankings.
- **Dignity and a way out at every step** → a performer can withdraw any time, no reason asked; a member's suggestion is deletable on request.
- **"No tier is morally superior"** → members are equal on the Members shelf; a Steward/Sustainer's suggestion carries **no extra weight.**

**Where it must be adjusted (these are the substance):**
1. **"Full access to Soullab" for performers → express it as *Sponsored Access*, not a special status.** The model says sponsored access is *funded by Sustainers, offered without shame, creates no debt or obligation, time-bounded but renewable, and leaves no permanent label or mark in the system.* So the invitation must **not** promise open-ended "full access," must **not** frame it as payment for anything, and **the sponsorship record must not be linked to the performer's visible card** (no "sponsored artist" mark). Whether performer access is funded from the Sustainer pool or by Soullab directly is a **founder decision** — and a performer using MAIA heavily carries a real compute cost that someone bears.
2. **Provider-hosted playback costs Soullab almost nothing, so it should be weighted at zero and never gated.** *"Does this ask the user to pay to be okay, or invite them to help hold what is holding them?"* — the shelves must be fully available in **Witness (free)**, which *"must always feel complete."* Nothing in the Listening Room's performer shelves may sit behind a tier.
3. **A "support them" link must never read as an obligation.** The model forbids *implying moral obligation* and *framing payment as virtue.* Wording: a plain **"Where to find more of their work"** — never "support them" as a nudge, never any "you should." (The companion note's card anatomy and the invitation draft use "support them"; **both should be reworded.**)
4. **"Self-promote" must stay the performer's own card** — their words and links — so it never becomes the attention marketplace the model rules out: no messages to members, no access to member information, no purchased prominence.
5. **Cost-bearing honesty:** if any step *does* carry a cost to Soullab (native player upkeep, review, a performer's MAIA use), say so plainly rather than hide it — consistent with *"tell the truth about costs."*

**Accord with the community-building intent:** the shelves are *passed along*, not ranked; attribution is the member's choice; curated by a named signer; public discussion held until the Circles work — i.e. a **relational** space rather than a status economy. This is the reading already built into §3a and §5; the Circles/Commons doctrine itself was **not** re-read here.

**Founder framing, 2026-11-06: *"this is about helping the helpers — including the sound helpers."*** Read against the code: Soullab already has a **Helper Fund** (`lib/pricing/helperFund.ts`, `app/helper-fund/*`, `components/stewardship/HelperFundPrompt.tsx`) — *"scholarships for emerging practitioners and contributions from thriving practitioners … **stewardship flows in both directions** … dignity preserved — no public markers, no shame."* Scholarships run **3 months, 6 months or ongoing**, support type **waived / reduced / full scholarship**, applied for privately and approved by an admin; the page says *"your clients see nothing different."* So the performer programme is **a natural candidate for the Helper Fund** — and "sound helpers" would be a recognised kind of helper. ⚠️ **Correction (2026-11-06):** my first wording here said *"not a new mechanism."* That was **more definite than the evidence allows** — the direct-invitation path, the eligibility wording and the funding are all **new or unverified** (see "Second opinion" below). Consequences, each a decision or a check, none taken:
- **DECIDED as direction (founder, 2026-11-06, "Yes, via Helper Fund"): use the Helper Fund path** for performer access (instead of inventing a gift seat): private, no public marker, time-bounded but renewable, funded by the fund's contributors. **Still open beneath it:** eligibility wording for sound helpers, what "access" means for them, whether the pages are live, and the direct "invitation to receive" design. Direction only; nothing built.
- **Eligibility wording:** the Helper Fund is written for **"emerging practitioners"** and a **Studio fee waiver**; a performer is neither by default. Naming **sound helpers** as eligible, and what "access" means for them (member access vs a Studio fee), is a **founder decision**; ⚠️ whether the Helper Fund pages are **live** was **not verified** — do not promise it until it is.
- **An invited performer should not have to *apply* or explain their "situation."** The current flow asks for a private situation statement; that fits someone seeking help, **not** a performer being thanked. A **direct "invitation to receive"** (founder-approved, same protections, same duration options) would need its own decision and a small design — **not built.**
- **"Both directions" stays unpressured:** a thriving sound helper may *later* choose to contribute to the fund, but **this is never asked in the invitation** — the tone rules forbid implied obligation.
- **Keep the two records apart:** the **"In their own words"** card marker is about the *card*; the fund record is **private** and must never be visible on, or linked to, the card (*no public markers*).
- ⚠️ **Cultural sovereignty (Invariant 14):** "helper" is **Soullab's** word. Use it **internally**; in anything a performer reads, **let them name themselves** — do not label a musician a "helper" or a "practitioner" unless they do.

**Second opinion — a report the founder pasted on 2026-11-06 (written by another assistant; treated as input, not as a decision).** Claude checked its factual claims against the code and GitHub:
- ✅ **Verified in the code** (files identical on the checkout and on `origin/clean-main-no-secrets` at `7add1a9f9`, whose last commit is dated 2026-11-06; the remote-tracking ref was **not** re-fetched): the application route **rejects a "situation" under 50 characters**; approval **assigns an end date** (`scholarship_end`, set from a number of months chosen at approval) and active support depends on `scholarship_end > NOW()` — so **"ongoing" as a request option does not by itself create indefinite access**; the contribution route's **Stripe import is commented out** and the code falls back to creating a contribution record directly, so **the source does not show that money is collected or that a funded pool exists** (the whole route flow was not read end to end); the fund page is written for **"emerging practitioners"** and a **Studio fee**. ⚠️ **This corrects my earlier "funded by the fund's contributors"** — whether there is a funded pool to draw on is **unverified.**
- ⚠️ **One claim in the report is wrong:** it says the Listening candidate **PR #1999 is "open, unmerged."** GitHub shows **#1999 MERGED on 2026-11-06 at 19:42Z — into its stacked base branch `feature/sound-studio-uiux-02-prototype-20261030`, not into `clean-main-no-secrets`.** So it is merged *within the stack* and **not canonical.**
- ✅ **Verified: the ownership handoff** (#1982, comment on 2026-10-30): Claude Code is the accountable engineering executor/coordinator; **the founder remains sole release decision-maker**; Writer's Studio first; other lanes are **orient-and-hold** until the founder names them; **Claude Code cannot be the independent Class A/R20 reviewer of its own work.** (Implication: the audio-integration design and any native plugin need an **independent** reviewer; these notes are not one.)

**Proposals from the report — Claude's assessment (none adopted until the founder says so):**
1. **Name sound helpers explicitly as eligible** (musicians, composers, performers, producers, sound engineers, facilitators of listening) — ✅ agree; matches the founder's direction; **needs a fund-policy decision** because the fund is described to contributors as supporting emerging practitioners.
2. **A direct "invitation to receive," separate from a request for help** — ✅ agree; same fund and admin system, no hardship statement; "willingness to receive is enough" matches Stewardship Model §8.
3. **Membership stands independently of public sharing** — ✅ agree; **ADOPTED AS DIRECTION by the founder 2026-11-06 ("yes") — direction only, not wording or build authorisation.** **Five rules:** accepting support requires no recording, testimonial, promotion or introduction; declining an "In their own words" card does not void the invitation; withdrawing a public listing does not cancel support; future contributions of money, music, knowledge or time stay freely chosen; private use gets the same respect as any member's.
4. **Say what is offered:** the access, the period, and how continuation is considered, with a quiet conversation before anything changes; **"full access" is too imprecise** until defined; **renewal must never depend on promotion or how often their music appears** — ✅ agree.
5. **"Helper" — partly agree.** "Helping the helpers" can stay a **public expression of Soullab's purpose** (it is Soullab speaking about itself); but **labelling an individual performer** "helper" on their card or in their invitation is still theirs to choose — **performers describe themselves.** (This refines, not removes, the earlier Invariant 14 note.)
6. **Funding must match what contributors were told** — ✅ agree; extending the fund to invited sound helpers is **an explicit policy decision.**

**Founder decisions this opens:** (a) performer access = Sponsored Access? funded by Sustainers or by Soullab? (b) confirm shelves are never gated by tier; (c) reword "support them."

## 3d. A "Coming soon" teaser — conditions and copy (founder idea 2026-11-06; Claude's proposal, NOT decided, nothing built)

**Read against `MARKETING_CLAIM_DISCIPLINE.md` and `CLAIM_STATE_AUTHORITY.md`:** a teaser is an **outward statement about tomorrow.** Today this feature is **Vision/Designed at most — not Live** (the Listening Room is on hold; nothing is built). *"We do not tell tomorrow's story as if it were today's."* Kelly **decides what Soullab chooses to claim; the evidence limits the highest state** it may occupy. So a teaser is lawful if it (1) declares its layer honestly, (2) names its center of gravity, (3) survives the Failure Test — **"strip the Designed and Vision layers; does the story survive?"** A teaser *is* a Designed/Vision statement, so it must **say** it is not open — never imply it is.

**Conditions:**
1. **Where:** only **inside the Listening Room, once the room itself is admitted** (today `/listen` is disabled — nothing could be seen). Not on public marketing without a separate, Kelly-authorised representational act with the layer declared.
2. **Honest label.** ⚠️ **"Soon" implies a time we cannot evidence.** Recommended label: **"In preparation"** (alts: *"Not open yet"*, *"Opening later"*). If you prefer **"Coming soon"**, that is your call — but it should wait until a build is **authorised and scheduled**, or it outruns the engineering state. **No date, no countdown.**
3. **Name no performer, show no performer image or thumbnail** — naming real people in promotion goes beyond a card with credit and is a **counsel item** (companion §3, "use in marketing needs permission").
4. **Stewardship tone:** no urgency, scarcity, countdown, "be first," waitlist, sign-up capture or counts (STEWARDSHIP_MODEL §10). Calm; non-interactive; a **non-link row** like Writer's Studio's honest *"later"* destinations (the pattern `assertStudioMapHonest()` enforces).
5. **Promise nothing undecided:** no mention of access, payment, Helper Fund, consent claims that Tier 1 doesn't carry, or mixes.
6. **Feel:** the room's existing visual voice — **navy field, never purple** (house brand); quiet, a single soft sound-line motif; **respects reduced-motion**; passes contrast and screen-reader checks.

**Copy options (room voice — short, human; none says more than is true):**
- **A** — *Listen to someone.* **In preparation.** *A shelf for the people behind the sound — each one credited, each linked to where they share their work.*
- **B** — **Not open yet.** *Soon we'd like to point you toward the people making the music you hear here.* ⚠️ "Soon" — see condition 2.
- **C** — *The people behind the sound.* **Opening later.** *Credit, a link back, and a quiet place to listen.*

**Recommendation: A.** It states the state first, makes only the credit-and-link promise the design actually guarantees, and has no clock.

> ✅ **ADOPTED AS DIRECTION by the founder 2026-11-06 ("Yes, copy A"): label "In preparation," copy A.** Direction only — **not authorised to build or show**, and **not before the room is admitted.** If "Coming soon" is wanted later, that is a new founder decision once a build is authorised and scheduled.

## 4. The card (anatomy)

- Performer name, credited as they credit themselves.
- One or two sentences in **Soullab's own words** (never copied platform descriptions).
- "Listen on" row: link-outs to whichever platforms they are on.
- One **click-to-load** embed. Disclosure line: "Playing this loads YouTube / Spotify / Tidal."
- **"Where to find more of their work"** link (their own site / Bandcamp / tip page) where one exists — plain, never a nudge (reworded 2026-11-06 per the Stewardship Model's tone rules, §3c).
- Removed-or-unavailable state that fails gracefully.
- No cover art or text lifted from a platform without a licence; a platform-supplied thumbnail only where that platform's terms allow it.

## 5. Rules (inherited, restated)

1. **Rights registry first.** One row per performer before the card exists: name, source URLs, platform embed status checked, date checked, who added it, tier. Streaming-provider metadata is never a licence.
2. **One audio authority.** Playback honours the AUDIO-PLATFORM-01 contract: member-initiated start/stop, no autoplay, no auto-restart after interruption, no overlap with MAIA speech or recording, no microphone use. Radio / "up next" / related-video behaviour switched off or the embed not used. Where a provider cannot be paused by our controls, it opens in the provider's app instead.
3. **Never embedded as ambience.** Previews, clips or embeds are never used as background sound or looped behind MAIA. Reference recordings from the Atlas study stay un-embedded and in a separate category.
4. **No extraction.** No downloading, re-hosting, re-streaming through our player, or API use to repackage audio.
5. **Third-party disclosure.** Loading a provider's player is member-initiated and labelled; YouTube via the no-cookie domain.
6. **No claims.** Soullab makes no therapeutic, physiological or spiritual-effect claim about any piece. Where a tradition or performer describes healing or meditative purpose, that is recorded **as their account, attributed** — not as ours (`MARKETING_CLAIM_DISCIPLINE.md`).
7. **Invariant 14.** Traditions and lineages are presented in their practitioners' own terms. Soullab does not translate them into Elemental vocabulary or treat them as raw material. Sacred or lineage-held music is featured only with its keepers' participation (Tier 2), never as a Tier 1 spotlight.
8. **Sovereignty.** Nothing tells a listener what they should feel. No ranking, play counts, "top performers", streaks or badges.

## 6. Education layer — "Listening Notes"

The community-building half. Short, Soullab-authored, optional companions to a card:

- What to listen *for*: texture, space, duration, how a piece unfolds (descriptive acoustics, not outcomes).
- Where the music comes from: tradition, instruments, context — attributed, sourced, and in practitioners' own terms.
- A gentle way to listen (headphones, a quiet room, no goal) offered as an invitation, not an instruction.
- Performers may contribute their own note (Tier 2) — their words, their framing.

Each note's factual claims are checked against a primary or scholarly source before publication. The Atlas's unverified-secondhand rule applies.

## 7. Member community — held

Members sharing recommendations and gathering around listening is the aim, but the mechanism is **not designed here** and nothing is authorised:

- Member suggestions, if allowed, enter a **review queue** and the same rights-registry step; they never publish directly.
- No status economy, leaderboards or contribution counts (the failure mode recorded for the legacy Commons).
- Shared-listening rooms or discussion would belong with the Circles / Interest Commons work, which is on its own hold; this note does not depend on it and does not reopen it.
- Interim shape if wanted sooner: curated cards plus Listening Notes only, with a "suggest a performer" form that goes to the founder.

## 8. Fit with the existing Studio

Participation model unchanged (Receive · Shape · Make · Study/Offer). Featured Performers sit under **Study/Offer**; Listening Notes inform **Receive**. No new app, player or release train. Hold lifts are not touched.

## 8a. Soullab Mixes — proposal

**Idea (founder, a working DJ):** Soullab-curated DJ mixes of the featured artists, with every artist and title listed as on YouTube. Named human DJ/signer: Kelly Nezat.

**The rights fact that shapes it:** a mix is a *new recording* that copies and combines other artists' recordings. A tracklist credits the artists; it is **not a licence**. Posting a mix to YouTube or SoundCloud commonly draws automatic claims (audio muted, blocked, or revenue taken by rights holders) regardless of tracklist. Hosting mix files ourselves would be distributing copies and needs every rights holder's clearance. *General knowledge, not legal advice; platform terms below are unverified.*

**Three routes, in order of preference:**

1. **Publish on a DJ-mix-licensed platform (Mixcloud) and link to it from the Listening Room; embed only if Mixcloud agrees in writing.** *(Revised 2026-11-06 after reading Mixcloud's terms — see §8b: the standard widget licence is non-commercial.)* Believed to hold licences and pay royalties to artists, display tracklists, and stream without downloads; believed to offer a controllable player API. **Unverified:** current licensing terms, sequencing limits, embed terms, pause control, iOS behaviour. Fits Tier 1: artists are credited and paid through the platform, and Soullab hosts no copy.
2. **A curated set as an ordered playlist** (Spotify / YouTube) with Soullab's per-track notes. No blends or crossfades, no new recording; lowest risk.
3. **A mix hosted by Soullab, only with cleared material:** tracks from performers who have granted permission (Tier 2), or music licensed for commercial use (Creative Commons *non-commercial* licences likely do not cover Soullab). Each track enters the rights registry with its licence before the mix is made.

**Card for a Soullab Mix:** title; "Mixed by Kelly Nezat"; full tracklist, each artist credited and linked to their own platform; a Listening Note in Soullab's words (what to listen for, how the set unfolds — no effect or healing claims); click-to-load embed with third-party disclosure; nothing autoplays; the mix is a rights-registry entry with its own signer and next-check date.

**Rules carried over:** one audio authority (member-initiated, no autoplay, no overlap with MAIA speech or recording, no restart after interruption); human judgment closes every piece (named DJ + signer); no therapeutic or physiological claims; traditions presented in practitioners' own terms and sacred or lineage-held music not mixed without its keepers; no downloading or extraction of any platform's audio to make a mix without a clearance route above.

**Tier 2 link:** a mix is a natural reason for a performer to opt in; a featured performer may contribute a track or a note to a Soullab Mix.

**Preconditions before any build:** read Mixcloud's (or the chosen platform's) current licensing and embed terms from the primary source; confirm whether artist consent is needed for the chosen route; optional short counsel check; confirm the player can be paused by Studio controls.

**Open for the founder:** which route first (1 recommended); where the mix is published and under whose account; whether mixes are Tier 1 only until a performer opts in.

## 8b. Primary-source terms read 2026-11-06 (preconditions, part 1)

Read from the platforms' own developer pages this session (fetched and searched, not summarised from memory). Page versions as served on 2026-11-06; terms change, so this is a dated reading, **not legal advice and not a licence review by counsel.** The iOS pause-control test (part 2) has **not** been run.

**YouTube (IFrame API, Required Minimum Functionality, Developer Policies)**
- Pause control exists: `pauseVideo()`, `getPlayerState()`, state-change events. Errors `100` (removed/private) and `101`/`150` (owner disallows embedding) are detectable, so the graceful "no longer available" state is buildable.
- Prohibited: modifying or blocking any part of the player; overlays or frames in front of, or obscuring, any part of the player or its controls; separating or isolating audio from video; features that play from a background player. → No audio-only mode, no background play, no visual cover over the player. A click-to-load facade is fine **before** the player is shown; it must not sit on top of a loaded player.
- Autoplay: we do not autoplay. Thumbnails that start playback must be at least 120×70 px.
- ⚠️ **Correction to an earlier statement:** YouTube states a playback counts toward a video's official view count **only if started via the player's own native play button.** If our facade starts playback by script (`playVideo()`), that play may not count for the artist. For the "every play counts for them" claim to hold, the member should press the player's own play button.
- ⚠️ **iOS/Capacitor precondition:** in a WebView the `HTTP Referer` is empty by default and the app must supply its identity (iOS: `loadHTMLString:baseURL:` or a Referer header), otherwise embeds can error (code `153`). Must be tested in the app.
- Ads: sponsorship/advertising sold on a page containing YouTube content has conditions — confirm with counsel that a membership product is outside them.

**Spotify (Embed docs, Widget Terms v2.0 of 2014, Developer Terms v10 of 2025)**
- iFrame API: `createController`, `loadUri`, `togglePlay`, `resume` (starts playback if not started), and a `playback_update` event with position. A dedicated `pause()` method was **not seen** in the sections read; `togglePlay` plus `playback_update` may suffice. **Unconfirmed — verify.**
- Widget Terms: show the widget unaltered; do not obfuscate it (banners or otherwise); no editing/modifying; no local caching; no download/save; no synchronising recordings with visual media (so no visualiser/video overlay); widgets only on a website you control. Whether an app WebView loading our site counts as "a website you control" is a point for counsel.
- Developer Terms: Spotify content must not be used to train or be ingested into AI models — consistent with the Atlas rule.
- Logged-out listeners get previews, not full tracks (embed docs summary; behaviour in the iOS WebView untested).

**Mixcloud (Widget API doc, Terms of Use)**
- Widget API supports `play()`, `pause()`, `togglePlay()`, `getIsPaused()` and `play/pause/ended/error` events. The widget must be visible for the API to work.
- ⚠️ **Material finding:** Mixcloud's Terms of Use license embedding widgets "on your personal website, blog or social network profile pages for **non-commercial and private use only**," and prohibit embedding or exploiting widgets for commercial gain. A Soullab product is likely outside that licence **unless Mixcloud agrees in writing.** Hence Route 1 is revised to **link out**, with embed only by written agreement.
- Mixcloud permits uploading collections of recordings "previously released to the public with the permission of the applicable copyright owners." The claim that Mixcloud holds licences and pays artist royalties was **not confirmed from the pages read** and remains unverified.

**Rights registry (sub-question):** the repo contains no registry implementation. "LISTEN-01 rights registry (#1979 item 4)" appears only in the Atlas charter draft and this note, so it is a planned item in the owner issue, not code. Recommendation: use that one registry as the single home (one canonical record, no sibling), and add the fields in §5 rule 1 to it. #1979 itself was not re-read this session.

**Still owed before any build:** (a) pause/play behaviour of the YouTube and Spotify embeds inside the Capacitor iOS WebView, including the YouTube Referer and Spotify logged-out behaviour — needs a throwaway test page and a simulator or device run, not yet done; (b) counsel on the points in §9 Q4 plus the Spotify "website you control" and YouTube sponsorship questions above.

## 8c. iOS playback test — result of 2026-11-06 (preconditions, part 2 — PARTLY discharged)

**What was run:** a throwaway page (kept outside the repo, scratchpad `embed-test/index.html`, served on localhost and since stopped) loaded in **mobile Safari on an iPhone 17 Pro simulator (iOS 26.x Safari engine)**, with click-to-load, the platforms' own control APIs, and an event log. Nothing was added to the repository.

**Observed:**
- **YouTube — PASS in Safari.** The video used as the example (a Riccardo Roveda performance) is embeddable. The player loaded only on click; playback started from the **player's own play button** (states `unstarted → buffering → playing`); `pauseVideo()` moved it to `paused` and `getPlayerState()` confirmed it. Re-run with the page's referrer policy set to `no-referrer` (an approximation of an empty-Referer WebView): the player still loaded and played, **no error 153**.
- **Spotify — PASS in Safari.** The iFrame API loaded; the controller exposes `pause`, `resume`, `togglePlay`, `seek`, `loadUri`, `destroy`, and `playback_update` events (position once per second, `isPaused`). Pressing the embed's play started playback; `pause()` produced `paused=true` at the same position within about 15 ms. **This resolves the earlier "no dedicated pause method seen" doubt.** Logged out, the embed shows a **Preview** label and, after a preview, a "Listen to these tracks & millions more on Spotify / Get Spotify" panel — as expected, full tracks need a Spotify login.

**What this does NOT show (still owed):**
- This was **Safari, not the Capacitor WebView.** The app's page origin is not `http://localhost`, and the `no-referrer` meta tag only approximates an empty Referer. YouTube's requirement to supply the app's identity in a WebView (error 153 if missing) is therefore **untested in the real container.** The check must be repeated inside the Capacitor iOS build.
- Real-world interruption behaviour (phone call, audio-route change, backgrounding, lock screen) was not exercised. YouTube/Spotify behaviour when the page is hidden is **unknown**; the audio contract needs "no restart after interruption."
- Spotify logged-in (full-track) behaviour in the WebView is untested; so is Tidal (link-out only for now, so not needed).
- One playback observation is Safari-simulator audio, not a device; no listening judgment was made.

**Resulting preconditions before any build:** (1) repeat this test inside the Capacitor iOS app with the real origin, including the YouTube Referer handling; (2) add an interruption check (background / lock / incoming call); (3) counsel (see §8b). The pause-control question for YouTube and Spotify is answered **yes in Safari**.

## 8d. In-app (Capacitor WebView) test — result of 2026-11-06 — ⚠️ YouTube embed FAILS in the app as built

**What was run:** an isolated minimal Capacitor 8 app (same major version as the repo: `@capacitor/* ^8`), created **outside the repository**, with the same default iOS scheme (page origin `capacitor://localhost`), built for the iPhone 17 Pro simulator and loaded with the same throwaway test page. It is **not the MAIA app**; it reproduces the WebView and origin only. Nothing in the repository was touched.

**YouTube — FAIL.** Every load of the player showed **"Video player configuration error — Error 153"** (the page's `onError` also reported 153 = missing Referer / client identity). The same video plays and pauses correctly in Safari (§8c), so the cause is the container's origin (`capacitor://localhost`, not an HTTPS app identity), not the video. Tried: YouTube's `widget_referrer` player parameter set to an `https://` app-ID URL — **did not fix it.** The fix YouTube documents (set `Referer` to `https://<bundle id>` via the WebView's base URL or an HTTP header) is **not available to a Capacitor page loaded from its own scheme.**
- **Consequence:** as the app is built today, an embedded YouTube player **will not play**. The Safari result in §8c does not carry over to the app.
- **Detectable:** the player reports error 153 through its API, so the card can fall back automatically to a "Watch on YouTube" link-out instead of showing a broken box.
- **Candidate fixes — NOT TRIED, each needs its own decision:** (1) serve a small embed page from Soullab's own HTTPS origin and show it in an iframe inside the app, so the embed's Referer is an HTTPS origin; (2) a native WebView (custom Capacitor plugin) that loads the player with an HTTPS `baseURL`; (3) **link-out only for YouTube in the app, embeds on web** — no new code beyond the fallback. Option 3 is the smallest unit. Options 1–2 are a new surface and would need testing on a **device**.

**Founder direction 2026-11-06: option (2) (native WebView with an HTTPS base URL) is preferred for in-app YouTube.** Direction only — **not build authorisation.** Obligations it carries, to be answered in a design before any code: (a) it is a **new native plugin** in the iOS app (registration in `packageClassList`, Info.plist/ATS review, App Store review exposure) and is a change under the iOS pipeline owner, not a Listening Room-only change; (b) **one audio authority** — a second WKWebView playing audio sits outside `AudioSessionManager`/`VoiceController` unless it is explicitly brought under them (member-initiated start/stop, no overlap with MAIA speech or recording, no restart after interruption, pause on app background); (c) the HTTPS identity it presents must be the app's registered bundle ID in reverse-DNS form per YouTube's Referer-format rule; (d) the fallback (error 153 → "Watch on YouTube" link-out) ships regardless, so the card never shows a broken player; (e) must be proven on a **real device** before it is relied on. Suggested first step: prove the idea in the isolated scratch app (outside the repository) that a WebView loaded with an HTTPS base URL clears error 153, before any plugin design.

**Spotify — PASS in the app.** The iFrame API loaded under `capacitor://localhost`; the controller exposes `pause`, `resume`, `togglePlay`, `play`, `seek`, `destroy`; after pressing the embed's play, position advanced second by second and `pause()` produced `paused=true` at the next tick (about 14 ms). Logged out it is a **Preview** only; full tracks need a Spotify login (untested in the WebView).

**Still not tested:** a real device; interruptions (call, lock, backgrounding, route change); Spotify logged-in; the real MAIA app's own page origin and CSP.

**Candidates shared by the founder 2026-11-06 (not entries — no sign-off, no registry row, no performer contacted).** Each returned HTTP OK from YouTube's public oEmbed endpoint the same day, which is a **positive sign of embeddability, not a licence or a guarantee**:
- *A Neoclassical Electronic Alchemy | Riccardo Roveda Live Piano e Synth Concert at BASE Milano Pt.2* — Riccardo Roveda (`zqDVsH8Li48`; plays in Safari, fails in the app per above).
- *Howl - Chill Electronic Live Session* — Jai Cuzco (`WjPUgEDQ4yE`, shared with a start time; not yet played in this test).
- *music for overthinkers | felt piano & cello for deep focus* — OTIUM (`EZeW4Sfy8CE`; shared as a radio-mix link — a card would use the single video only, and ⚠️ the title's "for deep focus / overthinkers" framing is the uploader's, not a claim Soullab makes).

## 8e. Prototype of option (2) — native player with an HTTPS base URL — result of 2026-11-06 — ✅ PROOF OF CONCEPT, simulator only

**What was run:** in the same isolated scratch Capacitor 8 app (outside the repository), a small prototype Capacitor plugin presented a native `WKWebView` over the page, loaded with `loadHTMLString(html, baseURL: https://<bundle id>)` (the form YouTube documents) and the YouTube IFrame player inside it. The page controlled it through the plugin (`load`, `pause`, `state`, `close`) and received the player's events.

**Observed (iPhone 17 Pro simulator):**
- The player **loaded with no error 153** — the same video that failed in the app's own WebView (§8d). Reported base URL: `https://life.soullab.embedtest`.
- Playback started from the **player's own play button** (`unstarted → buffering → playing`). The page's `pause()` call produced `paused` within about 3 ms; `state()` reported `2`; `close()` removed the player. Events flowed back to the page.
- Spotify continues to work in the app's own WebView (§8d), so only YouTube needs the native path.

**What the prototype proves:** the documented HTTPS-identity fix works inside a Capacitor shell, and the control surface the audio contract needs (member-started playback, pause on command, state readout, teardown) is available through it.

**What it does NOT prove:** (a) a **real device** — simulator only; (b) **one-audio-authority integration** — this overlay is outside `AudioSessionManager`/`VoiceController`, so overlap with MAIA speech, interruptions, and background pause are untested and unbuilt; (c) the real MAIA app — the plugin was added to a throwaway app, not to `ios/` in the repo; (d) layout — the overlay was a fixed rectangle, not tied to scroll position; (e) App Store review exposure of a custom plugin.

**Two traps found building it (worth knowing before the real work):**
- The standard Capacitor 8 iOS template's `SceneDelegate` builds `CAPBridgeViewController()` directly and **ignores the storyboard's custom-class setting**; a custom bridge view controller (needed to register a plugin instance) takes effect only if `SceneDelegate` instantiates it. The storyboard-only change silently did nothing ("Unknown class … in Interface Builder file" in the log).
- The build was also run with Xcode's debug-dylib feature off (`ENABLE_DEBUG_DYLIB=NO`) at the same time as the fix; **it is unverified whether that setting was needed.**

**Resulting state:** option (2) is **technically viable** and cheap to prototype; moving it into the real app is a separate decision with the obligations in §8d, and still needs a real-device test.

## 8f. Real-device test (iPhone 16 Pro Max, iOS 18.x) — result of 2026-11-06 — ✅ core behaviour confirmed; ⚠️ interruption behaviour NOT attributed

**What was run:** the same throwaway scratch app (outside the repository, signed with the founder's development team, installed on the founder's iPhone and driven by the founder's taps), with the page's log mirrored to the device console and captured by the Mac. Evidence classes below are kept apart.

**Console-witnessed (the app's own log, read by Claude):**
- **In-page YouTube player in the app's WebView: FAIL on hardware** — `YT onError 153 = missing Referer / client identity`, at origin `capacitor://localhost`. §8d is now confirmed on a real device, not only the simulator.
- **Native player with HTTPS base URL: PASS on hardware** — `load()` returned `baseURL https://life.soullab.embedtest`; `ready`; `unstarted → buffering → playing`; player-initiated `paused → buffering → playing`; **page-initiated `pause()` followed immediately by `paused`**; a later `paused` with no `pause()` call recorded; `close()` completed.
- Plugin registration confirmed (`YTNative` in the page's plugin list; native log lines `capacitorDidLoad`/`registered`).

**Founder-reported (not independently observable by Claude):** the video played with sound and the founder's summary after the interruption steps was "all works." The founder's earlier screenshots showed the player visibly playing.

**NOT attributed — recorded as unknown, not as pass:** the founder ran the lock-screen, go-home and Siri/notification steps, but the console carries no marker for them, and it shows **one `paused` state with no matching `pause()` call** shortly before `close()`. That pause may have been the founder pressing the player's own pause, or an iOS/WebKit pause on lock/background — **the log alone cannot tell which**, and the founder's one-line report does not say whether audio kept playing or stopped during each step. ⛔ So the interruption behaviour (does it stop on lock/background, does it restart afterwards, does it overlap a Siri response) is **still unestablished.** To close it: repeat with a spoken note per step, or add native lifecycle logging (`willResignActive`, `didEnterBackground`, audio-session interruption notifications) to the prototype.

**Founder report added after the above (lock screen), 2026-11-06:** *"audio stopped on lockscreen with option to play."* So on lock the audio **stopped**, and iOS showed a **lock-screen play control** for it. This is the founder's observation (not in the console log). It attributes the unexplained `paused` to the lock step, **probably** — the log still carries no marker, so it is recorded as the likely cause, not proven. Two consequences for the audio contract: (1) audio does **not** keep playing in the background — consistent with the "no playback outside the app" intent; (2) the **lock-screen play control is a second way to restart playback from outside the app's own UI.** A member pressing it is a member-initiated start, so it does not by itself breach the contract, but it **could start audio while MAIA is speaking or recording** unless the integration (b) in §8d is built. Home-screen and Siri/notification behaviour remain **unreported**.

**Re-run with native lifecycle logging, 2026-11-06 (console-witnessed, timestamps from the device):**
- 13:33:31 `playing` → 13:33:34.780 `willResignActive` → .782 `didEnterBackground` → .944 `deviceLocking` → **.948 player state `paused (2)`** — with **no `pause()` call from the page.** The pause arrived within about 170 ms of the lock, so **iOS paused the video on lock**; this attributes the earlier unexplained `paused` and matches the founder's report that audio stopped with a lock-screen play control.
- 13:33:49 `deviceUnlocked`, 13:33:50 `willEnterForeground`, 13:33:51 `didBecomeActive` → the player **stayed paused after unlock** (it did not restart on its own); it returned to `buffering → playing` at 13:33:58, about 7 s after the app became active, consistent with the founder pressing play. **No automatic restart after the interruption** on the lock path.
- **No `audioInterruption` and no second background/foreground cycle were logged**, so the **home-screen and Siri/notification steps are not captured** — either they were not run in that session or they produced no events. They remain **unestablished**.

**Home-screen step, same session (console-witnessed):** 13:35:19.9 `playing` → 13:35:25.9 `willResignActive` → 13:35:27.19 `didEnterBackground` → **13:35:27.32 player `paused (2)`**, with no `pause()` call and no `deviceLocking` → so **iOS also pauses the player when the app goes to the background.** `willEnterForeground`/`didBecomeActive` at 13:35:38; `buffering → playing` at 13:35:40.2–.5, **about 2 s after the app became active.** Whether that was the founder pressing play or an automatic resume **cannot be told from the log** (the lock case showed a 7 s gap, consistent with a manual press); asked of the founder, not assumed.
**Siri step:** **no event of any kind was logged after 13:35:40.5** — no `willResignActive`, no `audioInterruption`, no player state change. So either Siri was not invoked while the player was playing, or Siri did not interrupt the player at all. **Siri behaviour remains unestablished; if Siri ran while it was playing, the log suggests the video kept playing under her, which is the overlap the audio contract forbids** — to be confirmed by the founder's ear, not inferred.

**Founder's one-line report on the interruption steps, 2026-11-06:** *"sound starts and stops easily."* Recorded verbatim. Read as: the audio stops readily when interrupted and starts readily when the member presses play. ⚠️ **It does not say what the video did while Siri answered, nor whether the post-home restart was a manual press** — those two points stay **unattributed**, and the Siri/overlap question is therefore **still open** rather than passed.

**Standing after this test:** option (2) is **demonstrated on real hardware for the core path** (loads, member-started playback, page-controlled pause, state readout, teardown). It is **not** demonstrated for the audio contract's interruption rules, for integration with `AudioSessionManager`/`VoiceController`, for the real MAIA app, or for App Store review. ⛔ Nothing here is build authorisation.

**Account/housekeeping (corrected 2026-11-06):** the scratch app was installed on the founder's phone and **has since been uninstalled.** ⚠️ **Correction:** I earlier said signing it registered the app ID `life.soullab.embedtest` in the founder's Apple developer account. **That was wrong** — the founder's Identifiers page shows only `life.soullab.maia`, `life.soullab.r20founderpresence` and the **"XC Wildcard" (`*`)** ID; Xcode signed the scratch app under the existing wildcard, so **no new identifier was created and nothing needs removing.** (Any development provisioning profile Xcode cached for the wildcard is unchanged and not part of this work.) The scratch project is under the session scratchpad, not in the repository.

## 9. Open questions for the founder

1. ~~First version Tier 1 only, or Tier 1 plus the invitation to Tier 2 from day one?~~ **Answered by the founder 2026-11-06: Tier 1 plus the invitation to Tier 2 from day one.** This is a direction for the draft, not build authorisation; the invitation wording, how a performer is reached, and who sends it remain open (and no performer is contacted until a separate founder act).
2. ~~Who curates and signs off each entry (named person)~~ **Answered by the founder 2026-11-06: Kelly Nezat is the named signer for the first release. Claude/JARVIS prepares only, and never signs.** Preparation = platform links, embed-permitted check with date, draft card, draft Listening Note. The signer confirms, in the registry row: (a) embed permitted on the date checked; (b) no healing/effect claims and no partnership implication; (c) tradition-based music presented in practitioners' own terms, and sacred or lineage-held music not featured as a Spotlight; (d) every factual claim in a Listening Note checked against a primary or scholarly source. Tier 2 additionally requires the performer's grant on file. Each entry carries a next-check date; a failing entry is hidden, not left broken. Delegation to a co-curator is a later, separate founder act. *Still open:* whether the registry is the LISTEN-01 one or a sibling.
3. ~~Which platforms are in scope for the first release~~ **Answered by the founder 2026-11-06: embed YouTube and Spotify only; Tidal, Apple Music, Bandcamp, SoundCloud and the performer's own site are link-outs.** Bandcamp gets a prominent "where to find more of their work" link (originally worded "support them"; reworded 2026-11-06) rather than an embed. Rationale: each embed adds a third-party player, a disclosure line, iOS testing and a re-check duty, and YouTube/Spotify have documented player controls (believed to support pause; **unverified**). Tidal is a link-out until its embed terms and pause support are read from the primary source. Any platform may be promoted to embed later after verification. **Precondition before build:** read the YouTube and Spotify embed/developer terms from the primary source and test pause control in the iOS web view; Spotify falls back to opening the app when login is unavailable.
4. ~~Is a brief counsel check on embedding acceptable before launch?~~ **Answered by the founder 2026-11-06: yes — a short, scoped counsel check before launch** (not required to finish the design). Suggested scope: (a) embedding YouTube/Spotify in the member-facing app for the jurisdictions members are in; (b) whether the Mixcloud route for Soullab Mixes needs anything from Soullab beyond the platform's terms; (c) wording of the Tier 2 invitation and one-time grant; (d) whether the "featured" credit wording could read as endorsement. Direction only; no counsel engaged by this document.
5. ~~Is "suggest a performer" in scope for the first release or held until Circles?~~ **Answered by the founder 2026-11-06: in the first release as a minimal private form — a member sends a performer's name, a link and a sentence; it goes only to the signer (Kelly Nezat); nothing is displayed publicly or published automatically.** Rules: member-knowing act; only what the member sends is kept; not used for profiling; a suggestion becomes an entry only after the rights-registry step and the signer's sign-off. Public queues, discussion and member-visible sharing remain held until the Circles work. Direction only; not build authorisation.
6. Naming: ~~"Featured performers", "Listening Room", "Voices we love"~~ **Working name chosen by the founder 2026-11-06: "Listening Room"** (provisional until seen on a card). "Listening Lab" was considered and set aside: "Lab" already denotes the gated tester cohort in this product (`lib/access/labAccess.ts`, Field Lab, "Enter the Lab"). Credit line: "[Performer] · In the Listening Room." ⚠️ **Correction (2026-11-06):** the earlier claim "repo search found no existing feature of that name" was true only of the checkout searched. On the LISTEN branches **"Listening Room" is the name of the existing Sound Studio surface** (`app/listen/ListenRoom.tsx`) — so the shelves would be sections *of that room*, not a new product; see `LISTEN-01_LISTENING_ROOM_PERFORMER_AUDIO_INTEGRATION_DESIGN_DRAFT_2026-11-06.md` §1. Copy stays about listening, never about trying sounds to produce an effect.

## 10. Not authorised by this document

- Any code, component, route, migration, asset or audio file.
- Posting to #1979 / #1984, creating an issue or opening a PR.
- Contacting performers, labels, estates or lineage keepers.
- Any release, deploy, or lifting of source-admission, rights, security, device or production holds.
- Any claim about therapeutic, spiritual or cultural meaning of any piece.
