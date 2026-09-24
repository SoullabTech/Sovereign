# MAIA-MAVEN-T1A — POST-J6 REPAIR EVIDENCE

**Date:** 2026-09-17
**Status:** ✅ J5 REPAIR TECHNICAL EVIDENCE PASS · J6 NOT REOPENED
**Founder authorization:** “yess lets resolve it” following the J6 W2 STOP and the founder’s Keep-identity observation
**Frozen failed witness candidate:** `7b5942c70e00a065b67f196033f20630ecb368da`
**Repair implementation:** `b3d5579e2aa1294a72e1771d369cfea4ba030d28`
**Canonical reconciliation merge:** `e3bc2e44f6a54d3b2eae6e13ed2991596be8a104`
**Branch:** `feature/maia-maven-t1a-j6-repair-20260917`

```text
Class: Class A — memory handling / member sovereignty / consent boundary
Governing authority: J6 founder STOP + founder “resolve it” act + T1-A J4 §§3,5–7 + R8/R9/R10/R11 + Representation Authority Law
Current gate: J5 — technical evidence for the post-J6 bounded repair
Evidence subject: repair implementation b3d5579e2 and canonically reconciled runtime tree e3bc2e44
Stop boundary: no merge, deploy, production migration, J6 resumption, or capability widening
```

This proves the bounded repair mechanically on the named candidate lineage. It does not prove founder experience, beta-member experience, production migration safety, or deployment safety.
---

## 1. Why this repair exists

J6 was opened against the frozen Class A candidate `7b5942c70e00…`.

W0 passed. W1 passed: generic `keep this` refused to choose a referent and created zero Keep/moment/capsule objects.

W2 preserved the exact member-authored text, but one intended **Keep this moment** act produced two durable `episodic_memories` rows. Runtime logs showed two successful POSTs to `/api/sovereign/episodes/mark`. Under the founder ruling, ambiguity stopped J6.

After the stop, the founder identified a second human-experience defect:

- inline **Keep this moment** went to **Moments**;
- header/bookmark/popup-style **Keep** led toward Reflection/Capture surfaces.

Repository tracing confirmed different governed objects were wearing the same word.

A third linked finding emerged from the same census: marked Moments were ambient-recall eligible behind a member-level Boolean that defaulted TRUE. Thus the Moments copy “may return” described live old behavior, and KEEP still implied REOPEN for this memory family.
---

## 2. Founder-authorized repair boundary

The repair is limited to three consequences of those findings:

1. **Moment cardinality**
   - one exact selected source message must produce at most one durable Moment;
   - identical words in different source messages remain distinct member acts.

2. **Moment KEEP ≠ REOPEN**
   - a new Moment is private/sealed by default;
   - ambient return requires a separate explicit member act with durable authority provenance;
   - legacy marked Moments are authority-ambiguous and fail closed.

3. **Qualified names**
   - exact verbatim object: **Keep this moment** → Moments;
   - Field object: **My Keeps / Keep this for me**;
   - interpretive object: **Reflect / Capture a reflection** → Reflection Capsule.

No START_FRESH, CONTINUE, MAIA-authored exact-message adoption, new relevance selector, Reflection redesign, production migration, deploy, or merge is authorized here.
---

## 3. Repair A — one exact message, one durable Moment

The live formation path now sends the message’s stable client identity:

```text
sourceSessionId: sessionId
sourceTurnId: message.id
```

POST `/api/sovereign/episodes/mark` requires both source pointers. Missing `sourceTurnId` is a 400 refusal before INSERT.

Migration `20260917220000_episodic_moment_return_authority.sql` adds the partial unique index:

```sql
(user_id, source_session_id, source_turn_id)
WHERE marked_by_member = TRUE
  AND source_session_id IS NOT NULL
  AND source_turn_id IS NOT NULL
```

The INSERT uses that exact identity as its conflict target. Same-message retries converge on the existing row. Different source-message identities remain independently keepable even when the verbatim bytes are identical.
### PG17 concurrency witness

Disposable PostgreSQL 17.7, never production.

Two simultaneous INSERTs for the same member/session/turn produced:

```text
request A → episode 9e449c02… | created=true
request B → episode 9e449c02… | created=false
durable row count for that exact source message → 1
```

Control:

```text
same verbatim text
sourceTurnId = turn-a
sourceTurnId = turn-b
durable row count → 2
```

Therefore the repair collapses duplicate delivery/retry of one governed act without collapsing two genuinely distinct member acts.
---

## 4. Repair B — Moment KEEP does not grant REOPEN

The migration adds to `episodic_memories`:

```text
return_preference:
  member_pulled
  contextual_doorway

return_authority:
  legacy_ambiguous
  default_private
  member_explicit
```

Existing member-marked rows become:

```text
member_pulled + legacy_ambiguous
```

No legacy return consent is invented.

New Moments explicitly form as:

```text
member_pulled + default_private
```

Only the member’s per-Moment PATCH gesture may write `member_explicit`.
The ambient episodic loader now requires all of:

```sql
marked_by_member = TRUE
AND return_preference = 'contextual_doorway'
AND return_authority = 'member_explicit'
```

`members.episodic_recall_enabled` remains a global suppression switch. TRUE does not grant return authority; FALSE suppresses otherwise-authorized Moment return.

The Moments room now exposes the distinction directly:

```text
Sealed → Allow return → May return → Reseal
```

and says:

