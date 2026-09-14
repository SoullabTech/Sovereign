# unified-log calibration — 20260914T121709Z (instrument validation only; the sample is stratum LOG-CAL, never counted)
## gate: probe docs/programme/VOICE-2026/driver-ledger/log-probe-20260914T121405Z · collect device option: --device-udid · collect window option: --start · show <archive> positional + --start: 1
## commands this run will issue (verbatim): log collect --device-udid 00008140-00163D9922E0801C --start <T0-5s> --output docs/programme/VOICE-2026/driver-ledger/log-cal-20260914T121709Z/device.logarchive · log show --start <T0> --end <T1> --style json docs/programme/VOICE-2026/driver-ledger/log-cal-20260914T121709Z/device.logarchive (ruling 2: default level only, no --info/--debug on the first read)
## never issued: log config · sysdiagnose · any debugger/profile/level change
## T0 (Mac wall clock, before the sample): 2026-09-14T12:17:09Z (local 2026-09-14 08:17:04 used for the collect window)
## sample: batch rc=0 · ledger  · row: (no row)
## T1 (after export): 2026-09-14T12:18:26Z
## collect: log collect --device-udid 00008140-00163D9922E0801C --start 2026-09-14 08:17:04 --output docs/programme/VOICE-2026/driver-ledger/log-cal-20260914T121709Z/device.logarchive
## collect rc=77 · 0 s · archive size: none
log: Must be root to collect logs from attached device
## STOP — collect did not produce an archive; mechanism returned for ruling
