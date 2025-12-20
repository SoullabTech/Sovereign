/**
 * Beads Sync Service
 * Bridge between MAIA consciousness events and Beads persistence
 */

import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(express.json());

// ==============================================================================
// CONFIGURATION
// ==============================================================================

const CONFIG = {
  port: parseInt(process.env.PORT || '3100'),
  databaseUrl: process.env.DATABASE_URL,
  beadsPath: process.env.BEADS_PROJECT_ROOT || '/app',
  beadsContainer: process.env.BEADS_CONTAINER || 'maia-beads-memory',
  syncInterval: parseInt(process.env.SYNC_INTERVAL_MS || '30000'),
  webhooksEnabled: process.env.ENABLE_WEBHOOKS === 'true',
  postgresSyncEnabled: process.env.POSTGRES_SYNC_ENABLED === 'true',
};

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: CONFIG.databaseUrl,
});

// ==============================================================================
// BEADS CLI UTILITIES
// ==============================================================================

/**
 * Execute Beads CLI command
 */
function runBeadsCommand(command: string): string {
  try {
    const fullCommand = `docker exec ${CONFIG.beadsContainer} bd ${command}`;
    console.log(`[Beads CLI] ${fullCommand}`);
    return execSync(fullCommand, {
      cwd: CONFIG.beadsPath,
      encoding: 'utf-8',
    });
  } catch (error: any) {
    console.error('[Beads CLI Error]', error.message);
    throw new Error(`Beads command failed: ${error.message}`);
  }
}

/**
 * Get Beads task list as JSON
 */
async function getBeadsTasks(filter?: string): Promise<any[]> {
  try {
    const command = filter ? `list ${filter} --json` : 'list --json';
    const output = runBeadsCommand(command);
    return JSON.parse(output || '[]');
  } catch (error: any) {
    console.error('[Get Beads Tasks]', error.message);
    return [];
  }
}

/**
 * Create Beads task from MAIA consciousness event
 */
async function createBeadsTask(taskData: any): Promise<string> {
  const {
    title,
    description,
    priority = 'medium',
    tags = [],
    metadata = {},
  } = taskData;

  // Build Beads CLI command
  const tagFlags = tags.map((t: string) => `--tag ${t}`).join(' ');
  const priorityFlag = `--priority ${priority}`;

  const command = `create "${title}" ${priorityFlag} ${tagFlags}`;
  const output = runBeadsCommand(command);

  // Extract task ID from output
  const match = output.match(/Created task ([^\s]+)/);
  const beadsId = match?.[1] || `maia-${Date.now()}`;

  // Add description and metadata via log
  if (description) {
    runBeadsCommand(`log ${beadsId} "${description}"`);
  }

  console.log(`[Created Beads Task] ${beadsId}: ${title}`);
  return beadsId;
}

/**
 * Update Beads task status
 */
async function updateBeadsTask(
  beadsId: string,
  updates: { status?: string; priority?: string }
): Promise<void> {
  if (updates.status) {
    runBeadsCommand(`update ${beadsId} --status ${updates.status}`);
  }
  if (updates.priority) {
    runBeadsCommand(`update ${beadsId} --priority ${updates.priority}`);
  }
}

/**
 * Complete Beads task
 */
async function completeBeadsTask(beadsId: string, logMessage?: string): Promise<void> {
  runBeadsCommand(`complete ${beadsId}`);
  if (logMessage) {
    runBeadsCommand(`log ${beadsId} "${logMessage}"`);
  }
}

// ==============================================================================
// POSTGRESQL SYNC
// ==============================================================================

/**
 * Sync Beads task to PostgreSQL
 */
