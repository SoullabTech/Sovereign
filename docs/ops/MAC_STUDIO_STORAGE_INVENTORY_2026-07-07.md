# Mac Studio (M4) — Storage Inventory & Architecture

**Date:** 2026-07-07 · **Volume:** `/System/Volumes/Data` — 460 GB, **96–97% full**
**Status:** working-tree doc, uncommitted. Not canon — an ops map.

---

## 1. What just happened (cleanup 2026-07-07)

| Action | Reclaimed | Notes |
|---|---|---|
| Docker build cache (`builder prune -af`) | 27.8 GB | **local `desktop-linux` context**, not minisforum — verified |
| Docker unused images (`image prune -af`) | 0.86 GB | rest protected — back the 17 running local containers |
| Xcode iOS DeviceSupport | 11 GB | iPhone17,2 26.5 + 26.6 symbol caches; rebuild on device connect |
| Dead simulators + updater caches (Google/zen/ShipIt) | ~4 GB | regenerable |
| puppeteer Chromium cache | 1.2 GB | auto-redownloads |
| HuggingFace cache | **KEPT** | 16 GB — see §3, it is voice infra, not disposable |

**Deletions succeeded (~44 GB), but `df` has not yet reflected them.**
Precise reason (not solely Time Machine): the freed blocks are held by **one or more of**:
1. Local Time Machine snapshot `com.apple.TimeMachine.2026-07-07-014416.local` pinning deleted files.
2. Docker's VM disk image not yet compacted (in-VM reclaim ≠ host reclaim).
3. APFS lazy block reclaim (resolves as the above clear).

**To surface the space (manual, needs password):**
```bash
sudo tmutil thinlocalsnapshots / 64000000000 4     # release snapshot-pinned files
# Docker Desktop → Settings → Resources → Advanced → "Clean / Purge data"  (compacts VM disk)
df -H /System/Volumes/Data
```
Docker's `.raw` was not locatable from userland (< 60 MB under `com.docker.docker/Data`) — it lives inside the VM bundle; use the GUI purge to compact it.

---

## 2. Storage classes (the real fix — architecture, not cleanup)

Three lifecycles, currently blurred:

```text
canonical/   assets      — intentional, mostly NOT re-downloadable, keep
caches/      disposable  — regenerated on demand, safe to purge anytime
runtime/     op state    — live service data, purge only when service is down
```

`~/AI Models/` already implements the canonical class (skeleton below) — the gap is that
canonical assets are also sitting in caches.

```text
~/AI Models/            registry.yaml + Speech(8.3G) + Vision(0) + LLM(0)   ← canonical home EXISTS
~/.cache/huggingface/   Moshi voices (16G) ← canonical asset living in a cache dir  (BLUR)
```

---

## 3. Model inventory

| Model | Location | Class | Re-downloadable | Keep | Note |
|---|---|---|---|---|---|
| PersonaPlex q8 (Speech) | `~/AI Models/Speech` (8.3 G) | canonical | No/slow | ✅ | already in canonical home |
| Moshi **moshiko** MLX q8 | `~/.cache/huggingface/hub` (8.0 G) | canonical-in-cache | Yes (slow) | ✅ | **should move to `AI Models/Speech`** |
| Moshi **moshika** MLX q8 | `~/.cache/huggingface/hub` (8.0 G) | canonical-in-cache | Yes (slow) | ✅ | **should move to `AI Models/Speech`** |
| faster-whisper-base | `~/.cache/huggingface/hub` (141 M) | cache | Yes | keep | fine where it is |
| nvidia/personaplex-7b-v1 | `~/.cache/huggingface/hub` (4 K) | pointer only | — | review | metadata stub, no weights |
| moshi-artifacts | `~/.cache/huggingface/hub` (2 M) | cache | Yes | keep | — |
| ollama models | `~/.ollama/models` (0 B) | runtime | Yes | — | empty — pulled on demand |

**Takeaway:** the 16 GB HF cache is **two Moshi MLX voices**, not junk. Deleting it would have
cost hours of re-download mid voice-work for 16 GB. Keeping it was correct. The only refinement
worth doing (later, non-urgent) is *relocating* those two into `AI Models/Speech` so canonical
assets stop hiding in a cache directory — then the cache truly becomes disposable.

---

## 4. Recommended next steps (in order, none urgent)

1. Run the two manual reclaim commands in §1 → expect ~40+ GB to appear in `df`.
2. **Do not** delete more. Utilization will still land ~80% — that's a capacity signal, not a cleanup gap.
3. When voice work settles: relocate the two Moshi MLX voices into `~/AI Models/Speech`, update
   `registry.yaml`, and repoint the HF loader (env `HF_HOME` / symlink) so nothing re-downloads.
4. Longer term: if canonical models keep growing past ~80 GB, they belong on a dedicated volume,
   not the boot data volume.
