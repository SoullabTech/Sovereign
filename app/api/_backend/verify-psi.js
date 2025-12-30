// Quick PSI verification script
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
  
  // Mount PSI routes
  app.use('/api', psiRouter);
  
  // Basic health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', psi: true });
  });
  
  const PORT = 3003;
  app.listen(PORT, () => {
    console.log(`✅ PSI verification server running on http://localhost:${PORT}`);
    console.log(`📊 Test endpoints:`);
    console.log(`   GET  /api/psi/enabled`);
    console.log(`   GET  /api/psi/status`);
    console.log(`   POST /api/psi/step`);
    console.log(`   POST /api/psi/reset`);
  });
  
} catch (error) {
  console.error('❌ Failed to start PSI verification server:', error.message);
  process.exit(1);
}