# Beads Sync Service for MAIA

**Spiral Memory Mesh**: Bridging MAIA's consciousness architecture with Beads' persistent task memory.

## Overview

This service creates a bidirectional synchronization layer between:
- **MAIA's consciousness tracking** (somatic patterns, field imbalances, cognitive development)
- **Beads task persistence** (git-backed, dependency-aware task management)
- **PostgreSQL** (long-term analytics and cross-session memory)

## Architecture

```
MAIA Consciousness Events → MaiaBeadsPlugin → Beads Sync Service → Beads + PostgreSQL
                                                      ↓
                                            Background sync daemon
                                                      ↓
                                        PostgreSQL ← Beads (bidirectional)
```

## Quick Start

### 1. Install Dependencies

```bash
cd lib/memory/beads-sync
npm install
```

### 2. Set Environment Variables

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/maia_db"
export BEADS_PROJECT_ROOT="/Users/soullab/MAIA-SOVEREIGN"
export BEADS_CONTAINER="maia-beads-memory"
export PORT=3100
```

### 3. Start Service

**Development:**
```bash
npm run dev
```

**Production (Docker):**
```bash
docker-compose -f docker-compose.beads.yml up -d
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Create Task from Consciousness Event
```bash
POST /beads/task
Content-Type: application/json

{
  "title": "Ground shoulder tension",
  "description": "Practice deep breathing with shoulder rolls",
  "priority": "high",
  "tags": ["somatic", "grounding", "shoulders"],
  "maiaMeta": {
    "userId": "user123",
    "sessionId": "session456",
    "element": "earth",
    "phase": 1,
    "archetype": "Healer",
    "realm": "MIDDLEWORLD",
    "cognitive": {
      "requiredLevel": 3,
      "recommendedLevel": 4,
      "bypassRisk": "none"
    },
    "somatic": {
      "bodyRegion": "shoulders",
      "tensionLevel": 8,
      "practiceName": "breathing_shoulder_rolls"
    }
  }
}
```

### Complete Task
```bash
POST /beads/task/:beadsId/complete
Content-Type: application/json

{
  "effectiveness": 8,
  "somaticShift": {
    "before": 8,
    "after": 3
  },
  "insight": "Deep breathing with shoulder rolls worked really well",
  "breakthrough": false
}
```

### Get Ready Tasks for User
```bash
GET /beads/ready/:userId?cognitiveLevel=4&spiritualBypassing=0.2&coherence=0.7
```

### Manual Sync
```bash
POST /beads/sync
```

### Sync Status
```bash
GET /beads/sync/status
```

## Database Schema

The service uses the following PostgreSQL tables:

- `beads_tasks` - Main task storage with MAIA consciousness extensions
- `beads_dependencies` - Task dependency graph
- `beads_logs` - Completion logs with effectiveness tracking
- `beads_sync_status` - Sync job history
- `consciousness_event_tasks` - Event-to-task mapping

Run migration:
```bash
psql $DATABASE_URL < supabase/migrations/20251220_beads_integration.sql
```

## Integration Examples

### Somatic Tension → Task Creation

```typescript
import { maiaBeadsPlugin } from './MaiaBeadsPlugin';

// In MAIA's somatic tracking
const beadsId = await maiaBeadsPlugin.onSomaticTensionSpike(
  userId,
  sessionId,
  {
    bodyRegion: 'shoulders',
    tensionLevel: 8,
    matrix: currentConsciousnessMatrix,
  }
);
```

### Phase Transition → Integration Tasks

```typescript
// When user transitions from Water 2 → Fire 1
const taskIds = await maiaBeadsPlugin.onPhaseTransition(
  userId,
  sessionId,
  {
    fromElement: 'water',
    fromPhase: 2,
    toElement: 'fire',
    toPhase: 1,
    matrix: currentConsciousnessMatrix,
  }
);
```

### Field Imbalance → Restoration Practice

```typescript
// When earth element is deficient
const beadsId = await maiaBeadsPlugin.onFieldImbalance(
  userId,
  sessionId,
  {
    element: 'earth',
    severity: 7,
    type: 'deficient',
    recommendedProtocols: ['earth-grounding', 'embodiment-practice'],
    matrix: currentConsciousnessMatrix,
  }
);
```

### Achievement → Celebration

