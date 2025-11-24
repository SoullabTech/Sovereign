/**
 * Clean prosody markup from messages for text display
 * while preserving the original for voice synthesis
 */

export function cleanMessage(text: string): string {
  if (!text) return "";
  
  return text
    // Remove stage directions like *Settling in with a warm presence*
    .replace(/\*[^*]*\*/g, "")
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

// Export function that OracleConversation expects
export function cleanMessageForVoice(text: string): string {
  // For voice, we actually want to preserve some markup like pauses
  // but clean up visual-only elements
  return text
    .replace(/\*([^*]*)\*/g, "") // Remove stage directions
    .replace(/\s+/g, " ")
    .trim();
}