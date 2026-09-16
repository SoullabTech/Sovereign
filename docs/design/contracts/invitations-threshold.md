---
room: Invitations Threshold
human_activity: creating an invitation, handing its credential to another person, and later managing the invitation without retaining recoverable secret material
surfaces:
  - components/invites/InviteManager.tsx
  - app/maia/invites/page.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — the room must make the human handoff legible rather than exposing storage mechanics as the experience
  - SOULLAB_THEME — restrained hierarchy and explicit gestures belong to the shared House language
  - MAIA_OATH — the system must not imply it can recover a credential it deliberately does not retain
reference_surfaces:
  - docs/design/contracts/onboarding-threshold.md — adjacent invitation/entry boundary and privacy-preserving language
  - docs/design/contracts/house-return.md — House/Room distinction and quiet hierarchy
shared_with_house: quiet hierarchy, explicit human gestures, restrained status language, and truthful statements about what the system can and cannot retain
distinct_to_room: this is the handoff side of invitation rather than the entry side; the member creates a credential, must copy it during a brief reveal, and thereafter manages only status and recipient context
screenshot_desktop: docs/design/contracts/screenshots/invitations-threshold-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/invitations-threshold-mobile.png
experience_verification: real `/maia/invites` surface served from the R12 branch and walked in system Chrome at 1440x1000 and 390x844. A synthetic local identity was pinned in the browser harness and identity/invite API responses were intercepted with synthetic data; the actual page, InviteManager component, layout, animation and copy rendered unchanged. In both widths, create produced a transient `Copy this passkey now` state with the synthetic credential while the persistent invite list simultaneously stated `Passkey hidden after creation`. No production invite or member was created.
---

# Invitations Threshold — Experience Contract

## What this room is for

A member decides to invite another person and receives a credential to hand over. The room must make one fact unmistakable: the credential exists in plaintext only at creation time. Soullab can remember the invitation, its recipient context, status and expiry, but it cannot later recover or re-display the credential itself.

## Arrival

> **Invite Friends**

The room begins with the invitation relationship, not with cryptography or database language. It shows current invitation capacity, existing invitation status and one clear gesture for creating a new invitation.
## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| create an invitation | `Create Invite` | names the relational act, not the credential implementation |
| hand off the credential | `Copy this passkey now` | makes the one-time custody moment explicit before the secret disappears |
| finish the handoff | `I’ve saved it — hide this passkey` | returns control to the member and states that hiding is intentional |
| withdraw an unused invitation | `Revoke invite` | names the authority being exercised without exposing the credential |

## Forbidden here

- re-displaying or re-copying an invitation credential after the creation response;
- storing plaintext invitation credentials in the database so the UI can recover them later;
- implying a hidden credential can be recovered when only its one-way hash remains;
- turning a member passkey, prefix, contact record, or historical beta key into invitation authority;
- exposing another person's credential merely because the member created the invitation.

## The two brand tests

**Same house?** Yes. The room uses the same restrained hierarchy, warm threshold language, explicit gestures and privacy honesty as Onboarding Threshold and House Return.

**Distinct room?** Yes. This is the outward handoff moment: the member creates and gives access. Onboarding Threshold is the inward arrival moment: another person presents what they were given. The one-time reveal is what makes this room distinct.
