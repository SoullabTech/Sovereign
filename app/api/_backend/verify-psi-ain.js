// PSI-AIN Integration Verification
const express = require('express');
const cors = require('cors');

// Set PSI environment flags
process.env.PSI_LITE_ENABLED = 'true';
process.env.PSI_LEARNING_ENABLED = 'true';
process.env.PSI_LEARNING_RATE = '0.08';
process.env.PSI_MEMORY_ENABLED = 'true';

const app = express();
app.use(cors());
app.use(express.json());

try {
  // Import PSI routes
  const psiRouter = require('./dist/api/routes/psi.routes.js').default;
  
  // Import AIN adapter
  const { setPsiEpisodeWriter } = require('./dist/services/psiMemoryBridge.js');
  const { dualPsiEpisodeWriter } = require('./dist/services/psiAinAdapter.js');
  
  // Activate AIN bridge
  setPsiEpisodeWriter(dualPsiEpisodeWriter);
  console.log('🌉 PSI → AIN Memory Bridge Activated');
  
  // Mount PSI routes
  app.use('/api', psiRouter);
  
  // AIN Memory Query endpoint for testing
  app.get('/api/ain/psi-memories', async (req, res) => {
    try {
      const { getRelevantMemories } = require('./dist/services/memoryService.js');
      const memories = await getRelevantMemories('psi-system-agent', 'psi_episode', 10);
      res.json({ 
        count: memories.length,
        memories: memories.map(m => ({
          id: m.id,
          tick: m.metadata?.tick,
          chosenAction: m.metadata?.chosenAction,
          mood: m.metadata?.affectiveState?.mood,
          arousal: m.metadata?.affectiveState?.arousal,
          content: m.content.substring(0, 100) + '...',
          timestamp: m.metadata?.timestamp
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Basic health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', psi: true, ain_bridge: true });
  });
  
  const PORT = 3004;
  app.listen(PORT, () => {
    console.log(`✅ PSI-AIN verification server running on http://localhost:${PORT}`);
    console.log(`📊 Test endpoints:`);
    console.log(`   GET  /api/psi/status`);
    console.log(`   POST /api/psi/step         # Creates episode in AIN memory`);
    console.log(`   GET  /api/ain/psi-memories # Query PSI episodes from AIN`);
  });
  
} catch (error) {
  console.error('❌ Failed to start PSI-AIN verification server:', error.message);
  process.exit(1);
}