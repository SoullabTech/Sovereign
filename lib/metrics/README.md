# Psychospiritual Metrics Engine

> **Privacy-conscious symbolic intelligence analytics**
> Tracks archetypal, emotional, and narrative patterns without storing PII

---

## 🎯 Purpose

The Psychospiritual Metrics Engine provides comprehensive analytics for the SpiralogicOracleSystem, enabling:

- **Holistic user understanding** — psychological, emotional, symbolic
- **Growth tracking** — phase transitions, breakthroughs, regressions
- **Drift detection** — stagnation alerts, archetypal imbalance
- **Outcome measurement** — integration rates, coherence metrics

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                    │
│  (React Components, Dashboards, Visualizations)     │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                 MetricsClient.ts                     │
│       (TypeScript SDK for easy API access)          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│          /api/metrics/psychospiritual               │
│            (REST API endpoints)                      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│      PsychospiritualMetricsEngine.ts                │
│       (Core computation engine)                      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│           SoulprintTracking.ts                       │
│      (Data layer: symbols, archetypes, etc.)        │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Core Metrics Categories

### 1. **Soulprint Composition** (Snapshot)
- Dominant archetypes
- Elemental ratio (Fire/Water/Earth/Air/Aether)
- Emotional signature
- Symbol frequency map
- Spiralogic phase

### 2. **Narrative Development**
- Active/completed/stagnant threads
- Story phase progression
- Symbolic arc evolution
- Breakthrough frequency
- Drift alerts

### 3. **Archetypal Dynamics**
- Archetype shift frequency
- Suppressed archetypes
- Archetype coherence index
- Shadow integration score

### 4. **Emotional Landscape**
- Emotional drift map
- Volatility index
- Dominant emotions
- Repressed emotions

### 5. **Ritual Integration**
- Completion rate
- Integration depth
- Symbol-ritual linkage
- Phase completion quality

### 6. **Psychospiritual Growth Index** (Composite)
Weighted score combining:
- Shadow Integration (20%)
- Phase Completion (20%)
- Emotional Coherence (20%)
- Archetypal Alignment (20%)
- Ritual Integration Depth (20%)

---

## 🚀 Quick Start

### Installation

```bash
# Already integrated - no installation needed
```

### Backend Usage

```typescript
import { metricsEngine } from '@/lib/metrics/PsychospiritualMetricsEngine';

const snapshot = metricsEngine.generateComprehensiveSnapshot('user_123');
console.log('Growth Score:', snapshot?.growthIndex.overallScore);
```

### Frontend Usage

```typescript
import { metricsClient } from '@/lib/metrics/MetricsClient';

const growth = await metricsClient.getGrowthIndex('user_123');
console.log('Components:', growth?.components);
```

### API Usage

```bash
GET /api/metrics/psychospiritual?mode=snapshot&userId=user_123
```

See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for comprehensive examples.

---

## 🔐 Privacy & Ethics

### ✅ What This System Does

- Tracks symbolic/archetypal patterns (metaphorical)
- Computes aggregate statistics
- Uses opaque user IDs (no names/emails)
- Provides growth insights

### ❌ What This System Does NOT Do

- Store medical/health information
- Claim clinical diagnosis capability
- Replace licensed therapy
- Store PII (personally identifiable information)

### Compliance Status

- ❌ **Not HIPAA compliant** (as stated by user)
- ✅ **Privacy-conscious by design**
- ✅ **Metaphorical/symbolic framework only**

**Use Case**: Personal growth tracking, symbolic journaling, beta analytics for SpiralogicOracleSystem

---

## 🧪 Testing

Run the demo script to see the metrics engine in action:

```bash
npx tsx lib/metrics/demo.ts
```

This will:
1. Create a demo soulprint
2. Track symbols, archetypes, emotions
3. Generate comprehensive metrics
4. Display aggregated analytics

---

## 📦 File Structure

```
lib/metrics/
├── PsychospiritualMetricsEngine.ts  # Core computation engine
├── MetricsClient.ts                  # TypeScript SDK for frontend
├── USAGE_EXAMPLES.md                 # Comprehensive usage guide
├── README.md                         # This file
└── demo.ts                           # Demo/test script

app/api/metrics/
└── psychospiritual/
    └── route.ts                      # REST API endpoints
```

---

## 🎨 Example Metrics Output

```json
{
  "growthIndex": {
    "overallScore": 0.68,
    "components": {
      "shadowIntegration": 0.70,
      "phaseCompletion": 0.60,
      "emotionalCoherence": 0.80,
      "archetypeAlignment": 0.65,
      "ritualDepth": 0.55
    },
    "trend": "ascending"
  },
  "archetypeCoherence": {
    "score": 0.80,
    "activeArchetypes": ["Seeker", "Healer", "Shadow"],
    "tensions": [
      { "from": "Seeker", "to": "Shadow", "tensionLevel": 0.7 }
    ]
  },
  "emotionalLandscape": {
    "volatilityIndex": 0.25,
    "trendDirection": "rising",
    "dominantEmotions": [
      { "emotion": "curiosity", "frequency": 8 },
      { "emotion": "clarity", "frequency": 5 }
    ],
    "repressedEmotions": ["anger", "grief"]
  },
  "alerts": [
    "High emotional volatility detected (55%)"
  ],
  "recommendations": [
    "Explore repressed emotions: anger, grief",
    "Active tension between Seeker and Shadow - consider integration ritual"
  ]
}
```

---

## 🛠 Integration with MAIA

The metrics engine integrates seamlessly with MAIA's intelligence orchestrators:

```typescript
// In FieldIntelligenceMaiaOrchestrator.ts
import { metricsEngine } from '@/lib/metrics/PsychospiritualMetricsEngine';

const snapshot = metricsEngine.generateComprehensiveSnapshot(userId);

// Use metrics to inform MAIA's response
const context = {
  currentPhase: snapshot?.spiralogicPhase.currentPhase,
  growthScore: snapshot?.growthIndex.overallScore,
  alerts: snapshot?.alerts
};
```

---

## 📈 Future Enhancements

### Phase 1 (Current)
- ✅ Core metrics engine
- ✅ REST API
- ✅ TypeScript SDK
- ✅ Demo script

### Phase 2 (Next)
- [ ] React dashboard components
- [ ] Real-time metric streaming
- [ ] Metric visualization library
- [ ] PDF report generator

### Phase 3 (Future)
- [ ] Time-series analysis
- [ ] Predictive analytics
- [ ] Cross-user pattern detection
- [ ] Integration with external analytics platforms

---

## 🤝 Contributing

When adding new metrics:

1. Define the interface in `PsychospiritualMetricsEngine.ts`
2. Implement computation method
3. Add to `ComprehensiveMetricsSnapshot`
4. Expose via API route
5. Add client method to `MetricsClient.ts`
6. Document in `USAGE_EXAMPLES.md`

---

## 📚 Related Files

- `/lib/beta/SoulprintTracking.ts` — Data layer for soulprints
- `/lib/beta/PassiveMetricsCollector.ts` — Technical metrics
- `/lib/oracle/FieldIntelligenceMaiaOrchestrator.ts` — MAIA integration
- `/app/maia-analytics/` — Analytics dashboard (if implemented)

---

## 📄 License

Part of the SpiralogicOracleSystem
© 2025 — For personal/beta use only

---

## 💬 Questions?

For issues or feature requests, see the project's main repository.