# PILOT-01 — Mac source composition and live-tail repair witness

## Standing

Real Mac source dependencies are prospectively pinned. The composed implementation and the added live-tail repair passed the declared synthetic Mac checks below. This is NOT a real labeling pass, a pilot seal, an explanation of the original loss, or historical attestation of which UI collected P/F.

No real pilot file, local index, annotation, blank source, P seal, or original dirty worktree was changed. No real F working sheet or F seal was created. Port 3762 was not started. Test servers used disposable synthetic homes and other ports; test-owned processes were stopped.

## Exact lineage

- Prior pinned base: `279bfb232f238b6a75cd8b82339a7371f554fbaa`.
- Claude durability candidate: `250286cf1caa9860d255424baaa98d7ebff93eb6`.
- Six real Mac files plus two package scripts captured unchanged: `442995384995be8220bdb59847ca2914aa076c00`.
- Exact composition, preserving both histories: `2f108cde17d35b7e1ab2c37f907c6ce1ba2663ed`. Only package.json conflicted; the two source-pin scripts and three durability scripts were unioned. Existing pilot source in the durability candidate was otherwise byte-identical.
- Current branch: `fix/jev-label-pilot-mac-custody-r1-20261007`.
- Working checkout: `/Users/soullab/jev-label-pilot-mac-witness-20261007`.

The source-capture record lists every captured source SHA-256. Pinning now does not establish historical runtime identity.

## The additional failure and repair

The original composed candidate passed strict pilot typecheck, pilot 48/48, real P model 14/14, real F model 13/13, durability 55/55, mutation witness 14/14 and HTTP smoke 11/11 on the Mac, with NO stand-ins.

An independent actual-Chrome check then appended an unterminated final event to a synthetic event log while its server was still alive. `/api/custody` returned HTTP 200 with `disk_verified: true`. The browser suite was 8 passed / 1 failed. The original suite tested torn-tail handling only through startup/restart, not live inspection.

A new hermetic regression reproduced the same defect: 57 checks / 1 failed, named `live torn event-log tail is refused by verify without retrying a save`. These RED logs are preserved; they are not replaced by the passing logs.

Repair: `Custody.verify()` now checks `readEvents().tornTailBytes` and refuses `EVENT_LOG_TORN_TAIL` before returning verified custody. The read itself does not rewrite the event log or working/rolling data. Existing startup quarantine behavior is unchanged. The 15th mutation removes only this guard and is killed by the named new regression.

The custody panel now displays the actual working-file path and exposes both full SHA-256 hashes in its title, alongside its existing abbreviated visible hash and verified count. Question content, anchors, ordering and labeling semantics were not changed.

## Mac verification after repair

All cases are synthetic. In particular, any test P/F seals are synthetic fixtures, not Kelly's labels.

| Check | Result |
|---|---|
| Strict pilot TypeScript (`tsconfig.jarvis-jev-label-01.json`) | exit 0 |
| Pilot harness | 48 / 48 |
| Real P UI model | 14 / 14 |
| Real F UI model | 13 / 13 |
| Durability + finish suite | 61 / 61 |
| Mutation witness | 15 / 15 killed on named checks; reference green |
| Real-server HTTP smoke | 11 / 11, no stand-ins |
| Real Chrome / real assets readiness | 10 / 10, no stand-ins |

The 61-check suite includes an explicit 25-case/100-judgment synthetic fixture: 99/100 refuses before backup/output creation; 100/100 seals 100 F labels bound to the expected P seal; pre-seal bytes equal the working bytes; read-only mode is 0400; the report retains `verdict: NOT PRODUCED`.

The browser checks exercise real saves, reload, the 30-second poll, exact-byte recovery of a deleted primary, live torn-tail refusal, path/full-hash display, and a red custody warning after all three data copies are removed. They check for browser JavaScript errors as well.

Toolchain: Mac Studio; locally installed tsx 4.21.0, TypeScript 5.9.3, @types/node 25.0.9, Playwright 1.56.1; installed Google Chrome in headless mode. node_modules is an ignored link to the already-installed local toolchain, not a clean dependency installation. No npm install or lockfile edit was performed. No full-application typecheck is claimed.

## Local evidence

Evidence directory: `/Users/soullab/jev-pilot-mac-evidence-20261007T095156` (0700). Source capture files are private local copies; no pilot content is exported by this record. Test logs contain synthetic fixtures only. Original-state preservation was checked by exact hashes and names, original git status/HEAD, and the six original source hashes.