```typescript
// When user unlocks "First Shoulders Drop"
const beadsId = await maiaBeadsPlugin.onAchievementUnlock(
  userId,
  {
    achievementId: 'first_shoulders_drop',
    title: 'First Shoulders Drop',
    description: 'Released shoulder tension below 3/10 for first time',
    rarity: 'common',
  }
);
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `BEADS_PROJECT_ROOT` | Path to MAIA project | `/app` |
| `BEADS_CONTAINER` | Docker container name for Beads | `maia-beads-memory` |
| `PORT` | HTTP server port | `3100` |
| `SYNC_INTERVAL_MS` | Background sync interval | `30000` (30s) |
| `ENABLE_WEBHOOKS` | Enable real-time webhooks | `true` |
| `POSTGRES_SYNC_ENABLED` | Enable background sync | `true` |

## Development Workflow

### 1. Start Docker Stack
```bash
docker-compose -f docker-compose.beads.yml up -d
```

### 2. Initialize Beads
```bash
docker exec maia-beads-memory bd init
docker exec maia-beads-memory bd config set prefix maia
```

### 3. Run Migrations
```bash
psql $DATABASE_URL < supabase/migrations/20251220_beads_integration.sql
```

### 4. Start Sync Service
```bash
cd lib/memory/beads-sync
npm run dev
```

### 5. Test Integration
```bash
# Create a task
curl -X POST http://localhost:3100/beads/task \
  -H "Content-Type: application/json" \
  -d @test-fixtures/somatic-task.json

# Trigger sync
curl -X POST http://localhost:3100/beads/sync

# Check status
curl http://localhost:3100/beads/sync/status
```

## Testing

```bash
npm test
```

Example test:
```typescript
describe('MaiaBeadsPlugin', () => {
  it('creates grounding task on high shoulder tension', async () => {
    const beadsId = await maiaBeadsPlugin.onSomaticTensionSpike(
      'user123',
      'session456',
      {
        bodyRegion: 'shoulders',
        tensionLevel: 8,
        matrix: mockConsciousnessMatrix,
      }
    );

    expect(beadsId).toBeTruthy();

    // Verify task in database
    const task = await db.query('SELECT * FROM beads_tasks WHERE beads_id = $1', [beadsId]);
    expect(task.rows[0].element).toBe('earth');
    expect(task.rows[0].body_region).toBe('shoulders');
  });
});
```

## Monitoring

### Health Checks

The service exposes health endpoints for monitoring:

```bash
# Service health
curl http://localhost:3100/health

# Sync status
curl http://localhost:3100/beads/sync/status
```

### Logs

Monitor sync activity:
```bash
docker logs -f maia-beads-sync
```

### Database Queries

Check ready tasks:
```sql
SELECT * FROM v_beads_ready_tasks WHERE user_id = 'user123';
```

View effectiveness:
```sql
SELECT * FROM v_beads_task_effectiveness WHERE element = 'earth';
```

Element balance:
```sql
SELECT * FROM v_beads_element_balance WHERE user_id = 'user123';
```

## Troubleshooting

### Sync Not Working

1. Check Beads container is running:
   ```bash
   docker ps | grep beads
   ```

2. Verify Beads CLI access:
   ```bash
   docker exec maia-beads-memory bd version
   ```

3. Check PostgreSQL connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

### Task Not Appearing

1. Check sync status:
   ```bash
   curl http://localhost:3100/beads/sync/status
   ```

2. Manual sync:
   ```bash
   curl -X POST http://localhost:3100/beads/sync
   ```

3. Check Beads directly:
   ```bash
   docker exec maia-beads-memory bd list
   ```

### Dependencies Not Resolving

1. Check dependency table:
   ```sql
   SELECT * FROM beads_dependencies WHERE task_id = 'task-id';
   ```

2. Verify blocking tasks are completed:
   ```sql
   SELECT * FROM beads_tasks WHERE beads_id IN (
     SELECT depends_on_id FROM beads_dependencies WHERE task_id = 'task-id'
   );
   ```

## Production Deployment

### Docker Deployment

```bash
# Build and start services
docker-compose -f docker-compose.beads.yml up -d --build

# Check logs
docker-compose -f docker-compose.beads.yml logs -f beads-sync-service

# Scale sync workers (if needed)
docker-compose -f docker-compose.beads.yml up -d --scale beads-sync-service=3
```

### Environment-Specific Configuration

Create `.env.production`:
```bash
DATABASE_URL=postgresql://prod-user:prod-pass@prod-db:5432/maia_prod
BEADS_SYNC_URL=https://beads-sync.soullab.media
SYNC_INTERVAL_MS=60000
ENABLE_WEBHOOKS=true
```

## Roadmap

### Phase 1 (Current)
- [x] Basic Beads ↔ PostgreSQL sync
- [x] Consciousness event → task creation
- [x] Cognitive/field filtering
- [x] Effectiveness tracking

### Phase 2 (Q1 2025)
- [ ] Multi-user collaboration (shared epics)
- [ ] Archetypal task templates
- [ ] Real-time field visualization
- [ ] Voice task management integration

### Phase 3 (Q2 2025)
- [ ] Predictive task creation
- [ ] Cross-session pattern learning
- [ ] Community wisdom marketplace
- [ ] Biometric integration

## License

Proprietary - Soullab Media

## Support

For issues or questions:
- GitHub: https://github.com/soullab-media/MAIA-SOVEREIGN
- Discord: Soullab Consciousness Engineering