async function syncTaskToPostgres(beadsTask: any, maiaMeta: any = {}): Promise<void> {
  const {
    id: beadsId,
    title,
    description,
    status,
    priority,
    created,
    updated,
    tags = [],
    logs = [],
  } = beadsTask;

  const {
    userId,
    sessionId,
    element,
    phase,
    archetype,
    realm,
    cognitive = {},
    somatic = {},
    field = {},
    evolution = {},
    experience = {},
  } = maiaMeta;

  // Calculate hash for conflict detection
  const beadsHash = Buffer.from(JSON.stringify(beadsTask)).toString('base64').slice(0, 64);

  const query = `
    INSERT INTO beads_tasks (
      beads_id, beads_hash, user_id, session_id,
      title, description, status, priority,
      element, phase, archetype, realm,
      required_level, recommended_level, bypass_risk,
      body_region, tension_level, practice_name,
      intensity, safety_check, coherence_required,
      first_appearance, integration_level,
      experience_type, readiness_level, layer_depth,
      raw_jsonl, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, $24, $25, $26,
      $27, $28, $29
    )
    ON CONFLICT (beads_id) DO UPDATE SET
      status = EXCLUDED.status,
      priority = EXCLUDED.priority,
      updated_at = EXCLUDED.updated_at,
      integration_level = EXCLUDED.integration_level,
      raw_jsonl = EXCLUDED.raw_jsonl,
      synced_from_beads = NOW()
  `;

  const values = [
    beadsId,
    beadsHash,
    userId || null,
    sessionId || null,
    title,
    description || null,
    status,
    priority,
    element || null,
    phase || null,
    archetype || null,
    realm || null,
    cognitive.requiredLevel || null,
    cognitive.recommendedLevel || null,
    cognitive.bypassRisk || 'none',
    somatic.bodyRegion || null,
    somatic.tensionLevel || null,
    somatic.practiceName || null,
    field.intensity || null,
    field.safetyCheck || false,
    field.coherenceRequired || null,
    evolution.firstAppearance || new Date(),
    evolution.integrationLevel || 1,
    experience.type || null,
    experience.readinessLevel || null,
    experience.layerDepth || null,
    JSON.stringify(beadsTask),
    created || new Date(),
    updated || new Date(),
  ];

  await pool.query(query, values);

  // Sync dependencies
  if (beadsTask.dependencies) {
    await syncDependenciesToPostgres(beadsId, beadsTask.dependencies);
  }

  // Sync logs
  for (const log of logs) {
    await syncLogToPostgres(beadsId, log);
  }
}

/**
 * Sync dependencies to PostgreSQL
 */
