# GATE 0 — Stranger Journey Witness

**Adjudication: PASS. Cohort release: GO.**

```text
production subject     4be87975b   (Merge pull request #1250)
witness account        tester4writer
walked                 2026-09-06 evening EDT / 2026-09-07 UTC
founder intervention   NONE
```

The first end-to-end production witness that a genuinely new invited member can
traverse the whole path — invite link to developmental reading — without founder
intervention, without a shortcut, and without anything being repaired mid-walk.

**Subject discipline.** The witness binds to the *deployed runtime* `4be87975b`,
not to canonical. Nothing here transfers to a later runtime without a fresh walk.

> **THREE SUBJECTS.** Production moved twice more. The runtime the cohort
> actually met is `e535e6246` (#1256, PDF-CLEAN), where P0 and acts 1, 2, 6a and
> 6b were re-witnessed under a bracketed walk. Acts 3–5 and 7 remain bound to
> `4be87975b`. See §7 and §9 before citing any act.

---

## 1 · Why this gate existed

The bounded Founder Pilot needed one question answered before a cohort arrived:

> Can a NON-FOUNDER writer safely complete the bounded pilot journey on production?

An earlier attempt failed at the first door. A stranger opening a valid team
invite in a clean session was redirected to `/signin?next=/team/general` and
could never register. `app/team/layout.tsx` wrapped every `/team` child including
`invite/[token]`, contradicting `config/accessMatrix.ts:461`, which already
declared that route public. Two authorities disagreed and the silent one won.

PR #1250 repaired it by route-layout separation — the authenticated TeamShell
routes moved under `app/team/(shell)/`, the invite page stayed outside it. No
middleware change, no access-matrix change, no auth exception.

This document witnesses the journey **after** that repair reached production.

---

## 2 · The acts, as observed

First observed outcome is the evidence. No retries through failures, no URL
shortcuts, no account patching.

```text
1  invite URL reachable unauthenticated   PASS
2  /team/general still guarded            PASS
3  create account                         PASS
4  membership in the invited Co-Lab       PASS
   default landing                        FAIL   non-blocking, see §4
5  Writer's Studio reachable              PASS
6a Work created and opens                 PASS
6b section navigation exact               PASS
7  DEVELOP returns a reading              PASS
```

### Act 1 — invite reachable without a session

Settled objectively from the terminal, with no browser state involved:

```text
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  https://soullab.life/team/invite/2700739a...

200
```

`200`, no redirect, on a request carrying no session at all. Before the repair the
same request produced `/signin?next=/team/general`.

Confirmed again in a Safari Private window, which rendered the unauthenticated
branch of `InviteAcceptClient` — both *Sign in to accept* and *New to Soullab?
Create account*.

**A prior Chrome Incognito attempt showed the authenticated branch and was
discarded, not counted.** Chrome shares one incognito session across windows; an
earlier signed-in incognito window was still open. That observation proves
nothing and is recorded here only so the discarded evidence is visible.

### Act 2 — the surrounding boundary is intact

```text
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  https://soullab.life/team/general

307 https://soullab.life/signin?next=%2Fteam%2Fgeneral&reason=no_session_cookie&rid=...
```

The refusal carries `reason=no_session_cookie` and a request id — the **middleware**
shape, not the layout's bare redirect. So `/team/general` is guarded at the
middleware layer independently of `(shell)`. #1250 did not merely open the public
door; the authenticated boundary around it is enforced by a mechanism the route
move did not touch.

The build manifest independently shows every `/team` URL preserved: `/team`,
`/team/[channelSlug]`, `/team/admin`, `/team/decisions`, `/team/dm/[dmId]`,
`/team/for-you`, `/team/invite/[token]`, `/team/notifications`. The `(shell)`
route group contributed nothing to any path.

### Act 3 — account created

Registration form completed in the Safari Private window. Account `tester4writer`
created; session established; landed in a Co-Lab.

### Act 4 — membership correct, landing wrong

The invite was consumed and bound:

```text
email        hello@soullab.life
accepted     t
team_id      9058a852-5e8d-4588-898f-d95a4d99323a
accepted_by  tester4writer
```

Under COLAB-BETA-01 (#1245 §G) the new-account path is *account → membership
observed → invite consumed*. A consumed invite is therefore itself evidence the
join succeeded, not merely that a team id resolved.

Team membership, read directly:

```text
9058a852-5e8d-4588-898f-d95a4d99323a  Writer's Studio Beta Group  member
abd41a6d-fb7f-4a7a-b359-3c2a70d1dc47  Tester's Co-Lab             owner
```

The invited membership exists with the correct role. The Writer's Studio Co-Lab
was reachable through the workspace switcher, showing `TEAM · 6` and `#General`.

**The FAIL:** the session's *current* team resolved to the auto-created personal
Co-Lab rather than the invited one. See §4.

### Act 5 — Writer's Studio reachable

`/writers-studio` rendered for a brand-new, non-founder, free-tier member —
"Begin your work" with *Begin a new work* / *Import writing*. No bounce, no tier
wall. `config/accessMatrix.ts` maps the route `minTier: 'free'`; production
behaviour matched the declaration.

### Act 6 — import, and navigation

**6a.** *Import writing* accepted a short document. The NAV-01 confirmation step
appeared and behaved: **4 sections detected** from the document's own headings,
each row showing its depth (`H1` / `H2`) with `cut` and `merge ↑` available. This
is WS2-08A `heading_depth` surfacing in a real member gesture. Saved; landed in
the Writer Canvas with the draft on the table — 4 sections, 120 words.

**6b.** Clicking outline rows moved the editor to each exact section, with the
active row highlighted.

This is a materially useful result beyond the gate. The inert 262-row outline
observed earlier on the founder's own manuscript did **not** reproduce for a Work
imported through the current path. That manuscript predates the NAV-01 confirm
step. WRITE navigation is therefore a **legacy-Work** problem, not a general one,
and not a cohort blocker.

### Act 7 — DEVELOP returned a reading

Preserved with care, because the distinction between *DEVELOP responded* and
*DEVELOP returned a grounded reading* is the whole point of the surface.

```text
lens        Development — how the work develops across what was read
read        Sep 6 at 8:37 PM · version 1
coverage    MAIA read 4 of 4 sections in full
provenance  DEVELOPMENTAL-READER-04 · <model id as displayed> ·
            classified by DEVELOPMENTAL-PHENOMENON-04
state       CURRENT — the parts of the work this rests on are as they were
            when MAIA read them
returned    6 observations
```

*(The provenance line names a model identifier in the runtime. It is deliberately
not transcribed here; repo artifacts do not carry model identifiers.)*

Each observation carried, structurally:

- a claim grounded in what was read, not a summary;
- **RESTS ON** — named sections with character ranges *as read*
  (e.g. `Section 3 · "Chapter Two: What the Morning Showed", characters 38–166 as read`);
- **DOES NOT ESTABLISH** — explicit evidentiary limits, among them
  `author intent`, `reader effect`, `editorial consequence`, `across unread span`,
  `whole work pattern`, `chronology`.

Observation `O1` noticed that the collective travelling party of the opening is
introduced in section 1 and does not recur in sections 2–4, resting that on four
named character ranges — and stated that it does not establish why the author did
or omitted anything.

That is the non-degradation posture holding under a live, ordinary member: it
named what it could stand behind, refused to guess intent, and volunteered its
own coverage limits unprompted.

### Incidental — P0 containment under an ordinary member

No **Keep / Dismiss / Unresolved** controls rendered on the tester's own reading.
The BUILD-07F standing surface stayed absent for a member who is not the founder,
on a runtime where `WS_STANDING_ENABLED` is unset. This is observation of the UI
state only; it is not a re-run of the P0 witness, which was closed separately on
`bcc371094` and carried forward by ancestry to `4be87975b` with both
`GIT_COMMIT` and `WS_STANDING_ENABLED` re-read on the recreated container.

---

## 3 · What this witness does NOT establish

- It does not establish that a **book-length** Work completes the journey. The
  subject was 120 words across 4 sections, chosen deliberately to test navigation
  rather than the `DEVELOPMENTAL_READ_CEILING_CODE_POINTS = 60_000` per-pass
  bound. Whole-work orchestration (BUILD-07G) remains open.
- It does not establish that the **legacy** inert-outline manuscript navigates.
  It establishes that a Work imported through the current path does.
- It does not establish that invite **email delivery** works. It does not; see §5.
- It does not re-establish P0 containment. That closure stands on its own record.
- It says nothing about any runtime other than `4be87975b`.

---

## 4 · The FAIL, classified

```text
DEFAULT LANDING          FAIL
classification           NON-BLOCKING · COHORT INSTRUCTION REQUIRED
```

A newly registered invitee lands in an auto-created personal Co-Lab ("«Name»'s
Co-Lab", `TEAM · 1`, no channels) rather than the Co-Lab they were invited to.

It does not invalidate Gate 0: the invited membership exists with the correct
role, and the correct workspace is reachable in one click through the switcher.

It is nonetheless a real product defect, and a first-impression one. A tester who
does not know about the switcher will conclude the invitation failed. **The cohort
must be told.**

Suspected mechanism: `ensureOwnCoLab` creates a personal team at registration and
`resolveCurrentTeamId` prefers it — plausibly preferring an owned team over a
joined one. The `impersonation-routes` / `ensureOwnCoLab` test failure previously
filed as pre-existing noise very likely points at this same behaviour and should
no longer be treated as unrelated.

Not repaired tonight. Recorded for its own lane.

---

## 5 · Cohort instructions (release notes, not repairs)

```text
1. After registration
   switch workspace → Writer's Studio Beta Group
   (click the workspace name, top-left)

2. Invite delivery
   hand-deliver links
   Resend transactional email is unavailable

3. Manuscript upload has a known intermittent failure.
   If an upload errors before the manuscript opens, try it again.
   The failure occurs before the upload is processed, so the failed attempt
   does not create a partial Work. If it fails repeatedly, stop and report it.
```

Instruction 3 is worded to the evidence: a retry **can** succeed, not that a retry
**will**. See the ingest defect in §6.

On (2): production logs the refusal truthfully and does not swallow it —

```text
[MAIA/email] FAILED  purpose=invite:team  provider=resend
  error: 'You have reached your monthly email sending quota.'
[MAIA/email] TRANSPORT_DOWN kind=quota_exceeded providerCode=monthly_quota_exceeded
  — email delivery is failing for ALL recipients.
[team/invite] invite email REFUSED
```

Invite **tokens** do not depend on delivery once issued; they are valid and
hand-deliverable. Note the wider consequence: while the quota is exhausted,
every email-dependent recovery path is unavailable, passkey recovery included.

---

## 6 · Residuals

Named, placed, and deliberately not repaired tonight.

```text
default-team resolution   ensureOwnCoLab / resolveCurrentTeamId prefers owned team
Resend quota              OPERATIONAL CONDITION, not an architectural defect
                          all transactional mail down, incl. account recovery
TRANSPORT_DOWN / quota_exceeded pages nobody                OPEN
duplicate member row      two "Kelly" rows in the Writer's Studio roster
maia_member_id trust      parked security inquiry — both getSessionMemberId helpers
                          accept the cookie after a bare existence check
F-CTX                     OPEN · contained, not repaired
BUILD-07F                 OPEN · not resumed
BUILD-07G                 OPEN · whole-work DEVELOP orchestration
```

### Ingest response-body defect — status changed

```text
previous status     PARKED   (draft route only)
                    docs/programme/PARKED_DEFECT_MANUSCRIPT_DRAFT_ROUTE_
                    RESPONSE_BODY_2026-09-06.md
new evidence        reproduces on manuscript ingest
behavior            INTERMITTENT
failure point       before application ingest code executes
security shortcut   NOT ACCEPTABLE
pilot impact        REAL / NON-BLOCKING WITH INSTRUCTION
repair tonight      NO
```

```text
⨯ TypeError: Response body object should not be disturbed or locked
    at l.fromNodeNextRequest
    at M (…/app/api/sovereign/manuscripts/ingest/route.js)
```

Mechanism, per the #1244 triage: the middleware matcher matches, Next buffers the
body for middleware and rebuilds the Request from an already-consumed stream — so
it throws **before any application code runs**. Same shape as
`/api/voice/transcribe-simple`, documented in `middleware.ts`.

This is materially different from yesterday's parking. It is no longer a curiosity
because it sits directly in the cohort's first meaningful Writer's Studio act.
Observed three times on one founder import, then succeeded on the same file with
nothing changed. **Zero** throws during the `tester4writer` walk.

**The obvious fix is not acceptable.** Dropping the path from the middleware
matcher worked for `transcribe-simple` because no `accessMatrix` rule covered it.
`/api/sovereign` **is** covered (`minTier: 'free'`), so the same exclusion would
strip access enforcement from a member-data write path to fix a parsing bug. An
intermittent retryable upload error is a far better failure mode than a weakened
authorization boundary. No emergency middleware change.

### Provenance-neutrality gap — deploy tooling

An environment or key rotation must not be able to select a different application
image merely because the `:prod` tag moved. Tonight it did (§7). That is a gap in
the deploy tooling, distinct from the operator error that exposed it, and it
belongs to its own lane.

### Observed, not adjudicated

```text
daa70150-c07e-4bd6-9004-03ac97b8d8f0   120 sections   additional Work
```

Recorded as observed. **No cleanup belongs inside this acceptance lane**, and it is
not deleted, because it has not been positively identified as accidental.

### Closed by re-import, not by repair

The founder's 262-section manuscript — filed earlier in this record as a "legacy
inert outline" — was re-imported as `.md` on `e4ac1bcac` and is navigable:
`manuscriptId 55742458-…`, 262 sections, 62,933 words, section 110 clicked and the
editor moved to it with its prose. The inert outline was a property of the **old
import**, not of the Work or of Writer's Studio. Remedy: re-import. No code repair
was required and none was made.

### Email delivery residuals

Two residuals here must survive the pilot, and they are not the same kind of
thing as the quota itself.

**1 · Delivery state must be explicit**

```text
invite_created
email_delivered
email_refused
```

The current defect is that the member-facing surface can report **"sent"** after
the invite exists even when the transport provider has refused delivery. The
server logged the refusal truthfully; the UI did not carry it. That is an
observability defect, and it converted a straightforward quota exhaustion into an
hour-long diagnosis on the night before a cohort.

**2 · Transport resilience remains an architectural question**

If fallback delivery is adopted, it should live behind the shared mail
abstraction with declared transport and failure semantics — **not** as an
invite-specific alternate path. A second transport wired into one route buys
delivery at the cost of two possible causes for every future failure.

The Resend quota itself is the current **operational condition**, not the
architectural defect. It is fixed on the provider account; these two are fixed in
the codebase, after the pilot is safely underway.

---

## 7 · Two subjects — the walk, the drift, and the live re-witness

```text
ORIGINAL GATE-0 WALK
runtime        4be87975b
Acts 1–7       observed
result         PASS / GO

SUBSEQUENT UNPLANNED RUNTIME ADVANCE
runtime        e4ac1bcac
cause          container recreate adopted newer prod-tagged image
relationship   strict descendant of 4be87975b

LIVE-RUNTIME RE-WITNESS
P0             re-witnessed
Acts 1–2       re-witnessed
Acts 6a–6b     re-witnessed, because NAV-03 changes the relevant behaviour

Acts 3–5, 7    not re-run; original observations remain bound to 4be87975b
```

### How the drift happened

A Resend API key rotation required recreating the containers reading
`.env.production`. The recreate was issued as a plain compose
`up -d --no-build --force-recreate`, **outside the deploy lane**. That command
adopts whatever image currently carries the `maia-sovereign:prod` tag. Between the
walk and the rotation that tag had been rebuilt at `e4ac1bca` — #1251, NAV-03 — by
a parallel session. Production therefore moved forward a commit silently, with no
asserted SHA and no provenance verify.

Two secondary faults in the same command, recorded so they are not repeated:

- `--no-deps` was omitted, so the recreate cascaded and restarted `maia-postgres`,
  the production database. Data lives in a volume; nothing was lost; it returned
  healthy before the app containers started. It was still an unnecessary restart
  of the most consequential container on the host.
- An env-file rotation should be provenance-neutral. This one was not. The deploy
  lane exists to make that impossible, and it was worked around.

**This is an assistant error, not a founder act.** No deploy was authorized. The
one deploy attempted that evening was correctly refused by the immutable-SHA
validator (`'e4ac1bcacssh' does not resolve to a commit — refusing`) after two
commands ran together on one line. The tooling gap it exposed is filed separately
in §6.

### What the live runtime contains

```text
e4ac1bca   #1251 NAV-03
37337761   NAV-03 R2 — initial-load race
87cd311e   NAV-03 R1 — exists race
3da109e6   NAV-03 — tell the Canvas when Worktable creates the draft
4be87975   ← the original walk's runtime, contained
```

`4be87975` (this witness), `37cb209e` (#1250 invite repair) and `bcc37109` (P0
containment) are all ancestors of `e4ac1bca`. The running system is a strict
superset. `WS_STANDING_ENABLED` remains `unset` on the recreated container.

### Re-witnessed on `e4ac1bcac`

**Provenance and containment**

```text
GIT_COMMIT             e4ac1bcac
WS_STANDING_ENABLED    unset
```

**Acts 1–2 — the door, unauthenticated**

```text
invite   200            no redirect
team     307 → /signin  reason=no_session_cookie
```

**Acts 6a–6b — as `tester4writer`, an ordinary cohort member**

Scoped deliberately to NAV-03's blast radius: draft creation and section
navigation. No DEVELOP, no membership retest, no account creation.

```text
6a  ingest attempts   1
    confirm-cuts      PASS   "3 sections detected" — First / Middle / Last
    Canvas opens      PASS   opened on First
    section count     3

6b  first row         exact
    middle row        exact
    last row          exact
```

Each row moved the editor to the matching heading **and** the matching section
text.

**Store-side corroboration**, so the section count is not a screenshot claim:

```text
b606009f-827d-4efa-af18-cd1a91280a75   "Act 6 Live Runtime RewitnessI"
                                        3 sections · 2026-09-07 01:55:28Z
[MAIA/press] manuscript saved  memberRef 23ee389a38b5 · sections: 3
                               custody: source_custodied
ingest throws in the walk's window     0
```

The `memberRef` differs from the founder's (`88099bb1977c`), confirming the Work
was created by the cohort subject and not by the founder account. Zero server-side
throws corroborates "attempts: 1" independently of what the browser showed.

The original walk's Work is visible in the same query at `00:35:11Z`
(`b39f7de6…`, 4 sections) — the two subjects separated in the data itself.

### Why act 6 was re-observed rather than inherited

NAV-03 changes exactly the draft-creation and refresh behaviour act 6 exercises.
Inheriting it by ancestry would have said "an ancestor passed" where this lane has
been careful to distinguish **code inclusion** from **observed behaviour**. A
founder-account import on the same runtime was available and was deliberately
**not** accepted as sufficient: the live re-witness was scoped to an ordinary
cohort member, and switching subjects at the exact point a new intermittent ingest
failure had appeared would have weakened the record where it most needed
precision.

### Ruling on the drift

The cohort gate is **not** reopened. Acts 3–5 and 7 remain bound to `4be87975b`
and are **not** relabelled as witnessed on `e4ac1bcac`; their results remain
useful evidence, and the record says exactly where they were observed. Everything
NAV-03 could plausibly have disturbed was re-observed on the live runtime.

---

## 8 · Ruling

```text
GATE 0                  PASS
walk runtime            4be87975b   acts 1–7 observed
second runtime          e4ac1bcac   P0 + acts 1, 2, 6a, 6b re-observed
COHORT RUNTIME          e535e6246   P0 + acts 1, 2, 6a, 6b re-observed, bracketed
witness                 tester4writer
cohort release          GO

critical path           invite → account → invited Co-Lab → Writer's Studio
                        → Work → section navigation → DEVELOP reading

result                  PASS end-to-end
founder intervention    NONE
P0 containment          observed absent under an ordinary member
```

The cohort gate has passed on `4be87975b` and everything NAV-03 could have
disturbed has been re-observed on `e4ac1bcac` by an ordinary cohort member. The
remaining issues already have names and places to go. This does not become another
repair cycle.

Three cohort instructions (§5) go out with the invitations. Nothing else is owed
before the pilot.

---

## 9 · Addendum — the runtime the cohort met

Written the morning of the pilot. The record above was merged naming `e4ac1bcac`
as the live subject. Production moved twice more before the cohort arrived, and
the last move changed code that act 6 exercises. This section names what was
actually witnessed on the runtime the four testers met.

### Production moved four times between the merge and the cohort

```text
e4ac1bcac   #1251 NAV-03                     the subject §7 names
cca4568bd   #1253 ingest transport multipart middleware + ingest route
4a5bf8ff9   #1254 mail abuse containment     rate limiter, recover, send-verification
e535e6246   #1256 PDF-CLEAN                  parseUpload PDF branch  ← COHORT RUNTIME
```

**None of the four was announced to this lane.** Each was discovered by running
the provenance check the founder's own morning rule prescribes. The rule earned
its keep: without it the cohort would have walked an unwitnessed subject twice
over.

`#1254` is the one legitimate exception — abuse containment, which overrides a
freeze. Its fault was not the deploy; it was that no notification accompanied it.
That distinction is the residual, not the deploy.

### The bracket, not the hold

A production hold was drafted for every deployment-capable lane. It could not be
broadcast from either assistant's context, and — more to the point — **a hold
cannot be verified**. Every one of the four moves would have been made by someone
who would have agreed to it.

What made this witness valid is therefore not a promise beforehand but a **SHA
read on both sides of the walk**:

```text
opening bracket   e535e6246
   ... act 6a · act 6b · custody query ...
closing bracket   e535e6246
```

Both reads match, so the walk is bound to one subject and no drift occurred
inside it. Had they differed, the walk would have been invalidated whole rather
than salvaged. This is the durable lesson: *a hold is coordination; a bracket is
evidence.*

### Re-witnessed on `e535e6246`

```text
provenance             GIT_COMMIT = e535e6246
containment            WS_STANDING_ENABLED = unset
ACT 1  invite          200, no redirect
ACT 2  /team/general   307 → /signin
```

**Acts 6a / 6b**, as `tester4writer`, an ordinary cohort member:

```text
6a  ingest attempts   1
    confirm-cuts      "3 sections detected" — Chapter First / Middle / Last
    Canvas opens      after Save manuscript
    section count     3

6b  first             exact
    middle            exact
    last              exact
```

The subject was deliberately a **PDF**, not markdown or pasted text, because
#1256 changes only the PDF extraction branch. A markdown import would have
satisfied the rule while exercising unchanged code.

### PDF-CLEAN is production-proved, not merely merged

The witness PDF was built adversarially: three pages, with the author's own
literal `-- 2 of 3 --` written on page 2 — the same shape pdf-parse synthesises.
Verified as appearing exactly once in the source before import.

```text
 original_filename                  | extraction_method | extractor_version | m1 | m2 | m3
------------------------------------+-------------------+-------------------+----+----+----
 WS-e535e6246-PDF-CLEAN-WITNESS.pdf | pdf-parse-getText | pdf-parse@2.4.5   |  0 |  1 |  0
```

```text
m1 = 0   pdf-parse's synthetic "-- 1 of 3 --" never entered custody
m3 = 0   nor "-- 3 of 3 --"
m2 = 1   the AUTHOR'S line survived, exactly once
```

`m2 = 1` is the harder half and the reason the per-marker form was used instead of
an aggregate count. A total of `1` cannot distinguish *"synthetics gone, author's
line kept"* from *"author's line destroyed, one synthetic survived"* — and a fix
that stripped too much would be a worse defect than the one it replaced, silently
editing an author's text while appearing to succeed. The commit's own invariant —
**never remove page-marker-looking text after extraction** — exists to prevent
exactly that, and these three numbers are the proof it held in production.

The middle section's rendered body carried the same line, so the display layer and
the custody record agree independently.

`extraction_method = pdf-parse-getText` confirms the PDF path ran; a `.md` import
with a coincidental line would have read `utf8-decode` and been discarded.

### Chain of custody for this addendum

Stated because it is weaker than §7's and should not be read as equal.

The browser walk was driven by a separate assistant lane; the brackets and the
psql row were **relayed** to the adjudicating lane rather than executed by it.
The founder performed the password rotation and every keyboard act. The two lanes
were deliberately kept apart: the lane driving the browser did not adjudicate its
own result, and reported observations without pass/fail labels.

```text
observed by     a separate lane, relayed as raw output
ruled by        this lane, on that relayed output
NOT             read directly by the adjudicating lane's own tools
```

### Ruling

```text
COHORT RUNTIME     e535e6246
brackets           HELD
P0 containment     PASS
Acts 1, 2, 6a, 6b  RE-OBSERVED on the cohort runtime
Acts 3–5, 7        remain bound to 4be87975b
PDF-CLEAN          PRODUCTION-PROVED
GATE 0             PASS · GO
```

Canonical has since advanced beyond `e535e6246`. That is expected and permitted:
**canonical may move; production must not** — until the founder releases the
cohort freeze.
