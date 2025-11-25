/**
 * StanzaWriter
 *
 * Compresses lived scenes into poetic recall keys (≤300 chars)
 *
 * Principles:
 * - Affect + place + meaning (not clinical description)
 * - Evocative, not exhaustive
 * - Reconstitutes felt-sense when read
 * - Bardic compression: uses rhythm, imagery, resonance
 *
 * Example:
 * Instead of: "Had a conversation with Sarah about my career anxiety at the coffee shop"
 * Stanza: "Cedar-scented morning. Sarah's eyes holding the question I couldn't ask. Fear & possibility, braided."
 *
 * SECURITY: Calls server-side /api/memory/stanza route (never exposes API keys)
 */

export interface StanzaInput {
  text: string; // Raw text of the episode (conversation, reflection, etc.)
  placeCue?: string;
  senseCues?: string[];
  people?: string[];
  affectValence?: number; // -1 to 1 (normalized)
  affectArousal?: number; // 0 to 1 (normalized)
}

export class StanzaWriter {
  /**
   * Write stanza for an episode
   *
   * Returns poetic compression (≤300 chars) that evokes the scene
   * Calls secure server-side API route
   */
  async write(input: StanzaInput): Promise<string> {
    try {
      // Call server-side API route (keeps Anthropic API key secure)
      const response = await fetch('/api/memory/stanza', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: input.text,
          placeCue: input.placeCue,
          senseCues: input.senseCues,
          people: input.people,
          affectValence: input.affectValence,
          affectArousal: input.affectArousal
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.stanza || this.fallbackStanza(input);
    } catch (error) {
      console.error('[StanzaWriter] Error:', error);
      // Fallback: simple compression
      return this.fallbackStanza(input);
    }
  }


  /**
   * Fallback stanza if API fails
   */
  private fallbackStanza(input: StanzaInput): string {
    const place = input.placeCue || 'Unknown place';
    const affect = input.affectValence !== undefined && input.affectValence > 0
      ? 'light'
      : input.affectValence !== undefined && input.affectValence < 0
      ? 'shadow'
      : 'between';

    const firstLine = input.text.split('.')[0] || input.text.substring(0, 100);

    return `${place}. ${affect}. ${firstLine}`;
  }
}

/**
 * Create singleton instance
 */
let stanzaWriter: StanzaWriter | null = null;

export function getStanzaWriter(): StanzaWriter {
  if (!stanzaWriter) {
    stanzaWriter = new StanzaWriter();
  }
  return stanzaWriter;
}
