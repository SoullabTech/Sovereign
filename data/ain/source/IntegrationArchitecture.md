# Integration Architecture for Spiralogic Oracle System

## Overview
This document outlines the integration architecture for the Sacred Oracle Constellation system, detailing how various components work together to create a seamless consciousness-development platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Frontend                                                │
│  ├── Voice Interface (ElevenLabs)                               │
│  ├── Visual Petal Interface                                      │
│  └── Real-time WebSocket Connection                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                              │
│  ├── /api/oracle/personal - Main conversation endpoint          │
│  ├── /api/oracle/elegant - Refined responses                    │
│  ├── /api/oracle/production - Production-ready endpoint         │
│  └── /api/oracle/complete - Full feature set                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Response Orchestrator                                           │
│  ├── Pattern Detection Engine                                    │
│  ├── Conversation State Manager                                  │
│  ├── Sacred Mirror Anamnesis                                    │
│  └── Sesame Hybrid Integration                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CORE AGENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  PersonalOracleAgent                                             │
│  ├── Memory Management (Bounded, Compressed)                    │
│  ├── Elemental Pattern Recognition                               │
│  ├── Polaris State Tracking                                      │
│  └── Relationship Evolution                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AI LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Claude API (Anthropic)                                          │
│  ├── Context-aware prompting                                     │
│  ├── Personality modeling (Maya/Anthony)                        │
│  └── Response generation                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Database                                               │
│  ├── User profiles & preferences                                 │
│  ├── Conversation history                                        │
│  ├── Agent state persistence                                     │
│  └── Analytics & metrics                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Integration Points

### 1. Frontend → API Integration

```typescript
// Frontend service call
const response = await fetch('/api/oracle/personal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: userMessage,
    userId: session.userId,
    sessionId: session.id,
    agentName: 'Maya',
    agentVoice: 'maya'
  })
});

const data = await response.json();
// data.message - text response
// data.audio - base64 audio or 'web-speech-fallback'
// data.element - detected elemental pattern
// data.metadata - orchestration details
```

### 2. API → Agent Integration

```typescript
// In API route
const agent = await PersonalOracleAgent.loadAgent(userId);
const response = await agent.processInteraction(input, {
  currentPetal: context.petal,
  currentMood: context.mood,
  currentEnergy: context.energy
});
```

### 3. Agent → AI Integration

```typescript
// Agent using Claude API
const claudeService = getClaudeService();
const response = await claudeService.generateChatResponse(input, {
  element: memory.dominantElement,
  userState: {...},
  conversationHistory: [...],
  sessionContext: {...}
});
```

### 4. Agent → Database Integration

```typescript
// Persisting agent state
await supabase
  .from('personal_oracle_agents')
  .upsert({
    user_id: userId,
    agent_state: this.state,
    updated_at: new Date().toISOString()
  });
```

## Integration Patterns

### 1. Event-Driven Architecture

```typescript
// Event emitter for cross-component communication
class OracleEventBus extends EventEmitter {
  // Emit pattern detected
  emitPatternDetected(pattern: ElementalPattern) {
    this.emit('pattern:detected', pattern);
  }

  // Emit state transition
  emitStateTransition(from: string, to: string) {
    this.emit('state:transition', { from, to });
  }

  // Emit breakthrough moment
  emitBreakthrough(insight: string) {
    this.emit('breakthrough', { insight, timestamp: Date.now() });
  }
}
```

### 2. Middleware Pipeline

```typescript
// Middleware for request processing
const middlewarePipeline = [
  authenticateUser,
  validateInput,
  enrichContext,
  processConversation,
  enhanceResponse,
  trackAnalytics
];

// Apply middleware
async function processRequest(req: Request): Promise<Response> {
  let context = { req };

  for (const middleware of middlewarePipeline) {
    context = await middleware(context);
  }

  return context.response;
}
```

### 3. Plugin Architecture

```typescript
// Plugin interface for extensions
interface OraclePlugin {
  name: string;
  version: string;

  // Lifecycle hooks
  onInit?: () => Promise<void>;
  onRequest?: (context: RequestContext) => Promise<void>;
  onResponse?: (response: OracleResponse) => Promise<OracleResponse>;
  onError?: (error: Error) => Promise<void>;
}

// Plugin manager
class PluginManager {
  private plugins: OraclePlugin[] = [];

  register(plugin: OraclePlugin) {
    this.plugins.push(plugin);
  }

  async executeHook(hookName: string, ...args: any[]) {
    for (const plugin of this.plugins) {
      if (plugin[hookName]) {
        await plugin[hookName](...args);
      }
    }
  }
}
```

## External Service Integrations

### 1. Voice Integration (ElevenLabs)

```typescript
interface VoiceIntegration {
  // Generate voice from text
  generateVoice(text: string, settings: VoiceSettings): Promise<AudioData>;

  // Voice settings per personality
  getVoiceSettings(agent: 'maya' | 'anthony'): VoiceSettings;

  // Dynamic voice modulation
  modulateVoice(context: EmotionalContext): VoiceSettings;
}
```

