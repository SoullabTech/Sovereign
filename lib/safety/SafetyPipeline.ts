import { createClient } from '@supabase/supabase-js';

interface CrisisDetectionResult {
  riskLevel: 'none' | 'low' | 'moderate' | 'high';
  confidence: number;
  triggers: string[];
  recommendedAction: 'continue' | 'gentle_checkin' | 'lock_session' | 'escalate';
}

interface AssessmentQuestion {
  id: string;
  type: 'PHQ-2' | 'PHQ-9' | 'GAD-7' | 'DASS-21' | 'DSES' | 'MEQ30';
  question: string;
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
}

interface TherapistAPIConfig {
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

export class CrisisDetector {
  private highRiskPatterns = [
    /\b(suicide|kill myself|end it all|don't want to live|better off dead)\b/i,
    /\b(self.?harm|cut myself|hurt myself|pain myself)\b/i,
    /\b(hopeless|worthless|nothing matters|no point)\b/i,
    /\b(can't go on|give up|done with life)\b/i
  ];

  private moderateRiskPatterns = [
    /\b(depressed|depression|sad|down|low|empty)\b/i,
    /\b(anxious|anxiety|panic|worried|scared|afraid)\b/i,
    /\b(stressed|overwhelmed|can't cope|too much)\b/i,
    /\b(alone|lonely|isolated|no one cares)\b/i
  ];

  analyze(message: string): CrisisDetectionResult {
    const triggers: string[] = [];
    let riskLevel: CrisisDetectionResult['riskLevel'] = 'none';
    let confidence = 0;

    // Check for high-risk patterns
    for (const pattern of this.highRiskPatterns) {
      if (pattern.test(message)) {
        triggers.push(pattern.source);
        riskLevel = 'high';
        confidence = 0.9;
        break;
      }
    }

    // Check for moderate-risk patterns if no high risk found
    if (riskLevel === 'none') {
      for (const pattern of this.moderateRiskPatterns) {
        if (pattern.test(message)) {
          triggers.push(pattern.source);
          riskLevel = 'moderate';
          confidence = 0.6;
        }
      }
    }

    // Additional context analysis
    const negativeWords = (message.match(/\b(no|not|never|can't|won't|hate|bad|terrible|awful)\b/gi) || []).length;
    const positiveWords = (message.match(/\b(yes|good|great|love|happy|hope|beautiful|amazing)\b/gi) || []).length;

    if (negativeWords > positiveWords * 2 && riskLevel === 'none') {
      riskLevel = 'low';
      confidence = 0.3;
    }

    const recommendedAction = this.getRecommendedAction(riskLevel);

    return {
      riskLevel,
      confidence,
      triggers,
      recommendedAction
    };
  }

  private getRecommendedAction(riskLevel: CrisisDetectionResult['riskLevel']): CrisisDetectionResult['recommendedAction'] {
    switch (riskLevel) {
      case 'high':
        return 'escalate';
      case 'moderate':
        return 'gentle_checkin';
      case 'low':
        return 'gentle_checkin';
      default:
        return 'continue';
    }
  }
}

export class AssessmentManager {
  private assessmentQuestions = {
    'PHQ-2': [
      {
        id: 'phq2_1',
        question: 'Over the past 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      },
      {
        id: 'phq2_2',
        question: 'Over the past 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      }
    ],
    'GAD-7': [
      {
        id: 'gad7_1',
        question: 'Over the past 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
        scale: { min: 0, max: 3, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
      }
    ]
  };

  getQuestion(userId: string, assessmentType: AssessmentQuestion['type']): AssessmentQuestion | null {
    const questions = this.assessmentQuestions[assessmentType];
    if (!questions || questions.length === 0) return null;

    // Simple rotation - in production, track completion state
    const questionIndex = Date.now() % questions.length;
    return {
      ...questions[questionIndex],
      type: assessmentType
    };
  }

  calculateScore(assessmentType: AssessmentQuestion['type'], responses: number[]): {
    score: number;
    interpretation: string;
  } {
    const totalScore = responses.reduce((sum, score) => sum + score, 0);

    switch (assessmentType) {
      case 'PHQ-2':
        return {
          score: totalScore,
          interpretation: totalScore >= 3 ? 'Suggests possible depression - consider PHQ-9' : 'Low depression risk'
        };
      case 'GAD-7':
        return {
          score: totalScore,
          interpretation: this.getGAD7Interpretation(totalScore)
        };
      default:
        return { score: totalScore, interpretation: 'Score recorded' };
    }
  }

  private getGAD7Interpretation(score: number): string {
    if (score <= 4) return 'Minimal anxiety';
    if (score <= 9) return 'Mild anxiety';
    if (score <= 14) return 'Moderate anxiety';
    return 'Severe anxiety';
  }
}

export class TherapistAPI {
  constructor(private config: TherapistAPIConfig) {}

  async escalateCase(userId: string, reason: string, logs: any[]): Promise<{ success: boolean; caseId?: string }> {
    if (!this.config.enabled) {
      console.log('Therapist API disabled, logging escalation locally');
      return { success: true };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/escalations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          reason,
          logs: logs.slice(-10), // Last 10 safety logs
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      return { success: response.ok, caseId: result.case_id };
    } catch (error) {
      console.error('Therapist API escalation failed:', error);
      return { success: false };
    }
  }

  async getProgress(userId: string): Promise<any> {
    if (!this.config.enabled) return null;

    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}/progress`, {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      return null;
    }
  }
}

export class SafetyPipeline {
  private detector: CrisisDetector;
  private assessmentManager: AssessmentManager;
  private therapistAPI: TherapistAPI | null;
  private supabase: any;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    therapistConfig?: TherapistAPIConfig
  ) {
    this.detector = new CrisisDetector();
    this.assessmentManager = new AssessmentManager();
    this.therapistAPI = therapistConfig ? new TherapistAPI(therapistConfig) : null;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async processMessage(userId: string, message: string): Promise<{
    action: 'continue' | 'gentle_checkin' | 'lock_session' | 'ask_assessment';
    message?: string;
    riskData?: CrisisDetectionResult;
  }> {
    // Analyze message for crisis indicators
    const risk = this.detector.analyze(message);

    // Log safety data
    await this.logSafetyData(userId, message, risk);

    // Handle high-risk scenarios
    if (risk.riskLevel === 'high') {
      await this.handleEscalation(userId, risk, message);
      return {
        action: 'lock_session',
        message: 'I notice you might be going through a really difficult time. Your wellbeing matters deeply. Would you like me to connect you with someone who can provide immediate support?',
        riskData: risk
      };
    }

    // Handle moderate risk with gentle check-in
    if (risk.riskLevel === 'moderate') {
      return {
        action: 'gentle_checkin',
        message: 'I hear that things feel challenging right now. How are you taking care of yourself today?',
        riskData: risk
      };
    }

    // Periodic assessment injection (every 5th message)
    const messageCount = await this.getMessageCount(userId);
    if (messageCount % 5 === 0) {
      const question = this.assessmentManager.getQuestion(userId, 'PHQ-2');
      if (question) {
        await this.logAssessmentQuestion(userId, question);
        return {
          action: 'ask_assessment',
          message: `Quick check-in: ${question.question}`
        };
      }
    }

    return { action: 'continue' };
  }

  async recordAssessment(userId: string, answer: string | number): Promise<void> {
    const lastQuestion = await this.getLastAssessmentQuestion(userId);
    if (!lastQuestion) return;

    const score = typeof answer === 'number' ? answer : this.parseAnswerToScore(answer);

    await this.supabase
      .from('user_assessments')
      .insert({
        user_id: userId,
        assessment_type: lastQuestion.assessment_type,
        question: lastQuestion.question,
        answer: answer.toString(),
        score,
        metadata: { question_id: lastQuestion.id }
      });
  }

  private async logSafetyData(userId: string, message: string, risk: CrisisDetectionResult): Promise<void> {
    await this.supabase
      .from('user_safety')
      .insert({
        user_id: userId,
        message,
        risk_level: risk.riskLevel,
        action_taken: risk.recommendedAction,
        context: {
          confidence: risk.confidence,
          triggers: risk.triggers
        }
      });
  }

  private async handleEscalation(userId: string, risk: CrisisDetectionResult, message: string): Promise<void> {
    const recentLogs = await this.getRecentSafetyLogs(userId, 10);

    // Log escalation
    const { data: escalation } = await this.supabase
      .from('escalations')
      .insert({
        user_id: userId,
        reason: `High risk detected: ${risk.triggers.join(', ')}`,
        status: 'pending',
        notes: `Original message: "${message}"`
      })
      .select()
      .single();

    // External escalation if configured
    if (this.therapistAPI && escalation) {
      const result = await this.therapistAPI.escalateCase(
        userId,
        escalation.reason,
        recentLogs
      );

      if (result.success) {
        await this.supabase
          .from('escalations')
          .update({
            status: 'acknowledged',
            metadata: { external_case_id: result.caseId }
          })
          .eq('id', escalation.id);
      }
    }
  }

  private async logAssessmentQuestion(userId: string, question: AssessmentQuestion): Promise<void> {
    await this.supabase
      .from('user_assessments')
      .insert({
        user_id: userId,
        assessment_type: question.type,
        question: question.question,
        metadata: { question_id: question.id, awaiting_response: true }
      });
  }

  private async getLastAssessmentQuestion(userId: string): Promise<any> {
    const { data } = await this.supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', userId)
      .is('answer', null)
      .order('ts', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  private async getMessageCount(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from('user_safety')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count || 0;
  }

  private async getRecentSafetyLogs(userId: string, limit: number): Promise<any[]> {
    const { data } = await this.supabase
      .from('user_safety')
      .select('*')
      .eq('user_id', userId)
      .order('ts', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private parseAnswerToScore(answer: string): number {
    // Simple mapping - enhance based on assessment scales
    const lowerAnswer = answer.toLowerCase();
    if (lowerAnswer.includes('not at all') || lowerAnswer.includes('never')) return 0;
    if (lowerAnswer.includes('several') || lowerAnswer.includes('sometimes')) return 1;
    if (lowerAnswer.includes('more than half') || lowerAnswer.includes('often')) return 2;
    if (lowerAnswer.includes('nearly every') || lowerAnswer.includes('always')) return 3;
    return 1; // Default moderate score
  }

  // Analytics methods for dashboard
  async getGrowthMetrics(userId: string, days: number = 30): Promise<any> {
    const { data } = await this.supabase
      .from('growth_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('ts', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('ts', { ascending: false });

    return data || [];
  }

  async getEmotionalWeather(userId: string, days: number = 30): Promise<any> {
    const { data } = await this.supabase
      .rpc('get_emotional_weather_data', {
        p_user_id: userId,
        days_back: days
      });

    return data || [];
  }

  async getBreakthroughTimeline(userId: string, days: number = 90): Promise<any> {
    const { data } = await this.supabase
      .rpc('get_breakthrough_timeline', {
        p_user_id: userId,
        days_back: days
      });

    return data || [];
  }

  async getCoherenceScore(userId: string, days: number = 30): Promise<number> {
    const { data } = await this.supabase
      .rpc('get_user_coherence_score', {
        p_user_id: userId,
        days_back: days
      });

    return data || 0;
  }
}