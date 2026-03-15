/**
 * Spiralogic Facet Registry
 *
 * Source: "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life" — Kelly Nezat
 *
 * 15 facets across 5 elements × 3 states each. This is the canonical ontology
 * for the Spiralogic system. Facets encode both structural position AND
 * developmental logic — they are not interchangeable even within an element.
 *
 * Facet naming follows the book's three-state model per element:
 *   Fire:   Activating → Amplifying → Actualizing
 *   Water:  Being → Balancing → Becoming
 *   Earth:  Cultivating → Crystallizing → Clarifying
 *   Air:    Directing → Discerning → Delivering
 *   Aether: Emanation → Elevation → Equilibrium
 *
 * State valence encodes how a facet is being inhabited:
 *   negative → constricted / shadow expression
 *   neutral  → emergent / transitional expression
 *   positive → coherent / integrated expression
 *
 * Facets are sequential within and across elements as a developmental tendency.
 * Node activation is non-linear — multiple facets can be active simultaneously,
 * and facets can appear outside dominant sequence as anticipatory goals or
 * threshold markers.
 *
 * boardRegion:
 *   'ring'   — 12 peripheral facets (fire, water, earth, air)
 *   'center' — 3 differentiated Aether facets (triangular center cluster)
 *
 * uiOrder: 1–15, flowing Fire → Water → Earth → Air → Aether
 */

export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type NodeRole = 'marker' | 'goal' | 'grounding';
export type StateValence = 'negative' | 'neutral' | 'positive';
export type BoardRegion = 'ring' | 'center';

// Practitioner-facing valence labels (less moralized than negative/positive)
export const VALENCE_LABELS: Record<StateValence, string> = {
  negative: 'constricted',
  neutral: 'emergent',
  positive: 'coherent',
};

export type FacetKey =
  | 'fire_1' | 'fire_2' | 'fire_3'
  | 'water_1' | 'water_2' | 'water_3'
  | 'earth_1' | 'earth_2' | 'earth_3'
  | 'air_1' | 'air_2' | 'air_3'
  | 'aether_1' | 'aether_2' | 'aether_3';

export interface StateSignature {
  signals: string[];
  description: string;
}

export interface FacetDef {
  key: FacetKey;
  element: SpiralogicElement;
  phaseIndex: 1 | 2 | 3;

  /** Canonical name from the Elemental Alchemy book — stable data key */
  canonicalName: string;
  /** Practitioner-facing label — defaults to canonicalName, can diverge for UI needs */
  displayName: string;

  developmentalLogic: string;
  typicalMarkers: string[];       // keyword signals for candidate generation
  precededBy: FacetKey[];         // typical antecedents (descriptive, not prescriptive)
  typicallyFollowedBy: FacetKey[];
  stateSignatures: Record<StateValence, StateSignature>;

  /** Which roles this facet most naturally maps to (for generation heuristics) */
  roleAffinities: NodeRole[];

  /** 1–15 canonical ordering: Fire(1–3) Water(4–6) Earth(7–9) Air(10–12) Aether(13–15) */
  uiOrder: number;

  /** 'ring' = peripheral element; 'center' = Aether center cluster */
  boardRegion: BoardRegion;
}

