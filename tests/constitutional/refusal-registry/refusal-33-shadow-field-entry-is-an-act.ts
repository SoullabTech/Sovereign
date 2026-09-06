import type { RefusalCheck } from './harness';

/**
 * Refusal 33 — Entry is an act, not a match; exit is immediate and writes nothing.
 *
 * Constitution v0.2 L1 (structural form) and L6, falsifiers F1, F2, F14.
 * No lexical, semantic, embedding, classifier or model-derived reading of member content
 * may activate the Field or admit a shadow frame. The route requires an explicit
 * member-authored activation act and never inspects `message` to decide that the Field
 * is open. Leaving is one gesture that produces no closing interpretation and no keep prompt.
 */

const ROUTE = 'app/api/maia/shadow-field/route.ts';

export const check: RefusalCheck = {
  id: 'R33',
  refusal:
    'Nothing a member says activates the Shadow Field — only an explicit member-authored activation act does; and leaving is immediate, silent about the room, and writes nothing',
  grade: 'Proposed',
  enforcedBy:
    'isMemberActivation() inspects only the typed activation object (act/authoredBy/participationClass/modality) and never the message; the exit branch returns a fixed acknowledgement before any model call',
  evidence:
    'route refuses with reason no_activation when the activation act is absent, whatever the member wrote',
  violationAttempted:
    'find a keyword table, regex over member text, classifier, or embedding call gating Field activation; or an exit path that interprets, prompts to keep, or asks a question',
  passingAuthorizes: 'the Field can be entered only by a member act, and left in one gesture',
  passingDoesNotAuthorize:
    'it does not establish that the offer contract is honoured (the Invoked entrance is absent in v1 — F3 is NOT EXERCISED, not passed)',
  hostileForkMustChange:
    'a fork wanting content-triggered shadow framing would have to add a reading of member text to the activation path, which this check names',
  run(io) {
    const route = io.read(ROUTE);

    // The activation predicate must not read the message.
    const pred = route.slice(
      route.indexOf('function isMemberActivation'),
      route.indexOf('function isMovement'),
    );
    if (pred && !/\bmessage\b/.test(pred)) {
      io.pass('the activation predicate never inspects member content');
    } else {
      io.fail('the activation predicate reads member content');
    }

    // No content-derived gate anywhere in the route.
    const gates = io
      .grep(
        "(message|body\\.message|input)[^\\n]*(includes\\(|match\\(|test\\(|toLowerCase\\(\\)[^\\n]*includes)",
        [ROUTE],
      )
      .filter((l) => !/^\S+:\d+:\s*(\/\/|\*)/.test(l));
    if (gates.length === 0) {
      io.pass('no lexical / regex gate over member content exists in the room');
    } else {
      io.fail('member content is being matched to make a decision', gates.slice(0, 3).join(' | '));
    }

    // Activation is required.
    if (/isMemberActivation\(body\.activation\)/.test(route) && /no_activation/.test(route)) {
      io.pass('a turn without a member activation act is refused');
    } else {
      io.fail('the route does not require a member activation act');
    }

    // Exit: immediate, fixed text, before any model call, nothing written.
    const exitIdx = route.indexOf('body.exit === true');
    const modelIdx = route.indexOf('anthropic.messages.create');
    if (exitIdx > 0 && exitIdx < modelIdx && /SHADOW_FIELD_EXIT_TEXT/.test(route)) {
      io.pass('exit returns a fixed acknowledgement before any model call');
    } else {
      io.fail('exit does not short-circuit before the model call');
    }
  },
};
