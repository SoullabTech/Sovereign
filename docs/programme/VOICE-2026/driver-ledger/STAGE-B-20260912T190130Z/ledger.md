# DRIVER-01 batch — STAGE-B — 20260912T190130Z

stratum=AUTOMATED-COLD-LAUNCH · N=30 · vp=on · mode=L · hold=15s · w4=off · subject=p5b0 · device=A0736AC8-793B-516F-AC72-C076DB6CEE38 · xcodeDest=00008140-00163D9922E0801C
installed harness identity (the app under test is NOT rebuilt by this batch):
```
VoiceKernel K00        life.soullab.voicekernel.k00                       0.0.1     1             
last reinstall: 20260912T190128Z
```

| Stratum | # | Mode | Session | Records | SHA-256 | Class | Evidence |
|---|---|---|---|---|---|---|---|
| AUTOMATED-COLD-LAUNCH | 1 | L | `K00-c3c4333d` (`kernel00-K00-c3c4333d-1789239717.jsonl`) | 53 | `cbd97b1b3e13abc7ddedd6cc1f1118b5c3e951ed7fef419f2f33f2a608c89150` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=94 · generations=1 · holdS=16.0 · listeningMs=470 |
| AUTOMATED-COLD-LAUNCH | 2 | L | `K00-e7376ee7` (`kernel00-K00-e7376ee7-1789239750.jsonl`) | 240 | `d574ec3d65fe75b435c78af0cab5288d02561dcd6382f5afcbff324b206f64d0` | **failure then degradation** | floor reached degraded; no listening · cold=True · isRunningImmediate=true · graphStartedRunning=false · firstCallbackMs=- · generations=7 · holdS=16.0 |
| AUTOMATED-COLD-LAUNCH | 3 | L | `K00-9fc34c4b` (`kernel00-K00-9fc34c4b-1789239782.jsonl`) | 112 | `1d53d947a40d1f74b13214de892bdfdba139e6f0a6ea6df3782b7d3fe9013494` | **failure then recovery** | listening first reached in generation 3 · cold=True · isRunningImmediate=true · graphStartedRunning=false · firstCallbackMs=- · generations=3 · holdS=16.3 · listeningMs=3796 |
| AUTOMATED-COLD-LAUNCH | 4 | L | `K00-c7385590` (`kernel00-K00-c7385590-1789239815.jsonl`) | 245 | `917dc208be2219371a6ae0f95ec075e762da5e45002a7e19852e9d024346dd2b` | **failure then degradation** | floor reached degraded; no listening · cold=True · isRunningImmediate=true · graphStartedRunning=false · firstCallbackMs=- · generations=7 · holdS=15.5 |
| AUTOMATED-COLD-LAUNCH | 5 | L | `K00-a7d20733` (`kernel00-K00-a7d20733-1789239847.jsonl`) | 53 | `54b0e2392ae9ec119a0d96dc4ef8158258f906aec98f33cfedbc573a14771c34` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=97 · generations=1 · holdS=15.9 · listeningMs=422 |
| AUTOMATED-COLD-LAUNCH | 6 | L | `K00-029de96a` (`kernel00-K00-029de96a-1789239880.jsonl`) | 53 | `369e6786f66ea7dbc1db60863c2fbff5b4b09fc9835d22b2043f1cb169fc1101` | **gen-1 listen** | cold=True · isRunningImmediate=true · graphStartedRunning=true · firstCallbackMs=96 · generations=1 · holdS=16.0 · listeningMs=455 |
| AUTOMATED-COLD-LAUNCH | 7 | L | `K00-7368ad1a` (`kernel00-K00-7368ad1a-1789239912.jsonl`) | 112 | `0fef0443fe2286169136d3da4e914c376b2d0ac72791d97d1a033dda64df7a45` | **failure then recovery** | listening first reached in generation 3 · cold=True · isRunningImmediate=true · graphStartedRunning=false · firstCallbackMs=- · generations=3 · holdS=16.3 · listeningMs=3908 |
