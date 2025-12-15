# Oracle Beta Integration Guide

## Quick Start

The Oracle Beta UI provides a clean, minimal interface for the Spiralogic cascade system.

### 1. Setup Environment Variables

```env
ANTHROPIC_API_KEY=your_claude_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  # optional
SUPABASE_SERVICE_KEY=your_service_key       # optional
```

### 2. Install Dependencies

```bash
npm install @anthropic-ai/sdk d3 @supabase/supabase-js
```

### 3. Add to Your App

```tsx
// app/oracle/page.tsx
import { OracleBetaUI } from '@/components/beta/OracleBetaUI';

export default function OraclePage() {
  return <OracleBetaUI />;
}
```

## Architecture Overview

```
User Input
    ↓
/api/oracle-beta (Claude Cascade)
    ↓
JSON Payload {
  elementalBalance: { fire, water, earth, air, aether }
  spiralStage: { element, stage }
  reflection, practice, archetype
}
    ↓
Frontend Components
├── HoloflowerViz (wedge highlighting)
├── OracleResponse (text guidance)
└── SessionHistory (journey timeline)
```

## Component Structure

### HoloflowerViz
- **Purpose**: Visual representation of current elemental state
- **Props**: `balance`, `current`, `size`, `minimal`
- **Features**: 
  - 12-wedge spiral matching your Holoflower image
  - Dynamic wedge highlighting based on spiral stage
  - Animated transitions between states

### OracleBetaUI
- **Purpose**: Main interface container
- **Features**:
  - Input textarea for queries/journaling
  - Response cards (reflection, practice, archetype)
  - Elemental balance bars
  - Session history timeline

### SessionHistory
- **Purpose**: Show journey progression
- **Features**:
  - Mini holoflower thumbnails
  - Time-based ordering
  - Journey arc summary

## API Endpoints

### POST /api/oracle-beta
```typescript
// Request
{
  text: string;      // User's input
  userId?: string;   // Optional for persistence
}

// Response
{
  sessionId: string;
  timestamp: string;
  elementalBalance: {
    fire: number;    // 0-1
    water: number;   // 0-1
    earth: number;   // 0-1
    air: number;     // 0-1
    aether: number;  // 0-1
  };
  spiralStage: {
    element: 'fire' | 'water' | 'earth' | 'air';
    stage: 1 | 2 | 3;
  };
  reflection: string;
  practice: string;
  archetype: string;
}
```

## Claude Prompt Structure

The system uses a 5-layer cascade:

1. **Ontological Reasoning** - Maps to elements (Fire/Water/Earth/Air/Aether)
2. **Temporal Expansion** - Past echoes, present clarity, future trajectory
3. **Implicit Detection** - Explicit, implied, emergent, shadow, resonant
4. **Spiralogic Mapping** - Recognition → Integration cycle
5. **Output Shaping** - Distills to reflection, practice, archetype

## Customization

### Modify Element Colors
```tsx
// In HoloflowerViz.tsx
const elementColors = {
  fire: '#E74C3C',   // Change these
  water: '#3498DB',
  earth: '#27AE60',
  air: '#F39C12'
};
```

### Adjust Wedge Mapping
```tsx
// In HoloflowerViz.tsx
const wedgeMap = {
  'air-3': 0,   // Reorder these to change
  'air-2': 1,   // wedge positions
  'air-1': 2,
  // ...
};
```

### Custom Prompts
```typescript
// In /api/oracle-beta/route.ts
const ORACLE_SYSTEM_PROMPT = `
  // Modify the prompt to change
  // how Claude processes inputs
`;
```

## Database Schema (Optional)

If using Supabase for persistence:

```sql
CREATE TABLE oracle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT UNIQUE,
  query TEXT,
  response JSONB,
  elements JSONB,
  spiral_stage JSONB,
  reflection TEXT,
  practice TEXT,
  archetype TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oracle_user ON oracle_sessions(user_id);
CREATE INDEX idx_oracle_created ON oracle_sessions(created_at DESC);
```

## Deployment

### Vercel
```bash
vercel env add ANTHROPIC_API_KEY
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npm run build
CMD ["npm", "start"]
```

## Performance Tips

1. **Cache Claude responses** for identical queries (use Redis or in-memory)
2. **Batch session history** fetches (load on scroll, not all at once)
3. **Use `minimal` mode** for HoloflowerViz in lists/thumbnails
4. **Debounce input** to avoid excessive API calls

## Troubleshooting

### Claude not responding with valid JSON
- Check the prompt includes "Respond ONLY with valid JSON"
- Ensure temperature is not too high (0.7 recommended)
- Add JSON validation and fallbacks

### Holoflower not rendering
- Verify SVG viewBox dimensions match size prop
- Check element/stage values are valid
- Ensure D3 is properly imported

### Sessions not persisting
- Verify Supabase credentials
- Check table schema matches insert fields
- Enable RLS policies if using auth

## Examples

### Basic Usage
```tsx
const { runCascade } = useOracleSession();

const handleSubmit = async (text: string) => {
  const result = await runCascade(text);
  console.log('Elemental balance:', result.elementalBalance);
  console.log('Current stage:', result.spiralStage);
};
```

### Custom Visualization
```tsx
<HoloflowerViz
  balance={{
    fire: 0.3,
    water: 0.2,
    earth: 0.2,
    air: 0.2,
    aether: 0.1
  }}
  current={{
    element: 'fire',
    stage: 2
  }}
  size={400}
  minimal={false}
/>
```

### Session History Hook
```tsx
const { journey, sessions } = useOracleJourney();

// Access pattern analysis
console.log('Dominant element:', journey.dominantElement);
console.log('Evolution path:', journey.evolutionPath);
```

---

For more details, see the individual component files in `/components/beta/`