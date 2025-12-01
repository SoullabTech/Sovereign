#!/usr/bin/env node

/**
 * 🌊 PFI Multi-User Synchronization Test Script
 *
 * Demonstrates Kuramoto synchronization dynamics by cycling through:
 * Phase 1: Random drift (low group coherence ~0.3)
 * Phase 2: Gradual alignment (rising coherence 0.3→0.8)
 * Phase 3: Full synchronization (high coherence ~0.9)
 * Phase 4: Intentional desynchronization (falling coherence)
 *
 * Ideal for real-time Grafana visualization of collective field dynamics.
 */

const { promises: fs } = require('fs');

// Configuration
const API_BASE = 'http://localhost:3001';
const PHASE_DURATION = 15; // seconds per phase
const UPDATE_INTERVAL = 1000; // ms between updates
const TOTAL_DURATION = 60; // total test duration in seconds

// User templates
const users = [
  { id: 'userA', name: 'steady-focus', baseFreq: [6.0, 5.0, 6.0] },
  { id: 'userB', name: 'faster-tempo', baseFreq: [7.0, 6.0, 7.0] },
  { id: 'userC', name: 'lagging-rhythm', baseFreq: [5.0, 4.0, 5.0] }
];

class PFISyncTest {
  constructor() {
    this.startTime = Date.now();
    this.phase = 1;
    this.cycleCount = 0;
    this.log = [];
  }

  // Calculate current test phase based on elapsed time
  getCurrentPhase(elapsed) {
    const cycle = Math.floor(elapsed / PHASE_DURATION);
    return (cycle % 4) + 1;
  }

  // Generate field vector for user in current phase
  generateFieldVector(user, phase, elapsed) {
    const baseAmp = [0.7, 0.7, 0.6];
    const t = elapsed / 1000; // time in seconds

    switch (phase) {
      case 1: // Random drift
        return {
          fx: user.baseFreq[0] + Math.sin(t * 0.3) * 2,
          fy: user.baseFreq[1] + Math.cos(t * 0.5) * 1.5,
          fz: user.baseFreq[2] + Math.sin(t * 0.7) * 2.5,
          ax: baseAmp[0] + Math.random() * 0.3 - 0.15,
          ay: baseAmp[1] + Math.random() * 0.3 - 0.15,
          az: baseAmp[2] + Math.random() * 0.3 - 0.15,
          phx: Math.random() * 90,
          phy: Math.random() * 90,
          phz: Math.random() * 90
        };

      case 2: // Gradual alignment
        const alignProgress = (t % PHASE_DURATION) / PHASE_DURATION;
        const targetPhase = 30 + Math.sin(t * 0.1) * 5; // Slowly converging
        return {
          fx: user.baseFreq[0] * (1 + alignProgress * 0.1),
          fy: user.baseFreq[1] * (1 + alignProgress * 0.1),
          fz: user.baseFreq[2] * (1 + alignProgress * 0.1),
          ax: 0.7,
          ay: 0.7,
          az: 0.6,
          phx: targetPhase + (1 - alignProgress) * Math.random() * 30,
          phy: targetPhase + (1 - alignProgress) * Math.random() * 30,
          phz: targetPhase + (1 - alignProgress) * Math.random() * 30
        };

      case 3: // Full synchronization
        const syncPhase = 30 + Math.sin(t * 0.05) * 2; // Tight synchronization
        return {
          fx: user.baseFreq[0] * 1.1, // Slightly elevated but synchronized
          fy: user.baseFreq[1] * 1.1,
          fz: user.baseFreq[2] * 1.1,
          ax: 0.75,
          ay: 0.75,
          az: 0.7,
          phx: syncPhase + (Math.random() - 0.5) * 2, // Minimal variance
          phy: syncPhase + (Math.random() - 0.5) * 2,
          phz: syncPhase + (Math.random() - 0.5) * 2
        };

      case 4: // Intentional desynchronization
        const desyncFactor = ((t % PHASE_DURATION) / PHASE_DURATION);
        return {
          fx: user.baseFreq[0] * (1 + desyncFactor * Math.random() * 0.5),
          fy: user.baseFreq[1] * (1 + desyncFactor * Math.random() * 0.5),
          fz: user.baseFreq[2] * (1 + desyncFactor * Math.random() * 0.5),
          ax: 0.7 - desyncFactor * 0.2,
          ay: 0.7 - desyncFactor * 0.2,
          az: 0.6 - desyncFactor * 0.1,
          phx: Math.random() * 180, // Deliberately chaotic
          phy: Math.random() * 180,
          phz: Math.random() * 180
        };
    }
  }

