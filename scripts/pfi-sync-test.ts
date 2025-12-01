/**
 * PFI Multi-User Synchronization Test
 * Simulates 3 users whose resonance vectors drift out of and back into sync.
 * Run with:  npx ts-node scripts/pfi-sync-test.ts
 */

import fetch from 'node-fetch';

const API = 'http://localhost:3000/api/field/update/';

interface ResonanceVector {
  userId: string;
  vector: number[];
  phase: number;
}

const users: ResonanceVector[] = [
  { userId: 'userA', vector: [0.6,0.5,0.6,0.7,0.7,0.6,0.3,0.3,0.3], phase: 0 },
  { userId: 'userB', vector: [0.7,0.6,0.7,0.75,0.7,0.7,0.35,0.35,0.35], phase: 0 },
  { userId: 'userC', vector: [0.5,0.4,0.5,0.65,0.6,0.5,0.25,0.25,0.25], phase: 0 }
];

let t = 0;
const step = 0.5; // seconds between updates
const driftSpeed = [0.02, 0.03, 0.015]; // radians per step for each user
const DURATION_MS = 120000; // 2 minutes total test

async function sendVector(u: ResonanceVector) {
  const fieldVector = {
    // Map the 9-element vector to proper field structure
    fx: u.vector[0] + 0.05 * Math.sin(u.phase + 0/3),     // Cognitive frequency
    fy: u.vector[1] + 0.05 * Math.sin(u.phase + 1/3),     // Emotional frequency
    fz: u.vector[2] + 0.05 * Math.sin(u.phase + 2/3),     // Somatic frequency
    ax: u.vector[3] + 0.05 * Math.sin(u.phase + 3/3),     // Cognitive amplitude
    ay: u.vector[4] + 0.05 * Math.sin(u.phase + 4/3),     // Emotional amplitude
    az: u.vector[5] + 0.05 * Math.sin(u.phase + 5/3),     // Somatic amplitude
    phx: (u.vector[6] + 0.05 * Math.sin(u.phase + 6/3)) * 180, // Cognitive phase (degrees)
    phy: (u.vector[7] + 0.05 * Math.sin(u.phase + 7/3)) * 180, // Emotional phase (degrees)
    phz: (u.vector[8] + 0.05 * Math.sin(u.phase + 8/3)) * 180  // Somatic phase (degrees)
  };

  const body = {
    userId: u.userId,
    sessionId: 'pfi-sync-test-enhanced',
    fieldVector,
    timestamp: Date.now(),
    metadata: {
      source: 'automated-sync-test-ts',
      testPhase: Math.floor(t / 20) + 1, // Phase changes every 20 steps
      cycleTime: t
    }
  };

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const result = await res.json();
    console.log(`${u.userId}: C=${result.metrics.coherence.toFixed(3)} S=${result.metrics.stability.toFixed(3)}`);
    return result;
  } catch (error) {
    console.error(`❌ ${u.userId}: ${error.message}`);
    return null;
  }
}

async function loop() {
  console.log('🌊 Starting Enhanced PFI Multi-User Synchronization Test');
  console.log(`📊 Duration: ${DURATION_MS/1000}s | API: ${API}`);
  console.log('🎯 Watching for coherence waves: drift → alignment → drift\n');

  const startTime = Date.now();

  while (Date.now() - startTime < DURATION_MS) {
    // Calculate phase for wave-like synchronization
    const wavePhase = (t / 40) * Math.PI; // Complete cycle every 80 steps

    // Simulate drift → alignment → drift with sine wave
    users.forEach((u, idx) => {
      const driftPhase = Math.sin(wavePhase) * Math.PI/3 * (idx - 1); // lead/lag pattern
      u.phase += driftSpeed[idx] + driftPhase/100;
    });

    // Send updates concurrently for all users
    const promises = users.map(user => sendVector(user));
    await Promise.all(promises);

    // Show phase transition info
    if (t % 20 === 0) {
      const phaseDesc = Math.sin(wavePhase) > 0.5 ? 'High Sync' :
                       Math.sin(wavePhase) > 0 ? 'Rising Sync' :
                       Math.sin(wavePhase) > -0.5 ? 'Falling Sync' : 'Low Sync/Drift';
      console.log(`\n🌊 Phase ${Math.floor(t/20) + 1}: ${phaseDesc} (t=${t})`);
      console.log('─'.repeat(50));
    }

    t += 1;
    await new Promise(r => setTimeout(r, step * 1000));
  }

  console.log('\n🏁 Enhanced synchronization test completed!');
  console.log('📊 Check Grafana for the coherence wave patterns');

  // Export final summary
  console.log('\n📈 Test Summary:');
  console.log(`• Total cycles: ${t}`);
  console.log(`• Duration: ${(Date.now() - startTime)/1000}s`);
  console.log('• Expected pattern: Sine wave of group coherence');
  console.log('• Peak coherence during alignment phases');
  console.log('• Low coherence during drift phases');
}

// Install dependencies if needed
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch for HTTP requests...');
  require('child_process').execSync('npm install node-fetch@2 @types/node', { stdio: 'inherit' });
}

// Run the enhanced test
loop().catch(console.error);