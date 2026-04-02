# Tier 1 Verification Checklists

> Manual verification steps for items that require browser/device testing.

---

## 1.4 Safari Calm Mode Verification

### Test Environment
- Safari on macOS (latest)
- Safari on iOS (if available)

### Steps

1. **Enable spatial shell**: In browser console:
   ```js
   localStorage.setItem('spiralogic-feature-flags', JSON.stringify({spatialMaiaShell: true}))
   ```
   Reload page.

2. **Verify calm mode engagement**:
   - The shell should display: left rail, top bar, center field, no right panel.
   - Simulate voice flow (currently via `hasActiveSession` — may need to start a conversation).
   - After ~1.5s of voice activity, top bar and left rail should fade to ~15% opacity.
   - **Check**: No flicker. No white flash. No backdrop-blur disappearance.

3. **Verify calm mode reveal**:
   - Move mouse pointer. Chrome should restore immediately.
   - **Check**: No delay. No z-index stacking issue. Buttons are clickable.

4. **Verify hover override**:
   - During calm mode, hover directly on the left rail.
   - **Check**: Rail becomes fully visible immediately (CSS hover override).
   - Same for top bar.

5. **Safari-specific risks**:
   - [ ] `backdrop-blur-xl` on top bar and left rail renders correctly during opacity transition
   - [ ] Fixed positioning of rail and top bar is stable (no iOS rubber-band shift)
   - [ ] No invisible click targets during calm mode (pointer-events restore properly)
   - [ ] No layout shift when right panel opens/closes

### Known Safari Issue
`overflow-hidden` combined with `backdrop-blur` on the same element renders as invisible in iOS Safari. The spatial shell uses separate elements for blur and overflow — verify this separation holds.

### Pass Criteria
All checkboxes above pass. No visual anomalies in calm mode transitions.

---

## 1.5 Capacitor/iOS Smoke Test

### Test Environment
- iOS Simulator via Capacitor build
- Or physical iOS device with TestFlight build

### Pre-requisites
- Spatial shell flag must be included in the Capacitor build
- New `/maia/*` world routes (if any added as actual routes) must be in MOBILE_MODE allowlist in `scripts/capacitor-patch-routes.sh`

### Steps

1. **Build for iOS**:
   ```bash
   npm run build:ios  # or scripts/build-ios.sh
   ```
   **Check**: Build succeeds without spatial shell component errors.

2. **Launch app and navigate to /maia**:
   - Enable spatial shell flag (may need to set in localStorage before build, or via dev tools).
   - **Check**: Left rail renders within safe area insets (not behind notch/dynamic island).
   - **Check**: Top bar respects `paddingTop: max(env(safe-area-inset-top), ...)`.

3. **Verify fixed positioning**:
   - [ ] Left rail stays fixed on scroll
   - [ ] Top bar stays fixed on scroll
   - [ ] Right panel (when opened) stays fixed and doesn't shift with keyboard

4. **Verify calm mode on iOS**:
   - Start a voice conversation.
   - [ ] Chrome fades without visual glitch
   - [ ] Touch on screen restores chrome (pointerdown event fires correctly in WKWebView)
   - [ ] No phantom touches or dead zones during calm mode

5. **Verify voice commands**:
   - Say "MAIA, open journal" during conversation.
   - [ ] World transition fires correctly
   - [ ] Right panel opens with journal content
   - [ ] No duplicate navigation or state corruption

6. **Verify OracleConversation stability**:
   - [ ] Conversation continues normally inside MaiaCenterField
   - [ ] Voice input/output works (mic, TTS playback)
   - [ ] No re-mount of OracleConversation when switching worlds

### Known Capacitor Issues
- `SameSite=Lax` cookies not sent from iOS WebView → auth uses `x-member-id` header via `apiFetch()`
- Some Next.js routes are excluded from Capacitor builds → verify spatial shell routes are not in exclusion list

### Pass Criteria
App launches, spatial shell renders correctly within safe areas, voice conversation works, world transitions work, no crashes.

---

## 1.6 Mock Cognition Isolation Confirmation

### Verification Steps

1. **Check NODE_ENV gate**:
   ```bash
   grep -n 'NODE_ENV' components/maia/MaiaShell.tsx
   ```
   Confirm: `const isDev = process.env.NODE_ENV === 'development'`
   Confirm: `if (!isDev) return;` before mock signal scheduling

2. **Verify production build**:
   ```bash
   NODE_ENV=production npx tsc --noEmit 2>&1 | grep MaiaShell
   ```
   Should produce zero errors.

3. **Verify no mock insights in production**:
   In production mode, `insights` state starts empty and never receives mock data.
   The `useEffect` that generates mocks returns immediately when `!isDev`.

4. **Check for hydration safety**:
   `isDev` is derived from `process.env.NODE_ENV` which is set at build time by Next.js.
   This is safe for SSR — the value is consistent between server and client.

### Pass Criteria
- [ ] `isDev` check present and correct
- [ ] Mock timer only runs in development
- [ ] Production build compiles clean
- [ ] No hydration mismatch from NODE_ENV check
