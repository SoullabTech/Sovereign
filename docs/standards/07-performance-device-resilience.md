# Standard 7: Performance and Device Resilience

> Talk-first only works if it feels effortless. Latency, jank, and battery drain break the spell of presence.

## Purpose

Define performance budgets, graceful degradation, and device-specific rules so the spatial shell and voice-first experience work reliably across desktop, mobile web, and Capacitor/iOS builds.

## Non-Negotiable Rules

### R1. No animation may block interaction
All animations (particles, glow shifts, calm mode transitions, rail breath) must run on the compositor thread (transform, opacity only). No animation may cause layout reflow. If an animation drops below 30fps on a mid-range device, it must degrade gracefully.

### R2. Voice state updates must be throttled
Voice amplitude updates from `onAudioLevelChange` fire at ~60Hz. These must be throttled to 10-15Hz before reaching React state. Use `requestAnimationFrame` batching or a debounce — never raw setState per audio frame.

### R3. Calm mode transitions must not cause paint flash
Opacity transitions on fixed elements (top bar, left rail) must use `will-change: opacity` and avoid triggering repaint of child elements. Test specifically in Safari/WebKit where `backdrop-blur` + opacity transitions can cause visual glitches.

### R4. Center field particles must respect reduced motion
Check `prefers-reduced-motion` media query. When active: disable particle animations, disable glow color shifts, keep static atmospheric background. Calm mode still works (opacity only).

### R5. Right panel animations must not shift center content during voice flow
The `marginRight` transition on the center field `<main>` element must not cause visible content reflow during active conversation. Consider using `transform: translateX` instead of `margin` for smoother panel transitions.

## Performance Budgets

| Metric | Budget | Current Estimate |
|--------|--------|-----------------|
| Time to interactive (spatial shell) | < 2s | ~1.5s (page.tsx mounts, flag gates) |
| Calm mode fade latency | < 50ms to start, 500ms to complete | 500ms CSS transition — OK |
| Chrome reveal latency | < 100ms | ~0ms (immediate setCalmMode(false)) — OK |
| Voice command → world transition | < 200ms | ~50ms (event dispatch + setState) — OK |
| Right panel open animation | < 300ms | Spring ~250ms — OK |
| Particle render (30 elements) | < 2ms per frame | Needs measurement |
| Memory (spatial shell overhead) | < 5MB additional | Needs measurement |

## Device-Specific Concerns

### Desktop (Chrome, Firefox, Safari)
- **Status**: Primary target. No known issues.
- **Risk**: Safari `backdrop-blur` + `overflow-hidden` interaction (documented in page.tsx comments).
- **Mitigation**: Already handled — `overflow-hidden` on inner wrapper, not outer div.

### Mobile Web (iOS Safari, Android Chrome)
- **Status**: Functional but not yet optimized.
- **Risks**:
  - Left rail always visible — consumes 56px on narrow viewports
  - Safe area insets need testing with spatial shell layout
  - Touch targets on rail icons may be too small (40x40, minimum should be 44x44)
- **Mitigation**: Phase 9 mobile pass. For now: acceptable on tablet, cramped on phone.

### Capacitor/iOS (WKWebView)
- **Status**: Not tested with spatial shell.
- **Risks**:
  - `SameSite=Lax` cookie issue (documented in CLAUDE.md) — affects auth, not layout
  - `backdrop-blur-xl` opacity transition may render as invisible in WKWebView
  - Fixed positioning may behave differently with iOS keyboard
  - `env(safe-area-inset-*)` must be tested with notch/dynamic island
- **Mitigation**: Test before enabling flag in Capacitor builds. May need Capacitor-specific CSS overrides.

## Graceful Degradation Rules

| Condition | Degradation |
|-----------|-------------|
| `prefers-reduced-motion: reduce` | Static particles, no glow animation, calm mode opacity only |
| Low-power mode (if detectable) | Reduce particle count to 10, disable amplitude-driven effects |
| Viewport < 768px | Hide left rail, use bottom navigation or collapse to hamburger (Phase 9) |
| No Web Speech API | Voice commands unavailable, all navigation via rail/panel only |
| Slow connection | No impact (spatial shell is client-only, no network calls) |

## Current Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| No `prefers-reduced-motion` check | MEDIUM | Add media query check in MaiaCenterField, disable particle animations |
| Voice amplitude not throttled (currently hardcoded to 0) | LOW | When wired, must use rAF batching |
| Touch targets on rail may be too small for mobile | LOW | Increase from w-10 h-10 to w-11 h-11 on mobile viewports |
| Right panel uses marginRight (causes reflow) | LOW | Consider transform-based offset for smoother animation |
| No Capacitor/iOS testing | MEDIUM | Test before enabling flag in Capacitor builds |
| No performance measurement tooling | LOW | Add Lighthouse CI or manual performance budget checks |

## Anti-Patterns

| Anti-pattern | Why it's wrong | What to do instead |
|-------------|----------------|-------------------|
| Raw setState on every audio frame | Causes 60 re-renders/sec, drops frames | Throttle to 10-15 Hz via rAF |
| Layout-triggering animations (margin, padding, width) | Causes reflow, visible jank | Use transform and opacity only |
| Particle count that scales with viewport | Unpredictable performance | Fixed count (30), reduce on low-power |
| Ignoring reduced-motion preference | Accessibility violation | Check and respect the preference |

## Acceptance Criteria

- [ ] `prefers-reduced-motion` respected in MaiaCenterField
- [ ] Amplitude updates throttled when wired (not raw setState)
- [ ] Calm mode transitions tested in Safari (no backdrop-blur glitch)
- [ ] Touch targets meet 44x44 minimum on mobile
- [ ] Right panel transition doesn't cause visible content shift during voice
- [ ] Spatial shell tested in Capacitor/iOS before flag defaults on in mobile builds

## Recommended Sequence

1. Add `prefers-reduced-motion` check to MaiaCenterField
2. Test calm mode in Safari (backdrop-blur + opacity)
3. Measure particle render cost (Chrome DevTools Performance tab)
4. Test spatial shell in Capacitor/iOS simulator
5. Wire amplitude with rAF throttling when ready
6. Mobile viewport pass (Phase 9)
