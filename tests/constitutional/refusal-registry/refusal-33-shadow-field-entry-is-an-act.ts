import type { RefusalCheck } from './harness';

/**
 * Refusal 33 — Entry is an act, not a match; exit is immediate and writes nothing.
 *
 * Constitution v0.2 L1 (structural form) and L6, falsifiers F1, F2, F14.
 * No lexical, semantic, embedding, classifier or model-derived reading of member content
 * may activate the Field or admit a shadow frame. The route requires an explicit
 * member-authored activation act and never inspects `message` to decide that the Field
 * is open. Leaving is one gesture that produces no closing interpretation and no keep prompt.
 *
 * P5-C1 (founder, 2026-09-06). An earlier version of this check was too weak: it proved
 * that exit short-circuits before the model and that an activation act is required, but
 * never that a CLOSED sitting makes a subsequent turn impossible. It did not, and replaying
 * an old activation object with a dead token still reached the model. Leaving must end
 * Field conversation authority, so a live server-held sitting is now required for every
 * non-exit turn, with no client Sanctuary fallback.
 */

const ROUTE = 'app/api/maia/shadow-field/route.ts';
const HOUSE = 'lib/navigation/houseDestinations.ts';
const PLACE = 'app/maia/shadow-field/page.tsx';

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

    // P5-C1: a live server-held sitting is required to reach the model at all.
    const gateIdx = route.indexOf('verifyFieldSession');
    const refuseIdx = route.indexOf('no_field_session');
    const modelCall = route.indexOf('anthropic.messages.create');
    if (gateIdx > 0 && refuseIdx > 0 && refuseIdx < modelCall) {
      io.pass('a turn without a live server-held sitting refuses before the model call');
    } else {
      io.fail('a closed or missing sitting can still reach the model — Leave is not real');
    }

    // No client Sanctuary fallback on the turn path.
    if (/const sanctuary = field\.sanctuary/.test(route) && !/body\.sanctuary/.test(route)) {
      io.pass('turn Sanctuary comes from the server sitting, with no client fallback');
    } else {
      io.fail('the turn route still falls back to a client-asserted Sanctuary');
    }

    // Exit is ownership-bound: only a member's own verified sitting is closed.
    const exitBlock = route.slice(route.indexOf('body.exit === true'), route.indexOf('isMemberActivation(body.activation)'));
    if (/verifyFieldSession/.test(exitBlock) && /if \(leaving\)/.test(exitBlock)) {
      io.pass('exit closes only the member\'s own verified sitting');
    } else {
      io.fail('exit can close a sitting without verifying ownership');
    }

    // P3-R1 (founder, 2026-09-06): the entrance must actually be REACHABLE, and arriving
    // must not be entering. The gates previously proved the activation act was required
    // while the door itself was unreachable from current navigation — a Field nobody can
    // reach passes every other check in this file.
    const house = io.read(HOUSE);
    if (/id: 'shadow-field'/.test(house) && /route: '\/maia\/shadow-field'/.test(house)) {
      io.pass('the Shadow Field is a member-chosen place in the House');
    } else {
      io.fail('the Field has no reachable entrance in the House navigation');
    }

    if (io.exists(PLACE)) {
      const place = io.read(PLACE);
      // Arriving renders Arrival; it must not perform the activation act for the member.
      if (!/shadow-field\/enter|member_entered_shadow_field|openFieldSession/.test(place)) {
        io.pass('arriving at the place does not enter the Field — Enter remains the member act');
      } else {
        io.fail('the place activates the Field on arrival');
      }
    } else {
      io.fail('the Shadow Field place does not exist', PLACE);
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
