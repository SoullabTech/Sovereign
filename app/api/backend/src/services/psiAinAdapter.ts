import { PsiEpisode } from "../ain/motivation";

/**
 * PSI-AIN Memory Adapter
 * Bridges PSI episodes into the existing AIN memory store
 */

// Virtual PSI agent user ID for system-level episodes
const PSI_SYSTEM_USER_ID = "psi-system-agent";

/**
 * Convert a PSI episode into AIN memory format
 */
function formatEpisodeForAIN(episode: PsiEpisode) {
  const { ts, tick, chosenActionId, mood, arousal, needDeltas, realizedValence, appraisals } = episode;
  
  // Create a rich narrative of the decision
  const content = `PSI Decision Episode #${tick}: Chose "${chosenActionId}" with valence ${realizedValence.toFixed(3)}. 
Mood: ${mood.toFixed(2)}, Arousal: ${arousal.toFixed(2)}. 
Need changes: ${needDeltas.map(d => `${d.id}(${d.predicted > 0 ? '+' : ''}${d.predicted.toFixed(2)} → ${d.actual > 0 ? '+' : ''}${d.actual.toFixed(2)})`).join(', ')}.
Best alternative had utility ${appraisals[0]?.expectedUtility.toFixed(3)}.`;

  // Rich metadata for analysis
  const metadata = {
    type: "psi_episode",
    tick,
    chosenAction: chosenActionId,
    affectiveState: { mood, arousal },
    needDeltas,
    realizedValence,
    appraisals,
    timestamp: ts,
    // Symbolic tags for pattern recognition
    symbols: [
      "motivation",
      "decision_making", 
      chosenActionId,
      `mood_${mood > 0 ? 'positive' : mood < 0 ? 'negative' : 'neutral'}`,
      `arousal_${arousal > 0.7 ? 'high' : arousal > 0.3 ? 'medium' : 'low'}`,
      ...needDeltas.filter(d => Math.abs(d.actual) > 0.1).map(d => `${d.id}_${d.actual > 0 ? 'satisfied' : 'depleted'}`)
    ]
  };

  return {
    content,
    metadata,
    element: "aether", // PSI operates in the meta-cognitive realm
    source_agent: "psi-lite",
    confidence: Math.min(0.9, 0.5 + Math.abs(realizedValence)), // Higher confidence for stronger outcomes
  };
}

/**
 * Store PSI episode in AIN memory store
 */
export async function logPsiEpisodeToAIN(episode: PsiEpisode): Promise<void> {
  try {
    // Dynamic import to avoid compilation issues
    const { storeMemoryItem } = await import("./memoryService");
    const ainFormat = formatEpisodeForAIN(episode);
    
    await storeMemoryItem(
      PSI_SYSTEM_USER_ID,
      ainFormat.content,
      {
        ...ainFormat.metadata,
        element: ainFormat.element,
        source_agent: ainFormat.source_agent,
        confidence: ainFormat.confidence,
      }
    );
    
    console.log(`📝 PSI Episode #${episode.tick} logged to AIN memory store`);
  } catch (error) {
    console.error(`❌ Failed to log PSI episode to AIN:`, error);
    // Don't throw - PSI should continue working even if memory logging fails
  }
}

/**
 * Enhanced episode writer that logs to both JSONL and AIN
 */
export async function dualPsiEpisodeWriter(episode: PsiEpisode): Promise<void> {
  // Log to AIN memory store
  await logPsiEpisodeToAIN(episode);
  
  // Also maintain JSONL logging for backup/analysis
  const { savePsiEpisode } = await import("./psiMemoryBridge");
  const { setPsiEpisodeWriter } = await import("./psiMemoryBridge");
  
  // Temporarily restore default writer to avoid recursion
  setPsiEpisodeWriter(null as any);
  await savePsiEpisode(episode);
  
  // Restore this writer
  setPsiEpisodeWriter(dualPsiEpisodeWriter);
}