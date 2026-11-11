# Ask-answer truncation fix — exact-image admission packet (PREPARATION, not permission)

```
STATUS:    PREPARED for founder decision · ⛔ authorizes no deploy · release HOLD #1938 governs
OWNER:     Writer's Studio #1800 · Continuity #1982 · Class A #1969 independent
PREPARED:  2026-11-10, read-only (git + production `docker inspect`; nothing changed)
```

## 1. Where production and canonical stand

| | Value |
|---|---|
| Production runtime | `GIT_COMMIT=ee9dcf394` · image `sha256:94498d504674…` (tags `current` / `prod`) |
| Previous rollback tag | `maia-sovereign:previous` → `sha256:d413b819b29c…` |
| Canonical | `c3798a420` (#2210 merged) |
| Ancestry | `ee9dcf394` **is** an ancestor of `c3798a420` |

## 2. ⚠️ What deploying canonical `c3798a420` would actually ship

**This is not "the fix".**

- **65 commits** (30 merges) from **7 merged PRs**: **81 files**, +5,181 / −2,339.
- **No database migrations.**

| PR | What it is |
|---|---|
| #2176 | `fix(astrology)`: calculator accuracy (Dreamspell, Chinese year, Four Pillars, houses, retrograde, Lilith, ayanamsa) |
| #2184 · #2185 · #2186 · #2187 | Astrology Pro rooms (Chinese, Vedic, Mayan) and house wheel |
| #2200 | `feat(astrology-pro)`: the cockpit, and MAIA as a conversation |
| #2204 · #2206 · #2207 | docs only (`CLAUDE.md` thread log; Develop density spec) |
| **#2210** | **the Ask truncation fix** |

**By area:** 24 files in `lib/astrology`, 17 in `app/astrology`, 4 in `components/astrology`, 5 in `app/api` (4 Astrology, plus one line in
`app/api/between/chat/route.ts`: transit phase wording "phase not established"), 2 in `lib/manuscript` and 1 in `app/writers-studio`
(#2210), plus docs and scripts.

**Consequence.** A deploy of canonical admits the Astrology Pro lane's work to production as well. That lane has its own
acceptance standing, which this packet has **not** assessed. This is the "merge-to-canonical is latent deploy authorization"
problem recorded on 2026-09-07, observed again.

## 3. Candidates (founder decision of principle)

- **(A) Canonical `c3798a420`.**
  - Ships everything in §2.
  - Requires the Astrology Pro lane's own admission evidence before it is lawful.
- **(B) A hotfix commit:** `ee9dcf394` plus #2210's two commits only (`3f90802f8`, `b65b7ab7a`), on a branch cut from production's SHA.
  - Ships only the fix.
  - Production would run a SHA that is not on canonical. The next canonical deploy would include it anyway.
  - It needs its own CI run and image.

**Recommendation: (B)** if the fix should reach production before the Astrology Pro lane is admitted. Otherwise **(A)**, after
that lane's admission. ⛔ Neither is chosen here.

## 4. Gates owed before any GO

| Gate | State |
|---|---|
| #2210 frontier verification (covenant §6) | ⛔ **Missing.** Merged with Covenant Gates failed; the evidence comment is on the PR. It needs mentor disposition of provider assumptions, cost, latency, **and the iOS 30s native timeout** (`lib/http/apiBase.ts:30`; walk answers already take about 37s) |
| #2211 route-level witness | Engineering-witnessed: W9 passes on a disposable migrated DB and fails with the fix disabled; CI green. Independent review owed. Unmerged, so not part of either candidate |
| Class A #1969 (H1 admission across session changes) | Open, and independent. Neither candidate changes H1 code (`useHouseStudioH1WorkClaim` untouched since `ee9dcf394`) |
| Source-write and render edge holds | Unchanged by either candidate |
| Founder exact-image GO under #1938 | Not given |

## 5. Rollback basis

- The deploy refreshes the rollback tags.
- If the swap or verification fails, **roll back to `sha256:94498d504674…` (`ee9dcf394`)**, the image running now.
- Neither candidate has a schema change, so rollback is image-only.

## 6. Post-deploy witness (what makes it "live", not "deployed")

1. `docker exec maia-sovereign printenv GIT_COMMIT` must equal the chosen SHA.
2. The Co-Lab gate must report `0 failed`.
3. **The first Work-conversation answer** must have `answer_provenance.stopReason = 'end_turn'` and `outputTokens < 16000`. That is the
   runtime witness the fix has never had.
4. The founder walk then resumes at W3b.

## 7. Not authorized by this document

Any deploy, choice of candidate, hotfix branch creation, merge of #2211 or #2212, mentor sign-off, or change to HOLD #1938 or Class A
#1969.
