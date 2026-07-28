/**
 * Arrival threshold — lifecycle and surface ownership (#735 + #736).
 *
 * One problem, two symptoms, fixed together as one lifecycle:
 *
 * #736 (contract failure): MaiaArrivalField's onActivate promises "cross the
 * threshold without authoring speech", but the parent wired it ONLY to local
 * hasActivated — which the render gate ignores while shouldRenderArrival is
 * true (the gate is a disjunction; `shouldRenderArrival ||` is load-bearing
 * for the deliberate return from The House and must not be weakened). The
 * affordance fired, set its state, and the z-[90] layer stayed mounted:
 * there was no non-writing exit from Arrival.
 *
 * #735 (surface ownership): while Arrival owns the viewport, the underlying
 * composer surfaces (chat composer row, voice bar, the voice-mode "Text"
 * switch) were mounted but unreachable — elementFromPoint at their controls
 * resolves to Arrival — a false affordance visible through Arrival's field.
 * Ruled fix direction: ownership/lifecycle, NEVER z-index escalation (raising
 * the row above Arrival would put two live composers on screen at once).
 *
 * THE CONSTITUTIONAL CONSTRAINT (ruling, Kelly 2026-07-22, app/maia/page.tsx):
 * "A person is no longer arriving once they have spoken into the relationship."
 * Activation is NOT expression. The durable first-crossing marker may only be
 * written on member expression (markArrived); wiring "I'm ready" to markArrived
 * would silently collapse that ruling. The exit therefore goes through a
 * SESSION-SCOPED third member act (crossedWithoutSpeech) that dies with the
 * tab: the render yields now, and an unexpressed member still meets the
 * ceremony next visit.
 *
 * These are source-structure pins (same idiom as the neighbouring mobile
 * suites): they hold the wiring in place; behaviour of the derivation itself
 * is tested functionally in lib/maia/__tests__/arrivalState.test.ts, and the
 * on-device behaviour is gated on a physical-iPhone pass recorded on the PR.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const OC = readFileSync(
  join(__dirname, '..', 'components/OracleConversation.tsx'),
  'utf8'
);
const PAGE = readFileSync(
  join(__dirname, '..', 'app/maia/page.tsx'),
  'utf8'
);
const ARRIVAL_STATE = readFileSync(
  join(__dirname, '..', 'lib/maia/arrivalState.ts'),
  'utf8'
);

describe('#736 — the non-writing exit exists', () => {
  it('onActivate fires BOTH the local activation and the parent exit', () => {
    // The two must travel together: hasActivated alone cannot pass the gate
    // while shouldRenderArrival is true; onArrivalCrossed alone would leave
    // the greeting/right-branch state behind.
    const handler = OC.match(
      /onActivate=\{\(\) => \{[\s\S]*?\}\}/
    )?.[0];
    expect(handler).toBeDefined();
    expect(handler).toContain('setHasActivated(true)');
    expect(handler).toContain('onArrivalCrossed?.()');
  });

  it('the deliberate-return guard is NOT weakened: the gate keeps its disjunction', () => {
    // `shouldRenderArrival ||` exists so a member deliberately returning from
    // The House renders something. #736 exits by flipping the VALUE, never by
    // rewriting the gate.
    expect(OC).toMatch(
      /shouldRenderArrival \|\| \(!hasActivated && !isProcessing && !isResponding\)/
    );
  });

  it('the page wires the exit to the session-scoped crossing, NOT to markArrived', () => {
    expect(PAGE).toMatch(/onArrivalCrossed=\{crossArrivalWithoutSpeech\}/);
    expect(PAGE).not.toMatch(/onArrivalCrossed=\{markArrived\}/);
  });

  it('THE RULING HOLDS: the crossing callback never touches the durable marker', () => {
    const cb = PAGE.match(
      /const crossArrivalWithoutSpeech = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/
    )?.[0];
    expect(cb).toBeDefined();
    // It clears session-temporary state (a crossed invoked-return is over)...
    expect(cb).toContain('setArrivalCrossedWithoutSpeech(true)');
    expect(cb).toContain('setArrivalInvoked(false)');
    // ...and must NEVER record arrival durably. Activation is not expression.
    expect(cb).not.toContain('recordFirstArrival');
    expect(cb).not.toContain('setHasArrivedBefore');
  });

  it('markArrived remains the only writer of the durable first crossing', () => {
    const writers = PAGE.match(/recordFirstArrival\(\)/g) ?? [];
    expect(writers).toHaveLength(1);
    const markArrived = PAGE.match(
      /const markArrived = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/
    )?.[0];
    expect(markArrived).toContain('recordFirstArrival()');
  });

  it('the derivation feeds the third member act and keeps invoked-return supremacy', () => {
    expect(PAGE).toMatch(/crossedWithoutSpeech: arrivalCrossedWithoutSpeech/);
    // In the derivation itself, the member-invoked return wins over a prior
    // same-session crossing — #736 adds an exit, never subtracts the entry.
    const derive = ARRIVAL_STATE.match(
      /export function deriveShouldRenderArrival[\s\S]*?!crossedWithoutSpeech;\s*\n\}/
    )?.[0];
    expect(derive).toBeDefined();
    expect(derive).toContain('if (arrivalInvoked) return true;');
    expect(derive).toContain('crossedWithoutSpeech = false');
  });

  it('the session-scoped state is React state, never persisted', () => {
    expect(PAGE).toMatch(
      /const \[arrivalCrossedWithoutSpeech, setArrivalCrossedWithoutSpeech\] = useState\(false\)/
    );
    // No localStorage writes for the crossing — it dies with the tab.
    expect(PAGE).not.toMatch(/localStorage\.[gs]etItem\([^)]*[Cc]rossed/);
  });
});

describe('#735 — single composer ownership while Arrival owns the viewport', () => {
  // Suppression is visibility, not unmount: VoiceInteractionBar keeps its
  // slide-out draft in LOCAL state, and unmount/remount churns focus/effects.
  // `invisible` removes painting, hit-testing, focus order and the
  // accessibility tree while React state survives.

  it('the chat composer row hides under Arrival — and ONLY under Arrival', () => {
    // Keyed on shouldRenderArrival, never the legacy-greeting branch: during
    // the z-40 welcome overlay this composer is exactly how a member starts.
    expect(OC).toMatch(
      /fixed left-14 right-0 sm:inset-x-0 z-below-nav \$\{shouldRenderArrival \? 'invisible' : ''\}/
    );
  });

  it('the voice-mode "Text" escape hatch hides under Arrival', () => {
    // Does not strand anyone: during Arrival the member HAS a composer —
    // Arrival's own. The hatch exists for "the composer subtree didn't
    // render", and Arrival is not that state.
    expect(OC).toMatch(
      /fixed left-0 right-0 z-below-nav flex justify-center \$\{shouldRenderArrival \? 'invisible' : ''\}/
    );
  });

  it('VoiceInteractionBar is wrapped invisible, NOT unmounted (local draft survives)', () => {
    // [^>]* tolerates instrumentation attributes (the R1 lane's
    // ref={voiceBarWrapRef}) — the pin is the suppression class, not the
    // element's full attribute list.
    const vibMount = OC.match(
      /\{isMounted && voiceEnabled && !showChatInterface && \(\s*<div[^>]*className=\{shouldRenderArrival \? 'invisible' : undefined\}>\s*<VoiceInteractionBar/
    );
    expect(vibMount).not.toBeNull();
    // The mount condition itself must NOT gain a !shouldRenderArrival term —
    // that would be the unmount this pin exists to refuse.
    expect(OC).not.toMatch(
      /isMounted && voiceEnabled && !showChatInterface && !shouldRenderArrival/
    );
  });

  it('no z-index escalation anywhere in the fix', () => {
    // The ruled failure mode: raising the underlying row above Arrival's
    // z-[90] would create two competing composers. The composer containers
    // keep their layer (z-below-nav) and never claim 90+.
    const composerBlock = OC.match(
      /fixed left-14 right-0 sm:inset-x-0 z-below-nav[^\n]*/
    )?.[0];
    expect(composerBlock).toBeDefined();
    expect(composerBlock).not.toMatch(/z-\[9\d\]|z-\[1\d\d\]/);
  });
});
