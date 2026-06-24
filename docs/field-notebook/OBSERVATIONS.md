# Observations — unexpected findings encountered while doing the work

The third register of the field apparatus, and the **upstream** one. Companion to the
[Field Notebook](README.md) (experiments executed) and [Field Questions](FIELD_QUESTIONS.md)
(pre-registered questions). An Observation records something reality revealed **while we were looking
at something else** — a finding that was *never the object of investigation*.

```text
Field Questions   →  (pre-registered: what we decided to pay attention to)
        ↓
Field Notebook    →  (executed: what happened to a prediction)
        ↓
Observations      →  (encountered: what reality revealed while we worked)
```

## Why surprises get their own place

A Field Notebook entry carries a **prediction**. If an unexpected finding is written into an entry,
the surprise is quietly absorbed into an experimental narrative and begins to read as though it had
been predicted — the exact hindsight failure the [Field Questions](FIELD_QUESTIONS.md) freeze exists
to prevent. So a surprise that was *not* the object of any pre-registered question does **not** belong
in the notebook. It belongs here, recorded as what it was: a thing noticed, not a thing tested. Keeping
prediction and surprise orthogonal protects both.

## The discipline

- Record the surprise **as encountered** — name the work that was actually underway, and state plainly
  that this finding was not its object.
- Do **not** retrofit a prediction. An Observation has no `Expected Observation` / `Potential
  Falsifier` — having none is the point.
- An Observation may **commission** a future Field Question (a surprise is often the seed of the next
  experiment). Name the candidate question here; **pre-registering it is a separate, dated step** filed
  in [FIELD_QUESTIONS.md](FIELD_QUESTIONS.md), asked *after* the observation, never written as though it
  had been predicted.
- An Observation is a **design observation, not an experimental conclusion.** It does not change the
  architecture by itself; it points.
- Not constitutional cases, not experiments — the moments where reality quietly revealed something we
  weren't looking for. Over time, a corpus in its own right.

> *This register was earned, not anticipated:* a real finding (O-001) could not be filed in the
> notebook without a surprise masquerading as a prediction. Per the freeze, the next change is earned
> only when a real build cannot be expressed in the existing artifacts (README, 2026-06-18).

---

## O-001 — The consent gate trusted authoritative state over apparent state

- Date: 2026-06-18
- Encountered while: certifying the **email executor UI A/B** (Leg A send / Leg B revoke) in the live
  Studio `/studio/scheduled-sends` surface. Related notebook entry: [0001 — Scheduled Send](0001-scheduled-send.md)
  (agency / action under consent).
- Object of investigation: **authorship · consent · execution · revocation · auditability** of the
  email executor. The finding below was **not** that object.
- Verified by: direct observation in the live UI during the certification run (prod `soullab.life`,
  authenticated member).

### What happened
While the certification form was being filled by automation, the consent checkbox was set at the
**DOM** level (`checked = true`) **without** firing the React `onChange` that updates the form's
authoritative state. The checkbox *appeared* checked. On submit, the form **refused**: *"Please confirm
you have permission to send this email."* It had validated against authoritative application state
(consent = `false`), not the visible DOM. Only a genuine consent interaction — one that actually moved
the authoritative state — allowed the send to proceed.

### Why this is an Observation, not a result
No one was testing *"does the form trust React state over DOM state?"* It surfaced incidentally, as a
by-product of how the form was driven during a certification aimed at something else. There was no
prediction for it to confirm or falsify — so it is not a notebook outcome. It is a thing noticed.

### What it reinforces (a design observation)
> The system trusted **authoritative** state over **apparent** state.

One of the architecture's deepest commitments, made physical: authority comes from the authoritative
source, not from what appears to be true. Here it appeared at the consent boundary specifically — the
gate would not accept a consent that only *looked* given. This strengthens, by incidental evidence
rather than by argument, the claim that *"MAIA only sends what I explicitly authorize"* is enforced
structurally and not by appearance. It is a design observation, **not** an experimental conclusion —
it changes no principle; it points at one.

### Commissions (candidate — NOT yet pre-registered)
→ **FQ-002 (candidate):** *Under what conditions does **apparent** consent diverge from
**authoritative** consent — and does the system reliably resolve the divergence toward the
authoritative source, at every consent surface (not just this checkbox)?*

A genuine, generalizable hypothesis. Recorded here as **commissioned, not filed.** If it earns
pre-registration, that happens in [FIELD_QUESTIONS.md](FIELD_QUESTIONS.md) — dated and frozen, **after**
this observation — never rewritten as though it had been predicted.
