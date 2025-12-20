# Beads Integration Guide for MAIA Service

This guide shows how to integrate the Beads task management system into MAIA's consciousness processing flow.

## Integration Points

### 1. Post-Response Processing (Automatic Task Creation)

Add this code **after** the main MAIA response is generated in `lib/sovereign/maiaService.ts`:

**Location:** Inside `getMaiaResponse()`, after line 1751 (after `addConversationExchange` completes)

```typescript
// Import at top of file
import {
  processConsciousnessEventsForBeads,
  handleTaskReadinessQuery
} from '../memory/beads-sync/maiaServiceIntegration';

// Inside getMaiaResponse(), after addConversationExchange:
// 🌱 BEADS INTEGRATION: Process consciousness events → create tasks
if (userId && process.env.BEADS_INTEGRATION_ENABLED !== 'false') {
  (async () => {
    try {
      const beadsResult = await processConsciousnessEventsForBeads({
        userId,
        sessionId,
        userInput: input,
        maiaResponse: text,
        meta: {
          processingProfile,
          consciousnessData,
          cognitiveProfile: (meta as any).cognitiveProfile,
          bloomDetection: (meta as any).bloomDetection as any,
          mythicAtlas: atlasResult ?? undefined,
          fieldRouting: (meta as any).fieldRouting,
          spiralMeta: (meta as any).spiralMeta,
        },
        conversationHistory,
      });

      if (beadsResult.tasksCreated > 0) {
        console.log(`🌱 [Beads] Created ${beadsResult.tasksCreated} tasks: ${beadsResult.taskIds.join(', ')}`);
      }
    } catch (err) {
      console.error('❌ [Beads] Integration error (non-blocking):', err);
    }
  })(); // Fire-and-forget: don't block MAIA response
}
```

### 2. Task Readiness Queries ("What should I work on?")

Add this code **before** routing to processing paths in `getMaiaResponse()`.

**Location:** After line 1610 (after router result, before deterministic Spiralogic check)

```typescript
// 🎯 BEADS TASK QUERY: Check if user is asking for practice recommendations
if (userId && process.env.BEADS_INTEGRATION_ENABLED !== 'false') {
  try {
    const taskQueryResult = await handleTaskReadinessQuery({
      userId,
      userInput: input,
      meta: {
        cognitiveProfile: (meta as any).cognitiveProfile,
        mythicAtlas: atlasResult ?? undefined,
        spiralMeta: (meta as any).spiralMeta,
      },
    });

    if (taskQueryResult.isTaskQuery && taskQueryResult.response) {
      console.log('🎯 [Beads] Task readiness query detected - returning ready tasks');

      // Route framework lens for task query
      const frameworkRoute = routeFrameworkLens(input);
      (meta as any).lensesUsed = frameworkRoute.lensesUsed;
      (meta as any).primaryLens = frameworkRoute.primary;
      if (frameworkRoute.secondary) (meta as any).secondaryLens = frameworkRoute.secondary;

      await addConversationExchange(sessionId, input, taskQueryResult.response, {
        ...meta,
        processingProfile: 'FAST',
        processingTimeMs: Date.now() - startTime,
        beadsTaskQuery: true,
      });

      return {
        text: taskQueryResult.response,
        processingProfile: 'FAST',
        processingTimeMs: Date.now() - startTime,
        metadata: {
          ...(meta as any),
          primaryLens: frameworkRoute.primary,
          secondaryLens: frameworkRoute.secondary,
          lensesUsed: frameworkRoute.lensesUsed,
          beadsTaskQuery: true,
        },
      };
    }
  } catch (err) {
    console.warn('⚠️ [Beads] Task query handler error (continuing):', err);
  }
}
```

### 3. Practice Completion Detection

Add this code **before** routing to processing paths, similar to task queries.

**Location:** Same as #2, after task query check

```typescript
// ✅ BEADS COMPLETION DETECTION: Check if user completed a practice
import { detectAndLogPracticeCompletion } from '../memory/beads-sync/maiaServiceIntegration';

if (userId && process.env.BEADS_INTEGRATION_ENABLED !== 'false') {
  try {
    const completionResult = await detectAndLogPracticeCompletion({
      userId,
      userInput: input,
      conversationHistory,
    });

    if (completionResult.completionDetected && completionResult.followUpQuestion) {
      console.log('✅ [Beads] Practice completion detected - asking for effectiveness');

      // Attach follow-up question to meta for voice system to use
      (meta as any).beadsCompletionFollowUp = completionResult.followUpQuestion;

      // The follow-up will be woven into MAIA's response naturally
      // Don't short-circuit - let MAIA process normally with this context
    }
  } catch (err) {
    console.warn('⚠️ [Beads] Completion detection error (continuing):', err);
  }
}
```

