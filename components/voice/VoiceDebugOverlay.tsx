'use client';

/**
 * VoiceDebugOverlay
 *
 * Bottom-left fixed-position diagnostic panel that surfaces the voice
 * debug bus contents to the screen. Renders only on Capacitor native
 * builds; on web (including PWA) returns null so production users
 * never see it.
 *
 * Built 2026-05-15 for PR 10 — tester-facing diagnostic for Android
 * voice failure modes (Samsung Galaxy Tab silent-dead-state, Tara
 * round 5). Pairs with lib/voice/voiceDebugBus.ts.
 *
 * UI design:
 *   - 280px max width, 200px max height (~12 lines visible)
 *   - Fixed bottom-left, z-index just below modal layer
 *   - Pointer-events: none — never blocks touch interaction with mic
 *   - Monospace font, 9pt — readable in a phone screenshot
 *   - Amber title, mint body — distinguishable from app chrome
 *
 * Removal: once Android voice path is stable, set ENABLED to false
 * (or delete the mount point in OracleConversation). The bus itself
 * has zero cost when no overlay is mounted — pushVoiceDebug still
 * console.logs, but nothing accumulates if no listener exists.
 */

import { useEffect, useState } from 'react';
import { subscribeVoiceDebug } from '@/lib/voice/voiceDebugBus';

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Capacitor } = require('@capacitor/core');
    return Boolean(Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
}

export function VoiceDebugOverlay() {
  const [logs, setLogs] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only subscribe on Capacitor native — saves a render on web.
    if (!isCapacitorNative()) return;

    // OPT-IN, not automatic. This used to enable itself on every native build,
    // so a diagnostic panel sat permanently over the conversation for every
    // TestFlight member — covering MAIA's words and the Keep/Copy row beneath
    // them. A trace panel is an instrument for whoever is debugging, not
    // ambient chrome in the member's field; the sovereignty invariant is
    // observable on intent, invisible by default.
    //
    // Kept trivially reachable for the founder walk, since this panel is how
    // the mic-lifecycle defect was witnessed at all:
    //   localStorage.setItem('maia_voice_trace', '1')  → on, next launch
    //   localStorage.removeItem('maia_voice_trace')    → off
    let optedIn = false;
    try {
      optedIn = window.localStorage.getItem('maia_voice_trace') === '1';
    } catch {
      // Private mode / storage denied — stay off. Failing closed keeps the
      // member's field clean, which is the safer direction to fail.
    }
    if (!optedIn) return;

    setEnabled(true);
    const unsubscribe = subscribeVoiceDebug(setLogs);
    return unsubscribe;
  }, []);

  if (!enabled) return null;
  if (logs.length === 0) {
    // Render an empty stub so the overlay is visible (placeholder text)
    // before the first event fires. This is how testers confirm the
    // panel itself is present even when voice path hasn't been tapped.
    return (
      <div
        style={{
          position: 'fixed',
          // Sit above Android's system gesture bar + the in-app SOULLAB pill.
          // Tara's 2026-05-18 screenshot (Pixel 8a Android 16) showed the
          // lower 2–3 trace lines obscured by overlapping UI. ~140px clears
          // both on common Android devices.
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
          left: 8,
          zIndex: 99998,
          maxWidth: 280,
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.65)',
          color: 'rgba(252, 211, 77, 0.8)',
          borderRadius: 6,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 9,
          pointerEvents: 'none',
          border: '1px solid rgba(252, 211, 77, 0.25)',
        }}
      >
        VOICE TRACE — tap mic to begin
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        // Sit above Android's system gesture bar + the in-app SOULLAB pill.
        // Tara's 2026-05-18 screenshot (Pixel 8a Android 16) showed the
        // lower 2–3 trace lines obscured by overlapping UI. ~140px clears
        // both on common Android devices.
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
        left: 8,
        zIndex: 99998,
        maxWidth: 280,
        maxHeight: 200,
        overflow: 'auto',
        padding: '6px 8px',
        background: 'rgba(0, 0, 0, 0.78)',
        color: '#a7f3d0',
        borderRadius: 6,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 9,
        lineHeight: 1.3,
        pointerEvents: 'none',
        border: '1px solid rgba(167, 243, 208, 0.25)',
      }}
    >
      <div style={{ color: '#fcd34d', marginBottom: 2, fontWeight: 600 }}>
        VOICE TRACE
      </div>
      {logs.slice(-14).map((line, idx) => (
        <div
          key={`${idx}-${line}`}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
