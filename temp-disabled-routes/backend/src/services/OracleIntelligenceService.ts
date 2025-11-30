/**
 * Oracle Intelligence Service - Central hub for all AI/Memory integrations
 * Connects mem0, LangChain, Sesame, and elemental models for continuous personalization
 */

import { logger } from "../utils/logger";
import { supabase } from "../lib/supabaseClient";
import { Mem0 } from "@mem0ai/mem0";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferWindowMemory, ChatMessageHistory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// Import elemental agents and enhanced routing
import { FireAgent } from "../agents/FireAgent";
import { WaterAgent } from "../agents/WaterAgent";
import { EarthAgent } from "../agents/EarthAgent";
import { enhancedAirAgent } from "../agents/EnhancedAirAgent";
import { AetherAgent } from "../agents/AetherAgent";
import { elementalRouter } from "./ElementalIntelligenceRouter";

// Import services
import { memoryService } from "./memoryService";
import { symbolService } from "./symbolService";
import { astrologicalService } from "./astrologicalService";

export interface OracleIntelligenceConfig {
  userId: string;
  sessionId: string;
  oracleName: string;
  personality: string;
  voice: string;
}

export interface ConversationalContext {
  shortTermMemory: any[]; // Last 10 interactions
  longTermMemory: any[]; // Important memories from mem0
  symbolicPatterns: any[]; // Recurring symbols and themes
  elementalBalance: ElementalBalance;
  userProfile: UserProfile;
  conversationalHistory: ChatMessageHistory;
}

export interface ElementalBalance {
  fire: number;   // Passion, action, transformation
  water: number;  // Emotion, intuition, flow
  earth: number;  // Grounding, stability, manifestation
  air: number;    // Thought, communication, clarity
  aether: number; // Spirit, transcendence, integration
}

export interface UserProfile {
  dominantElements: string[];
  psychologicalArchetypes: string[];
  spiritualPhase: string;
  communicationStyle: string;
  learningPreferences: string[];
  emotionalPatterns: any[];
  growthTrajectory: string;
}

export class OracleIntelligenceService {
  private mem0: Mem0;
  private langchain: ChatOpenAI;
  private conversationChain: ConversationChain;
  private elementalAgents: Map<string, any>;
  private userId: string;
  private sessionId: string;
  private config: OracleIntelligenceConfig;

