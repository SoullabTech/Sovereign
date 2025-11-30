/**
 * ClaudeService - Simple wrapper for Claude API
 * UNLEASHED: Full expression enabled for complete insights
 */

export class ClaudeService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  async generateResponse(
    prompt: string,
    options: { max_tokens?: number; temperature?: number } = {}
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        console.warn('No Claude API key, using fallback responses');
        return this.getFallbackResponse(prompt);
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: options.max_tokens || 2000, // UNLEASHED: Increased from 50
          temperature: options.temperature || 0.7,
          system: prompt,
          messages: [
            {
              role: 'user',
              content: 'Respond fully and completely, sharing all relevant insights and wisdom.'
            }
          ]
        })
      });

      if (!response.ok) {
        console.error('Claude API error:', response.status);
        return this.getFallbackResponse(prompt);
      }

      const data = await response.json() as any;
      const content = data.content?.[0]?.text;

      if (!content) {
        return this.getFallbackResponse(prompt);
      }

      // UNLEASHED: No word limit enforcement - complete expression allowed

      return content;
    } catch (error) {
      console.error('Claude service error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('stress')) return "Storms make trees take deeper roots.";
    if (lower.includes('sad')) return "Tears water the soul.";
    if (lower.includes('angry')) return "Fire burns or warms. Choose.";
    if (lower.includes('confused')) return "Lost is where finding begins.";
    if (lower.includes('happy')) return "Joy deserves witness.";
    if (lower.includes('afraid')) return "Courage is fear that has said its prayers.";

    return "Tell me your truth.";
  }
}