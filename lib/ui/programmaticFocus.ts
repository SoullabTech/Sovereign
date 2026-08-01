/**
 * One policy for programmatic focus, shared by every call site that focuses the
 * composer without the member having tapped it.
 *
 * WHY THIS EXISTS
 *
 * On iOS the soft keyboard is raised only by a `.focus()` that runs
 * synchronously inside a real user gesture. A programmatic focus — React's
 * `autoFocus`, a `setTimeout` after a state change, an effect that fires when
 * processing ends — is honoured as *focus* but not as *intent to type*: the
 * textarea becomes `document.activeElement` and no keyboard appears.
 *
 * That leaves a false focused state, and the false state is the actual defect:
 * a tap on an already-focused element does not reliably produce a focus
 * transition, so the member's next tap raises nothing. They tap the composer
 * repeatedly and the app appears frozen.
 *
 * RULING (Kelly, 2026-08-01): touch and desktop have different input contracts.
 * Desktop autofocus is useful and predictable and is preserved unchanged. On
 * touch, the first tap must be the member's own intentional transition into
 * writing — so no programmatic focus at all.
 *
 * Note that a gesture-initiated handler is NOT automatically safe. Every deferred
 * focus (`setTimeout(() => ref.focus(), 100)`) breaks the gesture chain, so iOS
 * treats it as programmatic even though a tap started it. Those sites need this
 * predicate too.
 */

/**
 * True where a focus call the member did not ask for is safe to make — i.e.
 * anywhere that is not a known touch device.
 *
 * Deliberately phrased as "not coarse" rather than "is fine": this predicate
 * *withholds* existing desktop behaviour, so it should only withhold where the
 * device is positively known to be touch. A hybrid machine reporting a fine
 * primary pointer keeps its autofocus.
 *
 * Returns false during SSR — there is nothing to focus there, and any caller
 * reaching this on the server should not be focusing anything.
 */
export function canProgrammaticallyFocus(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches !== true;
}
