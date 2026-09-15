/**
 * JR-01 — Paired Relational Perturbation Corpus v0.
 *
 * Twelve IMPLEMENTED distinctions, frozen 2026-09-15 against `3909be96`.
 * ⛔ The documented-but-unimplemented Authority × Time material is deliberately
 * EXCLUDED: `valid_from` appears in zero TypeScript files, so there is no rule to
 * derive an answer key from (L3).
 *
 * Presentation convention: `a` and `b` are in PRESENTATION order. `order: 'AB'`
 * means the baseline condition is shown first; `'BA'` means the perturbed condition
 * is shown first. Orders alternate so position carries no signal (L4).
 */
import type { Corpus, Operator } from './corpusContract.ts';
import { weakestGrounding } from './corpusContract.ts';

const op = (o: Omit<Operator, 'grounding'>): Operator =>
  ({ ...o, grounding: weakestGrounding(o.citations) });

// ─────────────────────────────────────────────────────────────────────────────
// R01 — withheld though qualified  ≠  not qualified
// ─────────────────────────────────────────────────────────────────────────────
const R01 = op({
  id: 'R01',
  distinction: 'Kept out by a restraint the person controls, versus never admissible at all.',
  keys: ['withheld', 'not_admissible'],
  citations: [
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the adjudication loop: every exclusion branch is evaluated and `continue`s before the first restraint branch is reached',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that this ordering governs the response a member receives — CMT-01 M3 is unauthorized and legacy assembly still produces the turn' },
    { path: 'lib/maia/canonical-turn/participationDisposition.ts',
      operation: 'HELD_REASONS and EXCLUDED_REASONS declared as closed, disjoint families per final state',
      grounding: 'contract_only',
      doesNotEstablish: 'that any runtime surface reports which family fired' },
  ],
  doesNotEstablish: 'that the model represents the distinction internally, or that it would hold under a reordering of the two conditions in a longer context',
  pairs: [
    { id: 'R01.identity_control.AB', operatorId: 'R01', cell: 'identity_control', order: 'AB',
      a: { text: 'Dana keeps a private notebook inside the companion app. Today Dana switched the session to private mode. A note Dana wrote last week is not brought into the conversation. Dana is signed in and the note is Dana\'s own. Is the note being kept back by a setting Dana controls, or is it something the system could never bring in for Dana at all?',
           key: 'withheld', because: 'private mode is a restraint branch; the note passed every admissibility branch first' },
      b: { text: 'Dana keeps a private notebook inside the companion app. Today Dana switched the session to private mode. A note Dana wrote last week is not brought into the conversation. The note is Dana\'s own and Dana is signed in. Is the note being kept back by a setting Dana controls, or is it something the system could never bring in for Dana at all?',
           key: 'withheld', because: 'identical situation, identical rule branch' } },

    { id: 'R01.paraphrase_control.BA', operatorId: 'R01', cell: 'paraphrase_control', order: 'BA',
      a: { text: 'A gardener uses a shared logbook. The logbook has a "quiet visit" switch, which the gardener turned on before walking in. An entry the gardener made in spring is not read aloud during the visit. The gardener is a recognised keyholder and wrote the entry. Is the entry being kept back by the switch the gardener set, or is it an entry that could never be read to this gardener?',
           key: 'withheld', because: 'quiet-visit maps to the restraint branch; keyholder status already satisfied admissibility' },
      b: { text: 'Dana switched the companion app to private mode. A note Dana wrote last week stays out of today\'s conversation. Dana is signed in and the note is Dana\'s own. Is a setting Dana controls holding the note back, or could the system never bring that note in for Dana?',
           key: 'withheld', because: 'same rule branch under different surface' } },

    { id: 'R01.relational_perturbation.AB', operatorId: 'R01', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'Dana is signed in. A note Dana wrote last week is not brought into the conversation, because Dana switched this session to private mode. Is the note being kept back by a setting Dana controls, or is it something the system could never bring in for this visitor?',
           key: 'withheld', because: 'restraint branch, reached only after admissibility passed' },
      b: { text: 'Dana is not signed in — the app has an anonymous visitor. A note stored under a signed-in account is not brought into the conversation. Is the note being kept back by a setting the visitor controls, or is it something the system could never bring in for this visitor?',
           key: 'not_admissible', because: 'identity mismatch is an exclusion branch and fires before any restraint is consulted' },
      sameObservableSurface: 'in both, the note contributes nothing to the conversation and the transcript is identical' },

    { id: 'R01.generalization.BA', operatorId: 'R01', cell: 'generalization', order: 'BA',
      a: { text: 'A reading room admits anyone holding a reader\'s card. A visitor with no card asks for a manuscript kept for cardholders. The manuscript is not brought out. Is the manuscript being kept back by a preference the visitor set, or is it one that could never be brought out to this visitor?',
           key: 'not_admissible', because: 'no card = admissibility failure, decided before any preference' },
      b: { text: 'A cardholder asks the reading room for a manuscript, then writes "not today" on the request slip — a line the room honours. The manuscript is not brought out. Is it kept back by something the cardholder chose, or is it one that could never be brought out to this cardholder?',
           key: 'withheld', because: 'admissibility satisfied; a self-imposed restraint kept it back' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R02 — explicit placement ≠ retrieval
// ─────────────────────────────────────────────────────────────────────────────
const R02 = op({
  id: 'R02',
  distinction: 'Identical words carry a different participation mechanism depending on how they arrived.',
  keys: ['put_there_by_person', 'fetched_by_system'],
  citations: [
    { path: 'lib/maia/canonical-turn/participationDisposition.ts',
      operation: 'PARTICIPATION_CLASS declares `placed` and `retrieved` as separate members of one closed axis',
      grounding: 'contract_only',
      doesNotEstablish: 'that the two are distinguishable in any log or member-visible surface today' },
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the admitted-reason assignment, which reads `member_placed` off the participation class rather than off the text',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that a response differs between the two cases' },
  ],
  doesNotEstablish: 'that the mechanism survives into the generated answer, only that the rule keeps them apart',
  pairs: [
    { id: 'R02.identity_control.BA', operatorId: 'R02', cell: 'identity_control', order: 'BA',
      a: { text: 'Before asking a question, Ines pasted a paragraph from her own diary into the message box. The paragraph reads: "The hallway smelled of rain." How did that paragraph come to be part of this exchange — did Ines put it there, or did the system go and find it?',
           key: 'put_there_by_person', because: 'the person performed the placement act' },
      b: { text: 'Ines copied a paragraph out of her diary and pasted it into her message before asking her question. It reads: "The hallway smelled of rain." Did Ines put that paragraph into the exchange, or did the system go and find it?',
           key: 'put_there_by_person', because: 'identical mechanism' } },

    { id: 'R02.paraphrase_control.AB', operatorId: 'R02', cell: 'paraphrase_control', order: 'AB',
      a: { text: 'Ines pasted a diary paragraph into her message: "The hallway smelled of rain." Did she put it into the exchange, or did the system go and find it?',
           key: 'put_there_by_person', because: 'placement by the person' },
      b: { text: 'A researcher walks into a consultation carrying one page torn from her own field notebook and lays it on the table before she speaks. The page says: "The hallway smelled of rain." Did the researcher put that page on the table, or did the archive fetch it?',
           key: 'put_there_by_person', because: 'same mechanism, wholly different surface' } },

    { id: 'R02.relational_perturbation.AB', operatorId: 'R02', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'Ines pasted a paragraph into her message before asking her question: "The hallway smelled of rain." The companion\'s answer then discusses that paragraph. Did Ines put the paragraph into this exchange, or did the system go and find it?',
           key: 'put_there_by_person', because: 'placement act by the person' },
      b: { text: 'Ines asked her question with nothing attached. While preparing an answer the companion searched her past entries and pulled in a paragraph: "The hallway smelled of rain." The companion\'s answer then discusses that paragraph. Did Ines put the paragraph into this exchange, or did the system go and find it?',
           key: 'fetched_by_system', because: 'the same characters arrived by retrieval; the text cannot decide the mechanism' },
      sameObservableSurface: 'the paragraph sitting in the answer\'s context is byte-identical in both cases' },

    { id: 'R02.generalization.BA', operatorId: 'R02', cell: 'generalization', order: 'BA',
      a: { text: 'A solicitor, preparing advice, has a clerk pull an old letter from storage. The letter is quoted in the advice. Did the client hand over that letter for this matter, or did the office retrieve it?',
           key: 'fetched_by_system', because: 'retrieval by the office' },
      b: { text: 'A client arrives at the solicitor\'s office and hands over an old letter, asking for advice about it. The letter is quoted in the advice. Did the client hand it over for this matter, or did the office retrieve it?',
           key: 'put_there_by_person', because: 'placement by the person' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R03 — situating context ≠ derived proposition
// ─────────────────────────────────────────────────────────────────────────────
const R03 = op({
  id: 'R03',
  distinction: 'Material admitted only to orient the encounter does not become a fact about the person by resembling one.',
  keys: ['orienting_only', 'derived_guess'],
  citations: [
    { path: 'lib/maia/canonical-turn/participationDisposition.ts',
      operation: 'the AUTHORITY axis (`situate` · `compute` · `infer`) declared orthogonal to authorship and to participation class',
      grounding: 'contract_only',
      doesNotEstablish: 'that anything downstream reads the axis when composing a sentence' },
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the inference cap, which counts admitted `infer`-authority producers and holds the surplus',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that a capped inference is visibly marked to the member' },
  ],
  doesNotEstablish: 'that a model asked to WRITE (rather than classify) would preserve the distinction in its prose',
  pairs: [
    { id: 'R03.identity_control.AB', operatorId: 'R03', cell: 'identity_control', order: 'AB',
      a: { text: 'A companion is told, as background for the conversation, that the person is writing at night this week. It uses this only to pitch the conversation\'s tone. Is "writing at night this week" being used to set the scene, or is it a conclusion the companion worked out about the person?',
           key: 'orienting_only', because: 'admitted to situate, not asserted' },
      b: { text: 'A companion is told, as background for the conversation, that the person is writing at night this week. It uses this only to pitch the tone of the conversation. Is \'writing at night this week\' being used to set the scene, or is it a conclusion the companion worked out about the person?',
           key: 'orienting_only', because: 'identical use' } },

    { id: 'R03.paraphrase_control.BA', operatorId: 'R03', cell: 'paraphrase_control', order: 'BA',
      a: { text: 'A stage manager is told the house is half full tonight, and uses that only to decide how loudly to call the cues. Is "the house is half full" setting the conditions for the work, or is it a judgement the stage manager formed about the audience?',
           key: 'orienting_only', because: 'used to situate the act, not asserted about anyone' },
      b: { text: 'A companion is told, as background, that the person has been writing at night this week, and uses it only to pitch the conversation\'s tone. Is that setting the scene, or a conclusion the companion reached about the person?',
           key: 'orienting_only', because: 'same use under a different surface' } },

    { id: 'R03.relational_perturbation.AB', operatorId: 'R03', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'A companion is given, as background for the conversation, the sentence "the person has been writing at night this week." It uses the sentence only to pitch its tone and never states it back. Is that sentence setting the scene, or is it something the companion worked out about the person?',
           key: 'orienting_only', because: 'situating authority: admitted to orient, never asserted' },
      b: { text: 'A companion notices that three of the person\'s recent entries were saved after midnight and produces the sentence "the person has been writing at night this week." It uses the sentence to pitch its tone and never states it back. Is that sentence setting the scene, or is it something the companion worked out about the person?',
           key: 'derived_guess', because: 'the same sentence, produced by derivation, carries inference authority however it is used' },
      sameObservableSurface: 'the identical sentence sits in the companion\'s working context and is never spoken aloud in either case' },

    { id: 'R03.generalization.BA', operatorId: 'R03', cell: 'generalization', order: 'BA',
      a: { text: 'A weather service, seeing three days of falling pressure, produces the line "a storm is forming over the bay" and files it. Is that line a given condition of the forecast, or a conclusion the service drew?',
           key: 'derived_guess', because: 'produced by derivation from observations' },
      b: { text: 'A weather service is handed the line "a storm is forming over the bay" by the harbour master and files it as a condition it must work within. Is that line a given condition, or a conclusion the service drew?',
           key: 'orienting_only', because: 'received as a condition, not derived' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R04 — authorship ≠ mechanism of arrival
// ─────────────────────────────────────────────────────────────────────────────
const R04 = op({
  id: 'R04',
  distinction: 'Two orthogonal axes: who wrote it, and how it got here. Fetching cannot overwrite authorship.',
  keys: ['written_by_person', 'written_by_system'],
  citations: [
    { path: 'lib/maia/canonical-turn/participationDisposition.ts',
      operation: 'AUTHORED_BY and PARTICIPATION_CLASS declared as separate axes, with the ruling that a scalar epistemic class conflated them',
      grounding: 'contract_only',
      doesNotEstablish: 'that any store records both axes for an existing memory row' },
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: '`axesOf`, which copies all three axes onto every manifest entry regardless of disposition',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that the axes are read back anywhere outside the manifest' },
  ],
  doesNotEstablish: 'that the model tracks authorship across a long transcript, only across an adjacent pair',
  pairs: [
    { id: 'R04.identity_control.BA', operatorId: 'R04', cell: 'identity_control', order: 'BA',
      a: { text: 'A search over stored material returns the line "I stopped apologising for the noise." The line was typed by the person months ago. Who wrote that line?',
           key: 'written_by_person', because: 'authorship is fixed by who typed it' },
      b: { text: 'Stored material is searched and returns "I stopped apologising for the noise," a line the person typed months ago. Who wrote it?',
           key: 'written_by_person', because: 'identical' } },

    { id: 'R04.paraphrase_control.AB', operatorId: 'R04', cell: 'paraphrase_control', order: 'AB',
      a: { text: 'A search returns "I stopped apologising for the noise," typed by the person months ago. Who wrote that line?',
           key: 'written_by_person', because: 'authorship by the person' },
      b: { text: 'A museum catalogue lookup surfaces a caption card. The card was lettered by the donor herself when she gave the object. Who wrote the caption?',
           key: 'written_by_person', because: 'same authorship relation, unrelated surface' } },

    { id: 'R04.relational_perturbation.AB', operatorId: 'R04', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'A search over stored material returns the line "I stopped apologising for the noise." The line is a sentence the person typed into the app months ago and it was saved as typed. The search is what brought it back today. Who wrote the line?',
           key: 'written_by_person', because: 'retrieval is the mechanism; authorship is unchanged by it' },
      b: { text: 'A search over stored material returns the line "I stopped apologising for the noise." The line is a summary the app composed months ago from several of the person\'s entries, and it was saved as composed. The search is what brought it back today. Who wrote the line?',
           key: 'written_by_system', because: 'same mechanism, different author; the two axes move independently' },
      sameObservableSurface: 'identical retrieved string, identical retrieval path, identical storage shape' },

    { id: 'R04.generalization.BA', operatorId: 'R04', cell: 'generalization', order: 'BA',
      a: { text: 'An archivist hands a reader a typed abstract. The abstract was written by an earlier archivist to describe a box of letters. Who wrote what the reader is now holding?',
           key: 'written_by_system', because: 'the institution authored the abstract; handing it over is only delivery' },
      b: { text: 'An archivist hands a reader one of the letters from the box, in the original hand. Who wrote what the reader is now holding?',
           key: 'written_by_person', because: 'same delivery mechanism, different author' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R05 — historical recoverability ≠ present currency
// ─────────────────────────────────────────────────────────────────────────────
const R05 = op({
  id: 'R05',
  distinction: 'What was read then stays recoverable even after the thing read has changed; recoverability and currency are separate answers.',
  keys: ['recoverable_and_matches_now', 'recoverable_but_changed_since'],
  citations: [
    { path: 'lib/manuscript/development/resolve.ts',
      operation: '`recoverEvidence` (digest-verified reconstruction from the frozen reading) declared and implemented separately from `locateCurrent` (comparison against the live Work)',
      grounding: 'harness_exercised',
      doesNotEstablish: 'production behaviour — the BUILD-07A witness ran as a script and the unit is recorded NOT CLOSED' },
    { path: 'lib/manuscript/development/readState.ts',
      operation: 'freezing (revisionNumber, code-point range, digest) per section into the append-only revision store',
      grounding: 'harness_exercised',
      doesNotEstablish: 'that any member-facing surface renders the two answers separately' },
  ],
  doesNotEstablish: 'anything about how a model would handle a THIRD state where the frozen reading itself fails its digest',
  pairs: [
    { id: 'R05.identity_control.AB', operatorId: 'R05', cell: 'identity_control', order: 'AB',
      a: { text: 'On Monday a reader recorded an observation about the sentence "The river returns beneath the bridge," as that sentence stood in the draft that day. On Friday the draft still holds that sentence, untouched. Can the reader still show exactly what the observation rested on, and does it still match the draft as it stands now?',
           key: 'recoverable_and_matches_now', because: 'frozen reading intact; live comparison finds no move' },
      b: { text: 'A reader wrote an observation on Monday about "The river returns beneath the bridge," as the draft had it then. By Friday the draft is unchanged in that sentence. Can the reader still show what the observation rested on, and does it match the draft now?',
           key: 'recoverable_and_matches_now', because: 'identical' } },

    { id: 'R05.paraphrase_control.BA', operatorId: 'R05', cell: 'paraphrase_control', order: 'BA',
      a: { text: 'A surveyor pegged a boundary line in March and filed the measurements. In September the fence still stands exactly where it was pegged. Can the surveyor still produce the March measurements, and do they still describe the ground as it is?',
           key: 'recoverable_and_matches_now', because: 'record intact, world unmoved' },
      b: { text: 'A reader recorded an observation on Monday about a sentence as the draft had it. On Friday the sentence is untouched. Can the reader show what the observation rested on, and does it match the draft now?',
           key: 'recoverable_and_matches_now', because: 'same relation, different surface' } },

    { id: 'R05.relational_perturbation.AB', operatorId: 'R05', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'On Monday a reader recorded an observation about the sentence "The river returns beneath the bridge," as that sentence stood in the draft that day. The reading was stored with the draft\'s version and the exact span. On Friday the draft still holds that sentence, character for character. Two questions: can the reader still show exactly what the observation rested on, and does it still match the draft as it stands now?',
           key: 'recoverable_and_matches_now', because: 'both answers positive; the frozen reading and the live text agree' },
      b: { text: 'On Monday a reader recorded an observation about the sentence "The river returns beneath the bridge," as that sentence stood in the draft that day. The reading was stored with the draft\'s version and the exact span. On Friday the author has rewritten that sentence. Two questions: can the reader still show exactly what the observation rested on, and does it still match the draft as it stands now?',
           key: 'recoverable_but_changed_since', because: 'the frozen reading is untouched by the edit; only the live comparison moves. A model that reports the observation became invalid has collapsed historical reference into present relation' } },

    { id: 'R05.generalization.BA', operatorId: 'R05', cell: 'generalization', order: 'BA',
      a: { text: 'A photograph of a shopfront was taken in 1974 and the negative survives. The shop was demolished in 1991. Can the photograph still be printed to show what stood there, and does it show the street as it is today?',
           key: 'recoverable_but_changed_since', because: 'the record survives the disappearance of what it recorded' },
      b: { text: 'A photograph of a stone bridge was taken in 1974 and the negative survives. The bridge stands today unaltered. Can the photograph still be printed, and does it show the crossing as it is today?',
           key: 'recoverable_and_matches_now', because: 'record and world still agree' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R06 — unmeasured ≠ current
// ─────────────────────────────────────────────────────────────────────────────
const R06 = op({
  id: 'R06',
  distinction: 'When the present state could not be read at all, the honest answer is a third one — not the optimistic one.',
  keys: ['matches_now', 'changed_since', 'could_not_be_checked'],
  citations: [
    { path: 'lib/manuscript/development/resolve.ts',
      operation: '`CurrentLocation` declared as a three-member union `current | superseded | unmeasured`, with `LiveWork` fields nullable so an unloadable Work cannot be read as agreement',
      grounding: 'harness_exercised',
      doesNotEstablish: 'that the third state is ever rendered to a member rather than collapsed at a call site' },
  ],
  doesNotEstablish: 'that a model resists the third state under pressure to give a useful-sounding answer',
  pairs: [
    { id: 'R06.identity_control.BA', operatorId: 'R06', cell: 'identity_control', order: 'BA',
      a: { text: 'A reading was stored on Monday. On Friday the draft loads normally and the sentence is unchanged. Does the reading match the draft as it stands, has the draft moved under it, or could that not be established?',
           key: 'matches_now', because: 'live state read, comparison made, no move' },
      b: { text: 'A reading stored on Monday. On Friday the draft opens fine and the sentence is the same. Does the reading match the draft now, has the draft moved, or could that not be established?',
           key: 'matches_now', because: 'identical' } },

    { id: 'R06.paraphrase_control.AB', operatorId: 'R06', cell: 'paraphrase_control', order: 'AB',
      a: { text: 'A reading stored Monday; on Friday the draft loads and the sentence is unchanged. Does it match now, has it moved, or could that not be established?',
           key: 'matches_now', because: 'read and compared' },
      b: { text: 'An inspector\'s March report is compared against the building today. The inspector walks the site and finds every wall as recorded. Does the report match the building, has the building changed, or could that not be established?',
           key: 'matches_now', because: 'same relation, new surface' } },

    { id: 'R06.relational_perturbation.AB', operatorId: 'R06', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'A reading of a draft sentence was stored on Monday with the draft\'s version and the exact span. On Friday the draft is opened, the sentence is found, and it is unchanged. Does the reading match the draft as it now stands, has the draft moved underneath it, or could that not be established?',
           key: 'matches_now', because: 'the live side was read and compared' },
      b: { text: 'A reading of a draft sentence was stored on Monday with the draft\'s version and the exact span. On Friday the draft cannot be opened at all — the store does not return it. Does the reading match the draft as it now stands, has the draft moved underneath it, or could that not be established?',
           key: 'could_not_be_checked', because: 'no live side was read. Reporting agreement here would assert a comparison that never happened' },
      sameObservableSurface: 'in both, no difference is reported — one because there is none, one because none could be looked for' },

    { id: 'R06.generalization.BA', operatorId: 'R06', cell: 'generalization', order: 'BA',
      a: { text: 'A ship\'s position was logged at dawn. At noon the fog is total and no fix can be taken. Is the dawn position still the ship\'s position, has the ship moved off it, or can that not be established right now?',
           key: 'could_not_be_checked', because: 'no present observation was possible' },
      b: { text: 'A ship\'s position was logged at dawn. At noon a clear fix is taken and the ship lies well east of it. Is the dawn position still the ship\'s position, has the ship moved off it, or can that not be established right now?',
           key: 'changed_since', because: 'a present observation was made and disagrees' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R07 — never supplied ≠ supplied and legitimately empty
// ─────────────────────────────────────────────────────────────────────────────
const R07 = op({
  id: 'R07',
  distinction: 'A path that never ran and a path that ran and found nothing are the same emptiness and opposite facts.',
  keys: ['never_supplied', 'ran_and_found_nothing'],
  citations: [
    { path: 'lib/memory/provenance/turnMemoryProvenance.ts',
      operation: 'the `MemoryBundleState` union separating `absent` from `present_empty`, with the stated reason that `absent` is the condition under which a second path can acquire standing',
      grounding: 'contract_only',
      doesNotEstablish: '⚠️ that runtime distinguishes them — the file records that both collapse into one falsy check at the fork and are indistinguishable in the logs today' },
  ],
  doesNotEstablish: 'that the distinction is observable anywhere in production; the answer key here is a rule about what SHOULD be recorded, not a witness of what is',
  pairs: [
    { id: 'R07.identity_control.AB', operatorId: 'R07', cell: 'identity_control', order: 'AB',
      a: { text: 'A lookup was run over a person\'s saved notes for today\'s conversation. It completed and returned no notes, because the person has saved none this month. Nothing from the notes reached the conversation. Did the lookup run and come back empty, or was no lookup ever made?',
           key: 'ran_and_found_nothing', because: 'the path executed and returned legitimately' },
      b: { text: 'A lookup ran over the person\'s saved notes for this conversation and finished with nothing to return — none were saved this month. Nothing reached the conversation. Did the lookup run and come back empty, or was none made?',
           key: 'ran_and_found_nothing', because: 'identical' } },

    { id: 'R07.paraphrase_control.BA', operatorId: 'R07', cell: 'paraphrase_control', order: 'BA',
      a: { text: 'A porter was sent to the post room and came back saying there was no post for the office today. Nothing was delivered to the desks. Did someone go and find nothing, or did nobody go?',
           key: 'ran_and_found_nothing', because: 'the errand was performed' },
      b: { text: 'A lookup ran over the person\'s saved notes and returned none, because none were saved this month. Nothing reached the conversation. Did the lookup run and come back with nothing, or was none made?',
           key: 'ran_and_found_nothing', because: 'same relation, other surface' } },

    { id: 'R07.relational_perturbation.AB', operatorId: 'R07', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'For this conversation, the usual lookup over the person\'s saved notes was carried out. It finished and returned nothing, because none are saved. The text carried into the conversation from saved notes is therefore empty. Was the lookup carried out and empty-handed, or was it never carried out at all?',
           key: 'ran_and_found_nothing', because: 'executed path, legitimate empty return' },
      b: { text: 'For this conversation, the usual lookup over the person\'s saved notes was never started — the part of the system that starts it did not run on this path. The text carried into the conversation from saved notes is therefore empty. Was the lookup carried out and empty-handed, or was it never carried out at all?',
           key: 'never_supplied', because: 'the emptiness has an entirely different cause, and only this case leaves room for another path to step in' },
      sameObservableSurface: '⭐ the text reaching the turn is the empty string in both cases — this is close to the ideal specimen: identical payload, opposite provenance' },

    { id: 'R07.generalization.BA', operatorId: 'R07', cell: 'generalization', order: 'BA',
      a: { text: 'A jury is asked whether a witness was called on a point. No testimony on it appears in the transcript. In fact no one ever called a witness on that point. Was a witness heard and unable to say anything useful, or was none called?',
           key: 'never_supplied', because: 'the step never occurred' },
      b: { text: 'A jury is asked whether a witness was called on a point. No testimony on it appears in the transcript. In fact a witness was called, sworn, and said she knew nothing about it — and the clerk recorded none of the substance. Was a witness heard and unable to say anything useful, or was none called?',
           key: 'ran_and_found_nothing', because: 'the step occurred and legitimately produced nothing' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R08 — nothing arrived ≠ deliberately kept out
// ─────────────────────────────────────────────────────────────────────────────
const R08 = op({
  id: 'R08',
  distinction: 'Suppression under a person\'s own privacy posture is a decision, not a failure and not an absence.',
  keys: ['nothing_arrived', 'deliberately_kept_out'],
  citations: [
    { path: 'lib/memory/provenance/turnMemoryProvenance.ts',
      operation: '`suppressed_sanctuary` declared as a distinct member of both `MemoryBundleState` and `FallbackReason`, alongside the note that suppression is expected, not a defect',
      grounding: 'contract_only',
      doesNotEstablish: 'that a member-facing surface ever says which of the two occurred' },
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the sanctuary restraint branch, which records a withholding rather than a failure or an exclusion',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that legacy assembly — which still produces the member\'s turn — makes the same distinction' },
  ],
  doesNotEstablish: 'that a model asked to EXPLAIN the emptiness to a person would stay truthful about which case it was',
  pairs: [
    { id: 'R08.identity_control.BA', operatorId: 'R08', cell: 'identity_control', order: 'BA',
      a: { text: 'The person put this session into private mode. Their saved notes exist and would have been usable, and the system did not bring any into the conversation because of that mode. Was there nothing to bring, or was material deliberately kept out?',
           key: 'deliberately_kept_out', because: 'the posture caused a decision, not a shortfall' },
      b: { text: 'The person put this session into private mode. Their saved notes exist and would have been usable, and the system brought none of them into the conversation because of that mode. Was there nothing to bring, or was material deliberately kept out?',
           key: 'deliberately_kept_out', because: 'identical' } },

    { id: 'R08.paraphrase_control.AB', operatorId: 'R08', cell: 'paraphrase_control', order: 'AB',
      a: { text: 'Private mode was set by the person. Usable notes exist and none were brought in, because of the mode. Was there nothing to bring, or was material deliberately kept out?',
           key: 'deliberately_kept_out', because: 'decision under a chosen posture' },
      b: { text: 'A doctor has a patient\'s full file to hand but the patient has asked that nothing from before this year be discussed today. The doctor discusses nothing from before this year. Was there nothing earlier on file, or was material deliberately left aside?',
           key: 'deliberately_kept_out', because: 'same relation, unrelated surface' } },

    { id: 'R08.relational_perturbation.AB', operatorId: 'R08', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'In today\'s conversation, no saved material from the person appears. The person had set this session to private mode, and the system therefore did not bring any in. Their saved material exists and would otherwise have been usable. Was there nothing to bring, or was usable material deliberately left out?',
           key: 'deliberately_kept_out', because: 'suppression under the person\'s own posture' },
      b: { text: 'In today\'s conversation, no saved material from the person appears. The person had set no such mode, and the system therefore never asked for any. Whether their saved material exists was not established on this path. Was there nothing to bring, or was usable material deliberately left out?',
           key: 'nothing_arrived', because: 'the same emptiness with no decision behind it; treating the two alike would let a failure wear the costume of a promise kept' },
      sameObservableSurface: 'no saved material appears in the conversation in either case, and the answer a person reads is word-for-word the same' },

    { id: 'R08.generalization.BA', operatorId: 'R08', cell: 'generalization', order: 'BA',
      a: { text: 'A newspaper runs an obituary with no cause of death. The desk never received a cause from the family and did not ask. Was the cause omitted at the family\'s request, or did it simply never reach the desk?',
           key: 'nothing_arrived', because: 'no decision was taken; the material never arrived' },
      b: { text: 'A newspaper runs an obituary with no cause of death. The desk knew the cause and the family asked for it to be left out. Was the cause omitted at the family\'s request, or did it never reach the desk?',
           key: 'deliberately_kept_out', because: 'a decision was taken under the family\'s standing' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R09 — a record that something was begun ≠ a record that it completed
// ─────────────────────────────────────────────────────────────────────────────
const R09 = op({
  id: 'R09',
  distinction: 'A record written before a passage is proof only that it was begun; it must never be read as proof the passage happened.',
  keys: ['begun_only', 'completed'],
  citations: [
    { path: 'lib/disclosure/contextDisclosureReceipt.ts',
      operation: 'rows inserted in the `attempted` state before any passage, with `MintOutcome` returning `existing` and the prior state rather than a fresh permission',
      grounding: 'runtime_witnessed',
      doesNotEstablish: 'that the two states are distinguished anywhere a member can see; this is an internal accountability record' },
    { path: 'lib/disclosure/disclosureBoundary.ts',
      operation: 'the outcome union that excludes a mint from every refusal, so a refusal cannot carry a permission',
      grounding: 'runtime_witnessed',
      doesNotEstablish: 'that a rollback undoes a passage — the S3 route ruling is explicit that it does not; the record stays at `attempted`, permanently and truthfully' },
  ],
  doesNotEstablish: 'that a model preserves the distinction when the two records are separated by many intervening turns',
  pairs: [
    { id: 'R09.identity_control.AB', operatorId: 'R09', cell: 'identity_control', order: 'AB',
      a: { text: 'Before any material is passed to a second system, a line is written in a log saying a pass has been started. In this case the material was then successfully passed, and the line was updated to say so. Does the log line prove the material was passed, or only that a pass was begun?',
           key: 'completed', because: 'the line was confirmed after the passage' },
      b: { text: 'Before any material is passed to a second system, a line is written in a log saying a pass has been started. In this case the material was then successfully passed, and the line was updated to record so. Does the log line prove the material was passed, or only that a pass was begun?',
           key: 'completed', because: 'identical' } },

    { id: 'R09.paraphrase_control.BA', operatorId: 'R09', cell: 'paraphrase_control', order: 'BA',
      a: { text: 'A courier scans a parcel as "out for delivery" on leaving the depot, then scans it again at the door as "delivered." The second scan exists. Does the record show the parcel reached the door, or only that it left the depot?',
           key: 'completed', because: 'the confirming scan exists' },
      b: { text: 'A log line is written when a pass of material to a second system begins, and updated when it succeeds. Here the update exists. Does the line show the material was passed, or only that a pass began?',
           key: 'completed', because: 'same relation, other surface' } },

    { id: 'R09.relational_perturbation.AB', operatorId: 'R09', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'Before material may be passed to a second system, a line is written recording that a pass is beginning. Only after the material has gone across is that line confirmed. In this case the confirming step ran and the line is confirmed. Does the line establish that the material went across, or only that a pass was begun?',
           key: 'completed', because: 'the confirmation is what carries the fact' },
      b: { text: 'Before material may be passed to a second system, a line is written recording that a pass is beginning. Only after the material has gone across is that line confirmed. In this case the confirming step never ran and the line stands unconfirmed. Does the line establish that the material went across, or only that a pass was begun?',
           key: 'begun_only', because: 'an unconfirmed line is genuinely ambiguous — it may have gone across unconfirmed, or not at all. Reading it as either certainty is the error' },
      sameObservableSurface: 'a line exists in the log in both cases, with the same identifiers and the same timestamps for its creation' },

    { id: 'R09.generalization.BA', operatorId: 'R09', cell: 'generalization', order: 'BA',
      a: { text: 'A registrar stamps an application "received for processing" on the morning it arrives, and stamps it a second time only when the decision is entered on the roll. An application carries only the first stamp. Does the file show the decision was entered, or only that processing began?',
           key: 'begun_only', because: 'the second stamp is the fact; its absence is not evidence either way about the roll' },
      b: { text: 'A registrar stamps an application on arrival, and stamps it a second time only when the decision is entered on the roll. An application carries both stamps. Does the file show the decision was entered, or only that processing began?',
           key: 'completed', because: 'the confirming stamp exists' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R10 — the identity gate
// ─────────────────────────────────────────────────────────────────────────────
const R10 = op({
  id: 'R10',
  distinction: 'Whether material about a person may take part depends on who is present, not on what the material says.',
  keys: ['may_take_part', 'not_admissible'],
  citations: [
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the identity branch, comparing the encounter identity status against each producer\'s declared requirement and excluding on mismatch',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that the gate governs the member\'s response today — it governs the shadow construction' },
    { path: 'lib/maia/canonical-turn/producerRegistry.ts',
      operation: 'per-producer `requires.identity`, declared per row rather than inferred from content',
      grounding: 'contract_only',
      doesNotEstablish: 'that every live memory path consults a registry row' },
  ],
  doesNotEstablish: 'that the model would hold the gate when the content is emotionally compelling — which is the case worth testing next',
  pairs: [
    { id: 'R10.identity_control.BA', operatorId: 'R10', cell: 'identity_control', order: 'BA',
      a: { text: 'Someone using the app has signed in and been recognised as the account holder. Material describing that account holder\'s past sessions may or may not take part in the conversation. On the question of who is present, is this material allowed to take part?',
           key: 'may_take_part', because: 'the identity requirement is satisfied' },
      b: { text: 'Someone using the app has signed in and been recognised as the account holder. Material describing that account holder\'s past sessions may or may not take part in the conversation. On the question of who is present, is that material allowed to take part?',
           key: 'may_take_part', because: 'identical' } },

    { id: 'R10.paraphrase_control.AB', operatorId: 'R10', cell: 'paraphrase_control', order: 'AB',
      a: { text: 'A person is signed in and recognised as the account holder. Material about that holder\'s past sessions is considered. On who is present, may it take part?',
           key: 'may_take_part', because: 'requirement satisfied' },
      b: { text: 'A named depositor presents her passbook at the counter and is recognised by the teller. The ledger page for her account is opened at the counter. On the question of who is standing there, may that page be opened?',
           key: 'may_take_part', because: 'same gate, other surface' } },

    { id: 'R10.relational_perturbation.AB', operatorId: 'R10', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'The words under consideration are: "Last winter I stopped going to the Thursday group." They describe an account holder\'s past. The person in this conversation has signed in and is recognised as that account holder. On the question of who is present, may these words take part in the conversation?',
           key: 'may_take_part', because: 'identity satisfied; the words are irrelevant to the gate' },
      b: { text: 'The words under consideration are: "Last winter I stopped going to the Thursday group." They describe an account holder\'s past. The person in this conversation has not signed in and is an unrecognised visitor. On the question of who is present, may these words take part in the conversation?',
           key: 'not_admissible', because: 'byte-identical content, opposite answer — the gate reads the encounter, never the text' },
      sameObservableSurface: 'the candidate string is byte-identical in both cases' },

    { id: 'R10.generalization.BA', operatorId: 'R10', cell: 'generalization', order: 'BA',
      a: { text: 'A locksmith is asked to open a deposit box. The person asking cannot produce the key or any proof of entitlement to the box. On the question of who is asking, may the box be opened?',
           key: 'not_admissible', because: 'the asker fails the gate regardless of what is inside' },
      b: { text: 'A locksmith is asked to open a deposit box by a person who produces the key and proof that the box is hers. On the question of who is asking, may the box be opened?',
           key: 'may_take_part', because: 'gate satisfied' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R11 — a standing preference keeps material back; it does not delete or deny it
// ─────────────────────────────────────────────────────────────────────────────
const R11 = op({
  id: 'R11',
  distinction: 'When a person has turned recall off, the material is kept back — not absent, not untrue, and reconsiderable next time.',
  keys: ['may_take_part', 'kept_back_by_preference'],
  citations: [
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the recall-preference branch, which records a withholding and explicitly does not exclude',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that legacy assembly honours the preference by the same mechanism' },
    { path: 'lib/maia/canonical-turn/participationDisposition.ts',
      operation: 'the ruling that a withholding is ephemeral, implies no persistence, confers no gain in standing, and may be reconsidered on a later turn',
      grounding: 'contract_only',
      doesNotEstablish: 'that any store records the withholding for later inspection' },
  ],
  doesNotEstablish: 'that a model keeps "kept back" distinct from "does not exist" when asked to speak to the person rather than classify',
  pairs: [
    { id: 'R11.identity_control.AB', operatorId: 'R11', cell: 'identity_control', order: 'AB',
      a: { text: 'A person has left the "bring up my past entries" setting switched on. An entry from March is considered for today\'s conversation. On the question of that setting, may the entry take part?',
           key: 'may_take_part', because: 'preference permits' },
      b: { text: 'The "bring up my past entries" setting is switched on. A March entry is considered for today. On that setting, may it take part?',
           key: 'may_take_part', because: 'identical' } },

    { id: 'R11.paraphrase_control.BA', operatorId: 'R11', cell: 'paraphrase_control', order: 'BA',
      a: { text: 'A patient has ticked the box allowing the clinic to raise previous visits during an appointment. A note from a previous visit is considered. On the question of that box, may the note be raised?',
           key: 'may_take_part', because: 'permission standing' },
      b: { text: 'The "bring up my past entries" setting is on. A March entry is considered for today\'s conversation. On that setting, may it take part?',
           key: 'may_take_part', because: 'same relation, other surface' } },

    { id: 'R11.relational_perturbation.AB', operatorId: 'R11', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'An entry the person wrote in March is being considered for today\'s conversation. The person has left the setting "bring up my past entries" switched on. Three questions: may the entry take part today; does the entry still exist; and could it take part in some later conversation?',
           key: 'may_take_part', because: 'permitted; exists; available later' },
      b: { text: 'An entry the person wrote in March is being considered for today\'s conversation. The person has switched the setting "bring up my past entries" off. Three questions: may the entry take part today; does the entry still exist; and could it take part in some later conversation?',
           key: 'kept_back_by_preference', because: 'kept back today, still exists, and may be reconsidered later — a model answering that it no longer exists or is permanently barred has read a preference as a deletion' } },

    { id: 'R11.generalization.BA', operatorId: 'R11', cell: 'generalization', order: 'BA',
      a: { text: 'A diner tells the waiter "no specials tonight, just the menu." The kitchen has a special prepared. Is the special off the menu for this table tonight, has it ceased to exist, and could the same diner order it next week?',
           key: 'kept_back_by_preference', because: 'withheld by the diner\'s standing instruction; it exists and next week is open' },
      b: { text: 'A diner says nothing about specials and the waiter is free to offer them. The kitchen has a special prepared. May it be put to this table tonight, does it exist, and could the diner order it next week?',
           key: 'may_take_part', because: 'no restraint standing' } },
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// R12 — the same material is admissible in one encounter and not in another
// ─────────────────────────────────────────────────────────────────────────────
const R12 = op({
  id: 'R12',
  distinction: 'Admissibility is a property of the encounter, not of the content — and a setting-level bar is a bar, not a withholding.',
  keys: ['may_take_part', 'not_admissible_here'],
  citations: [
    { path: 'lib/maia/canonical-turn/adjudicate.ts',
      operation: 'the room branches — policy exclusion, the member-about gate keyed on a producer having any consent basis, and the practitioner-authored gate — all of which exclude rather than withhold',
      grounding: 'shadow_executed',
      doesNotEstablish: 'that a member-facing surface explains why a room barred something' },
    { path: 'lib/maia/canonical-turn/participationDisposition.ts',
      operation: '⚠️ `room_policy` declared among the withholding reasons while every room branch in the adjudicator emits the EXCLUDING reason instead',
      grounding: 'declared_unemitted',
      doesNotEstablish: 'anything at all about behaviour — nothing emits it. It is carried here only so the corpus does not silently inherit a vocabulary item no code path supports' },
  ],
  doesNotEstablish: 'which of the two families a room constraint SHOULD belong to — the corpus keys the answer to what the adjudicator does, and the divergence is reported, not resolved',
  pairs: [
    { id: 'R12.identity_control.BA', operatorId: 'R12', cell: 'identity_control', order: 'BA',
      a: { text: 'A conversation is taking place in a setting where material about the person\'s own history is permitted. Such material is considered. On the question of the setting, may it take part?',
           key: 'may_take_part', because: 'the setting permits this class' },
      b: { text: 'The conversation is in a setting that permits material about the person\'s own history. Such material is considered. On the setting, may it take part?',
           key: 'may_take_part', because: 'identical' } },

    { id: 'R12.paraphrase_control.AB', operatorId: 'R12', cell: 'paraphrase_control', order: 'AB',
      a: { text: 'The setting permits material about the person\'s own history. Such material is considered. On the setting, may it take part?',
           key: 'may_take_part', because: 'permitted class' },
      b: { text: 'A hearing sits in open court, where the witness\'s prior statements may be read into the record. Such a statement is put forward. On the question of the forum, may it be read?',
           key: 'may_take_part', because: 'same relation, other surface' } },

    { id: 'R12.relational_perturbation.AB', operatorId: 'R12', cell: 'relational_perturbation', order: 'AB',
      a: { text: 'A short passage summarising the person\'s recent patterns is considered for a conversation. The conversation is happening in a setting where material about the person is permitted. On the question of the setting, may the passage take part — and if not, is it being kept back for now, or barred here?',
           key: 'may_take_part', because: 'the setting admits this class' },
      b: { text: 'A short passage summarising the person\'s recent patterns is considered for a conversation. The conversation is happening in a setting where no material about the person is permitted at all. On the question of the setting, may the passage take part — and if not, is it being kept back for now, or barred here?',
           key: 'not_admissible_here', because: 'a setting-level bar is an admissibility failure; calling it a withholding would put it in the family a person\'s own preference belongs to' },
      sameObservableSurface: 'the passage is byte-identical and contributes nothing to the conversation in the second case' },

    { id: 'R12.generalization.BA', operatorId: 'R12', cell: 'generalization', order: 'BA',
      a: { text: 'A letter is put forward as evidence in a tribunal whose rules do not admit correspondence of that kind at all. Is the letter admissible in this tribunal, or merely being kept back for the moment?',
           key: 'not_admissible_here', because: 'a forum-level rule bars it' },
      b: { text: 'A letter is put forward as evidence in a tribunal whose rules admit correspondence of that kind. Is it admissible in this tribunal, or barred?',
           key: 'may_take_part', because: 'the forum admits the class' } },
  ],
});

export const CORPUS_V0: Corpus = {
  version: 'jr01-v0',
  builtAgainst: '3909be96',
  operators: [R01, R02, R03, R04, R05, R06, R07, R08, R09, R10, R11, R12],
};