export const FACET_REGISTRY: Record<FacetKey, FacetDef> = {

  // ─── FIRE ────────────────────────────────────────────────────────────────
  // "Fire ignites our spiritual energy, vision, and creativity.
  //  It fuels our passions and personal transformation."
  // Shadow: burnout, impulsiveness, aggression, scattered energy, spiritual bypassing

  fire_1: {
    key: 'fire_1',
    element: 'fire',
    phaseIndex: 1,
    canonicalName: 'Activating',
    displayName: 'Activating',
    uiOrder: 1,
    boardRegion: 'ring',
    roleAffinities: ['marker', 'goal'],
    developmentalLogic: 'Self-Awareness state. The sacred spark of new vision, impulse, and directionality arriving — the soul sensing purpose before full commitment exists.',
    typicalMarkers: ['vision','spark','inspiration','calling','passion','possibility','dream','activate','awaken','ignite','sense a direction','feel drawn','purpose emerging'],
    precededBy: ['earth_3', 'air_3', 'aether_3'],
    typicallyFollowedBy: ['fire_2', 'water_1'],
    stateSignatures: {
      positive: {
        description: 'Authentic spiritual activation — vision arising from soul, not ego. Direction feels alive without inflation or urgency.',
        signals: ['clear sense of calling','genuine excitement without urgency','vision feels grounded','direction emerging naturally','something true is stirring'],
      },
      neutral: {
        description: 'Exploratory awakening. Direction sensing in early form — curious, open, not yet committed.',
        signals: ['interesting idea','wondering if','considering','beginning to feel drawn','might be','something is activating'],
      },
      negative: {
        description: 'Inflation, grandiosity, or spiritual bypassing — vision used to escape reality rather than enter it. Scattered fire without grounding.',
        signals: ['grandiose certainty','urgency','this will change everything','finally I know','chasing human stars','scattered','burnout from overactivation'],
      },
    },
  },

  fire_2: {
    key: 'fire_2',
    element: 'fire',
    phaseIndex: 2,
    canonicalName: 'Amplifying',
    displayName: 'Amplifying',
    uiOrder: 2,
    boardRegion: 'ring',
    roleAffinities: ['marker'],
    developmentalLogic: 'Self-In-World Awareness state. Vision takes shape in the world — desires manifest, aspirations perform, the inner fire engages the outer world through testing.',
    typicalMarkers: ['amplify','expand','perform','test','engage','experiment','manifest','share vision','put it out there','shining','building momentum','step forward'],
    precededBy: ['fire_1', 'water_3'],
    typicallyFollowedBy: ['fire_3', 'earth_1'],
    stateSignatures: {
      positive: {
        description: 'Engaged, excited, embodied performance of vision. Sparkle from the inside out. Testing concepts playfully and with confidence.',
        signals: ['shining brightly','playing with possibilities','happy momentum','testing vision in the world','creative expression flowing'],
      },
      neutral: {
        description: 'Stepping out with the vision — not fully confident but engaging. Testing direction with honest uncertainty.',
        signals: ['trying something new','seeing what happens','putting it out there','working with the idea','experimenting in the world'],
      },
      negative: {
        description: 'Impulsive action, aggression, or performing for validation before inner conditions are ready.',
        signals: ['forcing','pushing through','performing for approval','aggression in getting vision out','impulsive action','scattered performance'],
      },
    },
  },

  fire_3: {
    key: 'fire_3',
    element: 'fire',
    phaseIndex: 3,
    canonicalName: 'Actualizing',
    displayName: 'Actualizing',
    uiOrder: 3,
    boardRegion: 'ring',
    roleAffinities: ['marker', 'goal'],
    developmentalLogic: 'Transcendent Self-Awareness state. Embodied agency and sustained initiative — the purified spiritual fire as living force. Soul-level courage and renewal.',
    typicalMarkers: ['actualize','courage','warrior','sustain','renew','phoenix','agency','lead','drive','execute','ongoing initiative','spiritual warrior','rebirth'],
    precededBy: ['fire_2', 'earth_2'],
    typicallyFollowedBy: ['air_1', 'earth_3'],
    stateSignatures: {
      positive: {
        description: 'Sustainable courage and agency grounded in spiritual identity. Willing to surrender for the sake of rebirth and awakening.',
        signals: ['sustainable momentum','leading from groundedness','acting from courage','spiritual warrior presence','willing to let old forms die'],
      },
      neutral: {
        description: 'Maintaining forward movement without full actualization. Getting things done but not yet from full spiritual agency.',
        signals: ['keeping at it','maintaining','steady forward movement','ongoing effort','continuing'],
      },
      negative: {
        description: 'Burnout, hyperactivity, or domination. Fire consuming rather than transforming.',
        signals: ['burnout','overworking','can\'t stop','hyperproductive','dominating','aggressive','force as a substitute for genuine courage'],
      },
    },
  },

  // ─── WATER ───────────────────────────────────────────────────────────────
  // "Water flows through our emotional depths, moral investigations, and soulful authenticity.
  //  It guides us in cultivating wisdom and compassion."
  // Phases: Heart (Awareness) → Healing (Transformation) → Holy (Transcendent Collective)

  water_1: {
    key: 'water_1',
    element: 'water',
    phaseIndex: 1,
    canonicalName: 'Being',
    displayName: 'Being',
    uiOrder: 4,
    boardRegion: 'ring',
    roleAffinities: ['marker'],
    developmentalLogic: 'Nurturing Inner Awareness state. Diving into inner experience — the gateway to authentic engagement with the world. Feeling, sensing, and accepting what is true within.',
    typicalMarkers: ['feel','inner','being','nurture','sense','aware','emotional','grief','pain','longing','surrender','raw','vulnerable','what is true','somatic'],
    precededBy: ['fire_1', 'fire_2', 'aether_1'],
    typicallyFollowedBy: ['water_2'],
    stateSignatures: {
      positive: {
        description: 'Genuine inner awareness — willingness to feel what is true. Diving inward as the gateway to authentic world-engagement.',
        signals: ['willing to feel','turning inward','genuinely aware of what\'s happening inside','emotional honesty','present with inner experience'],
      },
      neutral: {
        description: 'Emotional emergence in early form. Beginning to sense and feel what is true — not yet metabolized.',
        signals: ['starting to feel','something opening','noticing emotion','beginning to turn inward','becoming aware of inner state'],
      },
      negative: {
        description: 'Flooding, collapse, or shutdown. Water overwhelming rather than opening — inner experience becomes incapacitating.',
        signals: ['flooding','can\'t function','overwhelmed and stuck','shut down','numb','emotional flooding without direction'],
      },
    },
  },

  water_2: {
    key: 'water_2',
    element: 'water',
    phaseIndex: 2,
    canonicalName: 'Balancing',
    displayName: 'Balancing',
    uiOrder: 5,
    boardRegion: 'ring',
    roleAffinities: ['marker'],
    developmentalLogic: 'Inner Coherence state. Cultivating emotional intelligence and moral investigation — balancing emotional depth with wisdom and compassion.',
    typicalMarkers: ['balance','wisdom','compassion','understanding','emotional intelligence','moral','investigate','depth','insight','clarity','truth','coherent','integrate feeling'],
    precededBy: ['water_1'],
    typicallyFollowedBy: ['water_3', 'aether_1'],
    stateSignatures: {
      positive: {
        description: 'Genuine inner coherence — emotional wisdom becoming available. Feeling and knowing balanced into authentic understanding.',
        signals: ['this feels true','wisdom arising','emotional clarity','compassion for self and others','balanced inner state','feeling and understanding together'],
      },
      neutral: {
        description: 'Working toward inner balance. In process — not yet fully coherent but genuinely engaged.',
        signals: ['working through it','searching for balance','processing','trying to understand what I feel','in the middle of metabolizing'],
      },
      negative: {
        description: 'Rumination, obsessive emotional investigation, or moral perfectionism. Depth as endless searching rather than arriving.',
        signals: ['going in circles','obsessing','can\'t stop analyzing feelings','moral self-flagellation','emotional rumination without resolution'],
      },
    },
  },

  water_3: {
    key: 'water_3',
    element: 'water',
    phaseIndex: 3,
    canonicalName: 'Becoming',
    displayName: 'Becoming',
    uiOrder: 6,
    boardRegion: 'ring',
    roleAffinities: ['marker', 'grounding'],
    developmentalLogic: 'Transcendent Being state. Transcending personal emotional limitations to become part of something larger — soulful authenticity expressing into collective connection.',
    typicalMarkers: ['becoming','transcend','collective','authentic','soul','wholeness','connection','flow','heal','transform','beyond personal','holy','integrate','at peace'],
    precededBy: ['water_2'],
    typicallyFollowedBy: ['earth_1', 'air_1'],
    stateSignatures: {
      positive: {
        description: 'Soulful authenticity integrated — emotional depth becoming a gift to the collective. Transcending personal limitation through genuine inner work.',
        signals: ['at peace with what happened','something larger than personal story','authentic and whole','emotional depth available as gift','genuinely transformed'],
      },
      neutral: {
        description: 'Settling into the becoming — provisional integration, still consolidating the transformation.',
        signals: ['feeling more settled','beginning to accept','calmer than before','integrating slowly','sense of becoming'],
      },
      negative: {
        description: 'False transcendence or bypassed emotional material. Performing holiness without genuine inner work.',
        signals: ['forcing acceptance','spiritual bypassing','claiming peace without processing','performance of transformation','transcendence as avoidance'],
      },
    },
  },

  // ─── EARTH ───────────────────────────────────────────────────────────────
  // "Earth grounds us in practical realities and embodied experiences.
  //  It provides discipline, patience, and actualization of our efforts."
  // Dynamics: Creating (mission) → Conceiving (development) → Clarifying (refinement)

  earth_1: {
    key: 'earth_1',
    element: 'earth',
    phaseIndex: 1,
    canonicalName: 'Cultivating',
    displayName: 'Cultivating',
    uiOrder: 7,
    boardRegion: 'ring',
    roleAffinities: ['goal', 'marker'],
    developmentalLogic: 'Conception state. Creating and initiating — planting seeds of new mission, purpose, and structure. Arrives most cleanly after Fire activation and Water metabolization.',
    typicalMarkers: ['mission','intention','purpose','create','initiate','plant','seed','new direction','structure forming','goal','build','begin project','service','calling into form'],
    precededBy: ['water_3', 'fire_2'],
    typicallyFollowedBy: ['earth_2', 'fire_3'],
    stateSignatures: {
      positive: {
        description: 'Mission emerging organically from genuine inner work. Structure forming in service of soul — purpose planted with love and clarity.',
        signals: ['clear grounded intention','purpose feels embodied','structure forming naturally','mission born from what I\'ve been through','planting seeds of new direction'],
      },
      neutral: {
        description: 'Tentative cultivation — beginning to form direction and structure. Early planting without full embodiment.',
        signals: ['starting to get clear','beginning to form a direction','working out what I want','early planning','first steps of mission'],
      },
      negative: {
        description: 'Premature structuring driven by anxiety before inner work is complete. Pseudo-mission as control, busyness as armor.',
        signals: ['rigidly planning','anxiety to define purpose','overstructuring','compensatory control','mission as escape from grief','busy-ness as armor','forced certainty'],
      },
    },
  },

  earth_2: {
    key: 'earth_2',
    element: 'earth',
    phaseIndex: 2,
    canonicalName: 'Crystallizing',
    displayName: 'Crystallizing',
    uiOrder: 8,
    boardRegion: 'ring',
    roleAffinities: ['grounding', 'marker'],
    developmentalLogic: 'Convergence state. Developing and nurturing — resources, plans, and outer development gathering and crystallizing. Germinating the seeds into steady, persistent form.',
    typicalMarkers: ['crystallize','develop','nurture','resources','plan','convergence','steady','persist','gather','consistent','build','method','discipline','tending','practice'],
    precededBy: ['earth_1', 'fire_3'],
    typicallyFollowedBy: ['earth_3', 'air_2'],
    stateSignatures: {
      positive: {
        description: 'Embodied practice alive in daily life — steady, persistent development. Structure inhabiting the body and day with ease.',
        signals: ['practice feels natural','routine holding','life structure working','steady development','showing up without forcing','it\'s part of my life now'],
      },
      neutral: {
        description: 'Establishing routines and methods in early form — consistent effort but not yet fully crystallized.',
        signals: ['trying to maintain','keeping up the practice','still building the habit','working on consistency','developing steadily'],
      },
      negative: {
        description: 'Rigidity, mechanical habit, or perfectionism — crystallized form without living soul inside it.',
        signals: ['going through motions','forcing routine','rigid method','structure without meaning','mechanically disciplined','perfectionism blocking flow'],
      },
    },
  },

  earth_3: {
    key: 'earth_3',
    element: 'earth',
    phaseIndex: 3,
    canonicalName: 'Clarifying',
    displayName: 'Clarifying',
    uiOrder: 9,
    boardRegion: 'ring',
    roleAffinities: ['grounding', 'marker'],
    developmentalLogic: 'Refinement state. Making clear the practical knowledge for healing, stability, and growth. Perfecting form in preparation for offering it into shared connection.',
    typicalMarkers: ['clarify','refine','stabilize','ground','heal','complete','offer','share','lasting','embodied','solid','integrated','medicine','ready to give'],
    precededBy: ['earth_2'],
    typicallyFollowedBy: ['fire_1', 'aether_1'],
    stateSignatures: {
      positive: {
        description: 'Genuine clarification and stabilization — the work refined and ready. Ground as foundation for offering to others and for the next spiral.',
        signals: ['this is who I am now','the change held','groundedness without effort','ready to offer','stable and clear','the form is complete'],
      },
      neutral: {
        description: 'Holding steady, provisional stability — not yet certain the refinement is complete.',
        signals: ['staying stable for now','maintaining','seems to be holding','cautiously grounded','still clarifying'],
      },
      negative: {
        description: 'Stagnation, inertia, or defensive settling — clarity used to avoid the next movement rather than enable it.',
        signals: ['stuck','avoiding change','nothing moving','settled but flat','resistant to what\'s next','holding on too long','false completion'],
      },
    },
  },

  // ─── AIR ─────────────────────────────────────────────────────────────────
  // "Air symbolizes the intellectual and communicative aspects of our psyches.
  //  It allows us to shift perspectives, find new solutions, and connect with others."

  air_1: {
    key: 'air_1',
    element: 'air',
    phaseIndex: 1,
    canonicalName: 'Directing',
    displayName: 'Directing',
    uiOrder: 10,
    boardRegion: 'ring',
    roleAffinities: ['marker'],
    developmentalLogic: 'Initiating and Guiding Thoughts state. Setting intellectual direction — embarking on new mental journeys, focusing curiosity, aligning thought with purpose.',
    typicalMarkers: ['direct','guide','notice','observe','think','focus','curiosity','intellectual','perspective','stepping back','look at','begin to understand','set intention for thinking'],
    precededBy: ['water_3', 'earth_1', 'fire_3'],
    typicallyFollowedBy: ['air_2'],
    stateSignatures: {
      positive: {
        description: 'Clear intellectual direction — curiosity alive, thoughts aligned with purpose, mental energy focused toward genuine understanding.',
        signals: ['intellectual clarity','focused curiosity','guided by genuine questions','directing thought toward what matters','mental energy aligned'],
      },
      neutral: {
        description: 'Beginning to direct thought and attention — emerging awareness without full clarity or direction.',
        signals: ['starting to notice','something becoming clearer','I think I see something','beginning to understand','intellectual curiosity stirring'],
      },
      negative: {
        description: 'Intellectualization or scattered mental energy — using thought to avoid feeling rather than guide toward truth.',
        signals: ['analyzing instead of feeling','staying in head','endless thinking','mental busyness as avoidance','scattered intellectualization'],
      },
    },
  },

  air_2: {
    key: 'air_2',
    element: 'air',
    phaseIndex: 2,
    canonicalName: 'Discerning',
    displayName: 'Discerning',
    uiOrder: 11,
    boardRegion: 'ring',
    roleAffinities: ['marker'],
    developmentalLogic: 'Deepening awareness state — finding deeper meanings, patterns, and discernment. The oblique moment where insight beyond ordinary thinking emerges.',
    typicalMarkers: ['discern','meaning','pattern','deeper','insight','understand','articulate','make sense','context','perspective','wisdom','distinguish','see clearly'],
    precededBy: ['air_1', 'water_3'],
    typicallyFollowedBy: ['air_3', 'earth_1'],
    stateSignatures: {
      positive: {
        description: 'Genuine discernment arising — deeper meanings and patterns accessible. Understanding that changes something, not just explains it.',
        signals: ['this makes sense now','deeper pattern recognized','understanding that enables movement','discernment arising','insight beyond ordinary thinking'],
      },
      neutral: {
        description: 'Working toward discernment — in process of finding meaning, not yet arrived.',
        signals: ['trying to make sense of it','working out what it means','in the oblique moment','insight forming','discernment in progress'],
      },
      negative: {
        description: 'Rationalization, narrative defense, or pseudo-discernment — mental pattern that protects from truth rather than contacts it.',
        signals: ['explaining away','story that justifies avoidance','intellectually satisfied but unchanged','rationalization masking feeling','narrative bypassing'],
      },
    },
  },

  air_3: {
    key: 'air_3',
    element: 'air',
    phaseIndex: 3,
    canonicalName: 'Delivering',
    displayName: 'Delivering',
    uiOrder: 12,
    boardRegion: 'ring',
    roleAffinities: ['marker', 'goal'],
    developmentalLogic: 'Integration and wisdom application state. Applying discerned wisdom to life and others. Communicating changed understanding outward — voice, teaching, expression from integration.',
    typicalMarkers: ['deliver','share','teach','express','transmit','voice','write','speak','offer','communicate','apply','wisdom into action','connecting with others'],
    precededBy: ['air_2', 'earth_3'],
    typicallyFollowedBy: ['fire_1'],
    stateSignatures: {
      positive: {
        description: 'Authentic wisdom delivery — sharing from embodied understanding. Expression that serves others and connects meaningfully.',
        signals: ['speaking from what I\'ve lived','teaching from experience','expression that helps others','wisdom delivered with humility','connecting through authentic voice'],
      },
      neutral: {
        description: 'Beginning to deliver the changed understanding — communication initiated but not yet from full integration.',
        signals: ['starting to share','trying to articulate','finding my voice','beginning to express what I\'ve learned','attempting to deliver'],
      },
      negative: {
        description: 'Performance, premature teaching, or needing to be heard before genuinely integrated.',
        signals: ['performing wisdom','teaching before living it','needing validation','expert mode without grounding','sharing for approval not service'],
      },
    },
  },

  // ─── AETHER ──────────────────────────────────────────────────────────────
  // "Aether represents the transcendent source from which all creation emanates.
  //  It is the limitless field of possibility and our interconnection with all of existence.
  //  It is our aetheric infinite-yet-embodied nature playing in the field of the manifest world."
  // "You stand in the space between the manifest and spiritual fields of potential,
  //  like a conductor before an orchestra, orchestrating worlds of beauty and a symphony of soul."
  //
  // Aether is central on the board (boardRegion: 'center') — not peripheral.
  // It is not phase-sequential in the same way as the ring elements; it appears at
  // threshold moments across the spiral. But it has its own triadic internal logic.

  aether_1: {
    key: 'aether_1',
    element: 'aether',
    phaseIndex: 1,
    canonicalName: 'Emanation',
    displayName: 'Emanation',
    uiOrder: 13,
    boardRegion: 'center',
    roleAffinities: ['marker'],
    developmentalLogic: 'Initiation and Integration state. The source field becoming accessible — initiating contact with the transcendent ground. Identity loosening and opening to something larger.',
    typicalMarkers: ['threshold','dissolve','opening','source','something larger','initiate','integrate','identity','who am I','liminal','soul','contact','between worlds','void','potential'],
    precededBy: ['earth_3', 'water_2'],
    typicallyFollowedBy: ['aether_2', 'water_1', 'fire_1'],
    stateSignatures: {
      positive: {
        description: 'Genuine threshold opening — identity loosening in service of growth. Contact with source field as invitation rather than threat.',
        signals: ['threshold welcomed','something larger present','identity reorganizing with grace','liminal space entered cleanly','opening to what wants to emerge'],
      },
      neutral: {
        description: 'Liminal ambiguity — threshold open but not yet resolved. Genuine uncertainty of identity in flux.',
        signals: ['don\'t know who I am right now','between two versions of myself','something dissolving','initiated uncertainty','in the middle of something large'],
      },
      negative: {
        description: 'Dissociation, inflation, or threshold used as escape from earth-work. Identity dissolution without direction or grounding.',
        signals: ['dissociated','floating without ground','lost without center','identity collapsed','mystical language replacing emotional work'],
      },
    },
  },

  aether_2: {
    key: 'aether_2',
    element: 'aether',
    phaseIndex: 2,
    canonicalName: 'Elevation',
    displayName: 'Elevation',
    uiOrder: 14,
    boardRegion: 'center',
    roleAffinities: ['marker'],
    developmentalLogic: 'Transcendent Awareness state. Moving beyond personal perspective into expanded awareness — the higher self and its relationship with the infinite-yet-embodied nature.',
    typicalMarkers: ['elevate','transcend','higher self','expand','awareness','cosmic','infinite','beyond personal','perspective shift','soul perspective','see from above','larger view','spiritual vision'],
    precededBy: ['aether_1'],
    typicallyFollowedBy: ['aether_3'],
    stateSignatures: {
      positive: {
        description: 'Genuine transcendent awareness — elevated perspective that integrates the personal without abandoning it. Higher self accessible and grounded.',
        signals: ['seeing from a larger perspective','higher self present','transcendent clarity','soul-level awareness available','expanded without inflation'],
      },
      neutral: {
        description: 'Elevation in process — touching the expanded view without full stabilization.',
        signals: ['glimpsing something larger','elevated perspective available sometimes','beginning to see from higher view','soul perspective emerging'],
      },
      negative: {
        description: 'Spiritual inflation or grandiosity — elevation used to place oneself above rather than within the web of life.',
        signals: ['inflation','special','chosen','above others','cosmic narcissism','spiritual superiority','elevation as ego defense'],
      },
    },
  },

  aether_3: {
    key: 'aether_3',
    element: 'aether',
    phaseIndex: 3,
    canonicalName: 'Equilibrium',
    displayName: 'Equilibrium',
    uiOrder: 15,
    boardRegion: 'center',
    roleAffinities: ['marker', 'grounding'],
    developmentalLogic: 'Harmony and Balance state. The conductor before the orchestra — coherently centered while consciously weaving all elements. Aetheric integration: infinite-yet-embodied nature at play in the manifest world.',
    typicalMarkers: ['equilibrium','harmony','balance','weave','center','coherent','whole','conductor','orchestrate','integrate all elements','at play','embodied and infinite','soul at home','grounded presence'],
    precededBy: ['aether_2'],
    typicallyFollowedBy: ['fire_1', 'earth_1'],
    stateSignatures: {
      positive: {
        description: 'Living in equilibrium — able to hold and consciously weave multiple elements simultaneously. Infinite-yet-embodied nature at play in the world. The soul at home.',
        signals: [
          'holding multiple truths at once without collapse',
          'centered while multiple things move',
          'weaving elements consciously',
          'soul-level coherence present',
          'grounded in the infinite',
          'at play in the world',
        ],
      },
      neutral: {
        description: 'Provisional equilibrium — moments of integration without full stability. The balance available sometimes but not yet sustained.',
        signals: ['some moments of real balance','glimpses of integration','not fully there yet but getting it','provisional equilibrium'],
      },
      negative: {
        description: 'False balance or bypassed tension — equilibrium as premature resolution rather than genuine integration of opposites.',
        signals: ['forcing harmony','avoiding necessary tension','false peace','spiritual bypassing disguised as balance','equilibrium as defense'],
      },
    },
  },
};

