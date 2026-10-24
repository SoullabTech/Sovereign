# Soullab Audio Authority — R1 source-owner review candidate

**Scope:** pure cross-project audio focus policy and injectable transaction contract. **Not** a new app, new global singleton, production audio service, microphone/streaming permission or Sound Sanctuary player. No member data or source mutation.

Run on Node 22+ with TypeScript 5.8+:

```bash
tsc --project tsconfig.json          # strictly typecheck source
tsc --project tsconfig.build.json    # compile temporary JS for Node tests
node --test tests/audio-governance/*.test.cjs
```

This candidate is designed to be reconciled into the protected Soullab `useAudioCoordinator` existing entrypoint, with the current native iOS AudioSessionManager and separately authorized JARVIS/Cabin IPC adapters. **A decision of `attempt` or `pause-and-attempt` never grants playback rights.** The actual source owner must validate account/turn/consent/rights, confirm existing output is actually paused and obtain an exclusive output lease.

See `docs/AUDIO_PLATFORM_01_CANON.md` and `docs/AUDIO_PLATFORM_01_INTEGRATION_MAP.md` for project coverage, why a universal browser lock cannot govern a disconnected Mac/iPhone, and the nonwaivable release gates.

## Optional browser policy smoke test

After compiling the source, install or supply `playwright-core` and compatible Chrome/WebKit browser engines in a **disposable test environment**. Then run:

```bash
NODE_PATH=/path/to/playwright-core/node_modules node tests/audio-governance/browserPolicyWitness.cjs
```

It exercises 16 policy examples in each engine from `browser-policy.html`, without real sessions/audio/network. Its default Chrome binary path is the Mac Studio app; set `CHROME_BIN` to use another installed Chromium binary. **This test does not establish iPhone or native/browser audio focus, recording permissions, true lossless fidelity, an authorized streaming catalog, or actual runtime integration.**

Published source-owner status: [AUDIO-PLATFORM-01 issue #1984](https://github.com/SoullabTech/Sovereign/issues/1984) — no production source changes.
