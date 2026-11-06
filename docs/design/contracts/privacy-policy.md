---
room: Privacy policy
human_activity: reading, in plain words, what Soullab does with your information and where what you write goes, so you can decide what to share

# Deliberately narrow: this binds the Privacy policy page only, not the legal or account areas around it.
surfaces:
  - app/privacy/page.tsx

change_class: experiential

principles:
  - MARKETING_CLAIM_DISCIPLINE — every statement on this page must be true of what runs today; nothing here may borrow maturity from what is designed or hoped for
  - MAIA_OATH — consent and containment are stated as they are: no stealth collection, no surprise recipients of what a member wrote
  - MAIA_SOVEREIGNTY_INVARIANTS — the member's agency over their own words outranks tidiness of the policy text
  - SOULLAB_READABILITY_STANDARD — text must be readable against its surface
  - SOULLAB_THEME — the page keeps the House's navy field and restrained card hierarchy

reference_surfaces:
  - app/privacy/page.tsx — the existing shipped page whose layout, cards and voice this change preserves
  - app/terms/page.tsx — the sibling legal page, for the same plain voice
  - docs/canon/MARKETING_CLAIM_DISCIPLINE.md — the test each added sentence is held to
  - docs/programme/TWILIO_A2P_10DLC_REGISTRATION_PACK_DRAFT_2026-11-06.md — the source of record for what Soullab's own Twilio account sends

shared_with_house: the House's dark navy field, restrained rounded cards, quiet typography and plain provenance voice; nothing on the page is louder than the member's need to understand it
distinct_to_room: a reference page read once and returned to, not a practice room; it is text-dense by design and offers no action except going back

screenshot_desktop: docs/design/contracts/screenshots/privacy-policy-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/privacy-policy-mobile.png
experience_verification: >
  Walked 2026-11-06 on a local `next dev` render of this branch (canonical 0dbb23dcc plus
  the one added paragraph, port 3119), driven by Playwright-core controlling Google Chrome in
  real time at 1280x900 and 390x844 (mobile emulation), after the page had loaded and
  animations had finished (4 s). Observed: HTTP 200 at both sizes; the added paragraph
  ("Soullab also sends short operational notifications by SMS to its owner and a small number of
  staff ... never marketing and never go to the general public") present exactly once and
  visible in the SMS Communications card, which sits in the same card and type as the paragraph
  above it; the STOP / HELP / "message and data rates may apply" / no-sharing paragraphs still
  present and readable beneath it; document scroll width equals the viewport at both sizes (1280
  and 390), so no horizontal overflow. The screenshots are viewport shots scrolled to the SMS
  section, not full-page captures. A first attempt using headless Chrome's virtual time produced
  blank frames because the page's entrance animations did not advance, and those images were
  discarded rather than committed. NOT checked: the other sections of the page, a light theme if
  one exists, assistive-technology reading order, and the page in production. The copy change
  alters no navigation, form, auth, memory, prompt or runtime path.
---

## Forbidden here

- any statement describing a recipient, data flow or capability that does not run today, or that omits one that does (the member-feedback text carries a name and a preview, and says so)
- softening or removing the STOP, HELP, message-rates and no-sharing language in the SMS section
- text fainter than readable against the navy field
