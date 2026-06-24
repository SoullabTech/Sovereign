# SESSION DATA ARCHITECTURE — connection trace (read-only)

**Date**: 2026-06-10
**Type**: Verification/investigation only — *no code changed, no PR, no build.* Read-only static trace + read-only aggregate DB queries (no PII).
**Question**: Why is Prepare Me empty? What is the canonical "a session happened with a client" record, and where is the disconnect?
**Companions**: [`PREPARE_ME_VERIFICATION_2026-06-10.md`](./PREPARE_ME_VERIFICATION_2026-06-10.md), [`PRACTITIONER_ADOPTION_ROADMAP.md`](./PRACTITIONER_ADOPTION_ROADMAP.md).

---

## Constitutional principle for the relational surface (#408) — canon-candidate

> **Relationship Memory succeeds when continuity becomes easier to carry and harder to lose, while the practitioner remains the owner of the thread.**

Everything in the #408 (`RELATIONSHIP_MEMORY_V1`) spec is downstream of that sentence. The inversion it encodes:

- Most software asks *"how do we help the user remember?"* → accumulation → more retrieval → more synthesis → **dependence on the system.**
- #408 at its best asks *"how do we help the practitioner **remain the rememberer**?"* → stewardship → recall-when-needed → clearer continuity → **practitioner ownership; less burden without less responsibility.**

