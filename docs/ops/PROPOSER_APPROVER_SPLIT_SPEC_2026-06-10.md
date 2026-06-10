# Proposer / Approver Split — Spec

**Status:** proposal (for Kelly's decision — not implemented)
**Date:** 2026-06-10
**Author of record:** drafted by the dev/assistant; to be reviewed under the very process it describes.

---

## 1. The problem

The covenant PR gate cannot function as designed because **proposer and approver collapse to the same identity.** Dev tooling (`gh`) authors PRs as `Soullab`, which is also the founder / required approver — so the founder can never legitimately approve, the gate reports `BLOCKED`, and the only way through is `gh pr merge --admin`.

That is acceptable **as a rare, named exception** (confirmed security holes, severe prod breakage). It is corrosive **as a workflow**: if everything ready gets `--admin`, the org learns *"blocked just means wait for someone confident enough to override,"* and the gate becomes theater.

The fix is structural: make **author ≠ approver**, and make the override **deliberate, not casual.**

```
MAIA-Bot / machine user   →  proposes PR
Soullab (human)           →  reviews → approve / reject
                          →  deploy
(no routine admin bypass)
```

This dogfoods MAIA's own sovereignty: a system that can **propose but not unilaterally dispose.**

---

## 2. Three decisions to make

### Decision A — Proposer identity: machine-user vs GitHub App

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **Machine-user** (e.g. `soullab-bot`) | A real GitHub account, added as a write collaborator; dev/CI/assistant authenticate as it (separate token) to author PRs | Fastest correct fix; PRs are authored by a clearly non-founder identity → author≠approver immediately | Consumes a seat; PAT to manage; it's a "user" |
| **GitHub App** | An installed App that opens PRs as `app[bot]` | No seat; scoped permissions; token minted per-use; cleaner end-state for automation | More setup now; slightly more moving parts |

**Recommendation:** start with a **machine-user** — it satisfies author≠approver today with minimal setup. Migrate to a **GitHub App** later if/when automation grows. Either way the bot gets **write, never admin.**

### Decision B — The gate (branch-protection ruleset on `clean-main-no-secrets`)

The bot is only the *mechanism*. The **gate is the ruleset.** Configure on `clean-main-no-secrets`:

- ✅ Require a pull request before merging.
- ✅ Require **1 approving review**.
- ✅ Require review from a user **other than the author / last pusher** (so the proposer cannot self-approve).
- ✅ **Dismiss stale approvals** when new commits are pushed.
- ✅ **Do not allow bypassing the above settings** (a.k.a. "include administrators"). ← *this is what bounds `--admin`.*
- ◻️ (optional) Restrict direct pushes to `clean-main-no-secrets` to the PR path only.

With "do not allow bypassing" ON, `--admin` stops being a casual flag: an exception becomes a deliberate **toggle-rule → merge → re-enable** act by an owner. That friction *is* the safeguard — exactly what keeps "exception" from sliding into "workflow."

### Decision C — How #379 (`add Soullab to FOUNDERS`) reconciles

`FOUNDERS` is **covenant-layer** approval recognition (in-code). Branch protection is the **GitHub-layer** gate. They are complementary, but Kelly's caution holds: *adding `Soullab` to `FOUNDERS` makes approval possible in code, but does not solve the collapse if the dev PR author is still `Soullab`.*

→ The **bot-proposer + branch-protection** is the primary fix. Decide #379 on its own covenant merits (what does `FOUNDERS` actually gate — CI? an app check?). Do **not** rely on #379 to solve author≠approver.

---

## 3. The exception policy (codify what we just did)

`--admin` is permitted **only** for:
1. a **confirmed** security / confidentiality hole, or
2. **severe** production breakage.

Even then: **review-then-exception, never blind-exception** — read the diff, confirm scope, run tests/build, then override. Name the exception in the merge/notes. Everything else (community features, operator tooling, non-severe bugs) **holds at the gate** for normal review.

*Worked precedent (2026-06-10):* PR #387 closed a live body-`userId` identity-spoof on the memory route — reviewed, 5/5 adversarial tests green, merged `--admin`, deployed, live-proven; #388/#389/#390 held. That is the shape every future exception should take.

---

## 4. Migration steps (org-admin — Kelly's hands)

1. **Create the proposer identity** (Decision A): a `soullab-bot` account *or* a GitHub App; grant **write** on `SoullabTech/Sovereign`.
2. **Hand the assistant/dev a bot credential** (a PAT or App token) so PRs are *authored by the bot*, not `Soullab`. This is the load-bearing change — until it exists, author≠approver isn't real and `--admin`-exception remains the bridge.
3. **Set the branch-protection ruleset** (Decision B) on `clean-main-no-secrets`.
4. **Smoke-test the gate:** bot opens a throwaway PR → confirm it **cannot** self-merge → `Soullab` approves → merges. Then confirm an *un-approved* PR cannot merge and that `--admin` is now blocked by "do not allow bypassing."
5. **Decide #379** separately (Decision C).

---

## 5. Sequencing

Build the gate **when there's something — and someone — to gate**, not before. The current backlog (40+ open PRs) is real backpressure; the split is what lets that queue be *reviewed* rather than *overridden*. But none of the community-roadmap items (1–6) depend on it — `--admin`-as-named-exception is a fine bridge meanwhile. Recommended order: **finish the in-flight substrate PRs through normal review → stand up the bot + ruleset → then normalize the release queue.**
