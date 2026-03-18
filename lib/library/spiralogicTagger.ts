/**
 * Spiralogic Metadata Tagger
 *
 * Classifies library chunks with elemental and phase metadata
 * so retrieval can be tuned to the member's spiral state.
 *
 * Three layers:
 * 1. Keyword-based (fast, all chunks at ingestion time)
 * 2. Inherited (wisdom-library entries already carry element/phase)
 * 3. AI-assisted (optional post-process for ambiguous chunks)
 *
 * The framework shapes everything. But speaks nothing.
 */

// =============================================================================
// TYPES
// =============================================================================

export type SpiralogicElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type SpiralogicPhase = 1 | 2 | 3;

export interface SpiralogicTag {
  element: SpiralogicElement | null;
  element_secondary: SpiralogicElement | null;
  phase: SpiralogicPhase | null;
  domain: string;
  categories: string[];
  spiralogic_tags: string[];  // e.g., ['WATER_2', 'FIRE_1']
}

// =============================================================================
// ELEMENT DETECTION PATTERNS
// =============================================================================

/**
 * Keywords that signal elemental territory.
 * Weighted: first array = strong signal, second = supporting signal.
 * A chunk needs either 1 strong or 2+ supporting to be classified.
 */
const ELEMENT_PATTERNS: Record<SpiralogicElement, { strong: RegExp[]; supporting: RegExp[] }> = {
  fire: {
    strong: [
      /\binitiat/i, /\bcalling\b/i, /\bcourage\b/i, /\bignit/i,
      /\bvision quest/i, /\bhero.?s?.?journey/i, /\btransform/i,
      /\bwill\b/i, /\bactivat/i, /\bawaken/i
    ],
    supporting: [
      /\baction\b/i, /\bbegin/i, /\bspark/i, /\bstart/i, /\benergy\b/i,
      /\bpassion\b/i, /\bpurpose\b/i, /\bdrive\b/i, /\bcommit/i,
      /\btest\b/i, /\btrial\b/i, /\bchalleng/i, /\bresist/i,
      /\bidentity/i, /\bbecoming\b/i, /\bnew self/i
    ]
  },
  water: {
    strong: [
      /\bshadow work/i, /\bdescent\b/i, /\bunderworld/i, /\bdark night/i,
      /\bvulnerab/i, /\bgrief\b/i, /\bdissolut/i, /\bunconscious\b/i,
      /\bshadow\b/i, /\banima\b/i, /\banimus\b/i
    ],
    supporting: [
      /\bemotion/i, /\bfeel/i, /\bdepth/i, /\bflow\b/i, /\btears\b/i,
      /\bsurrender/i, /\bletting go/i, /\breleas/i, /\bwound/i,
      /\binner child/i, /\bpsyche\b/i, /\bdream\b/i, /\bintuition/i,
      /\bcompassion/i, /\bempathy/i
    ]
  },
  earth: {
    strong: [
      /\bembodi/i, /\bground/i, /\bcontainer\b/i, /\bstructur/i,
      /\bdiscipline\b/i, /\bpracti[cz]/i, /\britual\b/i, /\bbody\b/i,
      /\bsomatic/i
    ],
    supporting: [
      /\bstable/i, /\bfoundat/i, /\bhabit/i, /\broot/i, /\bform\b/i,
      /\bmateria/i, /\bphysical/i, /\bsense\b/i, /\bbreath/i,
      /\bcontain/i, /\bboundar/i, /\bresource/i, /\bmaintain/i,
      /\bnourish/i, /\bcare\b/i
    ]
  },
  air: {
    strong: [
      /\bteach/i, /\barticul/i, /\bcommunicat/i, /\btruth.?tell/i,
      /\bdialog/i, /\bperspective/i, /\bwisdom tradition/i,
      /\bmythic/i, /\bcollective wisdom/i
    ],
    supporting: [
      /\bspeak/i, /\bshar/i, /\bvoice\b/i, /\bstory/i, /\bnarrative/i,
      /\bmeaning/i, /\bunderstand/i, /\binsight/i, /\bpattern/i,
      /\bconnect/i, /\brelation/i, /\bexpress/i, /\blanguage/i,
      /\bmentoring/i, /\bguiding/i
    ]
  },
  aether: {
    strong: [
      /\bintegrat/i, /\bwholeness/i, /\bunity\b/i, /\btranscend/i,
      /\bsynthes[iz]/i, /\bnondual/i, /\bmystical union/i,
      /\bcomplete/i, /\bindividuat/i
    ],
    supporting: [
      /\bsacred\b/i, /\bdivine\b/i, /\beternal/i, /\binfinit/i,
      /\bcosmic/i, /\buniversal/i, /\bspiritual/i, /\bsoul\b/i,
      /\bessence\b/i, /\bpresence\b/i, /\bsilence\b/i, /\bstillness/i,
      /\bparadox/i, /\bboth.?and/i
    ]
  }
};

