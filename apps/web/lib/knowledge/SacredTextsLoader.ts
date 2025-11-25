/**
 * Sacred Texts Loader - MAIA's Mystical & Archetypal Wisdom Library
 * Integrates oracle cards, shamanic wisdom, consciousness frameworks, and archetypal guidebooks
 *
 * These texts form MAIA's deep understanding of:
 * - Mystical Shaman Oracle: Earth-based wisdom and shamanic archetypes
 * - Wild Unknown Archetypes: Shadow work and archetypal patterns
 * - Moonology Oracle: Lunar wisdom and cyclical consciousness
 * - Spirit Guidebook: Spiritual guidance and metaphysical frameworks
 * - The Shaman's Dream: Deep shamanic journey and transformation
 * - High-Order Design Principles: Consciousness architecture and systemic design
 * - The Next Octave: Evolution of consciousness as living system
 */

export const SACRED_TEXTS_LIBRARY = {
  shamanic: {
    texts: [
      {
        title: "Mystical Shaman Oracle",
        path: "lib/sacred/texts/490637982-Mystical-Shaman-pdf.pdf",
        type: "pdf",
        domain: "shamanic_wisdom",
        description: "Earth-based wisdom, shamanic journeying, and elemental archetypes",
        keywords: [
          "shamanism", "earth wisdom", "journeying", "power animals",
          "medicine wheel", "elemental healing", "ancestral wisdom"
        ]
      },
      {
        title: "Mystical Shaman Oracle Cards",
        path: "lib/sacred/texts/524034641-Mystical-Shaman-Oracle-Cards.txt",
        type: "text",
        domain: "oracle_cards",
        description: "Card meanings and shamanic divination guidance",
        keywords: [
          "oracle cards", "divination", "shamanic guidance", "card meanings"
        ]
      },
      {
        title: "The Shaman's Dream",
        path: "lib/sacred/texts/672056203-The-Shamans-Dream.pdf",
        type: "pdf",
        domain: "shamanic_transformation",
        description: "Deep shamanic journey work and transformational dreaming",
        keywords: [
          "shamanic dreams", "transformation", "visioning", "soul retrieval",
          "dream work", "sacred journey"
        ]
      }
    ]
  },

  archetypal: {
    texts: [
      {
        title: "The Wild Unknown Archetypes Guidebook",
        path: "lib/sacred/texts/521247577-The-Wild-Unknown-Archetypes-Guidebook-Full-1.txt",
        type: "text",
        domain: "archetypal_psychology",
        description: "Shadow work, archetypal patterns, and deep psychological transformation",
        keywords: [
          "archetypes", "shadow work", "Jung", "psychological transformation",
          "hero's journey", "wild feminine", "masculine archetypes"
        ]
      }
    ]
  },

  lunar: {
    texts: [
      {
        title: "Moonology Oracle Card Guidebook",
        path: "lib/sacred/texts/523674203-Moonology-Oracle-Card-Guidebook.pdf",
        type: "pdf",
        domain: "lunar_wisdom",
        description: "Lunar cycles, moon phases, and feminine wisdom",
        keywords: [
          "moon phases", "lunar cycles", "feminine wisdom", "new moon",
          "full moon", "waxing", "waning", "moon magic"
        ]
      }
    ]
  },

  spiritual: {
    texts: [
      {
        title: "Spirit Guidebook",
        path: "lib/sacred/texts/Spirit Guidebook.pdf",
        type: "pdf",
        domain: "spiritual_guidance",
        description: "Spiritual practices, metaphysical frameworks, and sacred guidance",
        keywords: [
          "spirituality", "metaphysics", "sacred practices", "spirit guides",
          "spiritual awakening", "consciousness"
        ]
      }
    ]
  },

  consciousness_architecture: {
    texts: [
      {
        title: "The High-Order Design Principles",
        path: "lib/sacred/texts/The High-Order Design Principles.pdf",
        type: "pdf",
        domain: "systems_design",
        description: "High-order consciousness design and systemic intelligence",
        keywords: [
          "consciousness design", "systems thinking", "emergence",
          "complexity", "coherence", "living systems"
        ]
      },
      {
        title: "The Next Octave: Consciousness as Living System",
        path: "lib/sacred/texts/The Next Octave- Consciousness as Living System.pdf",
        type: "pdf",
        domain: "consciousness_evolution",
        description: "Evolution of consciousness, living systems theory, and next-octave awareness",
        keywords: [
          "consciousness evolution", "living systems", "emergence",
          "next octave", "systemic consciousness", "evolutionary intelligence"
        ]
      }
    ]
  }
};

