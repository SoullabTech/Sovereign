# Open-source code, models and datasets for sound, consciousness, sleep, focus and entrainment (GitHub + Hugging Face survey, as of 2026-11-09)

Method note: GitHub metadata (stars, SPDX license, last push date, archived flag) was pulled live from the GitHub REST API on 2026-11-09 via an authenticated `gh` session; Hugging Face license tags, downloads and last-modified dates were pulled live from the Hugging Face Hub API the same day. "lic=null/NOASSERTION" means GitHub could not detect a standard license file, which is NOT the same as permissive; such repos are all-rights-reserved by default unless a license is found elsewhere. Star counts and dates are point-in-time readings. Nothing below requires OpenAI or a cloud AI API unless flagged.

## Entrainment / tone generators (SBaGen lineage, Gnaural, binaural/isochronic, Web Audio)

### Takeaway
The SBaGen lineage is alive but fragmented and entirely copyleft (GPL-2.0/GPL-3.0); the most current maintained descendants are SBaGenX (GPL-2.0, pushed May 2026) and SynapSeq (GPL-3.0 with a separately sold commercial license, pushed Oct 2026). For a self-hosted product the simplest rights-clean path is generating beats directly with permissively licensed Web Audio tooling (Tone.js, MIT) rather than embedding GPL engines; the tone math itself is trivial and not copyrightable, so the GPL constraint attaches to code, not to rendered audio.