// ─── Compile-time registry integrity guards ───────────────────────────────
// These run once at module load. A misconfigured registry is a hard error.

const _allFacets = Object.values(FACET_REGISTRY);

if (_allFacets.length !== 15) {
  throw new Error(`[facetRegistry] Must contain exactly 15 facets, found ${_allFacets.length}`);
}

const _keySet = new Set(_allFacets.map(f => f.key));
if (_keySet.size !== 15) {
  throw new Error('[facetRegistry] Duplicate facet keys detected');
}

const _elementCounts = _allFacets.reduce<Record<string, number>>((acc, f) => {
  acc[f.element] = (acc[f.element] ?? 0) + 1;
  return acc;
}, {});
for (const [el, count] of Object.entries(_elementCounts)) {
  if (count !== 3) {
    throw new Error(`[facetRegistry] Element '${el}' must have exactly 3 facets, found ${count}`);
  }
}

const _aetherFacets = _allFacets.filter(f => f.element === 'aether');
if (_aetherFacets.length !== 3) {
  throw new Error(`[facetRegistry] Aether must have 3 facets, found ${_aetherFacets.length}`);
}
if (FACET_REGISTRY.aether_1.canonicalName !== 'Emanation') {
  throw new Error('[facetRegistry] aether_1 canonical name must be Emanation');
}
if (FACET_REGISTRY.aether_2.canonicalName !== 'Elevation') {
  throw new Error('[facetRegistry] aether_2 canonical name must be Elevation');
}
if (FACET_REGISTRY.aether_3.canonicalName !== 'Equilibrium') {
  throw new Error('[facetRegistry] aether_3 canonical name must be Equilibrium');
}

