# NCM (Next-Concept Modeling) — read-only assessment (DRAFT)

**Status:** DRAFT working note · 2026-11-01 · not canon, not a ruling
**Item state:** NCM = TRACKED RESEARCH (HELD). Not authorized for MAIA, Writer's Studio, any member-facing path, or production. The read-only assessment and the scratch smoke tests (§3a, §3b) are complete; nothing further is authorized. Home lane/owner issue for this note: **not yet chosen by the founder** (note is untracked and uncommitted; do not commit it to an unrelated branch).
**Claim discipline:** the 31×/21×/10× figures are the paper's, versus diffusion baselines on an H100. They must not appear in outward material as Soullab capability. NCM is Vision at most.
**Reopen triggers (any one):** (a) a larger NCM model, or text-quality results that reproduce on a task close to Soullab prose; (b) a fidelity test that scores named entities, numbers and status, not only ROUGE; (c) an independent replication of the paper's claims; (d) an MPS fix, if Mac Studio speed ever matters. Prospector is a separate track.
**Supersession:** §3a and §3b supersede the earlier statements that nothing was downloaded or executed.
**Lane:** AI-NOS / sovereign-model research (observation only)
**Authority:** none conferred. Nothing downloaded, installed, executed or integrated. No source in this repo changed.
**Evidence class:** public-page read (GitHub + Hugging Face), 2026-11-01. Code-read establishes what the code says, not what it does at runtime.

## 1. What was read
- `HazyResearch/ncm` README, LICENSE, `requirements.txt`, `evaluate.py`, `scripts/eval_shard.py`, `models/next_concept.py` (search of indexed text; `models/` directory listing)
- `hazyresearch/ncm-checkpoints` model card; `xsum/` and `sudoku/` tree listings
- Not read: `tokenization/`, `models/common.py`, `vqvae.py`, `quant.py`, `utils/`; paper PDF; the dataset repo

## 2. Findings
| Question | Finding | Class |
|---|---|---|
| License | MIT, copyright "hermann kumbong" 2025 | read |
| Repo maturity | 5 commits; evaluation harness, not an inference product | read |
| Checkpoints | tokenizer + generator `.pt` per task: xsum, wmt14, sudoku (easy/medium/hard), lm1b (S/M/L), tinystories, owt | read |
| Size | `xsum/generator.pt` ≈ 354 MB, `xsum/tokenizer.pt` ≈ 300 MB (LFS) | read |
| Dependencies | torch, omegaconf, hydra-core, transformers>=4.51, rouge_score, sacrebleu, huggingface_hub | read |
| Stated environment | Python ≥3.10, "CUDA-capable PyTorch recommended" | read |
| Apple Silicon: entry point | `evaluate.py` shards by `torch.cuda.device_count()` and sets `CUDA_VISIBLE_DEVICES`; exits "no GPU visible" with none | read |
| Apple Silicon: shard script | `eval_shard.py` hard-codes `.cuda()` on the tokenizer VQ-VAE, the generator, and several tensors; `map_location="cuda"` in `load_allowance` | read |
| Apple Silicon: model core | `next_concept.py` mostly takes `device` from input tensors; `flex_attention` is a config option (default False) and imported lazily | read |
| OWT checkpoint | the "pending" claim in the video is not borne out: README and HF listing both link `owt` tokenizer and generator files | read |

## 2a. Second read (2026-11-01, steps 1 and 2 of §6 below)
Additionally read: `xsum/config.yaml`, `models/common.py`, `models/vqvae.py`, `models/quant.py`, the arXiv abstract and HTML paper (appendices E, F.4, G, I via search; not read end to end).

| Question | Finding | Class |
|---|---|---|
| Attention path | `xsum` config sets `use_flex_attention: false`; the default path is `torch.nn.functional.scaled_dot_product_attention`. `flex_attention` import is wrapped in try/except | read |
| CUDA in model core | No literal `cuda` string found in `common.py`, `quant.py`, `vqvae.py` (search of indexed text). `torch.distributed` calls are guarded by `is_initialized()`. CUDA appears in `evaluate.py` / `eval_shard.py` only | read (absence from a search, not proof) |
| Scale | `xsum` generator: 12 layers, 768 wide, 9 levels × 4096 codes, level lengths 4→48, 512-token prefix, 48-token output; GPT-2 BPE pre-tokenizer | read |
| Paper scale | main generators ≈100M parameters; scaling study to 725M on LM1B only | paper |
| LM1B comparison | NCM 97M params, 13.36B training tokens, 12 sampling steps vs 128 for diffusion baselines | paper |
| Baselines | speed claims are versus diffusion language models; no autoregressive wall-clock comparison was read | paper (partial) |
| Tokenizer fidelity | OWT tokenizer reports 99.99% exact token reconstruction (≈0.01% wrong); failure-case analysis exists in Appendix G, **not read** | paper |
| Authors' limitations | fixed hierarchy depth/lengths; separately trained tokenizer; "occasional artifacts at coarse-level transitions"; larger scale untested | paper |

