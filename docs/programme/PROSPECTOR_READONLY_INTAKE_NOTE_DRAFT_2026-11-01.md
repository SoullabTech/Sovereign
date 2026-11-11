# Prospector — read-only intake note (DRAFT, 2026-11-01)

**Status:** DISCOVERED. Report only. Authorizes no install, download, code, integration, protected-data access or deployment.
**Method:** fetched and read public pages only (arXiv abstract, GitHub README, Hugging Face model card/metadata). Nothing was cloned, downloaded or executed.
**Not read:** full paper body (the arXiv HTML 404'd; the PDF was not fetched), `data/analysis/inference_speed.json`, `launch/README.md`, `data/raw/README.md`, the `LICENSE` file itself, and the four graphs' sources.

## Verified (artifact opened)

| Claim | Evidence |
|---|---|
| Paper exists: arXiv 2610.37121, submitted 27 Oct 2026, Yang and Buehler | arXiv abstract page |
| Tools are `find` / `expand` / `connect`; answer is a cited edge chain checked against what the tools returned | README and abstract |
| Qwen3.5 base at 0.8B / 2B / 4B with LoRA adapters; code and weights Apache-2.0 | HF metadata and card; GitHub sidebar |
| Prospector-4B gated accuracy 0.839 ± 0.015 on the semiconductor graph (8 seeds) | HF card |
| Unseen graphs, 4B: bio-inspired 0.803, PFAS 0.766, matprop 0.809 (3 seeds each) | HF card |
| gpt-6-astra with the three tools 0.877; closed book 0.210; retrieved subgraph 0.477 | README "Reproducing the paper" |
| Mac path exists (`mlx:` driver, macOS 14+, Py 3.12); first run peaked at **18 GB** memory; **~27 GB disk** all-in | README quick start (the 18 GB sentence was cut mid-line in my fetch; confirm in the source) |

## Not confirmed (do not repeat as fact)

- **"87.7%"** is gpt-6-astra, not "the strongest larger model" in general. **"Opus 5.5 ≈ 84%"** (from the video) appears nowhere in what I read. The README names only the OpenAI runs and says Anthropic models use a separate prompt variant.
- **"$0.57 / 1,000 questions"** — the repo says cost is priced from `data/analysis/inference_speed.json`; I did not open it. The video says $57. Neither is verified.
- **"Runs on a MacBook M4 Pro"** — the README supports Apple silicon via `mlx:` but warns the paper's numbers came from the `vllm:` driver and "the two can answer a question differently." So Mac accuracy is not established by the paper's numbers.
- **"Zero hallucinated edges"** — the gate only checks that each cited edge was *returned by a tool*. It does not check that the graph edge is true to its source document. The paper's own gate definition says this.

## Findings relevant to Soullab

1. **Licence is clear for code, adapters, rows, runs and the semiconductor graph (Apache-2.0).** Open: the other three graphs are fetched "from their sources" (own licences), and the Qwen3.5-4B base licence was not read.
2. **Transfer is shown only between scientific graphs.** Nothing here tests psychological, symbolic or personal-memory content.
3. **A 4B model plus a graph is not the system.** Closed book 0.21 → three tools 0.877 for the frontier model: the traversal protocol carries most of the gain, so the cheaper test is whether the *tools* help our existing local models before any training.
4. **Setup touches things this project holds:** `quickstart.sh` pipes `curl … | sh` for `uv`, installs a CUDA compiler with `sudo` on Linux, and downloads ~9 GB of weights and data plus the base model. Treat as untrusted-source download: its own directory, not run from the MAIA checkout.
5. **Sovereignty fit:** offline after first fetch (`HF_HUB_OFFLINE=1`). `.env.example` asks for OpenAI/OpenRouter keys only for the API-baseline arms — not needed, and OpenAI is barred here.

## Boundaries (carried, not decided)

- Graph traversal finds *relations in a corpus*. It confers no recall authority over a member's Works, sessions or memory, and no meaning-authority over a person (Sovereignty Invariants; Constitutional Direction of Authority). Any future use stays on public, non-member sources until a founder act says otherwise.
- Repository text or constitutional canon must not be routed to a Lab-tier provider at dev time (2026-09-20 interim hold). Local-only execution does not conflict, but nothing here lifts the hold.

## Owed before any next step (founder act)

1. Authorize a download of the repo + ~9 GB artifacts into an isolated directory, on which machine, and whether `quickstart.sh`'s `sudo`/CUDA path is excluded (Mac `mlx:` only).
2. Name the public corpus for the pilot graph and who classifies "public, non-sensitive".
3. Name the acceptance question and a comparison baseline fixed in advance (plain retrieval vs tool traversal on an existing local model vs Prospector adapters), with independently checked answers.
4. Say which lane/owner record this lands in. Project ID was not resolved in this session; I did not assume the AI-NOS lane or read issues #1910/#1982.

## Standing

Intake complete at the level of public pages · full paper not read · cost and Opus figures unverified · nothing installed · nothing downloaded · no project code touched.
