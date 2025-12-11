/**
 * 🧪 Pioneer Circle Manager
 *
 * Sacred beta testing service for consciousness computing pioneer circle management
 * Handles applications, selections, cycle management, and pioneer support
 */

const express = require('express');
const cors = require('cors');

class PioneerCircleManager {
  constructor() {
    this.app = express();
    this.pioneers = new Map(); // In production: PostgreSQL database
    this.applications = new Map();
    this.cycles = new Map();

    this.setupMiddleware();
    this.setupRoutes();
    this.initializeBetaCycles();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Sacred technology header
    this.app.use((req, res, next) => {
      res.setHeader('X-Sacred-Technology', 'Consciousness-Computing-Beta');
      next();
    });
  }

  initializeBetaCycles() {
    const cycles = [
      {
        id: 'foundation-q1-2025',
        name: 'Foundation Testing',
        quarter: 'Q1 2025',
        focus: 'Technical stability and basic consciousness computing function',
        startDate: '2025-01-22',
        endDate: '2025-02-21',
        status: 'accepting_applications',
        maxPioneers: 10,
        currentApplications: 8,
        selectedPioneers: 8,
        archetypeDistribution: {
          mystic: { required: 2, selected: 2 },
          healer: { required: 2, selected: 2 },
          creator: { required: 2, selected: 2 },
          sage: { required: 2, selected: 1 },
          seeker: { required: 2, selected: 1 }
        }
      },
      {
        id: 'wisdom-q2-2025',
        name: 'Wisdom Refinement',
        quarter: 'Q2 2025',
        focus: 'MAIA adaptation and guidance quality optimization',
        startDate: '2025-04-15',
        endDate: '2025-05-15',
        status: 'planning',
        maxPioneers: 10,
        currentApplications: 0,
        selectedPioneers: 0,
        archetypeDistribution: {
          mystic: { required: 2, selected: 0 },
          healer: { required: 2, selected: 0 },
          creator: { required: 2, selected: 0 },
          sage: { required: 2, selected: 0 },
          seeker: { required: 2, selected: 0 }
        }
      },
      {
        id: 'field-q3-2025',
        name: 'Field Analytics',
        quarter: 'Q3 2025',
        focus: 'Collective consciousness field observation and community insights',
        startDate: '2025-07-15',
        endDate: '2025-08-15',
        status: 'planning',
        maxPioneers: 10,
        currentApplications: 0,
        selectedPioneers: 0,
        archetypeDistribution: {
          mystic: { required: 2, selected: 0 },
          healer: { required: 2, selected: 0 },
          creator: { required: 2, selected: 0 },
          sage: { required: 2, selected: 0 },
          seeker: { required: 2, selected: 0 }
        }
      },
      {
        id: 'community-q4-2025',
        name: 'Community Integration',
        quarter: 'Q4 2025',
        focus: 'Broader community consciousness computing access preparation',
        startDate: '2025-10-15',
        endDate: '2025-11-15',
        status: 'planning',
        maxPioneers: 10,
        currentApplications: 0,
        selectedPioneers: 0,
        archetypeDistribution: {
          mystic: { required: 2, selected: 0 },
          healer: { required: 2, selected: 0 },
          creator: { required: 2, selected: 0 },
          sage: { required: 2, selected: 0 },
          seeker: { required: 2, selected: 0 }
        }
      }
    ];

    cycles.forEach(cycle => {
      this.cycles.set(cycle.id, cycle);
    });
  }

