# Capturing the true shipped arrival

The before-state witness must be a **browser capture of the running app**, not a reproduction.
`reference-shipped.html` shares the assumptions of the person who reproduced it and cannot serve
as evidence of what is live. This procedure produces the real thing.

⛔ Not runnable in the Claude Code web container: `node_modules` is absent, the app needs env and
a database, and production runs on minisforum. Run it from the **Mac Studio**.

## Both phases must be captured

`/signin` opens on the **password** phase and `/signup` on the **email** phase
(`UnifiedAuth.tsx:185`, commit `44b7a52`). Capturing only one leaves the exploration's original
blind spot in place. The script below takes both, plus `/signin?username=demo` for the
*"Welcome back, {name}."* variant.

## Against a local dev server

```bash
cd ~/MAIA-SOVEREIGN            # or the worktree you are testing
npm install                    # if needed
npm run dev                    # serves on :3000
# then, in another shell:
node docs/design/arrival/capture-arrival.mjs http://localhost:3000 ./out
```

## Against production

Read-only; it loads the sign-in surface and takes pictures. It submits nothing.

```bash
node docs/design/arrival/capture-arrival.mjs https://soullab.life ./out
```

## What to compare

Put each capture beside the matching Treatment D render (`shots-d/`) and answer only these:

```
Can I immediately tell where I am?
Do I understand what is being asked of me?
Does the page feel held without feeling theatrical?
Is there one obvious next action?
Do alternative entry methods remain findable without becoming the encounter?
Does reduced motion change no meaning?
```

Two things only the real capture can settle, both raised in `DOORS_AND_PHASES_2026-08-28.md`:

- **Does the biometric button arrive after first paint,** and does the stack reflow when it does?
  `bioAvailable` is set by an async check after mount, so this depends on real WebAuthn latency.
- **Does the settling gesture read as perception settling or as an interface animating?** The
  founder's ruling is to judge this on a physical device, not against the nominal duration.

## Physical device

The headless renders are not a substitute. Serve the branch on the LAN
(`npm run dev -- -H 0.0.0.0`), open it on the phone, and look at both phases in daylight and in a
dark room. The iOS WebView traps in `CLAUDE.md` — `SameSite=Lax` cookies, static-export route
exclusions — apply to the app, not to these static files, but the *feel* of the threshold is only
knowable there.
