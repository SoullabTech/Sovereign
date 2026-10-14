# Cabin 0.2.1 — large manuscript import

Founder reported “Invalid text or text too long” while importing writing. Cabin 0.2.0 had inconsistent limits: 800 KB at the file picker, 200,000 characters for manuscript bodies, and one MB for JSON requests.

## Repair

UTF-8 TXT and Markdown imports accept files up to 20 MiB (20,971,520 bytes). The renderer submits the File as raw bytes to an authenticated, same-origin local import route. Input byte limits are enforced before decoding; invalid UTF-8 and binary NUL text are rejected before any manuscript is created. No truncation or cloud upload occurs.

Manuscript lists and version-history inventories return metadata only. Selecting writing or previewing a version loads its body on demand. This prevents every stored manuscript/version being copied into each workspace state response.

Save supports a full imported manuscript. Request decoding buffers complete UTF-8 byte sequences rather than converting each arbitrary network chunk separately. Original CRLF line endings remain in the saved text and native export. Editor comparisons normalize textarea newlines; selected-passage offsets map back to original text positions. A file input is reset even after rejection so the user can retry the same file.

MAIA still processes selected passages within the local model context limit. Importing a large manuscript does not imply whole-book inference or indexing. DOCX/PDF remain outside this text-import repair.

## Actual packaged-window evidence

- Exactly 20 MiB fictional TXT import: PASS.
- Unicode, CRLF and native export: source/export SHA-256 MATCH.
- Save and Undo on the full manuscript: PASS.
- Summary-only manuscript and version inventories: PASS.
- Import a second Markdown work and switch back: PASS.
- Over-limit file rejected in the UI: PASS.
- Invalid UTF-8 rejected with no partial manuscript record: PASS.
- Close/reopen restores the selected large manuscript: PASS.
- Conversation, correction, model suggestion, Apply/Undo, versions, explicit conversation resume, export, interrupted-response recovery, unauthenticated access denial and kernel external-egress denial regression: PASS.
- Final release package large-file test repeated: PASS.
- Test and release server bundles both have SHA-256 c535a1a7e9de2524c7ca1b8053b2da5ef16505a279d27b8f6ae9426fd1eec510.
- Deep ad-hoc signature and source whitespace checks: PASS.

Tests used temporary fictional storage on separate loopback ports. Personal manuscripts, production and tester invitations were not used or changed. The installed app retains its existing saved-workspace directory.
