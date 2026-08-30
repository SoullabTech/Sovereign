// MAIA Desktop — the member's draft. DSC-FINAL.
//
// The last MAIA semantic claim to leave the Electron composition root. It is
// two lines, and it is here because of what those two lines decide, not because
// of their size:
//
//   1. salvaged speech is ACCEPTED rather than declared lost
//   2. accepted salvage belongs to the member's UNFINISHED DRAFT,
//      never to a completed turn
//
// ⛔ WHY THIS MUST NOT LIVE IN THE HOST. The epoch asks a caller what to do with
// material it nearly lost, and the answer is not derivable from the epoch. A
// host that returns false makes the epoch report `voice_tail_lost` — speech the
// member almost said, gone, with only a diagnostic to mark it. A host that fed
// the text onward instead would do the opposite harm: promote a fragment the
// member never finished into words they are treated as having authored.
//
// Both mistakes are silent. Neither raises an error. The difference is only in
// the member's relationship to their own words, which is exactly the kind of
// meaning a replacement host must INHERIT rather than rediscover.
//
// ⛔ Salvage is not authorship. Material lands here so the MEMBER decides what
// to do with it. Nothing in this module dispatches a turn, calls MAIA, or
// commits an epoch, and nothing may be added that does.

'use strict';

/**
 * The member's unfinished material for one capture session.
 *
 * `accept` is the epoch's salvage sink: it takes the text and reports that the
 * disposition was honoured. Returning true is the decision — it is what stops
 * the epoch declaring the tail lost.
 */
function createMemberDraft() {
  const entries = [];
  return {
    accept(text) {
      entries.push(text);
      return true;
    },
    /** Read by the state projection. Depth only — never the text. */
    get length() { return entries.length; },
    get entries() { return [...entries]; },
  };
}

module.exports = { createMemberDraft };
