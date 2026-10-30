# LISTEN-MUSIC-ONLY-01 — Night Ground 01 — Music Only: evidence and custody (30 Oct 2026)

**Status:** LOCAL REVIEW CANDIDATE · private review · release HOLD · not merged, deployed or released.
Stacked on the native-audio and UIUX-02 work in LISTEN-01 #1979.

## What this adds
A fourth Night Ground edition, **Music Only**: the original 109-minute composition with no voice, finite, member-started, no loop. Two contiguous AAC segments: a new voice-free Part 1 (first 49:00) and the **existing** 60-minute core as Part 2.

## The question and how it was settled
Earlier in this session the preserved 109-minute file was wrongly assumed to contain Nicole's voice. That was wrong. Independent verification by signal comparison:
- Decoded, band-limited (300 Hz–4 kHz) difference between the preserved 109-minute file and the review Nicole Part 1, first 12 minutes: median −74 dB; the **only** four bursts are at **0:30, 2:50, 6:05, 9:40** (peaks −58.5, −58.0, −54.5, −49.2 dB) — Nicole's four cue times. Nowhere else.
- Speech-band (800 Hz–4 kHz) energy scan of the first 49 minutes: the preserved file shows no burst more than 8 dB above its median; the Nicole Part 1 shows small rises at 364–366 s and 580–584 s only.
- The Nicole script states: "Exact Night Ground music bed unchanged; Nicole guidance −13 dB". The manifest's own `finalCueEndBeforeMs` is 587000 (9:47).
- ChatGPT's source-package report (score declares `voice: false`) agrees; it was not relied upon alone.
**Conclusion:** the preserved 109-minute file is the voice-free composition; the Nicole edition is that bed plus her voice. This is source/byte and signal verification, **not an independent human A/B listening test.**

## Media identities
| Item | Value |
|---|---|
| Preserved master (48 kHz AAC, 109:00, 186,864,924 bytes) | SHA-256 `9fa8ee35914a351d9aca055c51f66618d557940805ed76d97d94a86bc46fa7b1` |
| Music Only Part 1 (new; AAC LC 160 kbps, 44.1 kHz, stereo, 2940.000 s) | `6363db90be4e42482d0b299d43f0fa7b9480677711a4f6d97f5f885aed0dc0b5`, 59,648,624 bytes |
| Part 2 (existing 60-min core, unchanged) | `60c11077f94b26369753010eacd2ea22e04c366af3f17d8c193927a31c3a0d5d`, 72,621,707 bytes |
Part 1 was encoded from the master's first 2940 s. Against the review Nicole Part 1 outside cue windows the difference is −65 to −68 dB against a ~−28 dB signal (codec level). Part 2 against the master's last 3600 s: −57 to −68 dB (codec level) — it is the voice-free core.

## Correction made
The **preserved master's SHA-256 was recorded wrongly** in the Nicole First Night and Extended Night manifests (`…ed5968b37465af601891a6`); the file's real fingerprint ends `…ed76d97d94a86bc46fa7b1`. Same size. Corrected in both and recorded correctly in the new manifest. Nothing at runtime verifies this field (the master is not served).

## Flagged, NOT edited (admitted custody)
The Nicole First Night / Extended Night manifests' `technicalQualification` says the 109-minute export was "split losslessly into two Git-safe AAC segments". The review Part 1 is **not** a lossless split of the preserved master (it carries Nicole's voice at four cues; the master does not). Part 2 is a codec-level re-encode of the master's last 60 minutes. The wording needs an owner decision.

## Not established
Independent human A/B listening; physical iPhone behaviour of this edition (screen lock, interruptions, hours); desktop Safari; physical iPad; rights beyond the founder-declared original-study custody; any release.
