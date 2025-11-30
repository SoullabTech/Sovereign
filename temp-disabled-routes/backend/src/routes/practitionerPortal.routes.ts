import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { supabase } from "../lib/supabaseClient";
import { z } from "zod";

export const practitionerPortalRouter = Router();

// Middleware to verify practitioner role
const isPractitioner = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user has practitioner role
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !user || user.role !== "practitioner") {
      return res.status(403).json({
        success: false,
        error: "Practitioner access required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get practitioner dashboard data
practitionerPortalRouter.get(
  "/dashboard",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;

      // Get practitioner's clients
      const { data: clients, error: clientsError } = await supabase
        .from("practitioner_clients")
        .select("*, spiralogic_reports(count)")
        .eq("practitioner_id", practitionerId)
        .order("created_at", { ascending: false });

      if (clientsError) throw clientsError;

      // Get recent reports
      const { data: recentReports, error: reportsError } = await supabase
        .from("spiralogic_reports")
        .select("*, birth_charts(*)")
        .eq("created_by", practitionerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (reportsError) throw reportsError;

      // Get practitioner branding
      const { data: branding } = await supabase
        .from("practitioner_branding")
        .select("*")
        .eq("practitioner_id", practitionerId)
        .single();

      res.json({
        success: true,
        data: {
          clients: clients || [],
          recentReports: recentReports || [],
          branding,
          stats: {
            totalClients: clients?.length || 0,
            totalReports: recentReports?.length || 0,
            activeClients:
              clients?.filter((c) => {
                const lastReport = recentReports?.find(
                  (r) => r.user_id === c.client_id,
                );
                if (!lastReport) return false;
                const daysSinceReport =
                  (Date.now() - new Date(lastReport.created_at).getTime()) /
                  (1000 * 60 * 60 * 24);
                return daysSinceReport < 30;
              }).length || 0,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard data",
      });
    }
  },
);

// Add new client
const addClientSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  notes: z.string().optional(),
});

practitionerPortalRouter.post(
  "/clients",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;

      const validationResult = addClientSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid client data",
          details: validationResult.error.errors,
        });
      }

      const { email, name, notes } = validationResult.data;

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      let clientId: string;

      if (existingUser) {
        clientId = existingUser.id;
      } else {
        // Create placeholder user account
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              name,
              invited_by: practitionerId,
            },
          });

        if (authError) throw authError;
        clientId = authData.user.id;
      }

      // Create practitioner-client relationship
      const { data: client, error } = await supabase
        .from("practitioner_clients")
        .insert({
          practitioner_id: practitionerId,
          client_id: clientId,
          client_email: email,
          client_name: name,
          notes,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          return res.status(400).json({
            success: false,
            error: "Client already exists",
          });
        }
        throw error;
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      console.error("Error adding client:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add client",
      });
    }
  },
);

// Get client list
practitionerPortalRouter.get(
  "/clients",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;

      const { data: clients, error } = await supabase
        .from("practitioner_clients")
        .select(
          `
        *,
        spiralogic_reports(count),
        birth_charts(count)
      `,
        )
        .eq("practitioner_id", practitionerId)
        .order("client_name");

      if (error) throw error;

      res.json({
        success: true,
        data: {
          clients: clients || [],
          count: clients?.length || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch clients",
      });
    }
  },
);

// Get client details
practitionerPortalRouter.get(
  "/clients/:clientId",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;
      const { clientId } = req.params;

      // Verify practitioner-client relationship
      const { data: relation, error: relError } = await supabase
        .from("practitioner_clients")
        .select("*")
        .eq("practitioner_id", practitionerId)
        .eq("client_id", clientId)
        .single();

      if (relError || !relation) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      // Get client's reports
      const { data: reports } = await supabase
        .from("spiralogic_reports")
        .select("*, birth_charts(*)")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false });

      // Get client's birth charts
      const { data: birthCharts } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("user_id", clientId)
        .order("created_at", { ascending: false });

      res.json({
        success: true,
        data: {
          client: relation,
          reports: reports || [],
          birthCharts: birthCharts || [],
        },
      });
    } catch (error) {
      console.error("Error fetching client details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch client details",
      });
    }
  },
);