## 3. Reading
The CUDA coupling found is in the *harness* (`evaluate.py`, `eval_shard.py`). The model core appears device-agnostic in what was read, and the released XSum config avoids `flex_attention`. A CPU/MPS smoke test would therefore plausibly need only a harness patch, but this is a **code-read inference, not a runtime result**: `tokenization/`, `utils/`, `vae.py` and the full body of `next_concept.py` were not read, and dtype/op-support on MPS is untested. Any patch is **not authorized** here.

For anything Soullab-relevant, note scale (≈100M generators), short fixed-length outputs (XSum: 48 tokens), and 99.99% reconstruction being an average that does not speak to names, numbers or an author's exact wording.

## 3a. Smoke test (2026-11-01, founder "lets do it") — SUPERSEDES "nothing downloaded/executed" above
**Scope run:** `sudoku-easy` only. Everything in the session scratchpad (`.../scratchpad/ncm-smoke/`), nothing in this repo except this note. Upstream `HazyResearch/ncm` at `c70274273f489abc73832b2b98584a8483b6b203`; checkpoints (generator 102.6 MB, tokenizer 59.8 MB, config) and the two small pickles from the official HF repos; fresh venv (torch 2.15.0). ⚠️ The checkpoints are loaded with `torch.load(weights_only=False)` (pickle), i.e. they execute code from the upstream authors; run only in the isolated scratch venv, no secrets in the environment.
**Patch (scratch copy only):** `scripts/eval_shard.py` — `.cuda()` / `"cuda"` → a `DEV` variable from env `NCM_DEV`. `evaluate.py` not used (it requires CUDA); the shard and merge scripts were called directly.

| Device | Result |
|---|---|
| CPU (Apple M4 Max, 128 puzzles, batch 128) | **Ran.** solved 126/128 (98.44%), cell accuracy 99.86%, valid-grid 98.44%; ≈10 s wall-clock including model load |
| MPS | **Failed** at `F.interpolate` → `adaptive_avg_pool1d` in `models/quant.py:703`: "input sizes must be divisible by output sizes … not implemented on MPS". `PYTORCH_ENABLE_MPS_FALLBACK=1` did **not** help (error is a RuntimeError, not a missing-op fallback) |

**Reading:** the released checkpoint loads and generates correctly on Apple Silicon **CPU** with a 7-line harness patch, and the quality on this small task is in the expected range. MPS needs a model-code change (move that op to CPU or reimplement area-pooling) — not attempted. **No speed comparison is made:** one 128-puzzle batch on CPU says nothing about the paper's H100 numbers or about autoregressive baselines. Only `sudoku-easy` was run; XSum/WMT14/OWT, other difficulties, text quality and fidelity are untested. N=1 run, one seed, not repeated; sudoku accuracy is a structured-task check, not evidence about prose.

## 3b. XSum text smoke test (2026-11-01, founder "Run XSum test")
**Scope:** `xsum` checkpoints (generator 354 MB, tokenizer 300 MB) + test passages (18.5 MB) and reference summaries (1.5 MB), same scratch dir/commit as §3a. Scoring needs GPT-2 small (downloaded by `transformers` from the HF Hub) for generative perplexity. Second scratch patch: `scripts/eval_merge.py` `.cuda()` / `device="cuda"` → `DEV` (it also hard-codes CUDA). CPU only. 32 test passages, batch 16, one run.

| Measure (n=32, CPU) | Value |
|---|---|
| Generation wall-clock incl. model load | ≈24 s |
| ROUGE-1 / 2 / L | 34.61 / 12.98 / 27.89 |
| Generative perplexity (GPT-2 small) | 82.17 |
| Mean words per summary | 20.4 |

