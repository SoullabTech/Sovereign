import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { facilitatorDashboardService } from "../services/facilitatorDashboardService";
import { calendarIntegrationService } from "../services/calendarIntegrationService";
import { WebSocketServer } from "ws";
import { Server } from "http";

export const facilitatorDashboardRouter = Router();

// Facilitator authentication middleware
const facilitatorAuth = async (req: any, res: any, next: any) => {
  try {
    // Check if user is a facilitator
    const { data: facilitator } = await supabase
      .from("sacred_facilitators")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!facilitator) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Facilitator account required.",
      });
    }

    req.facilitator = facilitator;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to verify facilitator status",
    });
  }
};

// Dashboard Overview
facilitatorDashboardRouter.get(
  "/overview",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;

      // Get today's priorities
      const priorities =
        await facilitatorDashboardService.generateDailyPriorities(
          facilitatorId,
        );

      // Get upcoming sessions
      const { data: upcomingSessions } = await supabase
        .from("session_records")
        .select("*, participant:sacred_participants(*)")
        .eq("facilitator_id", facilitatorId)
        .gte("scheduled_time", new Date().toISOString())
        .order("scheduled_time", { ascending: true })
        .limit(5);

      // Get pending communications
      const { data: pendingEmails } = await supabase
        .from("facilitator_inbox")
        .select("*")
        .eq("facilitator_id", facilitatorId)
        .eq("response_status", "needed")
        .order("received_at", { ascending: false })
        .limit(5);

      // Get active events
      const { data: activeEvents } = await supabase
        .from("sacred_events")
        .select("*")
        .eq("facilitator_id", facilitatorId)
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true })
        .limit(3);

      res.json({
        success: true,
        data: {
          priorities,
          upcomingSessions,
          pendingCommunications: pendingEmails,
          activeEvents,
          stats: {
            totalParticipants: await getParticipantCount(facilitatorId),
            sessionsThisWeek: await getWeeklySessionCount(facilitatorId),
            breakthroughsThisMonth:
              await getMonthlyBreakthroughs(facilitatorId),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard overview",
      });
    }
  },
);

// Create Sacred Event
facilitatorDashboardRouter.post(
  "/events",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const eventData = req.body;

      const event = await facilitatorDashboardService.createSacredEvent(
        facilitatorId,
        eventData,
      );

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Error creating sacred event:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create sacred event",
      });
    }
  },
);

// Get Event Details
facilitatorDashboardRouter.get(
  "/events/:eventId",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const { eventId } = req.params;

      const { data: event } = await supabase
        .from("sacred_events")
        .select(
          `
        *,
        participants:event_participants(*, user:sacred_participants(*)),
        automations:event_automations(*),
        materials:event_materials(*)
      `,
        )
        .eq("id", eventId)
        .eq("facilitator_id", req.facilitator.id)
        .single();

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch event details",
      });
    }
  },
);

// Participant Management
facilitatorDashboardRouter.get(
  "/participants",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const { filter, sort = "name", order = "asc" } = req.query;

      let query = supabase
        .from("sacred_participants")
        .select(
          `
        *,
        journey:participant_journeys(*),
        sessions:session_records(count),
        last_session:session_records(scheduled_time)
      `,
        )
        .eq("facilitator_id", facilitatorId);

      // Apply filters
      if (filter === "active") {
        query = query.gte(
          "last_session.scheduled_time",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );
      }

      // Apply sorting
      query = query.order(sort as string, { ascending: order === "asc" });

      const { data: participants, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: participants,
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch participants",
      });
    }
  },
);

// Get Participant Profile
facilitatorDashboardRouter.get(
  "/participants/:participantId",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const { participantId } = req.params;

      const { data: participant } = await supabase
        .from("sacred_participants")
        .select(
          `
        *,
        journey:participant_journeys(*),
        sessions:session_records(*),
        communications:communication_records(*),
        holoflower_state,
        oracle_guide
      `,
        )
        .eq("id", participantId)
        .eq("facilitator_id", req.facilitator.id)
        .single();

      if (!participant) {
        return res.status(404).json({
          success: false,
          error: "Participant not found",
        });
      }

      // Get recent breakthroughs
      const breakthroughs = await getParticipantBreakthroughs(participantId);

      // Get transformation timeline
      const timeline = await getTransformationTimeline(participantId);

      res.json({
        success: true,
        data: {
          ...participant,
          breakthroughs,
          timeline,
        },
      });
    } catch (error) {
      console.error("Error fetching participant:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch participant profile",
      });
    }
  },
);

// Session Management
facilitatorDashboardRouter.post(
  "/sessions/:sessionId/complete",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { notes, recording, breakthroughs, followUpActions } = req.body;

      // Update session record
      await supabase
        .from("session_records")
        .update({
          status: "completed",
          notes,
          recording_url: recording,
          breakthrough_moments: breakthroughs,
          follow_up_actions: followUpActions,
          completed_at: new Date(),
        })
        .eq("id", sessionId)
        .eq("facilitator_id", req.facilitator.id);

      // Process recording if provided
      if (recording) {
        await facilitatorDashboardService.processSessionRecording({
          sessionId,
          recordingUrl: recording,
          participantId: req.body.participantId,
        });
      }

      // Schedule follow-up actions
      if (followUpActions && followUpActions.length > 0) {
        await scheduleFollowUpActions(
          sessionId,
          followUpActions,
          req.facilitator.id,
        );
      }

      res.json({
        success: true,
        message: "Session completed successfully",
      });
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({
        success: false,
        error: "Failed to complete session",
      });
    }
  },
);