**Ownership is a constitutional principle, not a mechanism.** Exportability is a *mechanism* — a system can satisfy exportability and still violate ownership (if practitioners gradually can't carry continuity without Studio); and different export mechanisms can all satisfy ownership. So the real test is not schema-shaped:

> *After six months of Relationship Memory, is the practitioner **more** capable of holding the relationship, or less?*

**This is why #407 and #408 prove differently:**
- **#407** proof = a single observed event — *Team A cannot see Team B.* Pass/fail, once.
- **#408** proof = a **pattern witnessed over time** — *the practitioner returns to the same person and experiences continuity **without** experiencing dependence.* Not *"the memory appeared"* but *"the relationship became easier to carry while ownership stayed with the practitioner."*

Consequence: **#408's proof is lagging — it cannot be certified at ship time by any artifact.** Its "gate" is therefore not a pre-merge event but: the design makes dependence structurally unlikely + early signal points toward ownership → ship as an **instrumented hypothesis with a standing willingness to reverse** if the six-month pattern shows capture instead of stewardship.

The **same-client-twice moment** is the crossing: the first time the system is asked to carry continuity, and simultaneously the first time it can accidentally start *owning* it. That is where the sovereignty claim stops being philosophy and becomes observable reality.

### Governance toolkit for stewardship features (generalizes beyond #408 — canon-candidate)

Some features **cannot be certified at ship time** — stewardship-oriented ones (Relationship Memory is the archetype). There's no completion condition (*tests pass / migration succeeds / users can do the task = done*), because the thing being judged — *what dependence the feature creates* — is only visible in the trajectory. At launch you can establish only three things; everything beyond belongs to time:
1. **The constitution is sound** — ownership preserved, exit possible, dependence not structurally required.
2. **The implementation is faithful** — the code does what the constitution permits, doesn't obviously violate the boundary.
3. **The hypothesis is observable** — you have a way to notice if reality disagrees.

**Five governance questions (most orgs stop at the third):**

| Question | Type |
|---|---|
| Can it be built? | Engineering |
| Should it be built? | Constitutional |
| Did it work? | Verification |
| What did it teach people to depend on? | **Stewardship** |
| What kind of relationship formed around it? | **Observation** |

> **Verification tells you whether the system functions. Observation tells you what the system is teaching.**

A feature can succeed *operationally* while failing *constitutionally*. The launch event tells you whether continuity exists; the six-month trajectory tells you *who owns it*. **Governance rule:** if observation ever shows practitioners becoming *less* able to carry their relationships without Studio, the **constitutional layer gets the deciding vote over the implementation layer — no matter how successful the feature appears.**

**Two preconditions that give it teeth (else it's rhetoric):**
- (a) the **reversal path is built before launch** — you cannot retrofit the willingness or the mechanism to deprecate a popular-but-capturing feature; the dependence it created is exactly what makes it un-killable. The exit must exist before anyone needs it.
- (b) the **stewardship/observation questions are answered by someone structurally separate from the builder** (who reads "used = success") — the same proposer/approver split, extended past launch.

(#407 = primarily a Verification problem; #408 = ultimately an Observation problem.)

**The canon-grade sentence (apex — everything above follows from it):**
> **A constitutional principle has authority only if it can overrule a successful implementation.**

Collapse mode it prevents: *"the feature is too successful to change"* — at which point the **feature has become sovereign instead of the constitution.** A sovereignty claim becomes credible not when a feature *fails* (anyone can remove a failure) but when a feature **succeeds**: *"this worked exactly as designed, people love it, adoption is growing — and we should still change or remove it."*

Five-layer hierarchy:

| Layer | Question |
|---|---|
| Constitution | What must remain true? |
| Engineering | Can we build it faithfully? |
| Verification | Does it function? |
| Observation | What relationship is forming? |
| **Stewardship** | **Are we willing to reverse success?** |

**Self-referential note:** this principle is only *proven when first exercised.* Until the constitution has actually overruled something successful at least once, it is written, not real. So it needs its own observation discipline — **keep a ledger of constitutional vetoes**; those instances are the evidence the sovereignty claim is credible. Zero over time is ambiguous (either nothing crossed the line, or the layer has no teeth) — distinguishable only by observation. The governance principle is held to the same *witnessed-not-asserted* standard as the features it governs.

So #408 ships not as a feature, nor merely as a hypothesis, but as **a hypothesis with a constitutional boundary + an observation plan + a reversal path + a governance structure empowered to act on what observation reveals.** Launch is not the end of evaluation; it is the beginning of the most important evaluation.

---

## Headline

Your "connection deficit, not feature deficit" thesis is **confirmed** — and sharpened. There are **two disconnects at two layers**, plus a **usage reality** that reframes priority:

1. **Booking layer** — the code path is *sound* (creation writes `sessions`; the Studio home reads `sessions`), but the flow is **effectively unused**.
2. **Session-history layer** — a **real connection deficit**: the brief's source table is **orphaned**, and the bridge columns that would connect it are **0% populated**.
3. **Usage reality** — this is **early-beta / near-zero throughput** data, not a mature system with a plumbing bug. *Connecting the plumbing today would reveal near-empty data.*

→ The honest root cause is **compound**: a connection deficit **and** a pre-adoption usage deficit. One explains all three symptoms (empty Prepare Me · anonymous session history · weak review continuity).

---

## Trace 1 — future bookings (where does a booking land?)

**Answer: `sessions` (canonical). No plumbing disconnect.** Creation paths all write `sessions`: `/api/portal/[slug]/book`, chat `lib/portal/bookingTools.ts`, `/api/studio/sessions` POST. The Studio home reads the same table (`/api/studio/bookings` GET → `sessions WHERE scheduled_start >= NOW()`). A new future booking *would* appear as `nextBooking`. (One isolated path, `rl_sessions`, doesn't integrate — not relevant.)

**But the flow is dormant/unused (DB, read-only):**
- `sessions`: 32 total — **24 cancelled, 8 scheduled**, all **in the past** (max `scheduled_start` = 2026-05-07); **none created since 2026-04-11 (~2 months)**.
- `calendar_events`: 13 total, **0 future**.

**Verdict**: Not a wiring problem — an **adoption/usage** problem. The real open question is *why no one is booking future sessions* (is the booking entry point surfaced/reachable? are these dev/test artifacts? do practitioners book offline?).

---

## Trace 2 — the canonical session record

**Four session-ish tables:**

| Table | Rows | Purpose | Client link | Practitioner link | Writers (live) |
|---|---|---|---|---|---|
| `sessions` | 32 | Booking ledger (canonical for scheduling) | `client_id`→practitioner_clients | `practitioner_id`→practitioners | portal/chat/studio booking |
| `practitioner_sessions` | **0** | **Brief/continuity source** (briefing, my-chart, sessionPrep all READ it) | `client_id` | `practitioner_id`→members | **voice-note-draft writeback ONLY** |
| `practice_sessions` | 0 | Solo learning (anonymous `client_alias`) | none | optional | orphaned, no live writer |
| `scribe_sessions` | 69 | Session Room recordings | none (member-keyed; client only in optional `participants` JSONB) | `member_id`→members | `/api/scribe/start`+`stop` |

**The orphan**: `practitioner_sessions` is what every continuity reader points at — and it is written **only** by the optional voice-note-draft path (`writebackStudioSession`). Neither booking-completion (`sessions`) nor Session-Room-end (`scribe_sessions`) writes through to it. Empirically: **0 rows**, despite 32 bookings + 69 recordings.

**The bridges exist but carry zero current** (read-only DB):
- `scribe_sessions.booking_id` populated: **0 / 69**
- `sessions.scribe_session_id` populated: **0 / 32**
- `practitioner_sessions.studio_session_id`: moot (table empty)

The migrations `20260212000001_sessions_scribe_link.sql` and `20260207300001_studio_session_writeback.sql` *added* the link/write-through columns — but nothing populates them in the live flows.

**Canonical verdict: (B) write-through intended but never built**, + (C) parallel evolution. The intended canonical record is `practitioner_sessions`; it was orphaned.

---

## Usage reality (the correction to my own earlier lean)

I earlier leaned toward *"69 rows of real session data exist — just connect them."* The container breakdown corrects that:

- `scribe_sessions` containers: **solo = 48, witness = 16, practitioner (with-client) = 5**, by **3 distinct members**.
- Only **5 of 69** recordings are client-mode; **none** are linked to a booking or carry first-class client identity.

So the client-session substance the brief would surface is **thin to nonexistent**, and Session Room is currently used mostly for **solo practice** by a handful of people. *Verify, don't assume latent richness.*

---

## Three symptoms, one compound root

- **Empty Prepare Me** ← no upcoming bookings **+** orphaned `practitioner_sessions`.
- **Anonymous session history** ← `scribe_sessions` is member-keyed, 0 booking/client links **+** only 5 client-mode recordings exist.
- **Weak review continuity** ← continuity layers read the empty `practitioner_sessions`.

---

## What this reframes (no build authorized)

The connection deficit is **real and worth fixing structurally** — but it is **premature as the top priority**, because the upstream activity is barely happening. Honest sequence (all investigation, not build):

1. **Is this early-beta/test data or a surfacing gap?** (24/32 bookings cancelled, 0 upcoming, 3 scribe users, 48/69 solo.) Determine whether real practitioners are *meant* to be booking + running client sessions now.
2. **If yes — why aren't they?** Is the booking entry point surfaced/reachable from Studio? That is the higher-leverage question than session-history plumbing.
3. **Only then**, decide the canonical-record fix: write-through into `practitioner_sessions` on session completion, *or* re-point the brief's readers at `sessions`+`scribe_sessions` directly. (Wiring it before usage exists would surface near-empty data and prove nothing.)

**The capability is revealed and wired. What's missing is usage first, connection second — not features.**

---

## Adoption-loop trial protocol (the decisive next step)

A clean guided trial answers in one run what static tracing cannot — *is the activation path broken, or was the empty data just beta/test residue?* Run it with **one real practitioner + one fresh, consented client** (fresh client = clean baseline; ignore the 24-cancelled historical noise).

**Governing criterion — three gates (each a different kind of failure):**
1. **Circulation — *can Studio remember?*** Does a real Session Room event link back to the booking/client and resurface in Prepare Me next time (steps 4 → 6)? The proof the loop is a living organism, not disconnected screens. Failure = **architectural**.
2. **Unaccompanied passage — *can Studio guide?*** Did the practitioner *find and complete* each step **without the builder beside them**? Every moment they reached for help is a **surfacing gap**, as load-bearing as a missing DB row. Failure = **design**. *Plumbing that only works when steered is not done.*
3. **Recognition — *can Studio accompany?*** Did the practitioner reach a moment of *"this was made for someone like me"*? This is **not** usability — they can complete every step and never feel it, or stumble and still feel it deeply. Failure = **product-market**. *The sneakiest outcome: it works, people can use it, nobody cares.*

Gates 1–2 can be **engineered** (fix the loop / surface the path). Gate 3 can only be **listened for** — so the posture shifts from *testing* to *listening*: capture the practitioner's **unprompted language**, never a yes/no. (At n=1 with a friendly tester, "yes, I felt recognized" is the easiest thing to fake; a spontaneous *moment* is not.)

Score each step below on the first two gates — the read-only probe (data flowed?) **and** "found it unassisted? y/n" — and capture verbatim language throughout for the third.

**Precondition — the gate (#402 add-client mobile fix):** MERGED to clean-main (HEAD `c15aabfdb`) **and DEPLOYED** to prod (container built 2026-06-11 12:51 UTC, ~9 min after the 12:42 commit) → live on web/PWA. Remaining manual step: **verify add-client on an actual device.** If "device" = native iOS app, confirm a TestFlight build carries #402 (the Docker deploy updates web/PWA only).

| # | Step | Checkpoint | Read-only probe (no PII) | Outcome decides |
|---|---|---|---|---|
| 1 | Add client | visible + reachable on device | `practitioner_clients` +1; row's `practitioner_id` in practitioners-space | not reachable → surface/repair add-client entry |
| 2 | Schedule a future session | practitioner can create a future booking from Studio | new `sessions` row: `scheduled_start` > now, `client_id` set + resolves to the new client; shows as `nextBooking` on `/studio` | can't self-schedule → surface the booking entry point |
| 3 | Prepare Me (before) | card mounts (nextBooking now exists) | `/studio` shows the booking; `SessionBriefingCard` renders (expect "first session, no history" — correct for a new client) | confirms the front of the loop circulates |
| 4 | Enter Session Room + capture | launch from the booking; record | new `scribe_sessions` row: `container='practitioner'`, **`booking_id` populated** (currently 0/69) | `booking_id` stays NULL → the booking↔recording link is the break |
| 5 | Review / complete session | review persists + attaches to client | does a `practitioner_sessions` row appear (write-through)? is it linked to `client_id`? | no row → **write-through is the fix** (Option B, confirmed live) |
| 6 | Prepare Me next time | schedule a 2nd session, same client | brief now shows session #1's last-session/themes | **the circulation proof** — if yes, the loop is whole |

**Three questions to ask afterward** (not "was it easy?" / "did it work?" / "what features?"):
- *At what moment did Studio become useful?* → identifies **value**.
- *At what moment did you feel lost?* → identifies **friction**.
- *At what moment did you feel this was designed for practitioners?* → identifies **recognition** (often the most important datum collected).

**Decision tree (by gate):**
- **Circulation fails** → **do not launch.** Architectural; nothing else matters until memory → preparation → sessions connect. *(Which fix: fails at steps 1–3 → surface entry points; fails at 4–5 → write-through `scribe`/session-completion → `practitioner_sessions`, or re-point the brief's readers.)*
- **Circulation passes, passage fails** → **launch later.** Design; the value exists but the path is obscured — surface it.
- **Circulation + passage pass, recognition fails** → the sneakiest. It works, people can use it, nobody cares. Re-examine **positioning, onboarding, language, where value becomes visible** — *not* features.
- **All three pass** → you're no longer validating software; you're **observing the formation of a practitioner field.** Stop adding features and **listen to the language practitioners use** to describe what Studio has become — that language is often truer than the founder's original story, and the first practitioners may name what Studio actually is before the team does.

**One clean trial → a verdict on all three gates.**

---

### Capturing the evidence (field notes, not summaries)

Recognition often **arrives before explanation** — felt before it can be said. So the richest signals are *behavioral and in-the-moment*, not post-interview. Capture in three buckets, in **descending confidence**:

1. **What they did** (observed behavior — hardest to fake): returned without prompting · added real clients · scheduled sessions · used Prepare Me · invited a colleague · used a feature they didn't expect to.
2. **What they said spontaneously** (unprompted, before politeness enters): *"oh, that's useful" · "that's exactly what I need before a session" · "wait, where did that come from?"*
3. **What they said when asked** (still useful, lower confidence — once they're answering, they're already interpreting for you).

**Fourth signal, beneath recognition — *adoption impulse*** (evaluation → ownership): *"Can I put my actual clients in here? · How many clients can I have? · Can I import my notes? · Can I use this with my next session?"* When these appear, they've stopped testing and started imagining a future with the tool. **Timestamp them.**

**Two timescales.** Circulation and passage resolve in the guided sitting. **Recognition, adoption impulse, and the strongest tell of all — unprompted return — need a window (days/weeks).** You cannot observe "I found myself coming back" in the trial itself. The trial is a *sitting + a watch.*

**Founder trap — listen for displacement, not validation.** Because Studio grew from your own practice, the pull is to hear the vision confirmed. Weight the opposite more heavily: *"I don't think this is what you think it is" · "the thing I value most isn't what you're talking about" · "I mostly use it for…"* Not contradictions — discoveries. The practitioner is naming the **true center of gravity**, which may differ from the designed one. (This is the project's own claim discipline at the product layer; and preserving *raw phrases over summaries* is the same **member-marked-over-system-inferred** sovereignty that governs MAIA's memory — don't let the founder's interpretation overwrite the practitioner's lived reality.)

**The question beneath the trial** is no longer *"Is Studio ready?"* but **"What relationship are practitioners forming with Studio?"** — relational, not technical. The answer arrives as patterns in behavior, language, return, trust, and ownership — not as a score. **Preserve verbatim practitioner phrases as raw field notes (no summaries, no interpretation).** Months from now, those phrases may be the clearest description of what Soullab Studio actually became.

---

### What recognition will *sound* like for Studio (center-of-gravity hypothesis)

For most products, adoption begins when people **save time.** For Studio it may begin when people **feel less alone holding their work** — so the recognition signal likely won't be efficiency language at all. Watch for **support language**:

> *"I felt more prepared." · "I felt more grounded." · "I didn't have to carry everything myself." · "I knew where to begin."*

These aren't software evaluations — they're descriptions of *support*. If they recur, **support / accompaniment — not productivity — is Studio's true center of gravity** (the platform's accompaniment thesis proving itself in practitioner language rather than our assertion). **Measurement consequence:** do **not** lead with efficiency questions or count "minutes saved" — measuring productivity would miss the actual value, and could read support *landing* as failure.

**Trust the convergence on the practitioners' words, not ours.** They may never use *continuity · practitioner field · relationship memory · elemental awareness*, and instead say *preparation · context · keeping track · remembering what matters · staying connected between sessions*. If enough converge on language different from the founder's, trust the convergence — not because the framing is wrong, but because **adoption happens in the user's language.** The framework vocabulary is scaffolding; their plain words are the building.

**The question, fully evolved:** the protocol began as *"Is Studio ready?"* and has become **"What kind of relationship does Studio invite?"** Readiness is a moment; relationship is a trajectory. If the first practitioners create clients, return voluntarily, revisit the same clients, and describe Studio as something they don't want to practice without — you'll have learned not whether a launch is ready, but **what Studio is becoming in the lives of the people it serves.**

*(Protocol mature — frozen here. Next input is the trial itself, not further refinement.)*
