import { DateTime } from 'luxon';
import { RealTimeAlertService, type AlertPayload, type TherapistContact } from './alerting/real-time-alerts';

interface RiskAssessment {
  level: 'none' | 'moderate' | 'high' | 'crisis';
  confidence: number;
  flags: string[];
  timestamp: DateTime;
}

interface AssessmentPrompt {
  type: string;
  questions: string[];
  contextual: boolean;
  scoring: (responses: string[]) => AssessmentScore;
}

interface AssessmentScore {
  raw: number;
  interpretation: string;
  risk_level: 'low' | 'moderate' | 'elevated' | 'high';
  next_action: 'continue' | 'weekly_followup' | 'clinical_referral' | 'crisis_protocol';
}

interface SafetyResponse {
  action: 'continue' | 'gentle_checkin' | 'grounding' | 'lock_session' | 'escalate';
  message?: string;
  assessment?: AssessmentPrompt;
  metadata: {
    risk_assessment: RiskAssessment;
    session_flags: string[];
    user_trajectory: any;
  };
}

class CrisisDetector {
  private highRiskPatterns = [
    /\b(kill|end|suicide|die|death)\s+myself\b/i,
    /\bcan'?t\s+(go\s+on|take\s+it|continue)\b/i,
    /\bno\s+point\s+(living|going\s+on)\b/i,
    /\bbetter\s+off\s+dead\b/i
  ];

  private moderateRiskPatterns = [
    /\b(worthless|hopeless|trapped|empty|numb)\b/i,
    /\bno\s+one\s+cares\b/i,
    /\beverything\s+is\s+falling\s+apart\b/i,
    /\bcan'?t\s+see\s+a\s+way\s+out\b/i
  ];

  private protectiveFactors = [
    /\b(hope|future|tomorrow|family|friends|therapy|help)\b/i,
    /\bfeeling\s+better\b/i,
    /\bgetting\s+support\b/i
  ];

  analyze(message: string, context?: string[]): RiskAssessment {
    const text = message.toLowerCase();
    let flags: string[] = [];
    let riskLevel: RiskAssessment['level'] = 'none';
    let confidence = 0;

    // Check high-risk patterns
    for (const pattern of this.highRiskPatterns) {
      if (pattern.test(text)) {
        flags.push('explicit_suicidal_ideation');
        riskLevel = 'crisis';
        confidence = Math.max(confidence, 0.9);
      }
    }

    // Check moderate-risk patterns
    for (const pattern of this.moderateRiskPatterns) {
      if (pattern.test(text)) {
        flags.push('depression_indicators');
        if (riskLevel === 'none') riskLevel = 'moderate';
        confidence = Math.max(confidence, 0.7);
      }
    }

    // Adjust for protective factors
    for (const pattern of this.protectiveFactors) {
      if (pattern.test(text)) {
        flags.push('protective_factors_present');
        confidence *= 0.8; // Reduce confidence in high risk
        if (riskLevel === 'moderate') riskLevel = 'moderate';
      }
    }

    // Context awareness - escalate if pattern across messages
    if (context && context.length > 0) {
      const recentNegative = context.filter(msg =>
        this.moderateRiskPatterns.some(p => p.test(msg))
      ).length;

      if (recentNegative >= 3) {
        flags.push('persistent_negative_pattern');
        if (riskLevel === 'none') riskLevel = 'moderate';
        if (riskLevel === 'moderate') riskLevel = 'high';
        confidence = Math.max(confidence, 0.8);
      }
    }

    return {
      level: riskLevel,
      confidence,
      flags,
      timestamp: DateTime.now()
    };
  }
}

class ConversationalAssessment {
  private assessmentTypes = {
    phq2: {
      questions: [
        "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
        "How often have you had little interest or pleasure in doing things?"
      ],
      scoring: this.scorePHQ2.bind(this)
    },

    gad2: {
      questions: [
        "Over the past two weeks, how often have you felt nervous, anxious, or on edge?",
        "How often have you been unable to stop or control worrying?"
      ],
      scoring: this.scoreGAD2.bind(this)
    },

    session_mood: {
      questions: [
        "How would you rate your overall emotional state right now, from 1-10?"
      ],
      scoring: this.scoreSessionMood.bind(this)
    },

    grounding_check: {
      questions: [
        "Let's take a moment - can you feel your feet on the ground? Rate how present you feel from 1-10."
      ],
      scoring: this.scoreGrounding.bind(this)
    }
  };

