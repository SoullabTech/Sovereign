# Now What? Executive Flourishing Onboarding — Pre-Implementation Review

**Date:** 2026-08-03 · **Status:** ⛔ **REVIEW ARTIFACT — no code written, none authorized.**
Produced under the founder instruction *"Do not code until those are reviewed."*
**Deliverables:** §1 current architecture map · §2 proposed component tree · §3 data flow.
**Referent:** deployed `95b21ce42`; invitation substrate on `feature/now-what-invitation-loop` (`46e8b5bb0`).

---

## 0. 🔴 Blocking finding — read before reviewing §1–§3

### Five different five-item lists are now circulating in Larry's name

| # | Source | The five |
|---|---|---|
| **1** | **LIVE IN PRODUCTION** — `practice_fields.about_practice` | Attention · Relationships · Meaning · Contribution · Presence |
| **2** | `LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` / authority schema | includes **Time Affluence** and **Health and Energy** — which list 1 drops, while inventing *"attention"* (recorded as a known translation-fidelity defect) |
| **3** | Conversation, earlier | Purpose · Strengths · Relationships · Growth · Well-being |
| **4** | Conversation, earlier | Achievement · Meaning · Growth · Contribution · Flourishing |
| **5** | **This implementation prompt, Screen 3** | Relationships · Meaning & Purpose · Presence · **Health & Energy** · Contribution |

⭐ **List 5 is the closest to the rights instrument** — it restores *Health & Energy* and drops the
invented *attention*. It is **still not identical** to production (list 1), which remains live and
defective, and it is not sourced from Larry's corpus.

⛔⛔ **Screen 3 cannot be built from any of these.** *"Introduce Larry's framework"* requires Larry's
framework, and the corpus is verifiably absent while the rights instrument is unsigned. **Building
Screen 3 from list 5 would make Soullab's fifth approximation the production definition of Larry's work.**

✅ **The buildable form:** ship Screen 3's **container** with the dimension set supplied at render time
from the expression layer, defaulting to **nothing rendered** until Larry's list exists.
⛔ A placeholder that *looks* like a framework is worse than an absent screen.

⚠️ **Also for the reconciliation sitting:** list 1 is still live in production and composes into every
slug-resolved room. Its correction is Larry's act, not engineering's.

---

## 1. Current onboarding architecture map

### Route surfaces on trunk

| Step | Surface | Exists |
|---|---|---|
| 1 | `app/begin/page.tsx` | ✅ |
| 2 | `/intro-maia` · `/intro-daimon` | ⚠️ **documented in `CLAUDE.md`, no `page.tsx` on trunk** — the documented flow and the built flow already differ |
| 3 | `app/test-elemental/page.tsx` — `SacredSoulInduction` (passkey/password) then `ElementalOrientation` | ✅ |
| 4 | `app/faq/page.tsx` | ✅ |
| 5 | `app/onboarding/page.tsx` — `CompleteWelcomeFlow` | ✅ |
| 6 | `/maia` | ✅ |

### Persistence

| | |
|---|---|
| `members.onboarding_step` | `VARCHAR(50) DEFAULT 'begin'`; documented values **`begin · test-elemental · faq · onboarding · complete`** — ⚠️ **free text, no CHECK constraint** |
| `members.onboarded` | boolean; set with `onboarding_step = 'complete'` by `POST /api/members/progress` |
| Client mirror | `localStorage.beta_user.onboarded` |

⚠️ **Consequence for this work:** adding an invitation-origin step needs **no migration** — the column
accepts any string. That is convenient and is also why the value set must be written down here rather
than discovered later from data.

### Invitation-shaped entry today

⛔ **None.** `app/api/members/*` has `check · register · signin · recover · progress`. There is no
invitation-origin path, and `field_invitations` (new, unmerged) is **not** an account-creation
mechanism — it is an offer to an **existing** member.

### ⭐ The gap this exposes

```
Larry's real client journey:  never heard of Soullab → invited → account → orientation → field
What exists today:            account exists already → invited → field
```

**The invitation loop assumes a member. Larry's onboarding assumes a stranger.** Bridging them is the
actual work of this spec, and it is larger than five screens.

---

## 2. Proposed component tree

