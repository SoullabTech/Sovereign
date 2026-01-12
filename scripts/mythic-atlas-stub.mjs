#!/usr/bin/env node
/**
 * Mythic Atlas Stub Service
 *
 * Minimal local service that returns deterministic classifications
 * so we can verify the candidates → decision pipeline end-to-end.
 *
 * Run: node scripts/mythic-atlas-stub.mjs
 * Test: curl -X POST http://localhost:8000/api/mythic-atlas -H 'Content-Type: application/json' -d '{"input":"test"}'
 */

import http from 'http';

const PORT = 8000;

// Simple keyword-based classification for testing
function classify(input) {
  const text = (input || '').toLowerCase();

  // Water patterns (grief, emotion, depth)
  if (/grief|sad|loss|cry|hurt|pain|abandon|alone|scared/.test(text)) {
    return {
      primary: 'WATER_2::ORPHAN',
      facet: 'WATER_2',
      archetype: 'ORPHAN',
      element: 'WATER',
      phase: 2,
      confidence: 0.82,
      gapPercent: 24.5,
      deliberationRecommended: false,
      alternatives: [
        { label: 'WATER_2::ORPHAN', score: 0.82 },
        { label: 'WATER_1::MYSTIC', score: 0.58 },
        { label: 'EARTH_1::CAREGIVER', score: 0.41 },
      ],
    };
  }

  // Fire patterns (action, purpose, calling)
  if (/fight|warrior|purpose|mission|calling|courage|create|build|lead/.test(text)) {
    return {
      primary: 'FIRE_2::WARRIOR',
      facet: 'FIRE_2',
      archetype: 'WARRIOR',
      element: 'FIRE',
      phase: 2,
      confidence: 0.78,
      gapPercent: 18.2,
      deliberationRecommended: false,
      alternatives: [
        { label: 'FIRE_2::WARRIOR', score: 0.78 },
        { label: 'FIRE_1::CREATOR', score: 0.60 },
        { label: 'FIRE_3::SOVEREIGN', score: 0.45 },
      ],
    };
  }

  // Air patterns (wisdom, clarity, understanding)
  if (/understand|learn|wisdom|teach|clarity|insight|realize|think|know/.test(text)) {
    return {
      primary: 'AIR_1::SAGE',
      facet: 'AIR_1',
      archetype: 'SAGE',
      element: 'AIR',
      phase: 1,
      confidence: 0.75,
      gapPercent: 20.1,
      deliberationRecommended: false,
      alternatives: [
        { label: 'AIR_1::SAGE', score: 0.75 },
        { label: 'WATER_1::MYSTIC', score: 0.55 },
        { label: 'FIRE_1::CREATOR', score: 0.42 },
      ],
    };
  }

  // Earth patterns (grounding, care, stability)
  if (/ground|stable|care|nurture|safe|home|body|rest|tend/.test(text)) {
    return {
      primary: 'EARTH_1::CAREGIVER',
      facet: 'EARTH_1',
      archetype: 'CAREGIVER',
      element: 'EARTH',
      phase: 1,
      confidence: 0.80,
      gapPercent: 26.3,
      deliberationRecommended: false,
      alternatives: [
        { label: 'EARTH_1::CAREGIVER', score: 0.80 },
        { label: 'WATER_2::ORPHAN', score: 0.54 },
        { label: 'EARTH_2::BUILDER', score: 0.48 },
      ],
    };
  }

  // Uncertain pattern (low gap → deliberation recommended)
  if (/confused|torn|both|conflict|uncertain|unsure/.test(text)) {
    return {
      primary: 'WATER_1::MYSTIC',
      facet: 'WATER_1',
      archetype: 'MYSTIC',
      element: 'WATER',
      phase: 1,
      confidence: 0.52,
      gapPercent: 8.5, // Below 15% threshold
      deliberationRecommended: true,
      alternatives: [
        { label: 'WATER_1::MYSTIC', score: 0.52 },
        { label: 'FIRE_2::WARRIOR', score: 0.48 },
        { label: 'AIR_1::SAGE', score: 0.45 },
        { label: 'EARTH_1::CAREGIVER', score: 0.41 },
      ],
    };
  }

  // Default: moderate confidence Air/clarification
  return {
    primary: 'AIR_1::SAGE',
    facet: 'AIR_1',
    archetype: 'SAGE',
    element: 'AIR',
    phase: 1,
    confidence: 0.65,
    gapPercent: 15.5,
    deliberationRecommended: false,
    alternatives: [
      { label: 'AIR_1::SAGE', score: 0.65 },
      { label: 'WATER_1::MYSTIC', score: 0.50 },
      { label: 'FIRE_1::CREATOR', score: 0.38 },
    ],
  };
}

const server = http.createServer((req, res) => {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'mythic-atlas-stub' }));
    return;
  }

  // Main classification endpoint
  if (req.method === 'POST' && req.url === '/api/mythic-atlas') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const input = data.input || '';
        const sessionId = data.session_id || null;

        console.log(`📨 [Atlas Stub] Classification request | chars=${input.length} | session=${sessionId?.slice(0, 8) || 'none'}`);

        const result = classify(input);

        console.log(`✅ [Atlas Stub] → ${result.primary} (${(result.confidence * 100).toFixed(0)}% confidence)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('❌ [Atlas Stub] Parse error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON', message: err.message }));
      }
    });
    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: req.url }));
});

server.listen(PORT, () => {
  console.log(`\n🧠 Mythic Atlas Stub Service`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/api/mythic-atlas`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`\n   Keywords for testing:`);
  console.log(`   - Water: grief, sad, loss, hurt, alone`);
  console.log(`   - Fire: fight, purpose, mission, courage`);
  console.log(`   - Air: understand, wisdom, clarity, insight`);
  console.log(`   - Earth: ground, care, safe, home`);
  console.log(`   - Uncertain: confused, torn, conflict\n`);
});
