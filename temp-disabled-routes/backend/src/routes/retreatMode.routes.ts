import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { supabase } from "../lib/supabaseClient";
import { z } from "zod";
import { spiralogicAstrologyService } from "../services/spiralogicAstrologyService";

export const retreatModeRouter = Router();

// Middleware to verify retreat access
const hasRetreatAccess = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id;
    const { retreatId } = req.params;

    // Check if user is part of this retreat
    const { data: participant } = await supabase
      .from("retreat_participants")
      .select("*")
      .eq("retreat_id", retreatId)
      .eq("user_id", userId)
      .single();

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this retreat",
      });
    }

    req.participant = participant;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get retreat overview with all participants
retreatModeRouter.get(
  "/:retreatId",
  authenticate,
  hasRetreatAccess,
  async (req, res) => {
    try {
      const { retreatId } = req.params;

      // Get all participants in retreat
      const { data: participants, error } = await supabase
        .from("retreat_participants")
        .select(
          `
        *,
        birth_charts(*),
        spiralogic_reports(*)
      `,
        )
        .eq("retreat_id", retreatId)
        .order("name");

      if (error) throw error;

      // Get retreat metadata (if exists)
      const { data: retreatInfo } = await supabase
        .from("retreats")
        .select("*")
        .eq("id", retreatId)
        .single();

      res.json({
        success: true,
        data: {
          retreat: retreatInfo || {
            id: retreatId,
            name: "Sacred Circle Retreat",
          },
          participants: participants || [],
          totalParticipants: participants?.length || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching retreat:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch retreat information",
      });
    }
  },
);

// Get specific participant details
retreatModeRouter.get(
  "/:retreatId/participant/:participantId",
  authenticate,
  hasRetreatAccess,
  async (req, res) => {
    try {
      const { retreatId, participantId } = req.params;

      const { data: participant, error } = await supabase
        .from("retreat_participants")
        .select(
          `
        *,
        birth_charts(*),
        spiralogic_reports(*)
      `,
        )
        .eq("retreat_id", retreatId)
        .eq("id", participantId)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: participant,
      });
    } catch (error) {
      console.error("Error fetching participant:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch participant details",
      });
    }
  },
);

// Update participant states (current/becoming)
const updateStatesSchema = z.object({
  currentState: z.string().optional(),
  becomingState: z.string().optional(),
});

retreatModeRouter.patch(
  "/:retreatId/my-states",
  authenticate,
  hasRetreatAccess,
  async (req, res) => {
    try {
      const { retreatId } = req.params;
      const userId = req.user!.id;

      const validationResult = updateStatesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid state data",
        });
      }

      const updateData: any = {};
      if (validationResult.data.currentState !== undefined) {
        updateData.current_state = validationResult.data.currentState;
      }
      if (validationResult.data.becomingState !== undefined) {
        updateData.becoming_state = validationResult.data.becomingState;
      }

      const { data, error } = await supabase
        .from("retreat_participants")
        .update(updateData)
        .eq("retreat_id", retreatId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error updating states:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update states",
      });
    }
  },
);

// Add journal entry
const journalEntrySchema = z.object({
  type: z.enum(["text", "voice", "reflection"]),
  content: z.string(),
  voiceUrl: z.string().url().optional(),
  prompt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

retreatModeRouter.post(
  "/:retreatId/journal",
  authenticate,
  hasRetreatAccess,
  async (req, res) => {
    try {
      const { retreatId } = req.params;
      const userId = req.user!.id;

      const validationResult = journalEntrySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid journal entry data",
        });
      }

      const entry = {
        ...validationResult.data,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID(),
      };

      // Get current participant
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("journal_entries")
        .eq("retreat_id", retreatId)
        .eq("user_id", userId)
        .single();

      const currentEntries = participant?.journal_entries || [];
      const updatedEntries = [...currentEntries, entry];

      const { data, error } = await supabase
        .from("retreat_participants")
        .update({ journal_entries: updatedEntries })
        .eq("retreat_id", retreatId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      console.error("Error adding journal entry:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add journal entry",
      });
    }
  },
);

// Get my journal entries
retreatModeRouter.get(
  "/:retreatId/my-journal",
  authenticate,
  hasRetreatAccess,
  async (req, res) => {
    try {
      const { retreatId } = req.params;
      const userId = req.user!.id;

      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("journal_entries")
        .eq("retreat_id", retreatId)
        .eq("user_id", userId)
        .single();

      const entries = participant?.journal_entries || [];

      res.json({
        success: true,
        data: {
          entries,
          count: entries.length,
        },
      });
    } catch (error) {
      console.error("Error fetching journal:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch journal entries",
      });
    }
  },
);

