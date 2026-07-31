# Layer 2 — Reachability Screening (detector output, not verdicts)

**Generated 2026-07-30.** **Class:** observation only.

## Detector limitations — stated before any number

A route counts as *referenced* if its literal path string appears in any `.ts`/`.tsx` under
`app/`, `components/`, `lib/`, plus `middleware.ts` and `next.config.js`, **outside its own
directory**. The detector **cannot see**: paths built by interpolation (`` `/x/${id}` ``),
segments assembled from variables, routes reached only by server redirect chains, or navigation
driven by data. **Therefore "0 refs" means "not statically detected", never "unreachable".**
Every entry below is a **review queue item**, not a finding.

> **Enforcement caveat — read before using the Declared column.**
> Tier declarations are recorded as policy, but middleware currently allows `insufficient-tier`
> requests through (`middleware.ts:304-308`, *"tier gates disabled during development"*).
> **Declared tiers must not be read as effective enforcement** unless a route carries an
> additional page, layout, API, or downstream entitlement check. Production runs
> `ACCESS_CONTROL_MODE` unset → **permissive**, so unmapped routes pass through.
> Tracked separately in `TIER_ENFORCEMENT_AUDIT_2026-07-30.md` — that question is platform-wide
> and is **not** part of the author-experience lane.

## Screening totals

| | count |
|---|---|
| routes | 500 |
| 0 detected refs | 210 (42%) |
| unmapped **and** unguarded ("the 85") | 85 |

## The 85 — unmapped and unguarded, by family

In production these pass through (permissive). **They are an unresolved policy class, not a
proven exposure set.** Classify individually; do not bulk-label.

| Family | count |
|---|---|
| `/maia` | 20 |
| `/model-studio` | 9 |
| `/community` | 8 |
| `/now-what` | 7 |
| `/book` | 3 |
| `/helper-fund` | 3 |
| `/debug` | 2 |
| `/demo` | 2 |
| `/open` | 2 |
| `/astrology` | 1 |
| `/book-studio` | 1 |
| `/chat-test` | 1 |
| `/choose` | 1 |
| `/commons` | 1 |
| `/enhanced-chat-test` | 1 |
| `/events` | 1 |
| `/first-witness` | 1 |
| `/guides` | 1 |
| `/join` | 1 |
| `/library` | 1 |
| `/offerings` | 1 |
| `/open-in-web` | 1 |
| `/open-web` | 1 |
| `/oracle` | 1 |
| `/pitch` | 1 |
| `/powered-by` | 1 |
| `/privacy` | 1 |
| `/relationship` | 1 |
| `/research` | 1 |
| `/session` | 1 |
| `/sessions` | 1 |
| `/signout` | 1 |
| `/simple` | 1 |
| `/status` | 1 |
| `/terms` | 1 |
| `/test` | 1 |
| `/test-sage` | 1 |
| `/voice-controller-test` | 1 |

### Full list