## Environment Configuration

Add to `.env.local`:

```bash
# Beads Task Management Integration
BEADS_INTEGRATION_ENABLED=true
BEADS_SYNC_URL=http://localhost:3100

# Database (should already exist)
DATABASE_URL=postgresql://user:password@localhost:5432/maia_db
```

## Deployment Steps

### Step 1: Start Beads Services

```bash
# From MAIA-SOVEREIGN root
docker-compose -f docker-compose.beads.yml up -d
```

### Step 2: Run Database Migration

```bash
psql $DATABASE_URL < supabase/migrations/20251220_beads_integration.sql
```

### Step 3: Initialize Beads Container

```bash
docker exec maia-beads-memory bd init
docker exec maia-beads-memory bd config set prefix maia
```

### Step 4: Test Integration

```bash
# Terminal 1: Watch Beads sync logs
docker logs -f maia-beads-sync

# Terminal 2: Start MAIA
npm run dev

# Terminal 3: Test conversation
curl -X POST http://localhost:3000/api/maia \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "input": "My shoulders are really tense today"
  }'
```

### Step 5: Verify Task Creation

```bash
# Check tasks in database
psql $DATABASE_URL -c "SELECT beads_id, title, element, body_region FROM beads_tasks;"

# Check tasks in Beads
docker exec maia-beads-memory bd list
```

## Integration Verification Checklist

- [ ] Beads services running (`docker ps | grep beads`)
- [ ] Database migration applied (check `beads_tasks` table exists)
- [ ] Environment variables set (`BEADS_INTEGRATION_ENABLED=true`)
- [ ] MAIA service imports integration functions
- [ ] Post-response hook added after `addConversationExchange`
- [ ] Task query hook added before processing path routing
- [ ] Test conversation creates tasks for somatic tension
- [ ] Test "What should I work on?" returns ready tasks
- [ ] Logs show `🌱 [Beads]` events

## Common Issues

### Tasks Not Creating

**Symptom:** No tasks appear in database after conversation

**Fix:**
1. Check Beads sync service is running: `docker logs maia-beads-sync`
2. Check environment variable: `echo $BEADS_INTEGRATION_ENABLED`
3. Check MAIA logs for `🌱 [Beads]` events
4. Verify userId is being passed to integration functions

### "What should I work on?" Not Working

**Symptom:** Query doesn't return task suggestions

**Fix:**
1. Check task query hook is placed BEFORE processing path routing
2. Verify tasks exist in database: `SELECT * FROM beads_tasks WHERE user_id = 'your-user-id';`
3. Check cognitive gating: tasks may be blocked due to low Bloom level

### Integration Slowing Down MAIA

**Symptom:** MAIA responses take longer after integration

**Fix:**
1. Ensure Beads integration is fire-and-forget (wrapped in `(async () => {})()`)
2. Check Beads sync service isn't timing out
3. Consider disabling for FAST path (already implemented)

## Performance Considerations

### Fire-and-Forget Pattern

The post-response hook uses fire-and-forget to ensure MAIA responses aren't delayed:

```typescript
(async () => {
  // Integration logic here
})(); // Don't await - let it run in background
```

### FAST Path Skipping

FAST path skips Beads integration (too lightweight for task creation):

```typescript
if (meta.processingProfile === 'FAST') {
  return { tasksCreated: 0, taskIds: [], suggestions: [] };
}
```

### Database Indexing

Ensure indexes exist for fast queries:

```sql
-- Check indexes (should be created by migration)
SELECT indexname FROM pg_indexes WHERE tablename = 'beads_tasks';
```

## Next Steps

1. **Add Route Integration** (this guide)
2. **Create Automated Tests** → `npm test`
3. **Build Deployment Scripts** → Production-ready configs
4. **Create Visualization Dashboard** → Real-time task tracking UI

## Support

For issues:
- Check logs: `docker logs maia-beads-sync`
- Verify schema: `psql $DATABASE_URL -c "\d beads_tasks"`
- Test API: `curl http://localhost:3100/health`
