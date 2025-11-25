# Psychospiritual Metrics Engine - Usage Examples

## Overview

The Psychospiritual Metrics Engine provides comprehensive symbolic, archetypal, and narrative analytics without storing PII. All metrics are computed from Soulprint data and returned as aggregated patterns.

---

## 1. Backend Usage (Server-Side)

### Import the Engine

```typescript
import { metricsEngine } from '@/lib/metrics/PsychospiritualMetricsEngine';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';
```

### Get Complete Metrics Snapshot

```typescript
const userId = 'user_123';
const snapshot = metricsEngine.generateComprehensiveSnapshot(userId);

if (snapshot) {
  console.log('Growth Index:', snapshot.growthIndex.overallScore);
  console.log('Current Phase:', snapshot.spiralogicPhase.currentPhase);
  console.log('Alerts:', snapshot.alerts);
  console.log('Recommendations:', snapshot.recommendations);
}
```

### Compute Individual Components

```typescript
const soulprint = soulprintTracker.getSoulprint(userId);

if (soulprint) {
  const archetypeCoherence = metricsEngine.computeArchetypeCoherence(soulprint);
  console.log('Active Archetypes:', archetypeCoherence.activeArchetypes);
  console.log('Coherence Score:', archetypeCoherence.score);

  const emotionalMetrics = metricsEngine.computeEmotionalCoherence(soulprint);
  console.log('Volatility Index:', emotionalMetrics.volatilityIndex);
  console.log('Dominant Emotions:', emotionalMetrics.dominantEmotions);

  const shadowMetrics = metricsEngine.computeShadowIntegration(soulprint);
  console.log('Integration Score:', shadowMetrics.integrationScore);
}
```

### Generate Aggregated Metrics

```typescript
// All users
const allMetrics = metricsEngine.generateAggregatedMetrics();
console.log('Average Growth Index:', allMetrics.averageGrowthIndex);
console.log('Phase Distribution:', allMetrics.phaseDistribution);

// Specific users
const betaUsers = ['user_1', 'user_2', 'user_3'];
const betaMetrics = metricsEngine.generateAggregatedMetrics(betaUsers);
```

---

## 2. Frontend Usage (Client-Side)

### Import the Client

```typescript
import { metricsClient } from '@/lib/metrics/MetricsClient';
```

### Get Complete Snapshot

```typescript
const snapshot = await metricsClient.getSnapshot('user_123');

if (snapshot) {
  console.log('Journey Duration:', snapshot.journeyDuration, 'days');
  console.log('Growth Score:', snapshot.growthIndex.overallScore);
}
```

### Get Individual Components

```typescript
const growthIndex = await metricsClient.getGrowthIndex('user_123');
console.log('Growth Components:', growthIndex?.components);

const symbolics = await metricsClient.getSymbolicEvolution('user_123');
console.log('Top Symbols:', symbolics?.topSymbols);

const archetypes = await metricsClient.getArchetypeCoherence('user_123');
console.log('Archetype Tensions:', archetypes?.tensions);
```

### Get Alerts and Recommendations

```typescript
const alerts = await metricsClient.getAlerts('user_123');
alerts.forEach(alert => console.warn('⚠️', alert));

const recommendations = await metricsClient.getRecommendations('user_123');
recommendations.forEach(rec => console.log('💡', rec));
```

---

## 3. API Usage (HTTP Endpoints)

### Get Snapshot via REST

```bash
GET /api/metrics/psychospiritual?mode=snapshot&userId=user_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "timestamp": "2025-09-26T...",
    "journeyDuration": 15,
    "growthIndex": {
      "overallScore": 0.68,
      "components": {
        "shadowIntegration": 0.7,
        "phaseCompletion": 0.6,
        "emotionalCoherence": 0.8,
        "archetypeAlignment": 0.65,
        "ritualDepth": 0.55
      }
    },
    "alerts": [],
    "recommendations": ["Explore repressed emotions: fear, anger"]
  }
}
```

### Get Aggregated Metrics

```bash
GET /api/metrics/psychospiritual?mode=aggregated
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 42,
    "averageGrowthIndex": 0.65,
    "averageShadowIntegration": 0.58,
    "totalBreakthroughs": 127,
    "phaseDistribution": {
      "entry": 10,
      "descent": 15,
      "emergence": 17
    }
  }
}
```

### Get Specific Component