// Generate report for retreat participant
retreatModeRouter.post(
  "/:retreatId/generate-report",
  authenticate,
  async (req, res) => {
    try {
      const { retreatId } = req.params;
      const userId = req.user!.id;

      // Check if user is facilitator or participant
      const { data: participant } = await supabase
        .from("retreat_participants")
        .select("*")
        .eq("retreat_id", retreatId)
        .eq("user_id", userId)
        .single();

      if (!participant) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      // Check if participant already has a report
      if (participant.spiralogic_report_id) {
        return res.status(400).json({
          success: false,
          error: "Report already exists for this participant",
        });
      }

      // Birth data should be provided in request
      const { birthData } = req.body;
      if (!birthData) {
        return res.status(400).json({
          success: false,
          error: "Birth data required",
        });
      }

      // Generate report using the existing service
      const birthChart =
        await spiralogicAstrologyService.calculatePreciseBirthChart(birthData);
      birthChart.userId = userId;

      const savedChart = await spiralogicAstrologyService.saveBirthChart(
        userId,
        birthData,
        birthChart,
      );

      const phaseMapping =
        spiralogicAstrologyService.mapToSpiralogicPhases(birthChart);

      const report = await spiralogicAstrologyService.generateSpiralogicReport(
        userId,
        savedChart.id,
        birthChart,
        phaseMapping,
      );

      // Save report
      const savedReport = await spiralogicAstrologyService.saveReport(report);

      // Update participant with report reference
      const { error: updateError } = await supabase
        .from("retreat_participants")
        .update({
          birth_chart_id: savedChart.id,
          spiralogic_report_id: savedReport.id,
          depth_agent: determineDepthAgent(report.elementalInsights),
        })
        .eq("id", participant.id);

      if (updateError) throw updateError;

      res.json({
        success: true,
        data: {
          reportId: savedReport.id,
          birthChartId: savedChart.id,
          depthAgent: determineDepthAgent(report.elementalInsights),
          summary: {
            beingArchetype: report.beingArchetype,
            becomingArchetype: report.becomingArchetype,
            dominantElement: getDominantElement(report.elementalInsights),
          },
        },
      });
    } catch (error) {
      console.error("Error generating retreat report:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate report",
      });
    }
  },
);

// Admin: Set up retreat (for facilitators)
const setupRetreatSchema = z.object({
  name: z.string(),
  participants: z.array(
    z.object({
      name: z.string(),
      email: z.string().email().optional(),
      avatarUrl: z.string().url().optional(),
    }),
  ),
});

retreatModeRouter.post("/setup", authenticate, async (req, res) => {
  try {
    const facilitatorId = req.user!.id;

    const validationResult = setupRetreatSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid retreat setup data",
      });
    }

    const { name, participants } = validationResult.data;
    const retreatId = `retreat-${Date.now()}`;

    // Create retreat record
    const { data: retreat, error: retreatError } = await supabase
      .from("retreats")
      .insert({
        id: retreatId,
        name,
        facilitator_id: facilitatorId,
        status: "active",
      })
      .select()
      .single();

    if (retreatError) throw retreatError;

    // Create participant records
    const participantInserts = participants.map((p) => ({
      retreat_id: retreatId,
      name: p.name,
      avatar_url: p.avatarUrl,
      // Create temporary user if email provided
      user_id: crypto.randomUUID(), // Simplified - would create actual user accounts
    }));

    const { data: createdParticipants, error: participantsError } =
      await supabase
        .from("retreat_participants")
        .insert(participantInserts)
        .select();

    if (participantsError) throw participantsError;

    res.json({
      success: true,
      data: {
        retreat,
        participants: createdParticipants,
        accessUrl: `/retreat/${retreatId}`,
      },
    });
  } catch (error) {
    console.error("Error setting up retreat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set up retreat",
    });
  }
});

// Helper functions
function determineDepthAgent(elementalInsights: any): string {
  // Determine which elemental agent best matches the participant
  let dominantElement = "water"; // Default to water for depth work
  let maxStrength = 0;

  Object.entries(elementalInsights).forEach(
    ([element, insight]: [string, any]) => {
      if (insight.strength > maxStrength) {
        maxStrength = insight.strength;
        dominantElement = element;
      }
    },
  );

  // Map elements to depth agents
  const agentMap: { [key: string]: string } = {
    fire: "fire",
    water: "water",
    earth: "earth",
    air: "air",
  };

  return agentMap[dominantElement] || "water";
}

function getDominantElement(elementalInsights: any): string {
  let dominant = "";
  let maxStrength = 0;

  Object.entries(elementalInsights).forEach(
    ([element, insight]: [string, any]) => {
      if (insight.strength > maxStrength) {
        maxStrength = insight.strength;
        dominant = element;
      }
    },
  );

  return dominant || "balanced";
}

// Get retreat prompts and activities
retreatModeRouter.get(
  "/:retreatId/prompts",
  authenticate,
  hasRetreatAccess,
  async (req, res) => {
    try {
      const { day } = req.query;

      // Retreat-specific prompts based on day/phase
      const promptsByDay: { [key: string]: any } = {
        "1": {
          morning: {
            title: "Arrival Blessing",
            prompt: "What intention do you bring to this sacred gathering?",
            element: "aether",
          },
          evening: {
            title: "Circle Opening",
            prompt: "Share one word that captures your current state of being.",
            element: "air",
          },
        },
        "2": {
          morning: {
            title: "Elemental Attunement",
            prompt: "Which element calls to you most strongly today? Why?",
            element: "all",
          },
          evening: {
            title: "Shadow Integration",
            prompt: "What pattern are you ready to transform?",
            element: "water",
          },
        },
        "3": {
          morning: {
            title: "Vision Emergence",
            prompt: "What wants to be born through you?",
            element: "fire",
          },
          evening: {
            title: "Integration Ceremony",
            prompt: "How will you carry this wisdom forward?",
            element: "earth",
          },
        },
      };

      const dayPrompts = promptsByDay[day as string] || promptsByDay["1"];

      res.json({
        success: true,
        data: {
          day: day || "1",
          prompts: dayPrompts,
          practices: [
            {
              name: "Morning Circle",
              time: "8:00 AM",
              description: "Sacred sharing and intention setting",
            },
            {
              name: "Elemental Walk",
              time: "10:00 AM",
              description: "Silent nature immersion",
            },
            {
              name: "Chart Wisdom Session",
              time: "2:00 PM",
              description: "Personal birth chart exploration",
            },
            {
              name: "Evening Circle",
              time: "7:00 PM",
              description: "Integration and closing",
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch retreat prompts",
      });
    }
  },
);
