# JARVIS-JEV-PILOT — F Host boundary and explicit execution witness

Date: 2026-10-07. Status: bounded F-only code candidate, Mac-witnessed on synthetic fixtures. **No real labeling launch, no real F labels, no real F seal, no canonical merge, no deployment.**

## 1. Exact source identities

- Parent: commit:7a6dca79871f05dbe065b21fdc81bc1c7de93ad9
- Tested code: commit:afe639f5e978fe13443da4061fee72be6c3747ab
- Branch: `fix/jev-label-pilot-f-host-guard-r1-20261007`.
- Working checkout: `/Users/soullab/jev-label-pilot-f-host-guard-20261007`.
- Clean detached witness checkout: `/Users/soullab/jev-label-pilot-f-host-clean-20261007`.
- The existing real-source pin and durability ancestry are preserved. No history was rewritten.

## 2. Runtime boundary

Only `human-f-ui-server.ts` changes at runtime: 17 added lines. Before URL parsing, any route, body parsing, custody verification or repair, require exactly one raw Host field whose value is `127.0.0.1:<configured port>` or `localhost:<configured port>` (localhost comparison is case-insensitive). The explicit configured port is required.

Missing/empty Host, duplicate Host, wrong port, foreign/suffix hostnames, combined values, user-info spellings and non-allowlisted IP spellings are refused. Forwarded and X-Forwarded-Host do not confer permission. An allowed Origin does not rescue an untrusted Host; an absent Origin does not bypass Host validation. Rejection is fixed HTTP 403 with `{"ok":false,"error":"INVALID_HOST"}`; it echoes no request value, routing state or local path.

The existing Origin check and IPv4 loopback bind are unchanged. This is a Host/DNS-rebinding boundary, **not authentication of local processes**, and not a comprehensive security assessment. The P server is unchanged. No claim is made that this gap caused the original missing F file.

## 3. Red before repair; discriminating tests

The new 38-check suite was first run against the unmodified parent F server. It exited 1 with 30 named failures, including `H01-untrusted-no-origin`; valid localhost reads and real assets passed. With the 17-line guard it completes 38/38. All requests go directly to a disposable loopback server with synthetic data; no external DNS rebinding is performed.

| Mutant | Named failure required | Result |
|---|---|---|
| MH1 — bypass Host check | H01-untrusted-no-origin | KILLED |
| MH2 — accept any localhost port | H04-wrong-port | KILLED |
| MH3 — accept duplicate Host | H13-duplicate-valid-first | KILLED |
| MH4 — gate POST only, expose GET | H01-untrusted-no-origin | KILLED |

Each kill requires exit 1, the named FAIL line, all 38 checks completing, and no harness error, signal or timeout. A missing/non-unique mutation anchor is an instrument failure, not a kill. The unmutated reference must pass.

The HTTP suite additionally verifies that forbidden requests change no fixture files, cannot trigger recovery of a deleted working file, and cannot enter JSON body parsing. Allowed requests retain the original save and recovery behavior.

## 4. Clean Mac execution receipts

All ten commands completed with exit code 0 at `afe639f5e978fe13443da4061fee72be6c3747ab`. No stand-ins or copied untracked source were used. Source was clean before and after. Installed dependencies were symlinked from the existing Mac toolchain; this is **not a fresh dependency installation or a full-application typecheck**.

Toolchain: `{"node": "v22.22.3", "tsx": "4.21.0", "typescript": "5.9.3", "playwright": "1.56.1"}`.

| Check | Result | Exit | Log SHA-256 |
|---|---:|---:|---|
| typecheck | strict pilot typecheck PASS | 0 | `07be611cf6a6067f1d8818c5fb33bf641ddbdc7957575ed300ae2d3de1535e2f` |
| pilot-48 | 48/48 | 0 | `b1f4ecf16389920d74043a123f08c30c38cd2dd02b11985482860ab3fd950c77` |
| P-model-14 | 14/14 | 0 | `33faa2356648cb613b388ca466362fa1cd73541180b77c4b7b586aff83b074e4` |
| F-model-13 | 13/13 | 0 | `4a1e9b45649248d2982c5e844172faf36b51ba9beda29eb45731f4a797ab6e88` |
| durability-61 | 61/61 | 0 | `05509d4a4e56bdabb605b84425f60add2afce4f93a4d23abb94fe5d72f103c15` |
| durability-mutations-15 | 15/15 | 0 | `74ee05888406a6c2b15eaac3094e47590056525bfb72e70f39cca274041ffc99` |
| HTTP-11 | 11/11 | 0 | `59c15d413395b8b87b1a3b6c5cff2ce82d401fbba22c8c16cbcfd24655651acd` |
| Chrome-10 | 10/10 | 0 | `afd663f803c9a3685fc1cfd848c55dcbe49979967c99e6f3eb7fa925ad687113` |
| Host-38 | 38/38 | 0 | `6426366fd74ff849fb84e6a8be102f13d26942f6b444f1de188412a6e23fc09f` |
| Host-mutations-4 | 4/4 | 0 | `3aa13190d765948498e141730353429f27689302ea1897dc77ca329963cead06` |