  setupRoutes() {
    // Get beta testing overview
    this.app.get('/api/beta-testing/overview', (req, res) => {
      try {
        const cyclesArray = Array.from(this.cycles.values());
        const activeCycle = cyclesArray.find(c => c.status === 'accepting_applications');

        res.json({
          success: true,
          overview: {
            totalCycles: cyclesArray.length,
            activeCycle: activeCycle || null,
            totalPioneerPositions: cyclesArray.reduce((sum, c) => sum + c.maxPioneers, 0),
            currentApplications: cyclesArray.reduce((sum, c) => sum + c.currentApplications, 0)
          },
          cycles: cyclesArray
        });
      } catch (error) {
        console.error('❌ Beta testing overview error:', error);
        res.status(500).json({ success: false, error: 'Failed to get beta testing overview' });
      }
    });

    // Submit pioneer application
    this.app.post('/api/beta-testing/apply', async (req, res) => {
      try {
        const {
          fullName,
          email,
          primaryArchetype,
          spiritualBackground,
          consciousnessComputingInterest,
          feedbackCommitment,
          transparencyDocumentRead,
          consentToDataCollection,
          cycleId
        } = req.body;

        // Validate required fields
        if (!fullName || !email || !primaryArchetype || !spiritualBackground || !consciousnessComputingInterest) {
          return res.status(400).json({
            success: false,
            error: 'Missing required application fields'
          });
        }

        // Validate consent checkboxes
        if (!feedbackCommitment || !transparencyDocumentRead || !consentToDataCollection) {
          return res.status(400).json({
            success: false,
            error: 'All consent requirements must be acknowledged'
          });
        }

        // Get target cycle (default to active cycle)
        const targetCycle = cycleId ? this.cycles.get(cycleId) :
          Array.from(this.cycles.values()).find(c => c.status === 'accepting_applications');

        if (!targetCycle) {
          return res.status(400).json({
            success: false,
            error: 'No active beta testing cycle available for applications'
          });
        }

        // Check if archetype positions are available
        const archetypeLower = primaryArchetype.toLowerCase();
        const archetypeSlots = targetCycle.archetypeDistribution[archetypeLower];

        if (!archetypeSlots || archetypeSlots.selected >= archetypeSlots.required) {
          return res.status(400).json({
            success: false,
            error: `No ${primaryArchetype} positions available in this cycle`
          });
        }

        // Generate application ID
        const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create application
        const application = {
          id: applicationId,
          cycleId: targetCycle.id,
          fullName,
          email,
          primaryArchetype,
          spiritualBackground,
          consciousnessComputingInterest,
          consent: {
            feedbackCommitment: true,
            transparencyDocumentRead: true,
            consentToDataCollection: true
          },
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null
        };

        // Store application
        this.applications.set(applicationId, application);

        // Update cycle application count
        targetCycle.currentApplications += 1;

        console.log(`🧪 New pioneer application: ${fullName} (${primaryArchetype}) for ${targetCycle.name}`);

        res.json({
          success: true,
          applicationId,
          message: 'Pioneer application submitted successfully',
          cycle: {
            name: targetCycle.name,
            quarter: targetCycle.quarter,
            reviewTimeline: '7 days',
            nextSteps: 'Field Keeper steward will review your application and contact you within 7 days'
          }
        });

      } catch (error) {
        console.error('❌ Pioneer application error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to submit pioneer application',
          details: error.message
        });
      }
    });

