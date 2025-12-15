# 📊 Beta Analytics Integration Framework
*Real-time onboarding and engagement tracking for Maya's beta launch*

## Overview
This framework captures detailed analytics from the Interactive Beta Onboarding Flow and ongoing Maya interactions, feeding real-time data to the Beta Launch Dashboard for operational visibility and optimization.

## 🎯 Key Metrics to Track

### Onboarding Funnel Analytics
```typescript
interface OnboardingMetrics {
  // Phase completion tracking
  phaseStarted: { phase: number, timestamp: Date, userId: string }
  phaseCompleted: { phase: number, duration: number, userId: string }
  phaseDropoff: { phase: number, timestamp: Date, reason: string, userId: string }
  
  // Critical moments
  nameProvided: { name: string, timestamp: Date, userId: string }
  voiceActivated: { success: boolean, timestamp: Date, userId: string }
  memoryRecallSuccessful: { recalled: boolean, accuracy: number, userId: string }
  multimodalEngagement: { type: 'file' | 'url', success: boolean, userId: string }
  
  // Overall completion
  onboardingCompleted: { totalTime: number, timestamp: Date, userId: string }
  onboardingAbandoned: { lastPhase: number, timestamp: Date, userId: string }
}
```

### Conversation Quality Metrics
```typescript
interface ConversationMetrics {
  // Memory system performance
  memoryOrchestrationSuccess: { layers: string[], tokenCount: number, userId: string }
  sessionPersistenceVerified: { sessionEntries: number, success: boolean, userId: string }
  personalizedResponseGenerated: { containsName: boolean, containsContext: boolean, userId: string }
  
  // Voice interaction metrics
  voiceTranscriptionAccuracy: { confidence: number, finalText: string, userId: string }
  ttsGenerationSuccess: { provider: 'sesame' | 'elevenlabs' | 'mock', latency: number, userId: string }
  voiceLoopCompleted: { totalTime: number, success: boolean, userId: string }
  
  // User engagement patterns
  sessionDuration: { minutes: number, turns: number, userId: string }
  returnVisit: { daysSinceLastVisit: number, userId: string }
  featureUsage: { voice: boolean, upload: boolean, elements: string[], userId: string }
}
```

## 🔌 Analytics Hooks Implementation

### 1. Onboarding Phase Tracking
```typescript
// hooks/useOnboardingAnalytics.ts
export const useOnboardingAnalytics = () => {
  const trackPhaseStart = (phase: number) => {
    const event = {
      type: 'onboarding_phase_started',
      phase,
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      metadata: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        referrer: document.referrer
      }
    }
    
    // Send to multiple analytics providers
    Promise.allSettled([
      sendToSupabase(event),
      sendToMixpanel(event),
      sendToBetaDashboard(event)
    ])
  }
  
  const trackPhaseComplete = (phase: number, startTime: Date) => {
    const duration = Date.now() - startTime.getTime()
    
    const event = {
      type: 'onboarding_phase_completed',
      phase,
      duration,
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      metadata: {
        completionRate: phase / 6, // 6 total phases
        isFirstSession: checkIfFirstSession(),
        deviceType: getDeviceType()
      }
    }
    
    Promise.allSettled([
      sendToSupabase(event),
      sendToMixpanel(event),
      sendToBetaDashboard(event)
    ])
  }
  
  const trackCriticalMoment = (moment: string, data: any) => {
    const event = {
      type: 'onboarding_critical_moment',
      moment,
      data,
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId()
    }
    
    // Critical moments get priority sending
    sendToBetaDashboard(event, { priority: 'high' })
    sendToSupabase(event)
  }
  
  return { trackPhaseStart, trackPhaseComplete, trackCriticalMoment }
}
```

