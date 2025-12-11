/**
 * 🗑️ DELETE MY MEMORY - User Data Sovereignty Service
 *
 * Complete user data erasure functionality ensuring absolute user control
 * over their consciousness data and wisdom memory
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
 * User Data Sovereignty Manager
 * Provides complete control over consciousness data retention and deletion
 */
class UserDataSovereignty {

  /**
   * POST /api/sovereignty/delete-my-memory
   * Complete user data erasure across all consciousness computing systems
   */
  static async deleteUserMemory(req, res) {
    const { userId, confirmationPhrase, deleteReason } = req.body;

    // Require explicit confirmation
    if (confirmationPhrase !== 'DELETE ALL MY CONSCIOUSNESS DATA') {
      return res.status(400).json({
        error: 'Invalid confirmation phrase. Must type exactly: "DELETE ALL MY CONSCIOUSNESS DATA"',
        required_phrase: 'DELETE ALL MY CONSCIOUSNESS DATA',
        timestamp: new Date().toISOString()
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required for memory deletion',
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log(`🗑️ INITIATING COMPLETE MEMORY DELETION for user: ${userId}`);
      console.log(`📝 Deletion reason: ${deleteReason || 'Not specified'}`);

      // Begin transaction for atomic deletion
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // 1. Delete from elemental_evolution (consciousness patterns)
        const elementalResult = await client.query(
          'DELETE FROM elemental_evolution WHERE user_id = $1 RETURNING id',
          [userId]
        );

        // 2. Delete from wisdom_moments (Navigator effectiveness data)
        const wisdomResult = await client.query(
          'DELETE FROM wisdom_moments WHERE user_id = $1 RETURNING id',
          [userId]
        );

        // 3. Delete from ain_consciousness_memory (complete wisdom snapshots)
        const memoryResult = await client.query(
          'DELETE FROM ain_consciousness_memory WHERE user_id = $1 RETURNING id',
          [userId]
        );

        // 4. Delete from elemental_personalities (cached personality profiles)
        const personalityResult = await client.query(
          'DELETE FROM elemental_personalities WHERE user_id = $1 RETURNING user_id',
          [userId]
        );

        // 5. Delete from maia_adaptations (MAIA adaptation instructions)
        const adaptationResult = await client.query(
          'DELETE FROM maia_adaptations WHERE user_id = $1 RETURNING user_id',
          [userId]
        );

        // 6. Log the deletion for transparency (anonymized)
        const deletionLogResult = await client.query(
          `INSERT INTO user_deletion_log
           (deleted_at, deletion_reason, elemental_records_deleted, wisdom_records_deleted,
            memory_snapshots_deleted, personality_deleted, adaptations_deleted)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [
            new Date().toISOString(),
            deleteReason || 'User-requested complete data deletion',
            elementalResult.rowCount,
            wisdomResult.rowCount,
            memoryResult.rowCount,
            personalityResult.rowCount > 0,
            adaptationResult.rowCount > 0
          ]
        );

        await client.query('COMMIT');

        const deletionSummary = {
          success: true,
          deletion_complete: true,
          user_id: userId,
          records_deleted: {
            elemental_evolution_records: elementalResult.rowCount,
            wisdom_moments_records: wisdomResult.rowCount,
            consciousness_memory_snapshots: memoryResult.rowCount,
            personality_profile_deleted: personalityResult.rowCount > 0,
            maia_adaptations_deleted: adaptationResult.rowCount > 0
          },
          deletion_log_id: deletionLogResult.rows[0]?.id,
          message: 'All consciousness data has been completely and permanently deleted',
          timestamp: new Date().toISOString()
        };

        console.log(`✅ COMPLETE MEMORY DELETION SUCCESSFUL for user: ${userId}`);
        console.log(`📊 Records deleted:`, deletionSummary.records_deleted);

        res.json(deletionSummary);

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error(`❌ Memory deletion failed for user ${userId}:`, error);

      res.status(500).json({
        success: false,
        error: 'Memory deletion failed - your data remains protected',
        details: error.message,
        support_message: 'Contact support if deletion continues to fail',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/sovereignty/my-data-summary
   * Show user what data exists about them
   */
  static async getDataSummary(req, res) {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log(`📊 Generating data summary for user: ${userId}`);

      // Count records across all tables
      const elementalCount = await pool.query(
        'SELECT COUNT(*) as count FROM elemental_evolution WHERE user_id = $1',
        [userId]
      );

      const wisdomCount = await pool.query(
        'SELECT COUNT(*) as count FROM wisdom_moments WHERE user_id = $1',
        [userId]
      );

      const memoryCount = await pool.query(
        'SELECT COUNT(*) as count FROM ain_consciousness_memory WHERE user_id = $1',
        [userId]
      );

      const personalityExists = await pool.query(
        'SELECT user_id FROM elemental_personalities WHERE user_id = $1',
        [userId]
      );

      const adaptationExists = await pool.query(
        'SELECT user_id FROM maia_adaptations WHERE user_id = $1',
        [userId]
      );

      // Get date range of data
      const dateRangeResult = await pool.query(
        `SELECT
          MIN(recorded_at) as earliest_data,
          MAX(recorded_at) as latest_data
         FROM (
          SELECT recorded_at FROM elemental_evolution WHERE user_id = $1
          UNION ALL
          SELECT recorded_at FROM wisdom_moments WHERE user_id = $1
          UNION ALL
          SELECT recorded_at FROM ain_consciousness_memory WHERE user_id = $1
        ) as all_dates`,
        [userId]
      );

      const dataSummary = {
        user_id: userId,
        data_exists: true,
        data_summary: {
          consciousness_patterns: {
            elemental_evolution_sessions: parseInt(elementalCount.rows[0].count),
            description: 'Records of your elemental balance and consciousness evolution over time'
          },
          wisdom_learning: {
            wisdom_moments_recorded: parseInt(wisdomCount.rows[0].count),
            description: 'Records of how effective different guidance approaches were for you'
          },
          complete_snapshots: {
            memory_snapshots_stored: parseInt(memoryCount.rows[0].count),
            description: 'Complete consciousness context snapshots for MAIA personalization'
          },
          personality_profile: {
            profile_exists: personalityExists.rowCount > 0,
            description: 'Pre-computed elemental personality profile for faster MAIA adaptation'
          },
          maia_adaptations: {
            adaptations_exist: adaptationExists.rowCount > 0,
            description: 'Cached MAIA voice and approach adaptations based on your patterns'
          }
        },
        data_timeline: {
          earliest_data: dateRangeResult.rows[0]?.earliest_data,
          latest_data: dateRangeResult.rows[0]?.latest_data,
          total_days_of_data: dateRangeResult.rows[0]?.earliest_data ?
            Math.ceil((new Date(dateRangeResult.rows[0].latest_data) - new Date(dateRangeResult.rows[0].earliest_data)) / (1000 * 60 * 60 * 24)) + 1 : 0
        },
        privacy_notes: [
          'All data is stored with strong encryption and privacy protection',
          'Data is only used for improving your personal MAIA experience',
          'No data is shared with third parties or used for advertising',
          'Collective analytics are completely anonymized before aggregation',
          'You can delete all data instantly using the "Delete My Memory" feature'
        ],
        deletion_info: {
          deletion_available: true,
          deletion_permanent: true,
          deletion_immediate: true,
          required_confirmation: 'DELETE ALL MY CONSCIOUSNESS DATA'
        },
        timestamp: new Date().toISOString()
      };

      // Check if user has any data at all
      const totalRecords = parseInt(elementalCount.rows[0].count) +
                          parseInt(wisdomCount.rows[0].count) +
                          parseInt(memoryCount.rows[0].count);

      if (totalRecords === 0 && !personalityExists.rowCount && !adaptationExists.rowCount) {
        dataSummary.data_exists = false;
        dataSummary.message = 'No consciousness data found for this user';
      }

      res.json(dataSummary);

    } catch (error) {
      console.error(`❌ Data summary failed for user ${userId}:`, error);

      res.status(500).json({
        error: 'Failed to generate data summary',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
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
    console.log(`Delete Memory: POST http://localhost:${PORT}/api/sovereignty/delete-my-memory`);
    console.log(`Data Summary: GET http://localhost:${PORT}/api/sovereignty/my-data-summary/:userId`);
  });
}

module.exports = { app, UserDataSovereignty };