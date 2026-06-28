# Soul Portrait — Deploy Posture & Gating

- **Date**: 2026-06-18
- **Status**: Augusten (Path A) and Katie (Path A.2) are deliberate, **documented hand-delivered exceptions** — *not* the production pattern.
- **Governing principle**: *A sacred exception may precede the system pattern, but it must not become invisible precedent.* For the author's own child, father-held consent is real. For the platform, consent architecture must come first.

---

## Path A — the first sacred instance (Augusten)

Augusten Lucas Nezat (14, the author's own son) receives the first Soul Portrait + MAIA Mentor under an explicit, **family-held** posture. This ships *only* because the author is the parent and holds consent directly.

Posture — each item is **structurally enforced**, not merely promised:

| Guarantee | Where it lives |
|---|---|
| **Unlisted** — no navigation link; reachable only by direct URL | registry is slug-only (`lib/soulPortrait/registry.ts`); nothing links it |
| **noindex / nofollow** | `app/soul-portrait/[slug]/page.tsx` → `robots: { index: false, follow: false }` |
| **Rate-limited** | `app/api/soul-portrait/[slug]/mentor/route.ts` → per-IP-per-portrait cap |
| **No retention** | Mentor logs only `{ slug }`; **no question content** is stored or logged |
| **Parent-mediated access** | the parent hands the link personally; **no email/SMS/auto-send to the minor exists** in this feature |
| **No general exposure** | one portrait (`augusten`); no creation flow, no listing, no discovery |

This posture is **not generalizable**. It is valid solely because the author is the child's parent.

## Path A.2 — the second hand-delivered exception (Katie)

Katie Claire McCullen (an **adult**, the author's niece) receives a **Gift Portrait** under the same relationship-held posture — extended **deliberately, not by drift** (Kelly, 2026-06-20). It ships *only* because it is hand-delivered by her uncle to a willing adult recipient. It is **not** Path B and **not** a public opening.

Why this is a legitimate *sibling* of Path A, not a generalization of it — each item structurally enforced:

| Guarantee | How it holds for Katie |
|---|---|
| **Unlisted** | reachable only by the direct link her uncle hands her; nothing links it |
| **noindex / nofollow** | both `/soul-portrait/katie` and the reception page `/soul-portrait/katie/welcome` |
| **No live AI** | **Mentor OFF** (`mentorEnabled` absent → 404) — unlike Augusten, Katie has *no* live dialogue surface |
| **No MAIA / memory binding** | a static gift; nothing is bound to a member record or to MAIA |
| **No retention** | no Mentor, so no question content; the page stores nothing |
| **Hand-delivered** | the uncle sends the link personally; no email / SMS / auto-send exists |
| **Access** | explicit *exact* public rules in `config/accessMatrix.ts` (like Augusten); every *other* slug stays login-gated (Gate 1) |
| **No general exposure** | one portrait (`katie`); no creation flow, listing, or discovery |

Two surfaces are distinct and intentional: the **reception threshold** (`/welcome` — "Offered with love / From Kelly", one door in) and the **immutable portrait**. A **session-aware coda** ("Return to Soullab") appears *only* to a viewer who already has an account — a non-member sees the finished gift and nothing more; it is a link, never a binding. The "much deeper" continuation (MAIA, memory, the living journal) remains **Path B**, on the platform side of the threshold, chosen by the recipient — never pushed onto the gift.

Like Path A, this posture is valid **because of the relationship**, and is **not** generalizable to strangers.

## Distinction to preserve (do not conflate)

- **The portrait text is immutable and traceable** — a stable, lovingly-authored gift; each line traces to a natal symbol / archetype / developmental frame (the Traceability Covenant). It does not change.
- **The Mentor is live, guardrailed, non-authoritative dialogue** — generated under the design law (symbolic-not-fate · companions-not-cages · becoming-not-fixed · hands-understanding-back · minor-safety), but it is *conversation*, not the gift.

## Path B — REQUIRED before any generalization

Before a Soul Portrait or its Mentor is used for **anyone other than the author's own child** — i.e. someone else's child, or any **Gift / Parent-Child / Legacy** portrait, or any public / productionized creation flow — all of the following must exist **first** (a hard prerequisite, not a follow-up):

1. **AccessMatrix entry** for `/soul-portrait/*` and `/api/soul-portrait/*` (today unmapped → allowed only by the middleware's permissive mode).
2. **Auth + consent gate** — a real authenticated, consented path; no reliance on URL obscurity.
3. **Minor / guardian consent pattern** — explicit, recorded guardian consent for any minor's portrait; age-appropriate handling and a guardian's right to revoke.
4. **Production exposure rules** — who can reach what, retention / Sanctuary posture under multi-user load, and abuse limits for an authenticated surface.

Until Path B exists, the **only** permitted live portraits are the two named hand-delivered exceptions above — **Augusten** (Path A) and **Katie** (Path A.2). No third instance, and no generalized or creation flow, ships without Path B.

## Deploy-time verification (for whoever triggers the prod deploy)

- Confirm the route is reachable under production middleware. If prod denies unmapped routes, a **public-unlisted allow-entry** is needed so the page loads — this is distinct from Path B's *auth* gate, and must not be mistaken for it.
- Confirm `robots: noindex` is served on the production response.
- The link is handed to Augusten **by the parent**, never sent by the system.