const _ringCount = _allFacets.filter(f => f.boardRegion === 'ring').length;
const _centerCount = _allFacets.filter(f => f.boardRegion === 'center').length;
if (_ringCount !== 12 || _centerCount !== 3) {
  throw new Error(`[facetRegistry] Expected 12 ring + 3 center facets, got ${_ringCount} ring + ${_centerCount} center`);
}

// ─── Helper functions ─────────────────────────────────────────────────────

export function getFacet(key: FacetKey): FacetDef {
  return FACET_REGISTRY[key];
}

export function facetFromElementPhase(
  element: SpiralogicElement,
  phaseIndex: 1 | 2 | 3
): FacetKey {
  return `${element}_${phaseIndex}` as FacetKey;
}

export function getAllFacets(): FacetDef[] {
  return Object.values(FACET_REGISTRY);
}

export function getFacetsByElement(element: SpiralogicElement): FacetDef[] {
  return Object.values(FACET_REGISTRY).filter(f => f.element === element);
}

export function getRingFacets(): FacetDef[] {
  return Object.values(FACET_REGISTRY).filter(f => f.boardRegion === 'ring');
}

export function getCenterFacets(): FacetDef[] {
  return Object.values(FACET_REGISTRY).filter(f => f.boardRegion === 'center');
}