  shouldAssess(conversationContext: any, userProfile: any): AssessmentPrompt | null {
    const { messageCount, lastAssessment, emotionalIntensity, sessionLength } = conversationContext;

    // Crisis-triggered assessment
    if (emotionalIntensity > 0.8) {
      return this.createPrompt('grounding_check', true);
    }

    // Regular clinical screening
    if (!lastAssessment?.phq2 || this.daysSince(lastAssessment.phq2) > 7) {
      if (messageCount > 5) { // Enough rapport built
        return this.createPrompt('phq2', true);
      }
    }

    // Session-end quick check
    if (sessionLength > 15 && messageCount > 8) {
      return this.createPrompt('session_mood', false);
    }

    return null;
  }

  private createPrompt(type: string, contextual: boolean): AssessmentPrompt {
    const assessment = this.assessmentTypes[type];
    return {
      type,
      questions: assessment.questions,
      contextual,
      scoring: assessment.scoring
    };
  }

  private scorePHQ2(responses: string[]): AssessmentScore {
    const responseMap = {
      'not at all': 0,
      'several days': 1,
      'more than half the days': 2,
      'nearly every day': 3
    };

    const total = responses.reduce((sum, response) => {
      const score = Object.entries(responseMap).find(([key]) =>
        response.toLowerCase().includes(key)
      )?.[1] || 1;
      return sum + score;
    }, 0);

    let interpretation: string;
    let riskLevel: AssessmentScore['risk_level'];
    let nextAction: AssessmentScore['next_action'];

    if (total >= 3) {
      interpretation = 'Positive screen for depression - consider full PHQ-9';
      riskLevel = 'elevated';
      nextAction = 'weekly_followup';
    } else {
      interpretation = 'Negative screen for depression';
      riskLevel = 'low';
      nextAction = 'continue';
    }

    return { raw: total, interpretation, risk_level: riskLevel, next_action: nextAction };
  }

  private scoreGAD2(responses: string[]): AssessmentScore {
    // Similar to PHQ-2 scoring
    const total = responses.length * 1.5; // Simplified for example
    return {
      raw: total,
      interpretation: total >= 3 ? 'Positive anxiety screen' : 'Negative anxiety screen',
      risk_level: total >= 3 ? 'elevated' : 'low',
      next_action: total >= 3 ? 'weekly_followup' : 'continue'
    };
  }

  private scoreSessionMood(responses: string[]): AssessmentScore {
    const rating = parseInt(responses[0]) || 5;
    return {
      raw: rating,
      interpretation: `Session mood: ${rating}/10`,
      risk_level: rating <= 3 ? 'elevated' : rating <= 6 ? 'moderate' : 'low',
      next_action: rating <= 3 ? 'weekly_followup' : 'continue'
    };
  }

  private scoreGrounding(responses: string[]): AssessmentScore {
    const rating = parseInt(responses[0]) || 5;
    return {
      raw: rating,
      interpretation: `Present-moment awareness: ${rating}/10`,
      risk_level: rating <= 4 ? 'moderate' : 'low',
      next_action: 'continue'
    };
  }

  private daysSince(date: DateTime): number {
    return DateTime.now().diff(date, 'days').days;
  }
}

interface TherapistDatabase {
  getAssignedTherapist(userId: string): Promise<TherapistContact | null>;
  getOnCallTherapists(): Promise<TherapistContact[]>;
  getUserProfile(userId: string): Promise<any>;
  logCrisisIntervention(data: any): Promise<string>;
}

export class MAIASafetyPipeline {
  private crisisDetector = new CrisisDetector();
  private assessmentManager = new ConversationalAssessment();
  private conversationBuffer: string[] = [];
  private userSessions = new Map<string, any>();
  private alertService?: RealTimeAlertService;
  private therapistDb?: TherapistDatabase;

  constructor(
    alertService?: RealTimeAlertService,
    therapistDb?: TherapistDatabase
  ) {
    this.alertService = alertService;
    this.therapistDb = therapistDb;
  }

