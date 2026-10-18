---
tier: 4
authority: derivative
source_type: research
title: "Wisdom keeper attribution and reciprocity — editorial candidate"
author: "Soullab editorial curation"
version: "0.1"
date_added: "2026-10-17"
status: review
safe_for_retrieval: false
---

# Wisdom Keepers — Attribution, Discovery, and Reciprocity

**Research-stage candidate only; not ratified Soullab canon, deployed interface, or third-party endorsement.**

## Purpose

Soullab benefits from the work of people whose writing, teaching, practice, and traditions preceded MAIA. A useful wisdom library must make these people and their intellectual lineages *more visible*, not absorb their names into an anonymous AI persona. Where relevant, MAIA should let a member visit the author's own work directly.

Glenn Perry's *AstroPsychology* is the first narrowly documented example. The founder has expressed an intention to contact him personally; this proposal does not authorize ChatGPT, JARVIS, Soullab, or MAIA to send any request on his behalf.

## Source-specific commitments (proposed)

1. **Name the author and distinguish ideas.** Identify Glenn Perry, Ph.D., and AstroPsychology by name when an opted-in conversation materially uses that perspective. Separate Perry's documented claims from Soullab's own synthesis.
2. **Link to the source.** Present human-readable, author-maintained navigation links when useful: his personal site, Academy, two referenced book pages, all books, and the author essay index. The six exact URLs are pinned in `sources.json` under `wisdom_keeper_discovery.resources`; a copy for the isolated founder preview is in `lib/maia/knowledge/perryWisdomKeeperLinks.ts`. Tests must detect drift.
3. **Support direct discovery.** Members can study and, if they choose, purchase works or courses via the author's own sites. Avoid affiliate redirects, paywall bypass, fabricated affiliations, or a recommendation that someone must purchase to receive responsible help.
4. **Don't imply endorsement.** A link or citation is not an agreement with MAIA's interpretations, a commercial sponsorship, or approval by the author. Do not state or imply that Perry has consented to the product or licensed his writings.
5. **No silent substitution.** The AI may offer original, attributed commentary subject to corpus approval. It must not quote substantial copyrighted passages, load complete books, embed scraped articles, or present an AI paraphrase as the author's own passage.
6. **Preserve contestability.** In this domain especially, astrology may be used as symbolism and personal reflection but must not be passed off as clinically validated diagnosis or causal prediction. When citing an author's stronger psychological diagnostic or prognostic claims, accurately attribute those claims *as claims* and distinguish empirical evidence limits.
7. **Respect member agency.** A member may ask to explore the source, decline astrology, or pursue the author's materials without having to join a Soullab session. The interpreter is never authoritative over a member's lived meaning.

## Source authority and technical boundaries

- Official websites confirmed from the author's and Academy's own pages: `https://aaperry.com/` and `https://astropsychology.org/`.
- Navigation to the author is **not** equivalent to permission to store or redistribute that author's writing. Rights for full-text retrieval, chunks, training, and excerpts remain closed unless separate, specific rights evidence is established.
- The original Soullab teaching, `soullab-original-teaching-candidate.md`, remains `status: review` and `safe_for_retrieval: false`. No source has been admitted or activated merely by creating links.
- Stage C founder preview uses static, author-directed `<a href>` links. They open only upon a person's explicit action, no automatic crawlers or background network requests. A new tab does not transfer chat content, birth data, tokens, or member IDs in URL parameters. Use `rel="noopener noreferrer"` when `target="_blank"`.
- Only the existing server-verified founder authorization may expose the founder review page; the flag is OFF by default. These links are ordinary public navigation, not an alternative access gate.

## Toward a living community service (new founder direction)

This early reciprocity note primarily addresses naming, attribution and source links. The subsequent **[Wisdom Keepers Commons service charter](./WISDOM-KEEPERS-COMMONS_SERVICE-CHARTER_CANDIDATE_20261017.md)** develops the founder's larger intention: a community offering that connects members and living teachers through mutually chosen encounters, study, recognition and support, rather than a marketplace or extractive content funnel.

It is **not** a parallel Commons implementation. The new service is proposed within the already-ratified FR-02 Interest Commons relational ontology, with FR-06 declaration-only discovery and FR-07/08 authorship/privacy membranes. The pilot remains unimplemented; Glenn Perry is an unaffiliated referenced author, and the founder alone will decide whether to contact him.

See the [pilot contract](./WISDOM-KEEPERS-COMMONS_PILOT-CONTRACT_CANDIDATE_20261017.json) for current refusal defaults: no member signup, no automatic introductions, no payments pool, no partner claim and no AIN source activation.

## Future representation standard (not yet adopted)

For additional wisdom keepers, propose the same metadata shape: original name, verified maintained website(s), provenance links to books/essays, source type, brief description, author affiliation status, rights standing, last verification date, and the distinction between original intellectual claims and Soullab's interpretation. Avoid a silent extractive corpus in which readers cannot find the original teachers.

**Review decision still required:** whether and where this proposed standard enters Soullab's broader public Wisdom Library. The Glenn Perry preview on this branch does not imply that decision has been made.
