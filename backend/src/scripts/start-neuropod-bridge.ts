#!/usr/bin/env tsx
/**
 * START NEUROPOD BRIDGE
 * Launches WebSocket ingestion server for real-time biosignal data
 *
 * Usage:
 *   npx tsx backend/src/scripts/start-neuropod-bridge.ts
 *   npm run dev:neuropod  (if added to package.json)
 */

import { startIngestService } from '../services/neuropod/biomarkerIngestService';

async function main() {
  console.log('🧠 Starting Neuropod Bridge...\n');

  await startIngestService({
    port: 8765,
    batchSize: 20,
    batchTimeoutMs: 1000,
    enableLogging: true
  });

  console.log('\n✅ Neuropod Bridge is running!');
  console.log('📡 WebSocket server: ws://localhost:8765');
  console.log('📊 Live dashboard: http://localhost:3000/analytics-live');
  console.log('\nPress Ctrl+C to stop.\n');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping Neuropod Bridge...');
    const { stopIngestService } = await import('../services/neuropod/biomarkerIngestService');
    await stopIngestService();
    console.log('✅ Stopped successfully');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Failed to start Neuropod Bridge:', error);
  process.exit(1);
});
