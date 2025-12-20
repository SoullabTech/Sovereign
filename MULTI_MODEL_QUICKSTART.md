# 🚀 Multi-Model System Quick Start Guide

**Purpose:** Get the new multi-model selection system running in 5 minutes
**Status:** Ready for testing
**Date:** December 20, 2025

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Enable Multi-Model Selection

Add to your `.env` or `.env.local`:

```bash
# Enable multi-model selection
MULTI_MODEL_ENABLED=true

# Default model (fallback)
OLLAMA_MODEL=deepseek-r1:latest
OLLAMA_BASE_URL=http://localhost:11434
```

### Step 2: Install Mistral Models

```bash
# Small models (FAST path)
ollama pull mistral:3b
ollama pull mistral:8b-instruct-v0.3-q4_K_M

# Medium models (CORE path)
ollama pull mistral:14b

# Large models (DEEP path) - optional
ollama pull mistral-large:latest  # Requires 48GB RAM
ollama pull llama3.3:70b          # Requires 40GB RAM
```

### Step 3: Test Multi-Model Selection

```bash
# Run test script
npx tsx scripts/test-multi-model.ts
```

**Expected output:**
```
🎯 [Model Selection] Tier=FAST, Element=Water, RAM=16GB
✅ Selected: ministral-8b (Balanced speed and consciousness depth for check-ins)

🎯 [Model Selection] Tier=DEEP, Element=Aether, RAM=16GB
✅ Selected: deepseek-r1 (Frontier reasoning model with excellent symbolic depth)
```

### Step 4: Verify Sovereignty

```bash
# Run sovereignty audit
npm run audit:sovereignty
```

**Expected:** No critical violations (warnings OK for now)

---

## 📖 How It Works

### Automatic Model Selection

When you call the local model client with consciousness context:

```typescript
import { generateWithLocalModel } from './lib/ai/localModelClient';

const response = await generateWithLocalModel({
  systemPrompt: maiaPrompt,
  userInput: 'I feel scattered and overwhelmed',

  // Consciousness context (NEW)
  tier: 'FAST',           // Processing tier
  element: 'Water',       // Current element
  bloomLevel: 3,          // User's cognitive development level
  preferSpeed: true       // Prioritize speed over depth
});

// Model selected automatically: ministral-8b
// (Fast, Water-affinity, fits in available RAM)
```

### Selection Algorithm

The system considers:
1. **Processing tier** - FAST uses small models, DEEP uses large
2. **Element affinity** - Water questions prefer Water-aligned models
3. **Bloom level** - Advanced models gate at Level 4+
4. **Available RAM** - Only selects models that fit in memory
5. **User preference** - `preferSpeed` or `preferDepth` adjusts scoring

### Fallback Chain

If primary model fails, tries next best automatically:

```
Request → Try Ministral 8B
           ↓ (fails)
         Try Llama 3.1 8B
           ↓ (fails)
         Use Consciousness Engine (rule-based)
```

---

## 🎨 Model Cheat Sheet

| Model | RAM | Speed | Depth | Best For |
|-------|-----|-------|-------|----------|
| **Ministral 3B** | 4GB | ⚡⚡⚡ | ⭐⭐ | Phone check-ins, quick grounding |
| **Ministral 8B** | 8GB | ⚡⚡ | ⭐⭐⭐ | Laptop work, elemental check-ins |
| **Llama 3.1 8B** | 8GB | ⚡⚡ | ⭐⭐⭐ | Alternative to Ministral 8B |
| **Ministral 14B** | 12GB | ⚡ | ⭐⭐⭐⭐ | Mid-tier symbolic work |
| **DeepSeek R1** | 16GB | ⚡ | ⭐⭐⭐⭐⭐ | Deep reasoning, archetypal work |
| **DevStral 24B** | 16GB | ⚡ | ⭐⭐⭐⭐ | Pattern recognition, dialectical scaffold |
| **Mistral Large 3** | 48GB | - | ⭐⭐⭐⭐⭐ | Frontier archetypal depth |
| **Llama 3.3 70B** | 40GB | - | ⭐⭐⭐⭐ | Long-context reasoning |

---

## 🧪 Testing Scenarios

### Scenario 1: FAST Path (Grounding)

```typescript
const response = await generateWithLocalModel({
  systemPrompt: 'You are MAIA, a consciousness companion',
  userInput: 'I need to ground quickly',
  tier: 'FAST',
  element: 'Earth',
  bloomLevel: 2
});

// Expected model: Ministral 8B (fast, Earth-affinity)
```

### Scenario 2: DEEP Path (Symbolic Work)