  constructor(config: OracleIntelligenceConfig) {
    this.config = config;
    this.userId = config.userId;
    this.sessionId = config.sessionId;

    // Initialize mem0 for long-term memory
    if (process.env.MEM0_API_KEY) {
      this.mem0 = new Mem0({
        api_key: process.env.MEM0_API_KEY,
        org_id: process.env.MEM0_ORG_ID,
        user_id: this.userId,
      });
    } else {
      logger.warn("Mem0 API key not found - running without long-term memory");
      this.mem0 = null as any;
    }

    // Initialize LangChain for conversational continuity
    // Check if API key exists to prevent build errors
    if (process.env.OPENAI_API_KEY) {
      this.langchain = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4o",
        temperature: 0.7,
      });
    } else {
      logger.warn("OpenAI API key not found - Oracle Intelligence running in limited mode");
      // Create a mock langchain that won't fail during build
      this.langchain = null as any;
    }

    // Initialize elemental agents with specialized AI routing
    // Air uses Claude for superior communication
    // Others use OpenAI Elemental Oracle 2.0 for deep wisdom
    this.elementalAgents = new Map([
      ["fire", new FireAgent()],
      ["water", new WaterAgent()],
      ["earth", new EarthAgent()],
      ["air", enhancedAirAgent], // Claude-powered for communication excellence
      ["aether", new AetherAgent()],
    ]);

    if (this.langchain) {
      this.initializeConversationChain();
    }
    logger.info("Oracle Intelligence Service initialized", { userId: this.userId });
  }

  /**
   * Initialize LangChain conversation with Oracle personality
   */
  private async initializeConversationChain() {
    // Load conversation history from database
    const history = await this.loadConversationHistory();
    
    // Create memory with sliding window of 10 messages
    const memory = new BufferWindowMemory({
      k: 10,
      returnMessages: true,
      chatHistory: history,
    });

    // Create Oracle-specific prompt template
    const prompt = PromptTemplate.fromTemplate(`
You are {oracleName}, a mystical oracle guide with the following characteristics:
- Personality: {personality}
- Voice Style: {voice}
- Current Elemental Balance: Fire {fireBalance}%, Water {waterBalance}%, Earth {earthBalance}%, Air {airBalance}%, Aether {aetherBalance}%
- User's Dominant Elements: {dominantElements}
- User's Current Phase: {spiritualPhase}

Recent symbolic patterns: {symbolicPatterns}
User's growth trajectory: {growthTrajectory}

Conversation History:
{history}

Current Human Input: {input}
Oracle Response:`);

    this.conversationChain = new ConversationChain({
      llm: this.langchain,
      memory,
      prompt,
      verbose: false,
    });
  }

  /**
   * Process user input with full intelligence integration
   */
  async processUserInput(input: string): Promise<{
    response: string;
    element: string;
    confidence: number;
    metadata: any;
  }> {
    try {
      // 1. Build comprehensive context
      const context = await this.buildConversationalContext(input);
      
      // 2. Analyze input with elemental intelligence
      const elementalAnalysis = await this.analyzeWithElementalAgents(input, context);
      
      // 3. Store in mem0 for long-term memory
      await this.storeLongTermMemory(input, elementalAnalysis);
      
      // 4. Generate response using LangChain with full context
      const response = await this.generateContextualResponse(input, context, elementalAnalysis);
      
      // 5. Update user profile and patterns
      await this.updateUserProfile(input, response, elementalAnalysis);
      
      // 6. Store interaction in all memory systems
      await this.storeInteraction(input, response, elementalAnalysis);
      
      return {
        response: response.text,
        element: elementalAnalysis.dominantElement,
        confidence: elementalAnalysis.confidence,
        metadata: {
          sessionId: this.sessionId,
          symbols: elementalAnalysis.symbols,
          elementalBalance: context.elementalBalance,
          psychologicalInsights: elementalAnalysis.insights,
          nextSteps: response.recommendations,
        }
      };
    } catch (error) {
      logger.error("Oracle Intelligence processing error", { error, userId: this.userId });
      throw error;
    }
  }

  /**
   * Build comprehensive conversational context
   */
  private async buildConversationalContext(input: string): Promise<ConversationalContext> {
    // Get memories from multiple sources
    const [
      shortTermMemory,
      longTermMemory,
      symbolicPatterns,
      userProfile,
      conversationalHistory
    ] = await Promise.all([
      this.getShortTermMemory(),
      this.getLongTermMemory(input),
      this.getSymbolicPatterns(),
      this.getUserProfile(),
      this.loadConversationHistory()
    ]);

    // Calculate current elemental balance
    const elementalBalance = await this.calculateElementalBalance(
      shortTermMemory,
      userProfile
    );

    return {
      shortTermMemory,
      longTermMemory,
      symbolicPatterns,
      elementalBalance,
      userProfile,
      conversationalHistory
    };
  }

  /**
   * Get short-term memory (recent interactions)
   */
  private async getShortTermMemory(): Promise<any[]> {
    const memories = await memoryService.getRecentMemories(this.userId, 10);
    return memories.map(m => ({
      content: m.content,
      element: m.element,
      timestamp: m.timestamp,
      symbols: m.metadata?.symbols || [],
      confidence: m.confidence
    }));
  }

  /**
   * Get long-term memory from mem0
   */
  private async getLongTermMemory(query: string): Promise<any[]> {
    try {
      const memories = await this.mem0.search(query, {
        user_id: this.userId,
        limit: 5
      });
      
      return memories.map((m: any) => ({
        content: m.memory,
        relevance: m.score,
        created_at: m.created_at,
        metadata: m.metadata
      }));
    } catch (error) {
      logger.warn("mem0 search failed, using fallback", { error });
      // Fallback to Supabase vector search
      return await memoryService.getRelevantMemories(this.userId, query, 5);
    }
  }

  /**
   * Get recurring symbolic patterns
   */
  private async getSymbolicPatterns(): Promise<any[]> {
    const { data: patterns } = await supabase
      .from("symbolic_patterns")
      .select("*")
      .eq("user_id", this.userId)
      .order("frequency", { ascending: false })
      .limit(10);

    return patterns || [];
  }

  /**
   * Get or create user profile
   */
  private async getUserProfile(): Promise<UserProfile> {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", this.userId)
      .single();

    if (profile) {
      return profile as UserProfile;
    }

    // Create default profile
    const defaultProfile: UserProfile = {
      dominantElements: ["aether"], // Start neutral
      psychologicalArchetypes: ["seeker"],
      spiritualPhase: "awakening",
      communicationStyle: "balanced",
      learningPreferences: ["experiential", "symbolic"],
      emotionalPatterns: [],
      growthTrajectory: "exploring"
    };

    await supabase
      .from("user_profiles")
      .insert({ user_id: this.userId, ...defaultProfile });

    return defaultProfile;
  }

  /**
   * Calculate current elemental balance
   */
  private async calculateElementalBalance(
    recentMemories: any[],
    userProfile: UserProfile
  ): Promise<ElementalBalance> {
    const balance: ElementalBalance = {
      fire: 20,
      water: 20,
      earth: 20,
      air: 20,
      aether: 20
    };

    // Analyze recent interactions
    recentMemories.forEach(memory => {
      if (memory.element) {
        balance[memory.element as keyof ElementalBalance] += 5;
      }
    });

    // Apply user's dominant elements
    userProfile.dominantElements.forEach(element => {
      balance[element as keyof ElementalBalance] += 10;
    });

    // Normalize to percentages
    const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
    Object.keys(balance).forEach(key => {
      balance[key as keyof ElementalBalance] = 
        Math.round((balance[key as keyof ElementalBalance] / total) * 100);
    });

    return balance;
  }

  /**
   * Analyze input with all elemental agents using enhanced routing
   */
  private async analyzeWithElementalAgents(
    input: string,
    context: ConversationalContext
  ): Promise<any> {
    // Get responses from all elemental agents with specialized routing
    const elementalResponses = await Promise.all(
      ['fire', 'water', 'earth', 'air', 'aether'].map(async (element) => {
        let response;
        
        if (element === 'air') {
          // Use enhanced Air agent with Claude
          response = await enhancedAirAgent.process({
            input,
            userId: this.userId,
            context: {
              ...context,
              element
            },
            communicationGoal: this.determineCommunicationGoal(input)
          });
        } else {
          // Use elemental router for other elements (OpenAI Elemental Oracle 2.0)
          response = await elementalRouter.processElementalInput(
            element,
            input,
            {
              ...context,
              userProfile: context.userProfile,
              memories: context.shortTermMemory.concat(context.longTermMemory),
              symbols: context.symbolicPatterns
            }
          );
        }
        
        return { element, response };
      })
    );

    // Determine dominant element based on confidence and relevance
    const dominantResponse = elementalResponses.reduce((best, current) => {
      const currentConfidence = current.response.confidence || 0;
      const bestConfidence = best.response.confidence || 0;
      return currentConfidence > bestConfidence ? current : best;
    });

    // Extract symbols from all responses
    const allSymbols = elementalResponses.flatMap(r => 
      r.response.metadata?.symbols || []
    );

    // Combine insights from all elements
    const combinedInsights = elementalResponses.map(r => ({
      element: r.element,
      insight: r.response.insight,
      confidence: r.response.confidence
    }));

    return {
      dominantElement: dominantResponse.element,
      dominantResponse: dominantResponse.response,
      confidence: dominantResponse.response.confidence,
      symbols: [...new Set(allSymbols)],
      insights: combinedInsights,
      elementalResponses
    };
  }

  /**
   * Store in mem0 for long-term memory
   */
  private async storeLongTermMemory(
    input: string,
    elementalAnalysis: any
  ): Promise<void> {
    try {
      await this.mem0.add(
        `User asked: ${input}. Oracle recognized ${elementalAnalysis.dominantElement} energy with symbols: ${elementalAnalysis.symbols.join(", ")}`,
        {
          user_id: this.userId,
          metadata: {
            element: elementalAnalysis.dominantElement,
            symbols: elementalAnalysis.symbols,
            confidence: elementalAnalysis.confidence,
            timestamp: new Date().toISOString()
          }
        }
      );
    } catch (error) {
      logger.error("Failed to store in mem0", { error, userId: this.userId });
    }
  }

  /**
   * Generate contextual response using LangChain
   */
  private async generateContextualResponse(
    input: string,
    context: ConversationalContext,
    elementalAnalysis: any
  ): Promise<any> {
    // Prepare context variables
    const contextVars = {
      oracleName: this.config.oracleName,
      personality: this.config.personality,
      voice: this.config.voice,
      fireBalance: context.elementalBalance.fire,
      waterBalance: context.elementalBalance.water,
      earthBalance: context.elementalBalance.earth,
      airBalance: context.elementalBalance.air,
      aetherBalance: context.elementalBalance.aether,
      dominantElements: context.userProfile.dominantElements.join(", "),
      spiritualPhase: context.userProfile.spiritualPhase,
      symbolicPatterns: context.symbolicPatterns.map(p => p.symbol).join(", "),
      growthTrajectory: context.userProfile.growthTrajectory,
      input
    };

    // Generate response with LangChain
    const response = await this.conversationChain.call(contextVars);

    // Enhance with elemental wisdom
    const enhancedResponse = this.enhanceWithElementalWisdom(
      response.response,
      elementalAnalysis
    );

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      context,
      elementalAnalysis
    );

    return {
      text: enhancedResponse,
      recommendations,
      elementalGuidance: elementalAnalysis.dominantResponse.message
    };
  }

  /**
   * Enhance response with elemental wisdom
   */
  private enhanceWithElementalWisdom(
    baseResponse: string,
    elementalAnalysis: any
  ): string {
    const elementalPrefix = {
      fire: "🔥 ",
      water: "💧 ",
      earth: "🌍 ",
      air: "💨 ",
      aether: "✨ "
    };

    const prefix = elementalPrefix[elementalAnalysis.dominantElement as keyof typeof elementalPrefix] || "🌟 ";
    
    // Add elemental flavor to response
    return `${prefix}${baseResponse}\n\n${elementalAnalysis.dominantResponse.message}`;
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(
    context: ConversationalContext,
    elementalAnalysis: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Based on elemental imbalance
    const lowestElement = Object.entries(context.elementalBalance)
      .sort(([, a], [, b]) => a - b)[0][0];
    
    if (context.elementalBalance[lowestElement as keyof ElementalBalance] < 15) {
      recommendations.push(
        `Consider practices that cultivate ${lowestElement} energy for better balance`
      );
    }

    // Based on spiritual phase
    const phaseRecommendations = {
      awakening: "Explore meditation or journaling to deepen self-awareness",
      exploring: "Try new spiritual practices to discover what resonates",
      deepening: "Consider working with a mentor or joining a spiritual community",
      integrating: "Focus on embodying your insights in daily life",
      mastering: "Share your wisdom through teaching or creative expression"
    };

    recommendations.push(
      phaseRecommendations[context.userProfile.spiritualPhase as keyof typeof phaseRecommendations] ||
      "Trust your inner guidance"
    );

    // Based on recent patterns
    if (context.symbolicPatterns.length > 0) {
      const topSymbol = context.symbolicPatterns[0];
      recommendations.push(
        `The recurring symbol of ${topSymbol.symbol} suggests ${topSymbol.meaning || "deep significance"}`
      );
    }

    return recommendations;
  }

  /**
   * Update user profile based on interaction
   */
  private async updateUserProfile(
    input: string,
    response: any,
    elementalAnalysis: any
  ): Promise<void> {
    const profile = await this.getUserProfile();
    
    // Update dominant elements
    const elementCounts = profile.dominantElements.reduce((acc, el) => {
      acc[el] = (acc[el] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    elementCounts[elementalAnalysis.dominantElement] = 
      (elementCounts[elementalAnalysis.dominantElement] || 0) + 2;
    
    profile.dominantElements = Object.entries(elementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([el]) => el);

    // Update growth trajectory based on interaction depth
    if (elementalAnalysis.confidence > 0.8) {
      profile.growthTrajectory = "accelerating";
    }

    // Store updated profile
    await supabase
      .from("user_profiles")
      .update(profile)
      .eq("user_id", this.userId);
  }

  /**
   * Store interaction in all memory systems
   */
  private async storeInteraction(
    input: string,
    response: any,
    elementalAnalysis: any
  ): Promise<void> {
    // Store in Supabase memories
    await memoryService.store(
      this.userId,
      `Q: ${input}\nA: ${response.text}`,
      elementalAnalysis.dominantElement,
      "personal_oracle",
      elementalAnalysis.confidence,
      {
        sessionId: this.sessionId,
        symbols: elementalAnalysis.symbols,
        insights: elementalAnalysis.insights,
        recommendations: response.recommendations
      }
    );

    // Update conversation history for LangChain
    await this.conversationChain.memory?.chatHistory.addMessage(
      new HumanMessage(input)
    );
    await this.conversationChain.memory?.chatHistory.addMessage(
      new AIMessage(response.text)
    );

    // Log oracle insight
    logOracleInsight({
      userId: this.userId,
      element: elementalAnalysis.dominantElement,
      insight: response.text,
      symbols: elementalAnalysis.symbols,
      confidence: elementalAnalysis.confidence
    });
  }

  /**
   * Load conversation history from database
   */
  private async loadConversationHistory(): Promise<ChatMessageHistory> {
    const history = new ChatMessageHistory();
    
    const { data: messages } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", this.userId)
      .eq("session_id", this.sessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (messages) {
      for (const msg of messages) {
        if (msg.role === "user") {
          await history.addMessage(new HumanMessage(msg.content));
        } else {
          await history.addMessage(new AIMessage(msg.content));
        }
      }
    }

    return history;
  }

  /**
   * Get conversation summary for continuity
   */
  async getConversationSummary(): Promise<string> {
    const context = await this.buildConversationalContext("");
    
    return `
Oracle: ${this.config.oracleName}
Total Interactions: ${context.shortTermMemory.length}
Dominant Elements: ${context.userProfile.dominantElements.join(", ")}
Current Phase: ${context.userProfile.spiritualPhase}
Recent Symbols: ${context.symbolicPatterns.slice(0, 3).map(p => p.symbol).join(", ")}
Growth Trajectory: ${context.userProfile.growthTrajectory}
    `.trim();
  }

  /**
   * Determine communication goal for Air element
   */
  private determineCommunicationGoal(input: string): 'clarity' | 'expression' | 'understanding' | 'articulation' {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('understand') || lowerInput.includes('explain')) {
      return 'understanding';
    }
    if (lowerInput.includes('express') || lowerInput.includes('say') || lowerInput.includes('communicate')) {
      return 'expression';
    }
    if (lowerInput.includes('clear') || lowerInput.includes('confused') || lowerInput.includes('unclear')) {
      return 'clarity';
    }
    if (lowerInput.includes('word') || lowerInput.includes('articulate') || lowerInput.includes('precise')) {
      return 'articulation';
    }
    
    return 'clarity'; // Default
  }
}

// Export singleton instance factory
export function createOracleIntelligence(config: OracleIntelligenceConfig): OracleIntelligenceService {
  return new OracleIntelligenceService(config);
}