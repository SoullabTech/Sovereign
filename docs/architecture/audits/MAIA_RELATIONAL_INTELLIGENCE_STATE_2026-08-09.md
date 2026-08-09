# MAIA Relational Intelligence — State of the System, 2026-08-09

**Synthesis of the MAIA High-Target Tester Readiness Audit.** Companion documents: [Memory Topology](./MAIA_MEMORY_TOPOLOGY_2026-08-09.md) · [Continuity](./MAIA_CONTINUITY_AUDIT_2026-08-09.md) · [Corrigibility](./MAIA_CORRIGIBILITY_AUDIT_2026-08-09.md) · [Wisdom Field](./MAIA_WISDOM_FIELD_AUDIT_2026-08-09.md) · [Scorecard](./MAIA_TESTER_READINESS_SCORECARD_2026-08-09.md) · [Adversarial Evals](./MAIA_MEMORY_ADVERSARIAL_EVALS_2026-08-09.md). Evidence: five parallel code audits + production probes (minisforum, container `b1399f693`, deployed 2026-08-06). No production code was changed.

---

## The twelve questions, answered

**What can MAIA actually remember today?**
Verbatim cross-session exchanges (6, recency-ordered, production-verified surfacing 49×/24h), member-kept atoms (8, breakthrough-first, consent-gated), member-marked episodes (5), session summaries + patterns + journals via member web, relationship essence, and identity facts. All of it literal, provenance-carrying, member-authored or member-visible. This loop is real and live — the strongest thing in the system.

**What does she merely store but fail to use?**
Semantic vectors (written every eligible turn, read by never — pure embedding cost); spiral state (loaded into a struct that is never rendered; written only by the zero-traffic route — Bridge D is effectively dead on live traffic); session summaries' write-back loop unproven (218 queued jobs); Corpus Callosum emissions (write-only by design); developmental memories (injected only as compressed MemoryBundle bullets); the entire dormant `lib/consciousness/memory/` family (all 13 files still on disk, none of the May-plan renames happened).

**What does she retrieve incorrectly?**
Three authority-laundering paths: `developmental_memories` ranked `significance DESC` with no supersession — a stale MAIA inference never loses authority; CaseConsultationService re-feeding its own prior output with tag-only attribution; MemoryBundle compressing system inferences into unattributed bullets. Also `memoryHealth.semantic` counts atoms — historical "sem: ok" evidence measured the wrong substrate.

**What wisdom can she actually reach?**
On the live route: none. Zero wisdom content reaches any live prompt — only weights, domain labels, and element classifications (gates without content). The one wired retrieval pipeline points at the near-dead between/chat route *and* at a production table that is empty (`ain_knowledge_chunks` = 0 — the corpus was never embedded). Meanwhile the Library (55,760 chunks, 2,228 sources, pgvector + FTS) is real but answers only Library-room queries. MythicAtlas runs as a keyword stub in prod. Kelly's Obsidian vault paths don't exist in the container.

**What survives across sessions?**
Everything in the first answer, plus consent states and member gestures (archive/protect/decline are durable and read-enforced). What does *not* survive: corrections (in-turn only), commitments (no store), unfinished threads (no substrate), significant people (no substrate), any sense of elapsed time.

**What survives model routing/fallback?**
FAST/CORE→Ollama fallback: the identical assembled system prompt, by construction — with an unverified truncation risk (no `num_ctx` set). DEEP is the hole: its primary lane is a local consciousness wrapper with **no prompt seam** — recall addenda structurally cannot reach it, and its timeout fallback is a canned stub. The members invited into depth get the least continuity.

**What happens when the member corrects her?**
The correction shapes the current turn (correction-repair addendum) and then evaporates. It persists only as another conversation row competing by recency with the misunderstanding it corrected. The supersession-capable interpretive ledger (user-correction weight 0.95) exists, unwired, zero rows. This is the single most consequential defect for high-target testers.

**What happens when reality changes?**
Nothing marks the change. Old truth and new truth coexist as rows; recency decides which is quoted. No supersession, no temporal reasoning, no decay (decay/cooldown columns exist; the logic was never implemented).

