# Stage G — Online-first to hybrid Wisdom Keepers gatherings witness

**Date:** 2026-10-17  
**Repository:** `SoullabTech/Sovereign`  
**Review branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Exact fully tested source commit:** `43db30852c8449435d8095b210c0124766130305`  
**Scope:** Founder-approved **service design direction** for online-first, then hybrid. This is not a meeting invitation, provider selection, account change, Circle/Commons runtime activation, licensed source use, canonical merge or production deployment.

## The actual founder decision

Start with online Wisdom Circles. Once a small, consent-based community learns to meet thoughtfully, offer additional online study/gathering/keeper-led forms. Grow into local and hybrid gatherings only after distinct venue, media, audio, accessibility and consent acceptance.

**Hybrid must make remote attendees equal participants, not spectators on a livestream.** The progression adds human connection; it does not require members to buy anything, speak publicly, disclose private MAIA histories, accept astrological claims or commit to continuing.

The first experience stays *Where Symbols Meet Life*: 75 minutes, founder-hosted, 6–8 voluntary adults as a practical facilitation target, educational/nonclinical, recording off, no AI transcription or group AIN knowledge promotion. Glenn Perry remains a linked, unaffiliated author—not a claimed guest, endorser or licensed text source.

## Source inspection and technical recommendation

Current repo contains a provider-agnostic meetings **design sketch**, meeting URL/meta types, an external-video link-out **spec**, LiveKit token minting, and a Session Room WebRTC **two-person** encounter transport. These do not establish a production-ready multiparty or hybrid system; the original WebRTC and LiveKit source has its own session/practitioner/consent boundaries.

The public events registration route allows anonymous email registration for open, non-private events by design. It is **not** a substitute for the desired private, scoped, member-consented Circle admission. The private first pilot should not be opened through that endpoint merely because it already exists.

**Recommendation:** start with a real, host-controlled **private external video provider** chosen from accounts/services the founder can actually use, subject to truthful audit of waiting room/admission, revoke, host moderation, recording/AI notes, technical/provider logs, member visibility and low-bandwidth/camera-off accessibility. External conferencing data is processed under the chosen provider's terms; putting the link in Soullab does not make that vendor sovereign. Do not claim exact provider privacy, E2EE or zero retention without evidence.

Neither Zoom nor Google Meet nor Proton Meet nor Jitsi nor LiveKit was selected, configured, connected or purchased in this work. There is no real meeting ID or URL.

## Isolated source changes

1. [Online-first and hybrid-later service roadmap](./STAGE-G_ONLINE-FIRST_TO-HYBRID_GATHERINGS-CANDIDATE_20261017.md): four phases and independent gates, repo substrate assessment, first online host procedure, optional salons, equal hybrid presence and escape/fallback plan.
2. [Machine-readable online/hybrid delivery contract](./STAGE-G_ONLINE-TO-HYBRID_DELIVERY-CONTRACT_CANDIDATE_20261017.json): provider unset, no event/invite, no data sharing or finance, all live rehearsal checks awaiting actual source evidence, hybrid parity unverified.
3. [One-page founder orientation](./STAGE-G_ONLINE-FIRST_TO-HYBRID_FOUNDER-BRIEF_20261017.md): purpose, phase timeline, first provider/account decision, and later hybrid admission.
4. [Stage F first pilot contract](./STAGE-F_FIRST-GATHERING_PILOT-REHEARSAL_CANDIDATE_20261017.json), [facilitator guide](./STAGE-F_FIRST-GATHERING_FACILITATOR-KIT_CANDIDATE_20261017.md), [unsent invitation/consent](./STAGE-F_FIRST-GATHERING_INVITATION-AND-CONSENT_CANDIDATE_20261017.md), and [founder brief](./STAGE-F_FIRST-GATHERING_FOUNDER-BRIEF_20261017.md) now explicitly favor **online** while keeping provider, datetime, participants and join link unset. The hybrid transition requires a fresh notice and consent.
5. `lib/maia/knowledge/wisdomGatheringDeliveryPreview.ts` and the existing `components/maia/knowledge/PerryLensFounderPreview.tsx` add a **read-only online vs hybrid** comparison. The founder-only page is still disabled by default and unlinked from normal MAIA.
6. `stage-g-online-hybrid.test.mjs`, plus the Stage F contract and WebKit browser tests, validate the exact release refusals and static accessible interactions. No meeting API actions were created.

## Technical verification — source and browser only

At source commit `43db30852c8449435d8095b210c0124766130305`, a **single combined run** executed all earlier isolated Stage A–F checks plus Stage G using a disposable checkout on the authorized Mac Studio:

| Area | Passing checks |
| --- | ---: |
| Stage A–F source provenance, corpus/source rights, Sanctuary, fictional request/actual Next.js 15.5.11 handler, founder gates, community, keeper fields and first Circle | 138 |
| Stage G's explicit provider/online/hybrid refusal contract tests | 11 |
| Two additional desktop/mobile WebKit format-preview tests | 2 |
| **Total** | **153/153, zero failures, zero skipped** |

Earlier targeted Stage G browser/contract rehearsal passed **38/38** (including Stage F and WebKit). Strict TypeScript `noEmit` passed for the updated founder-preview TSX, existing client privacy helper, static Elemental rehearsal cues, online/hybrid format module, and source links module.

Two initial assertion failures matched wording, not a lost rule: the roadmap refers to a “participant advocate” rather than the exact expression “remote participant advocate,” and prohibits a “public livestream” rather than using the expression “one-way livestream.” Tests were corrected to check the exact actual statements. A Stage F assertion was updated to match the newly honest online name/camera visibility notice. The final complete suites passed after these test fixes; no privacy or consent gate was weakened.

**What was NOT tested:** real third-party meeting credentials, provider account privacy, actual live audio/video, media host controls, real participant/member login, member rosters, recordings, TURN/LiveKit production connectivity, attendance, in-person audio mixing, hybrid microphones, actual captions, published Circle events, or partner acceptance. No full web app build or production-site action occurred as part of this work.

## Online first: real human/operator go-no-go remains CLOSED

- Provider and account chosen by founder: **no**
- External vendor data/recording settings confirmed: **no**
- Private join control and denied stranger witnessed: **no**
- Screen-share and meeting ending/revocation witnessed: **no**
- Accessible camera-off/mobile alternative and caption/accommodation choice confirmed: **no**
- Actual venue/provider terms reconciled with participant notice: **no**
- Founder-approved time, timezone, cost and host: **no**
- Recipient list and contact permission approved: **no**
- Separate send/launch authorization: **no**
- Keeper invited or partnered: **no**
- Online Circle technically hosted: **no**
- Hybrid venue/audio equality/privacy witness: **no**

Source corpus authority remains **unadmitted**. The Perry source-lens approval remains null. The Stage C founder preview flag remains off and its page is not deployed. The overarching Sanctuary source-of-truth issue remains separately open.

## Next concrete decision

**Which existing video meeting platform/account would the founder like us to examine in an isolated two-device, fictional-session host and guest test?** Prefer the simplest controlled service that meets the intended privacy, accessibility and humane experience. If no satisfactory provider exists, postpone the gathering while testing another option.

No booking, online event, hybrid gathering, invitation or paid subscription is implied by this witness.

**Disposition:** Stage G research/design and simulated acceptance PASS. Human and production release gates remain closed.
