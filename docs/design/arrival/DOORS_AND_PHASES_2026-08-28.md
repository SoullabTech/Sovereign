# The arrival threshold — what is actually behind the door

**Date:** 2026-08-28 · **Status:** evidence for a product ruling. ⛔ Makes no ruling and changes no code.
**Purpose:** the founder's step-4 question — *what must a returning or new member understand at
this exact threshold, and which authentication choices can remain latent until needed?* — needs
facts about the surface, not another visual pass. This is the facts.

---

## 1 · The finding that reframes the question

Every treatment so far — A, B, C, D, and my `reference-shipped.html` — rendered the **email
phase**. On `/signin` that is the **second** screen.

```
UnifiedAuth.tsx:185
  phase = preVerified ? 'name'
        : usernameParam ? 'password'
        : mode === 'signin' ? 'password'
        : 'email'
```

Deliberate, not drift: commit `44b7a52`, 2026-08-24 — *"Auth: /signin opens on username+password,
/signup opens on email."*

So the first screen a returning member meets is **username + password**, and it is the one screen
nobody in this exploration had looked at. `treatment-d-resolve-signin.html` is the first render of
it.

### 1.1 The arrival remodel does not fully reach that screen

`cardStyle` is applied to the outer container, so the remodelled **field, card and Holoflower**
are present in both phases. But the remodel's *typography* is applied inside the email branch
only:

| | email phase (`:616`) | password phase (`:539`) |
|---|---|---|
| heading | `Welcome.` — Spectral serif, with the period | `Welcome` — plain sans, no period |
| subtitle | `text-slate-300/95` (warmed by the remodel) | `text-slate-300/80` (original) |

The screen most returning members meet is therefore **atmospherically remodelled and
typographically not**. Visible in the render: the sans "Welcome" reads as materially less
considered than the serif "Welcome." beside it.

⛔ Not asserted as a defect — it may be deliberate, since `/signin` is a return and `/signup` is a
first meeting, and a first meeting can carry more ceremony. But it is a split that no document
records, and it was invisible until the phase was rendered.

---

## 2 · How many doors, honestly

Not five for everyone. The count depends on route and member state:

| Member state | First screen | Doors present |
|---|---|---|
| new member, `/signup` | email | Continue · Google · Apple = **3** |
| returning, `/signin`, no biometric registered | password | Sign in · sign-in code · Google · Apple = **4** |
| returning, `/signin`, biometric available | password | + Touch/Face ID = **5** |
| returning via `?username=` link | password, *"Welcome back, {name}."* | same as above |
| mid-flow (`code`, `name`) | — | single-purpose screens, not thresholds |

My earlier "five doors at the threshold" reported the **maximum** case as if it were the surface.
The first-contact case for a genuinely new member is three, two of which are third-party.

### 2.1 Conditionality, and one consequence nobody has looked at

`bioAvailable` starts `false` and is set by an **async availability check in an effect after
mount** (`:236-253`). So on a device with biometrics registered, the Touch/Face ID button
**appears after the first paint** — it is not in the frame the member first sees.

That collides with the motion grammar in a way worth naming: D's settling gesture completes at
~300–560 ms, and this button can land *after* it. The orientation floor
(`SOULLAB_MOTION_GRAMMAR §3.1`) says the primary action is readable at frame one; it does not
license a secondary action arriving late and reflowing the stack under a member's eyes. Whether
that is happening in practice is measurable and unmeasured — it needs the real capture, not a
mockup, because it depends on the WebAuthn call's latency.

---

## 3 · What each door costs if it goes latent

Offered as consequence, not recommendation. The ruling is the founder's.

| Door | Who it serves | Source record | Cost of making it latent |
|---|---|---|---|
| **Email code** | everyone; the default door by design | `:203-220` — *"Email is the DEFAULT door"* | none if it stays primary; it is the fallback for members holding a generated password they have never seen |
| **Username + password** | members who set a password during induction | promoted out of footnote size 2026-08-24 because *"it read as hidden to members who set a password during induction and return expecting to use it"* | **high, and already paid once.** This is the one door the record shows was hidden and had to be brought back |
| **Biometric** | returning members on a known device | *"the easy return path, so it sits directly under Sign in"* | low visibility cost — it is only offered where it already works — but it is the fastest return, so demoting it taxes the most frequent case |
| **Google / Apple** | members who joined that way | no comment recording a decision | unknown without usage data. If few members joined via OAuth, this is two permanent doors serving a small set |

**The one question this table cannot answer:** how many members actually use each path. That is a
database question, not a design question, and it would convert this ruling from judgment to
evidence. Until it is asked, any decision to demote a door is a guess about people.

---

## 4 · Where this leaves the ruling

The founder's framing holds and sharpens:

> Styling can make five mechanisms quieter. It cannot make five mechanisms into one invitation.

But the shape of the problem has changed:

1. It is **not one threshold, it is two** — `/signup`'s email phase and `/signin`'s password
   phase — and they currently differ in typography without a recorded reason.
2. The heaviest screen is the **returning** one, not the first-contact one. That inverts the
   usual instinct: the person who most needs ceremony gets the lighter screen, and the person who
   just wants back in gets the denser one.
3. The most honest next input is **usage data per path**, not another treatment.

---

## 5 · Still blocked in this environment

- **True shipped `/signin` capture** — not possible here. `node_modules` is absent, the app needs
  env and a database, and production is on minisforum, reachable from the Mac Studio. Procedure
  and a runnable script: [`capture-arrival.md`](./capture-arrival.md).
- **Physical device** — same. The renders here are headless Chromium only.
