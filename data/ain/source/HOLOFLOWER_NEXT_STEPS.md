# Holoflower Oracle - Next Implementation Steps

## 1. Session Persistence Architecture

### Database Schema (Supabase)
```sql
-- Oracle Sessions Table
CREATE TABLE oracle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Voice Interactions Table
CREATE TABLE voice_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES oracle_sessions(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  intent JSONB NOT NULL,
  oracle_response JSONB NOT NULL,
  motion_state JSONB NOT NULL,
  coherence_level DECIMAL(3,2) CHECK (coherence_level >= 0 AND coherence_level <= 1),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,
  audio_url TEXT
);

-- Coherence Timeline Table
CREATE TABLE coherence_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES oracle_sessions(id) ON DELETE CASCADE,
  coherence_value DECIMAL(3,2) NOT NULL,
  shadow_elements TEXT[],
  aether_state TEXT CHECK (aether_state IN ('expansive', 'contractive', 'stillness')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_voice_interactions_session ON voice_interactions(session_id);
CREATE INDEX idx_coherence_timeline_session ON coherence_timeline(session_id);
CREATE INDEX idx_oracle_sessions_user ON oracle_sessions(user_id);
```

### API Implementation
```typescript
// lib/supabase/session-persistence.ts
export async function saveVoiceInteraction(data: {
  sessionId: string;
  transcript: string;
  intent: any;
  oracleResponse: any;
  motionState: any;
  coherenceLevel: number;
}) {
  const { data: interaction, error } = await supabase
    .from('voice_interactions')
    .insert(data)
    .select()
    .single();
    
  // Also update coherence timeline
  await updateCoherenceTimeline(data.sessionId, data.coherenceLevel);
  
  return { interaction, error };
}
```

## 2. Document Upload & Petal Mapping

### Architecture
```typescript
// lib/document-processor.ts
interface DocumentProcessor {
  // Parse document and extract themes
  extractThemes(document: File): Promise<DocumentThemes>;
  
  // Map themes to elemental facets
  mapToElements(themes: DocumentThemes): ElementalMapping;
  
  // Generate petal visualization data
  generatePetalData(mapping: ElementalMapping): PetalVisualization;
}

// API endpoint: app/api/document-upload/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('document') as File;
  
  // 1. Upload to Supabase Storage
  const { data: upload } = await supabase.storage
    .from('sacred-documents')
    .upload(`${userId}/${file.name}`, file);
    
  // 2. Process with Claude for theme extraction
  const themes = await processWithClaude(file);
  
  // 3. Map to elemental petals
  const petalMapping = mapThemesToPetals(themes);
  
  // 4. Save to Sacred Library
  await saveSacredDocument({
    userId,
    fileName: file.name,
    themes,
    petalMapping,
    elementalResonance: calculateResonance(themes)
  });
  
  return NextResponse.json({ petalMapping });
}
```

### Claude Processing Prompt
```typescript
const DOCUMENT_ANALYSIS_PROMPT = `
Analyze this document for sacred themes and map to elements:

Fire (Passion/Will): Keywords like desire, action, courage, anger
Water (Emotion/Flow): Keywords like feeling, intuition, tears, healing  
Earth (Body/Ground): Keywords like stability, practical, material, roots
Air (Mind/Thought): Keywords like ideas, communication, clarity, breath
Aether (Spirit/Unity): Keywords like connection, transcendence, oneness

Return:
{
  "dominantElement": "fire|water|earth|air|aether",
  "elementalBalance": {
    "fire": 0.0-1.0,
    "water": 0.0-1.0,
    "earth": 0.0-1.0,
    "air": 0.0-1.0,
    "aether": 0.0-1.0
  },
  "keyThemes": ["theme1", "theme2"],
  "shadowAspects": ["what needs integration"],
  "coherenceIndicators": ["signs of alignment"]
}`;
```

## 3. Sacred Library Schema

### Database Design
```sql
-- Sacred Documents Table
CREATE TABLE sacred_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Elemental Analysis
  dominant_element TEXT CHECK (dominant_element IN ('fire', 'water', 'earth', 'air', 'aether')),
  elemental_balance JSONB NOT NULL,
  
  -- Themes & Content
  key_themes TEXT[],
  shadow_aspects TEXT[],
  coherence_indicators TEXT[],
  
  -- Searchable Metadata
  full_text_search tsvector,
  aether_resonance DECIMAL(3,2),
  
  -- Relationships
  related_sessions UUID[]
);

-- Search Indexes
CREATE INDEX idx_sacred_docs_search ON sacred_documents USING GIN(full_text_search);
CREATE INDEX idx_sacred_docs_element ON sacred_documents(dominant_element);
CREATE INDEX idx_sacred_docs_resonance ON sacred_documents(aether_resonance);

-- Update trigger for search vector
CREATE TRIGGER update_sacred_docs_search
  BEFORE INSERT OR UPDATE ON sacred_documents
  FOR EACH ROW
  EXECUTE FUNCTION
    tsvector_update_trigger(full_text_search, 'pg_catalog.english', 
                           file_name, key_themes, shadow_aspects);
```

