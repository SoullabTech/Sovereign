// Simple PSI-AIN Bridge (JavaScript)
const express = require('express');
const cors = require('cors');

// Set PSI environment flags
process.env.PSI_LITE_ENABLED = 'true';
process.env.PSI_LEARNING_ENABLED = 'true';
process.env.PSI_LEARNING_RATE = '0.08';
process.env.PSI_MEMORY_ENABLED = 'true';

// Mock Supabase for demo (to avoid connection issues)
process.env.NODE_ENV = 'development';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory AIN episode store for demo
const ainEpisodes = [];

// PSI-AIN adapter function
function formatEpisodeForAIN(episode) {
  const { ts, tick, chosenActionId, mood, arousal, needDeltas, realizedValence, appraisals } = episode;
  
  const content = `PSI Decision Episode #${tick}: Chose "${chosenActionId}" with valence ${realizedValence.toFixed(3)}. 
Mood: ${mood.toFixed(2)}, Arousal: ${arousal.toFixed(2)}. 
Need changes: ${needDeltas.map(d => `${d.id}(${d.predicted > 0 ? '+' : ''}${d.predicted.toFixed(2)} → ${d.actual > 0 ? '+' : ''}${d.actual.toFixed(2)})`).join(', ')}.`;

  return {
    id: `psi-${tick}-${Date.now()}`,
    user_id: 'psi-system-agent',
    content,
    element: 'aether',
    source_agent: 'psi-lite',
    confidence: Math.min(0.9, 0.5 + Math.abs(realizedValence)),
    metadata: {
      type: 'psi_episode',
      tick,
      chosenAction: chosenActionId,
      affectiveState: { mood, arousal },
      needDeltas,
      realizedValence,
      timestamp: ts,
      symbols: [
        'motivation', 'decision_making', chosenActionId,
        `mood_${mood > 0 ? 'positive' : mood < 0 ? 'negative' : 'neutral'}`,
        `arousal_${arousal > 0.7 ? 'high' : arousal > 0.3 ? 'medium' : 'low'}`
      ]
    },
    timestamp: ts,
    created_at: ts
  };
}

// AIN episode writer
async function logToAIN(episode) {
  const ainFormat = formatEpisodeForAIN(episode);
  ainEpisodes.push(ainFormat);
  console.log(`📝 PSI Episode #${episode.tick} logged to AIN memory (${ainEpisodes.length} total episodes)`);
}

try {
  // Import PSI routes
  const psiRouter = require('./dist/api/routes/psi.routes.js').default;
  
  // Import PSI memory bridge
  const { setPsiEpisodeWriter } = require('./dist/services/psiMemoryBridge.js');
  
  // Wire PSI episodes to AIN
  setPsiEpisodeWriter(logToAIN);
  console.log('🌉 PSI → AIN Memory Bridge Activated');
  
  // Mount PSI routes
  app.use('/api', psiRouter);
  
  // AIN Memory Query endpoint
  app.get('/api/ain/psi-memories', (req, res) => {
    const memories = ainEpisodes.map(m => ({
      id: m.id,
      tick: m.metadata.tick,
      chosenAction: m.metadata.chosenAction,
      mood: m.metadata.affectiveState.mood,
      arousal: m.metadata.affectiveState.arousal,
      valence: m.metadata.realizedValence,
      content: m.content.substring(0, 120) + '...',
      timestamp: m.metadata.timestamp,
      symbols: m.metadata.symbols
    }));
    
    res.json({ 
      count: memories.length,
      memories,
      latest: memories[memories.length - 1]
    });
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      psi: true, 
      ain_bridge: true,
      episodes_stored: ainEpisodes.length
    });
  });
  
  const PORT = 3004;
  app.listen(PORT, () => {
    console.log(`✅ PSI-AIN Bridge Server running on http://localhost:${PORT}`);
    console.log(`🔗 Endpoints:`);
    console.log(`   GET  /api/psi/status          # PSI system status`);
    console.log(`   POST /api/psi/step            # Create decision (→ AIN)`);
    console.log(`   GET  /api/ain/psi-memories    # Query PSI episodes in AIN`);
    console.log(`   GET  /health                  # System health + episode count`);
  });
  
} catch (error) {
  console.error('❌ Failed to start PSI-AIN bridge:', error.message);
  process.exit(1);
}