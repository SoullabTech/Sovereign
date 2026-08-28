# DESKTOP-MEMBER-PARITY-01 — member-surface census

*Census only. No code, no redesign, no implementation. Read-only against the
repository at the base commit below.*

```
base            75c17848c  (canonical at time of census)
web page routes 506        (app/**/page.tsx)
desktop windows 1          (maia-desktop/src/index.html)
```

The governing rule this census is measured against:

> Given an ordinary member entitlement set, can that person live entirely
> inside Desktop without encountering an action whose real implementation
> exists only in the browser?

And the constraint that frames it:

> Desktop is another sovereign surface of the same Soullab product, not a
> second product with a reduced feature set.

---

## 0 · Method, stated so the classification is auditable

Routes were enumerated mechanically from `app/**/page.tsx` — 506 of them —
then bucketed by first path segment into three scopes:

```
ORDINARY-MEMBER          229   reachable by a normal authenticated member
ENTITLEMENT-CONDITIONAL  223   Studios, practitioner, portals, team, fields
OUT-OF-MEMBER-SCOPE       54   admin, founder, debug, demo, press, status
```

Bucketing is by prefix rule, not by reading each page. It is therefore
**approximate at the margins** — a route in the entitlement bucket may in fact
be open to all members, and vice versa. The rules are listed verbatim below so
any misclassification is correctable rather than hidden.

```
OUT-OF-MEMBER-SCOPE   admin ain-demo ain-evolution chat-test consciousness-lab consciousness-monitor debug demo diag enhanced-chat-test founder patrons pfi-monitor pitch powered-by press public-demo research simple status steward test test-sage voice-controller-test
ENTITLEMENT-COND.     book-studio caseload fields labtools masters media model-studio open portal practitioner practitioners stellium studio supervision team writers-studio
everything else       ORDINARY-MEMBER
```

---

## 1 · The structural finding

**Desktop has exactly one surface.**

```
maia-desktop/src/main.js:481   mainWindow.loadFile(.../index.html)
maia-desktop/src/main.js:10    loadFile only — no remote content is ever loaded
```

One window, one local HTML file, the conversation. There is no navigation, no
router, no second view. Which produces the census's first real result:

**There is no browser escape in Desktop — because there is nowhere to escape
from.** `grep openExternal` over `maia-desktop/src/*.js` returns nothing.
Desktop never says "open this in your browser." It simply has no route to any
member action other than talking to MAIA.

That is a different failure from a handoff, and arguably a worse one. A
handoff is visible and countable; absence is silent. A member does not
encounter a link telling them to finish elsewhere — they encounter a product
that appears to contain only a chat window.

So for the purposes of item 4 of the task:

```
explicit browser escapes in Desktop     0
Soullab-owned member actions reachable  1  (MAIA conversation)
Soullab-owned member actions absent     everything else in this census
```

The precedent for surface-steering copy does exist in the web product, in the
opposite direction: `/studio-on-mobile` renders *"Studio works best on
desktop."* Whatever Desktop eventually says when a surface is unavailable
should be held to the same standard the capture finding established — truthful
about what it can and cannot do, never implying the member did something wrong.

---

## 2 · Census against the acceptance list

Classification legend, per the task:

```
COMPLETE       implemented in Desktop and usable
PARTIAL        partially reachable, or reachable without full function
ABSENT         no Desktop implementation
ENT-COND       gated on entitlement; ABSENT for entitled members today
EXTERNAL       intentionally outside Soullab
```

Because Desktop holds one surface, every category below except MAIA resolves
to ABSENT. The census's value is therefore the enumeration and the ordering,
not the suspense.

### 1 · Enter and leave — ABSENT

```
  /begin
  /beta-access
  /beta-onboarding
  /beta-welcome
  /choose
  /continue
  /enter
  /faq
  /intro
  /join/[token]
  /magic-link
  /magic-link-success
  /oauth-success
  /onboarding
  /onboarding/facet
  /onboarding/youth
  /onboarding/youth-coming-soon
  /partner-welcome
  /reset-password
  /resume
  /signin
  /signout
  /signup
  /soul-gateway
  /test-elemental
  /the-beginning/[recipient]
  /welcome
  /welcome-back
  /welcome-flow
```

Desktop has sign-in and sign-out through `session.js` against
`/api/members/signin`, but no sign-up, no verification, no recovery, no
invitation acceptance, and none of the consent surfaces required during entry.
A new member cannot become a member from Desktop.

### 2 · House — ABSENT, and one open question

No route named `/house` exists in the repository. `/maia` is the main
application surface and `/maia/labtools` the tool index. **Which route is
canonically "House" is not established by this census and needs your ruling** —
it decides what "land in the actual House" means as an acceptance criterion.

### 3 · MAIA — PARTIAL, and the only category with anything implemented

```
COMPLETE   text conversation
           voice conversation (capture → transcript → turn)
           canonical thread continuity across Desktop / PWA / mobile
           adoption of a newer canonical thread created elsewhere
           truthful connection / listening / thinking / speaking / error state

PARTIAL    voice OUT — audio now reaches the wire (DESKTOP-VOICE-SHAPE-01,
           live at 9865799e1); member-audible playback not yet witnessed
           stop/cancel voice — a Stop control exists; clean cancellation
           semantics not established

ABSENT     start a NEW conversation (Desktop adopts; it cannot begin a fresh thread)
           conversation history list
           reopen an earlier conversation
           attach / upload material
```

⛔ **One item on your list is currently VIOLATED, not merely absent:**

> *Never silently turn failed input into a persisted member turn.*

That is `VOICE-CAPTURE-PROVENANCE-01` — established, recorded at `1a4964316`,
repair not started. Degenerate capture output is accepted, persisted and
answered as member-authored. It is the only acceptance criterion in this
census that is actively failing rather than unbuilt, and it sits in the one
category Desktop already implements.

