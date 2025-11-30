export function validateJson(responseText: string): { valid: boolean; parsed?: any; error?: string } {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { valid: false, error: 'No JSON object found in response' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { valid: true, parsed };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'JSON parse error' };
  }
}

export function extractConfidence(parsed: any): number {
  if (typeof parsed?.confidence === 'number') {
    return Math.max(0, Math.min(1, parsed.confidence));
  }
  return 0.5;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}