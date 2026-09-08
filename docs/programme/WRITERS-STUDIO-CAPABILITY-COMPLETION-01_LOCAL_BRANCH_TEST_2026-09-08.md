# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## LOCAL BRANCH TEST — no merge, no deploy

**Served subject** `claude/writers-studio-capability-clxw8d` @ `d199dd76a`,
clean tree. **Ancestor check:** every feature commit in this record is an
ancestor of the served commit (they are the same branch, tested at its tip).
**Environment** ephemeral local PostgreSQL 16.13 + `next dev` inside this
session's container.
⛔ **`clean-main-no-secrets` untouched at `379c9b40a`. Nothing deployed.
Production database never contacted.**

> **You do not need to merge to see what you built.**

---

## 1 · WRITER'S STUDIO BASICS — PASS

```text
canvas opens                    yes
rail rows                       16          ← D-019 grammar intact
unavailable rows                6, EVERY ONE saying its state (FR-C)
built capabilities actionable   materials · structure · versions · conversations
                                statistics · notes · goals
outline click                   scrollY 0 → 0   (no viewport jump)
mode bar                        Write · Develop · Explore · Review · Publish
page errors                     none
```

The D1–D4 repair holds under a real render: nothing that is built is drawn as
unavailable, and nothing unavailable is merely dimmed.

## 2 · NOTES — PASS

```text
caught beside the writing       yes, without leaving the field
anchored to                     "The Nature of Change"
left the Studio and returned    "The middle is abstract where it should be plain."
```

## 3 · GOALS — PASS

```text
intention   "Finish Chapter 7"   progress = none          no number, no proxy
measurable  "3,000 words"        progress = uncounted     "not counted here",
                                                          never "0 / 3,000"
support choice                   per goal — 2 of 2 carry their own
pressure vocabulary              none
```

## 4 · ANCHOR LOSS — PASS, both objects

Section deleted underneath a note and a measurable goal:

```text
NOTE   section=NULL · heading kept
       "The middle is abstract where it should be plain."
       "Previously attached to “The Nature of Change”"

GOAL   section=NULL · heading kept · target 3000 intact
       progress = unmeasurable
       "3,000 words — the section this counted is gone"
       re-scoped to the whole book?  NO
```

## 5 · GOALS SUPPORT — STILL UNWITNESSED

Unchanged: this container has no product model key, so every support path ends
in lawful silence. **The keyed witness is the outstanding acceptance act** and
it needs a serving environment that has one.

## ⚠️ A SIXTH FALSE INSTRUMENT READING

The first sweep reported pressure vocabulary present: **`pace`**.

It was inside **"Work space"** — the rail's own band label — and a Next.js
hydration script. My regression check used a naive substring match with **no
word boundary**, and read `document.body.innerText` including `<script>`.

```text
substring match over raw DOM   ≠   the word appearing in visible copy
```

**The product's own checker was never wrong here** — `goalEncouragement.ts`
matches on word boundaries and always did. Only the ad-hoc sweep was naive. Same
scope family as the comment-stripping lesson: the instrument read the right
subject and could not tell the thing from something containing it.

Re-run word-bounded over visible text only: **none**.

## STANDING

```text
MERGE        HOLD — clean-main-no-secrets untouched
DEPLOY       HOLD
SCHEMA       remains non-deployable from canonical
PRODUCTION   UNTOUCHED

Notes        tested visibly   PASS
Goals        tested visibly   PASS
Studio       no regression    PASS
Support      keyed founder witness STILL REQUIRED
```

Founder-run runbook for reproducing this locally, and for the deploy decision
when it is made: `…_DEPLOY_RUNBOOK_2026-09-08.md`.
