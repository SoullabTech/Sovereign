# Layer 1 — Route Inventory (mechanical)

**Generated 2026-07-30** from `app/**/page.tsx`, `config/accessMatrix.ts`, `middleware.ts`.
**Class:** observation only. Rules nothing, selects no instrument, proposes no change.

Five fields, kept separate on purpose — collapsing them is what produced the `/book-studio`
misclassification corrected in PR #828.

| Field | Source |
|---|---|
| **Declared** | `config/accessMatrix.ts` (exact → prefix → regex, first match) |
| **Middleware** | what `middleware.ts` actually does with that declaration |
| **Guards** | page/layout guards found by walking the full layout chain **and** the page module |
| **Effective** | union of the above |
| **Refs** | detected inbound string references (screening only — see Layer 2) |

> **Enforcement caveat — read before using the Declared column.**
> Tier declarations are recorded as policy, but middleware currently allows `insufficient-tier`
> requests through (`middleware.ts:304-308`, *"tier gates disabled during development"*).
> **Declared tiers must not be read as effective enforcement** unless a route carries an
> additional page, layout, API, or downstream entitlement check. Production runs
> `ACCESS_CONTROL_MODE` unset → **permissive**, so unmapped routes pass through.
> Tracked separately in `TIER_ENFORCEMENT_AUDIT_2026-07-30.md` — that question is platform-wide
> and is **not** part of the author-experience lane.

## Totals

| | count |
|---|---|
| page routes | 500 |
| founder-enforced | 72 |
| any page/layout guard | 90 |
| declared PUBLIC but guarded stricter | 5 |
| unmapped **and** unguarded | 85 |

## Inventory

