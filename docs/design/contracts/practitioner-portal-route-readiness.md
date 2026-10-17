---
room: Practitioner Portal — route readiness
human_activity: Entering a practitioner portal, reading its public home and services, booking, messaging, signing in, and accepting an invitation only under an identified portal route.
surfaces:
  - app/portal/[slug]/page.tsx
  - app/portal/[slug]/about/page.tsx
  - app/portal/[slug]/services/page.tsx
  - app/portal/[slug]/book/page.tsx
  - app/portal/[slug]/chat/page.tsx
  - app/portal/[slug]/claim/page.tsx
  - app/portal/[slug]/signin/page.tsx
change_class: structural
principles:
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — a Portal is an inhabitable member journey, not a dashboard or array of route parameters.
  - docs/canon/SOULLAB_THEME.md — continuity of visual language and readable actions should survive technical route repairs.
  - docs/design/contracts/README.md — a structural-only change must declare its room, references, preserved experience, and rationale.
reference_surfaces:
  - app/portal/[slug]/page.tsx
  - app/portal/[slug]/book/page.tsx
  - app/portal/[slug]/signin/page.tsx
  - docs/design/contracts/writers-studio-invitation.md
shared_with_house: Member identity and clear arrival remain grounded in a specific intended space; do not show actions against an unidentified route and do not treat query parameters as an identity grant.
distinct_to_room: The practitioner's portal retains booking, services, message, invitation claim, and sign-in journeys instead of repackaging them as Writer’s Studio or general MAIA conversation.
structural_rationale: The R69 work corrects Next.js nullable useParams/useSearchParams typing and refuses missing portal slugs before an authenticated claim, sign-in, or chat submission. It does not change the member-visible page layout, branding, text hierarchy, navigation labels, booking steps, data schema, service/model decisions, or UI components. The initial route-null case now fails closed rather than constructing a malformed /portal// endpoint. No appearance or flow redesign was undertaken, so desktop/mobile experience screenshots are neither newly claimed nor substituted for runtime testing.
---

# Practitioner Portal — R69 nullable-route safety

The Portal remains the same set of practitioner-branded journeys. Routes may not
have their final pathname or query values during Next.js hydration. The code
reads them defensively and keeps the existing user experience once the resolved
slug is available.

A missing slug is **not** a valid scope. Claim, sign-in, and chat gestures do
not create requests under a missing practitioner identity. Optional query
parameters default to their preexisting absent values.

The R69 repair is limited to route-readiness and TypeScript safety. It does not
imply verified production sign-in, account security, provider access,
cross-member isolation, a new consent notice, or Writer’s Studio beta GO.
