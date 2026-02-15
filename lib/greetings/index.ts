/**
 * Greeting System — structured, governed, lane-based greetings.
 *
 * Entry point: chooseGreeting(signals, opts)
 *
 * See types.ts for the Greeting object shape.
 * See greetingScoring.ts for how lanes are scored.
 * See greetingStyle.ts for how style is chosen.
 * See greetingRender.ts for the actual words.
 * See greetingRouter.ts for the orchestrator.
 */

export { chooseGreeting } from './greetingRouter';
export type { Greeting, GreetingLane, GreetingStyle, GreetingSignals } from './greetingRouter';
export type { GreetingSafety, GreetingMemoryRef } from './types';
export { scoreLane } from './greetingScoring';
export { chooseGreetingStyle } from './greetingStyle';
export { renderGreeting } from './greetingRender';