/** Score how well a text snippet matches a facet's typical markers */
export function scoreFacetMatch(text: string, facetKey: FacetKey): number {
  const facet = FACET_REGISTRY[facetKey];
  const lower = text.toLowerCase();
  let matches = 0;
  for (const marker of facet.typicalMarkers) {
    if (lower.includes(marker.toLowerCase())) matches++;
  }
  return Math.min(matches / Math.max(facet.typicalMarkers.length, 1), 1);
}

/** Score valence match for a given facet from text */
export function scoreValence(text: string, facetKey: FacetKey): StateValence | null {
  const facet = FACET_REGISTRY[facetKey];
  const lower = text.toLowerCase();
  const scores: Record<StateValence, number> = { negative: 0, neutral: 0, positive: 0 };
  for (const valence of (['negative', 'neutral', 'positive'] as StateValence[])) {
    for (const signal of facet.stateSignatures[valence].signals) {
      if (lower.includes(signal.toLowerCase())) scores[valence]++;
    }
  }
  const max = Math.max(scores.negative, scores.neutral, scores.positive);
  if (max === 0) return null;
  if (scores.positive === max) return 'positive';
  if (scores.neutral === max) return 'neutral';
  return 'negative';
}

/** Find the best-matching facet for a text snippet */
export function detectFacet(text: string): { facet: FacetKey; score: number } | null {
  let best: { facet: FacetKey; score: number } | null = null;
  for (const key of Object.keys(FACET_REGISTRY) as FacetKey[]) {
    const score = scoreFacetMatch(text, key);
    if (score > 0 && (!best || score > best.score)) {
      best = { facet: key, score };
    }
  }
  return best;
}

