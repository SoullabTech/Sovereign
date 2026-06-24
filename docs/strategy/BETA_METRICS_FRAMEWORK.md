# BETA METRICS FRAMEWORK — practitioner trial

**Date**: 2026-06-10
**Type**: Measurement companion to the trial protocol (which is frozen in [`SESSION_DATA_ARCHITECTURE_2026-06-10.md`](./SESSION_DATA_ARCHITECTURE_2026-06-10.md)). *No code changed; this is the instrumentation design.*
**Governing rule**: **Measure behavior exhaustively. Measure interpretation lightly.**
**Posture**: NOT a dashboard. A *small* set of event metrics — mostly **read-only queries over events that already persist** — paired with a **verbatim field-notes repository.**

**Governing principle (the whole framework in one sentence):**
> **Measure practitioner commitments, not client activity; preserve practitioner language, not founder interpretation.**

Everything below flows from this — and it is the same ethic MAIA applies to members (*member-marked over system-inferred · protect the boundaries of the people involved · let reality correct the theory*), now turned on Studio's own making.

---

## Sovereignty guardrail (canon — non-negotiable)

Per `docs/canon/MAIA_OATH.md` + Sovereignty Invariants (*agency outweighs engagement/retention; no attachment capture; Sanctuary*):

1. **Practitioner behavior is fair to measure** — professional tool, practitioner consented to the beta.
2. **Clients did NOT consent to the beta.** Any client-touching metric must use **structural events + opaque/pseudonymous ids — never client content or identity.** *"Same client twice"* = recurrence of `practitioner_clients.id` (UUID), **never** the decrypted name. *"Notes entered"* = that notes exist (count/boolean), **never** the text. The caseload schema already protects this (`client_name_encrypted`, practitioner-defined `client_identifier`) — the metrics layer **inherits** that, never decrypts.
3. **Retention metrics are diagnostic, not targets.** The healthy question is *"did Studio meaningfully participate in practice?"* — **not** *"how often did we get them back?"* Those diverge: a therapist who uses Studio **only before sessions** may receive tremendous value, and a daily-active-user metric would misread that as failure. Measure return to *learn whether Studio serves* — **never to optimize for return.** A dashboard quietly inverts into a retention engine; the canon forbids that. Keep the set small for exactly this reason.

---

## What you're actually measuring: practitioner commitments (not client activity)

Every metric is really a practitioner *choice* — which is both safer ethically **and a stronger signal** (volition, not incident):

- *Client created* → the practitioner chose to **entrust a real relationship** to Studio.
- *Same client twice* → the practitioner **relied on continuity.**
- *Prepare Me before 2nd session* → the practitioner **expected support.**
- *Voluntary return* → the practitioner **chose to re-enter.**

These are practitioner behaviors, not client analytics. Naming the commitment keeps the boundary clean *and* sharpens the signal — an event can be incidental; a commitment is volitional.

---

## Exploratory vs structural metrics (which numbers you can stand behind)

- **Exploratory — trustworthy immediately:** client created · session completed · voluntary return. (Event integrity is local — the row exists or it doesn't.)
- **Structural — require architectural integrity first:** same client twice · continuity usage · relationship-memory demand · longitudinal preparation patterns. These depend on the **booking → Session Room → review → Prepare Me chain being canonically connected.** Until it is (0% linkage today), they are **suggestive, not authoritative — report them as such.**

This is *built ≠ wired ≠ surfacing ≠ verified* applied to numbers: don't let a structural metric read as authoritative when its substrate isn't connected. **The beta doesn't need perfect measurement — only enough to discover whether a field is forming.**

---

## If forced to choose: field notes win

Between *perfect event tracking + weak field notes* and *imperfect tracking + excellent verbatim notes*, **choose the second.** The first cohort teaches through **surprises** — and surprises arrive as language, contradiction, unexpected behavior, and moments of trust, not as counts. Counts tell you *that* something happened; field notes tell you *what* happened. Protect the notes side first.

---

## Most of this already persists — query layer, not new infra

(Verify-before-build, applied to metrics. Sources confirmed this session.)

| Scorecard event | Source (exists today) | Note |
|---|---|---|
| Created first client | `practitioner_clients` | ✓ read-only |
| Scheduled first session | `sessions` | ✓ (booking↔scribe link 0% — see below) |
| Entered Session Room | `scribe_sessions` (`container='practitioner'`) | ✓ |
| Completed session | `sessions.status='completed'` / `scribe.ended_at` / `practitioner_sessions` | **ambiguous — the connection deficit surfaces here** |
| Returned voluntarily | `members.last_sign_in` / repeat activity over days | ✓ |
| **Used same client twice** | 2+ sessions for one `client_id` | **north-star — gated, see below** |
| Prepare Me before 2nd session | briefing route hit (`/api/studio/sessions/[id]/briefing`) | likely **not a discrete event** today → the one place a tiny log/event may be warranted (confirm first) |
| Referred a practitioner | trusted-colleagues `referral_requests`/`practitioner_connections` *or* team invites | map/confirm; may need wiring |

→ ~6/8 events are **read-only queries over existing rows**; ~1–2 need a tiny event or mapping. **Build almost nothing.**

---

## The one metric to watch — and why it's gated

**% of practitioners who return to the same client a second time.** It silently contains activation + trust + continuity + memory + workflow adoption — one number, many thresholds crossed.

**But it is computable in *form*, unreliable in *fact*, until the canonical-session-record connection deficit is resolved.** Sessions are scattered across `sessions` / `scribe_sessions` / `practitioner_sessions` at **0% cross-linkage**; you cannot reliably count "same client twice" while a client's two sessions may live in different, unlinked tables. **The metric you most want and the architecture fix you deferred are the same problem.** (And during the clean trial it reads ~0 regardless — pre-adoption.)

---

## The five layers (small, event-based)

1. **Activation — *did they cross into practice?*** account created · first login · first client · first booking · first Session Room entry · first session completed.
2. **Continuity — *did they come back?*** return ≤7d · return ≤30d · same client revisited · Prepare Me opened before 2nd session · 2nd session completed. *(Strongest single signal: practitioners who worked the same client twice.)*
3. **Trust — *did they bring real work?*** clients created · real sessions captured · notes entered · reviews completed · follow-up plans created. *(Entering a real client says more than any survey — measured as counts, not content.)*
4. **Recognition — *did it matter?*** **Qualitative. Do not score. Do not chart.** Verbatim quotes · spontaneous observations · adoption language · unexpected uses · contradictions to founder assumptions. → a **field-notes repository**, not a dashboard.
5. **Referral — *is the field forming?*** invitations sent · beta referrals · practitioner-to-practitioner introductions · requests to add colleagues. *(Practitioners bringing practitioners = something different is happening.)*

---

## Per-practitioner scorecard (paired with field notes)

| Event | Y/N |
|---|---|
| Created first client | |
| Scheduled first session | |
| Entered Session Room | |
| Completed session | |
| Returned voluntarily | |
| Used same client twice | |
| Used Prepare Me before 2nd session | |
| Referred another practitioner | |

Pair every scorecard with verbatim notes:
> *"I didn't want to prepare without it." · "I finally had context before the session." · "I kept coming back."*

**The metrics tell you what happened; the field notes tell you what it meant.** Neither alone is enough; together they're a far clearer picture than either.
