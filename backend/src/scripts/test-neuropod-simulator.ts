#!/usr/bin/env tsx
/**
 * TEST NEUROPOD SIMULATOR
 * Simulates a Neuropod device sending biosignal data for local testing
 *
 * Usage:
 *   npx tsx backend/src/scripts/test-neuropod-simulator.ts
 *
 * Prerequisites:
 *   - Neuropod Bridge must be running (npm run dev:neuropod)
 *   - WebSocket server on ws://localhost:8765
 */

import { NeuropodSimulator } from '../services/neuropod/biomarkerIngestService';

async function main() {
  console.log('🎭 Starting Neuropod Simulator...\n');

  const deviceId = process.env.DEVICE_ID || "muse-s-001";
  const updateRateMs = parseInt(process.env.UPDATE_RATE_MS || "100", 10);
  const port = parseInt(process.env.NEUROPOD_PORT || "8765", 10);

  console.log(`Device ID: ${deviceId}`);
  console.log(`Update rate: ${updateRateMs}ms`);
  console.log(`Connecting to: ws://localhost:${port}\n`);

  const simulator = new NeuropodSimulator(deviceId, updateRateMs);

  try {
    simulator.connect(port);
  } catch (error) {
    console.error('❌ Failed to connect to Neuropod Bridge:', error);
    console.error('\nMake sure the bridge is running:');
    console.error('  npx tsx backend/src/scripts/start-neuropod-bridge.ts\n');
    process.exit(1);
  }

  console.log('✅ Simulator connected!');
  console.log('📡 Sending biosignal data...');
  console.log('📊 View live data: http://localhost:3000/analytics-live');
  console.log('\nSignals being simulated:');
  console.log('  - EEG (alpha waves: 8-12 Hz)');
  console.log('  - HRV (heart rate variability: 30-70 ms)');
  console.log('  - GSR (galvanic skin response: 2-3 μS)');
  console.log('  - Breath (respiratory rate: 8-16 bpm)');
  console.log('\nPress Ctrl+C to stop.\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping simulator...');
    simulator.disconnect();
    console.log('✅ Simulator stopped');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Simulator error:', error);
  process.exit(1);
});
