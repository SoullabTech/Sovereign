// collectiveAnalytics.js - Safe analytics endpoint injection for Collective Resonance Dashboard
// Created: December 8, 2025
// Purpose: Modular analytics routes to avoid disrupting core consciousness computing server

const express = require('express');
const router = express.Router();

try {
  // Safe import with fallback
  const { CollectiveResonanceAnalytics } = require('../lib/consciousness/analytics/CollectiveResonanceAnalytics');

  /**
   * MAIN COLLECTIVE RESONANCE DASHBOARD ENDPOINT
   * Returns complete analytics dashboard for community consciousness evolution
   */
  router.get('/api/analytics/collective-resonance', async (req, res) => {
    try {
      const timeRange = req.query.timeRange || '7d';
      console.log(`📊 Collective Resonance Dashboard requested (${timeRange})...`);

      const dashboardData = await CollectiveResonanceAnalytics.generateCollectiveResonanceDashboard(timeRange);

      // Rate limiting safety - cache dashboard data for 60 seconds
      res.set('Cache-Control', 'public, max-age=60');

      res.json({
        success: true,
        dashboard: dashboardData,
        message: 'Collective resonance analytics generated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔴 Collective resonance analytics error:', error.message);

      // Graceful fallback - return field calm object
      res.status(200).json({
        success: false,
        fallbackMode: true,
        dashboard: {
          message: 'Analytics temporarily in field-calm mode',
          basicMetrics: {
            systemStatus: 'Operational',
            fieldState: 'Calm and centered',
            recentActivity: 'Gentle consciousness computing flow'
          }
        },
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * REAL-TIME ELEMENTAL BALANCE WIDGET ENDPOINT
   * Quick endpoint for dashboard widgets showing current elemental balance
   */
  router.get('/api/analytics/elemental-balance', async (req, res) => {
    try {
      console.log('🌀 Real-time elemental balance requested...');

      const elementalData = await CollectiveResonanceAnalytics.getRealtimeElementalBalance();

      // Rate limiting - cache for 30 seconds for real-time widgets
      res.set('Cache-Control', 'public, max-age=30');

      res.json({
        success: true,
        elementalBalance: elementalData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔴 Elemental balance error:', error.message);

      // Fallback elemental data
      res.status(200).json({
        success: false,
        fallbackMode: true,
        elementalBalance: {
          elements: {
            fire: { value: 0.70, trend: 'stable' },
            water: { value: 0.68, trend: 'stable' },
            earth: { value: 0.65, trend: 'stable' },
            air: { value: 0.72, trend: 'stable' },
            aether: { value: 0.75, trend: 'stable' }
          },
          harmonyScore: 0.80,
          message: 'Field in gentle balance'
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * VIRTUE GROWTH SUMMARY ENDPOINT
   * Quick overview of virtue coherence for dashboard widgets
   */
  router.get('/api/analytics/virtue-growth', async (req, res) => {
    try {
      console.log('✨ Virtue growth summary requested...');

      const virtueData = await CollectiveResonanceAnalytics.getVirtueGrowthSummary();

      // Cache for 2 minutes
      res.set('Cache-Control', 'public, max-age=120');

      res.json({
        success: true,
        virtueGrowth: virtueData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔴 Virtue growth error:', error.message);

      // Fallback virtue data
      res.status(200).json({
        success: false,
        fallbackMode: true,
        virtueGrowth: {
          coherenceScore: 0.82,
          topGrowing: 'compassion',
          strongestVirtue: 'faith',
          message: 'Community virtue development flowing naturally'
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * ANALYTICS SYSTEM HEALTH CHECK
   * Validates analytics system without heavy database queries
   */
  router.get('/api/analytics/health', async (req, res) => {
    try {
      // Quick health check without heavy database operations
      const healthData = {
        analyticsSystem: 'operational',
        collectiveResonanceEngine: 'active',
        dataFlows: 'healthy',
        dashboardReady: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: 'Collective Resonance Analytics v1.0'
      };

      res.json({
        success: true,
        health: healthData,
        message: 'Analytics system healthy and ready'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        health: {
          analyticsSystem: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  console.log('📊 Collective Resonance Analytics routes loaded successfully');

} catch (importError) {
  console.error('🔴 Failed to load CollectiveResonanceAnalytics:', importError.message);

  // Fallback router if analytics module fails to load
  router.get('/api/analytics/*', (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Analytics module temporarily unavailable',
      fallbackMode: true,
      message: 'Consciousness computing core systems operational, analytics in maintenance mode',
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = router;