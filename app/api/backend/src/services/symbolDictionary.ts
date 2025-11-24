/**
 * Symbol Dictionary - Extendable Archetypal Symbol System
 * Maps user language to elemental, archetypal, and mythic dimensions
 */

export interface SymbolEntry {
  regex: RegExp;        // detection pattern
  label: string;        // clean label shown to user
  element?: string;     // optional elemental association
  archetype?: string;   // optional archetypal mapping (Hero, Sage, Shadow, etc.)
  meaning?: string;     // short mythic or therapeutic note
  weight?: number;      // importance weight (1-10, default 5)
}

export const SYMBOL_DICTIONARY: SymbolEntry[] = [
  // Celestial Bodies
  {
    regex: /\bmoon\b|\blunar\b|\bmoonlight\b/i,
    label: "Moon",
    element: "water",
    archetype: "Dreamer",
    meaning: "Cycles, intuition, unconscious tides",
    weight: 8
  },
  {
    regex: /\bsun\b|\bsolar\b|\bsunlight\b|\bsunrise\b|\bsunset\b/i,
    label: "Sun",
    element: "fire",
    archetype: "Sovereign",
    meaning: "Consciousness, vitality, creative force",
    weight: 8
  },
  {
    regex: /\bstar\b|\bstars\b|\bstarlight\b|\bconstellation\b/i,
    label: "Stars",
    element: "spirit",
    archetype: "Mystic",
    meaning: "Guidance, destiny, infinite possibility",
    weight: 7
  },

  // Animals
  {
    regex: /\bstag\b|\bdeer\b|\bantler\b/i,
    label: "Stag",
    element: "earth",
    archetype: "Guide",
    meaning: "Nobility, liminality, pathfinding",
    weight: 7
  },
  {
    regex: /\bwolf\b|\bwolves\b|\bhowl\b/i,
    label: "Wolf",
    element: "earth",
    archetype: "Wild One",
    meaning: "Instinct, loyalty, shadow integration",
    weight: 8
  },
  {
    regex: /\bserpent\b|\bsnake\b|\bpython\b/i,
    label: "Serpent",
    element: "water",
    archetype: "Transformer",
    meaning: "Rebirth, kundalini, hidden wisdom",
    weight: 9
  },
  {
    regex: /\bdragon\b|\bwyrm\b/i,
    label: "Dragon",
    element: "fire",
    archetype: "Guardian",
    meaning: "Power, treasure keeper, primal force",
    weight: 9
  },
  {
    regex: /\bphoenix\b|\bfirebird\b/i,
    label: "Phoenix",
    element: "fire",
    archetype: "Resurrector",
    meaning: "Death and rebirth, eternal renewal",
    weight: 10
  },
  {
    regex: /\bowl\b|\braven\b|\bcrow\b/i,
    label: "Night Bird",
    element: "air",
    archetype: "Oracle",
    meaning: "Wisdom, messages, threshold crossing",
    weight: 7
  },

  // Natural Elements
  {
    regex: /\briver\b|\bstream\b|\bflow\b|\bcurrent\b/i,
    label: "River",
    element: "water",
    archetype: "Flow",
    meaning: "Movement, transformation, surrender",
    weight: 6
  },
  {
    regex: /\bocean\b|\bsea\b|\btide\b|\bwave\b/i,
    label: "Ocean",
    element: "water",
    archetype: "Depth",
    meaning: "Unconscious, emotional vastness, mystery",
    weight: 8
  },
  {
    regex: /\bfire\b|\bflame\b|\bignite\b|\bburn\b|\blaze\b/i,
    label: "Flame",
    element: "fire",
    archetype: "Igniter",
    meaning: "Passion, transformation, willpower",
    weight: 7
  },
  {
    regex: /\bmountain\b|\bpeak\b|\bsummit\b|\brock\b|\bstone\b/i,
    label: "Mountain",
    element: "earth",
    archetype: "Pillar",
    meaning: "Stability, endurance, perspective",
    weight: 7
  },
  {
    regex: /\bforest\b|\btree\b|\bwood\b|\bgrove\b/i,
    label: "Forest",
    element: "earth",
    archetype: "Sanctuary",
    meaning: "Growth, mystery, sacred space",
    weight: 6
  },
  {
    regex: /\bstorm\b|\bthunder\b|\blightning\b|\btempest\b/i,
    label: "Storm",
    element: "air",
    archetype: "Catalyst",
    meaning: "Change, power, emotional release",
    weight: 8
  },
  {
    regex: /\bwind\b|\bbreeze\b|\bgale\b|\bbreath\b/i,
    label: "Wind",
    element: "air",
    archetype: "Messenger",
    meaning: "Spirit, communication, change",
    weight: 6
  },

  // Sacred Objects
  {
    regex: /\bsword\b|\bblade\b|\bdagger\b/i,
    label: "Sword",
    element: "air",
    archetype: "Warrior",
    meaning: "Discernment, boundaries, truth-cutting",
    weight: 8
  },
  {
    regex: /\bchalice\b|\bcup\b|\bgrail\b|\bcauldron\b/i,
    label: "Chalice",
    element: "water",
    archetype: "Receiver",
    meaning: "Receptivity, emotions, sacred feminine",
    weight: 8
  },
  {
    regex: /\bwand\b|\bstaff\b|\bscepter\b/i,
    label: "Wand",
    element: "fire",
    archetype: "Magician",
    meaning: "Will, creation, directed energy",
    weight: 7
  },
  {
    regex: /\bcrystal\b|\bgem\b|\bjewel\b|\bdiamond\b/i,
    label: "Crystal",
    element: "earth",
    archetype: "Clarifier",
    meaning: "Clarity, amplification, stored wisdom",
    weight: 6
  },
  {
    regex: /\bmirror\b|\breflection\b/i,
    label: "Mirror",
    element: "water",
    archetype: "Revealer",
    meaning: "Self-awareness, truth, shadow work",
    weight: 8
  },

  // Mythic Spaces
  {
    regex: /\btower\b|\bcastle\b|\bfortress\b/i,
    label: "Tower",
    element: "earth",
    archetype: "Hermit",
    meaning: "Isolation, protection, higher perspective",
    weight: 7
  },
  {
    regex: /\bcave\b|\bgrotto\b|\bunderground\b/i,
    label: "Cave",
    element: "earth",
    archetype: "Womb",
    meaning: "Inner journey, gestation, hidden treasure",
    weight: 8
  },
  {
    regex: /\bgarden\b|\bparadise\b|\beden\b/i,
    label: "Garden",
    element: "earth",
    archetype: "Nurturer",
    meaning: "Cultivation, beauty, sacred growth",
    weight: 6
  },
  {
    regex: /\bbridge\b|\bcrossing\b|\bthreshold\b/i,
    label: "Bridge",
    element: "air",
    archetype: "Mediator",
    meaning: "Transition, connection, passage",
    weight: 7
  },
  {
    regex: /\blabyrinth\b|\bmaze\b|\bspiral\b/i,
    label: "Labyrinth",
    element: "spirit",
    archetype: "Journey",
    meaning: "Sacred path, center-seeking, transformation",
    weight: 9
  },

  // Emotional/Psychological Symbols
  {
    regex: /\bshadow\b|\bdark\b|\bdarkness\b/i,
    label: "Shadow",
    element: "void",
    archetype: "Shadow",
    meaning: "Repressed aspects, hidden power, integration work",
    weight: 9
  },
  {
    regex: /\blight\b|\billuminate\b|\bbrightness\b|\bglow\b/i,
    label: "Light",
    element: "fire",
    archetype: "Illuminator",
    meaning: "Consciousness, hope, revelation",
    weight: 7
  },
  {
    regex: /\bvoid\b|\bempty\b|\bemptiness\b|\bnothing\b/i,
    label: "Void",
    element: "void",
    archetype: "Mystic",
    meaning: "Potential, surrender, fertile darkness",
    weight: 9
  },
  {
    regex: /\bheart\b|\blove\b|\bcompassion\b/i,
    label: "Heart",
    element: "fire",
    archetype: "Lover",
    meaning: "Connection, courage, emotional center",
    weight: 8
  },

  // Transformation Symbols
  {
    regex: /\bcocoon\b|\bchrysalis\b|\bmetamorphosis\b/i,
    label: "Chrysalis",
    element: "earth",
    archetype: "Transformer",
    meaning: "Dissolution, gestation, emergence",
    weight: 9
  },
  {
    regex: /\bseed\b|\bplant\b|\bgrow\b|\broot\b/i,
    label: "Seed",
    element: "earth",
    archetype: "Potential",
    meaning: "Beginning, patience, hidden growth",
    weight: 6
  },
  {
    regex: /\bdeath\b|\bdying\b|\bend\b|\bfinish\b/i,
    label: "Death",
    element: "void",
    archetype: "Reaper",
    meaning: "Ending, release, transformation gateway",
    weight: 9
  },
  {
    regex: /\bbirth\b|\bborn\b|\bnew\b|\bbeginning\b/i,
    label: "Birth",
    element: "fire",
    archetype: "Creator",
    meaning: "New beginning, innocence, potential",
    weight: 8
  },

  // Spiritual/Mystical
  {
    regex: /\bangel\b|\bwings\b|\bdivine\b/i,
    label: "Angel",
    element: "air",
    archetype: "Guardian",
    meaning: "Protection, messages, higher self",
    weight: 8
  },
  {
    regex: /\bdemon\b|\bdevil\b|\btemptation\b/i,
    label: "Demon",
    element: "fire",
    archetype: "Tempter",
    meaning: "Shadow work, desires, transformation catalyst",
    weight: 8
  },
  {
    regex: /\bgoddess\b|\bdivine feminine\b|\bmother\b/i,
    label: "Goddess",
    element: "water",
    archetype: "Great Mother",
    meaning: "Creation, nurturing, cyclical wisdom",
    weight: 9
  },
  {
    regex: /\bgod\b|\bdivine masculine\b|\bfather\b/i,
    label: "God",
    element: "fire",
    archetype: "Sky Father",
    meaning: "Authority, protection, cosmic order",
    weight: 9
  },
  {
    regex: /\bspirit\b|\bghost\b|\bancestor\b/i,
    label: "Spirit",
    element: "spirit",
    archetype: "Ancestor",
    meaning: "Guidance, continuity, unseen support",
    weight: 7
  }
];

/**
 * Get symbols by element
 */
export function getSymbolsByElement(element: string): SymbolEntry[] {
  return SYMBOL_DICTIONARY.filter(symbol => 
    symbol.element?.toLowerCase() === element.toLowerCase()
  );
}

/**
 * Get symbols by archetype
 */
export function getSymbolsByArchetype(archetype: string): SymbolEntry[] {
  return SYMBOL_DICTIONARY.filter(symbol => 
    symbol.archetype?.toLowerCase() === archetype.toLowerCase()
  );
}

/**
 * Get high-weight symbols (8+)
 */
export function getMajorSymbols(): SymbolEntry[] {
  return SYMBOL_DICTIONARY.filter(symbol => 
    (symbol.weight || 5) >= 8
  );
}