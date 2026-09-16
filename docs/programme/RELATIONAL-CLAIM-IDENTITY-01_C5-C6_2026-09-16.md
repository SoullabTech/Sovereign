# RELATIONAL-CLAIM-IDENTITY-01 — C5–C6 Replay + Shadow Witness

**Status:** C5/C6 COMPLETE · out-of-band shadow evidence only

## C5 · Frozen production replay

Two frozen production transcript snapshots were replayed through deterministic claim segmentation and gesture binding. Raw transcript text remained outside the repository; committed evidence contains only session/turn hashes, claim ids/spans, gesture classes, and binding results.

Confirmation session:
- opaque retrospective request remained `AMBIGUOUS` with no manufactured antecedent;
- later “that is exactly it. MAIA!” bound one atomic `quotation` claim only;
- the adjacent MAIA question did not acquire standing.

Restart session:
- “I already told you” bound the sole question-act in the immediately preceding MAIA turn;
- the neighboring assertions were untouched;
- “we keep starting this conversation over and over” remained `META_PATTERN / NO_TARGET` rather than being collapsed onto one claim.
## C6 · Fresh production re-fetch

The confirmation binder was tightened after the initial C5 artifact: the exact same quoted claim id/span remained the target, but the reason code changed from the generic `single-confirmable-atomic-claim` to the stricter `quotation-confirmation-frame`. The original C5 artifact is therefore retained as historical pre-tightening evidence rather than rewritten.

The same two immutable sessions were then re-read from production after that tightening. Replaying those fresh authoritative bytes with the final candidate produced byte-identical output to the governing `C6_FINAL_CONFIRM_2026-09-16.json` and `C6_FINAL_RESTART_2026-09-16.json` artifacts.

- confirmation: same exact quoted claim id/span as C5; stricter governing reason `quotation-confirmation-frame`;
- restart: byte-identical to the earlier replay and still binds only the sole question-act;
- fresh production re-fetch: both final outputs reproduce exactly.

This demonstrates that claim ids are reproducible from authoritative source bytes rather than artifacts of one export, while preserving the binder-law tightening as explicit provenance rather than silently rewriting history.

## Coverage ceiling

Across the two real sessions:

- 57 MAIA turns produced 275 claim units;
- 176 units were `atomic`;
- 99 units were deliberately `composite`;
- the parser therefore abstains from automatic claim-level standing on a substantial fraction of observed output.

That ceiling is acceptable for shadow research, but it is not evidence that deterministic post-hoc segmentation is sufficient for every production utterance.