| Log | SHA-256 |
|---|---|
| `mac-browser-readiness.log` | `d8662354b493adab9819c29e15a2ff43525bb3323d1c72f5831ad320f0cb3e4a` |
| `live-tail-before.log` | `225b93758fbb2db48e51aaf69e90cb28b86eeaf6eb260485e9f8ac802de95821` |
| `final-typecheck.log` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `final-pilot-verify.log` | `86135c9024375d77c85b1ead965315a77dd69da0c4a93dfc3799a7f2fa1ff191` |
| `final-P-real-model.log` | `2cb62332afe5ee452a4f92bba61e321489fc4882884ac4903a0529c378f6b982` |
| `final-F-real-model.log` | `ee827a54c7f32d60902bc0f41f2236369897d1561e0e84a90af9719386973f62` |
| `final-durability.log` | `034b57fe2d865670bad974a65867b11ca64965c8cb46b523ccc07f61fb3e47ff` |
| `final-mutations.log` | `b7c0f33ab1f6915fad4d8430964ec33362f110b8fc477edcb8622a3ac2905076` |
| `final-HTTP-real-model.log` | `fa28559715b0a57c7c5ec3e7086f2100c8e31db28ce92c1bba45f41eac7c9499` |
| `final-browser-readiness.log` | `42baffb861ad3e2bf24a443ee9eb50f04f197cac337af4b20461f17c73963fb5` |

## Limits and outstanding human decisions

- Original loss cause: UNKNOWN. The actual completion date/time is UNVERIFIED. The prior assistant attribution to October 7 around 09:17 Eastern was unsupported and is explicitly withdrawn.
- Current source capture cannot authenticate the prior P surface or lost F run retrospectively.
- Fault injection covers declared save boundaries; these checks do not demonstrate physical power-cut survival, malicious tamper resistance, concurrent writers, or recovery after the chosen backup volume disappears. 0400 is owner-readable file mode, not owner-proof immutability.
- The live backup directory/volume must be explicitly selected and verified before any real pass. No real `run-f-ui.sh` or `finish-after-f.sh` was executed.
- Retest recall, elapsed P-to-F interval, and changed surface custody remain comparability limitations. Label B remains outside this act.
- Real F completion, verification of its artifacts, sealing, the real P-vs-F report, human anchor/floor choices, freeze and admission are not produced by these synthetic tests.

A clean committed-source checkout witness will be added below when observed; the passing working-tree runs above are not mislabeled as that witness.

## Clean committed-source proof — completed on the Mac

Witnessed code commit: `08b86b8c77eadbf132de6c16cc94cf93da0234e6`.

Fresh detached checkout: `/Users/soullab/jev-label-pilot-cleanproof-20261007`. It was created from that exact commit, not populated from the original working tree. All six formerly untracked source files are tracked and match the source-capture SHA-256s. No stand-ins or untracked source were used. The declared local node_modules link is the only external toolchain supply.

The complete suite was run again: strict pilot typecheck exit 0; pilot 48/48; P 14/14; F 13/13; durability/finish 61/61; mutation witness 15/15 named kills with reference green; real HTTP 11/11; real browser 10/10. Final source status was CLEAN.

| Clean-checkout log | SHA-256 |
|---|---|
| `clean-typecheck.log` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `clean-pilot-verify.log` | `86135c9024375d77c85b1ead965315a77dd69da0c4a93dfc3799a7f2fa1ff191` |
| `clean-P-real-model.log` | `2cb62332afe5ee452a4f92bba61e321489fc4882884ac4903a0529c378f6b982` |
| `clean-F-real-model.log` | `ee827a54c7f32d60902bc0f41f2236369897d1561e0e84a90af9719386973f62` |
| `clean-durability.log` | `034b57fe2d865670bad974a65867b11ca64965c8cb46b523ccc07f61fb3e47ff` |
| `clean-mutations.log` | `b7c0f33ab1f6915fad4d8430964ec33362f110b8fc477edcb8622a3ac2905076` |
| `clean-HTTP-real-model.log` | `fa28559715b0a57c7c5ec3e7086f2100c8e31db28ce92c1bba45f41eac7c9499` |
| `clean-browser-readiness.log` | `42baffb861ad3e2bf24a443ee9eb50f04f197cac337af4b20461f17c73963fb5` |

The proof closes the clean-source/dependency and stand-in witness gaps for this candidate. It does not retroactively establish historical P/F runtime provenance, diagnose the earlier loss, or authorize a real relabel/seal.
