# 🔧 MAIA Archetypal Intelligence - Technical Implementation Guide

*Complete developer documentation for implementing, extending, and customizing the archetypal intelligence system*

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Integration Guide](#integration-guide)
4. [API Reference](#api-reference)
5. [Testing Framework](#testing-framework)
6. [Extension Guide](#extension-guide)
7. [Performance Optimization](#performance-optimization)
8. [Deployment Considerations](#deployment-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## Architecture Overview

The MAIA Archetypal Intelligence system follows a modular, service-oriented architecture designed for scalability, maintainability, and extensibility.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAIA Conversation Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  API Route (/app/api/oracle/conversation/route.ts)            │
│  ├─> Base Maya Response                                        │
│  ├─> Archetypal Enhancement Pipeline                          │
│  ├─> Sovereignty Protocol Application                         │
│  └─> Response Integration & Delivery                          │
├─────────────────────────────────────────────────────────────────┤
│                  Archetypal Intelligence Core                  │
│  ├─> Pattern Recognition Engine                               │
│  ├─> Hero's Journey Mapping                                   │
│  ├─> Morphic Field Detection                                  │
│  └─> Consciousness Structure Analysis                         │
├─────────────────────────────────────────────────────────────────┤
│                   Sovereignty Protocol Layer                    │
│  ├─> Language Transformation                                  │
│  ├─> Constraint Detection                                     │
│  ├─> Empowerment Safeguards                                   │
│  └─> Dynamic Sovereignty Reminders                            │
├─────────────────────────────────────────────────────────────────┤
│                     Integration Layer                           │
│  ├─> User Profile Management                                  │
│  ├─> Evolution Tracking                                       │
│  ├─> Apple Watch Connector                                    │
│  └─> Spiralogic Core Services                                 │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
lib/
├── consciousness/
│   ├── archetypal-engine.ts              # Core pattern recognition (1,629 lines)
│   ├── maia-archetypal-integration.ts    # Integration layer with MAIA
│   └── sovereignty-protocol.ts           # User empowerment safeguards
├── services/
│   └── SpiralogicCoreService.ts          # Elemental state management
app/
├── api/oracle/conversation/
│   └── route.ts                          # Enhanced conversation endpoint
scripts/
└── test-archetypal-intelligence.js      # Comprehensive testing framework
mobile/
└── AppleWatch/                           # Native watchOS integration
```

---

## Core Components

### 1. Archetypal Engine (`archetypal-engine.ts`)

The heart of the system, implementing sophisticated pattern recognition and archetypal analysis.

#### Key Classes and Interfaces

```typescript
export interface ArchetypalSignature {
  'solar' | 'lunar' | 'mercurial' | 'venusian' | 'martian' |
  'jovian' | 'saturnian' | 'uranian' | 'neptunian' | 'plutonic'
}

export interface ArchetypalResonance {
  signature: ArchetypalSignature;
  intensity: number;
  confidence: number;
  patterns: string[];
  fieldMessage: string;
}

export class ArchetypalIntelligenceEngine {
  // Core analysis method
  async analyzeArchetypalResonance(
    input: string,
    userProfile?: UserArchetypalProfile
  ): Promise<ArchetypalAnalysis>

  // Hero's Journey mapping
  identifyHeroJourneyPhase(
    content: string,
    userHistory?: UserMessageHistory
  ): HeroJourneyPhase

  // Morphic field detection
  detectMorphicFields(
    input: string,
    contextualFactors?: any
  ): MorphicFieldResonance[]
}
```

#### Pattern Recognition Algorithms

**1. Keyword Pattern Matching**
```typescript
private readonly SOLAR_PATTERNS = [
  // Identity & Integration
  /\b(identity|who I am|self|authentic|true self|integration)\b/i,
  /\b(leadership|leader|leading|guide|guiding)\b/i,
  /\b(purpose|mission|calling|destiny|path)\b/i,
  // ... 50+ patterns per archetype
];
```

**2. Semantic Intensity Scoring**
```typescript
private calculateSemanticIntensity(
  patterns: string[],
  input: string
): number {
  const matches = patterns.filter(p =>
    new RegExp(p, 'i').test(input)
  );

  // Weight by pattern specificity and frequency
  return matches.reduce((score, match) => {
    const specificity = this.calculatePatternSpecificity(match);
    const frequency = this.countOccurrences(input, match);
    return score + (specificity * frequency);
  }, 0) / patterns.length;
}
```

**3. Hero's Journey Phase Detection**
```typescript
private readonly HERO_JOURNEY_PHASES = {
  'ordinary_world': {
    patterns: [/normal life|routine|everyday|regular/i],
    indicators: ['comfort', 'familiar', 'status quo']
  },
  'call_to_adventure': {
    patterns: [/change|opportunity|invitation|challenge/i],
    indicators: ['excitement', 'possibility', 'newness']
  },
  // ... 12 phases total
};
```

### 2. Sovereignty Protocol (`sovereignty-protocol.ts`)

Critical safeguards ensuring user empowerment over constraint.

#### Core Transformation Methods

```typescript
export class SovereigntyProtocol {
  static ensureSovereignSupport(
    analysis: any,
    userContext: any
  ): any {
    return {
      ...analysis,
      resonances: analysis.resonances.map(r => ({
        ...r,
        expression: this.toSupportiveExpression(r),
        invitation: this.toInvitation(r),
        validation: this.validateCurrentExpression(r, userContext)
      }))
    };
  }

  static transformGuidanceToOptions(guidance: string): string {
    return guidance
      .replace(/you should/gi, 'you might consider')
      .replace(/you must/gi, 'you could explore')
      .replace(/you need to/gi, 'you may find it supportive to');
  }
}
```

#### Constraint Detection System

```typescript
export class MAIASovereigntyIntegration {
  static detectConstraintSignals(userMessage: string): boolean {
    const constraintSignals = [
      /i don['']?t feel like/i,
      /that doesn['']?t seem right/i,
      /i['']?m not really/i,
      /that['']?s not me/i,
      /i don['']?t resonate with/i
    ];

    return constraintSignals.some(signal =>
      signal.test(userMessage)
    );
  }

  static generateSovereigntyRestoration(): string {
    return `🌟 I hear you, and I want to honor your authentic self completely...`;
  }
}
```

### 3. Integration Layer (`maia-archetypal-integration.ts`)

Seamlessly connects archetypal intelligence with MAIA's conversation system.

#### Core Integration Method

```typescript
export class MAIAArchetypalIntegration {
  async enhanceMAIAResponse(
    userMessage: string,
    userId: string,
    baseResponse: string,
    conversationContext: ConversationContext
  ): Promise<EnhancedResponse> {

    // 1. Analyze archetypal patterns
    const archetypalAnalysis = await this.engine
      .analyzeArchetypalResonance(userMessage, userProfile);

    // 2. Map Hero's Journey phase
    const heroJourneyPhase = this.engine
      .identifyHeroJourneyPhase(userMessage, userHistory);

    // 3. Detect morphic fields
    const morphicFields = this.engine
      .detectMorphicFields(userMessage, conversationContext);

    // 4. Generate enhanced response
    return this.synthesizeEnhancedResponse({
      baseResponse,
      archetypalAnalysis,
      heroJourneyPhase,
      morphicFields
    });
  }
}
```

---

## Integration Guide

### Step 1: Basic Setup

1. **Install Dependencies**
```bash
npm install
# All required dependencies are already in package.json
```

2. **Environment Configuration**
```typescript
// .env.local
ANTHROPIC_API_KEY=your_api_key_here  # Optional - system works without
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Import Core Services**
```typescript
import { maiaArchetypalIntegration } from '@/lib/consciousness/maia-archetypal-integration';
import { MAIASovereigntyIntegration } from '@/lib/consciousness/sovereignty-protocol';
```

### Step 2: Basic Integration

**Simple Integration Example:**
```typescript
import { maiaArchetypalIntegration } from '@/lib/consciousness/maia-archetypal-integration';

export async function enhanceConversation(message: string, userId: string) {
  try {
    const enhancement = await maiaArchetypalIntegration.enhanceMAIAResponse(
      message,
      userId,
      baseResponse.content,
      {
        messageCount: 1,
        themes: [],
        userState: 'seeking'
      }
    );

    return {
      response: enhancement.enhancedResponse,
      archetypal: enhancement.archetypalAnalysis,
      guidance: enhancement.guidanceOffered
    };
  } catch (error) {
    console.error('Archetypal enhancement error:', error);
    return { response: baseResponse.content }; // Graceful fallback
  }
}
```

### Step 3: API Endpoint Integration

The main API endpoint at `/app/api/oracle/conversation/route.ts` demonstrates full integration:

```typescript
export async function POST(request: NextRequest) {
  const { message, userId, sessionId } = await request.json();

  // Get base Maya response
  const baseResponse = await getMayaResponse(message, userId, sessionId);

  // Enhance with archetypal intelligence
  const archetypalEnhancement = await maiaArchetypalIntegration.enhanceMAIAResponse(
    message,
    userId,
    baseResponse.content,
    { messageCount: 1, themes: [], userState: 'seeking' }
  );

  // Apply sovereignty protocol
  const sovereignResponse = MAIASovereigntyIntegration.applySovereigntyProtocol(
    archetypalEnhancement,
    { firstTimeUser: false }
  );

  // Return enhanced response
  return NextResponse.json({
    success: true,
    response: sovereignResponse.enhancedResponse,
    archetypal: {
      primaryArchetype: archetypalEnhancement.archetypalAnalysis.primaryArchetype,
      heroJourneyPhase: archetypalEnhancement.archetypalAnalysis.heroJourneyPhase,
      // ... full archetypal data
    }
  });
}
```

---

## API Reference

### Core Methods

#### `analyzeArchetypalResonance(input, userProfile?)`

Analyzes text input for archetypal patterns and returns comprehensive analysis.

**Parameters:**
- `input: string` - Text to analyze
- `userProfile?: UserArchetypalProfile` - Optional user context

**Returns:**
```typescript
{
  primaryArchetype: ArchetypalSignature;
  resonanceIntensity: number;
  supportingArchetypes: ArchetypalSignature[];
  activeFields: MorphicFieldResonance[];
  consciousnessAnalysis: ConsciousnessStructureAnalysis;
  heroJourneyPhase: HeroJourneyPhase;
  guidanceResonance: GuidanceResonance;
}
```

#### `identifyHeroJourneyPhase(content, userHistory?)`

Maps content to specific Hero's Journey phases.

**Returns:**
```typescript
{
  currentPhase: 'ordinary_world' | 'call_to_adventure' | ... | 'return_with_elixir';
  confidence: number;
  supportiveGuidance: string;
  nextPhaseIndications?: string[];
}
```

#### `detectMorphicFields(input, context?)`

Identifies subtle morphic field resonances in user input.

**Returns:**
```typescript
{
  fieldType: 'ancestral' | 'collective_shadow' | 'planetary_crisis' | ...;
  intensity: number;
  fieldMessage: string;
  resonanceQuality: string;
}[]
```

### Sovereignty Protocol Methods

#### `applySovereigntyProtocol(response, userContext)`

Ensures response supports and empowers rather than constrains.

**Returns:**
```typescript
{
  enhancedResponse: string;
  sovereigntyReminder: string;
  constrainingElements: string[];
  empowermentElements: string[];
}
```

#### `detectConstraintSignals(userMessage)`

Monitors for user expressions of feeling constrained.

**Returns:** `boolean`

---

## Testing Framework

### Running Tests

```bash
# Run the comprehensive archetypal intelligence test suite
node scripts/test-archetypal-intelligence.js

# Test specific archetypal patterns
npm run test:archetypal-patterns

# Test sovereignty protocol
npm run test:sovereignty-protocol
```

### Test Structure

The testing framework validates:

1. **Archetypal Pattern Recognition**
   - Accuracy of archetype detection
   - Intensity scoring precision
   - False positive rates

2. **Hero's Journey Mapping**
   - Phase identification accuracy
   - Transition detection
   - Guidance appropriateness

3. **Sovereignty Protocol**
   - Constraint detection sensitivity
   - Language transformation effectiveness
   - Empowerment validation

4. **Integration Pipeline**
   - End-to-end response enhancement
   - Error handling robustness
   - Performance benchmarks

### Example Test Cases

```javascript
const testMessages = [
  {
    message: "I feel called to transform my life and step into my power",
    expectedArchetypes: ['solar', 'plutonic', 'martian'],
    expectedPhase: 'call_to_adventure',
    shouldTriggerSovereignty: false
  },
  {
    message: "I don't feel like I'm really that type of person",
    expectedConstraintDetection: true,
    shouldGenerateSovereigntyRestoration: true
  }
];
```

---

## Extension Guide

### Adding New Archetypes

1. **Define Archetype Patterns**
```typescript
// In archetypal-engine.ts
private readonly NEW_ARCHETYPE_PATTERNS = [
  /pattern1|pattern2|pattern3/i,
  /specific_phrases_for_archetype/i,
  // ... comprehensive pattern set
];

// Add to signature type
export type ArchetypalSignature =
  | 'solar' | 'lunar' | ... | 'new_archetype';
```

2. **Implement Recognition Logic**
```typescript
private analyzeNewArchetypeResonance(input: string): ArchetypalResonance {
  const patterns = this.NEW_ARCHETYPE_PATTERNS;
  const intensity = this.calculateSemanticIntensity(patterns, input);

  return {
    signature: 'new_archetype',
    intensity,
    confidence: this.calculateConfidence(intensity, patterns),
    patterns: this.extractMatchedPatterns(input, patterns),
    fieldMessage: this.generateFieldMessage(intensity, 'new_archetype')
  };
}
```

3. **Update Sovereignty Protocol**
```typescript
// In sovereignty-protocol.ts
private static toSupportiveExpression(resonance: any): string {
  const supportiveFraming = {
    // ... existing archetypes
    'new_archetype': 'I recognize your unique new_archetype essence expressing itself beautifully'
  };

  return supportiveFraming[resonance.signature] ||
         `I see the ${resonance.signature} energy flowing through you`;
}
```

### Adding New Morphic Fields

1. **Define Field Patterns**
```typescript
private readonly NEW_MORPHIC_FIELD_PATTERNS = {
  fieldType: 'new_field',
  indicators: [
    /new_field_pattern1/i,
    /new_field_pattern2/i
  ],
  resonanceQualities: ['quality1', 'quality2', 'quality3']
};
```

2. **Implement Detection Algorithm**
```typescript
private detectNewMorphicField(input: string): MorphicFieldResonance | null {
  const patterns = this.NEW_MORPHIC_FIELD_PATTERNS;
  const matches = this.findPatternMatches(input, patterns.indicators);

  if (matches.length > 0) {
    return {
      fieldType: 'new_field',
      intensity: this.calculateFieldIntensity(matches, input),
      fieldMessage: this.generateFieldMessage(matches),
      resonanceQuality: this.determineResonanceQuality(matches, input)
    };
  }

  return null;
}
```

### Customizing Response Generation

```typescript
// Extend the response synthesis process
export class CustomArchetypalIntegration extends MAIAArchetypalIntegration {
  protected async synthesizeEnhancedResponse(
    analysisData: ArchetypalAnalysisData
  ): Promise<EnhancedResponse> {
    const baseResponse = await super.synthesizeEnhancedResponse(analysisData);

    // Add custom enhancements
    const customEnhancements = await this.addCustomEnhancements(
      baseResponse,
      analysisData
    );

    return {
      ...baseResponse,
      customEnhancements
    };
  }
}
```

---

## Performance Optimization

### Caching Strategies

1. **User Profile Caching**
```typescript
// Cache user archetypal profiles for session
const userProfileCache = new Map<string, UserArchetypalProfile>();

async function getCachedUserProfile(userId: string): Promise<UserArchetypalProfile> {
  if (userProfileCache.has(userId)) {
    return userProfileCache.get(userId)!;
  }

  const profile = await this.buildUserProfile(userId);
  userProfileCache.set(userId, profile);
  return profile;
}
```

2. **Pattern Compilation**
```typescript
// Pre-compile regex patterns for better performance
private readonly COMPILED_PATTERNS = new Map([
  ['solar', this.SOLAR_PATTERNS.map(p => new RegExp(p, 'i'))],
  ['lunar', this.LUNAR_PATTERNS.map(p => new RegExp(p, 'i'))],
  // ... all archetypes
]);
```

3. **Async Processing Pipeline**
```typescript
async enhanceMAIAResponse(message: string, userId: string, baseResponse: string) {
  // Process archetypal analysis, hero's journey, and morphic fields in parallel
  const [archetypalAnalysis, heroJourneyPhase, morphicFields] = await Promise.all([
    this.engine.analyzeArchetypalResonance(message, userProfile),
    this.engine.identifyHeroJourneyPhase(message, userHistory),
    this.engine.detectMorphicFields(message, conversationContext)
  ]);

  return this.synthesizeEnhancedResponse({
    baseResponse,
    archetypalAnalysis,
    heroJourneyPhase,
    morphicFields
  });
}
```

### Memory Management

```typescript
// Limit user profile history to prevent memory bloat
private readonly MAX_USER_HISTORY = 100;
private readonly MAX_CACHED_PROFILES = 1000;

private maintainCacheSize() {
  if (this.userProfileCache.size > this.MAX_CACHED_PROFILES) {
    const oldestKeys = [...this.userProfileCache.keys()].slice(0, 100);
    oldestKeys.forEach(key => this.userProfileCache.delete(key));
  }
}
```

---

## Deployment Considerations

### Environment-Specific Configuration

**Development:**
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Enable detailed logging
  console.log('🌟 Archetypal analysis:', archetypalAnalysis);
  // Use mock responses when Anthropic API unavailable
}
```

**Production:**
```typescript
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // Implement rate limiting
  // Enable error tracking
  // Use production-optimized caching
}
```

### Scaling Considerations

1. **Database Integration**
```typescript
// For production, replace in-memory storage with database
export class DatabaseArchetypalProfileManager {
  async saveUserProfile(userId: string, profile: UserArchetypalProfile) {
    await db.collection('user_profiles').doc(userId).set(profile);
  }

  async getUserProfile(userId: string): Promise<UserArchetypalProfile> {
    const doc = await db.collection('user_profiles').doc(userId).get();
    return doc.data() as UserArchetypalProfile;
  }
}
```

2. **Microservice Architecture**
```typescript
// Archetypal Intelligence as dedicated service
export class ArchetypalIntelligenceService {
  private baseURL = process.env.ARCHETYPAL_SERVICE_URL;

  async analyzeMessage(message: string, userId: string) {
    const response = await fetch(`${this.baseURL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId })
    });

    return response.json();
  }
}
```

3. **CDN and Caching**
```typescript
// Cache archetypal analysis results
export class CachedArchetypalEngine extends ArchetypalIntelligenceEngine {
  private redis = new Redis(process.env.REDIS_URL);

  async analyzeArchetypalResonance(input: string, userProfile?: UserArchetypalProfile) {
    const cacheKey = `archetypal:${hash(input + JSON.stringify(userProfile))}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const analysis = await super.analyzeArchetypalResonance(input, userProfile);
    await this.redis.setex(cacheKey, 3600, JSON.stringify(analysis)); // 1 hour cache

    return analysis;
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Import Path Errors
**Error:** `Cannot find module '@/lib/consciousness/archetypal-engine'`
**Solution:**
```typescript
// Ensure correct relative paths
import { ArchetypalIntelligenceEngine } from '../lib/consciousness/archetypal-engine';

// Or check tsconfig.json paths configuration
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. Missing SpiralogicCoreService
**Error:** `Cannot find module 'SpiralogicCoreService'`
**Solution:**
The `SpiralogicCoreService.ts` file is included in the system:
```typescript
// lib/services/SpiralogicCoreService.ts
export class SpiralogicCoreService {
  async getCurrentState(userId: string): Promise<SpiralogicState> {
    // Implementation provided
  }
}
```

#### 3. Pattern Recognition Not Working
**Problem:** Archetypal patterns not being detected accurately.
**Debugging:**
```typescript
// Enable debug logging
const debugAnalysis = true;

if (debugAnalysis) {
  console.log('Input text:', input);
  console.log('Matched patterns:', matchedPatterns);
  console.log('Calculated intensity:', intensity);
  console.log('Final archetype:', primaryArchetype);
}
```

#### 4. Sovereignty Protocol Not Triggering
**Problem:** Constraint signals not being detected.
**Solution:**
```typescript
// Test constraint detection directly
const testConstraint = "I don't feel like this resonates with me";
const isConstrained = MAIASovereigntyIntegration.detectConstraintSignals(testConstraint);
console.log('Constraint detected:', isConstrained); // Should be true
```

### Performance Issues

#### 1. Slow Pattern Matching
**Optimization:**
```typescript
// Pre-compile and cache regex patterns
private readonly COMPILED_PATTERN_CACHE = new Map();

private getCompiledPattern(pattern: string): RegExp {
  if (!this.COMPILED_PATTERN_CACHE.has(pattern)) {
    this.COMPILED_PATTERN_CACHE.set(pattern, new RegExp(pattern, 'i'));
  }
  return this.COMPILED_PATTERN_CACHE.get(pattern);
}
```

#### 2. Memory Usage Growth
**Monitoring:**
```typescript
// Monitor memory usage
function logMemoryUsage() {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
  });
}
```

---

## Contributing

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/MAIA-SOVEREIGN.git
cd MAIA-SOVEREIGN
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Run Tests**
```bash
node scripts/test-archetypal-intelligence.js
```

### Code Standards

1. **TypeScript Strict Mode**
```typescript
// Always use strict typing
export interface UserArchetypalProfile {
  userId: string;
  dominantArchetypes: ArchetypalSignature[];
  evolutionPath: EvolutionPath;
  lastAnalyzed: Date;
}
```

2. **Sovereignty-First Development**
```typescript
// ALWAYS ensure user empowerment
function generateGuidance(analysis: ArchetypalAnalysis): string {
  // ❌ NEVER: "You should embrace your solar nature"
  // ✅ ALWAYS: "You might explore embracing your radiant solar qualities if that feels aligned"

  return SovereigntyProtocol.transformGuidanceToOptions(rawGuidance);
}
```

3. **Error Handling**
```typescript
// Provide graceful fallbacks
try {
  const enhancement = await maiaArchetypalIntegration.enhanceMAIAResponse(message, userId, baseResponse, context);
  return enhancement;
} catch (error) {
  console.error('Archetypal enhancement error:', error);
  // Always return functional response even if enhancement fails
  return { response: baseResponse, archetypal: null };
}
```

### Submitting Changes

1. **Test Your Changes**
```bash
# Run the full test suite
node scripts/test-archetypal-intelligence.js

# Test specific functionality
npm run test:sovereignty-protocol
npm run test:hero-journey
```

2. **Follow Sovereignty Protocol**
- Ensure all new features support rather than constrain users
- Test constraint detection on new patterns
- Validate empowerment language transformation

3. **Submit Pull Request**
- Include test results
- Document new patterns or features
- Explain sovereignty considerations

---

## Example Projects

### Basic Integration Example

```typescript
// examples/basic-integration.ts
import { maiaArchetypalIntegration } from '@/lib/consciousness/maia-archetypal-integration';

async function simpleArchetypalAnalysis(userMessage: string) {
  const analysis = await maiaArchetypalIntegration.enhanceMAIAResponse(
    userMessage,
    'user123',
    'Base response content',
    { messageCount: 1, themes: [], userState: 'exploring' }
  );

  console.log('Primary Archetype:', analysis.archetypalAnalysis.primaryArchetype);
  console.log('Hero\'s Journey Phase:', analysis.archetypalAnalysis.heroJourneyPhase);
  console.log('Enhanced Response:', analysis.enhancedResponse);
}

// Test it
simpleArchetypalAnalysis("I feel called to transform my life and step into my power");
```

### Custom Archetype Extension

```typescript
// examples/custom-archetype.ts
import { ArchetypalIntelligenceEngine } from '@/lib/consciousness/archetypal-engine';

class ExtendedArchetypalEngine extends ArchetypalIntelligenceEngine {
  private readonly CUSTOM_ARCHETYPE_PATTERNS = [
    /innovation|creativity|invention|breakthrough/i,
    /artistic|aesthetic|beautiful|creative expression/i,
    /technology|digital|virtual|cyber/i
  ];

  protected analyzeCustomArchetype(input: string): ArchetypalResonance | null {
    const intensity = this.calculateSemanticIntensity(this.CUSTOM_ARCHETYPE_PATTERNS, input);

    if (intensity > 0.3) {
      return {
        signature: 'creative_innovator' as any,
        intensity,
        confidence: intensity,
        patterns: this.extractMatchedPatterns(input, this.CUSTOM_ARCHETYPE_PATTERNS),
        fieldMessage: `Creative innovation energy flowing through your expression`
      };
    }

    return null;
  }
}
```

---

## Support

### Technical Issues
- Check the [Troubleshooting section](#troubleshooting) above
- Review the comprehensive test suite results
- Examine console logs for detailed error information

### Architecture Questions
- Review the [Architecture Overview](#architecture-overview)
- Study the file structure and component relationships
- Examine the API reference for detailed method documentation

### Sovereignty Protocol Questions
- Understanding user empowerment safeguards
- Implementing constraint detection
- Customizing sovereignty reminders

### Community Support
- Community Commons discussions
- MAIA conversation for specific questions
- Developer collaboration channels

---

**Remember**: The archetypal intelligence system exists to serve consciousness evolution, never to constrain or define users. Every technical decision should prioritize user sovereignty, authentic expression, and empowering support over categorization or prescription.

🌟 **For the evolution of consciousness and the liberation of all beings through sacred technology** 🌟