  async processMessage(
    userId: string,
    message: string,
    sessionId: string,
    conversationContext: any
  ): Promise<SafetyResponse> {

    // 1. Crisis detection (highest priority)
    const riskAssessment = this.crisisDetector.analyze(
      message,
      this.conversationBuffer.slice(-5)
    );

    this.conversationBuffer.push(message);
    if (this.conversationBuffer.length > 20) {
      this.conversationBuffer.shift(); // Keep recent history
    }

    // 2. Determine primary action based on risk
    let action: SafetyResponse['action'] = 'continue';
    let responseMessage: string | undefined;

    switch (riskAssessment.level) {
      case 'crisis':
        action = 'lock_session';
        responseMessage = "I'm deeply concerned about what you've shared. Your safety is the most important thing right now. I'm going to pause our conversation and connect you with immediate support.";
        await this.triggerCrisisAlert(userId, sessionId, message, riskAssessment);
        break;

      case 'high':
        action = 'escalate';
        responseMessage = "I hear that you're in significant pain. Let's focus on your safety and getting you connected with support. You don't have to go through this alone.";
        await this.triggerHighRiskAlert(userId, sessionId, message, riskAssessment);
        break;

      case 'moderate':
        action = 'gentle_checkin';
        responseMessage = "I notice you're carrying some heavy feelings. I'm here with you. What would feel most supportive right now?";
        await this.logModerateRiskEvent(userId, sessionId, message, riskAssessment);
        break;
    }

    // 3. Check for assessment opportunity (if not in crisis)
    let assessment: AssessmentPrompt | undefined;
    if (riskAssessment.level === 'none' || riskAssessment.level === 'moderate') {
      assessment = this.assessmentManager.shouldAssess(
        conversationContext,
        { userId }
      );
    }

    // 4. Build metadata
    const metadata = {
      risk_assessment: riskAssessment,
      session_flags: this.extractSessionFlags(conversationContext),
      user_trajectory: await this.getUserTrajectory(userId)
    };

    // 5. Log interaction
    await this.logInteraction({
      userId,
      sessionId,
      message,
      riskAssessment,
      assessment: assessment?.type,
      action
    });

    return {
      action,
      message: responseMessage,
      assessment,
      metadata
    };
  }

  private extractSessionFlags(context: any): string[] {
    const flags = [];
    if (context.emotionalIntensity > 0.7) flags.push('high_emotional_intensity');
    if (context.messageCount > 15) flags.push('extended_session');
    if (context.breakthroughMoments > 0) flags.push('breakthrough_present');
    return flags;
  }

  private async getUserTrajectory(userId: string): Promise<any> {
    // This would query your database for user's safety/wellness trajectory
    return {
      trend: 'stable',
      lastCrisis: null,
      assessmentScores: []
    };
  }

  private async logInteraction(data: any): Promise<void> {
    // Log to your database
    console.log('Safety interaction logged:', {
      timestamp: DateTime.now().toISO(),
      ...data
    });
  }

  // Public methods for integration
  async recordAssessmentResponse(
    userId: string,
    assessmentType: string,
    responses: string[]
  ): Promise<AssessmentScore> {
    const assessment = this.assessmentManager['assessmentTypes'][assessmentType];
    const score = assessment.scoring(responses);

    // Store in database
    await this.storeAssessmentResult(userId, assessmentType, responses, score);

    return score;
  }

  async getUserSafetyStatus(userId: string): Promise<any> {
    return {
      currentRisk: 'low',
      lastAssessment: DateTime.now().minus({ days: 3 }),
      recentFlags: [],
      trajectory: await this.getUserTrajectory(userId)
    };
  }

  private async storeAssessmentResult(
    userId: string,
    type: string,
    responses: string[],
    score: AssessmentScore
  ): Promise<void> {
    // Database storage implementation
  }

  // Crisis and Risk Alert Methods
  private async triggerCrisisAlert(
    userId: string,
    sessionId: string,
    message: string,
    riskAssessment: RiskAssessment
  ): Promise<void> {
    if (!this.alertService || !this.therapistDb) {
      console.error('Alert service or therapist database not configured for crisis alert');
      return;
    }

    try {
      // Get assigned therapist first
      let therapist = await this.therapistDb.getAssignedTherapist(userId);

      // If no assigned therapist, get on-call therapist
      if (!therapist) {
        const onCallTherapists = await this.therapistDb.getOnCallTherapists();
        therapist = onCallTherapists[0]; // Get first available
      }

      if (!therapist) {
        console.error('No therapist available for crisis alert');
        return;
      }

      // Get user profile for context
      const userProfile = await this.therapistDb.getUserProfile(userId);

      // Create alert payload
      const alertPayload: AlertPayload = {
        alert_id: `crisis_${userId}_${Date.now()}`,
        user_id: userId,
        user_name: userProfile?.name,
        therapist_id: therapist.id,
        risk_level: 'crisis',
        trigger_reason: riskAssessment.flags.join(', ') || 'Crisis-level language detected',
        trigger_message: message.length > 200 ? message.slice(0, 200) + '...' : message,
        context: {
          session_id: sessionId,
          message_count: this.conversationBuffer.length,
          recent_messages: this.conversationBuffer.slice(-5),
          safety_flags: riskAssessment.flags,
        },
        timestamp: DateTime.now().toISO(),
        escalation_level: 'immediate',
        follow_up_required: true,
      };

      // Send alert
      const alertResponse = await this.alertService.sendAlert(therapist, alertPayload);

      // Log crisis intervention
      await this.therapistDb.logCrisisIntervention({
        user_id: userId,
        session_id: sessionId,
        alert_id: alertPayload.alert_id,
        therapist_id: therapist.id,
        risk_assessment: riskAssessment,
        trigger_message: message,
        alert_delivery_status: alertResponse.delivery_status,
        intervention_type: 'crisis_alert',
        created_at: DateTime.now().toISO(),
      });

      console.log(`Crisis alert sent for user ${userId}, alert ID: ${alertPayload.alert_id}`);
    } catch (error) {
      console.error('Failed to send crisis alert:', error);
    }
  }