| Route | Declared | Middleware | Guards | Effective | Refs |
|---|---|---|---|---|---|
| `/` | PUBLIC | open | none | public | 40 |
| `/account/security` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/account/settings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 9 |
| `/admin` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/admin/activity-feed` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/agent-monitor` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/beta-testers` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/consciousness-analytics` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/content-pipeline` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/library/videos` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/admin/maia` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/admin/maia/engine-comparisons` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/admin/maia/substrate` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/monitor` | tier:pro | authenticated; tier check BYPASSED | admin — `app/admin/monitor/page.tsx:admin` | authenticated admin-only | 1 |
| `/admin/monitoring` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/ops` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/admin/opus-pulse` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/platform-overview` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/research` | tier:pro | authenticated; tier check BYPASSED | admin — `app/admin/research/page.tsx:admin` | authenticated admin-only | 0 |
| `/admin/security` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/admin/voice-lab` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/admin/world-telemetry` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/ain-demo` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/ain-evolution` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/ask-maia` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/astrology` | PUBLIC | open | none | public | 9 |
| `/astrology/aspects/[slug]` | PUBLIC | open | none | public | 0 |
| `/astrology/chinese` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/astrology/mayan` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/astrology/pathways/[element]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/astrology/report` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/astrology/synastry` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/astrology/synastry/[analysisId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/astrology/synastry/saved` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/astrology/vedic` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/begin` | PUBLIC | open | auth — `app/begin/page.tsx:auth` | authenticated | 4 |
| `/beta-access` | PUBLIC | open | none | public | 2 |
| `/beta-onboarding` | PUBLIC | open | none | public | 0 |
| `/beta-welcome` | PUBLIC | open | none | public | 0 |
| `/birth-chart` | PUBLIC | open | none | public | 2 |
| `/book-companion/ain` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/book-studio` | PUBLIC | open | auth, founder — `app/book-studio/page.tsx:founder+auth` | authenticated founder-only | 3 |
| `/book-studio/book` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/book-studio/canvas` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/book-studio/canvas/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/book-studio/design-system` | PUBLIC | open | none | public | 2 |
| `/book-studio/drafts/[slug]` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/book-studio/drafts/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/book-studio/illustrations` | PUBLIC | open | none | public | 2 |
| `/book-studio/passages` | PUBLIC | open | none | public | 2 |
| `/book-studio/read` | PUBLIC | open | none | public | 5 |
| `/book-studio/ready-to-write` | — | unmapped — permissive passthrough | auth, founder — `app/book-studio/ready-to-write/page.tsx:founder+auth` | authenticated founder-only | 1 |
| `/book-studio/render` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/book-studio/render/layout.tsx:founder+auth` | authenticated founder-only | 2 |
| `/book-studio/workbench` | — | unmapped — permissive passthrough | auth, founder — `app/book-studio/workbench/layout.tsx:founder+auth` `app/book-studio/workbench/page.tsx:founder+auth` | authenticated founder-only | 2 |
| `/book/[slug]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/book/[slug]/[serviceId]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/book/[slug]/confirmation` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/book/ask` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/book/companion` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/capture` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/caseload` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/caseload/[caseId]` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/caseload/[caseId]/notes` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/caseload/[caseId]/notes/new` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/chart` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/chat-test` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/choose` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/commons` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/commons/circles` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/commons/circles/layout.tsx:founder+auth` | authenticated founder-only | 4 |
| `/commons/circles/[circleId]` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/commons/circles/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/commons/circles/new` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/commons/circles/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/commons/join` | PUBLIC | open | none | public | 1 |
| `/community` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 9 |
| `/community/category/[slug]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/community/chat` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/community/commons` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/community/events` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/community/faq` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/community/reality-check` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/community/share` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/consciousness-computing` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness-computing/feedback` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/consciousness-computing/pwa` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/consciousness-insights` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/consciousness-lab` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness-monitor` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness/dashboard` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness/meditation` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness/omnidimensional-test` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/consciousness/portals` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness/portals/admin` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/consciousness/portals/analytics` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/continue` | PUBLIC | open | none | public | 0 |
| `/dashboard` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 5 |
| `/dashboard/astrology` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/dashboard/audio` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/dashboard/beta` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/beta-analytics` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/biometric` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/collective` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/dashboard/diamond` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/dreams` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/dashboard/evolution` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/dashboard/export` | PUBLIC | open | none | public | 4 |
| `/dashboard/help` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/dashboard/metrics` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/dashboard/ops` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/oracle-beta` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/dashboard/overview` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/reflections` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/dashboard/settings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/dashboard/shadow` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/dashboard/spiralogic-report` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/dashboard/taoist-elements` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/dashboard/theme` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/debug/auth` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/debug/field` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/demo/biometric` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/demo/disposable-pixels` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/downloads` | PUBLIC | open | none | public | 0 |
| `/enhanced-chat-test` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/enter` | PUBLIC | open | none | public | 9 |
| `/events/[slug]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/evolution` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/faq` | PUBLIC | open | none | public | 6 |
| `/field/enter` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/field/talk` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/fields/[field]` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/author` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/begin` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/companion` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/companion/continue` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/companion/integrate` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/companion/practitioner` | PUBLIC | open | practitioner — `app/fields/[field]/companion/practitioner/page.tsx:practitioner` | authenticated practitioner-only | 0 |
| `/fields/[field]/companion/prepare` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/companion/session` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/hold-the-field` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/interview` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/maia` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/operator` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/partner` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/partner-view` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/presence` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/session-view` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/studio` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/systems` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/train` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/with-me` | PUBLIC | open | none | public | 0 |
| `/fields/[field]/with-others` | PUBLIC | open | none | public | 0 |
| `/first-witness` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/founder` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/founder/content` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/founder/pipeline` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/founder/practice` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/founder/relational-patterns` | tier:free | authenticated; tier check BYPASSED | founder — `app/founder/relational-patterns/page.tsx:founder` | authenticated founder-only | 1 |
| `/founder/relational-signals` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/founder/rollout` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/founder/signals` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/founder/today` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/founder/witness` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/go/[handle]` | — | unmapped — permissive passthrough | auth — `app/go/[handle]/page.tsx:auth` | authenticated | 0 |
| `/guides` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 3 |
| `/helper-fund` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/helper-fund/apply` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/helper-fund/contribute` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/home` | — | unmapped — permissive passthrough | auth — `app/home/page.tsx:auth` | authenticated | 3 |
| `/intro` | PUBLIC | open | none | public | 1 |
| `/join/[token]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/journal` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 12 |
| `/journey` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 7 |
| `/labtools` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 8 |
| `/labtools/admin/beta-testers` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/admin/command-center` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/admin/command-center/actions` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/admin/command-center/conversations` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/admin/command-center/field-engines` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/admin/command-center/members` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/admin/command-center/system` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/admin/system` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/admin/videos` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/ain` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/beads` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/belief-lens` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 4 |
| `/labtools/beta-testing` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/body-scan` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/books` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/brain-trust` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/breathwork` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 2 |
| `/labtools/claude-code` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/coherence` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/discover` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 2 |
| `/labtools/downloads` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/dreams` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/dynamics-map` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 2 |
| `/labtools/elemental-alchemy` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/explainer-scripts` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/favorites` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/field-analytics` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/field-protocol` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/gifts` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/guidance-signals` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/guides` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/inner-guide-meditation` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/journal` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 11 |
| `/labtools/lab-notes` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/language` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/metrics` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/navigator` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/orienting` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/parts-check-in` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/parts-shadow` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/profile` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/prompts` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/reflections` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 2 |
| `/labtools/reflections/[id]` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/regulation-minute` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/relational-field` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 3 |
| `/labtools/repair-path` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 3 |
| `/labtools/repair-script` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 2 |
| `/labtools/rlm` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/scribe` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/settings` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/somatic-discharge` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/sovereignty` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/story-creator` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/suggest` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/upload` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/values-compass` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/vocal-toning` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 0 |
| `/labtools/voice` | tier:free | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/labtools/wisdom` | tier:pro | authenticated; tier check BYPASSED | auth, founder — `app/labtools/layout.tsx:founder+auth` | authenticated founder-only | 1 |
| `/language` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/library` | PUBLIC | open | none | public | 6 |
| `/library/videos` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/magic-link` | PUBLIC | open | none | public | 1 |
| `/magic-link-success` | PUBLIC | open | none | public | 2 |
| `/maia` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 79 |
| `/maia/anchor` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/maia/anchor/history` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/maia/community` | PUBLIC | open | none | public | 4 |
| `/maia/community/category/[slug]` | PUBLIC | open | none | public | 0 |
| `/maia/community/chat` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/maia/community/commons` | PUBLIC | open | none | public | 4 |
| `/maia/community/commons/my-offerings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/maia/community/commons/orientation` | PUBLIC | open | none | public | 0 |
| `/maia/community/commons/review` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/community/contribute` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/maia/community/elemental-alchemy` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/maia/community/elemental-alchemy/assessment` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/community/elemental-alchemy/journal` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/community/elemental-alchemy/practices` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/community/elemental-alchemy/reader` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/maia/community/events` | PUBLIC | open | none | public | 0 |
| `/maia/community/faq` | PUBLIC | open | none | public | 2 |
| `/maia/community/library` | PUBLIC | open | none | public | 2 |
| `/maia/community/new-post` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/community/reality-check` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/maia/community/share` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/maia/community/territory/[slug]` | PUBLIC | open | none | public | 0 |
| `/maia/community/wisdom-sources` | PUBLIC | open | none | public | 1 |
| `/maia/compact` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/consciousness-computing` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/consciousness-computing/feedback` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/maia/field-dashboard` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/field-lab` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/field-lab/legacy-field` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/field-lab/project-field` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/field-lab/relational-navigation` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/field-lab/your-threads` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/maia/guide` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 4 |
| `/maia/ideas` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 5 |
| `/maia/ideas/[id]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/interfaces` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/maia/invites` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/maia/keep-capture` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/maia/labtools` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/library` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 3 |
| `/maia/living-field` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/maia/mandala` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/membership` | tier:free | authenticated; tier check BYPASSED | tier — `app/maia/membership/page.tsx:tier` | authenticated, ANY tier | 3 |
| `/maia/moments` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 3 |
| `/maia/orientation` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/portal` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/maia/privacy` | PUBLIC | open | none | public | 4 |
| `/maia/prototype` | — | unmapped — permissive passthrough | admin, founder — `app/maia/prototype/page.tsx:founder+admin` | authenticated founder-only | 1 |
| `/maia/realtime-monitor` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/songwriter` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/maia/songwriter/songs` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/maia/soul-consciousness` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/soul-mirror` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/maia/stewardship` | PUBLIC | open | none | public | 8 |
| `/maia/training` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/maia/vision-studio` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/membership` | PUBLIC | open | none | public | 6 |
| `/model-studio/caseload` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/comms` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/groups` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/marketing` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/media` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/services` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/settings` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/tasks` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/model-studio/vault` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/now-what/arrive` | PUBLIC | open | none | public | 1 |
| `/now-what/field` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 3 |
| `/now-what/map` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/now-what/next` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/now-what/position` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/now-what/questions` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/now-what/reflections` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/now-what/room` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 5 |
| `/now-what/themes` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/now-what/welcome` | PUBLIC | open | none | public | 0 |
| `/oauth-success` | PUBLIC | open | none | public | 3 |
| `/offerings` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/onboarding` | PUBLIC | open | none | public | 9 |
| `/onboarding/facet` | PUBLIC | open | none | public | 0 |
| `/onboarding/youth` | PUBLIC | open | none | public | 1 |
| `/onboarding/youth-coming-soon` | PUBLIC | open | none | public | 1 |
| `/open-in-web` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/open-web` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/open/session-room/[roomId]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/open/threshold/[token]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/oracle` | PUBLIC | open | none | public | 13 |
| `/oracle/consciousness` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/oracle/iching` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/oracle/interactive` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/oracle/library` | PUBLIC | open | none | public | 1 |
| `/oracle/reflections` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 1 |
| `/oracle/runes` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/oracle/tarot` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/oracle/yijing` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/partner-welcome` | PUBLIC | open | none | public | 0 |
| `/partner/[slug]` | PUBLIC | open | none | public | 0 |
| `/partners/onboarding/prelude` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/patrons` | PUBLIC | open | none | public | 4 |
| `/patterns` | PUBLIC | open | none | public | 3 |
| `/pfi-monitor` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/pitch` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/portal/[slug]` | PUBLIC | open | none | public | 0 |
| `/portal/[slug]/about` | PUBLIC | open | none | public | 0 |
| `/portal/[slug]/book` | PUBLIC | open | none | public | 0 |
| `/portal/[slug]/chat` | PUBLIC | open | none | public | 0 |
| `/portal/[slug]/claim` | PUBLIC | open | none | public | 0 |
| `/portal/[slug]/services` | PUBLIC | open | none | public | 0 |
| `/portal/[slug]/signin` | PUBLIC | open | none | public | 0 |
| `/portal/manage/[token]` | PUBLIC | open | none | public | 0 |
| `/portals` | PUBLIC | open | none | public | 0 |
| `/powered-by` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/practitioner/agreements` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/billing` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/clients/[clientId]/spiralogic-report` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/containers` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/containers/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/practitioner/dashboard` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 23 |
| `/practitioner/labtools` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/labtools/beads` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/labtools/meetings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/practitioner/labtools/meetings/[meetingId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/labtools/meetings/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/labtools/network` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/practitioner/labtools/network/[personId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/labtools/network/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/labtools/pipeline` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/practitioner/labtools/pipeline/[opportunityId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/labtools/pipeline/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/labtools/portals` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/labtools/ventures` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/practitioner/labtools/ventures/[ventureId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/labtools/ventures/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/sessions/[sessionId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/sessions/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioner/tasks/[taskId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioner/tasks/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioners/onboarding` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioners/onboarding/prelude` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/practitioners/onboarding/step/[n]` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/practitioners/signup` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/press` | PUBLIC | open | none | public | 0 |
| `/privacy` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/public-demo` | PUBLIC | open | none | public | 0 |
| `/relationship/[spaceId]/threshold` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/relationships` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 8 |
| `/relationships/[id]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/research/self-awareness` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/reset-password` | PUBLIC | open | none | public | 3 |
| `/resume` | PUBLIC | open | none | public | 1 |
| `/session/join/[token]` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/sessions` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 3 |
| `/settings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 5 |
| `/signin` | PUBLIC | open | none | public | 71 |
| `/signout` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/signup` | PUBLIC | open | none | public | 3 |
| `/simple` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/soul-gateway` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/soul-portrait/[slug]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/soul-portrait/[slug]/welcome` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/soul-portrait/generate` | tier:free | authenticated; tier check BYPASSED | tier — `app/soul-portrait/generate/page.tsx:tier` | authenticated, ANY tier | 1 |
| `/soul-portrait/preview/[id]` | tier:free | authenticated; tier check BYPASSED | auth — `app/soul-portrait/preview/[id]/page.tsx:auth` | authenticated | 0 |
| `/soul-portrait/view/[slug]` | PUBLIC | open | none | public | 0 |
| `/soullab-studio` | PUBLIC | open | none | public | 0 |
| `/status` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 4 |
| `/stellium` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/stellium/clients` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/stellium/comms` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/stellium/marketing` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/stellium/marketing/campaigns` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/stellium/marketing/contacts` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/stellium/marketing/generate` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/stellium/messages` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/stellium/persona` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/stellium/sessions` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/stellium/settings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/steward/opus-pulse` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 13 |
| `/studio-on-mobile` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/account` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/agents` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/booking` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/calendar` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/camera` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/case-studies` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/caseload` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/studio/changes` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 8 |
| `/studio/changes/[id]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/changes/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/clients` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 6 |
| `/studio/clients/[id]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/clients/import` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/code` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/studio/command` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/comms` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/comms/[messageId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/create` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/studio/decisions` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 10 |
| `/studio/decisions/[id]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/decisions/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/encounters` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/encounters/[encounterId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/encounters/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/environment` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/field` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 6 |
| `/studio/fields/[memberId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/groups` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/groups/[groupId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/groups/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/maia` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 6 |
| `/studio/maia-guidance` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/marketing` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/marketing/campaigns` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/marketing/contacts` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/marketing/generate` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/materials` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/media` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/studio/media/[projectId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/metrics` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/portal` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/programs` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/review` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/scheduled-sends` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/scheduling` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/scribe` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/services` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/session-room` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 9 |
| `/studio/sessions` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 5 |
| `/studio/sessions/[sessionId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/sessions/new` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/settings` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 3 |
| `/studio/soul-portraits` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/tasks` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/teams` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/studio/teams/[teamId]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/studio/threshold` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/tools` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
| `/studio/triage` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/studio/vault` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/supervision` | tier:pro | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/team` | tier:free | authenticated; tier check BYPASSED | auth — `app/team/layout.tsx:auth` | authenticated | 9 |
| `/team/[channelSlug]` | tier:free | authenticated; tier check BYPASSED | admin, auth — `app/team/layout.tsx:auth` `app/team/[channelSlug]/page.tsx:auth+admin` | authenticated admin-only | 0 |
| `/team/admin` | tier:free | authenticated; tier check BYPASSED | auth — `app/team/layout.tsx:auth` | authenticated | 1 |
| `/team/decisions` | tier:free | authenticated; tier check BYPASSED | auth — `app/team/layout.tsx:auth` | authenticated | 2 |
| `/team/dm/[dmId]` | tier:free | authenticated; tier check BYPASSED | auth — `app/team/layout.tsx:auth` `app/team/dm/[dmId]/page.tsx:auth` | authenticated | 0 |
| `/team/for-you` | tier:free | authenticated; tier check BYPASSED | auth — `app/team/layout.tsx:auth` | authenticated | 2 |
| `/team/invite/[token]` | PUBLIC | open | auth — `app/team/layout.tsx:auth` | authenticated | 0 |
| `/team/notifications` | tier:free | authenticated; tier check BYPASSED | auth — `app/team/layout.tsx:auth` | authenticated | 1 |
| `/terms` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/test` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/test-elemental` | PUBLIC | open | auth — `app/test-elemental/page.tsx:auth` | authenticated | 2 |
| `/test-sage` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 0 |
| `/the-beginning/[recipient]` | PUBLIC | open | none | public | 0 |
| `/vision-studio` | PUBLIC | open | none | public | 0 |
| `/voice` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 2 |
| `/voice-controller-test` | — | unmapped — permissive passthrough | none | open (unmapped, permissive) | 2 |
| `/welcome` | PUBLIC | open | none | public | 2 |
| `/welcome-back` | PUBLIC | open | none | public | 3 |
| `/welcome-flow` | PUBLIC | open | none | public | 0 |
| `/wisdom-keepers` | PUBLIC | open | none | public | 0 |
| `/wisdom-keepers/sacred-texts` | PUBLIC | open | none | public | 1 |
| `/wisdom-keepers/wisdom` | PUBLIC | open | none | public | 6 |
| `/worlds/[...slug]` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 0 |
| `/worlds/journey` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 1 |
| `/worlds/patterns` | tier:free | authenticated; tier check BYPASSED | none | authenticated, ANY tier | 4 |
