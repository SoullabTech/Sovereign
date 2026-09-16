# DRIVER-01 batch — VPIO-02-SID-SOURCE — 20260916T140115Z

stratum=AUTOMATED-COLD-LAUNCH · N=10 · vp=on · mode=L · hold=15s · w4=off · subject=vpio-02-sid · bundle=life.soullab.voicekernel.vpio02sid · device=A0736AC8-793B-516F-AC72-C076DB6CEE38 · xcodeDest=00008140-00163D9922E0801C
classifierSubject=vpio-02 · declared custody vpio-02-sid is trace-compatible with vpio-02 (SOURCE-ID-02: the frozen entry/output readers classify under it; source rows in source-ledger.md)
act=output · cancelAt=1000ms · settle=2s · driver=testOutputSample · reader=k00-output-ledger.py → output-ledger.md (K00-05 / K00-06 / coupling rows, evidence-only)
stimulus=sid-nearend-gated · fixture=k00-sid-nearend-997hz-gated-2hz-180s.wav · fixtureSha256=30d51cf4b7527d28131bd9c2535c6bd4dcd2403c8dc0343fc045f6f6959875eb · player=/usr/bin/afplay -v 0.50 -t 180 · afplaySha256=88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb · outputDevice=Mac Studio Speakers (coreaudio_device_type_builtin) · outputVolume=69 · muted=false · custody=stimulus-preflight/ + stimulus-sample-N.tsv (never read by k00-ledger.py / k00-output-ledger.py)
installed harness identity (the app under test is NOT rebuilt by this batch):
```
VoiceKernel VPIO-02-SID   life.soullab.voicekernel.vpio02sid                 0.0.1     1             
last reinstall: 20260913T145025Z
```

| Stratum | # | Mode | Session | Records | SHA-256 | Class | Evidence |
|---|---|---|---|---|---|---|---|
| AUTOMATED-COLD-LAUNCH | 1 | L | `K00-8f7c901f` (`kernel00-K00-8f7c901f-1789567314.jsonl`) | 93 | `f7f5b1fcae1137ddbffc8387ce98636648c8f4873f3435e2136cc48e83fabba6` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=5 · listeningHeldAtExport=True · listeningLostLater=True · generations=1 · holdS=20.0 · listeningMs=336 |
| AUTOMATED-COLD-LAUNCH | 2 | L | `K00-f6a5701b` (`kernel00-K00-f6a5701b-1789567351.jsonl`) | 96 | `9ba098f548e4d8f45cd188973a928875bb56a8c6e89b90831aec040824f20158` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=4 · listeningHeldAtExport=True · listeningLostLater=True · generations=1 · holdS=19.9 · listeningMs=328 |
| AUTOMATED-COLD-LAUNCH | 3 | L | `K00-6ad14011` (`kernel00-K00-6ad14011-1789567389.jsonl`) | 96 | `f0b9bdda074ffb0da8bc725ec2820c7541902df8f5c42c9c1fd4c627f2015898` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=7 · listeningHeldAtExport=True · listeningLostLater=True · generations=1 · holdS=19.9 · listeningMs=332 |
| AUTOMATED-COLD-LAUNCH | 4 | L | `K00-6a660a2a` (`kernel00-K00-6a660a2a-1789567427.jsonl`) | 91 | `e84e07897d3d4261d95acc0d2f03513212e2329e4e0c3f5f9b824adbabade2c3` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=7 · listeningHeldAtExport=True · listeningLostLater=True · generations=1 · holdS=18.9 · listeningMs=328 |
| AUTOMATED-COLD-LAUNCH | 5 | L | `K00-ceb6b807` (`kernel00-K00-ceb6b807-1789567482.jsonl`) | 168 | `fb581445e0ec09265ced9ab7e2bfe80cf749263aee31cd10086f65ef35af3271` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=7 · listeningHeldAtExport=True · listeningLostLater=True · generations=1 · holdS=20.0 · listeningMs=369 |
| AUTOMATED-COLD-LAUNCH | 6 | L | — | — | — | **PRECONDITION-FAILED** | SID SOURCE sample 6 PRE-PLAY harness-zero guard refused; no terminate attempted; no stimulus started; no phone sample launched; see sample-6-source-preplay-* evidence |