### 2. Memory System Analytics
```typescript
// hooks/useMemoryAnalytics.ts
export const useMemoryAnalytics = () => {
  const trackMemoryOrchestration = (context: MemoryContext) => {
    const event = {
      type: 'memory_orchestration_complete',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      metrics: {
        sessionEntries: context.session?.length || 0,
        journalEntries: context.journal?.length || 0,
        profileLoaded: !!context.profile,
        symbolicPatterns: context.symbolic?.length || 0,
        externalContent: context.external?.length || 0,
        totalTokens: JSON.stringify(context).length,
        layersUsed: Object.keys(context).filter(key => context[key]?.length > 0),
        processingTime: context.processingTime
      }
    }
    
    sendToBetaDashboard(event, { realtime: true })
    sendToSupabase(event)
  }
  
  const trackMemoryRecallTest = (question: string, response: string, successful: boolean) => {
    const event = {
      type: 'memory_recall_tested',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      data: {
        question,
        response: response.substring(0, 200), // Truncate for storage
        successful,
        containsName: response.toLowerCase().includes(getCurrentUser().name?.toLowerCase()),
        containsInterests: checkForUserInterests(response),
        responseLength: response.length,
        contextualReferences: countContextualReferences(response)
      }
    }
    
    sendToBetaDashboard(event, { priority: 'high' })
    sendToSupabase(event)
  }
  
  return { trackMemoryOrchestration, trackMemoryRecallTest }
}
```

### 3. Voice Interaction Analytics
```typescript
// hooks/useVoiceAnalytics.ts
export const useVoiceAnalytics = () => {
  const trackVoiceActivation = (success: boolean, error?: string) => {
    const event = {
      type: 'voice_activation_attempt',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      data: {
        success,
        error,
        browserSupport: {
          mediaDevices: !!navigator.mediaDevices,
          getUserMedia: !!navigator.mediaDevices?.getUserMedia,
          audioContext: !!(window.AudioContext || window.webkitAudioContext)
        },
        permissions: getPermissionStates()
      }
    }
    
    sendToBetaDashboard(event, { priority: 'high' })
    sendToSupabase(event)
  }
  
  const trackTranscription = (interim: string, final: string, confidence: number) => {
    const event = {
      type: 'voice_transcription_complete',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      metrics: {
        interimLength: interim.length,
        finalLength: final.length,
        confidence,
        accuracy: calculateTranscriptionAccuracy(interim, final),
        wordCount: final.split(' ').length,
        processingTime: getTranscriptionTime()
      }
    }
    
    sendToBetaDashboard(event, { realtime: true })
    sendToSupabase(event)
  }
  
  const trackTTSGeneration = (provider: string, success: boolean, latency: number) => {
    const event = {
      type: 'tts_generation_complete',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      data: {
        provider,
        success,
        latency,
        fallbackUsed: provider !== 'sesame',
        audioUrl: success ? 'generated' : null,
        errorType: success ? null : getTTSErrorType()
      }
    }
    
    sendToBetaDashboard(event, { realtime: true })
    sendToSupabase(event)
  }
  
  return { trackVoiceActivation, trackTranscription, trackTTSGeneration }
}
```

### 4. User Engagement Analytics
```typescript
// hooks/useEngagementAnalytics.ts
export const useEngagementAnalytics = () => {
  const trackSessionStart = () => {
    const event = {
      type: 'session_started',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      context: {
        isReturningUser: checkIfReturningUser(),
        daysSinceLastVisit: getDaysSinceLastVisit(),
        totalPreviousSessions: getPreviousSessionCount(),
        referrer: document.referrer,
        utmParams: getUTMParameters()
      }
    }
    
    sendToBetaDashboard(event)
    sendToSupabase(event)
  }
  
  const trackFeatureUsage = (feature: string, success: boolean, metadata?: any) => {
    const event = {
      type: 'feature_used',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      data: {
        feature,
        success,
        metadata,
        sessionTime: getSessionDuration(),
        isFirstUse: checkIfFirstFeatureUse(feature)
      }
    }
    
    sendToBetaDashboard(event, { realtime: true })
    sendToSupabase(event)
  }
  
  const trackSessionEnd = (reason: 'natural' | 'timeout' | 'error') => {
    const event = {
      type: 'session_ended',
      timestamp: new Date(),
      userId: getCurrentUserId(),
      sessionId: getCurrentSessionId(),
      metrics: {
        duration: getSessionDuration(),
        messageCount: getMessageCount(),
        featuresUsed: getUsedFeatures(),
        voiceMinutes: getVoiceTime(),
        uploadsCount: getUploadCount(),
        endReason: reason,
        satisfaction: getImpliedSatisfaction() // Based on session length, returns, etc.
      }
    }
    
    sendToBetaDashboard(event)
    sendToSupabase(event)
  }
  
  return { trackSessionStart, trackFeatureUsage, trackSessionEnd }
}
```

## 📊 Real-Time Dashboard Data Feed