// =============================================================================
// ELEMENT-SPECIFIC THRESHOLDS
// Water/Aether use lower thresholds because their language is subtler.
// Fire/Earth/Air use standard threshold.
// =============================================================================

const ELEMENT_THRESHOLDS: Record<SpiralogicElement, number> = {
  fire: 3,
  earth: 3,
  air: 3,
  water: 2,
  aether: 2,
};

// =============================================================================
// SOFT CUES — high-precision, low-weight signals for Water/Aether
// Scored at +0.5 each. Help borderline cases without swamping.
// =============================================================================

const SOFT_CUES: Partial<Record<SpiralogicElement, RegExp[]>> = {
  water: [
    /\bgrief\b/i, /\bmourning\b/i, /\btears\b/i, /\blonging\b/i,
    /\btender\b/i, /\bsoften/i, /\bfeel into/i, /\bheartbreak/i,
    /\bshame\b/i, /\bforgiv/i, /\bimaginal/i, /\battachment\b/i,
    /\bsorrow\b/i, /\byearn/i, /\blamenta?/i, /\bmelanchol/i,
    /\brupture/i, /\brepair\b/i, /\babandone?/i,
  ],
  aether: [
    /\bsilence\b/i, /\bstillness\b/i, /\bspacious/i, /\bemptiness\b/i,
    /\bvoid\b/i, /\bnon-?dual/i, /\bmystery\b/i, /\bunknowing\b/i,
    /\bliminal/i, /\bthreshold\b/i, /\bnuminous/i, /\bapophatic/i,
    /\bcontemplat/i, /\bfield\b/i, /\btranspersonal/i, /\bgroundless/i,
  ],
};

// =============================================================================
// PHASE DETECTION PATTERNS
// =============================================================================

const PHASE_PATTERNS: Record<SpiralogicPhase, { strong: RegExp[]; supporting: RegExp[] }> = {
  1: {  // Begins
    strong: [
      /\binitiat/i, /\bfirst step/i, /\bawaken/i, /\bopen/i,
      /\bemerg/i, /\bnew\b.*\bbegin/i, /\bthreshold\b/i
    ],
    supporting: [
      /\bnew\b/i, /\bfresh\b/i, /\bstart/i, /\benter/i,
      /\bdiscover/i, /\bcurious/i, /\bexplor/i, /\bseed\b/i,
      /\bcalling\b/i, /\bpossibil/i
    ]
  },
  2: {  // Deepens
    strong: [
      /\bshadow/i, /\bdescent\b/i, /\bdark night/i, /\btrial\b/i,
      /\bcrisis\b/i, /\bstruggl/i, /\bdeepen/i, /\bunderworld/i
    ],
    supporting: [
      /\bchalleng/i, /\bresist/i, /\bdifficult/i, /\bpain\b/i,
      /\btest/i, /\bconfront/i, /\bwound/i, /\bdoubt\b/i,
      /\bfear\b/i, /\bloss\b/i, /\bsuffer/i
    ]
  },
  3: {  // Integrates
    strong: [
      /\bintegrat/i, /\bharvest/i, /\bwisdom\b/i, /\bmaster/i,
      /\bcomplet/i, /\breturn\b/i, /\bembodi/i, /\bwhole/i
    ],
    supporting: [
      /\bmatur/i, /\bserv/i, /\bgive back/i, /\bteach/i,
      /\btransmit/i, /\blegacy\b/i, /\bsustain/i, /\bsteward/i,
      /\bpeace\b/i, /\bacceptan/i, /\bwhole/i
    ]
  }
};