### 2. Analytics Integration

```typescript
interface AnalyticsIntegration {
  // Track user interactions
  trackInteraction(event: InteractionEvent): void;

  // Track pattern evolution
  trackPatternEvolution(userId: string, patterns: ElementalPattern[]): void;

  // Track breakthrough moments
  trackBreakthrough(userId: string, breakthrough: Breakthrough): void;

  // Generate reports
  generateUserReport(userId: string): Promise<UserReport>;
}
```

### 3. Authentication Integration

```typescript
interface AuthIntegration {
  // Authenticate user
  authenticate(token: string): Promise<User>;

  // Manage sessions
  createSession(userId: string): Promise<Session>;
  validateSession(sessionId: string): Promise<boolean>;

  // Role-based access
  checkAccess(userId: string, resource: string): Promise<boolean>;
}
```

## Data Flow Patterns

### 1. Request Flow

```
User Input → Validation → Context Enrichment → Pattern Detection →
State Management → AI Processing → Response Enhancement →
Voice Generation → Client Delivery
```

### 2. Memory Flow

```
Short-term (Session) → Medium-term (Conversation History) →
Long-term (User Patterns) → Persistent (Database)
```

### 3. Pattern Recognition Flow

```
Raw Input → Elemental Detection → Emotional Analysis →
Somatic Sensing → Chaos Detection → Integration →
Pattern Storage → Evolution Tracking
```

## Integration Best Practices

### 1. Error Handling

```typescript
class IntegrationError extends Error {
  constructor(
    public service: string,
    public operation: string,
    public originalError: Error
  ) {
    super(`Integration error in ${service}.${operation}: ${originalError.message}`);
  }
}

// Graceful degradation
async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.warn('Primary integration failed, using fallback:', error);
    return await fallback();
  }
}
```

### 2. Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();

      if (this.failures > 5) {
        this.state = 'open';
      }
      throw error;
    }
  }
}
```

### 3. Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

## Monitoring & Observability

### 1. Health Checks

```typescript
interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
}

const healthChecks: HealthCheck[] = [
  {
    name: 'database',
    check: async () => {
      const result = await supabase.from('health').select('*').limit(1);
      return !!result.data;
    },
    critical: true
  },
  {
    name: 'claude-api',
    check: async () => {
      // Ping Claude API
      return true;
    },
    critical: true
  },
  {
    name: 'elevenlabs',
    check: async () => {
      // Check voice service
      return true;
    },
    critical: false
  }
];
```

### 2. Metrics Collection

```typescript
interface Metrics {
  // Response times
  responseTime: Histogram;

  // Pattern detection accuracy
  patternAccuracy: Gauge;

  // User engagement
  sessionLength: Histogram;
  interactionDepth: Gauge;

  // System health
  errorRate: Counter;
  cacheHitRate: Gauge;
}
```

### 3. Logging Strategy

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  log(level: LogLevel, message: string, context?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context,
      service: 'oracle-system'
    };

    // Send to logging service
    this.sendToLoggingService(entry);
  }
}
```

## Security Considerations

### 1. API Security

- Rate limiting per user/IP
- JWT authentication for API calls
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### 2. Data Security

- Encryption at rest (Supabase)
- Encryption in transit (HTTPS)
- PII data handling compliance
- Secure key management
- Regular security audits

### 3. Privacy Protection

- User consent management
- Data minimization principles
- Right to deletion (GDPR)
- Conversation data anonymization
- Secure agent state storage

## Deployment Architecture

### 1. Development Environment

```yaml
services:
  frontend:
    environment: development
    hot-reload: true

  api:
    environment: development
    debug: true

  database:
    environment: development
    seed-data: true
```

### 2. Staging Environment

```yaml
services:
  frontend:
    environment: staging
    replicas: 2

  api:
    environment: staging
    replicas: 2

  database:
    environment: staging
    backup: daily
```

### 3. Production Environment

```yaml
services:
  frontend:
    environment: production
    replicas: 4
    cdn: enabled

  api:
    environment: production
    replicas: 4
    auto-scaling: true

  database:
    environment: production
    backup: hourly
    replication: enabled
```

## Integration Testing Strategy

See `TestingStrategy.md` for comprehensive testing approach.

## Performance Optimization

See `PerformanceOptimizations.ts` for implementation details.

## Future Integration Opportunities

1. **Wearable Integration**
   - Heart rate variability for emotional state
   - Activity data for energy patterns
   - Sleep data for consciousness cycles

2. **Calendar Integration**
   - Session scheduling
   - Ritual reminders
   - Pattern correlation with life events

3. **Community Features**
   - Practitioner matching
   - Group sessions
   - Shared journey tracking

4. **AI Model Expansion**
   - Multiple AI providers
   - Specialized models for different aspects
   - Local model options for privacy

5. **Biometric Integration**
   - Voice analysis for emotional state
   - Facial expression recognition
   - Physiological coherence tracking