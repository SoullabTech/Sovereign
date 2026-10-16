---
room: Soul Portrait — Recipient Delivery Threshold
human_activity: The practitioner offers a prepared adult Soul Portrait to one person with explicit permission to share from the subject and agreement to receive from the destination, without assuming that publishing authorizes further recipients.
surfaces:
  - components/soulPortrait/SendPortraitPanel.tsx
change_class: experiential
principles:
  - docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md — permission is not inferred from a private URL and a previously published portrait must not create unrestricted delivery authority.
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md — preserve an understandable place and clear human gesture.
  - docs/canon/SOULLAB_THEME.md — maintain the existing quiet editorial hierarchy and meaningful restraint.
reference_surfaces:
  - components/soulPortrait/SendPortraitPanel.tsx — accepted pre-remediation draft and published presentation, retaining the existing private-link and invitation copy.
  - docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md — existing gate-four governed subject consent and finalization model.
shared_with_house: Familiar serif editorial heading, the existing Soullab material palette, deliberate human permission before sharing and a quiet success/error explanation.
distinct_to_room: Consent to publish and subject permission to share are separate from recipient agreement to receive; the address being authorized is visible and edits revoke local checkbox state without changing the portrait itself.
screenshot_desktop: docs/design/contracts/screenshots/soul-portrait-f4-20261012-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/soul-portrait-f4-20261012-mobile.png
experience_verification: 2026-10-12 fixture-only Chromium witness of the exact SendPortraitPanel React component using locally bundled synthetic content and installed Google Chrome; 1440x900 desktop and 390x844 mobile screenshots exist. On the already-published state, a synthetic recipient address revealed the two-party consent statement; Send email remained disabled until explicit checkbox selection, then became enabled. Changing the recipient cleared checkbox and disabled sending. Switching to draft mode, Send portrait required BOTH the recipient-sharing checkbox and the existing subject consent checkbox. No simulated click sent mail, no external HTTP requests occurred, and neither viewport overflowed horizontally. Backend policy and refusal behaviors were independently exercised by the mocked unit/regression suite; no authenticated real-member session or production Soul Portrait was used.
---

# Soul Portrait — recipient-specific delivery threshold

## Human intent

A person offering a Soul Portrait must know who is receiving it and that sharing this specific private portrait is authorized. An existing published URL is not blanket permission to send it to a different address.

## Arrival and continuation

The existing Deliver/Send panel, publishing gesture, link-copy fallback and message layout remain unchanged. When an email address is entered, the member now meets one explicit checkbox naming the address and stating both permissions: the subject authorized sharing with that recipient, and the recipient agreed to receive it. The recipient cannot be silently changed without clearing that acknowledgement.

## Gestures

| Gesture | Human meaning |
| --- | --- |
| Enter recipient email | Identify the exact intended destination for this delivery |
| Acknowledge consent | Confirm both subject share permission and recipient acceptance |
| Send portrait | Deliver only after the two-party permission check |
| Copy private link | Preserve the previously available link-only workflow without an email dispatch |

## Deliberate limits

This work does not invent or infer new subject consent. A revoked published portrait cannot be reauthorized through Send. A minor without the separate guardian flow remains blocked. The synthetic screenshots witness presentation and local interaction only, not SMTP delivery or real-member backend state.

## House / room distinction

The House supplies editorial hierarchy, trustworthy gestures and refusal truthfulness; the Soul Portrait room alone carries the irreversible publication and exact-recipient sharing covenant. The changed checkbox protects that covenant without turning it into a legal dashboard or adding a decorative step.