**Sample outputs (first 4 of 32, unselected; machine summary vs. BBC reference):**
1. HYP "…beds made available for homeless people… in Wales has **risen** in last year…" vs REF "chronic need for more housing for **prison leavers** in Wales" — wrong subject and an invented direction of change.
2. HYP "…a number of firearms ammunition and ammunition were seized in Edinburgh" vs REF "…appeared in court after firearms, ammunition and cash were seized" — fluent-ish, repetition, drops the court appearance.
3. HYP "…charged with, kidnapping, beating, beat and beat a white black man in Chicago" vs REF "…accused of kidnapping and torturing a mentally disabled man in a 'racially motivated' attack… denied bail" — garbled, **changes the victim's described characteristics and the legal status**.
4. HYP "West Bromwich Albion have confirmed director as Reading first-team coach…" vs REF "West Brom have appointed Nicky Hammond as technical director" — misses the named person, garbles the roles.

**Reading:** the pipeline is functional on Apple Silicon CPU and the scores are in the range one would expect for a ~100M-parameter summariser on XSum (ROUGE-L 27.9 at n=32; I have not checked this against the paper's reported figure). But the *content* is where the Soullab-relevant signal is: at this scale the outputs repeatedly distort who/what/status and drop named entities — i.e. exactly the "names, numbers, exact details" fidelity risk, and the mechanism that would breach "the system's reconstruction cannot silently replace the author's words". This is small-n qualitative evidence (4 of 32 read by one reader, a news-summarisation task, not Soullab prose); it does not show larger NCM models behave the same, nor that the paper's numbers are wrong. **Not a recommendation to use for Writer's Studio or MAIA; it supports keeping NCM at "tracked research" status.**

Not done: MPS (still blocked, §3a); no repeat/seed variation; no timing comparison to an autoregressive model; no full-test-set run (11,334 docs per config); the remaining 28 outputs unread.

## 4. Not established
- Any output quality, speed or fidelity on Soullab workloads.
- That the released checkpoints load or run on any device (nothing was downloaded).
- Reported 31×/21×/10× speedups: taken from the paste/video, not verified; they are versus diffusion baselines on an H100, not versus autoregressive or Ollama models.
- That NCM's learned codes carry human-readable meaning (not claimed by the sources read).
- Any fit for Writer's Studio. If ever considered, author text must never be silently replaced by a reconstruction; that remains a boundary, not a finding.

## 5. Held / not authorized
Downloading checkpoints or datasets · cloning or running the code · patching for MPS · any MAIA, Writer's Studio or production integration · any claim in outward material.

## 6. Possible next read-only steps (each needs a go-ahead)
1. ~~Read the remaining modules and one `config.yaml`~~ — partly done (§2a); still unread: `tokenization/`, `utils/`, `vae.py`, full `next_concept.py`.
2. ~~Read the paper's evaluation setup~~ — partly done (§2a); Appendix G failure cases and §4.6 efficiency setup not read in full.
3. Whether a bounded, isolated, off-repo smoke test is worth a ruling (disk ≈ 650 MB for xsum; `sudoku` sizes not yet listed).

## 6a. Appendix — scratch patches (upstream `c70274273f489abc73832b2b98584a8483b6b203`), kept so the tests are reproducible
`NCM_DEV` env var (default `cpu`) replaces hard-coded CUDA. Applied only to a throwaway clone; none of this touched this repo.

`scripts/eval_shard.py`: add `DEV=os.environ.get("NCM_DEV","cpu")` after `import torch`; then replace
- `tk.vqvae.cuda().eval()` → `tk.vqvae.to(DEV).eval()`
- `NextConceptTransformer(...).cuda()` → `.to(DEV)`
- `map_location="cuda"` (two places in `load_allowance`) → `map_location=DEV`
- `.view(B, L0).cuda()` → `.to(DEV)`; `device="cuda"` (two places) → `device=DEV`

`scripts/eval_merge.py` (xsum/rouge path shown; `genppl*` paths have the same `.cuda()` pattern): add `import os` and `DEV=...` at top; `AutoModelForCausalLM.from_pretrained("gpt2").cuda()` → `.to(DEV)`; `device="cuda"` → `device=DEV`; same for `rlm` and the two `.cuda()` calls on `input_ids` / `attention_mask`.

Commands used (from the clone root, venv with torch 2.15.0): `NCM_DEV=cpu python scripts/eval_shard.py --config config/eval/<task>.yaml --checkpoint-dir <ckpt> --data-dir <data> --n <N> --bs <B> --out <pkl>` then `NCM_DEV=cpu python scripts/eval_merge.py --config config/eval/<task>.yaml --glob <pkl>`. `evaluate.py` was not used (it requires CUDA).

## 7. Relation to Prospector
Separate question (evidence navigation vs generation). Per the pasted note, Prospector is the nearer-term candidate; that prioritisation is the author's recommendation, not a ruling.
