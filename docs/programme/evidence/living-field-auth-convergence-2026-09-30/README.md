# Living Field auth/runtime convergence — real-stack witness

Date: 2026-09-30
Witnessed head: `ff57a49fd`

Environment:
- Mac Studio
- real Next dev server
- real proxy/middleware boundary
- real Living Field API route handlers
- fresh disposable PostgreSQL database rebuilt from canonical baseline + migrations
- one synthetic test member and synthetic session
- no production or member content
- `ANTHROPIC_API_KEY` deliberately empty so no external model call was needed

The browser entered `/maia/living-field?from=house`, opened Current Questions,
and then exercised the complete repaired Living Field subroute surface.

Result: **24/24 passed, 0 failed.**

The direct route matrix used the verified session cookie without an
`x-member-id` claim. This demonstrates that the routes no longer depend on a
caller identity header surviving the sanitized auth boundary.

The mounted page also confirmed member-authored and MAIA-candidate provenance,
Return Home continuity, and that no R2 presentation is mounted.

One separate behavior remains for governance: opening a dimension automatically
opens a MAIA encounter once the route succeeds. This witness records that fact;
it does not authorize changing or retaining that consent behavior.