Every log records exact command, working directory, HEAD, start/end timestamps, exit code and execution error status. A silent compiler now leaves a **nonempty invocation/exit receipt**, rather than only the SHA-256 of empty stdout. The original earlier empty log remains historical; it is not edited, and the empty hash alone never proves a command ran.

Receipt: `/Users/soullab/jev-pilot-host-evidence-20261007T101942/clean/receipt.json`
Receipt SHA-256: `a788e99e5be4ed7e9cf9e2fb5dbaaaef315fc5e3c09225c8038216131cc4edd0`
Receipt runner: `/Users/soullab/jev-pilot-host-evidence-20261007T101942/run-witness.py`
Runner SHA-256: `707a0a2d2fbaf919c2bfffc7f3f35f9c0b3de444cd1ed0c8052fbece05eac6fd`
Pre-repair log: `/Users/soullab/jev-pilot-host-evidence-20261007T101942/host-pre-repair.log`
Pre-repair log SHA-256: `e18ccc0387d8221ab9e71ab436f72900cdd839791833ac9f64591b238c92016b`

The real server startup event from the **synthetic clean-checkout witness** was read back and checked against the pinned code:

```json
{
  "git_head": "afe639f5e978fe13443da4061fee72be6c3747ab",
  "git_dirty_paths_in_pilot_dir": 0,
  "missing_files": []
}
```

This is not a claim that a real labeling session has started. The same source-identity check is still required at that future controlled launch.

## 5. Preservation and carried limitations

Eighteen source files are byte-identical to the reviewed parent, including `pilot.ts`, `core.ts`, `cli.ts`, `config.ts`, the F model, durability/finish modules, F assets, launch/finish scripts and all six P-surface files. No labeling semantics or durability invariant was weakened.

All protected real pilot files and names, the original Mac-only source bytes, original package bytes, original HEAD and original dirty state remain unchanged. Real F working and F sealed files remain absent.

Preservation receipt SHA-256: `ad97c49760bf2656b9fecefb58763d95718e21736d7e71038b6043fbadf70a7e`.

**P-surface reuse hold:** the P server still mutates its in-memory sheet before its disk write, lacks F custody hardening, and has an unused authorization helper. Pinning its source did not fix it. Do not reuse this P surface for B or another pass without its own custody/access repair and witness. Existing sealed P is not modified or invalidated by this F-only change.

Original F loss: **cause unknown; no recovered judgments; actual completion time unverified**. Do not infer a completion time from tool-check timestamps. Label B remains unassigned as reported by the operator. No reminder schedule was changed in this act.

## 6. Next controlled act — not spent

Select and verify a separate backup location, launch only the clean pinned F candidate, then read the actual F_SERVER_STARTED event: expected git HEAD, zero git_dirty_paths_in_pilot_dir, and no MISSING code_identity.files. After Kelly submits the first real case, independently verify working bytes, generation, rolling backup and event hash before asking him to complete the other 24. Do not start a pass or seal on the strength of synthetic tests alone.

Reproducible additional commands:

```bash
npm run verify:jarvis-jev-label-01-f-host
npm run matrix:jarvis-jev-label-01-f-host
```

## 7. Technical references

- Node HTTP reference, `message.rawHeaders`: duplicates are not merged in the raw header array. https://nodejs.org/api/http.html#messagerawheaders
- MCP TypeScript SDK, Host/Origin validation for localhost DNS-rebinding protection: https://ts.sdk.modelcontextprotocol.io/v2/serving/express.html#protect-against-dns-rebinding

These references explain the boundary; the run receipts above are evidence about this implementation.