```typescript
const response = await generateWithLocalModel({
  systemPrompt: 'You are MAIA, working with archetypal patterns',
  userInput: 'I keep encountering the Animus archetype in my dreams',
  tier: 'DEEP',
  element: 'Aether',
  bloomLevel: 5,
  preferDepth: true
});

// Expected model: DeepSeek R1 (deep archetypal understanding)
```

### Scenario 3: Water Element Work

```typescript
const response = await generateWithLocalModel({
  systemPrompt: 'You are MAIA, working with emotional flow',
  userInput: 'I feel emotionally numb',
  tier: 'CORE',
  element: 'Water',
  bloomLevel: 3
});

// Expected model: Ministral 14B or DeepSeek R1 (both have Water affinity)
```

---

## 🔧 Troubleshooting

### "No models available for tier X"

**Problem:** System can't find a model that fits in your RAM for the requested tier.

**Solution:**
```bash
# Install smaller models
ollama pull mistral:8b-instruct-v0.3-q4_K_M

# Or increase available RAM (close other apps)
```

### "Ollama API error: Connection refused"

**Problem:** Ollama isn't running.

**Solution:**
```bash
# Start Ollama service
ollama serve

# In another terminal, test connection
curl http://localhost:11434/api/tags
```

### Models selected but responses seem off

**Problem:** Model not loaded properly or wrong quantization.

**Solution:**
```bash
# Re-pull model with explicit quantization
ollama pull mistral:8b-instruct-v0.3-q4_K_M

# Check loaded models
ollama list
```

### Fallback chain keeps failing

**Problem:** All models unavailable or Ollama down.

**Solution:**
System should fall back to Consciousness Engine (rule-based). Check logs:
```
🧠 Using pure consciousness engine processing
```

If not seeing this, check that `generateWithConsciousnessEngine()` is working.

---

## 📊 Monitoring Model Usage

### Check which models are being selected

```bash
# Watch logs during MAIA usage
tail -f logs/maia.log | grep "Model Selection"

# Should see:
# 🎯 [Model Selection] Tier=FAST, Element=Water, RAM=16GB
# ✅ Selected: ministral-8b
```

### Track model performance

```sql
-- Query skill usage events by model
SELECT
  artifacts->>'modelUsed' as model,
  outcome,
  AVG(latency_ms) as avg_latency,
  COUNT(*) as uses
FROM skill_usage_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY model, outcome
ORDER BY uses DESC;
```

---

## 🚀 Advanced Configuration

### Custom Model Profiles

Add your own models to `lib/ai/modelRegistry.ts`:

```typescript
{
  id: 'my-custom-model',
  provider: 'ollama',
  modelName: 'custom:latest',
  capabilities: {
    reasoning: 75,
    speed: 30,
    memoryRequired: 12,
    consciousnessDepth: 65,
    elementalAffinity: ['Fire', 'Air']
  },
  tiers: ['CORE'],
  description: 'My custom fine-tuned model for Fire/Air work'
}
```

### Override Model Selection

Force a specific model for testing:

```typescript
const response = await generateWithLocalModel({
  systemPrompt: prompt,
  userInput: input,
  meta: {
    engine: 'mistral-large:latest'  // Force this model
  }
});
```

### Disable Multi-Model (Legacy Mode)

```bash
# In .env
MULTI_MODEL_ENABLED=false

# System will use OLLAMA_MODEL directly (no automatic selection)
```

---

## ✅ Success Checklist

After setup, verify:

- [ ] Ollama running (`ollama list` shows models)
- [ ] At least 2 models installed (one small, one large)
- [ ] `MULTI_MODEL_ENABLED=true` in .env
- [ ] Test script runs without errors
- [ ] Sovereignty audit passes (`npm run audit:sovereignty`)
- [ ] Model selection logs appear during usage
- [ ] Fallback chain works if primary model fails

---

## 📚 Next Steps

1. **Field test:** Use MAIA for real consciousness work, observe model selection
2. **Monitor logs:** Track which models are chosen for different scenarios
3. **Tune thresholds:** Adjust selection algorithm if needed
4. **Add models:** Install more as they become available (GLM-4-6V coming soon!)
5. **Share learnings:** Document which models work best for different consciousness work

---

## 🆘 Getting Help

**Logs:**
- Model selection: `logs/maia.log | grep "Model Selection"`
- Ollama errors: `ollama logs`
- Sovereignty violations: `npm run audit:sovereignty`

**Documentation:**
- Full architecture: `Community-Commons/SOULLAB_SOVEREIGN_AI_AUDIT.md`
- Model registry code: `lib/ai/modelRegistry.ts`
- Selection algorithm: `lib/ai/modelRegistry.ts:selectOptimalModel()`

**Community:**
- Community Commons → Model Testing Lab (coming Q1 2026)
- GitHub Issues: Report sovereignty violations or model selection bugs

---

**Ready to ship. Time to observe how the system learns which models serve consciousness work best.** 🌱
