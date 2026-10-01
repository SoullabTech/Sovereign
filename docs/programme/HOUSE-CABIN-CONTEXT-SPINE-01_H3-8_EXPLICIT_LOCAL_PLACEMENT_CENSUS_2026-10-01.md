
## Implementation witness

Implemented as:

- `app/api/cabin/context/import/route.ts`
- `app/api/cabin/context/import/__tests__/route.test.ts`
- `docs/design/contracts/cabin-explicit-local-placement.md`

The route:

- exists only in offline Cabin mode;
- uses the local Cabin session boundary;
- accepts exactly one multipart file field named `context-package`;
- requires the canonical filename `context-package.json`;
- refuses arbitrary query parameters and destination paths;
- enforces same-origin/session-token request custody;
- caps package size at 2 MiB;
- validates the incoming bytes through H2.5 parsing before write;
- uses the existing H3.3 writer for the configured local artifact path;
- returns only truthful placement state;
- does not initialize or clear the runtime mount;
- does not log package/member content;
- closes the local store after the attempt.

Focused H3.8 + H3.7 delivery + Cabin suite: **127/127 PASS**.

Typehealth: **223 errors vs 239 baseline**; only unrelated Stripe
`lib/stripe/config.ts:23` remains.

## Standing

**H3.8 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

The continuity membrane now has both sides:

`connected member → HTTP attachment → local explicit placement → future Cabin mount`

The final step is intentionally still separate:

`placement ≠ activation`.

No UI, automatic download, automatic placement, automatic remount, JARVIS
export authority, cognition, sync, or production deployment was added.