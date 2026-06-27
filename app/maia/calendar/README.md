# `/maia/calendar` — MAIA Coherence Engine (v0)

A direct, mobile-first entry surface for **capturing loose ends so a member can be present**.
Reachable without going through Studio — suitable as a home-screen shortcut.

> **The key design constraint:** this is a *coherence* layer, not a *productivity* layer.
> The first question is not "how do we manage tasks?" — it's
> **"how does MAIA help someone become present because the loose ends have been safely held?"**

Full doctrine: [`docs/canon/MAIA_COHERENCE_ENGINE_v0.md`](../../../docs/canon/MAIA_COHERENCE_ENGINE_v0.md)

## What ships in v0

- **Route:** `app/maia/calendar/page.tsx` — authenticated (unauth → `/signin`), mobile-first, links back to `/maia` and to the full `/studio/calendar`.
- **Capture field:** *"What are you still carrying?"* (arrival-framed) — natural language, **stored verbatim** (no AI parsing).
- **Optional classification:** `today` · `later` · `time_sensitive` · `ongoing` — or none (held, unsorted); member-chosen, never required (Doctrine 6).
- **Reversible release:** mark a capture handled (`released_at`); restorable.
- **API:** `app/api/maia/coherence/captures/route.ts` — `GET` / `POST` / `PATCH?id=` (member-scoped).
- **Storage:** `coherence_captures` table — `database/migrations/20260619000001_coherence_captures.sql` + `…20260625000001_coherence_captures_optional_classification.sql` (classification nullable).

## Verify locally

```bash
# 1. Apply the migration (self-hosted Postgres — NOT Supabase)
docker compose --profile migrate run --rm migrate
#   or, against the dev DB directly:
#   psql -U soullab maia_consciousness -f database/migrations/20260619000001_coherence_captures.sql

# 2. Run the app, sign in, then open:
npm run dev   # → http://localhost:3000/maia/calendar
```

Without a valid member in `localStorage` (`beta_user.id`), the page cleanly redirects to `/signin` — there is no broken unauthenticated state.

## Access control (production)

The middleware `AccessMatrix` (`config/accessMatrix.ts`) currently runs in **Mode A
(permissive)** in production (`ACCESS_CONTROL_MODE` unset), so these routes work
without being registered. **Before enabling strict mode** (`ACCESS_CONTROL_MODE=strict`,
which 404s unmapped routes), add to `ACCESS_RULES`:

```ts
{ exact: '/maia/calendar', minTier: 'free', notes: 'Coherence Engine v0 — direct calendar/capture entry' },
{ prefix: '/api/maia/coherence', minTier: 'free', notes: 'Coherence Engine captures (GET/POST/PATCH)' },
```

`minTier: 'free'` = authenticated (not public); the tier model can't express cohort, so the
**tester cohort gate is enforced server-side** — `isMemberTester` / `labs.preview` in the API
(`route.ts`), plus the client `<PreviewGate entitlement="labs.preview">` wrapping the page —
the same pattern as Field Lab. These two entries **are included in this branch**, so the route
is registered for both permissive and strict access modes.

## Intentionally deferred (next steps — placeholders only)

Each crosses from *holding* into *acting* and ships as its own small, lightly-tested increment
(Marran Doctrine: clarify purpose → reduce scope → test lightly). None collapses the v0 boundary
(*capture precedes structure; structure is the member's choice*):

- [ ] Natural language → calendar event (propose-only, member-confirmed)
- [ ] Reminders / alarms
- [ ] Google / Apple calendar sync
- [ ] Travel-time-aware alerting
- [ ] Meeting synthesis
- [ ] Marran Doctrine innovation assistant

Anything user-facing here must pass the **Attention Doctrine** and **Sovereignty Invariant** checks
in [`CLAUDE.md`](../../../CLAUDE.md) before it ships.
