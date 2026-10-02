# Local Inference — AirLLM: Examined and Declined for the Turn Path

**Status**: Routed-out finding. **Not canon. Not a lane. No authorization.** Recorded so the option is examined once rather than resurfacing as a fresh idea.
**Date**: 2026-09-20
**Altitude**: one library evaluated against MAIA's declared latency tiers, plus the open question the evaluation exposed.
**Category** (six-category typology): Cat 1 — preserved direction. Held, not authorized.

---

## What this document is

A record of why **AirLLM** (layer-by-layer large-model inference) was examined for MAIA's sovereign-inference posture and declined for the member conversation path, together with the question the examination surfaced — which is a canon question, not a hardware one.

## What this document is NOT

- not authorization to change the inference stack
- not a claim about what runs in production today
- not an evaluation of llama.cpp, Ollama, or any quantization path (named below as alternatives, **not assessed here**)
- not a lane

---

## The mechanism (external evidence)

AirLLM exploits the fact that a transformer is a sequential stack: only one layer must be resident at a time. It loads a layer, computes, evicts it, loads the next. Peak VRAM therefore scales with the **largest single layer** — roughly 1.6–1.7 GB at FP16 for a 70B model — not with the model. Hence the headline "70B on a 4GB GPU."

The headline is true. It is also not the operative fact.

## The disqualifying number

The method reads the entire model off disk **for every generated token**. Disk I/O becomes the inference engine and the accelerator idles waiting on it.

| Configuration | Reported throughput |
|---|---|
| 70B in-memory, A100 | ~10–20 tok/s |
| 70B via AirLLM, 4GB GPU | **~0.5–2 tok/s** |

Evidence class: **secondary / published reports**, not measured by Soullab. No MAIA benchmark was run. The figures are consistent across independent write-ups (sources below) and the mechanism makes them structurally unsurprising, but they are **reported, not witnessed**.

## Against MAIA's declared constraints

MAIA's processing paths are declared as FAST `<2s`, CORE `2–6s`, DEEP `6–20s`.

A ~300-token MAIA turn at 1 tok/s is **approximately five minutes**.

This is not a tuning gap. It is a category mismatch of roughly two orders of magnitude against the *slowest* declared tier. No parameter, cache, or hardware change within the method's design closes it, because the cost is the per-token full-model disk read that *is* the method.

> AirLLM does not make a 70B model fast on small hardware. It makes a 70B model **possible** on small hardware. Those are different products, and MAIA needs the first one.

**Ruling recorded: DECLINED for the member conversation path.** Not declined on ideology, licensing, or provenance — declined on latency against a declared tier.

## Where it is not declined

Nothing on the member turn path. For latency-indifferent, non-interactive, offline work the tradeoff could be acceptable in principle. **No current MAIA lane requires it**, so no such use is proposed here. If one ever appears, this note is the prior art, not the objection.

---

## What the examination actually surfaced

The motivating question was *reduce dependence on the Anthropic API without leaving the LAN*. AirLLM answers a question adjacent to that one and not it. The leverage sits elsewhere:

1. **Quantization and model-size discipline** — a Q4/Q5-class model resident in RAM at interactive speed, rather than a larger model swapped from disk. **Not assessed in this note.**
2. **Hardware** — resident VRAM changes this decision more than any library does. minisforum's accelerator configuration is **NOT ESTABLISHED here**; no host read was performed under this note.
3. **Degraded-mode doctrine** — the part that is genuinely unspecified, and the reason this note exists.

### The open question (routed out, no lane opened)

`CLAUDE.md` declares the fallback posture: primary Claude via `ANTHROPIC_API_KEY`, fallback local Ollama (DeepSeek) when the API is unavailable. A repository scan on 2026-09-20 found **49 files under `lib/` and `app/` referencing Ollama**, so local-model substrate is present in source.

⚠️ **Whether local inference reaches the member turn path at runtime, and under what conditions, was NOT established by this note.** The scan is a repository fact. It is not a runtime fact, and it must not later be cited as one.

The question the scan does not answer:

> When MAIA runs on a local fallback model, she is a materially different mind — different mode discipline, different containment reliability, different refusal behaviour. **Does the member know which mind they are speaking with?**

The Deep-Intelligence Gate already ratified the governing shape for a different substitution: *voice may have a different capture path; it may not have a different mind.* A model fallback is the same class of substitution arriving through a different door — not a transport change, a **cognition** change. Under `MARKETING_CLAIM_DISCIPLINE`, a system that presents identically while thinking differently is telling today's story with yesterday's guarantee.

This note **names** that question. It does not answer it, and answering it is not authorized here. It belongs with the Deep-Intelligence Gate and the Sovereignty Invariants, not with an inference library.

---

## Standing

**AIRLLM ⛔ DECLINED FOR THE TURN PATH · ⛔ NO LANE OPENED · ⛔ NO INFERENCE STACK CHANGE AUTHORIZED · ⛔ QUANTIZATION PATH NOT ASSESSED · ⚠️ LOCAL-FALLBACK RUNTIME STANDING NOT ESTABLISHED · ⚠️ DEGRADED-MODE DISCLOSURE DOCTRINE OPEN · PRODUCTION UNTOUCHED.**

## Sources (external, secondary)

- HuggingFace — AirLLM announcement: https://huggingface.co/blog/lyogavin/airllm
- "Run 70B LLM on 4GB GPU: AirLLM's Real Tradeoff": https://umesh-malik.com/blog/run-70b-llm-on-4gb-gpu-airllm
- "AirLLM and '70B on a 4GB GPU' — What's Actually Going On?": https://rohit-shirke.medium.com/airllm-and-70b-on-a-4gb-gpu-whats-actually-going-on-3bf0e102252e
- "Running 70B LLMs on a 4GB GPU: AirLLM's Layer-Swapping": https://starlog.is/articles/llm-engineering/lyogavin-airllm/