// Communication Hub
facilitatorDashboardRouter.get(
  "/inbox",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const { category, status } = req.query;

      let query = supabase
        .from("facilitator_inbox")
        .select("*, participant:sacred_participants(*)")
        .eq("facilitator_id", facilitatorId);

      if (category) {
        query = query.eq("category", category);
      }

      if (status) {
        query = query.eq("response_status", status);
      }

      const { data: inbox, error } = await query.order("received_at", {
        ascending: false,
      });

      if (error) throw error;

      res.json({
        success: true,
        data: inbox,
      });
    } catch (error) {
      console.error("Error fetching inbox:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch inbox",
      });
    }
  },
);

// Send Communication
facilitatorDashboardRouter.post(
  "/communications/send",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const { recipientId, subject, content, template, category } = req.body;

      // Send communication
      const result = await facilitatorDashboardService.sendCommunication(
        facilitatorId,
        {
          recipientId,
          subject,
          content,
          template,
          category,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error sending communication:", error);
      res.status(500).json({
        success: false,
        error: "Failed to send communication",
      });
    }
  },
);

// Calendar Integration
facilitatorDashboardRouter.post(
  "/calendar/calendly/setup",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const { apiKey } = req.body;

      // Setup Calendly integration
      const webhookUrl = `${process.env.API_URL}/webhooks/calendly/${facilitatorId}`;
      const result = await calendarIntegrationService.setupCalendlyWebhook(
        facilitatorId,
        webhookUrl,
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error setting up Calendly:", error);
      res.status(500).json({
        success: false,
        error: "Failed to setup Calendly integration",
      });
    }
  },
);

// MS Teams Integration
facilitatorDashboardRouter.post(
  "/calendar/teams/setup",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const result =
        await calendarIntegrationService.setupMSTeamsIntegration(facilitatorId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error setting up MS Teams:", error);
      res.status(500).json({
        success: false,
        error: "Failed to setup MS Teams integration",
      });
    }
  },
);

// ADHD Support Features
facilitatorDashboardRouter.get(
  "/priorities",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const facilitatorId = req.facilitator.id;
      const priorities =
        await facilitatorDashboardService.generateDailyPriorities(
          facilitatorId,
        );

      res.json({
        success: true,
        data: priorities,
      });
    } catch (error) {
      console.error("Error fetching priorities:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch daily priorities",
      });
    }
  },
);

// Update Priority Status
facilitatorDashboardRouter.patch(
  "/priorities/:priorityId",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const { priorityId } = req.params;
      const { completed, snoozedUntil } = req.body;

      await supabase
        .from("daily_priorities")
        .update({
          completed,
          snoozed_until: snoozedUntil,
        })
        .eq("id", priorityId)
        .eq("facilitator_id", req.facilitator.id);

      res.json({
        success: true,
        message: "Priority updated",
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update priority",
      });
    }
  },
);

// Get Templates
facilitatorDashboardRouter.get(
  "/templates",
  authenticate,
  facilitatorAuth,
  async (req, res) => {
    try {
      const { type, element } = req.query;

      let query = supabase
        .from("message_templates")
        .select("*")
        .eq("facilitator_id", req.facilitator.id);

      if (type) {
        query = query.eq("category", type);
      }

      if (element) {
        query = query.eq("element", element);
      }

      const { data: templates, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch templates",
      });
    }
  },
);

// Webhook handlers
facilitatorDashboardRouter.post(
  "/webhooks/calendly/:facilitatorId",
  async (req, res) => {
    try {
      const { facilitatorId } = req.params;
      await calendarIntegrationService.handleCalendlyWebhook(
        req.body,
        facilitatorId,
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Calendly webhook error:", error);
      res.status(500).json({ success: false });
    }
  },
);

// Helper functions
async function getParticipantCount(facilitatorId: string): Promise<number> {
  const { count } = await supabase
    .from("sacred_participants")
    .select("*", { count: "exact", head: true })
    .eq("facilitator_id", facilitatorId);
  return count || 0;
}

async function getWeeklySessionCount(facilitatorId: string): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count } = await supabase
    .from("session_records")
    .select("*", { count: "exact", head: true })
    .eq("facilitator_id", facilitatorId)
    .gte("scheduled_time", weekAgo.toISOString());
  return count || 0;
}

async function getMonthlyBreakthroughs(facilitatorId: string): Promise<number> {
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { count } = await supabase
    .from("breakthrough_moments")
    .select("*", { count: "exact", head: true })
    .eq("facilitator_id", facilitatorId)
    .gte("created_at", monthAgo.toISOString());
  return count || 0;
}

async function getParticipantBreakthroughs(participantId: string) {
  const { data } = await supabase
    .from("breakthrough_moments")
    .select("*")
    .eq("participant_id", participantId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data || [];
}

async function getTransformationTimeline(participantId: string) {
  // Would aggregate various events into timeline
  return [];
}

async function scheduleFollowUpActions(
  sessionId: string,
  actions: string[],
  facilitatorId: string,
) {
  // Would schedule follow-up tasks
}

// WebSocket setup for real-time dashboard updates
export function setupFacilitatorDashboardWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws/facilitator-dashboard",
  });

  wss.on("connection", (ws, req) => {
    const facilitatorId = req.url?.split("/").pop();

    if (!facilitatorId) {
      ws.close();
      return;
    }

    console.log(`Facilitator dashboard connected: ${facilitatorId}`);

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Handle real-time dashboard actions
        switch (data.type) {
          case "subscribe-updates":
            // Subscribe to real-time updates
            break;

          case "focus-mode":
            // Toggle focus mode
            break;

          case "quick-action":
            // Handle quick actions
            break;
        }
      } catch (error) {
        console.error("Dashboard WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      console.log(`Facilitator dashboard disconnected: ${facilitatorId}`);
    });
  });

  return wss;
}

// Import supabase
import { supabase } from "../lib/supabaseClient";

export { facilitatorDashboardRouter };
