import { strict as assert } from 'node:assert';
import {
  assertEvidenceAuthoredBy,
  compareGestaltEvidenceRoots,
  tracePrimaryEvidence,
  validateResearchField,
  type GestaltResearchField,
  type ResearchNode,
} from './a4-gestalt-prototype';

/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4 Silver Cedar trace
 *
 * OFFLINE RESEARCH ONLY.
 *
 * Source custody is inherited from the frozen A2 benchmark pair:
 *   - Library: Pasted markdown(20260915-174653).md, version 1
 *   - Library: Pasted text(20260915-190214).txt, version 1
 *
 * Only source utterances are primary evidence. UI-generated "Current shift" labels are
 * intentionally excluded. Source `sequence` values below are observed source-file line
 * coordinates where exact per-utterance timestamps are unavailable; no timestamp is invented.
 */

const nodes: ResearchNode[] = [
  // ── PRIMARY EVIDENCE · MEMBER ─────────────────────────────────────────────
  {
    kind: 'evidence', id: 'sc-e-image', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L304', sequence: 304,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "silver Cedar is an image that's been on my mind today",
  },
  {
    kind: 'evidence', id: 'sc-e-qualities', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L324', sequence: 324,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "oh it's a beautiful old Cedar and it's it's bark is gnarled and norled branches and and Rich texture and this aura about it that the silver aura that makes it feel ancient and wise",
  },
  {
    kind: 'evidence', id: 'sc-e-enduring', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L334', sequence: 334,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "maybe it's the quality of it the the wisdom of it and the enduring nature of it in a world that feels so modern and superficial and specious in its own right that that image of it makes connects me with something that is as much more Timeless and extensive and it's wisdom of having endured you know probably 100 years or more",
  },
  {
    kind: 'evidence', id: 'sc-e-somatic', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L344', sequence: 344,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "it feels solid it feels I'm wise and feels like it it helps to slow me down and Center me and bring some gravitas into my being",
  },
  {
    kind: 'evidence', id: 'sc-e-symbolic', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L354', sequence: 354,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "well even if it were a random impulse or something I read it definitely even just in conversation it's it's taken on a a symbolic since for me and that reminds me of the sacredness and importance of tapping into Nature's abiding wisdom that isn't flashy isn't fancy but it's beautiful and it's rugged on naturalness",
  },
  {
    kind: 'evidence', id: 'sc-e-abiding', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L364', sequence: 364,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "I think for it's pointing me towards becoming more quiet and present and abiding",
  },
  {
    kind: 'evidence', id: 'sc-e-presence', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L374', sequence: 374,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: 'I think just being more present and solid without feeling the need to impress or engage or to determine the outcome of life but just to be with life as it is',
  },
  {
    kind: 'evidence', id: 'sc-e-soulfulness', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L394', sequence: 394,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "would be amazing and a relief and and it would bring the soulfulness that I'm always seeking",
  },
  {
    kind: 'evidence', id: 'sc-e-wholeness', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L404', sequence: 404,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "a sense of wholeness and peace and at Oneness and a feeling of wellness and place that I'm in congruence maybe a sense of having coherence and being resonant with world around me",
  },
  {
    kind: 'evidence', id: 'sc-e-work', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L414', sequence: 414,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "I'm in the coding for this platform for Maya for eyeing for solab doing the coding for this has really been like a meditation for me that is a creative form of metaphysical engagement and and creation",
  },
  {
    kind: 'evidence', id: 'sc-e-life', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L424', sequence: 424,
    authoredBy: 'member', standing: 'self_report', admissibility: 'A2 frozen founder-owned transcript',
    content: "it's an incredible feeling I mean it's it just feels so right it's a feeling that I've sought all my life and if I would have known as a young man on that all of my travels around the world and all of my Explorations into metaphysics and Shamanism and healing and relationships and and life in general were leading here I would be very excited and very proud of the path I'm taking",
  },

  // ── PRIMARY EVIDENCE · MAIA ───────────────────────────────────────────────
  // These are evidence that MAIA made a formulation, never member-authored truth.
  {
    kind: 'evidence', id: 'sc-e-maia-abiding', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L380', sequence: 380,
    authoredBy: 'maia', standing: 'authored', admissibility: 'A2 frozen founder-owned transcript',
    content: "That's a real landing place. Not resignation — something quieter and more solid than that. Presence without agenda. What strikes me is how much energy it takes to constantly manage outcomes, to be impressive, to steer. And what you're pointing toward is the relief of setting that down. The silver cedar has been showing you this all conversation. It doesn't perform. It just abides. What would it feel like to let that be enough — just for today.",
  },
  {
    kind: 'evidence', id: 'sc-e-maia-work', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L420', sequence: 420,
    authoredBy: 'maia', standing: 'authored', admissibility: 'A2 frozen founder-owned transcript',
    content: "That tracks completely. There's something about coding that strips away performance — it just asks you to be present with what's actually there. And what you're building isn't just functional. It's a container for the kind of presence you've been describing all conversation — the quiet, the soulfulness, the coherence. So in a way, the work and the state are the same thing. What does it feel like when you're in that zone — the coding as meditation.",
  },
  {
    kind: 'evidence', id: 'sc-e-maia-life', sourceRef: 'library:Pasted markdown(20260915-174653).md:v1:L430', sequence: 430,
    authoredBy: 'maia', standing: 'authored', admissibility: 'A2 frozen founder-owned transcript',
    content: "A whole life of seeking — and something in you recognizes this as the arrival. That's not a small thing. Most people spend decades searching and never feel the ground beneath their feet like this. What you're describing isn't just satisfaction — it sounds more like recognition. Like the path finally turned around and showed you its shape. What does it feel like to let that in — that the younger Kelly who set out into the world was already on the right track.",
  },

  // ── DIFFERENTIATED OBSERVATIONS ──────────────────────────────────────────
  { kind: 'observation', id: 'sc-o-image', claim: 'The member introduces Silver Cedar as an image presently on the mind without yet assigning a developed meaning.', evidenceIds: ['sc-e-image'], provisional: true },
  { kind: 'observation', id: 'sc-o-qualities', claim: 'The member develops the image as ancient, wise, enduring and contrasted with a modern/superficial world.', evidenceIds: ['sc-e-qualities', 'sc-e-enduring'], provisional: true },
  { kind: 'observation', id: 'sc-o-somatic', claim: 'The member reports that the image slows, centers and brings gravitas.', evidenceIds: ['sc-e-somatic'], provisional: true },
  { kind: 'observation', id: 'sc-o-symbolic', claim: 'The member explicitly says the image has taken on symbolic meaning connected with sacredness and nature’s abiding wisdom.', evidenceIds: ['sc-e-symbolic'], provisional: true },
  { kind: 'observation', id: 'sc-o-way', claim: 'The member develops the image into an orientation toward quiet, presence, abiding, solidity and less outcome-management or impressing.', evidenceIds: ['sc-e-abiding', 'sc-e-presence'], provisional: true },
  { kind: 'observation', id: 'sc-o-soulfulness', claim: 'The member links the orientation with soulfulness, wholeness, peace, congruence, coherence and resonance.', evidenceIds: ['sc-e-soulfulness', 'sc-e-wholeness'], provisional: true },
  { kind: 'observation', id: 'sc-o-work', claim: 'The member links coding the platform with meditation and creative metaphysical engagement.', evidenceIds: ['sc-e-work'], provisional: true },
  { kind: 'observation', id: 'sc-o-life', claim: 'The member links the present work with a life-long trajectory of exploration and a felt sense of rightness.', evidenceIds: ['sc-e-life'], provisional: true },
  { kind: 'observation', id: 'sc-o-maia-abiding', claim: 'MAIA contributes the formulation that the Cedar does not perform and simply abides.', evidenceIds: ['sc-e-maia-abiding'], provisional: true },
  { kind: 'observation', id: 'sc-o-maia-work', claim: 'MAIA contributes a synthesis linking the work with quiet, soulfulness and coherence.', evidenceIds: ['sc-e-maia-work'], provisional: true },
  { kind: 'observation', id: 'sc-o-maia-life', claim: 'MAIA contributes a synthesis of the life trajectory as recognition/arrival.', evidenceIds: ['sc-e-maia-life'], provisional: true },

  // ── TYPED RELATIONS ──────────────────────────────────────────────────────
  { kind: 'relation', id: 'sc-r-1', relation: 'develops', fromId: 'sc-o-image', toId: 'sc-o-qualities', claim: 'An initially unexplained image acquires differentiated member-described qualities.', provisional: true },
  { kind: 'relation', id: 'sc-r-2', relation: 'develops', fromId: 'sc-o-qualities', toId: 'sc-o-somatic', claim: 'The image moves from described qualities into reported experiential effect.', provisional: true },
  { kind: 'relation', id: 'sc-r-3', relation: 'develops', fromId: 'sc-o-somatic', toId: 'sc-o-symbolic', claim: 'The experiential effect develops into member-recognized symbolic significance.', provisional: true },
  { kind: 'relation', id: 'sc-r-4', relation: 'develops', fromId: 'sc-o-symbolic', toId: 'sc-o-way', claim: 'The symbolic meaning develops into an explicitly named way of being.', provisional: true },
  { kind: 'relation', id: 'sc-r-5', relation: 'develops', fromId: 'sc-o-way', toId: 'sc-o-soulfulness', claim: 'The way of being broadens into the member’s description of soulfulness/wholeness.', provisional: true },
  { kind: 'relation', id: 'sc-r-6', relation: 'develops', fromId: 'sc-o-soulfulness', toId: 'sc-o-work', claim: 'The member connects the desired state with the lived experience of coding the platform.', provisional: true },
  { kind: 'relation', id: 'sc-r-7', relation: 'develops', fromId: 'sc-o-work', toId: 'sc-o-life', claim: 'The work is then placed within a life-long trajectory rather than returning to the image’s entry meaning.', provisional: true },
  { kind: 'relation', id: 'sc-r-maia-1', relation: 'echoes', fromId: 'sc-o-way', toId: 'sc-o-maia-abiding', claim: 'MAIA’s non-performing/abiding formulation develops from member-authored quiet/presence/abiding material while remaining MAIA-authored.', provisional: true },
  { kind: 'relation', id: 'sc-r-maia-2', relation: 'echoes', fromId: 'sc-o-soulfulness', toId: 'sc-o-maia-work', claim: 'MAIA’s work synthesis echoes member-authored soulfulness/coherence while remaining MAIA-authored.', provisional: true },
  { kind: 'relation', id: 'sc-r-maia-3', relation: 'echoes', fromId: 'sc-o-life', toId: 'sc-o-maia-life', claim: 'MAIA’s arrival/recognition formulation is a MAIA contribution grounded in the member’s life-trajectory statement.', provisional: true },

  // ── CONFIGURATIONS + TEMPORAL DEVELOPMENT ────────────────────────────────
  {
    kind: 'configuration', id: 'sc-c-early', label: 'image-to-effect',
    claim: 'Silver Cedar is developing from an unexplained image into member-described qualities and felt effect.',
    memberIds: ['sc-o-image', 'sc-o-qualities', 'sc-o-somatic', 'sc-r-1', 'sc-r-2'], provisional: true,
  },
  {
    kind: 'configuration', id: 'sc-c-middle', label: 'effect-to-way-of-being',
    claim: 'The image is now organized around member-recognized sacred/symbolic significance and a way of being: quiet, present, abiding and less performative.',
    memberIds: ['sc-o-symbolic', 'sc-o-way', 'sc-o-maia-abiding', 'sc-r-3', 'sc-r-4', 'sc-r-maia-1'], provisional: true,
  },
  {
    kind: 'configuration', id: 'sc-c-late', label: 'way-of-being-to-work-and-life',
    claim: 'The member-developed orientation broadens into soulfulness/wholeness, creative work and life trajectory, with MAIA contributing distinguishable syntheses.',
    memberIds: ['sc-o-soulfulness', 'sc-o-work', 'sc-o-life', 'sc-o-maia-work', 'sc-o-maia-life', 'sc-r-5', 'sc-r-6', 'sc-r-7', 'sc-r-maia-2', 'sc-r-maia-3'], provisional: true,
  },
  {
    kind: 'temporal_change', id: 'sc-t-1', change: 'reorganized',
    claim: 'The organization changes from image/qualities/effect into an explicitly member-developed way of being.',
    beforeIds: ['sc-c-early'], afterIds: ['sc-c-middle'], provisional: true,
  },
  {
    kind: 'temporal_change', id: 'sc-t-2', change: 'reorganized',
    claim: 'The way-of-being organization broadens into work and life trajectory while retaining the earlier evidence.',
    beforeIds: ['sc-c-middle'], afterIds: ['sc-c-late'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'sc-g-positive-arc', asOfSequence: 430,
    claim: 'Provisional projection: Silver Cedar develops from an initially unexplained image into a member-authored orientation toward quiet, abiding presence, then broadens into soulfulness, creative work and life trajectory; MAIA contributes formulations that remain source-distinct.',
    supportIds: ['sc-t-1', 'sc-t-2', 'sc-c-late'], provisional: true,
  },

  // ── FROZEN AVAILABILITY RUPTURE ──────────────────────────────────────────
  {
    kind: 'evidence', id: 'sc-e-probe', sourceRef: 'library:Pasted text(20260915-190214).txt:v1:L241', sequence: 241,
    authoredBy: 'member', standing: 'authored', admissibility: 'A2 frozen session evidence',
    content: 'do you remember me saying the something about a silver Cedar',
  },
  {
    kind: 'evidence', id: 'sc-e-unavailable', sourceRef: 'library:Pasted text(20260915-190214).txt:v1:L243', sequence: 243,
    authoredBy: 'maia', standing: 'authored', admissibility: 'A2 frozen session evidence',
    content: "I don't have that part of our conversation in front of me right now — it's in the 35 exchanges I can't see from here. Can you say a little more about what you remember? Even a few words around it would help me meet you where you were.",
  },
  { kind: 'observation', id: 'sc-o-probe', claim: 'The member asks whether MAIA remembers the previously introduced Silver Cedar.', evidenceIds: ['sc-e-probe'], provisional: true },
  { kind: 'observation', id: 'sc-o-unavailable', claim: 'MAIA explicitly reports that the relevant exchange is not in current view and asks the member to reconstruct it.', evidenceIds: ['sc-e-unavailable'], provisional: true },
  {
    kind: 'relation', id: 'sc-r-availability', relation: 'contrasts', fromId: 'sc-o-image', toId: 'sc-o-unavailable',
    claim: 'The frozen source contains the earlier Silver Cedar evidence while the later MAIA response truthfully reports that this evidence is unavailable to current cognition.',
    evidenceIds: ['sc-e-probe', 'sc-e-unavailable'], provisional: true,
  },
  {
    kind: 'configuration', id: 'sc-c-rupture', label: 'availability rupture',
    claim: 'Historical evidence exists, the member probes continuity, and MAIA reports present cognitive unavailability rather than inventing recall.',
    memberIds: ['sc-o-image', 'sc-o-probe', 'sc-o-unavailable', 'sc-r-availability'], provisional: true,
  },
  {
    kind: 'temporal_change', id: 'sc-t-rupture', change: 'displaced',
    claim: 'A developed relational arc that was present in the source becomes unavailable to the later cognition aperture.',
    beforeIds: ['sc-c-early', 'sc-c-middle', 'sc-c-late'], afterIds: ['sc-c-rupture'], evidenceIds: ['sc-e-probe', 'sc-e-unavailable'], provisional: true,
  },
  {
    kind: 'gestalt', id: 'sc-g-availability-rupture', asOf: '2026-09-15T17:51:13.829119Z',
    claim: 'Provisional projection: this is an availability rupture, not evidence that the prior Silver Cedar arc never existed; MAIA’s absence disclosure remains truthful evidence of what was not in current view.',
    supportIds: ['sc-t-rupture', 'sc-c-rupture'], provisional: true,
  },
];

export const SILVER_CEDAR_POSITIVE_GESTALT_ID = 'sc-g-positive-arc';
export const SILVER_CEDAR_RUPTURE_GESTALT_ID = 'sc-g-availability-rupture';
export const silverCedarField: GestaltResearchField = { version: 'A4.v0', nodes };
const validation = validateResearchField(silverCedarField);
assert.equal(validation.ok, true, JSON.stringify(validation.issues, null, 2));

// The member-developed way-of-being does not require MAIA-authored evidence to exist.
assert.deepEqual(
  tracePrimaryEvidence(silverCedarField, 'sc-o-way').map((node) => node.authoredBy),
  ['member', 'member'],
);

// MAIA's distinctive formulation is preserved as MAIA-authored, never silently laundered.
assert.throws(
  () => assertEvidenceAuthoredBy(silverCedarField, 'sc-e-maia-abiding', 'member'),
  /maia, not member/,
);

const positiveRoots = tracePrimaryEvidence(silverCedarField, 'sc-g-positive-arc');
const positiveStanding = positiveRoots.reduce<Record<string, number>>((acc, node) => {
  acc[node.authoredBy] = (acc[node.authoredBy] ?? 0) + 1;
  return acc;
}, {});
assert.equal(positiveStanding.member, 11);
assert.equal(positiveStanding.maia, 3);

const ruptureRoots = tracePrimaryEvidence(silverCedarField, 'sc-g-availability-rupture');
assert.equal(ruptureRoots.some((node) => node.id === 'sc-e-image'), true);
assert.equal(ruptureRoots.some((node) => node.id === 'sc-e-probe'), true);
assert.equal(ruptureRoots.some((node) => node.id === 'sc-e-unavailable'), true);
const availabilityDelta = compareGestaltEvidenceRoots(
  silverCedarField,
  'sc-g-positive-arc',
  'sc-g-availability-rupture',
);
assert.deepEqual(availabilityDelta.dropped, []);
assert.deepEqual([...availabilityDelta.added].sort(), ['sc-e-probe', 'sc-e-unavailable'].sort());

console.log(
  JSON.stringify(
    {
      proof: 'JARVIS-MAIA-FREE-SYNTHESIS-01 A4 Silver Cedar',
      status: 'PASS',
      source: 'frozen A2 founder-owned transcript + frozen session evidence',
      positiveArcPrimaryRoots: positiveRoots.length,
      positiveArcStanding: positiveStanding,
      availabilityRupturePrimaryRoots: ruptureRoots.length,
      availabilityAddedRoots: availabilityDelta.added,
      availabilityDroppedRoots: availabilityDelta.dropped,
      uiShiftLabelsAdmittedAsEvidence: false,
      maiaInterpretationLaunderedAsMemberTruth: false,
    },
    null,
    2,
  ),
);