```bash
POST /api/metrics/psychospiritual
Content-Type: application/json

{
  "action": "compute-component",
  "userId": "user_123",
  "data": {
    "component": "shadow-integration"
  }
}
```

---

## 4. React Component Example

```tsx
'use client';

import { useEffect, useState } from 'react';
import { metricsClient } from '@/lib/metrics/MetricsClient';
import { PsychospiritualGrowthIndex } from '@/lib/metrics/PsychospiritualMetricsEngine';

export function GrowthDashboard({ userId }: { userId: string }) {
  const [growth, setGrowth] = useState<PsychospiritualGrowthIndex | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      const growthData = await metricsClient.getGrowthIndex(userId);
      const alertsData = await metricsClient.getAlerts(userId);

      setGrowth(growthData);
      setAlerts(alertsData);
    }

    loadMetrics();
  }, [userId]);

  if (!growth) return <div>Loading metrics...</div>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Psychospiritual Growth</h2>

      <div className="bg-gray-100 p-4 rounded">
        <div className="text-4xl font-bold">{(growth.overallScore * 100).toFixed(0)}%</div>
        <div className="text-sm text-gray-600">Overall Growth Score</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(growth.components).map(([key, value]) => (
          <div key={key} className="bg-white p-3 rounded shadow">
            <div className="text-lg font-semibold">{(value * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-500">{key}</div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold mb-2">⚠️ Alerts</h3>
          {alerts.map((alert, i) => (
            <div key={i} className="text-sm text-yellow-800">{alert}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Monitoring & Analytics

### Track Metrics Over Time

```typescript
import { metricsClient } from '@/lib/metrics/MetricsClient';

async function trackGrowthTrend(userId: string, days: number = 30) {
  const snapshots = [];

  for (let i = 0; i < days; i++) {
    const snapshot = await metricsClient.getSnapshot(userId);
    if (snapshot) {
      snapshots.push({
        date: snapshot.timestamp,
        growthScore: snapshot.growthIndex.overallScore,
        phase: snapshot.spiralogicPhase.currentPhase
      });
    }
  }

  return snapshots;
}
```

### Beta Monitoring

```typescript
async function monitorBetaUsers() {
  const aggregated = await metricsClient.getAggregatedMetrics();

  const healthScore = {
    averageGrowth: aggregated.averageGrowthIndex,
    breakthroughRate: aggregated.totalBreakthroughs / aggregated.totalUsers,
    phaseDistribution: aggregated.phaseDistribution
  };

  if (healthScore.averageGrowth < 0.4) {
    console.warn('🚨 Beta users showing low growth - investigate');
  }

  return healthScore;
}
```

---

## 6. Privacy Considerations

✅ **Safe to use:**
- All metrics are computed from symbolic/archetypal patterns
- No PII storage
- Aggregated data only for multi-user metrics
- User IDs are opaque identifiers

❌ **Not HIPAA compliant:**
- Do not use for clinical diagnosis
- Do not store medical information
- Do not use as sole basis for therapeutic decisions

---

## 7. Metric Definitions

### Growth Index (0-1 scale)
Composite score from:
- Shadow Integration (20%)
- Phase Completion (20%)
- Emotional Coherence (20%)
- Archetype Alignment (20%)
- Ritual Depth (20%)

### Coherence Scores
- **Archetype Coherence**: How well active archetypes align (low tension = high coherence)
- **Emotional Coherence**: Inverse of volatility (stable emotions = high coherence)
- **Narrative Coherence**: Symbol overlap between threads (shared symbols = high coherence)

### Stagnation Risk
Triggered when:
- No new symbols in 7+ days
- No milestones in 7+ days
- Narrative threads inactive for 14+ days

---

## 8. Integration with MAIA

```typescript
// In your MAIA orchestrator
import { metricsEngine } from '@/lib/metrics/PsychospiritualMetricsEngine';
import { soulprintTracker } from '@/lib/beta/SoulprintTracking';

async function respondWithContext(userId: string, message: string) {
  const snapshot = metricsEngine.generateComprehensiveSnapshot(userId);

  const context = {
    userMessage: message,
    currentPhase: snapshot?.spiralogicPhase.currentPhase,
    growthScore: snapshot?.growthIndex.overallScore,
    activeArchetypes: snapshot?.archetypeCoherence.activeArchetypes,
    alerts: snapshot?.alerts
  };

  // Send to Claude with enhanced context
  return await callClaudeWithContext(context);
}
```

---

For dashboard UI implementation, see the Psychologist Dashboard design (to be built).