// ─── Type guards and key utilities ───────────────────────────────────────

/** Set of all valid FacetKey strings — O(1) membership test */
export const VALID_FACET_KEYS: ReadonlySet<string> = new Set(
  Object.keys(FACET_REGISTRY) as FacetKey[]
);

/** Type guard: narrows an unknown string to FacetKey */
export function isFacetKey(s: string): s is FacetKey {
  return VALID_FACET_KEYS.has(s);
}

// ─── Legacy normalization ─────────────────────────────────────────────────

/**
 * Sentinel string for legacy undifferentiated Aether records that cannot be
 * safely mapped to a specific Aether facet without practitioner review.
 *
 * IMPORTANT: This is NOT a valid FacetKey. It is a signal to the UI that the
 * record predates the triadic Aether model and needs practitioner confirmation.
 * Do not coerce it to aether_1 unless you have semantic confidence.
 */
export const LEGACY_AETHER_SENTINEL = 'aether_legacy' as const;
export type LegacyAetherSentinel = typeof LEGACY_AETHER_SENTINEL;

/**
 * Normalize a facet key from older records that may use the legacy singleton
 * 'aether' key (before Aether was differentiated into three facets).
 *
 * Returns LEGACY_AETHER_SENTINEL ('aether_legacy') when the raw string is the
 * undifferentiated singleton 'aether' — callers must handle this explicitly.
 *
 * Only call normalizeLegacyFacetKey when a concrete FacetKey is absolutely
 * required (e.g. DB writes, board rendering). In those cases the coercion to
 * aether_1 is explicitly lossy — the practitioner should later confirm which
 * specific Aether facet applies.
 */