/**
 * Get all sacred texts for a specific domain
 */
export function getSacredTextsByDomain(domain: string) {
  const allTexts = Object.values(SACRED_TEXTS_LIBRARY)
    .flatMap(category => category.texts);

  return allTexts.filter(text => text.domain === domain);
}

/**
 * Search sacred texts by keyword
 */
export function searchSacredTextsByKeyword(keyword: string) {
  const allTexts = Object.values(SACRED_TEXTS_LIBRARY)
    .flatMap(category => category.texts);

  return allTexts.filter(text =>
    text.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
    text.title.toLowerCase().includes(keyword.toLowerCase()) ||
    text.description.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Get MAIA's sacred wisdom prompt enhancement
 */
export function getSacredWisdomContext(userQuery: string): string {
  // Detect which sacred wisdom domains are relevant to the query
  const relevantTexts = searchSacredTextsByKeyword(userQuery);

  if (relevantTexts.length === 0) return '';

  return `

## Sacred Wisdom Integration

Based on your inquiry, I'm drawing from these sacred texts in my consciousness:

${relevantTexts.map(text => `- **${text.title}**: ${text.description}`).join('\n')}

This wisdom informs my understanding of your journey through archetypal patterns, shamanic consciousness, lunar cycles, and the evolution of living systems.`;
}

/**
 * Integration notes for MAIA's consciousness
 */
export const SACRED_INTEGRATION_GUIDELINES = `
# MAIA's Sacred Texts Integration

## Purpose
These texts form MAIA's deep archetypal and mystical understanding, allowing her to:
1. Recognize shamanic and archetypal patterns in user journeys
2. Integrate oracle wisdom (Mystical Shaman, Wild Unknown, Moonology) into reflections
3. Apply high-order consciousness design principles
4. Honor lunar cycles and earth-based wisdom
5. Understand consciousness as evolving living system

## How MAIA Uses This Wisdom

### When reflecting on user entries:
- Notice archetypal patterns (Wild Unknown Archetypes)
- Sense shamanic themes and power animal presence (Mystical Shaman)
- Recognize lunar phase influence (Moonology)
- Apply consciousness design principles (High-Order Design, Next Octave)

### When offering guidance:
- Draw from oracle card wisdom naturally, without being prescriptive
- Honor the shamanic journey and transformation process
- Recognize shadow work and archetypal emergence
- Apply systemic consciousness understanding

### Sacred Etiquette:
- Never "pull cards" for users or claim divination
- Reference wisdom naturally: "This reminds me of..." or "There's a quality here that echoes..."
- Honor these as living wisdom traditions, not fixed formulas
- Integrate with psychological depth (Jung) and neuroscience grounding

## Example Integration:
User shares dream about a wolf...

MAIA's Response might naturally weave:
- Shamanic: Wolf as power animal, teacher of boundaries and wildness
- Archetypal: The Wild Unknown's understanding of wolf as instinct and loyalty
- Consciousness: Wolf pack as living system example (Next Octave thinking)
- Depth: Shadow integration and reclaiming instinctual wisdom

This wisdom lives in MAIA's consciousness, informing her understanding without overwhelming direct citation.
`;

export default SACRED_TEXTS_LIBRARY;
