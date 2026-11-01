# WRITERS-STUDIO-SEMANTIC-FIELD-01 — Tester journey field (design note)

```
STATUS:     DESIGN NOTE for founder ruling. PROPOSED, not authorized.
OWNER:      SEMANTIC-FIELD-01 — the member arm of the MAIA-field witness
            (founder ruling 2026-11-01; witness protocol of the same date).
CANONICAL:  clean-main-no-secrets @ 853a21791 (census below cites that tree).
NOT:        Build, schema, route or copy authorization. No tester is contacted by this note.
```

## 1. Founder request

*"We should also query the writer beta testers on all of these important issues… can we have an
interactive digital field for them to return to and answer along their journey?"* (2026-11-01)

The founder-account witness measures what MAIA **can** do. Testers measure what writers **experience**.
The vision ("MAIA as the interactive field") needs both, and a member witness is the evidence class
claim discipline requires before anything is called live.

## 2. What exists (census at 853a21791)

- **`writer_studio_beta_feedback`** (migration `20260929000005`, SMALL-BETA-01 / B3): explicit,
  writer-authored rows only — `member_id`, optional `manuscript_id`, one of eight closed `signal`s
  (*I lost the thread · MAIA misunderstood me · Too much too quickly · I wanted more help · This felt
  like my voice · This changed how I see the Work · I'm not ready to decide · Something else*),
  `studio_mode`, bounded `orientation_context` (never prose), `note` ≤ 2000 chars. Table comment: *no
  passive session, dwell, engagement, manuscript-body or behavioral telemetry.*
- **`P4R1BetaFeedback`** membrane: opens only with `?beta=1` for members `beta-access` says are
  eligible; one signal + note per submission. A writer cannot see or revise what they sent.
- **`/api/sovereign/writers-studio/beta-feedback`** (write) and a learning report
  (`lib/constellation/learningReportServer.ts`) that counts submissions and distinct contributors per
  signal.
- **Mail is not a dependable invitation channel**: the non-delivery register records the production
  Resend key as invalid (E1, witnessed 2026-10-01). Re-check before relying on email.

So the substrate already embodies the right law (explicit only); what's missing is *return*, *a thread of
questions* and *the writer owning their own answers*.

## 3. Proposal

A **journey field** inside Writer's Studio: a quiet, always-reachable place where a beta writer finds a
small number of open questions about their experience, answers when they want, returns later, sees and
revises their own answers, or withdraws them.

### 3.1 Questions ("prompts")

- A prompt is a short question in plain language, optionally with a few closed choices plus free text.
  Prompts are authored by Soullab, versioned, and released in small waves; a writer sees the prompts
  released so far, never a backlog wall.
- **First wave = the five witness verbs, asked as experience, not capability:**
  1. *When you asked MAIA to change something in your own words, did what came back feel like your
     writing?*
  2. *Could you ask MAIA to take you somewhere in your book — and did she?*
  3. *Did MAIA help you understand something about your writing that you didn't before?*
  4. *When you weren't sure how to do something in the Studio, did you ask MAIA? What happened?*
  5. *Where did you get stuck, or stop, or feel you had to learn the machine instead of write?*
- The eight existing B3 signals remain as quick, in-the-moment notes; prompts are the reflective
  thread. Both live in the same field so the writer has one place.

### 3.2 Writer custody

- **Theirs to see**: every answer and note they've given, newest first.
- **Theirs to change**: revise an answer (the revision is recorded as a new version; the earlier
  one is kept for the writer, ⛔ not silently overwritten) or **withdraw** it (excluded from every
  report from then on).
- **Optional context**: attaching "which Work / which place" is the writer's choice per answer,
  using the existing bounded `orientation_context` — ⛔ never manuscript prose, ⛔ never automatic.

### 3.3 What Soullab sees

- Answers the writer chose to give, in their words, with counts per prompt and per choice.
- ⛔ No reading of manuscripts, MAIA conversations or sessions for research. ⛔ No dwell, click,
  engagement or completion-rate tracking. ⛔ No ranking or scoring of writers.

### 3.4 Placement

- One entry in Writer's Studio, visible only to eligible beta writers, e.g. a "Beta journey" item in
  the existing Preferences/menu area, plus a gentle link from the existing beta feedback membrane.
- ⛔ **Separate from MAIA.** MAIA does not ask for feedback in conversation, nudge writers to answer,
  or read their answers. A companion that also collects research blurs consent and invites
  dependency (MAIA Oath; Sovereignty Invariants). The field is plainly Soullab asking, in Soullab's
  voice.
- ⛔ **Self-hosted only.** Not a claude.ai artifact, not an external form service. This is member data
  about their creative life.

### 3.5 Consent and copy (draft)

> **Beta journey** — Questions from the Soullab team about how the Studio is working for you. Answer
> any, skip any, come back anytime. You can see, change or withdraw what you've said. We read only
> what you write here — never your manuscript or your conversations with MAIA.

Answering is never required for access. Not answering carries no consequence and is never reminded
more than once per wave.

### 3.6 Invitation

In-Studio first (a single quiet notice when a new wave is released). Personal outreach by the
founder is fine. Email only once E1 is resolved and witnessed.

## 4. Data shape (sketch only — ⛔ not a migration)

Additive and separate from B3's table, so B3's law and counts stay untouched:
`writer_studio_journey_prompts` (id, wave, text, choices, released_at, retired_at) and
`writer_studio_journey_answers` (id, member_id, prompt_id, choice, text ≤ 2000, optional bounded
orientation, version, supersedes, withdrawn_at, created_at), append-only with withdrawal as a fact,
never a delete — unless the writer erases their account, which cascades. Any migration goes through
Review Custody like every other.

## 5. Questions for the founder

1. **Placement**: inside Writer's Studio as proposed (recommended), or a separate member page?
2. **First wave**: the five experience questions in §3.1 — accept, or edit?
3. **Who sees answers**: founder only (recommended for the beta), or also named team members?
4. **Attribution**: answers identified to the writer (needed to follow up, and for their own custody
   view) — confirm, with an explicit line in the consent copy?

## 6. Not authorized by this note

Implementation · schema · routes · copy changes · contacting testers · any MAIA involvement in
collecting feedback · telemetry of any kind.