// =============================================================================
// CLASSIFICATION FUNCTIONS
// =============================================================================

/**
 * Score an element against text content.
 * Returns 0 if no match, higher number = stronger signal.
 */
export function scoreElement(text: string, element: SpiralogicElement): number {
  const patterns = ELEMENT_PATTERNS[element];
  let score = 0;

  for (const pattern of patterns.strong) {
    if (pattern.test(text)) score += 3;
  }

  for (const pattern of patterns.supporting) {
    if (pattern.test(text)) score += 1;
  }

  // Soft cues: +0.5 each, only for elements with subtle vocabularies
  const softCues = SOFT_CUES[element];
  if (softCues) {
    for (const cue of softCues) {
      if (cue.test(text)) score += 0.5;
    }
  }

  return score;
}

/**
 * Score a phase against text content.
 */
function scorePhase(text: string, phase: SpiralogicPhase): number {
  const patterns = PHASE_PATTERNS[phase];
  let score = 0;

  for (const pattern of patterns.strong) {
    if (pattern.test(text)) score += 3;
  }

  for (const pattern of patterns.supporting) {
    if (pattern.test(text)) score += 1;
  }

  return score;
}

/**
 * Classify a chunk's Spiralogic metadata from its content.
 *
 * @param content - The chunk text to classify
 * @param sourceMeta - Optional pre-existing metadata (e.g., from wisdom-library.ts)
 * @returns SpiralogicTag with element, phase, domain, categories
 */
export function classifyChunkSpiralogic(
  content: string,
  sourceMeta?: Record<string, any>
): SpiralogicTag {
  // If source metadata already has element/phase, inherit directly
  // (This handles wisdom-library.ts entries)
  if (sourceMeta?.element && sourceMeta?.phase) {
    const phaseMap: Record<string, SpiralogicPhase> = {
      begins: 1,
      deepens: 2,
      integrates: 3,
    };

    const element = sourceMeta.element as SpiralogicElement;
    const phase = typeof sourceMeta.phase === 'number'
      ? sourceMeta.phase as SpiralogicPhase
      : phaseMap[sourceMeta.phase] || null;

    const tags: string[] = [];
    if (element && phase) {
      tags.push(`${element.toUpperCase()}_${phase}`);
    }

    return {
      element,
      element_secondary: null,
      phase,
      domain: sourceMeta.domain || sourceMeta.tradition || 'wisdom',
      categories: sourceMeta.categories || [sourceMeta.tradition].filter(Boolean),
      spiralogic_tags: tags,
    };
  }

  // Keyword-based classification for raw text chunks
  const testText = content.substring(0, 3000);  // First 3000 chars for efficiency

  // Score each element
  const elementScores: Record<SpiralogicElement, number> = {
    fire: scoreElement(testText, 'fire'),
    water: scoreElement(testText, 'water'),
    earth: scoreElement(testText, 'earth'),
    air: scoreElement(testText, 'air'),
    aether: scoreElement(testText, 'aether'),
  };

  // Find dominant element (element-specific thresholds — Water/Aether are subtler)
  const elementEntries = Object.entries(elementScores) as [SpiralogicElement, number][];
  elementEntries.sort((a, b) => b[1] - a[1]);
  const topElement = elementEntries[0];
  const element: SpiralogicElement | null =
    topElement[1] >= ELEMENT_THRESHOLDS[topElement[0]] ? topElement[0] : null;

  // Secondary element: runner-up within 1 point AND above its own threshold
  const secondElement = elementEntries[1];
  const element_secondary: SpiralogicElement | null =
    (element !== null
      && secondElement[1] >= ELEMENT_THRESHOLDS[secondElement[0]]
      && topElement[1] - secondElement[1] <= 1)
    ? secondElement[0] : null;

  // Score each phase
  const phaseScores: Record<SpiralogicPhase, number> = {
    1: scorePhase(testText, 1),
    2: scorePhase(testText, 2),
    3: scorePhase(testText, 3),
  };

  // Find dominant phase (must have score >= 3)
  const phaseEntries = Object.entries(phaseScores).map(
    ([k, v]) => [parseInt(k) as SpiralogicPhase, v] as [SpiralogicPhase, number]
  );
  phaseEntries.sort((a, b) => b[1] - a[1]);
  const topPhase = phaseEntries[0];
  const phase: SpiralogicPhase | null = topPhase[1] >= 3 ? topPhase[0] : null;

  // Build spiralogic tags for matched facets
  const spiralogic_tags: string[] = [];
  if (element && phase) {
    spiralogic_tags.push(`${element.toUpperCase()}_${phase}`);
  }

  // Also add secondary facets if they score well (>= 5)
  for (const [el, score] of elementEntries) {
    if (score >= 5 && el !== element) {
      for (const [ph, phScore] of phaseEntries) {
        if (phScore >= 3) {
          spiralogic_tags.push(`${el.toUpperCase()}_${ph}`);
        }
      }
    }
  }

  // Domain and categories from content (reusing ChunkingService patterns would
  // require importing the whole service — instead we do lightweight detection)
  const domain = detectDomain(testText);
  const categories = detectCategories(testText);

  return {
    element,
    element_secondary,
    phase,
    domain,
    categories,
    spiralogic_tags,
  };
}

