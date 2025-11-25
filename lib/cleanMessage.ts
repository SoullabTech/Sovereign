/**
 * Clean prosody markup from messages for text display
 * while preserving the original for voice synthesis
 */

export function cleanMessage(text: string): string {
  if (!text) return "";
  
  return text
    // Keep stage directions for now - they provide important context
    // We'll only remove them for voice synthesis
    // Remove pause tags in multiple formats
    .replace(/<pause-\d+ms>/g, "")  // <pause-200ms>
    .replace(/<pause\s+duration="[^"]+"\s*\/>/gi, "") // <pause duration="600ms"/>
    .replace(/<pause\s+duration='[^']+'\s*\/>/gi, "") // <pause duration='600ms'/>
    // Remove break tags
    .replace(/<break\s+time="[^"]+"\s*\/>/gi, "")
    .replace(/<break\s+time='[^']+'\s*\/>/gi, "")
    // Remove breath tags like <breath/>
    .replace(/<breath\s*\/?>/g, "")
    // Remove emphasis tags like <emphasis> or </emphasis>
    .replace(/<\/?emphasis>/g, "")
    // Remove prosody tags like <prosody rate="slow">
    .replace(/<prosody[^>]*>/g, "")
    .replace(/<\/prosody>/g, "")
    // Remove voice tags
    .replace(/<\/?voice[^>]*>/gi, "")
    // Remove speak tags
    .replace(/<\/?speak>/gi, "")
    // Remove SSML-style tags
    .replace(/<\/?[^>]+>/g, "")
    // Clean up multiple spaces
    .replace(/\s+/g, " ")
    // Clean up multiple line breaks
    .replace(/\n{3,}/g, "\n\n")
    // Trim whitespace
    .trim();
}

/**
 * Optional: Debug mode to show raw prosody markup
 * Useful during development to see what's being generated
 */
export function cleanMessageWithDebug(text: string, showProsody = false): string {
  if (showProsody || process.env.NEXT_PUBLIC_SHOW_PROSODY === "true") {
    // In debug mode, show prosody tags as styled text
    return text
      .replace(/\*([^*]*)\*/g, "[$1]") // Show stage directions in brackets
      .replace(/<(pause-\d+ms)>/g, "[{$1}]"); // Show pauses in brackets
  }
  
  return cleanMessage(text);
}

/**
 * Format message for display - converts stage directions to italics
 * @param text The message text with stage directions
 * @returns HTML string with stage directions in italics
 */
export function formatMessageForDisplay(text: string): string {
  if (!text) return "";
  
  // First clean any voice markup
  let formatted = cleanMessage(text);
  
  // Convert stage directions to italics for visual distinction
  // *laughs warmly* becomes <em>laughs warmly</em>
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em style="opacity: 0.8; font-style: italic;">$1</em>');
  
  return formatted;
}

/**
 * Clean message specifically for voice synthesis
 * Removes ALL markup including stage directions
 */
export function cleanMessageForVoice(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Remove stage directions like *settling in* or *laughs*
    .replace(/\*[^*]+\*/g, "")
    // Remove any text in asterisks even if not properly closed
    .replace(/\*[^*\n]+/g, "")
    // Remove all SSML and HTML-like tags
    .replace(/<[^>]+>/g, "")
    // Remove square bracket annotations like [pause] or [thinking]
    .replace(/\[[^\]]+\]/g, "")
    // Remove parenthetical asides (but keep important content)
    .replace(/\([^)]*subtext[^)]*\)/gi, "") // Remove subtext specifically
    .replace(/\([^)]*direction[^)]*\)/gi, "") // Remove directions
    .replace(/\([^)]*note[^)]*\)/gi, "") // Remove notes
    .replace(/\([^)]*instruction[^)]*\)/gi, "") // Remove instructions
    // Remove curly brace annotations
    .replace(/\{[^}]+\}/g, "")
    // Remove any markdown formatting
    .replace(/[#*_~`]/g, "")
    // Remove URLs and links
    .replace(/https?:\/\/[^\s]+/g, "")
    // Remove any remaining formatting symbols
    .replace(/[<>]/g, "")
    // Clean up any resulting double spaces
    .replace(/\s+/g, " ")
    // Remove leading/trailing punctuation oddities
    .replace(/^\W+|\W+$/g, "")
    // Final trim
    .trim();

  return cleaned;
}

/**
 * Extract prosody markup for voice synthesis
 * Returns both clean text and prosody instructions
 */
export function extractProsody(text: string): {
  clean: string;
  prosody: {
    pauses: { position: number; duration: number }[];
    emphasis: { start: number; end: number }[];
    stageDirections: string[];
  };
} {
  const pauses: { position: number; duration: number }[] = [];
  const emphasis: { start: number; end: number }[] = [];
  const stageDirections: string[] = [];
  
  // Extract stage directions
  const stageMatches = text.matchAll(/\*([^*]*)\*/g);
  for (const match of stageMatches) {
    stageDirections.push(match[1]);
  }
  
  // Extract pauses (simplified - would need more complex parsing for accurate positions)
  const pauseMatches = text.matchAll(/<pause-(\d+)ms>/g);
  for (const match of pauseMatches) {
    pauses.push({
      position: match.index || 0,
      duration: parseInt(match[1])
    });
  }
  
  return {
    clean: cleanMessage(text),
    prosody: {
      pauses,
      emphasis,
      stageDirections
    }
  };
}