  // Send field update to PFI API
  async sendFieldUpdate(user, fieldVector, phase) {
    const payload = {
      userId: user.id,
      sessionId: 'pfi-sync-test',
      fieldVector,
      timestamp: Date.now(),
      metadata: {
        source: 'automated-sync-test',
        participant: user.name,
        testPhase: phase,
        cycleCount: this.cycleCount
      }
    };

    try {
      const response = await fetch(`${API_BASE}/api/field/update/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`❌ Failed to update ${user.id}:`, error.message);
      return null;
    }
  }

  // Log phase transition
  logPhaseTransition(newPhase, elapsed) {
    const phaseNames = ['', 'Random Drift', 'Gradual Alignment', 'Full Sync', 'Desynchronization'];
    console.log(`\n🌊 Phase ${newPhase}: ${phaseNames[newPhase]} (${elapsed/1000}s)`);
    console.log('─'.repeat(60));
  }

  // Main test loop
  async run() {
    console.log('🌊 Starting PFI Multi-User Synchronization Test');
    console.log(`📊 Duration: ${TOTAL_DURATION}s | Updates: every ${UPDATE_INTERVAL}ms`);
    console.log(`🎯 API: ${API_BASE}/api/field/update/`);
    console.log('─'.repeat(80));

    const startTime = Date.now();

    while (true) {
      const elapsed = Date.now() - startTime;
      const currentPhase = this.getCurrentPhase(elapsed);

      // Check for phase transition
      if (currentPhase !== this.phase) {
        this.phase = currentPhase;
        this.cycleCount++;
        this.logPhaseTransition(currentPhase, elapsed);
      }

      // Exit after total duration
      if (elapsed > TOTAL_DURATION * 1000) {
        console.log('\n🏁 Test completed! Check Grafana for coherence waves.');
        break;
      }

      // Send updates for all users
      const promises = users.map(async (user) => {
        const fieldVector = this.generateFieldVector(user, currentPhase, elapsed);
        const result = await this.sendFieldUpdate(user, fieldVector, currentPhase);

        if (result) {
          const coherence = result.metrics.coherence.toFixed(3);
          const stability = result.metrics.stability.toFixed(3);
          console.log(`✅ ${user.id}: C=${coherence} S=${stability} ${result.metrics.interventionRecommended ? '⚠️' : '✓'}`);
        }

        return result;
      });

      await Promise.all(promises);

      // Wait for next update
      await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL));
    }

    // Export final metrics
    await this.exportMetrics();
  }

  // Export metrics for documentation
  async exportMetrics() {
    console.log('\n📊 Exporting metrics...');
    try {
      const metricsResponse = await fetch(`${API_BASE}/api/metrics`);
      if (metricsResponse.ok) {
        const metrics = await metricsResponse.text();
        await fs.writeFile('/Users/soullab/MAIA-SOVEREIGN/logs/pfi-sync-test-metrics.prom', metrics);
        console.log('✅ Metrics exported to: /logs/pfi-sync-test-metrics.prom');
      }
    } catch (error) {
      console.log('⚠️ Could not export metrics:', error.message);
    }
  }
}

// Error handling for missing fetch in Node.js
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch for HTTP requests...');
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
  global.fetch = require('node-fetch');
}

// Run test
if (require.main === module) {
  const test = new PFISyncTest();
  test.run().catch(console.error);
}

module.exports = PFISyncTest;