/**
 * Merge Spiralogic tags into existing chunk metadata JSONB.
 */
export function mergeTagsIntoMeta(
  existingMeta: Record<string, any>,
  tags: SpiralogicTag
): Record<string, any> {
  return {
    ...existingMeta,
    element: tags.element,
    element_secondary: tags.element_secondary,
    phase: tags.phase,
    domain: tags.domain,
    categories: tags.categories,
    spiralogic_tags: tags.spiralogic_tags,
  };
}

// =============================================================================
// LIGHTWEIGHT DOMAIN / CATEGORY DETECTION
// =============================================================================

function detectDomain(text: string): string {
  const patterns: [string, RegExp[]][] = [
    ['jungian', [/jung/i, /archetype/i, /alchemy/i, /hillman/i, /individuat/i]],
    ['therapeutic', [/cbt/i, /dbt/i, /therapy/i, /psychotherap/i, /treatment/i]],
    ['divination', [/enneagram/i, /human.?design/i, /i.?ching/i, /astrology/i, /tarot/i]],
    ['somatic', [/breath/i, /vagus/i, /somatic/i, /interocepti/i]],
    ['consciousness', [/consciousness/i, /divided.?brain/i, /mcgilchrist/i, /whitehead/i]],
    ['philosophy', [/phenomenolog/i, /existential/i, /heidegger/i, /being.?and/i]],
    ['mystical', [/hermetic/i, /gnostic/i, /kabbalah/i, /sufi/i, /mystic/i]],
    ['indigenous', [/indigenous/i, /ancestral/i, /dreamtime/i, /medicine wheel/i]],
    ['buddhist', [/buddhis/i, /dharma/i, /mindful/i, /sutra/i, /zen\b/i]],
    ['taoist', [/tao/i, /daoist/i, /wu.?wei/i, /yin.?yang/i]],
  ];

  for (const [domain, domainPatterns] of patterns) {
    if (domainPatterns.some(p => p.test(text))) {
      return domain;
    }
  }

  return 'general';
}

function detectCategories(text: string): string[] {
  const categories: string[] = [];

  const patterns: [string, RegExp[]][] = [
    ['jungian', [/jung/i, /archetype/i, /shadow/i, /anima/i]],
    ['somatic', [/somatic/i, /body/i, /breath/i, /vagus/i]],
    ['alchemy', [/alchemy/i, /alchemical/i, /hermet/i, /nigredo/i, /albedo/i, /rubedo/i]],
    ['consciousness', [/consciousness/i, /panpsych/i, /whitehead/i]],
    ['mythology', [/myth/i, /folklore/i, /hero.?journey/i]],
    ['trauma', [/trauma/i, /ptsd/i, /wound/i]],
    ['meditation', [/meditat/i, /contemplat/i, /mindful/i, /silent/i]],
    ['dream', [/dream/i, /lucid/i, /oneiro/i]],
    ['divination', [/i.?ching/i, /tarot/i, /enneagram/i, /human.?design/i]],
    ['shamanic', [/shaman/i, /journey/i, /spirit.?world/i]],
  ];

  for (const [category, catPatterns] of patterns) {
    if (catPatterns.some(p => p.test(text))) {
      categories.push(category);
    }
  }

  return categories;
}