⛔ **Proposed. Not built.**

```
app/now-what/welcome/[token]/page.tsx        invitation arrival (new route)
│
├── NowWhatWelcomeShell                      expression-aware chrome
│   └── resolveExpression('now_what')        ⚠️ returns UNIVERSAL until rights signed
│
├── S1_Arrival                               "You've achieved a lot. Now what?"
│   └── PractitionerGreeting                 ⛔ container only — Larry's words, absent
│
├── S2_CurrentSeason                         "What feels most alive for you right now?"
│   └── SeasonOptions                        ⚠️ options are Larry's language — supplied, not authored
│
├── S3_FlourishingDimensions                 ⛔⛔ BLOCKED — see §0. Renders nothing without Larry's list
│
├── S4_ExecutiveReflection                   free response · MEMBER-AUTHORED
│   └── → member_field_note_threads          verbatim, no summarisation
│
└── S5_IntoPractice                          hand-off into the field
    └── → /now-what?fieldContext=<slug>
```

**Reused, not rebuilt:** `NowWhatShell` · `NowWhatThreshold` · `useMemberSession` · `apiFetch` ·
`MemberInvitations` (`46e8b5bb0`) · `resolveExpression` / `labelFor` / `lensAttribution`.

| Screen | Buildable now? |
|---|---|
| S1 arrival container | ✅ (copy is a placeholder) |
| S2 container | ✅ · ⚠️ options blocked |
| **S3** | ⛔ **blocked — §0** |
| **S4** | ✅ **fully — the member authors it** |
| S5 | ✅ |

⭐ **S4 is the only screen whose content is not blocked**, because it is the only one the member writes.

---

## 3. Data flow

```
PRACTITIONER                  SYSTEM                          MEMBER
────────────────────────────────────────────────────────────────────────────
authors invitation
  POST /api/practitioner/invitations
        │
        └──> field_invitations
             authored_by_practitioner_id   ← attribution, PERMANENT
             body (verbatim)
                    │
                    │   ⚠️ GAP: no delivery mechanism. An invitation is
                    │      visible to an EXISTING member standing in the
                    │      program. There is no token, no email, no
                    │      stranger-arrival path. THIS IS THE MISSING PIECE.
                    ▼
                                            arrival · orientation · identity
                                                    │
                                                    ▼
                                            GET /api/now-what/invitations
                                            renders: system voice
                                                     practitioner voice (attributed)
                                                     member gesture
                                                    │
                                            POST /api/now-what/invitations
                                                    │
        ┌───────────────────────────────────────────┘
        ▼
   field_invitation_responses
     invitation_id · member_id · accepted|declined
     ⛔ no content · ⛔ no completion state
                    │
                    │   ⛔⛔ NO EDGE HERE. Deliberate.
                    ▼
                                            writes their own reflection
                                                    │
                                                    ▼
                                            member_field_note_threads
                                              authorship = member
                                              ⛔ no invitation_id
                                              ⛔ no practitioner_id
                                              (asserted by test)
                                                    │
                                                    ▼
                                            rendered through the lens
                                            resolveExpression() at RENDER time
                                            lensAttribution() — live relationship only
```

### The three voices, as data

| Voice | Storage | Survives relationship end? |
|---|---|---|
| **System** | none — rendered wording | n/a |
| **Practitioner** | `field_invitations.body` + author FK | ✅ **yes — permanently attributed** |
| **Member** | `member_field_note_threads` | ✅ **yes — and unattributed to anyone else** |

---

## 4. What must be decided before any code

| # | Question | Holder |
|---|---|---|
| **1** | **Invitation delivery to a stranger** — token link? email? Neither exists. This is the real gap, not a screen | founder |
| **2** | **Screen 3 dimensions** — §0. Which list, and from where | **Larry** |
| **3** | `onboarding_step` value for invitation origin, and whether `intro-maia` / `intro-daimon` are restored or removed from the documented flow | founder |
| **4** | Does invitation arrival create the account, or presuppose it | founder |

⛔ **Nothing in §2 or §3 is authorized. No component, route, migration, or copy has been written.**

> The onboarding is not five screens. It is the first path by which a **stranger** becomes a member with
> orientation intact — and that path does not exist yet in any form.