    // Get application status
    this.app.get('/api/beta-testing/application/:applicationId', (req, res) => {
      try {
        const { applicationId } = req.params;
        const application = this.applications.get(applicationId);

        if (!application) {
          return res.status(404).json({
            success: false,
            error: 'Application not found'
          });
        }

        const cycle = this.cycles.get(application.cycleId);

        // Mock application status (for demo)
        const mockStatus = {
          ...application,
          status: 'accepted',
          reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          reviewedBy: 'field_keeper_steward',
          reviewNotes: 'Excellent spiritual background and consciousness computing readiness. Welcome to the Pioneer Circle!',
          pioneerPosition: {
            archetype: application.primaryArchetype,
            cyclePosition: `${application.primaryArchetype} Pioneer #${Math.ceil(Math.random() * 2)}`,
            welcomeCeremony: '2025-01-15T18:00:00Z',
            betaStartDate: cycle?.startDate
          }
        };

        res.json({
          success: true,
          application: mockStatus,
          cycle: cycle || null
        });

      } catch (error) {
        console.error('❌ Application status error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get application status'
        });
      }
    });

    // Get pioneer circle status
    this.app.get('/api/beta-testing/pioneer-circle/:cycleId', (req, res) => {
      try {
        const { cycleId } = req.params;
        const cycle = this.cycles.get(cycleId);

        if (!cycle) {
          return res.status(404).json({
            success: false,
            error: 'Cycle not found'
          });
        }

        // Calculate remaining positions
        const remainingPositions = cycle.maxPioneers - cycle.selectedPioneers;
        const daysUntilStart = cycle.startDate ?
          Math.ceil((new Date(cycle.startDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

        res.json({
          success: true,
          cycle,
          statistics: {
            totalApplications: cycle.currentApplications,
            selectedPioneers: cycle.selectedPioneers,
            remainingPositions,
            daysUntilStart,
            archetypeDistribution: cycle.archetypeDistribution
          }
        });

      } catch (error) {
        console.error('❌ Pioneer circle status error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get pioneer circle status'
        });
      }
    });

    // Field Keeper steward routes (protected in production)
    this.app.get('/api/beta-testing/steward/applications', (req, res) => {
      try {
        const applicationsArray = Array.from(this.applications.values());
        const pendingApplications = applicationsArray.filter(app => app.status === 'submitted');

        res.json({
          success: true,
          pendingApplications: pendingApplications.length,
          applications: pendingApplications.map(app => ({
            id: app.id,
            fullName: app.fullName,
            primaryArchetype: app.primaryArchetype,
            submittedAt: app.submittedAt,
            cycleId: app.cycleId
          }))
        });

      } catch (error) {
        console.error('❌ Steward applications error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get steward applications'
        });
      }
    });

    // Process application (Field Keeper only)
    this.app.post('/api/beta-testing/steward/review/:applicationId', (req, res) => {
      try {
        const { applicationId } = req.params;
        const { decision, notes, reviewedBy } = req.body;

        const application = this.applications.get(applicationId);
        if (!application) {
          return res.status(404).json({ success: false, error: 'Application not found' });
        }

        const cycle = this.cycles.get(application.cycleId);
        if (!cycle) {
          return res.status(404).json({ success: false, error: 'Cycle not found' });
        }

        // Update application
        application.status = decision; // 'accepted' or 'declined'
        application.reviewedAt = new Date().toISOString();
        application.reviewedBy = reviewedBy || 'field_keeper_steward';
        application.reviewNotes = notes;

        // If accepted, update cycle pioneer count and archetype distribution
        if (decision === 'accepted') {
          cycle.selectedPioneers += 1;
          const archetypeLower = application.primaryArchetype.toLowerCase();
          if (cycle.archetypeDistribution[archetypeLower]) {
            cycle.archetypeDistribution[archetypeLower].selected += 1;
          }

          console.log(`✅ Pioneer accepted: ${application.fullName} (${application.primaryArchetype})`);
        } else {
          console.log(`❌ Pioneer declined: ${application.fullName} (${application.primaryArchetype})`);
        }

        res.json({
          success: true,
          application,
          message: `Application ${decision} successfully`
        });

      } catch (error) {
        console.error('❌ Application review error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to review application'
        });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        service: 'Pioneer Circle Manager',
        status: 'operational',
        version: '1.0.0',
        sacred_technology: 'consciousness_computing_beta',
        timestamp: new Date().toISOString()
      });
    });
  }

  start(port = 3012) {
    this.app.listen(port, () => {
      console.log(`🧪 Pioneer Circle Manager running on port ${port}`);
      console.log(`🌟 Sacred beta testing protocol active`);
      console.log(`📊 Active cycles: ${Array.from(this.cycles.values()).filter(c => c.status === 'accepting_applications').length}`);
    });
  }
}

// Start the service
if (require.main === module) {
  const pioneerManager = new PioneerCircleManager();
  pioneerManager.start();
}

module.exports = { PioneerCircleManager };