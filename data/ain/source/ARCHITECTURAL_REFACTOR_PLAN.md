# Architectural Refactor Plan: SpiralogicOracleSystem

## Current State Analysis
- **74+ Services** identified with overlapping responsibilities
- **Circular dependencies** creating tight coupling
- **Performance bottlenecks** from synchronous service instantiation
- **Code duplication** across multiple PersonalOracleAgent implementations
- **Inconsistent API patterns** across 75+ endpoints

## Target Architecture

### 1. Core Service Consolidation (74 → 12 Services)

#### **Unified Services Structure:**

```
Core Services (12):
├── UserService           - Authentication, profiles, preferences
├── OracleService         - Core oracle functionality & conversation management  
├── NarrativeService      - All narrative generation (personal, collective, daimonic)
├── VoiceService          - Audio synthesis, playback, transcription
├── MemoryService         - Unified memory operations (SQLite, Vector, Supabase)
├── AnalyticsService      - Tracking, insights, emotional analysis
├── CollectiveService     - Shared consciousness, field data
├── DaimonicService       - Daimonic encounters, shadow work
├── OnboardingService     - User journey initiation
├── IntegrationService    - Cross-platform integrations
├── ConfigurationService  - Settings, preferences, feature flags
└── EventBusService       - Event-driven communication between services
```

#### **Services to Consolidate:**

**OracleService** (consolidates 15+ services):
- PersonalOracleAgent (3 versions)
- EnhancedPersonalOracleAgent
- OraclePersonalityService
- OracleStateMachineManager
- PersonalOracleIntegration
- LayeredAgentService
- MultiAgentChoreographyService

**NarrativeService** (consolidates 8+ services):
- CollectiveNarrativeService
- DaimonicNarrativeGenerator
- DaimonicNarrativeService
- SHIFtNarrativeService
- EnhancedSHIFtNarrative
- SafeNarrativeService

**DaimonicService** (consolidates 12+ services):
- DaimonicOrchestrator
- DaimonicDetectionService
- DaimonicDialogue
- DaimonicEventService
- DaimonicFacilitationService
- DaimonicOthernessService
- DaimonicPromptOrchestrator
- DaimonicReservoirService
- DaimonicResponseOrchestrator
- DaimonicVoiceService
- ElementalOthernessService

## 2. Dependency Injection Overhaul

### **Enhanced DI Container:**
```typescript
// Replace simple 11-line container with proper DI framework
interface ServiceContainer {
  register<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void;
  registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): void;
  resolve<T>(token: ServiceToken<T>): T;
  createScope(): ScopedContainer;
  dispose(): Promise<void>;
}
```

### **Service Lifecycle Management:**
- Singleton services for stateless operations
- Scoped services for request-bound operations
- Transient services for stateful operations
- Proper disposal and cleanup

## 3. API Layer Standardization

### **Unified Middleware Stack:**
```typescript
// Standard middleware pipeline for all routes:
export const withMiddleware = (
  request: NextRequest,
  handler: RouteHandler
) => {
  return middleware([
    requestValidation,
    authentication,
    rateLimit,
    errorHandling,
    responseFormatting,
    monitoring
  ])(request, handler);
}
```

### **Consistent Route Patterns:**
- Zod schema validation for all inputs
- Standard error response format
- Unified authentication flow
- Consistent logging and monitoring

## 4. Performance Optimizations

### **Caching Strategy:**
```typescript
// Three-tier caching:
// L1: In-memory (service-level)
// L2: Redis (application-level)  
// L3: Database (persistent)

interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  stats(): Promise<CacheStats>;
}
```

### **Lazy Service Loading:**
```typescript
// Replace synchronous service instantiation with lazy loading
class ServiceFactory {
  private instances = new Map<string, any>();
  
  create<T>(token: ServiceToken<T>): T {
    if (!this.instances.has(token.key)) {
      this.instances.set(token.key, this.instantiate(token));
    }
    return this.instances.get(token.key);
  }
}
```

## 5. Data Model Unification

### **Canonical User Model:**
```typescript
interface UnifiedUser {
  id: string;
  authentication: AuthProfile;
  oracle: OracleProfile;
  collective: CollectiveProfile;  
  daimonic: DaimonicProfile;
  preferences: UserPreferences;
  journey: JourneyState;
  analytics: AnalyticsProfile;
}
```

### **Event-Driven State Management:**
```typescript
// Replace direct service calls with events
interface UserEvent {
  type: string;
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
}

// Event sourcing for user journey tracking
class UserJourneyTracker {
  async recordEvent(event: UserEvent): Promise<void>;
  async getEventHistory(userId: string): Promise<UserEvent[]>;
  async replayEvents(userId: string): Promise<UserState>;
}
```

## 6. Implementation Phases

### **Phase 1: Foundation (Weeks 1-4)**
1. ✅ Create architectural refactor plan
2. 🔄 Implement enhanced DI container  
3. 🔄 Create unified service interfaces
4. 🔄 Consolidate PersonalOracleAgent implementations

### **Phase 2: Service Consolidation (Weeks 5-8)**
1. Merge OracleService family (15 → 1)
2. Merge NarrativeService family (8 → 1)  
3. Merge DaimonicService family (12 → 1)
4. Implement caching layer

### **Phase 3: API Standardization (Weeks 9-12)**
1. Create unified middleware stack
2. Refactor all API routes to standard pattern
3. Implement request validation with Zod
4. Add comprehensive error handling

### **Phase 4: Performance & Testing (Weeks 13-16)**
1. Implement lazy loading patterns
2. Add comprehensive monitoring
3. Load testing and optimization
4. Memory leak detection and resolution

## 7. Success Metrics

### **Technical Metrics:**
- Services reduced from 74 to 12 (83% reduction)
- Circular dependencies eliminated (0 cycles)
- API response time improved by 60%+
- Memory usage reduced by 40%+
- Test coverage increased to 80%+

### **Developer Experience:**
- Single service responsibility clarity
- Consistent development patterns
- Reduced onboarding time for new developers
- Clear architectural documentation

### **Platform Coherence:**
- Unified data flow across all dimensions
- Consistent UX patterns
- Seamless cross-dashboard navigation
- Scalable foundation for new features

## 8. Risk Mitigation

### **Breaking Changes:**
- Feature flags for gradual rollout
- Backward compatibility layers
- Comprehensive integration testing
- Rollback procedures for each phase

### **Performance Risks:**
- Load testing at each phase
- Performance monitoring during refactor
- Gradual traffic shifting
- Fallback to previous implementation

## 9. Timeline

**Total Duration:** 16 weeks
**Resources:** 2-3 experienced developers  
**Parallel Development:** Feature development continues on stable branches

This refactor will transform SpiralogicOracleSystem from a complex, tightly-coupled monolith into a clean, scalable, multidimensional platform ready for production deployment and future innovation.