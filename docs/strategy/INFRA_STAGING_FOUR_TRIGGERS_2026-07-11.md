# INFRASTRUCTURE STAGING — Spend Follows Triggers, Not Funding (2026-07-11)

**Status**: Cat 1 — DIRECTION CANDIDATE, held not authorized. Companion to `ROADMAP_FOUR_HORIZONS_2026-07-11.md`. No purchase, migration, or provider change is authorized by this document.
**Premise**: provider governance already made substrate decisions reversible (abstracted, provenance-labeled, substitutable). Therefore infrastructure is staged by what *forces* spend. **Funded ≠ should buy.**

## The four spend triggers (map every purchase to one; nothing else justifies spend)

1. **Member concurrency** — trivial now, trivial through beta.
2. **Freeze lifts** (episodic/semantic) — surprisingly cheap: pgvector on existing self-hosted Postgres handles semantic ranking for hundreds of members on owned hardware. H1's memory work is near-zero infra cost.
3. **Generation go** — the one genuinely expensive trigger, and it is *deliberately withheld* (census posture: static, hand-authored, founder-gated). Spend is deliberately deferred with it. Do not buy ahead of your own freezes.
4. **Provenance doctrine** — how much must be local. The real fork; see §Doctrine.

## Stage 0 — now, near-zero cost: buy reliability, not capacity

At current scale the sovereignty risk is not throughput — it is **data loss** in a solo-operated self-hosted stack holding members' most intimate material. Highest-leverage infrastructure work available:
- Encrypted **offsite** Postgres backups with **tested restores** (a backup that has never been restored is a hope, not a backup).
- Basic monitoring/alerting on the minisforum stack.
- A documented recovery runbook — which doubles as Nathan curriculum (support function must know what recovery looks like).

Cost: a weekend. Not gated on funding.

## Stage 1 — H1 opens: use the already-ratified split posture

- Deep-tier generation: cloud Claude as the honest, labeled interim (constitutional primary per CLAUDE.md provider rules).
- Everything memory-shaped (embeddings — already nomic-local, vector ranking, episodic layer): fully local on current hardware.
- Do not re-litigate the Ollama deep-tier path: open-weight models that fit current hardware do not reach portrait-grade deep-tier quality, and running them to claim "local" is provenance theater — prohibited by the platform's own claim discipline.

## Stage 2 — funded + generation live: rent before you rack

1. **Sovereign-leaning rental first** — dedicated bare-metal GPU (H100/RTX-6000-class, no-retention provider, contractually clean) for 2–3 months to measure *actual* deep-tier load. Converts the buy decision from speculation to sizing.
2. **Then the prosumer sovereign node** if numbers support it (M-series-Ultra-class or 1–2 GPU workstation for 70–120B open-weight CORE-tier, possibly deep). This class improves fast enough that **waiting is winning** — every deferred quarter buys better local capability per dollar.
3. **Skip rack/colo entirely** unless member count forces it — power/cooling/ops on a solo operator is where sovereign infrastructure becomes a second job.

System-side: stay on the boring stack (Postgres, Caddy, single node → warm standby + Postgres replication). Kubernetes-class orchestration is a team's tool; for one builder it is an availability *reducer*.

## Stage 3 — the inversion

The member-sovereign horizon (Cat 1) means endgame infrastructure is **trust infrastructure** — provenance attestation, key management, sync — not a datacenter. If intelligence travels to member hardware (Neuropod, home nodes), the scaling curve flattens permanently: members bring their own compute. The platform never enters the industry's capex race because its value was never in the model.

## §Doctrine — the fork that shapes Stage 2 (awaiting Kelly)

**Question**: must deep-tier eventually be fully local, or is honestly-labeled cloud frontier acceptable indefinitely (local reserved for memory/CORE)?

**The record's own answer (recommendation, not ruling)**: the constitution as ratified has never located sovereignty in compute locality. It locates it in **data locality** (self-hosted Postgres, no cloud DBs), **substitutability** (provider governance, local fallback, no lock-in), and **provenance honesty** (labels that travel). Claude-as-primary is itself constitutional text. Meanwhile the platform already practices a sharper rule than "deep-tier local" — the Sanctuary×TTS gate refuses *cloud voice* during Sanctuary sessions:

> **Locality follows intimacy, not tier.**

Under that rule: honestly-labeled cloud frontier is acceptable indefinitely for deep-tier generation; hard locality obligations attach to *intimacy classes* — Sanctuary sessions, raw audio, and whatever the member marks sacred — and migrate over time to the member edge (Stage 3), not the founder rack. Consequence if ratified: Stage 2 may never buy GPUs; funded dollars go to Stage 0 reliability, Stage 3 trust infrastructure, and the H1 front doors. The "locality serves experience" candidate already points here.

If Kelly instead rules deep-tier-must-localize: Stage 2's rental step becomes mandatory sizing for an eventual purchase, and the roadmap absorbs a standing hardware line item — but the reversibility premise means nothing done before that ruling is wasted either way.
