# Writer's Studio beta update email (DRAFT, 9 Nov 2026)

**Status:** draft text only. Nothing has been sent. Sending is the founder's act, after reviewing the text **and** the recipient list.
The app cannot send this: its managed mail path accepts sign-in codes only (`auth:email-code`), and `invite:*` and `broadcast:*` are
refused. It goes **by hand from Proton**, BCC, as the 31 Oct invitation did.

---

## Subject line options

1. What's new in Writer's Studio
2. Writer's Studio: your work at the centre, and MAIA beside it
3. A Writer's Studio update, and a question for you

## Body (plain text)

> Hello,
>
> Thank you for writing with Writer's Studio during this beta. Here is what it does today, what has changed this week, and where we would value your eyes.
>
> **What Writer's Studio does**
> - Bring in a manuscript, or start a new work, and keep writing in it. Your drafts save as revisions.
> - Ask MAIA about a passage you are working on. She answers about the text in front of her and quotes it accurately.
> - Choose how MAIA works with you: guided, learning, or direct.
>
> **What changed this week**
> - **Conventions, described, not imposed.** Ask how writers usually handle something (dialogue, tense, chapter breaks) and MAIA describes common practice and how it varies. She does not grade your choices against it.
> - **She answers at the level you ask.** If you ask about structure, she answers about structure. She will not start correcting commas unless you ask her to, or ask her to watch for them. If you want the professional terms (line edit, copyedit, developmental edit), ask, and she will use them.
> - **"Teach me about this."** Where it is offered, a click asks MAIA to explain the craft behind what she noticed. She does not start a lesson unless you click.
> - **Sanctuary is stricter.** With Sanctuary on, nothing MAIA would keep or learn is stored: not the conversation, not her readings, not notes about your book. Your own writing always saves, in Sanctuary or not.
>
> [INCLUDE ONLY IF THE DEVELOP STAGE IS CONFIRMED VISIBLE IN PRODUCTION — see checklist]
> - **A redesigned Develop space.** Your work sits at the centre, with one conversation with MAIA beside it. Fewer buttons. You reach other tools by asking her.
> - **MAIA reads a chapter when you ask.** She offers; only your click starts the reading. Afterwards she remembers what she read and which version of your draft it was, and she says what she has not read.
> - **Plans tied to your own sentences.** Ask for a revision plan and each step points to an exact sentence in your manuscript. The steps give direction. They do not rewrite your prose.
> - **Decisions you have settled stay settled.** Tell her "I've decided…" and she records it as yours, and respects it later.
> [END CONDITIONAL]
>
> **What we would love from you**
> Please spend some time in it this week, with your own writing, and tell us:
> 1. Where did you get lost, or not know what to do next?
> 2. When did MAIA help, and when did she get in your way?
> 3. Did anything she said about your text turn out to be wrong?
>
> Just reply to this email. Short notes are welcome.
>
> Sign in at soullab.life with your username and password.
>
> With gratitude,
> Soullab

---

## Before you send (not part of the email)

**Recipients (founder, 9 Nov): Jondi, Andrea Nezat, Andrea Fagan, Cathryn Jones, Nathan Kane, Heather Hampton** (6). Use BCC.
Addresses are deliberately not written here. Carry over from 31 Oct: Andrea Nezat at her Yale address (sign in by username);
Cathryn can sign in with `cabibajones` or her Gmail. Heather Hampton was not on the 31 Oct list: confirm her address and that she
has a Studio account before sending.

*Background, superseded by the list above:* `ops_contacts` holds **54** rows with `contact_type = 'beta_tester'` and `pipeline_stage = 'active'`, all with an email
(production read 2026-11-09, count only). There is **no `program` column**, so "program `writers_studio_beta`" cannot be filtered on;
the admin beta-tester route (`app/api/admin/beta-testers/route.ts`) treats this same pair as "Writer's Studio pilot". ⚠️ The 31 Oct
invitation went to **5** people chosen by hand. 54 is much larger. Decide which list is "official" before sending. Draw it with
(excluding deleted rows): `SELECT email FROM ops_contacts WHERE contact_type='beta_tester' AND pipeline_stage='active' AND deleted_at IS NULL;`
Addresses are deliberately not written here.

**Develop stage gate.** Production runs `946e1f121`, and the redesigned Develop stage is behind the build-time flag
`NEXT_PUBLIC_WS_DEVELOP_STAGE`, which was **off** in that build. Keep the conditional block only after a deploy that turns it on and a
look at the live page. Otherwise delete it.

**Claim basis (Marketing Claim Discipline).**
| Claim | Standing |
|---|---|
| Conventions stance, levels, professional names, "Teach me" | Deployed in `946e1f121` (Passage Focus + Develop). Evidence: instruction-level runs and harness walks on fictional books (`WS-CRAFT-CONVENTIONS-01_MERGE_READINESS_2026-11-09.md`). No real writer in production has used it yet. |
| Sanctuary stores nothing MAIA keeps; manuscript always saves | Deployed. Route tests on real PostgreSQL (`WS-SANCTUARY-CLOSURE_FROZEN_CANDIDATE_2026-11-09.md`, walk evidence §Sanctuary). Write-room Sanctuary was not examined. |
| Develop stage, chapter reading + memory, plans, settled decisions | Code deployed; **stage hidden by the flag**. Evidence is real-model checks on a fictional harness, not production. |
| Guided / Learning / Direct | Assumed from existing Studio. **Confirm it is on the live page before keeping the line**, or drop it. |

Left out on purpose: the founder's 9 Nov walk verdict on the old stage was FAIL. Open defects: MAIA can blame herself when a passage
changed between turns; the identity-protection note did not appear. The G6/D5 question (whether her carried readings respect a
writer's "dismiss") is unruled. Nothing in the email promises around these.

**If someone cannot sign in:** password-recovery email still cannot be sent; a forgotten password needs a hand reset.
