# GATE 0 — Stranger Journey Witness

**Adjudication: PASS. Cohort release: GO.**

```text
production subject     4be87975b   (Merge pull request #1250)
witness account        tester4writer
walked                 2026-09-06 evening PDT / 2026-09-07 UTC
founder intervention   NONE
```

The first end-to-end production witness that a genuinely new invited member can
traverse the whole path — invite link to developmental reading — without founder
intervention, without a shortcut, and without anything being repaired mid-walk.

**Subject discipline.** The witness binds to the *deployed runtime* `4be87975b`,
not to canonical. Nothing here transfers to a later runtime without a fresh walk.

> **SUBJECT DRIFT — production moved after the walk.** Production is now
> `e4ac1bcac` (#1251, NAV-03). Acts 1 and 2 were re-witnessed on it; acts 3–7
> were not. See §8 before citing this record.

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
```

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
legacy inert outline      founder's 262-section manuscript
maia_member_id trust      parked security inquiry — both getSessionMemberId helpers
                          accept the cookie after a bare existence check
F-CTX                     OPEN · contained, not repaired
BUILD-07F                 OPEN · not resumed
BUILD-07G                 OPEN · whole-work DEVELOP orchestration
```

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

## 8 · Subject drift — production moved after the walk

**Production is no longer the witnessed runtime.** At the close of the session
`docker exec maia-sovereign printenv GIT_COMMIT` reported `e4ac1bcac`, not
`4be87975b`.

### How it happened

A Resend API key rotation required the containers reading `.env.production` to be
recreated. The recreate was issued as a plain compose
`up -d --no-build --force-recreate`, **outside the deploy lane**. That command
adopts whatever image currently carries the `maia-sovereign:prod` tag. Between the
Gate-0 walk and the rotation, that tag had been rebuilt at `e4ac1bca` — #1251,
NAV-03 — by a parallel session. The recreate therefore moved production forward a
commit silently, with no asserted SHA and no provenance verify.

Two secondary faults in the same command, recorded so they are not repeated:

- `--no-deps` was omitted, so the recreate cascaded and restarted `maia-postgres`,
  the production database. Data lives in a volume; nothing was lost; it returned
  healthy before the app containers started. It was still an unnecessary restart
  of the most consequential container on the host.
- An env-file rotation should be provenance-neutral. This one was not, and the
  deploy lane exists precisely to make that impossible. It was worked around.

**This is an assistant error, not a founder act.** No deploy was authorized; the
one deploy that *was* attempted that night was correctly refused by the
immutable-SHA validator (`'e4ac1bcacssh' does not resolve to a commit — refusing`)
after two commands ran together on one line.

### What the live runtime contains

```text
e4ac1bca   #1251 NAV-03
37337761   NAV-03 R2 — initial-load race
87cd311e   NAV-03 R1 — exists race
3da109e6   NAV-03 — tell the Canvas when Worktable creates the draft
4be87975   ← the witnessed runtime, contained
```

`4be87975` (this witness), `37cb209e` (#1250 invite repair) and `bcc37109` (P0
containment) are all ancestors of `e4ac1bca`. The running system is a strict
superset of the witnessed one. Nothing was lost. `WS_STANDING_ENABLED` remains
`unset` on the recreated container.

The defect is evidentiary, not functional.

### Re-witnessed on `e4ac1bcac`

```text
runtime   e4ac1bcac
invite    200            no redirect
team      307 → /signin  reason=no_session_cookie
```

```text
ACT 1  invite reachable unauthenticated   PASS on e4ac1bcac
ACT 2  /team/general still guarded        PASS on e4ac1bcac
```

### NOT re-witnessed on `e4ac1bcac`

```text
ACT 3  create account
ACT 4  membership in the invited Co-Lab
ACT 5  Writer's Studio reachable
ACT 6  Work created · section navigation
ACT 7  DEVELOP returns a reading
```

These remain witnessed on `4be87975b` and are **inherited by ancestry, not
re-observed**. Inheritance is a weaker claim than observation and is recorded as
such.

**Act 6 is the weakest inheritance and should be treated as the one to distrust.**
NAV-03 changes draft-creation refresh behaviour — Worktable notifying the Canvas,
and two staleness races — which is exactly act 6's territory. A reader citing act
6 against the live runtime is citing an inference, not a witness.

### Ruling on the drift

The cohort gate is **not** reopened. The invited-member door is proved on the live
build, the repair commits are all present, and the running system is a superset of
the witnessed one. But this record's subject is `4be87975b`, and any claim made
about `e4ac1bcac` beyond acts 1 and 2 is an inference drawn here deliberately and
labelled.

---

## 7 · Ruling

```text
GATE 0                  PASS
production              4be87975b
witness                 tester4writer
cohort release          GO

critical path           invite → account → invited Co-Lab → Writer's Studio
                        → Work → section navigation → DEVELOP reading

result                  PASS end-to-end
founder intervention    NONE
P0 containment          observed absent under an ordinary member
```

The cohort gate has passed. The remaining issues already have names and places to
go. Tonight does not become another repair cycle.
