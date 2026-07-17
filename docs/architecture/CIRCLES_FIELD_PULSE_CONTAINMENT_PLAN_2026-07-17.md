# Circles Field Pulse — Containment Plan & Isolated Patch Proposal — 2026-07-17

**Status**: Register D2, delivered. **Classification: sovereignty defect, actively
exposing** — per the escalation clause in Kelly's ruling ("if the current pathway is
actively exposing private inferred content, classify it as a sovereignty defect and
prepare an isolated patch proposal"). The pipeline is byte-identical on
`clean-main-no-secrets` and plausibly live in production (inventory §9). This document
is the patch **proposal**; no code has been changed. Implementation awaits Kelly's
go — flagged as ready for immediate execution.

**Ruling being enforced (R5)**: *Suspend inferred-theme contributions to the Circles
field pulse until explicit collective eligibility, minimum cohort thresholds, and
re-identification protections exist.*

---

## 1. What is exposed, precisely

Any active member of a circle can fetch `GET /api/circles/[circleId]/pulse` and see up
to 3 qualitative descriptions (e.g. "Themes of memory and return are surfacing") derived
from **system-inferred** theme signals of circle members, whenever ≥2 distinct members'
signals share a category within 14 days. No identity, no counts, category-level only —
but: no member ever consented to inference-derived material reaching a shared surface;
the cohort floor is 2; and in a small intimate circle the reasonable-participant test
(R6) can fail ("that's clearly about the two of us / about her").

Severity is moderated by coarseness (6 fixed categories, atmosphere language) — this is
not content leakage. It is an unconsented inference crossing, which R5 suspends
categorically.

## 2. The smallest change (the patch)

**One edit, one file**: in `lib/circles/fieldPulseService.ts`, short-circuit the theme
aggregation inside `getCirclePulse()` (`:53-78`) so the inferred-theme query never runs
and `signals` from themes is always empty. The pulse's other inputs
(inquiry/movement, `:80-108`) continue to work; the UI (`FieldPresence`) degrades
gracefully to its quiet/forming states. `getCirclePulseLight()` needs nothing (it never
read themes).

Shape of the change (illustrative, not applied):

```ts
// R5 (2026-07-17): inferred-theme contributions to the field pulse are SUSPENDED.
// member_theme_signals must not cross into any shared surface until explicit
// collective eligibility, cohort thresholds, and re-identification protections
// exist. See docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md
const themeSignals: PulseSignal[] = []  // was: await query joining member_theme_signals
```

Why this seam and not the route: the service is the single place the JOIN exists;
killing it there guarantees no other present or future caller of `getCirclePulse` can
re-expose themes, and it leaves the pulse feature itself standing (the ruling suspends
an input, not the surface).

Explicitly **not** in this patch (kept minimal, per "smallest change"):
- Writers untouched — signals keep accruing internally (R4 permits candidate detection).
- No schema change, no deletion of existing rows, no threshold redesign (that is the
  future collective-eligibility work, register U4/U6).
- No prompt-injection change — that is a separate seam with its own ruling posture
  (R4 freeze = no *expansion*; removing existing prompt influence is a behavior change
  for Kelly to sequence — see §4).

## 3. Verification plan for the patch

1. Unit/route test: pulse response for a circle with qualifying theme signals contains
   no theme-derived entries; inquiry/movement entries unaffected.
2. Constitutional test candidate (refusal-registry pattern): assert no reader of
   `member_theme_signals` exists outside `getRecentThemes` (member-scoped) — i.e., the
   cross-member JOIN stays dead. Mirrors the proven `refusal-02` no-readers shape.
3. Production verification after deploy: authenticated pulse fetch on a real circle
   shows no theme signals; standard deploy checks (container freshness, GIT_COMMIT).

## 4. Companion decision for sequencing (not in the patch): prompt injection

The same inventory found the Member Web prompt block labels inferred themes
**"self-observed"** — misrepresenting system inference as member self-observation
(inventory §3). Under R4 ("do not represent inferred themes as confirmed identity or
meaning") this label is already non-compliant. Two options for Kelly:

- **4a (label fix only, minimal)**: reword the block to candidate language — e.g.
  "Possible recurring threads (system-noticed, unconfirmed — treat as questions, never
  as facts about the member)" — no behavioral removal. Smallest honest fix; keeps
  current continuity feel.
- **4b (freeze injection entirely)**: empty `recurringThemes` at
  `MemberLiveContext.ts:398` until the ratification architecture subsumes the pipeline.
  Cleanest constitutionally; removes a continuity input members may currently be
  benefiting from.

Recommendation: **4a now** (it corrects a misrepresentation, which is within the freeze
posture) with 4b's seam documented for the subsume phase. The circle-pulse patch (§2)
should not wait on this choice.

## 5. Deployment note

The defect is live on the deploy branch; the fix is one service-file edit and can ship
via the quick `maia`-only lane once merged to `clean-main-no-secrets` through the normal
PR path. Since the current branch carries substantial unrelated work, the patch should
be a **separate branch off clean-main-no-secrets** (isolated patch discipline, same as
the Sanctuary fix), not a commit on `feature/practitioner-program-platform`.

## 6. Interim honesty

Until patched, the exposure continues. If any real circles currently have ≥2 members
with overlapping 14-day signals, their pulse is showing inference-derived atmosphere
now. A production query can size the actual exposure:

```sql
SELECT cm.circle_id, mts.theme, COUNT(DISTINCT mts.member_id) AS members
FROM member_theme_signals mts
JOIN circle_memberships cm ON cm.member_id = mts.member_id AND cm.status='active'
WHERE mts.detected_at > NOW() - INTERVAL '14 days'
GROUP BY 1,2 HAVING COUNT(DISTINCT mts.member_id) >= 2;
```

Zero rows would mean the defect is structural but not currently manifesting; any rows
mean live circles are seeing it today. Recommended as the first act of the patch phase,
alongside the Sanctuary audit's §4 queries.