### WebSocket Connection for Live Updates
```typescript
// lib/realtimeAnalytics.ts
class RealtimeBetaAnalytics {
  private ws: WebSocket | null = null
  private eventQueue: AnalyticsEvent[] = []
  
  connect() {
    this.ws = new WebSocket(process.env.NEXT_PUBLIC_ANALYTICS_WS_URL!)
    
    this.ws.onopen = () => {
      console.log('Connected to Beta Analytics Dashboard')
      this.flushEventQueue()
    }
    
    this.ws.onclose = () => {
      console.log('Disconnected from Beta Analytics Dashboard')
      // Retry connection
      setTimeout(() => this.connect(), 5000)
    }
  }
  
  sendEvent(event: AnalyticsEvent, options: { priority?: 'high' | 'normal', realtime?: boolean } = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, options }))
    } else {
      // Queue for when connection is restored
      this.eventQueue.push(event)
      
      // Also send to fallback storage
      this.sendToFallbackStorage(event)
    }
  }
  
  private flushEventQueue() {
    this.eventQueue.forEach(event => {
      this.ws?.send(JSON.stringify({ event, options: { priority: 'normal' } }))
    })
    this.eventQueue = []
  }
  
  private sendToFallbackStorage(event: AnalyticsEvent) {
    // Store in localStorage as backup
    const stored = JSON.parse(localStorage.getItem('beta_analytics_queue') || '[]')
    stored.push(event)
    localStorage.setItem('beta_analytics_queue', JSON.stringify(stored.slice(-100))) // Keep last 100
  }
}

export const betaAnalytics = new RealtimeBetaAnalytics()
```

### Supabase Analytics Tables
```sql
-- Create analytics tables
CREATE TABLE beta_onboarding_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  phase INTEGER,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE beta_conversation_metrics (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE beta_voice_analytics (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for dashboard queries
CREATE INDEX idx_onboarding_events_user_id ON beta_onboarding_events(user_id);
CREATE INDEX idx_onboarding_events_created_at ON beta_onboarding_events(created_at);
CREATE INDEX idx_conversation_metrics_created_at ON beta_conversation_metrics(created_at);
CREATE INDEX idx_voice_analytics_created_at ON beta_voice_analytics(created_at);
```

## 🎛️ Dashboard Query Functions

### Real-Time Metrics Queries
```typescript
// lib/dashboardQueries.ts
export const getDashboardMetrics = async (timeframe = '1h') => {
  const timeframeMs = timeframe === '1h' ? 3600000 : 86400000 // 1h or 24h
  const since = new Date(Date.now() - timeframeMs)
  
  // Onboarding funnel metrics
  const onboardingFunnel = await supabase
    .from('beta_onboarding_events')
    .select('event_type, phase, user_id')
    .gte('created_at', since.toISOString())
  
  // Memory orchestration success rate
  const memoryMetrics = await supabase
    .from('beta_conversation_metrics')
    .select('value')
    .eq('metric_type', 'memory_orchestration_complete')
    .gte('created_at', since.toISOString())
  
  // Voice interaction success rates
  const voiceMetrics = await supabase
    .from('beta_voice_analytics')
    .select('interaction_type, metrics')
    .gte('created_at', since.toISOString())
  
  return {
    onboarding: calculateOnboardingMetrics(onboardingFunnel.data || []),
    memory: calculateMemoryMetrics(memoryMetrics.data || []),
    voice: calculateVoiceMetrics(voiceMetrics.data || []),
    timestamp: new Date()
  }
}

const calculateOnboardingMetrics = (events: any[]) => {
  const phaseCompletions = events.filter(e => e.event_type === 'onboarding_phase_completed')
  const phaseStarts = events.filter(e => e.event_type === 'onboarding_phase_started')
  
  return {
    totalStarts: new Set(phaseStarts.map(e => e.user_id)).size,
    totalCompletions: phaseCompletions.filter(e => e.phase === 6).length,
    completionRate: phaseCompletions.filter(e => e.phase === 6).length / new Set(phaseStarts.map(e => e.user_id)).size,
    phaseDropoff: calculatePhaseDropoff(phaseStarts, phaseCompletions),
    averageCompletionTime: calculateAverageCompletionTime(phaseCompletions)
  }
}
```

## 🚨 Alert Configuration

