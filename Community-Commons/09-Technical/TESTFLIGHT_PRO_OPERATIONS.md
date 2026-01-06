# TestFlight Pro Operations Guide

Advanced guide for release engineering, automation internals, and deep debugging.

---

## 1) Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TestFlight Pipeline                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Local Build]                                                  │
│       │                                                         │
│       ▼                                                         │
│  scripts/deploy-testflight.sh                                   │
│       │                                                         │
│       ├─► Clean (.next, out, node_modules/.cache, ios/App/build)│
│       ├─► CAPACITOR_MODE=beta npx cap sync ios                  │
│       ├─► xcodebuild archive                                    │
│       ├─► xcodebuild -exportArchive (uploads to ASC)            │
│       │                                                         │
│       ▼                                                         │
│  [App Store Connect]                                            │
│       │                                                         │
│       ├─► Processing (5-30 min)                                 │
│       ├─► Export Compliance                                     │
│       ├─► Assign to Test Groups                                 │
│       │                                                         │
│       ▼                                                         │
│  [TestFlight App]                                               │
│       │                                                         │
│       ▼                                                         │
│  [Tester Device] ──► [GitHub Issue] ──► [Auto-Label Workflows]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2) Deploy Script Internals

### Location
`scripts/deploy-testflight.sh`

### Key Environment Variables
```bash
CAPACITOR_MODE=beta        # Loads from soullab.life remote server
NODE_ENV=production        # Production optimizations
APPSTORE_API_KEY_ID        # App Store Connect API key ID
APPSTORE_ISSUER_ID         # App Store Connect Issuer ID
APPSTORE_API_KEY_PATH      # Path to .p8 key file
```

### Command Line Options
```bash
./scripts/deploy-testflight.sh              # Full pipeline
./scripts/deploy-testflight.sh --build-only # Build IPA, don't upload
./scripts/deploy-testflight.sh --upload-only # Upload existing IPA
./scripts/deploy-testflight.sh --skip-build  # Use existing IPA
./scripts/deploy-testflight.sh --issuer ID   # Override issuer ID
```

### Auto-Clean Behavior
The script automatically removes stale build artifacts before Capacitor sync:
```bash
rm -rf .next out node_modules/.cache ios/App/build
```

This prevents ENOENT errors from deleted/renamed routes.

---

## 3) GitHub Automation Internals

### Workflow Files
```
.github/workflows/
├── auto-label-priority.yml      # P0/P1/P2 from Severity dropdown
└── auto-label-cause-buckets.yml # Keyword-based cause labels
```

### Priority Auto-Labeling Logic
**File:** `.github/workflows/auto-label-priority.yml`

Parses issue body for `### Severity` section, extracts the value, applies matching label:
```javascript
const match = body.match(/###\s*Severity\s*\n+([^\n]+)/i);
const priority = severityLine.startsWith("P0") ? "P0"
               : severityLine.startsWith("P1") ? "P1"
               : severityLine.startsWith("P2") ? "P2"
               : null;
```

Labels are **mutually exclusive** — changing severity removes old label, adds new one.

### Cause Bucket Auto-Labeling Logic
**File:** `.github/workflows/auto-label-cause-buckets.yml`

**Keywords → Labels:**
| Regex Pattern | Label |
|---------------|-------|
| `crash\|force close\|quit unexpectedly\|app closed\|fatal\|sigabrt\|exception` | `crash` |
| `bluetooth\|airpods\|carplay\|car audio\|headphones\|headset\|handsfree\|hfp\|a2dp` | `bluetooth` |
| `transcrib\|transcription\|listening\|didn't hear\|no words\|no transcript\|speech to text\|stt\|voice mode\|mic not working` | `voice` |
| `ui\|layout\|button\|toggle\|hidden\|overlap\|can.t find\|not visible\|tappable\|tap target\|sheet` | `ui` |

**Permissions (strict rule):**
```javascript
const hasSettingsPath = /(privacy\s*(&|and)\s*security|settings\s*→|settings\s*>)/.test(text);
const hasPermissionWord = /(permission|permissions|denied|not allowed|access denied)/.test(text);
const hasMicOrSpeech = /\b(microphone|speech recognition|mic permission|dictation|transcription|transcribe|voice typing)\b/.test(text);

// Only label if mic/speech mentioned AND (settings path OR permission word)
if ((hasSettingsPath && hasMicOrSpeech) || (hasPermissionWord && hasMicOrSpeech)) {
  labelsToAdd.add('permissions');
}
```

**Needs-Repro Detection:**
Flags issues where "Steps to reproduce" section is empty or contains only `n/a`, `none`, `unknown`, `idk`, or <25 characters.

### Label Colors
| Label | Hex | Visual |
|-------|-----|--------|
| P0 | `#B60205` | Red |
| P1 | `#D93F0B` | Orange |
| P2 | `#FBCA04` | Yellow |
| voice | `#1D76DB` | Blue |
| ui | `#A371F7` | Purple |
| permissions | `#0E8A16` | Green |
| bluetooth | `#2AA198` | Teal |
| crash | `#B60205` | Red |
| needs-repro | `#6A737D` | Gray |
| testflight | `#0969DA` | Blue |

### Re-sync Labels (idempotent)
```bash
./scripts/ensure-github-labels.sh
```

---

## 4) Code Hotspots for Debugging

### Voice Issues
| Symptom | Where to Look |
|---------|---------------|
| Mic doesn't start | `components/voice/ContinuousConversation.tsx` — check `startListening()` |
| Mic fails after MAIA speaks | Audio session timing — look for `onSpeechEnd` handlers |
| "Listening…" but no transcript | Permission check + `SFSpeechRecognizer` availability |
| Works without Bluetooth only | Audio route configuration — `AVAudioSession` category |

