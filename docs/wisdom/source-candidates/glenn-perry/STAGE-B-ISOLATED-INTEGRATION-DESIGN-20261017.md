# Glenn Perry-informed wisdom — Stage B isolated integration design

**Status:** REVIEW PROPOSAL ONLY · No founder corpus admission or publication granted. No member inference, production or deployment.  
**Date:** 2026-10-17  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Rights-holder contact:** founder to handle personally, **do not send** any drafted licensing request.

## Outcome we are trying to achieve

A member may **choose** a clearly attributed psychological-astrology lens that helps them inquire into lived experience, tension among needs, and developing identity. MAIA should neither switch into Perry's worldview by default nor claim the chart establishes a diagnosis, trauma, or fate.

Perry's works remain a named intellectual lineage. The exact Perry book and author-essay bodies remain unlicensed for MAIA embeddings. Only original Soullab prose (still requiring human editorial and ownership/authority review) is a prospective independent candidate for admission.

## What the existing MAIA code actually does (inspected 2026-10-17)

| Source | Observed behavior | Stage B consequence |
| --- | --- | --- |
| `lib/maia/knowledge/knowledgeField.ts` | Exactly 12 domain IDs; current keyword detector has no dedicated Perry, AstroPsychology, or astrology domain. | Do **not** pretend the staged sources are discoverable. Do not silently create a 13th domain. |
| `lib/maia/prompts/knowledgeFieldBlock.ts` | Constructs general domain context; if invoked with no detection it uses fallback domains. | Never embed Perry as ambient or default prompt context. Keep source lens independent of general fallback. |
| `app/api/oracle/conversation/route.ts` knowledge field region | Ask MAIA path builds generic domain block; otherwise builds it on matching domain language. | An explicit Perry source selection must be a distinct, server-verified gesture rather than keyword-only injection or a reply-level suggestion. |
| `app/api/astrology/reading/route.ts` | POST parses a supplied intake and returns a composed reading. No verified-member-session check appears in this route. | **Not approved as a member-personalization insertion point.** An isolated study may use fictional data, but production source retrieval must be gated behind verified identity and relevant Astrology room jurisdiction. |
| `docs/design/contracts/astrology.md` | Astrology room requires positively verified server identity, forbids chart-as-diagnosis or fate, and distinguishes absent data from unavailable identity. | The future lens must preserve those states and must not infer chart data from local caches. |
| `lib/corpus/admission.ts` and `lib/library/globalRetrievalAuthority.ts` | Per-source structured rights evidence and globally authorized exact path/checksum, default exclusion. | A citation or founder interest is not an admission act. Do not turn on retrieval without governed evidence. |

## Proposed minimum change *after* an explicit founder decision

1. Keep the twelve-domain knowledge field unchanged. Create one **Perry-attributed source lens** as a separately selected option, not a replacement for psychological or Jungian conversation.
2. Carry a trusted, server-created `source_selection` for *original curated Soullab commentary only*; a string in a member's message and a frontend boolean are **not** authorization. There is no ambient knowledge-field injection.
3. Resolve an authenticated member and present request context using the existing MAIA/room trust boundary before consulting any member's chart. Sanctuary refuses durable provenance/memory promotion; avoid shared knowledge writes.
4. Ask for an explicit first-person choice, such as “Explore a symbolic perspective inspired by Glenn Perry.” Decline, withdrawal, or a member asking for no astrology wins immediately.
5. Require a **currently admitted exact commentary source** under the existing corpus-authority manifest. Validate source path, content SHA-256 and rights record through the trusted server-side authority layer. No admitted source -> no Perry retrieval or prompt.
6. Compose six clearly separated parts when relevant: calculated facts; named symbolic tradition; whole-chart synthesis; possible expression; present activation based on real calculated transits; member's own meaning. Do not fabricate an Ascendant or house with an unknown birth time.
7. Cite Glenn Perry's source in the material's bibliography and mark the Soullab original synthesis as a **distinct editorial choice**. Keep Perry's purposive/script claims distinguishable from Soullab's non-deterministic adaptation.
8. Keep licensed-primary-text path separate. No embeddings of book/essay bodies, long quotations, or model training until a rights-holder permission record covers the exact proposed use.

**Do not implement a member-facing route or change `data/ain/corpus-admission.json` in this review-only branch.**

## Source custody required for a future authorized admission

- Exact text candidate: `soullab-original-teaching-candidate.md`, review-only and `safe_for_retrieval:false`.
- Scholarly reference map: `sources.json` (two books, nine author essays; content rights disabled).
- Authored distinctions: `claims.json` (seven Perry propositions, eight Soullab editorial constraints).
- Attribution/quotation scan by curator; editor approval by founder; confirmation of Soullab's authority over this specific edited text.
- Candidate content exact SHA-256 and separately governed source authority evidence. A content change must invalidate the earlier source hash and trigger re-review.
- Member-context permission is a separate gate from source copyright. Neither can substitute for the other.

## Completed rehearsal / its limits

Executed in a disposable directory on the authorized Mac Studio:

- **12/12 source-lens rehearsal tests passed** at pinned commit `a79631b5d6c1d82aa511281fcdfb7d987c4966e3`. It type-stripped and imported the real `knowledgeField.ts` and `knowledgeFieldBlock.ts` into local ESM, then evaluated an **in-test review-only selector** against 16 previously fictional scenarios. This is not route integration.
- Prior 14/14 tests checked citation/rights metadata and exercised actual `corpus/admission.ts` and `globalRetrievalAuthority.ts` in disposable fixtures.
- **Neither test set invoked a language model, actual birth-chart service, deployed server, authenticated member session or production database.**
- The source review branch contains only documentation and standalone test files as of this act; no app runtime files or protected branches were altered.

## Invariants for follow-up review

- **Member says “no astrology”** -> no Perry source selection or symbolic insistence.
- **Sanctuary** -> no cross-boundary memory or knowledge contribution; no unsolicited source promotion.
- **Not explicitly requested** -> no Perry source prompt in ordinary support or psychology.
- **Source unadmitted / revoked / digest mismatched** -> return an ordinary response without Perry source content.
- **Auth unresolved** -> no member chart interpretation; do not infer an absent birth chart.
- **Birth time unknown** -> no confident Ascendant/house statements.
- **Psychopathology, childhood trauma, abuse, prognosis** -> never derive them from chart positions.
- **Perry vs. Jung vs. Elemental Alchemy** -> name different intellectual origins and contestable claims.
- **Original commentary vs. Perry's books** -> distinct records and separate license checks.

## Founder decision still needed

A simple `continue` supports non-mutating source rehearsal but **does not constitute an ownership attestation, content ratification, copyright license, or production approval**.

A future explicit decision may authorize **isolated code-only integration for fictional test accounts**, without admission to production or live member retrieval. Promotion of the edited Soullab commentary will require a separately documented founder authority act and successful checks of source provenance, the live call site's trust boundary, and the rights/evidence contract.

**Recommended next engineering task after authorization:** implement a default-off, server-only source-lens selection helper behind verified member/opt-in, and test a real isolated MAIA request path with fictional identity and charts. Stop if a source-admission or authentication bypass appears.
