/**
 * 🧪 Soul Lab Protocol - Life as Experiment
 * 
 * Maya as lab assistant for the soul's experiments:
 * - Check in with observations
 * - Clarify hypotheses
 * - Calibrate next experiments
 * - Return to field work
 * 
 * Core: Your life is the lab, not our conversation
 */

import { Element } from "./resonanceEngine";

export interface SoulExperiment {
  phase: 'hypothesis' | 'testing' | 'observing' | 'integrating' | 'complete';
  fieldNotes: string[];
  experimentsRun: number;
  insightsGathered: string[];
  nextExperiment?: string;
}

export class SoulLabProtocol {
  
  /**
   * Invitation Phase - Draw them in with curiosity
   */
  inviteToLab(element: Element): string {
    const invitations: Record<Element, string> = {
      fire: "What experiment is your fire wanting to run?",
      water: "What emotional current are you researching?",
      earth: "What are you building in your life lab?",
      air: "What pattern are you tracking?",
      aether: "What mystery are you exploring?"
    };
    return invitations[element];
  }
  
  /**
   * Engagement Phase - Active experimentation dialogue
   */
  engageExperiment(notes: string, element: Element, phase: SoulExperiment['phase']): string {
    switch (phase) {
      case 'hypothesis':
        return this.formHypothesis(element);
      case 'testing':
        return this.supportTesting(element);
      case 'observing':
        return this.reflectObservations(element);
      case 'integrating':
        return this.synthesizeFindings(element);
      case 'complete':
        return this.celebrateCompletion(element);
    }
  }
  
  private formHypothesis(element: Element): string {
    const hypotheses: Record<Element, string> = {
      fire: "So your hypothesis is this fire leads somewhere new. How will you test it?",
      water: "You're wondering if feeling this fully changes things. What's your experiment?",
      earth: "You think building this creates stability. How will you know?",
      air: "Your theory is clarity emerges from this. How will you verify?",
      aether: "You sense a larger pattern. How will you explore it?"
    };
    return hypotheses[element];
  }
  
  private supportTesting(element: Element): string {
    const support: Record<Element, string> = {
      fire: "Good. Run that experiment with full energy. What will you watch for?",
      water: "Beautiful. Feel your way through it. What will tell you it's working?",
      earth: "Solid plan. Build it step by step. How will you measure progress?",
      air: "Clear approach. Think it through in action. What data will you gather?",
      aether: "Trust the mystery. Live into it. What will you notice?"
    };
    return support[element];
  }
  
  private reflectObservations(element: Element): string {
    const reflections: Record<Element, string> = {
      fire: "What did the fire show you when you followed it?",
      water: "What did you discover in the depths?",
      earth: "What actually happened when you built it?",
      air: "What patterns became clear?",
      aether: "What revealed itself in the space?"
    };
    return reflections[element];
  }
  
  private synthesizeFindings(element: Element): string {
    const synthesis: Record<Element, string> = {
      fire: "So the experiment showed you THIS. What's your next experiment?",
      water: "The feeling taught you THAT. What wants to be felt next?",
      earth: "You built it and learned THIS. What's the next foundation?",
      air: "The pattern revealed THAT. What new question emerged?",
      aether: "The mystery showed you THIS. What opens from here?"
    };
    return synthesis[element];
  }
  
  private celebrateCompletion(element: Element): string {
    const celebration: Record<Element, string> = {
      fire: "You ran the experiment! The fire knows more now. What ignites next?",
      water: "You felt it through! The water is wiser. What flows from here?",
      earth: "You built it! The foundation is real. What rises on it?",
      air: "You found clarity! The vision is yours. Where does it lead?",
      aether: "You lived the mystery! The space is known. What calls you now?"
    };
    return celebration[element];
  }
  
  /**
   * Redirection Phase - Send back to life lab
   */
  redirectToFieldWork(element: Element, experiment: string): string {
    const redirects: Record<Element, string> = {
      fire: `Take that spark into your week. Run the "${experiment}" experiment. Come back with what the fire teaches.`,
      water: `Let this flow into your days. Feel the "${experiment}" fully. Return with what the water shows.`,
      earth: `Build this in real life. Test "${experiment}" solidly. Come back with what actually happened.`,
      air: `Think this through in action. Track "${experiment}" clearly. Return with your observations.`,
      aether: `Live into this mystery. Be with "${experiment}" spaciously. Come back with what emerged.`
    };
    return redirects[element];
  }
  
  /**
   * Field Notes Check-in - When they return
   */
  reviewFieldNotes(element: Element): string {
    const reviews: Record<Element, string> = {
      fire: "Welcome back! What did your fire experiments reveal?",
      water: "Good to feel you here again. What did the water teach?",
      earth: "Solid return. What did you actually build?",
      air: "Clear to see you. What patterns did you track?",
      aether: "The space welcomes you. What mystery unfolded?"
    };
    return reviews[element];
  }
  
  /**
   * Lab Journal Prompts - For their own tracking
   */
  generateJournalPrompt(element: Element, phase: SoulExperiment['phase']): string {
    const prompts: Record<string, string> = {
      'fire-hypothesis': "What does my fire want to test this week?",
      'water-hypothesis': "What feeling am I ready to explore fully?",
      'earth-hypothesis': "What do I want to build and measure?",
      'air-hypothesis': "What pattern am I tracking?",
      'aether-hypothesis': "What mystery am I living into?",
      
      'fire-observing': "What happened when I followed the fire?",
      'water-observing': "What did I discover in the feeling?",
      'earth-observing': "What actually got built?",
      'air-observing': "What patterns became clear?",
      'aether-observing': "What emerged from the mystery?"
    };
    
    return prompts[`${element}-${phase}`] || "What am I learning?";
  }
  
  /**
   * Soul Lab Principles
   */
  getLabPrinciples(): string[] {
    return [
      "Your life is the laboratory",
      "Every day is an experiment",
      "Failures are data, not defeats",
      "Come back with field notes",
      "The soul knows through experience",
      "Test everything in the lab of life"
    ];
  }
}