### UI Issues
| Symptom | Where to Look |
|---------|---------------|
| ? Help button not visible | `app/maia/page.tsx` — mode row layout (mobile: ~line 555, desktop: ~line 706) |
| Toggle hidden behind notch | Safe area insets — `env(safe-area-inset-top)` usage |
| VoiceHelpSheet won't open | `components/help/VoiceHelpSheet.tsx` — Framer Motion animation |

### Permission Issues
| Symptom | Where to Look |
|---------|---------------|
| Permission denied on first launch | iOS entitlements + Info.plist usage descriptions |
| Permission check returns false | `SFSpeechRecognizer.authorizationStatus()` / `AVAudioSession.recordPermission` |

---

## 5) Advanced Triage Patterns

### Batch Similar Issues
Use GitHub search operators:
```
is:open label:testflight label:voice -label:needs-repro
```
This finds voice issues with repro steps — batch fix these together.

### Identify Regression Patterns
Compare build numbers in issues:
```
is:open label:testflight label:P0 "build" in:body
```

### Find Bluetooth-Only Issues
```
is:open label:testflight label:bluetooth -label:permissions
```
These are likely audio route problems, not permission problems.

### Stale Issues (no activity)
```
is:open label:testflight updated:<2025-12-01
```

---

## 6) Release Engineering Checklist

### Pre-Release (before deploy)
- [ ] All P0 issues closed or deprioritized with reason
- [ ] P1 issues reviewed — acceptable to ship?
- [ ] `npm run preflight` passes
- [ ] `npm run smoke` passes
- [ ] Test core loop locally: Talk → MAIA speaks → Talk again

### Deploy
```bash
./scripts/deploy-testflight.sh
```

### Post-Deploy (App Store Connect)
- [ ] Build status: Processing → Ready
- [ ] Export Compliance answered
- [ ] Build assigned to Internal group
- [ ] Build assigned to External group (if applicable)
- [ ] "What to Test" pasted from templates

### Tester Notification
```
Build is ready. TestFlight → MAIA → pull to refresh → Update.
Please test: Talk transcribes → MAIA speaks → Talk again, plus ? Voice Help and Show/Hide Text toggle.
If anything fails, send device + iOS + build # + steps + screenshot/video.
```

### Post-Release Monitoring
- [ ] Check GitHub Issues for new P0/P1 within 24h
- [ ] Monitor Actions tab for workflow failures
- [ ] Respond to `needs-repro` issues within 48h

---

## 7) Customizing Workflows

### Add a New Cause Label
1. Create label in GitHub (or add to `scripts/ensure-github-labels.sh`)
2. Add keyword regex to `.github/workflows/auto-label-cause-buckets.yml`
3. Update triage runbook documentation

### Change Priority Colors
Edit `scripts/ensure-github-labels.sh` — the `ensure_label` calls define colors.

### Adjust Permissions Strictness
In `auto-label-cause-buckets.yml`, modify:
- `hasSettingsPath` — what counts as a Settings reference
- `hasPermissionWord` — what counts as a permission-related phrase
- `hasMicOrSpeech` — what synonyms count as mic/speech-related

### Disable Auto-Labeling
Delete or rename the workflow file. Or add a condition:
```yaml
if: github.event.issue.user.login != 'dependabot[bot]'
```

---

## 8) Troubleshooting Workflows

### "No Severity field found" in logs
The issue body format doesn't match the regex. GitHub issue forms render sections as:
```
### Severity

P1 - Voice flaky but usable
```
If the form structure changes, update the regex in `auto-label-priority.yml`.

### Labels not applying
1. Check **Actions** tab for workflow run status
2. Look for permission errors (workflow needs `issues: write`)
3. Verify label exists in repo (case-sensitive)

### Workflow not triggering
Ensure `on: issues: types: [opened, edited]` is present. Workflow only runs on issue events, not PR events.

---

## 9) Saved Queries (bookmark these)

```
# All open TestFlight bugs
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight

# Priority queues
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:P0+label:testflight
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:P1+label:testflight
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:P2+label:testflight

# Cause buckets
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+label:voice
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+label:bluetooth
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+label:permissions
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+label:crash
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+label:ui

# Needs attention
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+label:needs-repro
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight+no:assignee

# Recently closed (verify fixes)
https://github.com/SoullabTech/Sovereign/issues?q=is:closed+label:testflight+closed:>2025-01-01
```

---

## 10) Quick Reference

### Files
| File | Purpose |
|------|---------|
| `scripts/deploy-testflight.sh` | Build + upload pipeline |
| `scripts/ensure-github-labels.sh` | Idempotent label setup |
| `.github/workflows/auto-label-priority.yml` | P0/P1/P2 auto-labeling |
| `.github/workflows/auto-label-cause-buckets.yml` | Keyword-based labels |
| `.github/ISSUE_TEMPLATE/maia-testflight-bug.yml` | Issue form definition |
| `Community-Commons/03-Member-Guides/MAIA_TestFlight_Testing_Guide.md` | Tester guide |
| `Community-Commons/03-Member-Guides/MAIA_TestFlight_Triage_Runbook.md` | Team triage workflow |

### Commands
```bash
# Deploy to TestFlight
./scripts/deploy-testflight.sh

# Build only (no upload)
./scripts/deploy-testflight.sh --build-only

# Sync labels
./scripts/ensure-github-labels.sh

# Pre-flight checks
npm run preflight
npm run smoke
```

*Last updated: 2026-01-06*
