/**
 * Sacred Facilitator Command Center Service
 * The ADHD-Friendly Consciousness Facilitator's Dream Dashboard Backend
 */

import { supabase } from "../lib/supabaseClient";
import { WebSocketServer } from "ws";
import { ElementType } from "../types";

// Core Types
export interface SacredFacilitator {
  id: string;
  name: string;
  email: string;
  settings: FacilitatorSettings;
  calendarIntegrations: CalendarIntegration[];
  communicationPreferences: CommunicationPreferences;
  adhd_support_level: "high" | "medium" | "low";
}

export interface FacilitatorSettings {
  timezone: string;
  workingHours: { start: string; end: string };
  reminderPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    advanceTime: number; // minutes
  };
  elementalFocus?: ElementType;
  defaultSessionDuration: number; // minutes
  autoResponseEnabled: boolean;
}

export interface CalendarIntegration {
  type: "calendly" | "google" | "microsoft" | "apple";
  connected: boolean;
  syncEnabled: boolean;
  credentials?: any; // Encrypted
}

export interface CommunicationPreferences {
  emailTemplatesEnabled: boolean;
  autoFollowUp: boolean;
  breakthroughAlerts: boolean;
  sacredTimingMessages: boolean;
  priorityNotifications: "all" | "urgent" | "custom";
}

// Event Management Types
export interface SacredEvent {
  id: string;
  facilitatorId: string;
  name: string;
  type: "one-day" | "three-day" | "weekly-series" | "custom";
  startDate: Date;
  endDate: Date;
  location: EventLocation;
  sacredContainer: SacredContainer;
  participants: EventParticipant[];
  automations: EventAutomation[];
  prepStatus: PrepStatus;
  materials: EventMaterial[];
  groupHoloflowerId?: string;
}

export interface EventLocation {
  type: "in-person" | "virtual" | "hybrid";
  venue?: string;
  address?: string;
  virtualLink?: string;
  timezone: string;
}

export interface SacredContainer {
  primaryElement: ElementType;
  transformationFocus:
    | "leadership"
    | "healing"
    | "vision"
    | "integration"
    | "custom";
  groupSizeRange: { min: number; max: number };
  sacredIntention: string;
  energyQuality: string;
}

export interface EventParticipant {
  userId: string;
  registrationDate: Date;
  onboardingStatus: "pending" | "in-progress" | "completed";
  oracleGuideAssigned: boolean;
  preEventSurveyCompleted: boolean;
  specialNeeds?: string;
  elementalProfile?: {
    primary: ElementType;
    secondary: ElementType;
  };
}

export interface EventAutomation {
  type:
    | "welcome-email"
    | "reminder"
    | "follow-up"
    | "oracle-assignment"
    | "survey";
  scheduled: Date;
  completed: boolean;
  template?: string;
  customization?: any;
}

export interface PrepStatus {
  venueConfirmed: boolean;
  materialsUploaded: boolean;
  participantListFinalized: boolean;
  welcomeEmailsSent: boolean;
  logisticsComplete: boolean;
  customTasks: PrepTask[];
}

export interface PrepTask {
  id: string;
  task: string;
  dueDate: Date;
  completed: boolean;
  priority: "high" | "medium" | "low";
  reminder?: Date;
}

export interface EventMaterial {
  id: string;
  name: string;
  type: "document" | "audio" | "video" | "image";
  url: string;
  category: "prep" | "handout" | "reference" | "post-event";
}

// Participant CRM Types
export interface SacredParticipant {
  id: string;
  facilitatorId: string;
  profile: ParticipantProfile;
  journey: SacredJourney;
  sessions: SessionRecord[];
  communications: CommunicationRecord[];
  holoflowerState?: any;
  oracleGuide?: string;
  automatedSequences: AutomatedSequence[];
}

export interface ParticipantProfile {
  name: string;
  email: string;
  phone?: string;
  primaryElement: ElementType;
  secondaryElement?: ElementType;
  clientSince: Date;
  tags: string[];
  notes: string;
  preferences: {
    communicationChannel: "email" | "sms" | "both";
    sessionFrequency: "weekly" | "biweekly" | "monthly" | "as-needed";
  };
}