### 4 · Member identity + settings — ABSENT

```
  /account/security
  /account/settings
  /language
  /membership
  /privacy
  /settings
  /terms
```

### 5 · Journey — ABSENT

```
  /evolution
  /journey
  /patterns
  /worlds/[...slug]
  /worlds/journey
  /worlds/patterns
```

### 6 · Astrology — ABSENT

```
  /astrology
  /astrology/aspects/[slug]
  /astrology/chinese
  /astrology/mayan
  /astrology/pathways/[element]
  /astrology/report
  /astrology/synastry
  /astrology/synastry/[analysisId]
  /astrology/synastry/saved
  /astrology/vedic
  /birth-chart
  /chart
  /soul-portrait/[slug]
  /soul-portrait/[slug]/welcome
  /soul-portrait/generate
  /soul-portrait/preview/[id]
  /soul-portrait/view/[slug]
```

### 7 · Now What? — ABSENT (entitlement-conditional in practice)

```
  /now-what
  /now-what/arrive
  /now-what/calendar
  /now-what/coaching
  /now-what/cultivate
  /now-what/field
  /now-what/home
  /now-what/map
  /now-what/next
  /now-what/position
  /now-what/practice
  /now-what/questions
  /now-what/reflections
  /now-what/room
  /now-what/themes
  /now-what/welcome
  /now-what/work
```

### 8 · Member creative / work spaces — ABSENT (ENT-COND)

```
studio            61 routes
labtools          61 routes
book-studio       11 routes
writers-studio    2 routes
media / vision    2 routes
```

### 9 · Practitioner surfaces — ABSENT (ENT-COND, excluded from the ordinary-member test)

```
practitioner(+s)  29 routes
caseload          4 routes
supervision       1 routes
portal            8 routes
stellium          11 routes
team              8 routes
fields            16 routes
```

Per the ruling, these must not contaminate the ordinary-member acceptance test.

### 10 · Account / business plumbing — ABSENT

```
  /downloads
  /helper-fund
  /helper-fund/apply
  /helper-fund/contribute
  /membership
  /offerings
  /open-in-web
  /open-web
  /session/join/[token]
  /sessions
  /studio-on-mobile
```

These are the routes most likely to send a member to a browser in practice,
and they are the easiest to forget when planning by feature rather than by
member action.

---

## 3 · What should be composed, not redesigned

For every ABSENT surface the existing web implementation is the implementation.
This census identifies **no surface that needs redesigning to reach Desktop.**
Each is a Next.js route already running in production against the same APIs,
the same identity, the same memory.

That is the whole argument for the hybrid topology already ratified in
`DESKTOP-SHELL-01`: the remote product surface renders canonical UI
unprivileged, and Desktop composes rather than reimplements. Rebuilding 229
ordinary-member routes natively would double the product surface and guarantee
drift.

The exceptions — surfaces that genuinely want native implementation rather than
remote rendering — are the ones already native, and the ones touching desktop
capabilities the browser cannot own:

```
NATIVE (already)     MAIA conversation, voice capture, session credential
NATIVE (candidates)  file import / attachment, notifications, deep links,
                     downloads/exports, microphone and audio lifecycle
REMOTE (compose)     everything else in this census
```

---

## 4 · Implementation sequence, ordered by member impact

Ordered by *what sends a member to a browser soonest*, not by build ease.

```
0  VOICE-CAPTURE-PROVENANCE-01   repair the violated criterion before adding
                                 surfaces that will read the polluted thread
1  DESKTOP-SHELL-01              privilege boundary + one-sign-in session
                                 handoff, proven before any surface lands
2  Enter and leave               sign-up, verification, recovery, invitation,
                                 consent — without these a new member cannot
                                 start on Desktop at all
3  House                         the landing surface and navigation spine
4  MAIA completion               new conversation, history, reopen, attachments
5  Identity + settings           account, privacy, voice and MAIA settings
6  Account / business plumbing   subscription, billing, invitations, downloads,
                                 help, legal — the classic browser-escape set
7  Journey · Astrology · Now What
8  Studios (entitlement-gated)
9  Practitioner surfaces (entitlement-gated)
10 DESKTOP-NATIVE                files, notifications, deep links, tray, update
```

Items 2 and 6 are placed high deliberately. They are unglamorous and they are
exactly what breaks the promise: a member who cannot recover access or manage a
subscription from Desktop opens a browser on their first bad day.

---

## 5 · Close condition

Per the task, this unit closes only when:

> an authenticated member can traverse the complete entitled product without a
> browser escape

Which requires, in addition to the sequence above, an **acceptance walk** rather
than a code review: a real member entitlement set, a real session, and a
traversal of every category in §2 with a browser deliberately closed. Anything
that cannot be completed is a finding; "we implemented the route" is not
evidence that a member can complete the action.

---

## 6 · Open questions this census cannot settle

1. **Which route is canonically House.** Decides the §2.2 acceptance criterion.
2. **The entitlement model.** This census bucketed by path prefix. Which
   surfaces an *ordinary* member actually sees is a data question about
   entitlements, not a filesystem question, and the ordinary-member acceptance
   test depends on the answer.
3. **Which absent surfaces are `INTENTIONALLY EXTERNAL`.** None were classified
   so, because nothing in the repository declares that intent. If any surface
   is meant to stay in the browser, it needs to be named — otherwise every
   absence reads as a gap.

## State

```
census                COMPLETE against 75c17848c
classification         approximate at the margins; rules stated for audit
implementation         NOT STARTED
redesign               NOT AUTHORIZED / NOT REQUIRED
one violated criterion VOICE-CAPTURE-PROVENANCE-01 (§2.3)
```
