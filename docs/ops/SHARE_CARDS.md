# Share Cards (Open Graph) — three classes

**Problem this solves:** every `soullab.life` link used to show the same root
"Soullab — We build for the soul" preview when shared (iMessage / Slack / email /
social), because routes without their own Open Graph metadata inherit the root card.
Two goals: (1) make intentionally-public links **recognizable** by their receiver,
and (2) make sure auth-gated links **never leak** names, excerpts, or session content
in a preview — remember that unfurl bots fetch the page even when it's login-gated.

## The three classes

| Class | Used for | Card |
|---|---|---|
| **DYNAMIC-ITEM** | public personalized artifacts — Soul Portraits (future: Year Ahead, relationship portraits, books) | Per-item card generated from **registered data** (person's name + element accent). Never from arbitrary URL text. |
| **PUBLIC-SECTION** | intentionally-public landings / invitations | Named card (title + description + image) from `SECTIONS` in `lib/og/ogCard.tsx`. No per-visit data. |
| **PRIVATE-GENERIC** | anything auth-gated (sessions, transcripts, member fields, client records, private workspaces) | `privateCard()` — a "protected access" threshold card. **No** names, topics, or excerpts. |

Template + palette + section config all live in
[`lib/og/ogCard.tsx`](../../lib/og/ogCard.tsx): `ogCard()`, `privateCard()`,
`SECTIONS`, `accentForElement()`, `OG_SIZE`. No external font is fetched at render
time (sovereignty).

## Two Next.js facts that drive the design

1. **`opengraph-image.tsx` is inherited by child routes.** One file at a parent
   segment (e.g. `app/studio/opengraph-image.tsx`) covers the whole subtree,
   including dynamic children like `/studio/fields/[memberId]`. Put a leaf file only
   where a child needs to *override* the parent (e.g. public `/commons/join` under
   gated `/commons`).
2. **Setting `metadata.title` does NOT change `og:title`.** The root sets
   `openGraph.title`, and a child's plain `title` won't override it. You must set
   `openGraph` (and `twitter`) on the route/layout. Client-Component pages can't
   export metadata — add a passthrough `layout.tsx` that does.

## Current coverage (2026-07-10, verified in dev)

**DYNAMIC-ITEM**
- `/soul-portrait/[slug]` — name + element accent; `person.isMinor` → first-name-only;
  unknown/spoofed slug → generic card. `robots: noindex`.

**PUBLIC-SECTION**
- `/` root (static `public/og-image.png`), `/pitch`, `/powered-by` (its own logo),
  `/maia` (via `app/maia/layout.tsx`), `/open/session-room/[roomId]` (named Session
  Room card, no room data), `/field/enter`, `/commons/join`.
- `/fields/[field]` — public, already has its own `generateMetadata` (left as-is).

**PRIVATE-GENERIC** (protected card, inherited by children)
- `/studio/*` (sessions, session-room, field, fields/[memberId], workspaces)
- `/practitioner/*`, `/sessions`, `/session/*` (join tokens), `/stellium/sessions`
- `/now-what/room`, `/commons` (+ circles), `/field/talk`, `/book-studio` (founder-gated)
- `/maia/vision-studio`, `/maia/field-dashboard`, `/maia/field-lab`, `/maia/living-field`

**Known exception:** `app/studio/layout.tsx` is a Client Component, so the `/studio/*`
family shows the correct *protected image* but keeps the generic root `og:title`
(non-leaking). Add a nested server layout there if a protected title is wanted.

## Add a card to a new route

- **Public section:** add a key to `SECTIONS`, then a 4-line `opengraph-image.tsx`
  calling `ogCard(SECTIONS.key)`, and set `openGraph` title/desc on the page/layout.
- **Private:** drop `app/<area>/opengraph-image.tsx` calling `privateCard({...})` at the
  gated parent — it covers the whole subtree. Add a passthrough `layout.tsx` with a
  protected `openGraph.title` if you want the text to match the image.
- **Dynamic per-item:** see `app/soul-portrait/[slug]/opengraph-image.tsx`. Derive
  strictly from registered/DB data, never from the raw URL. Add `generateStaticParams`
  so the iOS static export (`scripts/capacitor-patch-routes.sh`) stays happy.

## Default-private posture

New gated areas should get a PRIVATE-GENERIC card by default. A route only earns a
named public card when its visibility is explicitly public (public landing or
intentional invitation). When in doubt, protect it.

## Verify

Locally: `npm run dev`, then fetch a route's HTML and confirm `og:image` points at the
route's own `opengraph-image` and `og:title` matches its class. Externally after deploy:
paste the URL into https://www.opengraph.xyz or send it to yourself in iMessage.