export interface SacredJourney {
  currentFocus: string;
  activeHouses: number[];
  recentBreakthroughs: Breakthrough[];
  integrationPhase: boolean;
  challenges: string[];
  transformationStage:
    | "initiation"
    | "deepening"
    | "integration"
    | "embodiment";
}

export interface Breakthrough {
  date: Date;
  description: string;
  relatedHouse?: number;
  element?: ElementType;
  acknowledged: boolean;
}

export interface SessionRecord {
  id: string;
  date: Date;
  duration: number; // minutes
  type: "individual" | "group" | "workshop";
  notes: string;
  recording?: string;
  transcript?: string;
  aiSummary?: SessionSummary;
  breakthroughMoments: BreakthroughMoment[];
  followUpActions: string[];
}

export interface SessionSummary {
  elements: {
    fire: string[];
    water: string[];
    earth: string[];
    air: string[];
  };
  keyMoments: { timestamp: string; description: string }[];
  suggestedFollowUp: string[];
  emotionalTone: string;
  transformationIndicators: string[];
}

export interface BreakthroughMoment {
  timestamp: string;
  transcriptExcerpt: string;
  significance: string;
  element?: ElementType;
}

export interface CommunicationRecord {
  id: string;
  date: Date;
  type: "email" | "sms" | "session-note" | "voice-note";
  direction: "sent" | "received";
  subject?: string;
  content: string;
  responseNeeded: boolean;
  responseDeadline?: Date;
  category: "urgent" | "important" | "update" | "acknowledgment";
}

// Session & Recording Types
export interface SessionManagement {
  upcomingSessions: ScheduledSession[];
  recordingLibrary: SessionRecording[];
  transcriptionQueue: TranscriptionJob[];
  summaryTemplates: SummaryTemplate[];
}

export interface ScheduledSession {
  id: string;
  participantId: string;
  scheduledTime: Date;
  duration: number;
  type: "individual" | "group";
  prepNotes?: string;
  meetingLink?: string;
  remindersSent: boolean;
  elementalFocus?: ElementType;
  suggestedQuestions?: string[];
}

export interface SessionRecording {
  id: string;
  sessionId: string;
  participantId: string;
  recordingUrl: string;
  duration: number;
  transcriptionStatus: "pending" | "processing" | "completed" | "failed";
  transcriptUrl?: string;
  summaryGenerated: boolean;
}

export interface TranscriptionJob {
  id: string;
  recordingId: string;
  status: "queued" | "processing" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  service: "assembly-ai" | "whisper" | "custom";
}

export interface SummaryTemplate {
  id: string;
  name: string;
  structure: {
    sections: string[];
    elementalBreakdown: boolean;
    keyMomentsCount: number;
    includeFollowUp: boolean;
  };
}

// Communication Hub Types
export interface CommunicationHub {
  inbox: InboxItem[];
  templates: MessageTemplate[];
  automations: CommunicationAutomation[];
  analytics: CommunicationAnalytics;
}

export interface InboxItem {
  id: string;
  from: string;
  participantId?: string;
  subject: string;
  preview: string;
  receivedAt: Date;
  category: "urgent" | "important" | "update";
  responseStatus: "needed" | "drafted" | "sent" | "not-needed";
  suggestedResponse?: string;
  sentiment?: "crisis" | "breakthrough" | "neutral" | "gratitude";
}

export interface MessageTemplate {
  id: string;
  name: string;
  element: ElementType;
  category: "follow-up" | "check-in" | "breakthrough" | "support" | "logistics";
  subject: string;
  content: string;
  variables: string[]; // e.g., {{name}}, {{lastSession}}, {{element}}
  tone: "supportive" | "celebratory" | "informative" | "urgent";
}

export interface CommunicationAutomation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  enabled: boolean;
  lastTriggered?: Date;
}

export interface AutomationTrigger {
  type: "time-based" | "event-based" | "condition-based";
  config: any; // Specific to trigger type
}

