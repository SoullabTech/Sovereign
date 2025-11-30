import 'dotenv/config';
const mods = [
  '../api/index',
  '../routes/conversational.routes',
  '../routes/orchestrator.routes',
  '../routes/voiceJournaling.routes',
  '../routes/semanticJournaling.routes',
  '../services/ConversationalPipeline',
  '../services/ElementalIntelligenceRouter',
  '../services/SafetyModerationService',
  '../utils/logger'
];

for (const m of mods) {
  const t0 = Date.now();
  try {
    require(m);
    console.log('[diag] OK', m, `${Date.now()-t0}ms`);
  } catch (e) {
    console.error('[diag] FAIL', m, e);
    process.exit(1);
  }
}
console.log('[diag] all imports succeeded');