// =============================================================================
// SOURCE FILE FILTERING
// =============================================================================

/**
 * Patterns that indicate a file is operational/technical, not wisdom content.
 * These should be excluded from Library ingestion.
 */
const OPERATIONAL_FILE_PATTERNS = [
  /BETA_DASHBOARD/i,
  /ARCHITECTURE/i,
  /API_SPEC/i,
  /DEPLOYMENT/i,
  /MIGRATION/i,
  /CHANGELOG/i,
  /README/i,
  /TODO/i,
  /ROADMAP/i,
  /SPRINT/i,
  /TICKET/i,
  /ISSUE/i,
  /PR_REVIEW/i,
  /CODE_REVIEW/i,
  /RELEASE_NOTE/i,
  /SETUP_GUIDE/i,
  /INSTALL/i,
  /CONFIG/i,
  /DEBUG/i,
  /TEST_PLAN/i,
  /WORKFLOW/i,
  /PIPELINE/i,
  /DOCKER/i,
  /CADDY/i,
  /NGINX/i,
  /\.env/i,
  /package\.json/i,
  /tsconfig/i,
];

/**
 * Check if a filename indicates operational (non-wisdom) content.
 */
export function isOperationalFile(filename: string): boolean {
  return OPERATIONAL_FILE_PATTERNS.some(p => p.test(filename));
}

/**
 * Infer source type from filename.
 */
export function inferSourceType(filename: string): 'book' | 'teaching' | 'article' | 'transcript' | 'manual' | 'txt' {
  const lower = filename.toLowerCase();

  if (/manual|guide|handbook|protocol/i.test(lower)) return 'manual';
  if (/transcript|conversation|interview|podcast/i.test(lower)) return 'transcript';
  if (/teaching|lesson|lecture|sermon/i.test(lower)) return 'teaching';
  if (/article|paper|essay|journal/i.test(lower)) return 'article';

  // Longer texts with known authors are likely books
  if (/jung|hillman|von.?franz|mcgilchrist|whitehead|gebser|hesse|corbin|campbell/i.test(lower)) return 'book';
  if (/hermetic|i.?ching|tao|upanishad|sutra|gita|bardo|vedant/i.test(lower)) return 'book';

  return 'txt';
}

/**
 * Try to extract author from filename.
 * E.g., "Carl-Jung-Red-Book.txt" → "Carl Jung"
 */
export function extractAuthor(filename: string): string | null {
  const knownAuthors: [RegExp, string][] = [
    [/jung/i, 'Carl Jung'],
    [/hillman/i, 'James Hillman'],
    [/von.?franz/i, 'Marie-Louise von Franz'],
    [/mcgilchrist/i, 'Iain McGilchrist'],
    [/whitehead/i, 'Alfred North Whitehead'],
    [/gebser/i, 'Jean Gebser'],
    [/hesse/i, 'Hermann Hesse'],
    [/corbin/i, 'Henry Corbin'],
    [/campbell/i, 'Joseph Campbell'],
    [/tarnas/i, 'Richard Tarnas'],
    [/grof/i, 'Stanislav Grof'],
    [/mindell/i, 'Arnold Mindell'],
    [/lao.?tzu/i, 'Lao Tzu'],
    [/rumi/i, 'Rumi'],
    [/hafiz/i, 'Hafiz'],
    [/meister.?eckhart/i, 'Meister Eckhart'],
    [/teresa.*avila/i, 'Teresa of Ávila'],
    [/john.*cross/i, 'John of the Cross'],
    [/edinger/i, 'Edward Edinger'],
    [/neumann/i, 'Erich Neumann'],
  ];

  for (const [pattern, author] of knownAuthors) {
    if (pattern.test(filename)) return author;
  }

  return null;
}