export interface AutomationAction {
  type: "send-email" | "send-sms" | "create-task" | "notify-facilitator";
  template?: string;
  delay?: number; // minutes
  config: any;
}

// ADHD Support Types
export interface ADHDCommandCenter {
  dailyPriorities: DailyPriority[];
  smartReminders: SmartReminder[];
  delegatedTasks: DelegatedTask[];
  focusMode: FocusMode;
}

export interface DailyPriority {
  id: string;
  task: string;
  category: "must-do" | "can-wait" | "delegated";
  deadline?: Date;
  completed: boolean;
  participant?: string;
  estimatedTime?: number; // minutes
  sacredTiming?: string; // e.g., "Best during morning Fire energy"
}

export interface SmartReminder {
  id: string;
  taskId: string;
  scheduledTime: Date;
  type: "visual" | "audio" | "notification" | "all";
  priority: "interrupt" | "gentle" | "ambient";
  snoozedUntil?: Date;
  adaptiveTiming: boolean; // Learns best times
}

export interface DelegatedTask {
  id: string;
  task: string;
  delegatedTo: "system" | "assistant" | "participant";
  automationType?: string;
  status: "active" | "completed" | "paused";
  lastRun?: Date;
}

export interface FocusMode {
  enabled: boolean;
  startTime?: Date;
  duration?: number; // minutes
  allowedInterruptions: "none" | "urgent-only" | "participant-crisis";
  currentTask?: string;
}