export function normalizeLegacyFacetKey(raw: string): FacetKey | LegacyAetherSentinel {
  if (isFacetKey(raw)) return raw;
  if (raw === 'aether') return LEGACY_AETHER_SENTINEL;
  // element-only strings without phase: default to phase 1
  const elementMatch = raw.match(/^(fire|water|earth|air|aether)$/i);
  if (elementMatch) {
    const el = elementMatch[1].toLowerCase() as SpiralogicElement;
    if (el === 'aether') return LEGACY_AETHER_SENTINEL;
    return `${el}_1` as FacetKey;
  }
  return LEGACY_AETHER_SENTINEL; // unknown string — treat as undifferentiated
}

/**
 * Coerce a raw facet string to a concrete FacetKey, with fallback.
 *
 * Use this only when a FacetKey is required and you have already notified
 * the caller that legacy Aether records are being coerced to aether_1.
 * The returned facet should be surfaced as provisional in the UI.
 */
export function coerceLegacyFacetKey(raw: string, fallback: FacetKey = 'aether_1'): FacetKey {
  const normalized = normalizeLegacyFacetKey(raw);
  return normalized === LEGACY_AETHER_SENTINEL ? fallback : normalized;
}

/**
 * Same as coerceLegacyFacetKey but also returns NormalizationMeta when
 * coercion occurred. Use this in rowToNode and any path that needs to
 * preserve provenance for analytics or UI transparency.
 *
 * Returns { facet, meta: undefined } for canonical rows (no coercion).
 * Returns { facet, meta: NormalizationMeta } when coercion was required.
 */
