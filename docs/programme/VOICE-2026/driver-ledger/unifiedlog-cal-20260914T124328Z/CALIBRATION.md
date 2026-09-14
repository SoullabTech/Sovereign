# unified-log calibration — 20260914T124328Z (instrument validation only; the sample is stratum LOG-CAL, never counted)
## execution authority (verbatim, supplied at invocation): FOUNDER-AUTH: one LOG-CAL calibration only; explicitly named sealed post-amendment probe; root authorized only for log collect; default-level archive read only; no --info, no --debug, no batch, no organism change.
## witness verification of docs/programme/VOICE-2026/driver-ledger/log-probe-20260914T123612Z:
PASS · seal == manifest
PASS · manifest hashes == files
PASS · criterion id == expected
PASS · criterion revision is ancestor of probe execution HEAD
## gate: probe docs/programme/VOICE-2026/driver-ledger/log-probe-20260914T123612Z · collect device option: --device-udid · collect window option: --start · show <archive> positional + --start: 1
## commands this run will issue (verbatim): log collect --device-udid 00008140-00163D9922E0801C --start <T0-5s> --output docs/programme/VOICE-2026/driver-ledger/unifiedlog-cal-20260914T124328Z/device.logarchive · log show --start <T0> --end <T1> --style json docs/programme/VOICE-2026/driver-ledger/unifiedlog-cal-20260914T124328Z/device.logarchive (ruling 2: default level only, no --info/--debug on the first read)
## never issued: log config · sysdiagnose · any debugger/profile/level change
## T0 (Mac wall clock, before the sample): 2026-09-14T12:43:28Z (local 2026-09-14 08:43:23 used for the collect window)
## sample: batch rc=0 · ledger /private/tmp/voice-pass2-6801/docs/programme/VOICE-2026/driver-ledger/LOG-CAL-20260914T124328Z · row: | AUTOMATED-COLD-LAUNCH | 1 | L | `K00-6dbc2752` (`kernel00-K00-6dbc2752-1789389844.jsonl`) | 54 | `c32d05d96a2bd7ae132b290c10c5ae77fabb18277356ddf3a887c0a7891dfa18` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCal
## T1 (after export): 2026-09-14T12:44:10Z
## root: K00_LOG_SUDO=1 set by the founder — the collect runs under sudo (host privilege only; no device configuration)
## collect: sudo log collect --device-udid 00008140-00163D9922E0801C --start 2026-09-14 08:43:23 --output docs/programme/VOICE-2026/driver-ledger/unifiedlog-cal-20260914T124328Z/device.logarchive
## collect rc=0 · 185 s · archive size: 291M · owner: soullab
Archive successfully written to docs/programme/VOICE-2026/driver-ledger/unifiedlog-cal-20260914T124328Z/device.logarchive
## show rc=0 · window.json 149M · window 49 s
## window.json unreadable: Extra data: line 3996225 column 3 (char 150211740)
## configuration changed by this run: NONE issued (no log config, no profile, no debugger); daemon identity before/after is in /private/tmp/voice-pass2-6801/docs/programme/VOICE-2026/driver-ledger/LOG-CAL-20260914T124328Z/daemons/
## custody: window.json sha256 72871a24cb256b82337f17edc99bcebc6fce58d6e6fbfe9412d5e47dd9bddf37 · archive left on the Mac at docs/programme/VOICE-2026/driver-ledger/unifiedlog-cal-20260914T124328Z/device.logarchive (not committed)
