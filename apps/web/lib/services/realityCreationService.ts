interface RealityExperiment {
  id: string;
  userId: string;
  hypothesis: string;
  startDate: Date;
  variables: string[];
  observations: ExperimentObservation[];
  outcomes: ExperimentOutcome[];
  status: 'active' | 'complete' | 'paused';
  correlationScore?: number;
}

interface ExperimentObservation {
  date: Date;
  observation: string;
  internalState: string;
  externalReality: string;
}

interface ExperimentOutcome {
  date: Date;
  outcome: string;
  correlation: string;
  insights: string;
}

interface CorrelationAnalysis {
  insights: string;
  correlationStrength: number;
  suggestedAdjustments: string[];
}

export class RealityCreationLab {
  private experiments: Map<string, RealityExperiment> = new Map();

  async createExperiment(userId: string, hypothesis: string): Promise<{
    response: string;
    experimentId: string;
  }> {
    const experimentId = `exp-${userId}-${Date.now()}`;

    const experiment: RealityExperiment = {
      id: experimentId,
      userId,
      hypothesis,
      startDate: new Date(),
      variables: await this.identifyVariables(hypothesis),
      observations: [],
      outcomes: [],
      status: 'active'
    };

    this.experiments.set(experimentId, experiment);

    const variablesText = experiment.variables.length > 0
      ? ` Key variables: ${experiment.variables.join(', ')}.`
      : '';

    return {
      response: `Experiment initiated. Hypothesis: "${hypothesis}".${variablesText} Let's identify what internal state needs to shift. What do you notice about your current consciousness around this?`,
      experimentId
    };
  }

  private async identifyVariables(hypothesis: string): Promise<string[]> {
    const variables: string[] = [];
    const lowerHypothesis = hypothesis.toLowerCase();

    const variablePatterns = {
      'internal_belief': ['believe', 'think', 'assume', 'expect'],
      'emotional_state': ['feel', 'emotion', 'mood', 'energy'],
      'behavior': ['do', 'act', 'respond', 'choose'],
      'attention': ['focus', 'notice', 'aware', 'attention'],
      'relationship': ['relate', 'connect', 'interact', 'communicate']
    };

    Object.entries(variablePatterns).forEach(([variable, keywords]) => {
      if (keywords.some(keyword => lowerHypothesis.includes(keyword))) {
        variables.push(variable);
      }
    });

    return variables;
  }

  async checkIn(
    experimentId: string,
    observation: string,
    internalState: string,
    externalReality: string
  ): Promise<{
    response: string;
    correlation: CorrelationAnalysis;
  }> {
    const experiment = this.experiments.get(experimentId);

    if (!experiment) {
      return {
        response: "Experiment not found. Let's start a new one.",
        correlation: {
          insights: '',
          correlationStrength: 0,
          suggestedAdjustments: []
        }
      };
    }

    const newObservation: ExperimentObservation = {
      date: new Date(),
      observation,
      internalState,
      externalReality
    };

    experiment.observations.push(newObservation);

    const correlation = await this.analyzeCorrelation(
      experiment.hypothesis,
      experiment.observations
    );

    experiment.correlationScore = correlation.correlationStrength;

    const encouragement = this.generateEncouragement(correlation.correlationStrength);

    return {
      response: `Fascinating data point. ${correlation.insights}. ${encouragement} What else are you noticing in your external reality?`,
      correlation
    };
  }

  private async analyzeCorrelation(
    hypothesis: string,
    observations: ExperimentObservation[]
  ): Promise<CorrelationAnalysis> {
    if (observations.length === 0) {
      return {
        insights: 'No observations yet',
        correlationStrength: 0,
        suggestedAdjustments: ['Begin tracking daily']
      };
    }

    const recentObs = observations.slice(-5);

    const hasInternalShift = recentObs.some(obs =>
      obs.internalState.toLowerCase().includes('shift') ||
      obs.internalState.toLowerCase().includes('change') ||
      obs.internalState.toLowerCase().includes('different')
    );

    const hasExternalShift = recentObs.some(obs =>
      obs.externalReality.toLowerCase().includes('shift') ||
      obs.externalReality.toLowerCase().includes('change') ||
      obs.externalReality.toLowerCase().includes('different') ||
      obs.externalReality.toLowerCase().includes('new')
    );

    let correlationStrength = 0.5;
    let insights = '';

    if (hasInternalShift && hasExternalShift) {
      correlationStrength = 0.8;
      insights = 'Strong correlation detected - your internal shifts are manifesting externally';
    } else if (hasInternalShift && !hasExternalShift) {
      correlationStrength = 0.6;
      insights = 'Internal shifts happening - external reality may be responding in subtle ways';
    } else if (!hasInternalShift && hasExternalShift) {
      correlationStrength = 0.4;
      insights = 'External changes occurring - check if internal state is shifting too';
    } else {
      correlationStrength = 0.3;
      insights = 'Early data - patterns still forming';
    }

    const suggestedAdjustments: string[] = [];

    if (correlationStrength < 0.5) {
      suggestedAdjustments.push('Increase awareness of internal state');
      suggestedAdjustments.push('Track external reality more deliberately');
    } else if (correlationStrength < 0.7) {
      suggestedAdjustments.push('Notice synchronicities');
      suggestedAdjustments.push('Trust the subtle shifts');
    } else {
      suggestedAdjustments.push('Amplify what\'s working');
      suggestedAdjustments.push('Document the formula');
    }

    return {
      insights,
      correlationStrength,
      suggestedAdjustments
    };
  }

  private generateEncouragement(correlationStrength: number): string {
    if (correlationStrength >= 0.8) {
      return 'Your experiment is showing strong results.';
    } else if (correlationStrength >= 0.6) {
      return 'The data is promising.';
    } else if (correlationStrength >= 0.4) {
      return 'Patterns are forming.';
    } else {
      return 'Keep gathering data.';
    }
  }

  async completeExperiment(
    experimentId: string,
    finalInsight: string
  ): Promise<{
    response: string;
    experiment: RealityExperiment;
  }> {
    const experiment = this.experiments.get(experimentId);

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    experiment.status = 'complete';

    const outcome: ExperimentOutcome = {
      date: new Date(),
      outcome: finalInsight,
      correlation: `Correlation strength: ${experiment.correlationScore?.toFixed(2) || 'unknown'}`,
      insights: `Experiment ran for ${experiment.observations.length} observations`
    };

    experiment.outcomes.push(outcome);

    return {
      response: `Experiment complete. You've documented ${experiment.observations.length} data points. ${finalInsight}. This formula is now part of the collective wisdom. Ready to design a new experiment?`,
      experiment
    };
  }

  getExperiment(experimentId: string): RealityExperiment | undefined {
    return this.experiments.get(experimentId);
  }

  getUserExperiments(userId: string): RealityExperiment[] {
    return Array.from(this.experiments.values())
      .filter(exp => exp.userId === userId);
  }

  getActiveExperiments(userId: string): RealityExperiment[] {
    return this.getUserExperiments(userId)
      .filter(exp => exp.status === 'active');
  }
}

export const realityCreationLab = new RealityCreationLab();