export function coerceLegacyFacetKeyWithMeta(
  raw: string,
  fallback: FacetKey = 'aether_1',
): { facet: FacetKey; meta: NormalizationMeta | undefined } {
  if (isFacetKey(raw)) {
    return { facet: raw, meta: undefined };
  }
  const facet = coerceLegacyFacetKey(raw, fallback);
  return {
    facet,
    meta: {
      wasLegacyFacet: true,
      originalFacetValue: raw,
      wasCoercedToFacetKey: facet,
    },
  };
}

// ─── Types for case element nodes ─────────────────────────────────────────

export type NodeSourceType = 'case_memory' | 'case_note' | 'mission' | 'follow_up' | 'manual';

/**
 * Provenance metadata attached when rowToNode coerces a legacy or invalid
 * facet string into a canonical FacetKey.
 *
 * Consumers should treat any node with normalizationMeta as provisional:
 *   - analytics: exclude or count separately (may distort transition graphs)
 *   - board UI: surface as "historically ambiguous" rather than confirmed
 *   - future migrations: target wasCoercedToFacetKey rows for practitioner review
 */
export interface NormalizationMeta {
  /** True when the original DB value was not a valid FacetKey */
  wasLegacyFacet: boolean;
  /** The raw string as stored in the DB before coercion */
  originalFacetValue: string;
  /** The FacetKey it was coerced to (same as node.facet) */
  wasCoercedToFacetKey: FacetKey;
}

export interface CaseElementNode {
  id: string;
  caseId: string;
  practitionerId: string;
  facet: FacetKey;
  element: SpiralogicElement;
  phaseIndex: 1 | 2 | 3;
  role: NodeRole;
  stateValence: StateValence | null;
  confidence: number | null;
  sourceType: NodeSourceType | null;
  sourceId: string | null;
  sessionContext: string | null;
  confirmedByPractitioner: boolean;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  practitionerNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Present only when the facet was normalized from a legacy or invalid DB value.
   * Undefined for all canonical rows — absence means no coercion occurred.
   */
  normalizationMeta?: NormalizationMeta;
}
