/**
 * Legacy User Data Sovereignty Service.
 *
 * W1 / SPM-F5 retires the destructive deletion and data-summary corridors.
 * The unrelated pause-learning handler remains for this bounded wave.
 */

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// PostgreSQL connection for user data management
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'maia_consciousness',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500,
});

/**
 * Legacy sovereignty handlers.
 * Destructive deletion and legacy summary methods are retirement tombstones.
 */
class UserDataSovereignty {

  /** Retired destructive endpoint: always returns 410 before database access. */
  static async deleteUserMemory(req, res) {
    // W1 / SPM-F5: retired before any caller-selected subject, confirmation
    // phrase, database connection, queue claim, or destructive statement exists.
    return res.status(410).json({
      success: false,
      error: 'legacy_sovereignty_retired',
      message: 'This legacy deletion service is retired and performs no deletion.',
      accountChanged: false,
      nextStep: 'account_settings',
      timestamp: new Date().toISOString()
    });
  }

  /** Retired legacy summary endpoint: always returns 410 before database access. */
  static async getDataSummary(req, res) {
    // W1 / SPM-F5: the legacy summary previously implied real account-data
    // inspection and advertised deletion guarantees. It now refuses before
    // touching PostgreSQL and does not echo a caller-selected user id.
    return res.status(410).json({
      error: 'legacy_sovereignty_retired',
      message: 'This legacy data-summary service is retired.',
      accountChanged: false,
      nextStep: 'account_settings',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * POST /api/sovereignty/pause-learning
   * Pause data collection while keeping existing data
   */
  static async pauseDataCollection(req, res) {
    const { userId, pauseReason } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log(`⏸️ PAUSING data collection for user: ${userId}`);

      // Add to data collection pause table
      const result = await pool.query(
        `INSERT INTO user_data_pause
         (user_id, paused_at, pause_reason, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id)
         DO UPDATE SET paused_at = $2, pause_reason = $3, status = 'active'
         RETURNING *`,
        [userId, new Date().toISOString(), pauseReason || 'User-requested pause']
      );

      res.json({
        success: true,
        user_id: userId,
        data_collection_paused: true,
        pause_reason: pauseReason || 'User-requested pause',
        existing_data_preserved: true,
        resume_instructions: 'Contact support or use the resume endpoint to restart data collection',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Pause data collection failed for user ${userId}:`, error);

      res.status(500).json({
        error: 'Failed to pause data collection',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// API Routes
app.post('/api/sovereignty/delete-my-memory', UserDataSovereignty.deleteUserMemory);
app.get('/api/sovereignty/my-data-summary/:userId', UserDataSovereignty.getDataSummary);
app.post('/api/sovereignty/pause-learning', UserDataSovereignty.pauseDataCollection);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      healthy: true,
      service: 'user_data_sovereignty',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      healthy: false,
      error: error.message,
      service: 'user_data_sovereignty',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ User sovereignty API error:', error);
  res.status(500).json({
    error: 'Internal user sovereignty service error',
    details: error.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.USER_SOVEREIGNTY_PORT || 3011;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🗑️ User Data Sovereignty API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('Retired deletion route: 410');
    console.log('Retired summary route: 410');
  });
}

module.exports = { app, UserDataSovereignty };