// Service Implementation
export class FacilitatorDashboardService {
  private wsServer: WebSocketServer | null = null;
  private facilitators: Map<string, SacredFacilitator> = new Map();
  private activeReminders: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeWebSocketServer();
    this.startAutomationEngine();
  }

  private initializeWebSocketServer() {
    this.wsServer = new WebSocketServer({ port: 5005 });

    this.wsServer.on("connection", (ws, req) => {
      const facilitatorId = req.url?.split("/").pop();
      if (!facilitatorId) return;

      ws.on("message", async (message) => {
        const data = JSON.parse(message.toString());
        await this.handleDashboardMessage(facilitatorId, data);
      });

      // Send initial dashboard state
      this.sendDashboardState(facilitatorId, ws);
    });
  }

  private async handleDashboardMessage(facilitatorId: string, data: any) {
    switch (data.type) {
      case "create-event":
        await this.createSacredEvent(facilitatorId, data.event);
        break;

      case "update-participant":
        await this.updateParticipant(facilitatorId, data.participant);
        break;

      case "process-recording":
        await this.processSessionRecording(data.recording);
        break;

      case "send-communication":
        await this.sendCommunication(facilitatorId, data.message);
        break;

      case "update-priorities":
        await this.updateDailyPriorities(facilitatorId, data.priorities);
        break;
    }
  }

  // Create Sacred Event with full automation setup
  public async createSacredEvent(
    facilitatorId: string,
    eventData: any,
  ): Promise<SacredEvent> {
    const event: SacredEvent = {
      id: `event-${Date.now()}`,
      facilitatorId,
      name: eventData.name,
      type: eventData.type,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      location: eventData.location,
      sacredContainer: eventData.sacredContainer,
      participants: [],
      automations: this.setupEventAutomations(eventData),
      prepStatus: this.initializePrepStatus(),
      materials: [],
    };

    // Save to database
    await supabase.from("sacred_events").insert(event);

    // Create group holoflower
    if (eventData.createGroupHoloflower) {
      event.groupHoloflowerId = await this.createGroupHoloflower(event);
    }

    // Schedule automations
    await this.scheduleEventAutomations(event);

    // Broadcast update
    this.broadcastDashboardUpdate(facilitatorId, {
      type: "event-created",
      event,
    });

    return event;
  }

  // Setup event automations based on type and preferences
  private setupEventAutomations(eventData: any): EventAutomation[] {
    const automations: EventAutomation[] = [];
    const startDate = new Date(eventData.startDate);

    // Welcome email automation
    automations.push({
      type: "welcome-email",
      scheduled: new Date(), // Immediate
      completed: false,
      template: "sacred-welcome",
    });

    // Reminder sequence
    const reminderDays = [30, 14, 7, 3, 1];
    reminderDays.forEach((days) => {
      const reminderDate = new Date(startDate);
      reminderDate.setDate(reminderDate.getDate() - days);

      automations.push({
        type: "reminder",
        scheduled: reminderDate,
        completed: false,
        template: `reminder-${days}day`,
      });
    });

    // Oracle Guide assignment
    automations.push({
      type: "oracle-assignment",
      scheduled: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
      completed: false,
    });

    // Post-event follow-up
    const followUpDate = new Date(eventData.endDate);
    followUpDate.setDate(followUpDate.getDate() + 1);

    automations.push({
      type: "follow-up",
      scheduled: followUpDate,
      completed: false,
      template: "post-event-integration",
    });

    return automations;
  }

  // Process session recording with AI transcription and sacred summary
  public async processSessionRecording(recordingData: {
    sessionId: string;
    recordingUrl: string;
    participantId: string;
  }): Promise<SessionSummary> {
    // Create transcription job
    const job: TranscriptionJob = {
      id: `job-${Date.now()}`,
      recordingId: recordingData.sessionId,
      status: "queued",
      service: "assembly-ai",
    };

    await supabase.from("transcription_jobs").insert(job);

    // Start transcription (would integrate with Assembly AI)
    const transcript = await this.transcribeRecording(
      recordingData.recordingUrl,
    );

    // Generate sacred summary
    const summary = await this.generateSacredSummary(
      transcript,
      recordingData.participantId,
    );

    // Update session record
    await supabase
      .from("session_records")
      .update({
        transcript,
        aiSummary: summary,
        breakthroughMoments: summary.keyMoments,
      })
      .eq("id", recordingData.sessionId);

    // Check for breakthrough moments
    await this.checkForBreakthroughs(summary, recordingData.participantId);

    return summary;
  }

  // Generate sacred summary with elemental breakdown
  private async generateSacredSummary(
    transcript: string,
    participantId: string,
  ): Promise<SessionSummary> {
    // This would use AI to analyze transcript
    // For now, returning example structure

    return {
      elements: {
        fire: [
          "Expressed vision for new project",
          "Breakthrough moment at 14:32",
        ],
        water: [
          "Emotional release around mother relationship",
          "Tears of joy at realization",
        ],
        earth: ["Committed to daily practice", "Set concrete action steps"],
        air: [
          "New perspective on old pattern",
          "Clear communication with partner",
        ],
      },
      keyMoments: [
        {
          timestamp: "14:32",
          description: "Major realization about repeating pattern",
        },
        { timestamp: "27:45", description: "Commitment to new way of being" },
      ],
      suggestedFollowUp: [
        "Check on mother relationship progress",
        "Support new project manifestation",
        "Celebrate breakthrough in next session",
      ],
      emotionalTone: "Breakthrough and integration",
      transformationIndicators: [
        "Pattern recognition",
        "Emotional release",
        "Clear commitment",
      ],
    };
  }

  // Smart inbox management with AI categorization
  public async processInboxItem(email: any): Promise<InboxItem> {
    const participantId = await this.matchEmailToParticipant(email.from);
    const sentiment = await this.analyzeSentiment(email.content);
    const category = this.categorizeEmail(email, sentiment);

    const inboxItem: InboxItem = {
      id: `inbox-${Date.now()}`,
      from: email.from,
      participantId,
      subject: email.subject,
      preview: email.content.substring(0, 100),
      receivedAt: new Date(),
      category,
      responseStatus: category === "urgent" ? "needed" : "not-needed",
      sentiment,
    };

    // Generate suggested response if needed
    if (inboxItem.responseStatus === "needed") {
      inboxItem.suggestedResponse = await this.generateSuggestedResponse(
        email,
        participantId,
        sentiment,
      );
    }

    // Save to inbox
    await supabase.from("facilitator_inbox").insert(inboxItem);

    // Alert facilitator if urgent
    if (category === "urgent") {
      await this.sendUrgentAlert(inboxItem);
    }

    return inboxItem;
  }

  // ADHD-friendly daily priority management
  public async generateDailyPriorities(
    facilitatorId: string,
  ): Promise<DailyPriority[]> {
    const facilitator = await this.getFacilitator(facilitatorId);

    // Get all tasks from various sources
    const sessionPrep = await this.getSessionPrepTasks(facilitatorId);
    const emailReplies = await this.getUrgentEmails(facilitatorId);
    const eventTasks = await this.getEventPrepTasks(facilitatorId);
    const followUps = await this.getFollowUpTasks(facilitatorId);

    // Categorize by urgency and sacred timing
    const priorities: DailyPriority[] = [];

    // Must do today
    [...sessionPrep, ...emailReplies].forEach((task) => {
      priorities.push({
        id: `priority-${Date.now()}-${Math.random()}`,
        task: task.description,
        category: "must-do",
        deadline: task.deadline,
        completed: false,
        participant: task.participant,
        estimatedTime: task.estimatedTime,
        sacredTiming: this.getSacredTiming(task),
      });
    });

    // Can wait
    eventTasks.forEach((task) => {
      if (!this.isUrgent(task)) {
        priorities.push({
          id: `priority-${Date.now()}-${Math.random()}`,
          task: task.description,
          category: "can-wait",
          deadline: task.deadline,
          completed: false,
          estimatedTime: task.estimatedTime,
        });
      }
    });

    // Delegated to system
    const automatedTasks = await this.getAutomatedTasks(facilitatorId);
    automatedTasks.forEach((task) => {
      priorities.push({
        id: `priority-${Date.now()}-${Math.random()}`,
        task: task.description,
        category: "delegated",
        completed: task.completed,
      });
    });

    return priorities;
  }

  // Continuous sacred support monitoring
  private async monitorParticipantWellbeing() {
    // Run every hour
    setInterval(async () => {
      const allParticipants = await this.getAllActiveParticipants();

      for (const participant of allParticipants) {
        // Check holoflower for concerning patterns
        const holoflowerAlert = await this.checkHoloflowerPatterns(
          participant.id,
        );

        // Check journal entries for support needs
        const journalAlert = await this.checkJournalSentiment(participant.id);

        // Check for missed sessions or communications
        const engagementAlert = await this.checkEngagement(participant.id);

        if (holoflowerAlert || journalAlert || engagementAlert) {
          await this.createSupportAlert(participant, {
            holoflowerAlert,
            journalAlert,
            engagementAlert,
          });
        }
      }
    }, 3600000); // Every hour
  }

  // Smart reminder system with ADHD support
  public async scheduleSmartReminder(reminder: SmartReminder) {
    const adaptedTime = await this.getOptimalReminderTime(reminder);

    const timeout = setTimeout(async () => {
      await this.triggerReminder(reminder);

      // If snoozed, reschedule
      if (reminder.snoozedUntil) {
        reminder.scheduledTime = reminder.snoozedUntil;
        await this.scheduleSmartReminder(reminder);
      }
    }, adaptedTime.getTime() - Date.now());

    this.activeReminders.set(reminder.id, timeout);
  }

  // Helper methods would continue...

  private async sendDashboardState(facilitatorId: string, ws: any) {
    const dashboard = await this.getDashboardState(facilitatorId);
    ws.send(
      JSON.stringify({
        type: "dashboard-state",
        data: dashboard,
      }),
    );
  }

  private broadcastDashboardUpdate(facilitatorId: string, update: any) {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type: "dashboard-update",
      facilitatorId,
      update,
      timestamp: new Date(),
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  private startAutomationEngine() {
    // Check for scheduled automations every minute
    setInterval(async () => {
      await this.runScheduledAutomations();
      await this.checkBreakthroughAlerts();
      await this.updatePriorityReminders();
    }, 60000);
  }

  public cleanup() {
    if (this.wsServer) {
      this.wsServer.close();
    }

    // Clear all active reminders
    this.activeReminders.forEach((timeout) => clearTimeout(timeout));
    this.activeReminders.clear();
  }
}

export const facilitatorDashboardService = new FacilitatorDashboardService();
