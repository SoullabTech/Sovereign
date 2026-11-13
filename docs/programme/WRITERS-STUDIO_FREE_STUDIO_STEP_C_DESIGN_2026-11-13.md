# Writer's Studio — Step C design: the plans surface and a taste of Pro (2026-11-13)

**Standing:** design `PROPOSED`; the four §5 rulings are TAKEN (founder, 2026-11-13). Docs only. ⛔ No code, no copy shipped, no price, no checkout.
**Code read at:** canonical `deb062753f` + step A (#2264) + step B (#2266).
**Parent:** `WRITERS-STUDIO_FREE_STUDIO_PLAN_2026-11-13.md` (step C).

**Founder direction (2026-11-13):** *"the ideal is to give them a taste of pro and encourage them to go pro."*

## 1. What already stands (recovered, not re-decided)

- **A plans page was already designed and contracted on 2026-10-22**, on the unmerged branch
  `feature/ws-free-pro-beta-r1-20261022`:
  - `app/writers-studio/plans/page.tsx` and `docs/design/contracts/writers-studio-free-pro.md` (with screenshots);
  - arrival line **"Your voice belongs to you."** · Free: *"Discover your voice"* · Pro: *"Deepen your craft"*;
  - "Begin freely. Deepen your craft when you choose. MAIA works alongside you without taking authorship away.";
  - working price hypothesis **$19/month or $180/year**, shown as "proposed" (`WS-FREE-PRO-BETA-R1_2026-10-22.md`);
  - **deliberately excluded:** payment buttons while checkout is held; diminishing authorship, privacy, deletion or
    basic export on Free; any timer or trial-expiry claim; live promises about held features; generic Soullab tiers
    misrepresented as Writer Pro; unsolicited enrollment.
- **2026-11-02 rulings:** Free = the whole Studio on one active Work; Pro = more Works + each Pro capability *as it
  ships*; a Pro capability that does not exist is never offered or marketed as available; the paid plan is to be
  renamed away from "Pro" before members see it (**name still owed**).
- **2026-11-13 principle:** Pro unlocks capabilities; it never holds a writer's work hostage.

## 2. Limits from canon that the "encourage" part must respect

| Source | Limit |
|---|---|
| `SOULLAB-CONSTELLATION-01` Law 5 | Referral is **relational, never promotional**: mention more only where it arose in the current work. |
| Law 7 | **Declining costs nothing.** Saying no never reduces access, standing or quality. |
| Law 9 | **Measure service, not manipulation.** Attribution may not become psychological coercion. |
| `MAIA_SOVEREIGNTY_INVARIANTS` | No engagement optimization; no closed-loop runtime member optimization ("member → behavior signal → automatic adaptation"). |
| `MAIA_SANCTUARY_ECONOMY` (governs all pricing and tier decisions) | **No one pays for depth. No one gets a lesser MAIA.** Prohibited: "better insight quality for paying users", "deeper emotional intelligence for paying users", "premium wisdom", "any framing where stopping payment degrades the relationship". |

**Consequence for Pro's description:** Pro may be described only as **capacity and tools** — more Works, the
whole-book editorial pass, and later Publish preparation and Listen when they ship. It must **never** be described as
better, deeper or "expanded" MAIA.
⚠️ `planPolicy.ts` lists `expanded_maia` as Pro; this design recommends it is never marketed (and is a candidate for
removal from the Pro list) because it reads as "a lesser MAIA on Free".

## 3. What Pro actually gates today (the only possible tastes)

1. **The whole-book editorial pass** (`writing.wholeWork`; `WS_PRO_GATE_ENABLED`) — built.
2. **Starting more than one Work** (step A) — built.
3. Publish preparation, Listen, advanced Academy — **do not exist**; may not be tasted or promised.

## 4. Recommended design

### 4.1 The taste: one complimentary whole-book editorial pass
- Every Free writer may run the **whole-book editorial pass once**, on a Work of their choosing.
- The editorial letter it produces is **theirs to keep forever**, like everything else they write.
- No timer, no countdown, no expiry, no "trial". It is simply a first one, offered once.
- Server-side: a one-row-per-member ledger (`writers_studio_pro_tastes`: member, work, used_at), claimed atomically
  when the pass starts; `writing.wholeWork` admits a Free writer whose taste is unclaimed, with basis `free_taste`;
  a failed pass gives the taste back. Built dark behind its own switch.
- Why this taste: it is the one real, valuable Pro capability; it shows what Pro adds on the writer's own work; it
  leaves nothing that is taken away afterwards (unlike a temporary second Work, which would create exactly the
  "stopping payment degrades the relationship" moment the canon forbids).
- Expired beta testers have already had a year of Pro; they would not receive a further taste (recommendation).

### 4.2 Where Pro is mentioned (relational, never promotional — Law 5)
Only at the moment the writer **meets** a Pro capability:
- running the whole-book pass when the taste is used: *"Your first whole-book editorial pass was on us. Further passes
  are part of Writer's Studio Pro."* — with "About Pro" and "Not now";
- starting a second Work (step A's message, plus an "About Pro" link);
- the plans page, reachable from the Studio's existing navigation and the dead `/writers-studio/plans` link.
Never: on arrival, on a timer, in a banner across writing, by email, or by MAIA bringing it up unprompted.
"Not now" is remembered and the same prompt is not repeated for that capability (Law 7).

### 4.3 The plans page
Restore the 2026-10-22 design with these changes:
- **Free first, stated fully:** the whole Studio on one Work, MAIA alongside, inspiration, develop and review,
  export, privacy and deletion — "Your writing is always yours, on any plan."
- **Pro as capacity and tools only:** more Works at once, whole-book editorial passes; Publish preparation and Listen
  listed only once they ship (until then, not mentioned — 2026-11-02 ruling).
- **No price and no checkout** while payment is out of scope (2026-11-02); a "proposed" price invites a purchase that
  cannot be made.
- **A way to ask:** "Ask about Pro" records a request for the founder (member, time, optional note); no payment,
  no automatic grant, no follow-up sequence. The founder answers personally.
- Writers on an active beta grant see their end date and "Pro is included in your beta" (the #1800 rulings).

### 4.4 Measurement (Law 9)
Count only: tastes used, "Ask about Pro" requests, plan changes. No per-member behavioural targeting, no adapting
prompts to individual behaviour, no manuscript content in any metric.

## 5. Founder rulings (TAKEN, 2026-11-13, in session — each took the recommendation)

1. **Plan name: "Writer's Studio Pro".** The 2026-11-02 instruction to rename away from "Pro" is retired.
2. **The taste: one complimentary whole-book editorial pass per Free writer**, on a Work of their choosing; the letter
   is theirs forever; no timer and nothing taken away afterwards; former beta testers do not receive another.
3. **The way to ask: "Ask about Pro", no price.** An in-Studio request the founder answers personally; no price shown
   until checkout exists; no follow-up sequence.
4. **MAIA is never sold:** Pro is described only as capacity and tools (more Works, the whole-book pass; Publish and
   Listen only once they ship). `expanded_maia` is removed from the Pro list (Sanctuary economy: no one gets a lesser
   MAIA).

## 6. Build after the rulings (each its own dark PR)
C1 plans page + Experience Contract + walk · C2 taste ledger + `free_taste` basis in `writing.wholeWork` + tests ·
C3 in-context Pro mentions with remembered "Not now" · C4 "Ask about Pro" request record.
