# Soul Portrait as a Studio Field — What It Takes

**Status:** CANDIDATE · planning · 2026-07-04
**Does NOT authorize build.** Each stage is its own authorized build through the
`architectural-integrity` skill + the Co-Lab release gate. No multi-practitioner,
client-facing surface ships until the gates pass.

---

## The ask

Turn tonight's hand-authored, single-client Soul Portrait (+ Inner Guide encounter) into a
**Studio field** that any practitioner can use to create, review, and deliver portraits for
their own clients and friends.

---

## What already exists (build on it — don't rebuild)

The honest picture: the model, the store, the permission logic, the encounter substrate, auth,
and PDF are **already down**. The gap is generation, ownership, scoped delivery, and the UI.

- **Schema + renderer** — `LiterarySoulPortrait` (`lib/soulPortrait/schema.ts`) + a fixed
  renderer. Recognition + encounter content model, proven across ~10 portraits.
- **Persistence (Gate 2)** — `soul_portraits` table, **deployed and inert**. The store exists.
- **Permission primitive (Gate 3)** — `lib/soulPortrait/consentAccess.ts`, **built and inert**
  (PR #564). Consent-liveness logic ready to wire.
- **Inner Guide Field** — spec + `inner_guide_facet_state` migration + lab tool (deployed).
  The encounter substrate.
- **Studio** — Session Room, bookings (`clientId`/`clientName`), client records, the
  recording-consent gate, Relationship Memory v1.
- **Auth** — members + **magic-link + email-code** (passwordless client sign-in, live).
- **PDF** — a proven render step (headless Chrome → light print PDF).
- **Governance** — Path B spec, Co-Lab release gate, constitutional verifiers, sovereignty
  invariants, Traceability Covenant.

---

## What needs to be built (the gap)

### 1. DB-backed portraits + practitioner ownership
Move from hand-authored `.ts` files → rows in `soul_portraits`. Each portrait carries
`practitioner_id` (owner), a `subject` (client/friend), `slug`, `content` (JSON), `mode`. The
registry becomes a DB lookup; the route/renderer read from the DB, not the static map.

### 2. The generator (chart → portrait) — the biggest piece
The held Path B generator: birth data → chart → Spiralogic dynamics → authored prose (Claude),
under the **Traceability Covenant** (chart data only, fresh prose, orient-not-prescribe).
**v1 should be practitioner-assisted** — the practitioner reviews and edits a generated draft
rather than shipping fully auto-authored text. Keeps a human in authorship (sovereignty).

### 3. Scoped access + consent (Gate 4)
Today's gate admits *any* signed-in member. For clients, each portrait must be scoped to
**the practitioner + that one client**. Requires:
- Per-portrait access rules (owner + granted subject), via the Gate 3 helper wired to a real caller.
- A **consent ledger** (Gate 4): who consented to receive/hold it, revocable; guardian consent for minors.
- Delivery surfaces: client sign-in link (member, scoped) · private share-link (tokened, revocable) · PDF.

### 4. Studio UI — the "field" itself
A practitioner surface: pick/enter a client + birth data → generate → review/edit → deliver
(link / PDF) → tied to the client record, optionally shareable in the Session Room. A new
per-practitioner "Soul Portraits" field in Studio.

### 5. Server-side PDF export
Productize tonight's manual render into a **"Download PDF"** route/service. One click per client.

### 6. Encounter mode as a Studio surface
The Inner Guide encounter as a distinct **mode** beside recognition (per the mode-not-type
architecture), drawing the same substrate — the client-centered Session Room page, properly integrated.

---

## Gates — non-negotiable (this is client data, multi-practitioner)

- **Co-Lab Release Gate** — `verify-constitution-colab` must pass 31/31 before any
  practitioner/tester invite. This feature *is* its trigger set: client data, sessions/encounters,
  files, roles, migrations touching those tables.
- **Consent architecture** — Path B Gates 3 + 4. No client delivery without consent on the ledger.
- **Sovereignty invariants** — practitioner ↔ client jurisdiction (personal MAIA stays member-only);
  cultural sovereignty (no framework imposition); the portrait as a *rendering, not a verdict*.
- **Traceability Covenant** — chart data only; fresh prose; no reproduction of source interpretation;
  no fabricated placements.
- **`architectural-integrity` skill** governs each implementation step.

---

## Suggested sequence

1. **Foundation** — DB-backed portraits + practitioner ownership + read-from-DB route (Gate 2
   store, Gate 3 access wired). Internal only, no delivery.
2. **Generator v1** (practitioner-assisted) — birth data → draft → practitioner edits → save.
3. **Delivery** — scoped sign-in link + PDF export + consent ledger (Gate 4).
4. **Studio field UI** — the practitioner-facing surface.
5. **Encounter mode** — the Inner Guide surface beside recognition.
6. **Gate + invite** — pass the Co-Lab release gate + constitutional verification → open to other
   Studio members.

Realistically a multi-week build. But the foundation — store, permission primitive, schema, auth,
PDF, encounter substrate — is already in the ground; this is assembly + the generator + the gates,
not a green field.