// Update client notes
practitionerPortalRouter.patch(
  "/clients/:clientId/notes",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;
      const { clientId } = req.params;
      const { notes } = req.body;

      const { data, error } = await supabase
        .from("practitioner_clients")
        .update({ notes })
        .eq("practitioner_id", practitionerId)
        .eq("client_id", clientId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error updating client notes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update notes",
      });
    }
  },
);

// Get practitioner branding
practitionerPortalRouter.get(
  "/branding",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;

      const { data: branding, error } = await supabase
        .from("practitioner_branding")
        .select("*")
        .eq("practitioner_id", practitionerId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore not found error

      res.json({
        success: true,
        data: branding || null,
      });
    } catch (error) {
      console.error("Error fetching branding:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch branding",
      });
    }
  },
);

// Update practitioner branding
const brandingSchema = z.object({
  businessName: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  customCss: z.string().optional(),
  reportHeaderText: z.string().optional(),
  reportFooterText: z.string().optional(),
});

practitionerPortalRouter.put(
  "/branding",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;

      const validationResult = brandingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "Invalid branding data",
          details: validationResult.error.errors,
        });
      }

      const brandingData = {
        practitioner_id: practitionerId,
        business_name: validationResult.data.businessName,
        logo_url: validationResult.data.logoUrl,
        primary_color: validationResult.data.primaryColor,
        secondary_color: validationResult.data.secondaryColor,
        custom_css: validationResult.data.customCss,
        report_header_text: validationResult.data.reportHeaderText,
        report_footer_text: validationResult.data.reportFooterText,
      };

      const { data, error } = await supabase
        .from("practitioner_branding")
        .upsert(brandingData)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error updating branding:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update branding",
      });
    }
  },
);

// Get report templates (future feature)
practitionerPortalRouter.get(
  "/templates",
  authenticate,
  isPractitioner,
  async (req, res) => {
    // Placeholder for custom report templates
    res.json({
      success: true,
      data: {
        templates: [
          {
            id: "natal-basic",
            name: "Basic Natal Report",
            description: "Standard Spiralogic natal chart interpretation",
          },
          {
            id: "natal-comprehensive",
            name: "Comprehensive Natal Report",
            description: "In-depth analysis with timing and protocols",
          },
          {
            id: "transit",
            name: "Transit Report",
            description: "Current planetary influences and timing",
          },
          {
            id: "synastry",
            name: "Relationship Report",
            description: "Compatibility analysis for two people",
          },
        ],
      },
    });
  },
);

// Analytics endpoint
practitionerPortalRouter.get(
  "/analytics",
  authenticate,
  isPractitioner,
  async (req, res) => {
    try {
      const practitionerId = req.user!.id;
      const { timeframe = "30d" } = req.query;

      // Calculate date range
      const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get reports created in timeframe
      const { data: reports } = await supabase
        .from("spiralogic_reports")
        .select("created_at, user_id")
        .eq("created_by", practitionerId)
        .gte("created_at", startDate.toISOString());

      // Get new clients in timeframe
      const { data: newClients } = await supabase
        .from("practitioner_clients")
        .select("created_at")
        .eq("practitioner_id", practitionerId)
        .gte("created_at", startDate.toISOString());

      // Calculate daily stats
      const dailyStats: {
        [key: string]: { reports: number; clients: number };
      } = {};

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        dailyStats[dateKey] = { reports: 0, clients: 0 };
      }

      reports?.forEach((report) => {
        const dateKey = new Date(report.created_at).toISOString().split("T")[0];
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].reports++;
        }
      });

      newClients?.forEach((client) => {
        const dateKey = new Date(client.created_at).toISOString().split("T")[0];
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].clients++;
        }
      });

      res.json({
        success: true,
        data: {
          timeframe,
          totalReports: reports?.length || 0,
          newClients: newClients?.length || 0,
          uniqueClients: new Set(reports?.map((r) => r.user_id)).size,
          dailyStats: Object.entries(dailyStats)
            .map(([date, stats]) => ({ date, ...stats }))
            .reverse(),
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch analytics",
      });
    }
  },
);
