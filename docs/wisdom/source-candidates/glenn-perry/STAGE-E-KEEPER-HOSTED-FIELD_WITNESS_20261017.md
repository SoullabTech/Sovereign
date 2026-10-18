# Stage E — Keeper-Hosted Field approval and engagement: isolated witness

**Date:** 2026-10-17  
**Repository:** `SoullabTech/Sovereign`  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Source revision tested before this witness was committed:** `ec9abdbd0d7359220c21815a92f9d0b422b6fec7`  
**Standing:** **Field charter, approval contract, fictional founder preview and tests PASSED. No keeper or field has been approved or deployed.**

## Founder direction

A future Soullab service might allow wisdom keepers to **have a specifically approved, hosted field** in which they engage consenting members and one another, while preserving their authorship, their own voice, boundaries, remuneration, and refusal rights. It should not be a marketplace, a source extraction funnel, a clinical identity assertion, or an excuse to turn MAIA into a synthetic representation of a living teacher.

**“Approved Field” has a deliberately narrow meaning:** approval to take part in named activities under verified identity, human agreement, privacy protections, a defined period, and independently confirmed access. It is not blanket scientific certification, copyright transfer, therapeutic license, platform administrator role, global Commons membership, or unrestricted contact permission.

## How the field fits current Soullab governance

The six-field FR-02 ontology already defines Personal, Dyadic, Circle, Constellation, Commons and Co-Lab. Stage E uses **Keeper-Hosted Field** as a *hosting pattern across these existing fields*, not a seventh kind. Specifically:

- Individual encounter → Dyadic with separate bilateral consent
- Hosted group inquiry → Circle, with procedural facilitator authority (FR-05) and membership membrane
- Multiple consenting Circles → Constellation, without automatic visibility of Circle interiors
- Source discovery and member-authored declared interests → ratified FR-02 Interest Commons, adhering to FR-06
- Co-creation across invited human keepers and members → Co-Lab with bounded ownership and publication rights

This candidate **does not modify** `lib/circles/*`, `app/commons/*`, or real access decisions. The current Circle API uses its existing restricted gate; founder review of this proposal does not grant a Circle role, open a new cohort, or create an approved keeper.

## Stage E files

1. [Keeper-Hosted Field charter](./KEEPER-HOSTED-FIELD_APPROVAL-AND-ENGAGEMENT-CANDIDATE_20261017.md) — concepts, approval gates, member rights, keeper-host scope, bounded encounters, privacy and clinical boundaries, compensation, and possible future studio/teaching services.
2. [Machine-readable Keeper Field approval contract](./KEEPER-HOSTED-FIELD_APPROVAL-CONTRACT_CANDIDATE_20261017.json) — every live capability false, independent stewardship/keeper/member/technical approval gates, revocable scope and default-out restrictions.
3. [Standalone Stage E contract checks](./stage-e-keeper-hosted-field.test.mjs) — **15/15** tests after integration with the Commons umbrella policy. Includes consent, private field visibility, source rights, responsible host authority, no impersonation, a fictional 75-minute adult nonclinical event, no created Perry field, and no operational feature flag.
4. **Disabled founder preview** `components/maia/knowledge/PerryLensFounderPreview.tsx` — added a fictional room concept with two controlled perspectives: what a member sees and what an *invited keeper* would be able to propose. Both explicitly state the room is not real and Perry is unaffiliated. Buttons switch only local sample text.
5. **WebKit UI checks** in `stage-c-founder-preview-webkit.test.mjs` — two Stage E additions verify reversible view choice, keyboard activation, mobile size, no forms, no external browser requests, and explicit no-host/no-data warnings.
6. The umbrella [Wisdom Keepers Commons service charter](./WISDOM-KEEPERS-COMMONS_SERVICE-CHARTER_CANDIDATE_20261017.md) and [pilot contract](./WISDOM-KEEPERS-COMMONS_PILOT-CONTRACT_CANDIDATE_20261017.json) were cross-linked. They remain proposal-only.

## Fictional first gathering ready for founder consideration

**Where psychological symbols meet lived experience**: a 75-minute, adult, nonclinical, founder-facilitated study Circle **without Glenn Perry as a guest** unless he personally agrees in the future. Proposed voluntary operational target: about 6–8 people, *not a Circle constitutional maximum*. The group begins with consent and attribution, uses only responsibly referenced public work and Soullab's own original questions, leaves room for silence/disagreement, and closes without automatic memory, public summary or AIN upload.

Sequence: **0–10** arrival and boundaries; **10–20** source/author lineage; **20–35** original inquiry; **35–55** quiet/optional sharing; **55–65** multiple interpretations; **65–75** member-governed close. No date, attendees, invites, recording, meeting link or license exist.

Future expansions such as live keeper-led teaching, paid/free course offerings, co-keeper salons, ethical residencies, supported mentorship, practitioner teaching, community scholarships and original-resource shelves are **possibilities**, each needing rights/consent/operational review rather than automatic feature rollout.

## Verification

**At tested source revision `ec9abdbd0d7359220c21815a92f9d0b422b6fec7`**, the Mac Studio fixture retrieved the exact branch bytes and ran the same earlier isolation suites plus Stage E:

| Scope | Tests passed |
| --- | ---: |
| Prior Stage A–D source, rights, consent, simulated Next.js 15.5.11, founder gate, links, WebKit and Commons pilot | 109 |
| Stage E zero-authority keeper field contract | 15 |
| Stage E added WebKit member-versus-keeper room checks | 2 |
| **Combined** | **126 / 126** |

Targeted `node --check` passed for the source helper, client gate, links and serving route. Strict TypeScript `noEmit` passed for the touched founder-preview UI, client gate, link module and current client Sanctuary reader. This is **not** a full Next.js build or production endpoint acceptance.

Two **mutation controls** in entirely disposable copies were intentionally invalidated and the Stage E checks rejected each:
- Setting `scoped_capabilities.view_member_personal_field = true` killed the narrow keeper-permissions law.
- Falsely setting `reference_keeper.keeper_agreed_to_host = true` killed the unaffiliated/consent law.

These prove static contract-test sensitivity, not real database/API authorization. No original source or runtime permission was mutated.

## What remains impossible/unapproved

- Glenn Perry has not been contacted by ChatGPT. The founder retains personal outreach. He is not an approved partner, host, facilitator or Circle member.
- No Keeper Field, keeper role, event, member matching, direct message, roster, payment, recording, MAIA model imitation, copyrighted text storage, embeddings or AI knowledge admission is active.
- The founder-only preview route remains **server feature-flag OFF**, gated by verified founder session/allowlist, and unmerged; the normal MAIA UI is unchanged.
- The general MAIA Sanctuary trust boundary remains a separate cross-feature release blocker. The Perry source lens itself is still null and has independent gating.
- Future implementation requires distinct founder charter approval, the keeper's specific acceptance, members' explicit informed entry, verified scoped role and professional/clinical safeguards where relevant, and real route/browser/DB tests plus a separate release decision.
- No `app/commons/*`, `lib/circles/*`, Canon, production system, payment, source rights, live member data or contact recipient has been changed.

## Recommended founder review, not activation

Review the service promise, actual keeper-host duties and the first educational pilot. Confirm whether **“Keeper-Hosted Field”** is an internal technical term or a user-facing name. Then a future isolated programme can design *trusted role-scoped hosting and real opt-in entry* within the already-ratified Commons/Circle architecture, before any invitation or deployment.

**Disposition: Stage E preparation verified; product/partner/clinical/corpus/release gates closed.**
