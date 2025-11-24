// src/server.ts

import 'tsconfig-paths/register';
import 'dotenv/config';
import util from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware
console.log('🔧 Setting up middleware...');
app.use(cors());
app.use(express.json());

// Bootstrap port early for logs
const PORT = Number(process.env.PORT) || 5001;

// Routes
console.log('🔧 Defining routes...');
// Health & Smoke Tests
app.get('/', (_req, res) => res.send('🧠 Spiralogic Oracle backend is alive.'));
app.get('/test-supabase', async (_req, res) => {
  const { data, error } = await supabase.from('insight_history').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ sampleRow: data });
});

// Public Routes
app.use('/api/oracle', oracleRouter);
app.use('/api/oracle/facet-lookup', facetRouter);
app.use('/api/oracle/facet-map', facetMapRouter);
app.use('/api/oracle/story-generator', storyGeneratorRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/', userProfileRouter);

// Ingestion Endpoints
app.use('/api/notion/ingest', notionIngestRoutes);

// Protected Routes
app.use('/api/oracle/insight-history', authenticate, insightHistoryRouter);
app.use('/api/survey', authenticate, surveyRouter);
app.use('/api/oracle/memory', authenticate, memoryRouter);

// Swagger Docs
console.log('🔧 Setting up Swagger...');
let swaggerDocument = {};
try {
  swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'oracle.openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`📘 Swagger UI at http://localhost:${PORT}/docs`);
} catch (e) {
  console.warn('⚠️ Could not load Swagger YAML:', e);
}

// Global Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise);
  if (reason instanceof Error) console.error(reason.stack);
  else console.error('Reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:');
  if (err instanceof Error) console.error(err.stack);
  else console.error('Exception:', err);
});
process.on('SIGINT', () => {
  console.log('🛑 Gracefully shutting down...');
  process.exit();
});

// Bootstrap
console.log('🚀 Starting server...');
app.listen(PORT, () => {
  logger.info(`Oracle backend listening on port ${PORT}`);
});
