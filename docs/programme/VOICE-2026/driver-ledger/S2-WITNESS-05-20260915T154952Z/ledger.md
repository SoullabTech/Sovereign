# DRIVER-01 batch — S2-WITNESS-05 — 20260915T154952Z

stratum=AUTOMATED-COLD-LAUNCH · N=1 · vp=on · mode=L · hold=15s · w4=off · subject=vpio-02 · bundle=life.soullab.voicekernel.vpio02 · device=A0736AC8-793B-516F-AC72-C076DB6CEE38 · xcodeDest=00008140-00163D9922E0801C
act=output · cancelAt=1000ms · settle=2s · driver=testOutputSample · reader=k00-output-ledger.py → output-ledger.md (K00-05 / K00-06 / coupling rows, evidence-only)
stimulus=s2-nearend · fixture=k00-s2-nearend-997hz-180s.wav · fixtureSha256=1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e · player=/usr/bin/afplay -v 0.50 -t 180 · afplaySha256=88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb · outputDevice=Mac Studio Speakers (coreaudio_device_type_builtin) · outputVolume=69 · muted=false · custody=stimulus-preflight/ + stimulus-sample-N.tsv (never read by k00-ledger.py / k00-output-ledger.py)
installed harness identity (the app under test is NOT rebuilt by this batch):
```
VoiceKernel VPIO-02    life.soullab.voicekernel.vpio02                    0.0.1     1             
last reinstall: 20260913T145025Z
```

| Stratum | # | Mode | Session | Records | SHA-256 | Class | Evidence |
|---|---|---|---|---|---|---|---|
| AUTOMATED-COLD-LAUNCH | 1 | L | `K00-fb8793df` (`kernel00-K00-fb8793df-1789487467.jsonl`) | 72 | `156fcca26ed3db613d7a323162448b26a80e06186ac1461700df8bc2fe3bb2b2` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=2 · listeningHeldAtExport=True · listeningLostLater=True · generations=1 · holdS=19.0 · listeningMs=397 |
