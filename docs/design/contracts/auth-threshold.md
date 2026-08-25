---
# ── Identity ────────────────────────────────────────────────────────────────
room: Auth Threshold
human_activity: arriving at Soullab and choosing the truthful way in — returning as a member, or joining for the first time

# On the House Return precedent: a threshold does not have to pretend to be a
# conventional "room" to deserve a contract. The doorway itself is architecture.
#
# Deliberately narrow. This binds the ARRIVAL THRESHOLD — which door a person
# meets, and whether it opens. It is NOT a contract for authentication as a
# system: it makes no claim about credential policy, provider hierarchy,
# passkeys, session lifetime, or onboarding after the threshold is crossed,
# and must never be read as authorising any of that. Those are owed their own
# rulings. Widening these globs would silently pretend that debt was paid.
surfaces:
  - components/auth/UnifiedAuth.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — a place a member can enter must be a place they can leave; the way out is architecture, not a feature
  - INHABITABLE_ARCHITECTURE — see human purpose → lived journey → places → gestures, never features → pages → navigation; the two doors exist because two intentions exist, not because two routes did
  - MAIA_SOVEREIGNTY_INVARIANTS — agency first; a person held at a door they cannot open has less of it, whatever waits behind it
  - MAIA_OATH — no guru stance; a door names where it goes and does not persuade

reference_surfaces:
  - docs/design/contracts/house-return.md — the precedent that a threshold is governable architecture
  - app/signin/page.tsx — the returning intent, rendering UnifiedAuth mode="signin"
  - app/signup/page.tsx — the joining intent, rendering the same component in mode="signup"

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: one implementation. Both doors are the same UnifiedAuth component, so the field hierarchy, error voice, and gesture language cannot drift apart between arriving-as-a-member and arriving-for-the-first-time. A person who bounces between them meets one place, not two products.
distinct_to_room: the opening phase, because the intentions differ. /signin opens password-first — someone returning already holds a credential. /signup opens email-first — someone joining does not yet. The difference is which door is already ajar, not which doors exist.

# ── Evidence ────────────────────────────────────────────────────────────────
screenshot_desktop: docs/design/contracts/screenshots/auth-threshold-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/auth-threshold-mobile.png
experience_verification: >
  Walked 2026-08-25 against a dev server running from this change's own worktree
  (fix/auth-entry-01-new-member-escape, base 7f0dae948, port 3111). The rendered
  DOM carried link "Begin Journey" href="/signup" — a string that exists only in
  this candidate — which is how the served tree was bound to the change rather
  than assumed.

  DESKTOP 1280x900 — /signin rendered password-first: Username, Password (with a
  Show toggle), Sign in. No email field. Peer doors visible rather than hidden:
  "Email me a sign-in code instead", "Sign in with Face ID or Touch ID". Footer
  read "New to Soullab? Begin Journey". Activating it landed on /signup, rendering
  email-first: Email address, Continue, footer "Already a member? Sign in".

  MOBILE 375x812 — same sequence, same result; the biometric label localises to
  "Sign in with Fingerprint or Face". Nothing clipped at either width.

  SCOPE OF THIS WITNESS: it establishes the threshold TRANSITION only — which
  state each door opens in, and that the escape advances rather than returns.
  It does NOT witness account creation, email delivery, credential verification,
  or MAIA recognising a member. No field was typed and no form submitted.

  A first screenshot attempt (chrome --headless --screenshot) captured the
  pre-hydration splash — holoflower on navy, zero text — and was discarded rather
  than filed. The images here were taken over CDP after polling the DOM until the
  escape copy was actually present.
---

# Auth Threshold — Experience Contract

## What this room is for

This is not a room. It is the doorway, and it serves one human moment: a person
arrives at Soullab and has to be met truthfully according to why they came. Two
intentions turn up at the same threshold — *I already belong here*, and *I am
joining* — and the threshold's whole job is to let each one through without
making the other feel like a mistake.

## The architecture this contract preserves

```
ONE IMPLEMENTATION
  UnifiedAuth

TWO ARRIVAL INTENTS
  /signin  → I already belong here   ·  opens password-first
  /signup  → I am joining            ·  opens email-first

LEGACY
  /begin   → compatibility redirect only, never a destination for new UI
```

Two URLs do not break "one front door". **The unity is the implementation and the
experience language, not the URL count.** A person meets the same place, the same
field hierarchy and the same voice at either address; what differs is which door
is already open, because their intention differs.

## The rule underneath it

> **A threshold must never offer a door that returns the person to the threshold
> without advancing their intent.**

And its auth-specific continuation:

> **Returning and joining are different human intentions, even when they share one
> implementation.**

This contract exists because that first rule was broken. `/signin` opens onto a
password form, so an exit was added for someone with no account: *"New to
Soullab? Begin Journey"*. It pointed at `/begin` — a route deprecated
2026-05-16, now a legacy stub redirecting to `/signin`, with a permanent
redirect in `next.config.js` as well. The exit returned the person to the room
they were trying to leave:

```
/signin → "Begin Journey" → /begin → 308 → /signin
```

The error was equating **one entry point** with **one URL**. `/signup` already
rendered the same component in joining mode; the door that opens already existed.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Leave `/signin` without an account | **New to Soullab? Begin Journey** | Names the person's situation before offering the act. "Begin Journey" is an arrival, not a form — it says what happens next, without persuading. |
| Leave `/signup` already holding a credential | **Already a member? Sign in** | The mirror. Each door acknowledges the other rather than pretending it is the only way in. |
| Escape a phase that cannot open | **Email me a sign-in code instead** | A peer door, not a footnote. Someone who joined by email code holds a generated password they have never seen; without this the password phase is a trap. |

## What this contract does NOT decide

Deliberately unresolved here, and not to be inferred from it:

- credential policy — passwords, passkeys, biometrics, rotation
- provider hierarchy — which of Google / Apple / email-code is primary
- onboarding after the threshold is crossed
- account creation, email deliverability, or session behaviour

Its present claim is only this: `/signin` is the returning threshold, `/signup`
is the joining threshold, `Begin Journey` leads to `/signup`, `/begin` is legacy
compatibility, valid alternate entry methods stay visible rather than trapping
someone behind one failed method, and **no member-facing route dead-ends or
circles**.
