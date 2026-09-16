# RELATIONAL-CLAIM-IDENTITY-01 — C0–C4

**Status:** C0–C4 COMPLETE · shadow/research only
**Canonical base:** `a0e3aa45e5bbeaabbbf49996dd4b93edb865dec2`

## Result

A conversational turn is now treated as a container; claim units are addressable by stable source-bound identity.

Claim identity is SHA-256 over version + turn id + exact character span + exact source bytes. Semantic similarity cannot merge identities.

The deterministic parser preserves exact start/end spans and classifies units as assertion, question, directive, fragment, or quotation. Internal clause complexity is marked `composite/uncertain`; generic standing gestures may bind only atomic eligible units.

## C3 falsifiers

17/17 pass. The suite proves stable identity, cross-turn distinction, edit sensitivity, assertion/question separation, conservative composite handling, exact confirmation binding, ambiguity with multiple assertions, question-only restart binding, opaque-reference abstention, exact quoted selection, duplicate-span distinction, and global-restart non-collapse.
## C4 finding

The real-shaped successful-recall turn originally failed because a quoted member phrase and a question occupied one composite sentence. Adding `quotation` as a first-class claim unit and requiring a deterministic quotation-confirmation frame produced four exact units:

1. MAIA explanatory assertion — composite;
2. “Here's what you said:” — fragment;
3. quoted member phrase — atomic quotation;
4. confirmation question — atomic question.

The subsequent member gesture “that is exactly it. MAIA!” binds only unit 3 because the quotation is followed by the explicit confirmation question “Does that sound like the one...?” Without that frame, generic confirmation remains ambiguous. It does not grant standing to the question or neighboring assertions.

The restart case likewise yields a sole atomic question-act, allowing “I already told you” to contest the question without altering neighboring assertions.

A broader report — “we keep starting this conversation over and over” — is intentionally classified `META_PATTERN` and does not bind one claim by adjacency.

## Boundary

This parser does not decide truth, standing, or semantic equivalence. It creates stable claim addresses and safe abstention. C5/C6 must test whether those identities survive real transcript replay without introducing false precision.