### Cited Findings
- **SBaGenX** (`lm7137/SBaGenX`) — "Modern fork of SBaGen+ for generating binaural, isochronic and monaural beats, audio mixin[g]"; ★12, GPL-2.0, last push 2026-05-12, not archived. README credits "original SBaGen by Jim Peters - SBaGen+ fork by Ruan Klein - current continuation and expansion in SBaGenX" and adds beat-graph / isochronic-envelope previews — [GitHub API / README](https://github.com/lm7137/SBaGenX)
- **SBaGen+** (`ruanklein/sbagen-plus`) — "Sequenced Brainwave Generator - a fork of the SBaGen"; ★11, GPL-2.0, last push 2025-06-19, **ARCHIVED** (superseded by SBaGenX/SynapSeq) — [GitHub](https://github.com/ruanklein/sbagen-plus)
- **SynapSeq** (`synapseq-foundation/synapseq`) — "Text-Driven Audio Sequencer for Brainwave Entrainment"; DSL combining "tones, binaural, monaural, and isochronic rhythms, noise, music, ambiance, effects, and transitions on a precise timeline"; CLI plus Go API; "distributed under the GPL v3 or later license. For commercial projects, see COMMERCIAL LICENSE"; ★28, last push 2026-10-18 — [GitHub README](https://github.com/synapseq-foundation/synapseq)
- `jave/sbagen-alsa` (GPL-2.0, last push 2012 — abandoned); `brainbang/sbagen_idoser` ("SBaGen data files decrypted from I-Doser", no license detected — **rights risk: derived from decrypted commercial content, avoid**) — [GitHub search](https://github.com/brainbang/sbagen_idoser)
- **Gnaural**: no canonical maintained GitHub repo found. `quan-na/gnaural-unofficial` is an unofficial clone (no license detected, last push 2016-12-30); `Gnaural-Web/Gnaural-Web.github.io` is a "Re-imagining of the classing Gnaural application for the modern era" (GPL-3.0, ★5, last push 2025-11-11) — [GitHub](https://github.com/Gnaural-Web/Gnaural-Web.github.io)
- **NeuralBeat** (`AegeanWorks/NeuralBeat`) — "local-first neuro-acoustic desktop app" for binaural/isochronic generation, ★37, pushed 2026-11-05; license is the custom **Aegean License 1.1 (personal use)**; "Commercial use requires the Aegean Commercial License" — **not open source for commercial use** — [LICENSE](https://github.com/AegeanWorks/NeuralBeat)
- **Binaural-Beats (Android)** (`GiorgioRegni/Binaural-Beats`) — "Brainwaves entrainment, auto hypnosis & lucid dreaming with an Android phone"; ★236, GPL-3.0, last push 2025-08-10 — [GitHub](https://github.com/GiorgioRegni/Binaural-Beats)
- **SINE** (`adolfintel/sine`, `sine-android`, `sine-html5`) — "Free and Open Source Brainwave Entrainment Application"; all three **ARCHIVED**, no license detected by GitHub — [GitHub](https://github.com/adolfintel/sine)
- `jlar0che/BrainWave` — binaural generator, GPL-3.0, ★35, pushed 2026-02-12; `ksylvan/binaural-generator` — Python, **MIT**, ★26, pushed 2025-04-17; `Ishanoshada/Binaural` — Python package for binaural and other entrainment audio, **MIT**, ★12, pushed 2025-01-22; `bytesuji/pynaural` — BSD-2-Clause, last push 2017 (abandoned) — [GitHub search results](https://github.com/ksylvan/binaural-generator)
- JS/Web Audio binaural libraries are mostly stale and unlicensed: `ichabodcole/BinauralBeatJS` (no license, last push 2018), `waynehoover/HTML5-Binaural-Beat-Generator` (no license, 2012), `elder-plinius/binaural-beats-generator` Chrome extension (no license, 2023) — [GitHub](https://github.com/ichabodcole/BinauralBeatJS)
- `ElliotMebane/IsochronicToneGenerator` — Audacity plugin for isochronic modulation, no license, last push 2019 — [GitHub](https://github.com/ElliotMebane/IsochronicToneGenerator)
- **Tone.js** — "A Web Audio framework for making interactive music in the browser"; ★14,893, **MIT**, last push 2026-11-01, actively maintained — [GitHub](https://github.com/Tonejs/Tone.js)
- `kai9987kai/AUX-Generator` — single-file Web Audio experiment for Shepard tones, beats, coloured noise; MIT, ★1 (toy) — [GitHub](https://github.com/kai9987kai/AUX-Generator)

### Inferences
- For a privacy-first, self-hosted product: Tone.js (MIT) or raw Web Audio API is the cleanest base for binaural/isochronic/monaural/noise generation, client-side, with no server audio processing needed. SBaGenX/SynapSeq are excellent reference designs (sequence formats, envelope semantics) but are GPL; using them as a server-side renderer whose output files are delivered is arguably "use" not "distribution" of the program, but embedding/shipping them in a client app triggers GPL obligations. SynapSeq's dual-license offer is the one commercial route in this lineage.
- Rendered tones from any of these tools are mathematically generated signals; the output-rights problem is minimal unless bundled sample/ambience files are mixed in (those carry their own licenses).

### Gaps
- Original SBaGen (Jim Peters, sbagen.sourceforge.net) and original Gnaural (SourceForge) were not verified directly; their SourceForge last-release dates and exact license files were not fetched.
- "Brainwave Generator" (Windows) appears to be closed-source freeware; no source repo found, license not verified.
- No widely used, permissively licensed, maintained npm library dedicated to binaural/isochronic beats was found; most are hobby repos.

## Generative ambient/music models and procedural engines (commercial-use licensing)

### Takeaway
Licensing splits sharply: **commercially usable open weights** = ACE-Step v1/v1.5 (Apache-2.0/MIT, trained on claimed licensed/royalty-free data), HeartMuLa-oss-3B (Apache-2.0), YuE v1 (Apache-2.0), Magenta RealTime / RealTime 2 (CC-BY-4.0 weights + Apache code + usage terms), MOSS-SoundEffect v2 (Apache-2.0), DiffRhythm code (Apache-2.0); **conditional** = Stable Audio Open / Stable Audio 3 (Stability Community License, free commercial use only under US$1M annual revenue), MiniMax-Music3 (custom community license with branding + safeguard obligations), Riffusion (CreativeML OpenRAIL-M); **non-commercial only** = MusicGen/AudioGen (CC-BY-NC-4.0), AudioLDM/AudioLDM2/MusicLDM (CC-BY-NC-SA-4.0), YuE2-3B (CC-BY-NC-4.0), TangoFlux and Tango2 (non-commercial), AudioX (CC-BY-NC-4.0), MMAudio (CC-BY-NC-4.0). Weight license and training-data provenance are separate questions; only Stable Audio Open publishes a fully CC-licensed, copyright-screened training set.

### Cited Findings
**Code libraries**
- **Meta audiocraft** (MusicGen/AudioGen code) — ★23,835, code **MIT**, last push 2026-03-03 — [GitHub](https://github.com/facebookresearch/audiocraft)
- **Stability stable-audio-tools** — ★3,904, **MIT**, last push 2026-11-01; `Stability-AI/stable-audio-3` repo ★855, MIT, pushed 2026-11-02 — [GitHub](https://github.com/Stability-AI/stable-audio-tools)
- **Amphion** (audio/music/speech generation toolkit) — ★10,334, MIT, pushed 2026-03-25 — [GitHub](https://github.com/open-mmlab/Amphion)
- **Magenta (classic)** — ★19,785, Apache-2.0, **ARCHIVED** (last push 2026-01-06); **magenta-realtime** ("Magenta RealTime 2: An Open-Weights Live Music Model") — ★1,864, Apache-2.0, pushed 2026-10-02; supports MLX local generation (`mrt mlx generate`) — [GitHub](https://github.com/magenta/magenta-realtime)
- Microsoft **muzic** — MIT, **ARCHIVED**; `lucidrains/musiclm-pytorch` — MIT, no official weights, last push 2023 — [GitHub](https://github.com/microsoft/muzic)

**Model weights (Hugging Face license tags, read 2026-11-09)**
- `facebook/musicgen-small/medium/large/melody`, `facebook/audiogen-medium` — **CC-BY-NC-4.0 (non-commercial)**; musicgen-small ~138k downloads — [HF](https://huggingface.co/facebook/musicgen-small)
- `stabilityai/stable-audio-open-1.0` (1,933 likes) and `stable-audio-open-small` — license "other: stable-audio-community", gated — [HF](https://huggingface.co/stabilityai/stable-audio-open-1.0)
- `stabilityai/stable-audio-3-medium` (583 likes, ~104k downloads), `stable-audio-3-small-music`, `stable-audio-3-small-sfx` — same Stability community license, gated, modified 2026-10-06 — [HF API](https://huggingface.co/stabilityai/stable-audio-3-medium)
- Stability AI Community License: "allow research, non-commercial, and limited commercial uses of the Models free of charge"; "preserves free access … for people or organizations generating annual revenue of less than US $1,000,000"; license is "revocable" — [Stability AI](https://stability.ai/community-license-agreement)
- Stable Audio Open training data: 486,492 recordings (7,300 h) — 472,618 from Freesound and 13,874 from FMA — "all licensed under CC-0, CC-BY, or CC-Sampling+"; music was screened via a content-detection company and flagged copyrighted music removed — [arXiv 2407.14358](https://arxiv.org/html/2407.14358v2)
- `cvssp/audioldm-s-full-v2`, `cvssp/audioldm2`, `cvssp/audioldm2-music`, `ucsd-reach/musicldm` — **CC-BY-NC-SA-4.0** — [HF](https://huggingface.co/cvssp/audioldm2). AudioLDM GitHub ★2,920 (NOASSERTION, pushed 2025-06), AudioLDM2 ★2,645 (pushed 2024-09, effectively dormant); `haoheliu/AudioLDM-training-finetuning` code MIT — [GitHub](https://github.com/haoheliu/AudioLDM2)
- `riffusion/riffusion-model-v1` — **CreativeML OpenRAIL-M** (use-based restrictions, commercial permitted); `riffusion/riffusion-hobby` code MIT, last push 2024-07 (dormant; company pivoted to hosted product) — [HF](https://huggingface.co/riffusion/riffusion-model-v1)
- **YuE**: GitHub `multimodal-art-projection/YuE` ★13,282, Apache-2.0, pushed 2026-11-01, now titled "YuE2: frontier music generation…". Original `m-a-p/YuE-s1-7B-anneal-en-cot` weights = **Apache-2.0**, but new `m-a-p/YuE2-3B` (1,246 likes, ~23k downloads) = **"Weights: CC BY-NC 4.0"** — **license regressed to non-commercial in v2** — [HF YuE2-3B](https://huggingface.co/m-a-p/YuE2-3B)
- **ACE-Step**: `ACE-Step/ACE-Step-v1-3.5B` Apache-2.0; `ACE-Step/Ace-Step1.5` **MIT** (~96.6k downloads), `acestep-v15-xl-turbo` MIT; GitHub `ace-step/ACE-Step-1.5` ★14,567, MIT, pushed 2026-11-08. Model card: "You can strictly use the generated music for commercial purposes"; training data described as "Professionally licensed music tracks" and "public domain and royalty-free music" (vendor claim, not independently audited) — [HF](https://huggingface.co/ACE-Step/Ace-Step1.5)
- **HeartMuLa** `HeartMuLa/HeartMuLa-oss-3B` — Apache-2.0; GitHub `HeartMuLa/heartlib` ★3,789, Apache-2.0, pushed 2026-10-08 — [HF](https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B)
- **Magenta RealTime 2** `google/magenta-realtime-2` — tag CC-BY-4.0; card: "codebase is licensed under Apache 2.0 … and Creative Commons Attribution 4.0 International. In addition, we specify the following usage terms" (prohibiting infringing uses) — [HF](https://huggingface.co/google/magenta-realtime-2)
- **MiniMax-Music3** (1,510 likes, released 2026-08, many GGUF/MLX community quantizations) — "MiniMax-Music3 COMMUNITY LICENSE": broad grant but requires prominently displaying "MiniMax-Music3" in commercial product UIs, an authorization request path in some cases, and that any service letting third parties generate outputs must "implement, maintain, test, and periodically review reasonable" safeguards; fine-tuned from Qwen3-8B (Apache-2.0) — [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-Music3/raw/main/LICENSE)
- **TangoFlux**: "checkpoints are for non-commercial research use only" and subject to Stable Audio Open's and WavCaps' licenses; GitHub ★885, pushed 2026-01-28; `declare-lab/tango2` CC-BY-NC-SA-4.0 — [HF](https://huggingface.co/declare-lab/TangoFlux)
- **DiffRhythm** GitHub Apache-2.0 (★2,358, pushed 2025-11-27); `ASLP-lab/DiffRhythm-full` tagged Apache-2.0 but also "stable-audio-community" (inherits Stable Audio VAE terms — **mixed, verify**) — [HF](https://huggingface.co/ASLP-lab/DiffRhythm-full)
- Sound-effects/ambience-capable: `OpenMOSS-Team/MOSS-SoundEffect-v2.0` Apache-2.0 (2026-05); `FunAudioLLM/PrismAudio` MIT; `HKUSTAudio/AudioX` CC-BY-NC-4.0; `hkchengrex/MMAudio` weights CC-BY-NC-4.0 (code MIT); `tencent/HunyuanVideo-Foley` Tencent Hunyuan community license — [HF API](https://huggingface.co/OpenMOSS-Team/MOSS-SoundEffect-v2.0)
- **Watermarking**: `facebookresearch/audioseal` — MIT, ★804, pushed 2026-11-03 (localized watermarking for AI-generated audio; useful for provenance marking of generated output) — [GitHub](https://github.com/facebookresearch/audioseal)

**Procedural/generative engines (non-ML)**
- **Generative.fm** (`generativefm/generative.fm`) — ★1,585, MIT, **ARCHIVED** (last push 2021-02-13); `generativefm/generators` (the piece algorithms) MIT, ★565, last push 2021-11 (dormant) — [GitHub](https://github.com/generativefm/generative.fm). Note: pieces depend on a separate sample library whose license was not verified.
- `charlesvestal/fm1-amb` — "generative ambient machine … inspired by Music for Airports", MPL-2.0, ★122, pushed 2026-11-08 (hardware-specific) — [GitHub](https://github.com/charlesvestal/fm1-amb)
- `Banana889/Driftone` — endless generative ambient music and white noise for focus/calm, MIT, ★24, pushed 2026-06-15; `petrbrzek/focusmusic` — "Brain.fm-style ambient electronic music", ★41, **no license detected** — [GitHub](https://github.com/Banana889/Driftone)
- No open-source "Endel clone" of note was found (search for "endel" returned unrelated repos) — [GitHub search](https://github.com/search?q=endel)

### Inferences
- Shortlist for a commercial, local, rights-clearable product: **ACE-Step 1.5 (MIT)** and **HeartMuLa-oss-3B (Apache-2.0)** for music; **Magenta RealTime 2 (CC-BY-4.0, attribution required)** for live/streaming ambient that can be steered in real time and runs on Apple Silicon via MLX; **MOSS-SoundEffect v2 (Apache-2.0)** for textures/SFX; **Stable Audio Open / SA3** only while revenue < US$1M and with awareness the license is revocable — but SAO has the best-documented training-data provenance (CC0/CC-BY/CC-Sampling+). YuE users must pin v1 weights (Apache-2.0) and avoid YuE2 (NC).
- Permissive weight licenses do not prove training-data clearance; ACE-Step's "licensed data" claim is self-reported. For maximum rights defensibility, procedural/DSP generation (Tone.js) plus CC0 field recordings is the lowest-risk path; ML generation is a secondary layer.
- Riffusion and AudioLDM lines are effectively dormant in 2025–2026.

### Gaps
- Tencent SongGeneration/LeVo and FunAudioLLM InspireMusic HF pages returned 401 (gated/renamed); licenses not verified.
- Full text of MiniMax-Music3 license (exact authorization triggers) and Magenta RT 2 additional usage terms not read in full.
- Stable Audio 3 training-data provenance not verified (only SAO 1.0's was).
- Generative.fm sample-library license not checked.

## EEG and sleep datasets and sleep-staging models

### Takeaway
Sleep-EDF Expanded (ODC-By 1.0), the Dreem Open Datasets, and the Monash DREAM dream-EEG database (CC-BY-4.0) are the most openly usable; NSRR/SHHS is accessible for commercial training under a Data Use Agreement but data cannot be incorporated into a product. For models, **YASA (BSD-3-Clause, actively maintained)** is the clean local choice; **U-Sleep's free web service is "scientific & non-commercial use only"** (code MIT, but the hosted service is not usable for a product and is cloud-hosted).

### Cited Findings
- **Sleep-EDF Expanded** (PhysioNet): released under the Open Data Commons Attribution License v1.0; also mirrored on AWS Open Data — [PhysioNet](https://physionet.org/content/sleep-edfx/1.0.0/); [AWS Registry](https://registry.opendata.aws/sleep-edfx/). HF mirrors exist (e.g., `maia-grupo25/sleep-edfx-data`, `WymanYYY/Sleep-EDF-V2`) — [HF datasets API](https://huggingface.co/datasets?search=sleep)
- **NSRR / SHHS**: access via Data Access and Use Agreement; NSRR staff stated on the forum that the restriction covers putting the actual data into a product, not training models on it (forum exchange, not a legal opinion) — [sleepdata.org forum](https://sleepdata.org/forum/scope-of-commercial-use-shhs)
- **MASS** (Montreal Archive of Sleep Studies): "open-access and collaborative database of laboratory-based polysomnography (PSG) recordings"; cohort 1 hosted on Borealis Dataverse — [CEAMS](https://ceams-carsm.ca/en/mass/)
- **Dreem Open Datasets (DOD-H, DOD-O)**: multi-scored datasets; downloadable on Zenodo / AWS; benchmark code `Dreem-Organization/dreem-learning-open` MIT, ★102, pushed 2026-08-10; `dosed` (spindle/event detector) MIT — [GitHub](https://github.com/Dreem-Organization/dreem-learning-open)
- **DREAM database** (Monash): standardized sleep EEG + dream reports; initial release 20 datasets, 505 participants, 2,643 awakenings; CC-BY-4.0 per ARDC listing; published in Nature Communications 2025; no separate lucid-dream subset identified — [Monash Bridges](https://bridges.monash.edu/articles/dataset/The_DREAM_database/22133105/3); [Nat Commun via IDEAS](https://ideas.repec.org/a/nat/natcom/v16y2025i1d10.1038_s41467-025-61945-1.html)
- OpenNeuro ds005178 (Ear-EEG Sleep Monitoring 2023, 10 subjects, 140 recordings, CC0) — sleep monitoring, not stimulation — [HF mirror README](https://huggingface.co/datasets/EEGDash/ds005178/blob/main/README.md). `braindecode/isruc-sleep` mirrored on HF — [HF](https://huggingface.co/datasets/braindecode/isruc-sleep)
- **YASA** — automatic sleep staging of PSG, spindle/slow-wave detection, wearable-vs-PSG evaluation; **BSD-3-Clause**, ★595, pushed 2026-10-25; eLife 2021 — [GitHub](https://github.com/raphaelvallat/yasa)
- **U-Time / U-Sleep** code — MIT, ★320, pushed 2026-06-24; the U-Sleep webservice is "free-of-charge" from University of Copenhagen but "for scientific & non-commercial use only" — [GitHub](https://github.com/perslev/U-Time); [sleep.ai.ku.dk](https://sleep.ai.ku.dk/)
- Other staging code: `akaraspt/deepsleepnet` Apache-2.0 (pushed 2024-07), `tinysleepnet` Apache-2.0 (2023), `emadeldeen24/AttnSleep` MIT (2023) — dormant research code — [GitHub](https://github.com/akaraspt/tinysleepnet)
- Infrastructure: **MNE-Python** BSD-3-Clause, ★3,585, pushed 2026-11-09; **braindecode** BSD-3-Clause, ★1,341, pushed 2026-11-09; **MOABB** BSD-3-Clause; **sleepecg** (ECG-based staging) BSD-3-Clause, pushed 2026-11-02 — [GitHub](https://github.com/braindecode/braindecode)

### Inferences
- A local, privacy-first pipeline could be MNE + YASA (BSD) for staging, trained/validated against Sleep-EDF (ODC-By) and Dreem DOD; SHHS is usable for training under DUA but must never ship inside the product.
- sleepecg is notable for products without EEG hardware (ECG/HRV wearables).

### Gaps
- DREAMS database (Université de Mons, spindle/K-complex annotations on Zenodo) license could not be verified (Zenodo returned 403).
- No openly licensed lucid-dream-specific EEG dataset was confirmed; lucid signal-verified data appears scattered across individual papers/OSF.
- No OpenNeuro dataset specifically for closed-loop auditory stimulation was confirmed; related data sits on Zenodo/Surrey GitLab per a search summary.
- PhysioNet page returned 502 at fetch time; ODC-By status rests on search snippet of the PhysioNet/AWS pages.

## Closed-loop auditory stimulation (CLAS) toolkits

### Takeaway
Open CLAS tooling exists but is research-grade and small-community. Portiloop (hardware+software, active 2026, but **no license file detected**), CoSleep for OpenBCI (license NOASSERTION, last push 2023), and a handful of 2025–2026 Muse/LSL prototypes are the options; none is product-ready, and several lack clear licenses.

### Cited Findings
- **Portiloop** — "deep learning-based, portable and low-cost closed-loop stimulation system able to target specific brain oscillations" (PLoS ONE 2022) — [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9394839/). Repos: `portiloop-software` (★6, pushed 2026-11-05), `portiloop-hardware` (★7, pushed 2026-03-18), `portiloop-training` (spindle detector, ★9) — **no license detected on any** — [GitHub](https://github.com/Portiloop/portiloop-software). Software targets Portiloop V2.3 on a Google Coral Dev Board Mini with sound output — [README](https://github.com/Portiloop/portiloop-software)
- **CoSleep** (`Frederik-D-Weber/cosleep`) — "Closed- and Open-loop (Slow Oscillations) sleep stimulation (auditory) or recording in full-PSG using OpenBCI"; "Build your own sleep lab for under a $1000"; targeted & untargeted auditory stimuli; ★40, license NOASSERTION, last push 2023-07-06 — [GitHub](https://github.com/Frederik-D-Weber/cosleep)
- `wolfgang-ganglberger/muse-closedloop-stim` — CLAS with Muse EEG via OSC→LSL (Python), no license, pushed 2026-01-14; `lbeland/CLAS` — "closed-loop auditory stimulation framework", GPL-3.0, ★1, pushed 2026-10-30; `StanSStanman/closedloop` — online slow-oscillation detection and timed stimulation, Unlicense — [GitHub](https://github.com/wolfgang-ganglberger/muse-closedloop-stim)
- **OpenBCI_GUI** — MIT, ★982, pushed 2026-04-10 — [GitHub](https://github.com/OpenBCI/OpenBCI_GUI)
- **neuromore Studio** — no-code neurofeedback/biofeedback builder; ★153, pushed 2026-11-06; custom "neuromore public license" with class exception (not OSI-standard) — [README](https://github.com/neuromore/studio)
- **EEGEdu** — browser EEG tutorials with WebBluetooth + Muse, MIT, pushed 2026-11-05 — [GitHub](https://github.com/kylemath/EEGEdu)
- **Targeted Memory Reactivation at home**: `nathanww/home-tmr` — smartphone + Fitbit TMR, MIT, ★24, last push 2022-12 — [GitHub](https://github.com/nathanww/home-tmr)
- **ZMax (Hypnodyne)**: not open-source, but "allows for the scripting of several functions in JavaScript for custom stimuli"; Dreamento is an open-source Python toolbox for dream engineering with ZMax (arXiv 2207.03977) — [Frontiers 2019](https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2019.00428/full); [arXiv](https://arxiv.org/abs/2207.03977v2)

### Inferences
- A product-grade CLAS feature would need its own implementation; existing code is useful as reference algorithms (slow-oscillation up-phase detection, spindle detection) but licenses are missing or copyleft. CLAS also carries medical-device regulatory exposure (outside this note's scope).

### Gaps
- Dreem headband consumer data / SDK: Dreem's open datasets are available, but no current open device SDK was found.
- Dreamento repo license/stars not fetched.
- Portiloop license status should be confirmed directly with authors.

## Lucid dreaming open projects

### Takeaway
Open lucid-dreaming tooling is thin and mostly hobby-scale: LucidCode (ZMax/camera REM-cue integrations), Dormio (MIT Media Lab, open build files but no canonical maintained repo found), and older Arduino EEG projects. No NovaDreamer replica with a clear license was identified.

### Cited Findings
- **Dormio** (MIT Media Lab, Haar Horowitz & Maes) — open-source glove tracking muscle tone, heart rate and skin conductance to detect hypnagogia and play an audio cue; build instructions and biosignal software published on GitHub — [MIT News](https://news.mit.edu/2023/sleep-sweet-spot-dreams-creativity-0515); [Hackster](https://blog.hackster.io/mits-dormio-is-designed-to-expand-your-creative-thinking-by-balancing-you-on-the-cusp-of-98e8f34573d7). Discoverable repos are third-party/fragmentary: `ThingEngineer/Dormio-Device-Duo-Wearable` (no license, last push 2022), `christinatchen/dormio` (no license, 2023) — [GitHub search](https://github.com/ThingEngineer/Dormio-Device-Duo-Wearable)
- **LucidCode**: GitHub org including `LucidScribe-Hypnodyne-ZMax` ("Monitors the EEG data from the Hypnodyne ZMax and triggers audio tracks when" eye activity is detected in REM; no license, last push 2023-09) and Halovision-INSPEC (camera-based REM detection) — [GitHub org](https://github.com/lucidcode)
- `nickmmark/brain-eeg-graph` — "Arduino EEG interface for lucid dreaming", ★312, no license, last push 2020 (abandoned) — [GitHub](https://github.com/nickmmark/brain-eeg-graph)
- `Venryx/LucidLink` — dream journal + random voice prompt engine, MIT, last push 2020 — [GitHub](https://github.com/Venryx/LucidLink)
- 2025–2026 prototypes: `mwasifanwar/DreamWeaver` (REM detection + audio stimulation, no license), `anu-rag-007/PROJECT-07` (closed-loop lucid induction via EEG staging, MIT, ★1) — toy-scale — [GitHub search](https://github.com/mwasifanwar/DreamWeaver)
- `IAmCoder/awesome-lucid-dreams` — curated list of devices/apps/papers, CC0-1.0, ★178, pushed 2026-10-24 (useful discovery index) — [GitHub](https://github.com/IAmCoder/awesome-lucid-dreams)

### Inferences
- Dormio's concept (hypnagogia detection + spoken cue) is the most transferable to a sound product and could be reimplemented from the published paper rather than reusing unlicensed code.

### Gaps
- No NovaDreamer replica repo found; no license-verified, maintained lucid-dream device firmware found.

## Nature-sound and soundscape audio datasets with clear licenses

### Takeaway
FSD50K is CC-BY-4.0 at dataset level but each clip carries its own Freesound license (CC0, CC-BY, CC-BY-NC, CC Sampling+), so commercial use requires per-clip filtering to CC0/CC-BY and attribution tracking; this is exactly how Stable Audio Open's training set was assembled.

### Cited Findings
- **FSD50K** — dataset-level CC-BY-4.0; clip licenses CC0, CC-BY, CC-BY-NC, CC Sampling+; dev set 14,959 CC0 / 20,017 CC-BY / 4,616 CC-BY-NC / 1,374 CC Sampling+; eval set 4,914 CC0 / 3,489 CC-BY / 1,425 CC-BY-NC / 403 Sampling+; per-clip license in metadata JSON — [Zenodo 4060432](https://zenodo.org/records/4060432); HF mirror `Fhrozen/FSD50k` (CC-BY-4.0 tag, ~131k downloads) — [HF](https://huggingface.co/datasets/Fhrozen/FSD50k)
- **MTG freesound-datasets** platform — AGPL-3.0 code, pushed 2026-05 — [GitHub](https://github.com/MTG/freesound-datasets)
- `agkphysics/AudioSet` (CC-BY-4.0 tag on annotations; underlying YouTube audio rights are separate — **not rights-clear for audio reuse**); `cvssp/WavCaps` CC-BY-4.0 tag (captions; audio drawn from mixed sources) — [HF API](https://huggingface.co/datasets/agkphysics/AudioSet)
- Soundscape datasets on HF: `bens-bots/marrs-global-coral-reef-soundscapes`, `Fhrozen/soundscapes`, `laion/soundscapes`, `Sonic-Forage/nps-liminal-soundscapes-v0-1`; licenses not individually verified — [HF datasets search](https://huggingface.co/datasets?search=soundscape)

### Inferences
- For product playback (not training), filter Freesound/FSD50K to CC0 for zero-attribution use, or CC-BY with an attribution ledger; exclude CC-BY-NC and treat CC Sampling+ cautiously.
- Datasets named "Gemini" or "11Labs" on HF (e.g., `laion/in-the-wild-soundscapes-gemini2.5-pro`, `sleeping-ai/11Labs`) involve cloud-AI-generated labels/audio and should be excluded under a no-cloud-AI provenance policy.

### Gaps
- Licenses of the HF soundscape datasets listed and of NPS-derived sets were not verified.
- Freesound's own API terms for commercial download were not fetched.