### Search API
```typescript
// lib/sacred-library/search.ts
export async function searchSacredLibrary({
  userId,
  query,
  element,
  minResonance
}: SearchParams) {
  let queryBuilder = supabase
    .from('sacred_documents')
    .select('*')
    .eq('user_id', userId);
    
  if (query) {
    queryBuilder = queryBuilder.textSearch('full_text_search', query);
  }
  
  if (element) {
    queryBuilder = queryBuilder.eq('dominant_element', element);
  }
  
  if (minResonance) {
    queryBuilder = queryBuilder.gte('aether_resonance', minResonance);
  }
  
  return queryBuilder.order('aether_resonance', { ascending: false });
}
```

## 4. Performance Optimizations

### Mobile Detection & Throttling
```typescript
// lib/performance/mobile-optimizer.ts
export class MobileOptimizer {
  private static deviceTier: 'low' | 'medium' | 'high';
  
  static detectDeviceTier(): void {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    if (memory <= 2 || cores <= 2) {
      this.deviceTier = 'low';
    } else if (memory <= 4 || cores <= 4) {
      this.deviceTier = 'medium';
    } else {
      this.deviceTier = 'high';
    }
  }
  
  static getOptimizedConfig() {
    const baseConfig = SACRED_CONFIG.performance;
    
    switch(this.deviceTier) {
      case 'low':
        return {
          ...baseConfig,
          maxAnimations: 1,
          particleLimit: 3,
          shadowLimit: 1,
          disableBlur: true,
          reducedMotion: true,
          audioChannels: 1
        };
      
      case 'medium':
        return {
          ...baseConfig,
          maxAnimations: 2,
          particleLimit: 10,
          shadowLimit: 2,
          disableBlur: false,
          reducedMotion: false,
          audioChannels: 2
        };
      
      default:
        return baseConfig;
    }
  }
}
```

### Animation Queue Manager
```typescript
// lib/animation/queue-manager.ts
export class AnimationQueueManager {
  private activeAnimations = new Set<string>();
  private queue: AnimationTask[] = [];
  private maxConcurrent: number;
  
  constructor() {
    this.maxConcurrent = MobileOptimizer.getOptimizedConfig().maxAnimations;
  }
  
  async runAnimation(task: AnimationTask): Promise<void> {
    if (this.activeAnimations.size >= this.maxConcurrent) {
      // Queue it
      return new Promise((resolve) => {
        this.queue.push({ ...task, callback: resolve });
      });
    }
    
    // Run immediately
    this.activeAnimations.add(task.id);
    await task.run();
    this.activeAnimations.delete(task.id);
    
    // Process queue
    this.processQueue();
  }
  
  private processQueue(): void {
    if (this.queue.length > 0 && this.activeAnimations.size < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        this.runAnimation(next);
      }
    }
  }
}
```

### Audio Layer Management
```typescript
// lib/audio/layer-manager.ts
export class AudioLayerManager {
  private activeLayers = new Map<string, AudioNode>();
  private maxLayers: number;
  
  constructor() {
    const config = MobileOptimizer.getOptimizedConfig();
    this.maxLayers = config.audioChannels || 3;
  }
  
  async playLayer(id: string, frequency: number, volume: number): Promise<void> {
    // Limit concurrent audio layers
    if (this.activeLayers.size >= this.maxLayers) {
      // Stop oldest layer
      const oldestKey = this.activeLayers.keys().next().value;
      this.stopLayer(oldestKey);
    }
    
    const layer = await audioService.createToneLayer(frequency, volume);
    this.activeLayers.set(id, layer);
  }
  
  stopLayer(id: string): void {
    const layer = this.activeLayers.get(id);
    if (layer) {
      layer.disconnect();
      this.activeLayers.delete(id);
    }
  }
}
```

## Implementation Priority

1. **Week 1**: Session Persistence
   - Set up Supabase tables
   - Implement save/load for voice interactions
   - Create timeline view component

2. **Week 2**: Document Upload
   - File upload UI component
   - Claude processing pipeline
   - Petal mapping visualization

3. **Week 3**: Sacred Library
   - Full-text search implementation
   - Elemental filtering
   - Resonance-based recommendations

4. **Week 4**: Performance Tuning
   - Device tier detection
   - Animation queue system
   - Audio layer management
   - Testing on low-end devices

## Testing Checklist

- [ ] Session persistence across page refreshes
- [ ] Document upload (PDF, TXT, MD)
- [ ] Search by element/theme
- [ ] Mobile performance (iPhone SE, Android budget phones)
- [ ] Concurrent animation limits
- [ ] Audio layer management
- [ ] Offline mode fallback
- [ ] Large document processing (>10MB)

## Security Considerations

1. **File Upload**: Validate MIME types, scan for malware
2. **Rate Limiting**: Limit document uploads per user
3. **Storage Quotas**: Max 100MB per user initially
4. **Privacy**: Encrypt sensitive journal entries
5. **CORS**: Restrict API access to verified domains