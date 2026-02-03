# MAIA Non-Regression Covenant

This is not a doc you admire. It's a doc you **obey** — especially when you're tired.

---

## The Locked Core (LC-1)

These are **sacred**. They do not change casually. They do not get "just one more fix."

**LC-1 includes:**

1. **Sign-in / Auth**
   - Existing users can log in
   - Session persists across reload

2. **Basic Conversation (Text-Only)**
   - User can send a message
   - MAIA responds
   - Conversation state does not corrupt

3. **Navigation Stability**
   - App loads
   - No blank screens
   - No infinite spinners

**If any change threatens LC-1 → do not ship.**

Voice does **not** belong here yet. Mobile does **not** belong here yet.

---

## LC-2 (Protected but Mutable)

These can evolve, but **never at the expense of LC-1**.

- Voice (all forms)
- Continuous mic
- Streaming text
- Relational overlays
- Advanced agents
- TestFlight builds

**If LC-2 breaks → acceptable only if LC-1 still works.**

---

## The One-Way Door Rule

Any change that affects:

- `auth`
- `fetch` / `apiFetch`
- `streaming`
- `shared hooks`
- `app shell`

…is a **one-way door**.

One-way doors require:

1. Explicit acknowledgment: *"This can regress LC-1"*
2. A rollback plan
3. A stop-point if anything smells wrong

**No exceptions when tired.**

---

## The Stop Rule

You **stop immediately** when:

- Sign-in breaks
- JSON parse errors appear in core flows
- You feel rage or despair rising

Not because you failed — but because **continuing will make things worse**.

Stopping is a skill.

---

## 60-Second Regression Check

Before *any* build:

1. Open app
2. Sign in
3. Send "hello"
4. Receive reply

If that fails → stop. No debugging spirals.

---

## Voice as Sandbox

Voice work continues, but:

- Behind a flag
- Or on a branch
- Or disabled by default

No more "voice fix accidentally breaks auth."

---

## The Point

The point is **not** shipping faster.

The point is:

- Building something that doesn't harm you
- Preserving your capacity to care
- Letting MAIA mature without costing your health

---

*Created: 2026-01-30*
*Status: ACTIVE*
