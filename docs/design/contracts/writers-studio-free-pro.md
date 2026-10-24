---
room: Writer’s Studio Free + Pro discovery
human_activity: choosing a degree of writing support without surrendering authorship, misunderstanding availability, or experiencing a sales funnel as a condition of creative belonging
surfaces:
  - app/writers-studio/plans/**
change_class: experiential
principles:
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — a room is defined by human activity, not a grid of purchasable features
  - docs/canon/SOULLAB_THEME.md — quiet visual hierarchy and belonging to one Soullab house
  - docs/canon/MARKETING_CLAIM_DISCIPLINE.md — distinguish future product inclusion from operational availability
  - docs/canon/MAIA_OATH.md — AI supports the author instead of replacing the author
reference_surfaces:
  - docs/design/contracts/writers-studio-doorway.md
  - docs/design/contracts/soullab-public-explore-p0.md
  - docs/design/contracts/studio-home.md
  - app/explore/page.tsx
shared_with_house: restrained and readable typography, warm material tones, visible authorship protections, return path to the already public exploration doorway, and sovereignty independent of payment
distinct_to_room: this is an optional choice-point explaining Writer’s Studio Free, Pro and its invitation-only complimentary beta; it is not the private writing room or a subscription checkout
screenshot_desktop: docs/design/contracts/screenshots/writer-studio-free-pro-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/writer-studio-free-pro-mobile.png
experience_verification: October 22 2026, isolated local Next.js 16 Webpack preview alias to the exact plans-page React component, without changing the canonical access rules. Headless installed Google Chrome at 1440px and 390px confirmed heading, navigation destination /explore/writers-studio and no horizontal overflow. Captured full-page desktop and mobile screenshots. The canonical /writers-studio/plans route is still authentication-protected, so these are preview checks rather than public-route or production/physical-device acceptance.
---

# Writer’s Studio Free + Pro — Experience Contract

## Activity and arrival

The person is considering what kind of writing partnership to enter. They might be
beginning a personal story, already writing a book, or evaluating support for a
long project. They should be able to see that **Free is a real invitation, Pro is
optional, and writing belongs to its author regardless of payment**.

**Arrival:** “Your voice belongs to you.”

Free appears first. Pro is described as deeper editorial partnership, not as the
solution to a deficient person. The compact comparison gives a factual way to
distinguish pathways without turning the entire Studio into a sales funnel.

## Gestures

| Gesture | Language | Reason |
|---|---|---|
| Orient to the broader experience | “Discover Writer’s Studio” | Return to an existing public doorway, not a blocked private Work |
| Learn about the product | “Learn about Writer’s Studio” | No checkout or invitation promise during release HOLD |
| Consider Free versus Pro | Static comparison table | Discernment before purchasing, with no inert sales controls |

## House versus room

The House is the person's shared continuity and relationship with Soullab. The
Studio is where a writer authors and develops Work. The plan introduction is
neither: a quiet optional threshold for choosing support. It carries the House's
respect for sovereignty while staying entirely non-reading, non-personalized and
non-transactional.

## Deliberately excluded

- Public payment buttons or a form that collects payment while checkout is held.
- Diminishing a writer's authorship, privacy, deletion, or basic export on Free.
- A timer or trial-expiry claim for the invitation-only Pro beta cohort.
- Live promises about held original-file imports, PDF/EPUB delivery, or sync.
- Generic Soullab membership tiers being misrepresented as paid Writer Pro access.
- Unsolicited enrollment or beta invitations.

## Evidence boundary

Both screenshots are of the **same component** rendered through a disposable
local preview alias; that alias was removed after capture. The route intended for
members remains under existing authentication. The preview does not prove
production release, standalone public-route availability, WebKit, VoiceOver,
payment behavior or any manuscript operation.

**Admission remains independently gated by Writer release issue #1800.**
