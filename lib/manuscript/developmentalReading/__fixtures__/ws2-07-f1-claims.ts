/**
 * WS2-07-F1 ACT 3 — the twenty-one claim texts captured by the live semantic
 * witness of 2026-09-04 (checkout f6441b84b, reader DEVELOPMENTAL-READER-02,
 * classifier DEVELOPMENTAL-PHENOMENON-02), frozen verbatim.
 *
 * WHY THIS EXISTS. The founder's Act 3 ruling: classify a FIXED claim set
 * repeatedly, so that placement variance is attributable to the classifier
 * rather than to a fresh reading whose claims differ in wording before
 * classification. These texts are the fixed set. They are never regenerated.
 *
 * FIDELITY LIMIT, DECLARED. The witness recorded each claim's `text`, `refs`
 * and `signature`. It did NOT record `doesNotEstablish`, which the reader
 * authors per claim. The Act 3 witness therefore supplies one founder-specified
 * value, `editorial-consequence`, identical for all twenty-one, rather than
 * reconstructing values the reader never published. The input is therefore
 * CONTROLLED AND SYNTHETIC, not historical: no result over this fixture may be
 * read as reproducing, confirming or correcting the original live placements.
 * The claim TEXT - the thing the ruling fixes - is exact.
 *
 * `observed` is what PHENOMENON-02 produced. `ruling` is the founder's
 * adjudication of 2026-09-04. Neither is an expected value for -03 except
 * where the Act 3 witness says so explicitly.
 */

import type { DevelopmentalPhenomenon } from '../contract';

export type FounderRuling = 'correct' | 'sound' | 'admissible' | 'conditional' | 'reject';

export interface CapturedClaim {
  readonly act: 1 | 2 | 3;
  readonly key: string;
  readonly subject: string;
  readonly observed: DevelopmentalPhenomenon;
  readonly ruling: FounderRuling;
  readonly text: string;
}