async function syncDependenciesToPostgres(
  taskId: string,
  dependencies: { blocks?: string[]; depends_on?: string[]; related?: string[]; discovered_from?: string[] }
): Promise<void> {
  // Clear existing dependencies
  await pool.query('DELETE FROM beads_dependencies WHERE task_id = $1', [taskId]);

  // Insert new dependencies
  for (const [type, ids] of Object.entries(dependencies)) {
    for (const dependsOnId of ids || []) {
      await pool.query(
        `INSERT INTO beads_dependencies (task_id, depends_on_id, dependency_type)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [taskId, dependsOnId, type]
      );
    }
  }
}

/**
 * Sync log entry to PostgreSQL
 */
async function syncLogToPostgres(beadsId: string, log: any): Promise<void> {
  const {
    message,
    timestamp,
    metadata = {},
    effectiveness,
    somaticShift,
    insight,
    breakthrough,
  } = log;

  await pool.query(
    `INSERT INTO beads_logs (
      beads_id, message, log_metadata, effectiveness,
      somatic_before, somatic_after, insight, breakthrough,
      logged_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT DO NOTHING`,
    [
      beadsId,
      message,
      JSON.stringify(metadata),
      effectiveness || null,
      somaticShift?.before || null,
      somaticShift?.after || null,
      insight || null,
      breakthrough || false,
      timestamp || new Date(),
    ]
  );
}

/**
 * Full bidirectional sync
 */
async function performBidirectionalSync(): Promise<{
  tasksFromBeads: number;
  tasksToBeads: number;
  conflicts: number;
}> {
  console.log('[Sync] Starting bidirectional sync...');

  const syncStart = new Date();
  let tasksFromBeads = 0;
  let tasksToBeads = 0;
  let conflicts = 0;

  try {
    // 1. Sync FROM Beads TO PostgreSQL
    const beadsTasks = await getBeadsTasks();
    for (const beadsTask of beadsTasks) {
      try {
        await syncTaskToPostgres(beadsTask);
        tasksFromBeads++;
      } catch (error: any) {
        console.error(`[Sync Error] Failed to sync ${beadsTask.id}:`, error.message);
        conflicts++;
      }
    }

    // 2. Sync FROM PostgreSQL TO Beads (pending tasks)
    const { rows: pendingTasks } = await pool.query(`
      SELECT * FROM beads_tasks
      WHERE sync_status = 'pending'
      LIMIT 100
    `);

    for (const task of pendingTasks) {
      try {
        await updateBeadsTask(task.beads_id, {
          status: task.status,
          priority: task.priority,
        });

        await pool.query(
          `UPDATE beads_tasks
           SET sync_status = 'synced', synced_to_beads = NOW()
           WHERE beads_id = $1`,
          [task.beads_id]
        );

        tasksToBeads++;
      } catch (error: any) {
        console.error(`[Sync Error] Failed to push ${task.beads_id} to Beads:`, error.message);
        conflicts++;
      }
    }

    // Record sync status
    const syncDuration = Date.now() - syncStart.getTime();
    await pool.query(
      `INSERT INTO beads_sync_status (
        sync_type, sync_completed, sync_duration_ms,
        tasks_synced, conflicts_detected, status
      ) VALUES ('bidirectional', NOW(), $1, $2, $3, $4)`,
      [syncDuration, tasksFromBeads + tasksToBeads, conflicts, conflicts > 0 ? 'partial' : 'completed']
    );

    console.log(`[Sync Complete] Beads→PG: ${tasksFromBeads}, PG→Beads: ${tasksToBeads}, Conflicts: ${conflicts}`);

    return { tasksFromBeads, tasksToBeads, conflicts };
  } catch (error: any) {
    console.error('[Sync Failed]', error);
    throw error;
  }
}

// ==============================================================================
// REST API ENDPOINTS
// ==============================================================================

/**
 * Health check
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      service: 'beads-sync-service',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * Create task from MAIA consciousness event
 */
app.post('/beads/task', async (req: Request, res: Response) => {
  try {
    const { title, description, priority, tags, maiaMeta } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Create in Beads
    const beadsId = await createBeadsTask({
      title,
      description,
      priority,
      tags: [...(tags || []), maiaMeta?.element, maiaMeta?.archetype].filter(Boolean),
    });

    // Sync to PostgreSQL
    const beadsTask = { id: beadsId, title, description, status: 'todo', priority, tags };
    await syncTaskToPostgres(beadsTask, maiaMeta);

    res.json({
      success: true,
      beadsId,
      message: 'Task created and synced successfully',
    });
  } catch (error: any) {
    console.error('[Create Task Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Complete task with effectiveness tracking
 */
app.post('/beads/task/:beadsId/complete', async (req: Request, res: Response) => {
  try {
    const { beadsId } = req.params;
    const { effectiveness, somaticShift, insight, breakthrough } = req.body;

    // Complete in Beads
    const logMessage = `Effectiveness: ${effectiveness}/10${somaticShift ? `, Tension: ${somaticShift.before}→${somaticShift.after}` : ''}`;
    await completeBeadsTask(beadsId, logMessage);

    // Update PostgreSQL using helper function
    await pool.query(
      'SELECT record_task_completion($1, $2, $3, $4, $5, $6)',
      [beadsId, effectiveness, somaticShift?.before, somaticShift?.after, insight, breakthrough]
    );

    res.json({
      success: true,
      message: 'Task completed and logged',
    });
  } catch (error: any) {
    console.error('[Complete Task Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get ready tasks for user
 */
app.get('/beads/ready/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      cognitiveLevel = 6,
      spiritualBypassing = 0,
      intellectualBypassing = 0,
      coherence = 1,
    } = req.query;

    const { rows: tasks } = await pool.query(
      `SELECT * FROM get_ready_tasks_for_user($1, $2, $3, $4, $5)`,
      [userId, cognitiveLevel, spiritualBypassing, intellectualBypassing, coherence]
    );

    res.json({
      userId,
      readyTasks: tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    console.error('[Get Ready Tasks Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Trigger manual sync
 */
app.post('/beads/sync', async (req: Request, res: Response) => {
  try {
    const result = await performBidirectionalSync();
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Manual Sync Error]', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get sync status history
 */
app.get('/beads/sync/status', async (req: Request, res: Response) => {
  try {
    const { rows: syncHistory } = await pool.query(`
      SELECT * FROM beads_sync_status
      ORDER BY sync_started DESC
      LIMIT 20
    `);

    res.json({ syncHistory });
  } catch (error: any) {
    console.error('[Sync Status Error]', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================================================================
// BACKGROUND SYNC DAEMON
// ==============================================================================

let syncIntervalHandle: NodeJS.Timeout | null = null;

async function startSyncDaemon() {
  if (!CONFIG.postgresSyncEnabled) {
    console.log('[Sync Daemon] PostgreSQL sync disabled');
    return;
  }

  console.log(`[Sync Daemon] Starting with ${CONFIG.syncInterval}ms interval`);

  syncIntervalHandle = setInterval(async () => {
    try {
      await performBidirectionalSync();
    } catch (error: any) {
      console.error('[Sync Daemon Error]', error.message);
    }
  }, CONFIG.syncInterval);
}

function stopSyncDaemon() {
  if (syncIntervalHandle) {
    clearInterval(syncIntervalHandle);
    console.log('[Sync Daemon] Stopped');
  }
}

// ==============================================================================
// SERVER STARTUP
// ==============================================================================

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('[PostgreSQL] Connected successfully');

    // Test Beads connection
    runBeadsCommand('version');
    console.log('[Beads] Connected successfully');

    // Start background sync daemon
    await startSyncDaemon();

    // Start HTTP server
    app.listen(CONFIG.port, () => {
      console.log(`[Beads Sync Service] Running on port ${CONFIG.port}`);
      console.log(`[Config] Beads path: ${CONFIG.beadsPath}`);
      console.log(`[Config] Webhooks: ${CONFIG.webhooksEnabled ? 'enabled' : 'disabled'}`);
    });
  } catch (error: any) {
    console.error('[Startup Error]', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Shutdown] Received SIGTERM');
  stopSyncDaemon();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Shutdown] Received SIGINT');
  stopSyncDaemon();
  await pool.end();
  process.exit(0);
});

// Start the service
startServer();