> Keeping a moment holds it here. It does not give MAIA permission to bring it back.

The prior “A kept moment may return…” copy is removed.
### PG17 return-authority witness

On the new Moment created by the concurrency witness:

```text
formation:
member_pulled | default_private | eligible=false

explicit Allow return:
contextual_doorway | member_explicit | eligible=true

explicit Reseal:
member_pulled | member_explicit | eligible=false
```

Legacy witness rows after migration:

```text
3 marked rows → member_pulled | legacy_ambiguous
```

This is fail-closed without rewriting history as consent.
---

## 5. Repair C — one qualified name, one governed act

The candidate now presents:

| Member-facing name | Governed object |
|---|---|
| **Keep this moment** | exact member-authored episodic Moment |
| **My Keeps** / **Keep this for me** | Field / Keep object |
| **Reflect** / **Capture a reflection** / **Capture the Spirit** | interpretive Reflection Capsule |

The header/mobile capture action formerly labeled **Keep** is now **Reflect**.

The Sacred Lab drawer formerly labeled **Keep this moment** while invoking `capture-spirit` is now **Capture a reflection**.

The capture tooltip now says **Reflect** and names a Reflection Capsule.

The pre-conversation Arrival bookmark that invoked `capture-spirit` has been removed. There is nothing yet to reflect on, and it was not an exact Keep.

Reflection save copy now says **Reflection saved** / **Save this reflection first**, rather than **Kept** / **Keep this first**.
A source census over the core MAIA surfaces finds no remaining Reflection/Capture action labeled generic **Keep**. The remaining Keep language is qualified around exact Moments, My Keeps, or Field acts.

This repairs the R8 collision without redesigning the sacred `/maia` visual surface. Placement, palette, composition and interaction language remain intact; only the authority-bearing names/actions are made truthful.

---

## 6. Technical evidence

Focused post-repair set:

```text
15 / 15 test suites PASS
183 / 183 tests PASS
0 snapshots
```

The set includes all 12 prior T1-A/J5 repair suites plus:

- `lib/maia/__tests__/episodicMomentReturnAuthority.test.ts`
- `components/__tests__/keepIdentityQualification.test.ts`
- the Reflection non-persistence contract suite

The episodic route suite now also proves that a valid ordinary session without `sourceTurnId` refuses before persistence.
Repository gates on the canonically reconciled tree:

```text
TypeScript no-regression:
  229 diagnostics
  baseline 239
  0 regressions
  PASS

check:no-supabase:
  PASS

git diff --check:
  PASS
```

Disposable PG17 migration + race + authority witness:

```text
migration PASS
legacy ambiguity PASS
same-message concurrency convergence PASS
different-message identity control PASS
private formation PASS
explicit return PASS
reseal PASS
```

Production remained untouched.
---

## 7. Canonical reconciliation

The repair was constructed from the frozen J6 candidate, whose canonical parent lineage contained `51d4060d…`.

Before publication, current canonical was fetched:

```text
clean-main-no-secrets = e4490f38a85f041b98c2a7f4f10a92184670fd75
common base           = 51d4060d71198ad5a36cfc6131dbfb9155617ba6
```

Changed-path overlap between intervening canonical commits and the repair: **0**.

Current canonical was merged, not rebased, preserving evidence ancestry:

```text
canonical reconciliation merge = e3bc2e44f6a54d3b2eae6e13ed2991596be8a104
```

After reconciliation, the decisive 15-suite set remained **183/183 PASS**, typecheck remained no-regression, and no-Supabase remained green.
---

## 8. Deployment / rollback hold

Before production migration, ordinary code/branch revert remains available.

After the Moment-authority migration is applied, a pre-repair application image is **not a safe rollback**: the old episodic loader ignores the new per-Moment authority fields and could ambiently re-admit marked Moments.

Therefore:

> ⛔ **DEPLOY HOLD:** no production deployment authorization until a post-migration rollback procedure preserving the fail-closed Moment-return boundary is separately specified and witnessed.

A production read-only preflight should also confirm that no existing non-null `source_session_id + source_turn_id` duplicates would block the unique index. This has not been claimed here.
---

## 9. Process nonconformance preserved

At lane opening, the chat explicitly named:

- Class A;
- the two founder findings to repair;
- no merge/deploy/production/J6 resumption.

However, the mandatory five-field JARVIS preamble was not rendered as five declarative lines **before the first repository action**.

This record does not retroactively claim compliance. The authority existed; the opening-format requirement was missed. The defect is preserved rather than rewritten.

---

## 10. Standing

```text
J6 prior candidate 7b5942c70... ............ STOPPED at W2
post-J6 repair implementation b3d5579e2 ... BUILT
canonical reconciliation e3bc2e44 .......... COMPLETE
technical suites ........................... 15/15 · 183/183 PASS
PG17 race / authority witness .............. PASS
TypeScript no-regression ................... PASS
no-Supabase ................................ PASS
production ................................. UNTOUCHED
J6 re-witness .............................. ⛔ NOT OPEN
merge ...................................... ⛔ NOT AUTHORIZED
deploy ..................................... ⛔ NOT AUTHORIZED
```

**J5 POST-J6 REPAIR TECHNICAL EVIDENCE: ✅ PASS.**

Next lawful acts: publish a draft Class A PR on the exact reconciled candidate, collect exact-head CI, then obtain a new founder ruling before reopening J6 against that new SHA.
