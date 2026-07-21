# EA Assessment — Live Member-Facing Evidence (2026-07-21)

**Status:** Evidence record only. Documents what the live surface actually renders, witnessed via founder screenshot during the 2026-07-21 beta walk. No corrective implementation is authorized by this document (per `ELEMENTAL_E0_RULINGS_2026-07-21.md`, ruling E0.2 — "no corrective implementation authorized; the surface is recorded as a live constitutional mismatch").

**Surface:** `https://soullab.life/maia/community/elemental-alchemy/assessment` (results view)
**Code:** `app/maia/community/elemental-alchemy/assessment/page.tsx`
**Environment:** production (prod SHA `cd03493c9` era), BETA badge visible
**Witness:** Kelly, real browser session (incognito window — signed-in state not established; unauthenticated reachability **unverified**, see Open Questions)

---

## What the results screen actually renders

1. **"YOUR DOMINANT ELEMENT — Fire"** — banner headline, second person, system-computed.
2. Subtitle: *"Transformation, vision, passion, and spiritual energy"* + **"Yogic Path: Kriya Yoga"**.
3. **"Your Elemental Balance"** — five percentage bars: Fire 40% · Water 7% · Earth 7% · Air 13% · **Aether 33%**.
4. **"Your Core Strengths"** — identity chips ("Visionary leadership," "Transformative energy," "Passionate inspiration").
5. **"Shadow Awareness"** — *"Your greatest strength can become your shadow. Be mindful of:"* burnout, impulsiveness.
6. **"Recommended Practices"** — four practice cards derived from the computed element.
7. Primary CTA: **"Explore Fire Chapters"** (identity-routed content navigation). Secondary: "Retake Assessment."

## Mapping to the E0 rulings

| Rendered element | Ruling engaged | Assessment |
|---|---|---|
| "YOUR DOMINANT ELEMENT — Fire" | **E0.2** | The exact refused register: system-authored, second-person, fixed identity claim. Confirms E0.2's ruling with member-facing evidence. |
| Water 7% / Earth 7% bars | **E0.2 / §6 typing shadow** | The **deficient framing without the word** — percentage bars visually declare elemental deficiency. The Soulprint dominant/deficient pattern, live, in different clothes. |
| **Aether scored at 33% as a fifth parallel bar** | **E0.7** | *New evidence beyond the E0 audit:* the fifth-element flattening is not only in the type system — it is member-facing. Aether is presented as a scored, rankable peer of the four, directly contrary to the nonparallel ruling and canon ("it has no qualities that can be listed"). |
| "Yogic Path: Kriya Yoga" | **Invariant 14 / grammar** | *New evidence:* the surface assigns a **spiritual path**, not just an element — a second framework imposed from the same quiz, presented as fact rather than offered as lens. |
| "Your Core Strengths" / "Shadow Awareness" | **E0.1 grammar** | System-authored character claims (strengths, shadows) — essence-language extensions of the identity claim. |
| "Recommended Practices" | **E0.6** | Assigned-development register: system decides what this person should practice, derived from an identity computation. (Softened by "recommended," but the authorship direction is system → member.) |
| "Explore Fire Chapters" | **E0.2** | Identity-routed navigation: the imposed identity becomes the doorway to content. |

## What this adds beyond the repository audit

The E0 discovery established the crossing from code inspection. This evidence shows the lived surface is **more extensive than the code audit captured**:

- Aether is member-facing as a scored fifth element (E0.7 violation visible, not just latent).
- A yogic-path assignment rides on the elemental result (a second imposed framework the audit did not flag).
- Deficiency framing is present visually (7% bars) even though the page never says "deficient."
- The full arc renders on one screen: *quiz → identity → character → shadow → prescription → routed content* — the complete `system → identity → prescription` movement the grammar refuses, as a single member experience.

## Classification (per the beta-review taxonomy)

**Finding class: CONSTITUTIONAL — already ruled (E0.2).** Not a bug; the page works as designed. The design is the mismatch.

Decision options for Kelly (unchanged from E0.2, now with sharper evidence):
- **GATE/UNPUBLISH** — remove or gate the assessment route pending redesign (smallest reversible act; stops live identity assignment immediately).
- **AMEND** — re-register the results copy toward the orientation form E0.2 sketches ("Your responses made Fire especially visible today. Would you like to explore that lens?") — a larger act, touches design, needs authorization.
- **HOLD AS RECORDED** — leave live as a known mismatch until the remediation is intentionally opened.

## Second witness: the EA hub (same walk)

**Surface:** `/maia/community/elemental-alchemy?element=fire` (arrived via the "Explore Fire Chapters" CTA)

What it renders: the **book-companion hub** for *Elemental Alchemy — The Ancient Art of Living a Phenomenal Life*, by Kelly Nezat. Six chapter cards (Foundation ×5 chapters; Fire, Water, Earth, Air, Aether ×1 each) with descriptive taglines; Preface and Introduction links; three doorways — "Discover Your Element" (the assessment), "Guided Practices," "Elemental Journal"; a 0% reading-progress bar.

**This narrows the constitutional finding in four ways:**

1. **The mismatch is localized to the assessment, not the EA surface as a whole.** The hub's own register is largely legitimate — *"Explore the five elements and discover the ancient wisdom for transformation. Each element offers unique teachings for your journey of becoming"* is invitation/exploration language: elements as **teachings to explore**, not types to be. The hub demonstrates that the legitimate form already exists on the same surface.
2. **Authorship analysis differs for the book itself.** The chapters are Kelly's authored book — the author-to-reader relationship, which a member *chooses* to enter by reading. An author teaching five elements is authored content, not platform identity assignment. The constitutional line is crossed only where the platform *computes* a result and asserts it in second person. Book teaches; assessment assigns.
3. **The identity-routing appears cosmetic, not filtering.** `?element=fire` renders the full hub with all six cards equally visible — no content is hidden or gated by the computed identity. This lowers the severity of the "routed content" finding from the first witness: the route parameter decorates; it does not partition.
4. **The Aether-as-fifth-parallel flattening has a traceable origin.** The book structures Aether as a fifth chapter ("Unity, transcendence, infinite potential, and integration") — legitimate as book structure. The platform inherited that book structure into a *scoring model* (Aether 33%), which is where book-legitimate became platform-mismatched. E0.7's reconciliation has a concrete lineage to work with.

**One hub-level flag remains:** the CTA phrase **"Discover Your Element"** is identity-register at the doorway ("your element" — possessive essence, discovery-of-what-you-are) even though everything behind the other doors is exploration-register. If the assessment is ever re-registered per E0.2, this entry phrase is part of the same edit (e.g., "Explore the elements" / "Which element is speaking right now?").

**Net effect on the decision options:** unchanged in kind, but the AMEND path is smaller than the first witness implied — the hub needs (at most) one CTA phrase change; the surgical target is the assessment's results screen and its scoring model. GATE/UNPUBLISH likewise narrows: gating the assessment route alone suffices; the book hub can stay live as-is.

## Open questions

1. **Unauthenticated reachability:** screenshot was taken in an incognito window; whether the assessment renders without sign-in is unverified (LAN hairpin-NAT prevents external-path verification from the dev machine — verify from cellular or an external host).
2. Whether results persist anywhere (member record, localStorage, analytics) or are ephemeral to the session — not yet audited.
3. Whether the "Explore Fire Chapters" routing filters content visibility elsewhere in the EA hub.

---

*Evidence recorded during the 2026-07-21 beta walk. The remediation decision remains Kelly's to open; nothing in this record changes the running system.*
