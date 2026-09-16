# TURN-02 semantic incompleteness shadow — 2026-09-16

**Standing:** SHADOW · HIGH-PRECISION OBSERVABLE CUES ONLY

## Purpose

The first real acoustic candidate proved a specific limitation: a reflective
mid-thought silence can look acoustically identical to a true turn ending. The
semantic layer therefore supplies conservative continuation/yield evidence from
the transcript already produced by STT.

This is not sentiment analysis, psychological scoring, or an attempt to infer a
member's internal state. It only recognizes directly observable turn language.

## Admitted cues

Strong continuation evidence includes:

- explicit holds: `give me a second`, `let me think`, `I'm not done`, `stay with me`
- unfinished syntax: trailing `because`, `and`, `to`, `is`, auxiliary/copula words, etc.
- trailing fillers such as `um` / `you know`
- trailing ellipsis or an unclosed delimiter

Strong yield evidence is deliberately narrower:

- `I'm done`
- `that's it`
- `your turn` / `go ahead`
- `what do you think?`
- similarly explicit invitations to respond

Ordinary sentence punctuation does not itself manufacture yield evidence.

## Falsifier carried forward

Measured DualTurn evidence from the local synthetic reflective-pause witness:

- `acousticYield = 0.9861`
- `acousticContinue = 0.0731`
- transcript before the pause: `I think what I'm realizing is`

Acoustic evidence alone would recommend yield after Natural space expires. The
semantic detector marks the trailing `is` as unfinished syntax (`0.9`), causing
the conservative arbiter to return **WAIT**. This regression is executable.

## Privacy and authority

The live shadow path logs only scores, cue counts, and a non-content cue category
such as `dangling_syntax`; it does not log transcript words. TURN-01 remains the
authority boundary. Semantic evidence cannot directly commit a transcript,
invoke cognition, or start TTS.