  private async triggerHighRiskAlert(
    userId: string,
    sessionId: string,
    message: string,
    riskAssessment: RiskAssessment
  ): Promise<void> {
    if (!this.alertService || !this.therapistDb) {
      console.error('Alert service or therapist database not configured for high-risk alert');
      return;
    }

    try {
      const therapist = await this.therapistDb.getAssignedTherapist(userId);
      if (!therapist) {
        console.log('No assigned therapist for high-risk alert, logging for review');
        return;
      }

      const userProfile = await this.therapistDb.getUserProfile(userId);

      const alertPayload: AlertPayload = {
        alert_id: `high_risk_${userId}_${Date.now()}`,
        user_id: userId,
        user_name: userProfile?.name,
        therapist_id: therapist.id,
        risk_level: 'high',
        trigger_reason: riskAssessment.flags.join(', ') || 'High-risk indicators detected',
        trigger_message: message.length > 200 ? message.slice(0, 200) + '...' : message,
        context: {
          session_id: sessionId,
          message_count: this.conversationBuffer.length,
          recent_messages: this.conversationBuffer.slice(-3),
          safety_flags: riskAssessment.flags,
        },
        timestamp: DateTime.now().toISO(),
        escalation_level: 'urgent',
        follow_up_required: true,
      };

      // Only send during on-call hours unless it's emergency-level
      if (therapist.emergency_only && riskAssessment.confidence < 0.9) {
        console.log('Therapist marked emergency-only, deferring high-risk alert');
        return;
      }

      const alertResponse = await this.alertService.sendAlert(therapist, alertPayload);

      await this.therapistDb.logCrisisIntervention({
        user_id: userId,
        session_id: sessionId,
        alert_id: alertPayload.alert_id,
        therapist_id: therapist.id,
        risk_assessment: riskAssessment,
        trigger_message: message,
        alert_delivery_status: alertResponse.delivery_status,
        intervention_type: 'high_risk_alert',
        created_at: DateTime.now().toISO(),
      });

      console.log(`High-risk alert sent for user ${userId}, alert ID: ${alertPayload.alert_id}`);
    } catch (error) {
      console.error('Failed to send high-risk alert:', error);
    }
  }

  private async logModerateRiskEvent(
    userId: string,
    sessionId: string,
    message: string,
    riskAssessment: RiskAssessment
  ): Promise<void> {
    // Log moderate risk events for pattern tracking without triggering alerts
    // These get reviewed in weekly therapist summaries
    console.log(`Moderate risk event logged for user ${userId}:`, {
      flags: riskAssessment.flags,
      confidence: riskAssessment.confidence,
      session_id: sessionId,
    });
  }

  // Public method to test alert system
  async testAlertSystem(userId: string): Promise<any> {
    if (!this.alertService) {
      throw new Error('Alert service not configured');
    }

    // Test connectivity
    const connectivity = await this.alertService.testConnections();

    // Send test alert if therapist available
    if (this.therapistDb) {
      const therapist = await this.therapistDb.getAssignedTherapist(userId);
      if (therapist) {
        const testPayload: AlertPayload = {
          alert_id: `test_${userId}_${Date.now()}`,
          user_id: userId,
          user_name: 'Test User',
          therapist_id: therapist.id,
          risk_level: 'moderate',
          trigger_reason: 'System test alert',
          context: {
            session_id: 'test_session',
            message_count: 1,
            recent_messages: ['This is a test message'],
            safety_flags: ['test'],
          },
          timestamp: DateTime.now().toISO(),
          escalation_level: 'standard',
          follow_up_required: false,
        };

        const alertResponse = await this.alertService.sendAlert(therapist, testPayload);
        return { connectivity, test_alert: alertResponse };
      }
    }

    return { connectivity, test_alert: null };
  }
}