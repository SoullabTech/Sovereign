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