| Route | Guards | Refs |
|---|---|---|
| `/astrology/report` | none | 1 |
| `/book-studio/book` | none | 1 |
| `/book/[slug]` | none | 0 |
| `/book/[slug]/[serviceId]` | none | 0 |
| `/book/[slug]/confirmation` | none | 0 |
| `/chat-test` | none | 0 |
| `/choose` | none | 1 |
| `/commons` | none | 0 |
| `/community` | none | 9 |
| `/community/category/[slug]` | none | 0 |
| `/community/chat` | none | 0 |
| `/community/commons` | none | 0 |
| `/community/events` | none | 0 |
| `/community/faq` | none | 0 |
| `/community/reality-check` | none | 0 |
| `/community/share` | none | 0 |
| `/debug/auth` | none | 0 |
| `/debug/field` | none | 0 |
| `/demo/biometric` | none | 0 |
| `/demo/disposable-pixels` | none | 0 |
| `/enhanced-chat-test` | none | 0 |
| `/events/[slug]` | none | 0 |
| `/first-witness` | none | 0 |
| `/guides` | none | 3 |
| `/helper-fund` | none | 0 |
| `/helper-fund/apply` | none | 1 |
| `/helper-fund/contribute` | none | 1 |
| `/join/[token]` | none | 0 |
| `/library/videos` | none | 0 |
| `/maia/anchor` | none | 2 |
| `/maia/anchor/history` | none | 2 |
| `/maia/consciousness-computing/feedback` | none | 1 |
| `/maia/field-lab` | none | 0 |
| `/maia/field-lab/legacy-field` | none | 0 |
| `/maia/field-lab/project-field` | none | 0 |
| `/maia/field-lab/relational-navigation` | none | 0 |
| `/maia/field-lab/your-threads` | none | 1 |
| `/maia/guide` | none | 4 |
| `/maia/ideas/[id]` | none | 0 |
| `/maia/keep-capture` | none | 2 |
| `/maia/library` | none | 3 |
| `/maia/living-field` | none | 2 |
| `/maia/moments` | none | 3 |
| `/maia/orientation` | none | 0 |
| `/maia/portal` | none | 1 |
| `/maia/songwriter` | none | 2 |
| `/maia/songwriter/songs` | none | 1 |
| `/maia/soul-mirror` | none | 0 |
| `/maia/vision-studio` | none | 2 |
| `/model-studio/caseload` | none | 0 |
| `/model-studio/comms` | none | 0 |
| `/model-studio/groups` | none | 0 |
| `/model-studio/marketing` | none | 0 |
| `/model-studio/media` | none | 0 |
| `/model-studio/services` | none | 0 |
| `/model-studio/settings` | none | 0 |
| `/model-studio/tasks` | none | 0 |
| `/model-studio/vault` | none | 0 |
| `/now-what/field` | none | 3 |
| `/now-what/map` | none | 1 |
| `/now-what/next` | none | 1 |
| `/now-what/position` | none | 1 |
| `/now-what/questions` | none | 1 |
| `/now-what/reflections` | none | 1 |
| `/now-what/themes` | none | 1 |
| `/offerings` | none | 0 |
| `/open-in-web` | none | 0 |
| `/open-web` | none | 0 |
| `/open/session-room/[roomId]` | none | 0 |
| `/open/threshold/[token]` | none | 0 |
| `/oracle/reflections` | none | 1 |
| `/pitch` | none | 0 |
| `/powered-by` | none | 0 |
| `/privacy` | none | 0 |
| `/relationship/[spaceId]/threshold` | none | 0 |
| `/research/self-awareness` | none | 0 |
| `/session/join/[token]` | none | 0 |
| `/sessions` | none | 3 |
| `/signout` | none | 2 |
| `/simple` | none | 0 |
| `/status` | none | 4 |
| `/terms` | none | 0 |
| `/test` | none | 2 |
| `/test-sage` | none | 0 |
| `/voice-controller-test` | none | 2 |

## Zero-reference routes by family (screening queue)

| Family | count |
|---|---|
| `/labtools` | 26 |
| `/fields` | 22 |
| `/maia` | 17 |
| `/studio` | 14 |
| `/practitioner` | 11 |
| `/model-studio` | 9 |
| `/portal` | 8 |
| `/community` | 7 |
| `/dashboard` | 7 |
| `/book` | 5 |
| `/caseload` | 4 |
| `/admin` | 3 |
| `/astrology` | 3 |
| `/oracle` | 3 |
| `/soul-portrait` | 3 |
| `/team` | 3 |
| `/commons` | 2 |
| `/consciousness-computing` | 2 |
| `/debug` | 2 |
| `/demo` | 2 |
| `/founder` | 2 |
| `/open` | 2 |
| `/practitioners` | 2 |
| `/beta-onboarding` | 1 |
| `/beta-welcome` | 1 |

## Author-lane routes

| Route | Declared | Effective | Refs |
|---|---|---|---|
| `/book-studio` | PUBLIC | authenticated founder-only | 3 |
| `/book-studio/book` | — | open (unmapped, permissive) | 1 |
| `/book-studio/canvas` | tier:free | authenticated founder-only | 1 |
| `/book-studio/design-system` | PUBLIC | public | 2 |
| `/book-studio/drafts/[slug]` | tier:free | authenticated founder-only | 0 |
| `/book-studio/illustrations` | PUBLIC | public | 2 |
| `/book-studio/passages` | PUBLIC | public | 2 |
| `/book-studio/read` | PUBLIC | public | 5 |
| `/book-studio/ready-to-write` | — | authenticated founder-only | 1 |
| `/book-studio/render` | tier:free | authenticated founder-only | 2 |
| `/book-studio/workbench` | — | authenticated founder-only | 2 |
| `/press` | PUBLIC | public | 0 |