export const WS2_07_F1_CAPTURED_CLAIMS: readonly CapturedClaim[] = [
  {
    act: 1,
    key: "o1",
    subject: "tomas-plan",
    observed: "unresolved-thread",
    ruling: "admissible",
    text: "Tomas's plan is introduced at position 2 as \"a plan\" whose only specified attachment is the shed, restated at position 3 in terms that mark its own withholding (\"again nobody says what it is\"), and given content only at position 5, where it is disclosed retrospectively as a plan to sell the land. Across the three appearances the plan gains no detail between its introduction and its final one-clause disclosure; the middle appearance restates the withholding rather than adding to it."
  },
  {
    act: 1,
    key: "o2",
    subject: "lantern-trajectory",
    observed: "movement",
    ruling: "correct",
    text: "The lantern is carried through all six sections and its handling changes at each appearance — found and kept secret, withheld from the council, moved under the bed and possibly humming, carried to the water where it is stated to do nothing, then placed on the windowsill in view. The one property that would make it more than an object (the humming) is introduced at position 2 already qualified (\"or she imagined it did\") and is not returned to in the sections I read; the later appearances treat it flatly as a lantern."
  },
  {
    act: 1,
    key: "o3",
    subject: "eleven-council",
    observed: "register-shift",
    ruling: "sound",
    text: "The counted evasions at the council (\"Eleven\") are introduced at position 1 as Mara's private tally and are picked up once at position 3 as \"the council's eleven silences,\" where the count is converted into a summary phrase and the meeting-thread resolves into \"one loud argument\" in a single sentence. The council material is developed by naming its transformation rather than by staging it."
  },
  {
    act: 1,
    key: "o4",
    subject: "meta-register",
    observed: "positional-asymmetry",
    ruling: "admissible",
    text: "Section at position 3, the first section of the member's \"part · After\", describes its own contents in the register of a plan for a chapter rather than narrating them — \"This is the chapter where the water comes into the lower street\" — while the sections around it in both member parts render their events directly. The turn of the whole premise (the river rising) sits in this summarised register."
  },
  {
    act: 1,
    key: "o5",
    subject: "ines",
    observed: "recurrence",
    ruling: "correct",
    text: "Ines is introduced at position 2 by a single characterising habit (she \"laughed at the wrong moments\") and is next present at position 4, where the same habit is used in its negative form (\"for once, does not laugh\") to mark the encounter at the water. Between introduction and that inversion she receives no other attribute or action in what I read, so the whole of her development rests on the one trait and its reversal."
  },
  {
    act: 1,
    key: "o6",
    subject: "mara-motive-declined",
    observed: "recurrence",
    ruling: "admissible",
    text: "Mara's motive is twice explicitly declined rather than supplied: at position 0 the lantern lighting first try is something \"she took as a sign,\" with the sign left unstated, and at position 4 the narration steps forward in time to record that \"later she will say she does not know why.\" The one line that could explain the central action is spent stating that no explanation exists."
  },
  {
    act: 1,
    key: "o7",
    subject: "shed",
    observed: "positional-asymmetry",
    ruling: "admissible",
    text: "The shed carries the connection between the lantern's origin (position 0) and Tomas's plan (position 2), and it is disposed of in four words at position 5 — \"The shed was gone\" — without an intervening scene in which it figures. The element that links the two main threads is present at their ends and absent from the middle of what I read."
  },
  {
    act: 2,
    key: "o1",
    subject: "tomas-plan",
    observed: "movement",
    ruling: "admissible",
    text: "Tomas's plan is introduced at position 2 as \"a plan\" whose only specified content is that it \"involved the shed,\" is referred to again at position 3 in terms that state its content is still unspoken (\"again nobody says what it is\"), and is given its content only in the final section read, as having been \"to sell the land.\" Across the three sections in which it appears, the plan advances by withholding rather than by accruing detail, and the withholding is named in the text itself at position 3."
  },
  {
    act: 2,
    key: "o2",
    subject: "lantern-trajectory",
    observed: "movement",
    ruling: "correct",
    text: "The lantern recurs in every section read except position 1 and position 3, and each recurrence changes only its placement or visibility — found in the shed and kept secret, moved to under the bed, carried to the water, then set on the windowsill \"where anyone could see it.\" Its properties are stated once (brass, dented, lit on the first try); afterwards the text twice qualifies or denies any further property (\"or she imagined it did\"; \"It does not do anything — it is a lantern\"). The object's development in what I read is positional rather than propertied."
  },
  {
    act: 2,
    key: "o3",
    subject: "eleven-council",
    observed: "unresolved-thread",
    ruling: "conditional",
    text: "The counted evasions of position 1 (\"counted the ways the men avoided saying the word flood. Eleven.\") are taken up once, at position 3, as \"the council's eleven silences become one loud argument in the church hall,\" and the council does not appear again in the two sections I read after that. The pickup converts the count into a summary phrase rather than into scene."
  },
  {
    act: 2,
    key: "o4",
    subject: "ines",
    observed: "recurrence",
    ruling: "correct",
    text: "Ines is introduced at position 2 with a single characterising trait — she \"laughed at the wrong moments\" — and her one subsequent appearance, at position 4, consists of the negation of that same trait (\"Ines, for once, does not laugh\"). In the sections I read she carries no attribute other than this laugh and its withholding."
  },
  {
    act: 2,
    key: "o5",
    subject: "meta-register",
    observed: "register-shift",
    ruling: "admissible",
    text: "Position 3 narrates from outside the story, naming its own unit and forecasting its contents (\"This is the chapter where the water comes into the lower street\"), and position 4 shifts into present tense with a forward-looking aside (\"Later she will say she does not know why\"), whereas positions 0 through 2 are narrated in past tense from within the scene. The change in narrating stance coincides with the boundary between the member's \"part · Before the water\" and \"part · After\"."
  },
  {
    act: 2,
    key: "o6",
    subject: "river-ends",
    observed: "positional-asymmetry",
    ruling: "sound",
    text: "The river's change of course is stated in the first clause of position 0 as already accomplished (\"the week the river changed course\") and again in position 5 as settled (\"settled into its new bed\"); the intervening sections treat the same event as still impending or in progress (\"met about the river\", \"The river rose\"). The opening therefore carries the outcome that the middle sections work toward."
  },
  {
    act: 2,
    key: "o7",
    subject: "mara-nondisclosure",
    observed: "recurrence",
    ruling: "admissible",
    text: "Mara's non-disclosure of the lantern is stated twice in close succession and in near-identical terms — \"She told no one\" at the close of position 0, and \"She did not mention the lantern; it did not seem to belong to this kind of meeting\" at the close of position 1 — the second adding a reason but not a change in her position."
  },
  {
    act: 3,
    key: "o1",
    subject: "lantern-trajectory",
    observed: "movement",
    ruling: "correct",
    text: "The lantern is carried through every one of the six sections read, and each appearance changes its status rather than restating it: found and kept secret (0), withheld from a public setting (1), moved under the bed and possibly humming (2), absent from the flood chapter's summary of events (3), carried to the water and explicitly said to do nothing (4), placed on the windowsill 'where anyone could see it' (5). The movement from concealment to visibility is tracked at each step rather than asserted once."
  },
  {
    act: 3,
    key: "o2",
    subject: "tomas-plan",
    observed: "unresolved-thread",
    ruling: "admissible",
    text: "Tomas's plan is introduced as withheld content in section at position 2 ('came home from the city with a plan'), is re-raised in position 3 in a form that names the withholding itself ('is mentioned again, and again nobody says what it is'), and is then disclosed in a single clause at position 5 ('had been to sell the land'). Between introduction and disclosure the plan advances only by being restated as unstated; the disclosure arrives in the final section read and is not worked out further there."
  },
  {
    act: 3,
    key: "o3",
    subject: "meta-register",
    observed: "positional-asymmetry",
    ruling: "admissible",
    text: "Two sections read are written in a summarising, meta-register that describes the chapter rather than rendering it: position 3 says 'This is the chapter where the water comes into the lower street', and position 4 shifts to present tense with a forward-looking gloss ('Later she will say she does not know why'). The three sections in the member's 'part · Before the water' are rendered in past-tense scene instead. The register difference falls at the boundary between the member's two parts."
  },
  {
    act: 3,
    key: "o4",
    subject: "eleven-council",
    observed: "term-drift",
    ruling: "reject",
    text: "The counted 'eleven' avoidances of the word flood, introduced as Mara's private tally in position 1, is picked up once in position 3 as 'the council's eleven silences become one loud argument', converting the count into a resolved figure; it does not recur in the two later sections read."
  },
  {
    act: 3,
    key: "o5",
    subject: "ines",
    observed: "recurrence",
    ruling: "correct",
    text: "Ines enters at position 2 attached to a single characterising trait ('laughed at the wrong moments'), and the only further development of her in what was read is the negation of that same trait at position 4 ('Ines, for once, does not laugh'). She has no other action, speech or attribute across the sections read, and does not appear in the final section read."
  },
  {
    act: 3,
    key: "o6",
    subject: "shed",
    observed: "recurrence",
    ruling: "admissible",
    text: "The shed is established at position 0 as the place of finding, is named at position 2 as what Tomas's plan 'involved', and its loss is reported at position 5 in a four-word sentence ('The shed was gone') with no intervening rendering of what happens to it. The two sections between introduction and loss do not return to it."
  },
  {
    act: 3,
    key: "o7",
    subject: "lantern-preemption",
    observed: "recurrence",
    ruling: "admissible",
    text: "The text twice pre-empts its own suggestion that the lantern is significant, first by undercutting the humming ('— or she imagined it did', position 2) and then by flatly denying efficacy ('It does not do anything — it is a lantern', position 4). The second instance restates the first move in a more explicit form rather than extending it."
  }
] as const;