**What currently makes her feel continuous?**
Verbatim recall of the member's own words with recency labels, member-kept atoms resurfacing, and name/identity persistence. Honest, literal, consent-gated — recognition through the member's own authored trail.

**What currently breaks the illusion of continuity?**
(1) A corrected misunderstanding returning verbatim. (2) A DEEP-routed turn responding as if no history exists. (3) Identical greeting posture after 2 days and 2 months. (4) Anything important the member didn't explicitly keep or mark, silently aging out of the 6-exchange/90-day windows. (5) Sanctuary aside, a member who says "delete my memory" and later discovers 9 untouched substrates.

**What architectural change would create the greatest improvement?**
A **supersession + authority layer on the live spine** — one mechanism resolving the largest cluster of defects (corrections, contradictions, temporal change, interpretation-as-fact). Concretely: wire the existing interpretive ledger into the live route; give conversational recall supersession awareness; render authorship framing wherever system inference reaches the prompt. The member's proposed layered context model (present encounter → relational → continuity → episodic → member-authored → interpretive → wisdom → constitutional) is roughly what the code already gestures at — the addenda system *is* a context composer — but it lacks exactly two of those layers: a continuity field (commitments/unfinished threads) and an authority-disciplined interpretive field.

**What must be repaired before inviting high-target testers?**
See the gate below.

## Authority & isolation (Section 4/10 findings)

The atoms lane **passes the core test**: practitioner observations persist as "the practitioner observed X" (`source_type` + `epistemological_status` + provenance jsonb, surviving into rendered prompt blocks; unattributed practitioner atoms are loader-ineligible; members can decline with read-time exclusion). Isolation is structurally strong: session-verified identity everywhere on the live spine, spoofed IDs refused and logged, `requireSelfScopedMember` uniform, every caseload handler pinned by structural tests, team-scoping fails loudly rather than leaking.

Three authority findings that need decisions:
1. **With Me** writes practitioner observations into member memory on *practitioner* approval; the member's consent is post-hoc opt-out. Sanctioned and attributed — but the approval act sits with the wrong party for this constitution.
2. **No supersession = permanent authority.** Persistence itself confers authority on MAIA inferences (F1, confirmed).
3. The constitutional hierarchy (member-declared > practitioner-observed > MAIA-inferred) exists in schema and canon, **not in the prompt** — no cross-layer arbitration protects member declarations under context pressure (F3).

## Readiness verdict

**Not ready for high-target testers on the relationship standard the founder set** ("encounter 15 could only have happened because encounters 1–14 happened"). Ready on: isolation, consent, honesty-of-what-is-recalled. Not ready on: corrections sticking, interpretation staying non-authoritative, wisdom reachability, return experience, DEEP continuity.

### Repair gate (ordered; do before invites)

1. **Correction persistence** — wire the interpretive ledger into the live route; supersession awareness in conversational recall. *(Closes E2/E3/E1 — the failure a discerning tester will hit first.)*
2. **Authority framing at the prompt boundary** — authorship rendered for every system-inferred block (MemoryBundle bullets, developmental content, consultation re-feeds); prompt-level arbitration honoring member declarations.
3. **DEEP continuity** — either give DEEP-primary a prompt seam or route DEEP through the addenda-carrying consultation lane by default; kill the stub-timeout response.
4. **Wisdom minimum** — run `embed-ain-knowledge.ts` against prod; wire `RetrievalService` behind the already-live knowledge gate on the sovereign route. The E9 restraint eval must exist before this ships.
5. **Return posture** — pass absence duration server-side and let the prompt hold it (recognition, not recitation); trivial data, currently unplumbed.
6. **Truth-in-labeling quick fixes** — `memoryHealth.semantic` mislabel; stale delete-my-memory header comment; either read or stop writing `semantic_memory_vectors`; decide Bridge D (wire to live route or retire).
7. **Then** build the golden-member harness (per the Evals doc) and freeze it as the standing regression gate beside the Co-Lab 31/31 gate.

Items 1–3 are the readiness bar. Items 4–5 are the "more than a chatbot" bar. Item 7 is what keeps it true.

*Discipline note: nothing in this synthesis authorizes implementation. Every repair above passes through the normal gates (sovereignty invariant check, growth-obligation check, and for #4 the wisdom-relevance eval).* 
