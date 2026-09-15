# MAIA-WISDOM-CONSENT-01 · ACT 2 — CLOSED

**Status: ✅ ACT 2 CLOSED · SEAM 1 CONTAINED IN PRODUCTION · ⛔ LANE OPEN.**
**Date:** 2026-09-15 · Probes run by founder from the Mac Studio.

---

## 1. The witness

```
$ printf 'control: '
$ curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/control \
    -H 'content-type: application/json' --data '{}'
control: 401

$ printf 'knowledge: '
$ curl -s -o /dev/null -w '%{http_code}\n' https://soullab.life/api/ain/knowledge
knowledge: 401
```

With the earlier clean breakthrough probe:

| Route | Before | After |
|---|---|---|
| `/api/ain/collective/breakthrough` | **400** — handler executed | ⭐ **401** |
| `/api/ain/control` | unguarded (`shutdown`, `emergency_stabilization`) | ⭐ **401** |
| `/api/ain/knowledge` | unguarded corpus retrieval | ⭐ **401** |

⭐ **Custody answers before route logic on every probed route.** ⛔ No action verb, no
contribution payload and no query was submitted by any probe.

## 2. ⚠️ The contaminated run, and why it was refused as evidence

An intermediate attempt returned `401 · 000 · 000 · 000` twice. ⛔ **Not accepted**, and the
founder was right to refuse it. Mechanism, established from evidence in this same session
rather than assumed: zsh runs with `interactive_comments` **off** (proved earlier by
`zsh: command not found: #`), so the pasted `# REQUIRED: 401` was **three bare words**, not a
comment. curl took them as three extra targets — hence four transfers and four `%{http_code}`
lines per command, real URL first.

⭐ **`000` is "no HTTP response at all", so none of the junk targets reached the corridor** —
`-X POST --data '{}'` applied to all four, but the three that would have carried it never
resolved. ⛔ No stray request touched `/api/ain/*`.

⭐ **Instrument lesson, recorded:** a probe whose *output* can be contaminated by the paste
that invokes it is a weaker instrument than one whose output is self-labeling. The `printf`
prefix is the repair — each line now names the route it reports. **Same family as the C21
lesson** (an instrument that scanned prose failed a file for documenting its own compliance):
*the shape of the evidence must not depend on how the command was transcribed.*

## 3. Closing conditions — all met

```
deployed SHA identified          ✅  8cb640644 (image · Config.Env · printenv)
candidate lineage preserved      ✅  == origin/clean-main-no-secrets
breakthrough anonymous → 401     ✅
control anonymous → 401          ✅
knowledge anonymous → 401        ✅
no contribution/action submitted ✅
ACCESS_CONTROL_MODE unchanged    ✅  0 occurrences in the diff
Seam 2 unchanged                 ✅
Sanctuary invariant unchanged    ✅
```

**Gates:** Co-Lab boundaries `33 passed · 0 failed · 0 warned` · Jest carrier `30/30` ·
diff `+24 / −0`.

## 4. ✅ ACT 2 CLOSED — and what closure does not establish

**Seam 1 — the unauthenticated ingress into the AIN collective field — is contained in
production.** That is the whole of it.

⛔ **Still open, unchanged by this closure:**

- **Identity binding.** The handler still trusts a body-supplied `userId`. Closed today **by
  unreachability**, not by binding. ⚠️ **Mandatory before any widening beyond admin** —
  otherwise the first step toward a member-facing contribution path reopens forgery.
- **Seam 2.** `/api/between/chat` → `AINSpiralogicBridge`, gated by `!isSanctuary` and
  `AIN_FIELD_BRIDGE_ENABLED`. ⛔ **R15 is still false there**: absence of a privacy act is
  read as presence of a contribution act. **Not-private is not offered-to-the-field.**
- **`ACCESS-MATRIX-COVERAGE-01`.** 587 unmapped routes; how many are also self-undefended is
  ⛔ unmeasured. Routed out, lane not opened.
- **`MAIA-WISDOM-WITNESS-01`.** External AIN corpus census and production population truth,
  ⛔ both unreachable from any container. §2.2 of the reachability witness made B a rights
  question as well as an architecture one.
- **`MAIA-WISDOM-RUNTIME-01`.** Three layers built, none reaching the member turn.

⛔ **ACT 3 — the contribution authority model — is unopened**, and opens only by founder act.
Its question is not *how to build "Offer this to the field"* but **what gives an experience
standing to cross from a member's relationship with MAIA into the collective field.**

## 5. Standing

**✅ ACT 2 CLOSED · SEAM 1 CONTAINED IN PRODUCTION · ⛔ SEAM 2 UNRESOLVED · ⛔ R15 STILL
FALSE THERE · ⚠️ IDENTITY BINDING REQUIRED BEFORE ANY WIDENING · ⛔ ACT 3 UNOPENED ·
⛔ LANE OPEN.**

---

## 6. Closing statement (founder, 2026-09-15)

> **ACT 2 established production containment of the unauthenticated AIN HTTP corridor.
> It did not establish member consent to contribute to AIN. Authentication and
> contribution authority remain separate boundaries.**

⭐ That sentence is the whole of what closed, and the whole of what did not.

⚠️ **On the contaminated run:** the earlier `401 / 000 / 000 / 000` outputs stay in the
historical record as contaminated shell evidence. ⛔ **They are no longer load-bearing.**
The self-labelled rerun is the witness.

**Next act, when explicitly opened: `ACT 3 — Contribution Authority Model`** — defining what
must be true before anything can cross from a member–MAIA relationship into the collective
AIN field.

> *The door is shut and we watched it refuse three strangers. Nobody has yet been given a
> way to knock on purpose — and that, not the lock, is the remaining work.*