### Critical Metric Thresholds
```typescript
// lib/betaAlerts.ts
const alertThresholds = {
  onboardingCompletionRate: { critical: 0.5, warning: 0.7, target: 0.85 },
  memoryOrchestrationSuccess: { critical: 0.8, warning: 0.9, target: 0.95 },
  voiceActivationRate: { critical: 0.7, warning: 0.85, target: 0.9 },
  averageSessionDuration: { critical: 300, warning: 600, target: 1200 }, // seconds
  errorRate: { critical: 0.1, warning: 0.05, target: 0.02 }
}

const checkAlerts = (metrics: DashboardMetrics) => {
  const alerts: Alert[] = []
  
  Object.entries(alertThresholds).forEach(([metric, thresholds]) => {
    const value = getMetricValue(metrics, metric)
    
    if (value <= thresholds.critical) {
      alerts.push({
        level: 'critical',
        metric,
        value,
        threshold: thresholds.critical,
        message: `${metric} is critically low: ${value}`
      })
    } else if (value <= thresholds.warning) {
      alerts.push({
        level: 'warning', 
        metric,
        value,
        threshold: thresholds.warning,
        message: `${metric} below target: ${value}`
      })
    }
  })
  
  return alerts
}
```

## 🔄 Integration with Onboarding Flow

### Updated Onboarding Components with Analytics
```typescript
// Updated Phase components with analytics hooks
const WelcomePhase = () => {
  const { trackPhaseStart, trackPhaseComplete } = useOnboardingAnalytics()
  const startTime = useRef(new Date())
  
  useEffect(() => {
    trackPhaseStart(1)
    startTime.current = new Date()
  }, [])
  
  const handleContinue = () => {
    trackPhaseComplete(1, startTime.current)
    advanceToPhase(2)
  }
  
  return (
    // ... existing component JSX
    <Button onClick={handleContinue}>
      Begin Your Journey with Maya
    </Button>
  )
}

const FirstMemoryPhase = () => {
  const { trackPhaseStart, trackPhaseComplete, trackCriticalMoment } = useOnboardingAnalytics()
  const startTime = useRef(new Date())
  
  useEffect(() => {
    trackPhaseStart(2)
    startTime.current = new Date()
  }, [])
  
  const createFirstMemory = async (name: string, interests: string) => {
    trackCriticalMoment('name_provided', { name, interests })
    
    // ... existing memory creation logic
    
    trackPhaseComplete(2, startTime.current)
    advanceToPhase(3)
  }
  
  return (
    // ... existing component JSX
  )
}
```

## 🎯 Success Metrics Dashboard

### Key Performance Indicators
```typescript
interface BetaKPIs {
  // Onboarding Success
  onboardingStarted: number
  onboardingCompleted: number
  completionRate: number
  averageTimeToComplete: number
  
  // Memory System Health
  memoryOrchestrationSuccessRate: number
  sessionPersistenceRate: number
  memoryRecallAccuracy: number
  
  // Voice Quality
  voiceActivationSuccessRate: number
  transcriptionAccuracy: number
  ttsSuccessRate: number
  averageVoiceLatency: number
  
  // User Engagement
  averageSessionDuration: number
  returnUserRate: number
  multimodalUsageRate: number
  satisfactionProxy: number
}
```

## 🚀 Implementation Steps

### 1. Add Analytics Hooks to Components
```bash
# Install analytics dependencies
npm install mixpanel-browser @supabase/supabase-js ws

# Add analytics hooks to onboarding components
# Update conversation components with memory tracking
# Add voice component analytics
```

### 2. Set Up Real-Time Data Pipeline
```typescript
// Add WebSocket server for real-time dashboard updates
// Configure Supabase real-time subscriptions
// Set up alert monitoring system
```

### 3. Connect to Beta Dashboard
```typescript
// Feed live data to BETA_LAUNCH_DASHBOARD.md components
// Add real-time metric visualizations
// Configure alert notifications
```

## 🎊 Expected Results

**Week 1 Beta Metrics:**
- **Onboarding completion rate**: >80% (target: 85%)
- **Memory orchestration success**: >95% (target: 95%) 
- **Voice activation rate**: >85% (target: 90%)
- **Session duration**: >10 minutes average (target: 20 minutes)
- **Return user rate**: >60% (target: 70%)

**Dashboard Benefits:**
- **Real-time issue detection**: Spot problems before they affect user experience
- **Optimization insights**: Data-driven improvements to onboarding flow
- **Launch confidence**: Quantifiable proof of beta readiness
- **Tester success**: Proactive monitoring ensures smooth beta experience

This analytics framework transforms your Beta Dashboard from static monitoring to a **live mission control center** that gives you complete visibility into Maya's beta performance! 📊✨