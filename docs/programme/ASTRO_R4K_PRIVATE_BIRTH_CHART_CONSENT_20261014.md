# ASTRO-R4K — Private Birth-Chart Ingress Hold

**October 14, 2026 · isolated engineering candidate · independent Class A and combined beta HOLD**

## Governing founder approvals (policy only)

1. Private member charts remain private until their owner deliberately chooses material to share with MAIA.
2. A single approved transfer never authorizes general recall in future conversations.
3. Unknown historical privacy provenance is withheld from recall, not silently deleted.
4. Member deletion must prevent recovered backups from resurrecting erased information.

This source-only candidate does **not** grant a new chart Send right, full account erasure or deployment approval.

## Additional R4K gap discovered after R4J

R4J already invoked the source-owned hard-off `mayAttachImplicitAstrologyContext()` for its ordinary MAIA **Western natal** loader. However `app/api/sovereign/app/maia/list/route.ts` had a separate `shouldComputeWuXing = isRecognizedUser && !isSanctuary` gate. That path automatically queried `member_bazi_profile`, loaded member birth date/time/location, built a natal-derived Wu Xing constitution and Da Yun reference text, then supplied it to prompt and shadow/metadata paths. Member recognition is **not** a per-conversation disclosure grant. A plain natural-language question does not authorize private birth-data transfer.

The direct `lib/sovereign/maiaVoice.ts` context assembler also accepted caller-provided Wu Xing and Bridge addenda without the R4e ambient astrology restriction. Meanwhile `lib/maia/context/maiaAstrologyTransferPolicy.ts` stripped only Western astrology keys, not BaZi/Wu Xing.

## Isolated correction

- Ordinary MAIA route now gates **both** `shouldComputeWuXing` and `shouldLoadAstrology` with the same source-owned, compile-time-false `mayAttachImplicitAstrologyContext()`. The private BaZi load stays source-present but is not entered by this default route. This conservative temporary hold also suspends otherwise member-neutral **moment-only** Wu Xing addenda until they can be separated without reading member birth records.
- Shared `withoutImplicitAstrologyAddenda` removes hidden `wuxingSnapshotAddendum`, `bridgeSnapshotAddendum`, `wuxingAddendum`, `baziAddendum`, `daYunAddendum` and structured `wuxingSnapshot`/`bridgedSnapshot`/`baziProfile` along with the existing Western natal keys. Actual member-authored input and unrelated authorized journal metadata are preserved.
- Direct `appendAllContextAddenda` no longer accepts Wu Xing or Bridge prompt addenda supplied through an unverified `MaiaContext`. Existing natal prompt exclusion remains in place. None of this invents or consumes a R4F grant.
- R4K's tests cover the hard-off shared gate, spoofed client consent/meta, private direct prompt fields, source authority for the ordinary MAIA loaders, unchanged chart Send OFF and R4J deletion HOLD.

## Bounded evidence (not independent acceptance)

- The 23-suite focused Jest batch, including all R4e–R4J inherited protections and new R4K tests, passed **122/122**.
- Scoped R4F/MAIA privacy TypeScript and scoped account deletion TypeScript: **0 diagnostics**.
- No live model provider, authenticated browser, real chart, full Next.js production build, complete runtime SQL or physical Safari evidence was produced.
- The exact source patch and per-file hashes are maintained in the R4K evidence packet. Source only; no production build/deploy/schema operation.

## Critical cross-branch integration HOLD — Writer’s Studio PR #1820

A separate read-only source check of the **draft Writer’s Studio release worktree** at git `35440fb3b93b5b49031421e04121bb747cb9f7df` found the combined MAIA route still uses `isRecognizedUser && !isSanctuary` for **both** Western natal and BaZi loaders. That exact tree **lacks** `lib/maia/context/maiaAstrologyTransferPolicy.ts`; its `lib/sovereign/maiaVoice.ts` still admits Western astrology, Wu Xing and Bridge addenda. This demonstrates that **merging only the tiny R4K route change cannot satisfy consent in that release candidate**. It must receive a qualified cross-branch integration of all R4e–R4K privacy controls and R4J deletion containment, without discarding Writer’s Studio fixes.

Do **not** merge/adopt this isolated patch directly into that release, claim independent review, enable member Send, or broaden beta. The required next step is to create a single exact frozen candidate with no implicit private natal/BaZi prompt path, actual signed one-use member-approved Send and no future recall, independently reviewed R20 deletion/recovery, and authenticated end-to-end Chrome/physical iPhone Safari evidence.

## Unresolved security and functional limits

1. Other possible ingress routes, callbacks, provider payloads, voice and downstream model paths require complete inventory; a local route/prompt source gate is not proof of whole-platform consent.
2. A truly private moment-only Wu Xing public-weather mode should be separately specified with zero member birth-row access or backdoor association. Until independently approved, the automatic lane remains OFF.
3. All derived memory, retrieval/history, old session caches and source deletions must honor conversation-scoped grants and historical unknown suppression; independent Class A acceptance absent.
4. R20 signer, monotonic checkpoint, SQL/Source sealed restore, archived backup suppression and complete member erasure remain HOLD.
5. Full-project TypeScript, production-shaped build, dependency/DOCX processing, astronomical method correctness and exact two-member browser/device acceptance remain distinct beta gates.

**Disposition: bounded R4K private birth ingress source/tests PASS; independent human Class A HOLD; PR #1820 integration HOLD; R20 signer/recovery HOLD; chart Send OFF; combined beta HOLD.**
