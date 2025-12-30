"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentOrchestrator = exports.AgentOrchestrator = void 0;
// services/agentOrchestrator.ts - Dual Agent Orchestration System
const fireAgent_1 = require("../core/agents/elemental/fireAgent");
const waterAgent_1 = require("../core/agents/elemental/waterAgent");
class AgentOrchestrator {
    constructor() {
        this.archetypalIntentAnalyzer = new ArchetypalIntentAnalyzer();
        this.responseSynthesizer = new ResponseSynthesizer();
        this.collectiveMemory = new Map();
        this.fireAgent = new fireAgent_1.FireAgent();
        this.waterAgent = new waterAgent_1.WaterAgent();
    }
    async processQuery(input, userContext) {
        // Analyze archetypal intent
        const intent = this.archetypalIntentAnalyzer.analyze(input);
        // Determine orchestration strategy
        const strategy = this.determineOrchestrationStrategy(intent, userContext);
        // Get responses from relevant agents
        const responses = await this.gatherAgentResponses(input, intent, userContext, strategy);
        // Synthesize collective response
        const synthesis = await this.responseSynthesizer.synthesize(responses, intent, strategy);
        // Update collective memory
        this.updateCollectiveMemory(input, responses, synthesis, userContext);
        return synthesis;
    }
    determineOrchestrationStrategy(intent, userContext) {
        // Single agent strategies
        if (intent.confidence > 0.8 && !intent.secondary) {
            return intent.primary === &quot;fire&quot; ? "fire_lead" : "water_lead";
        }
        // Dual agent strategies
        if (intent.primary === "fire" && intent.secondary === "water") {
            return "fire_water_synthesis";
        }
        if (intent.primary === "water" && intent.secondary === "fire") {
            return "water_fire_synthesis";
        }
        // Contextual strategies
        const recentHistory = userContext?.archetypalHistory?.slice(-3) || [];
        const recentFireCount = recentHistory.filter((h) => h.primary === "fire").length;
        const recentWaterCount = recentHistory.filter((h) => h.primary === "water").length;
        // Balance archetypal exposure
        if (recentFireCount > recentWaterCount + 1) {
            return "water_balance";
        }
        if (recentWaterCount > recentFireCount + 1) {
            return "fire_balance";
        }
        // Default to synthesis
        return "dual_synthesis";
    }
    async gatherAgentResponses(input, intent, userContext, strategy) {
        const responses = {};
        // Always get primary agent response
        if (intent.primary === "fire" || strategy?.includes("fire")) {
            try {
                responses.fire = await this.fireAgent.processQuery(input);
            }
            catch (error) {
                console.error("Fire agent error:", error);
            }
        }
        if (intent.primary === "water" || strategy?.includes("water")) {
            try {
                responses.water = await this.waterAgent.processQuery(input);
            }
            catch (error) {
                console.error("Water agent error:", error);
            }
        }
        // Get secondary agent if synthesis strategy
        if (strategy?.includes("synthesis") || strategy?.includes("balance")) {
            if (!responses.fire) {
                try {
                    responses.fire = await this.fireAgent.processQuery(input);
                }
                catch (error) {
                    console.error("Fire agent secondary error:", error);
                }
            }
            if (!responses.water) {
                try {
                    responses.water = await this.waterAgent.processQuery(input);
                }
                catch (error) {
                    console.error("Water agent secondary error:", error);
                }
            }
        }
        return responses;
    }
    updateCollectiveMemory(input, responses, synthesis, userContext) {
        const memoryKey = userContext?.sessionId || "global";
        const sessionMemory = this.collectiveMemory.get(memoryKey) || {
            interactions: [],
            archetypalPatterns: [],
            emergentWisdom: [],
        };
        sessionMemory.interactions.push({
            input,
            responses,
            synthesis: synthesis.synthesis,
            timestamp: new Date().toISOString(),
        });
        // Track archetypal patterns
        sessionMemory.archetypalPatterns.push({
            primary: synthesis.primaryAgent,
            secondary: synthesis.secondaryAgent,
            balance: synthesis.archetypalBalance,
        });
        // Limit memory size
        if (sessionMemory.interactions.length > 20) {
            sessionMemory.interactions = sessionMemory.interactions.slice(-15);
        }
        this.collectiveMemory.set(memoryKey, sessionMemory);
    }
    async getArchetypalInsights(userContext) {
        const memoryKey = userContext?.sessionId || "global";
        const sessionMemory = this.collectiveMemory.get(memoryKey);
        if (!sessionMemory) {
            return {
                archetypalBalance: { fire: 0.5, water: 0.5 },
                dominantPatterns: [],
                emergentWisdom: "Your journey is just beginning. Both fire and water energies await your exploration.",
            };
        }
        // Calculate archetypal balance over time
        const patterns = sessionMemory.archetypalPatterns;
        const avgFire = patterns.reduce((sum, p) => sum + p.balance.fire, 0) / patterns.length;
        const avgWater = patterns.reduce((sum, p) => sum + p.balance.water, 0) / patterns.length;
        // Identify dominant patterns
        const agentCounts = patterns.reduce((counts, p) => {
            counts[p.primary] = (counts[p.primary] || 0) + 1;
            return counts;
        }, {});
        const dominantPatterns = Object.entries(agentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([agent, count]) => ({ agent, frequency: count / patterns.length }));
        // Generate emergent wisdom
        const emergentWisdom = this.generateEmergentWisdom(avgFire, avgWater, dominantPatterns);
        return {
            archetypalBalance: { fire: avgFire, water: avgWater },
            dominantPatterns,
            emergentWisdom,
        };
    }
    generateEmergentWisdom(fireBalance, waterBalance, patterns) {
        const dominant = patterns[0]?.agent;
        const balance = Math.abs(fireBalance - waterBalance);
        if (balance < 0.2) {
            return "You're finding beautiful balance between vision and flow, action and feeling. This integration is your gift.";
        }
        if (fireBalance > waterBalance + 0.3) {
            return "Your fire burns bright with vision and action. Consider how water's wisdom might deepen and sustain your flames.";
        }
        if (waterBalance > fireBalance + 0.3) {
            return "You move with water's deep wisdom and emotional intelligence. Your fire energy awaits integration to manifest your visions.";
        }
        return "Your archetypal journey is unfolding uniquely. Trust the dance between different energies within you.";
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
class ArchetypalIntentAnalyzer {
    analyze(input) {
        const lowerInput = input.toLowerCase();
        const words = lowerInput.split(" ");
        // Fire keywords
        const fireKeywords = [
            "vision",
            "create",
            "passion",
            "action",
            "dream",
            "manifest",
            "power",
            "transform",
            "ignite",
            "spark",
            "burn",
            "energy",
            "drive",
            "ambition",
        ];
        // Water keywords
        const waterKeywords = [
            "feel",
            "emotion",
            "flow",
            "heart",
            "heal",
            "intuition",
            "sense",
            "emotional",
            "relationship",
            "connect",
            "depth",
            "compassion",
            "empathy",
        ];
        const fireScore = this.calculateKeywordScore(words, fireKeywords);
        const waterScore = this.calculateKeywordScore(words, waterKeywords);
        // Determine primary and secondary archetypes
        if (fireScore > waterScore) {
            const confidence = fireScore / (fireScore + waterScore);
            const secondary = waterScore > 0.2 ? "water" : undefined;
            return {
                primary: "fire",
                secondary,
                confidence,
                reasoning: this.generateReasoning("fire", fireScore, waterScore, words, fireKeywords),
            };
        }
        else if (waterScore > fireScore) {
            const confidence = waterScore / (fireScore + waterScore);
            const secondary = fireScore > 0.2 ? "fire" : undefined;
            return {
                primary: "water",
                secondary,
                confidence,
                reasoning: this.generateReasoning("water", waterScore, fireScore, words, waterKeywords),
            };
        }
        else {
            // Balanced or unclear - default to water for emotional processing
            return {
                primary: "water",
                secondary: "fire",
                confidence: 0.5,
                reasoning: [
                    "Balanced energy detected",
                    "Defaulting to emotional processing first",
                ],
            };
        }
    }
    calculateKeywordScore(words, keywords) {
        const matches = words.filter((word) => keywords.some((keyword) => word.includes(keyword) || keyword.includes(word)));
        return matches.length / words.length;
    }
    generateReasoning(primary, primaryScore, secondaryScore, words, keywords) {
        const matchedKeywords = words.filter((word) => keywords.some((keyword) => word.includes(keyword) || keyword.includes(word)));
        return [
            `Primary archetype: ${primary} (score: ${primaryScore.toFixed(2)})`,
            `Matched keywords: ${matchedKeywords.join(", ")}`,
            `Secondary energy: ${secondaryScore.toFixed(2)}`,
        ];
    }
}
class ResponseSynthesizer {
    async synthesize(responses, intent, strategy) {
        const { fire, water } = responses;
        // Calculate archetypal balance
        const archetypalBalance = this.calculateArchetypalBalance(fire, water, intent);
        // Generate synthesis based on strategy
        const synthesis = await this.generateSynthesis(fire, water, intent, strategy);
        // Determine primary and secondary agents
        const primaryAgent = intent.primary;
        const secondaryAgent = intent.secondary;
        // Generate collective wisdom
        const collectiveWisdom = this.generateCollectiveWisdom(fire, water, intent);
        return {
            primaryAgent,
            secondaryAgent,
            synthesis,
            individualResponses: { fire, water },
            archetypalBalance,
            collectiveWisdom,
            metadata: {
                orchestrationStrategy: strategy,
                wisdomVector: this.determineWisdomVector(fire, water),
                transformationGoal: this.determineTransformationGoal(fire, water, intent),
                audioUrl: fire?.metadata?.audioUrl || water?.metadata?.audioUrl,
            },
        };
    }
    calculateArchetypalBalance(fire, water, intent) {
        // Base balance on intent confidence
        let fireWeight = intent.primary === "fire" ? intent.confidence : 1 - intent.confidence;
        let waterWeight = intent.primary === "water" ? intent.confidence : 1 - intent.confidence;
        // Adjust based on response quality/relevance
        if (fire?.metadata?.authenticityLevel) {
            fireWeight *= fire.metadata.authenticityLevel;
        }
        if (water?.metadata?.authenticityLevel) {
            waterWeight *= water.metadata.authenticityLevel;
        }
        // Normalize
        const total = fireWeight + waterWeight;
        return {
            fire: fireWeight / total,
            water: waterWeight / total,
        };
    }
    async generateSynthesis(fire, water, intent, strategy) {
        if (strategy === "fire_lead" && fire) {
            return fire.message;
        }
        if (strategy === "water_lead" && water) {
            return water.message;
        }
        // Synthesis strategies
        if (fire && water) {
            const fireMessage = fire.message || "";
            const waterMessage = water.message || "";
            if (strategy === "fire_water_synthesis") {
                return `${fireMessage}\n\nAnd as your vision clarifies, your emotional wisdom adds: ${waterMessage}`;
            }
            if (strategy === "water_fire_synthesis") {
                return `${waterMessage}\n\nAs you honor these feelings, your creative fire responds: ${fireMessage}`;
            }
            // Default dual synthesis
            return `Your fire energy says: ${fireMessage}\n\nYour water wisdom adds: ${waterMessage}\n\nTogether, they invite you to honor both vision and feeling as you move forward.`;
        }
        // Fallback to available response
        return (fire?.message ||
            water?.message ||
            "I'm here to witness your journey with both fire and water wisdom.");
    }
    generateCollectiveWisdom(fire, water, intent) {
        const wisdomTemplates = {
            fire_dominant: "Your fire energy is strong right now. Let your emotions fuel rather than overwhelm your vision.",
            water_dominant: "Your emotional wisdom is flowing. Trust how it can activate and direct your creative power.",
            balanced: "You're integrating both vision and feeling beautifully. This is the path of wholeness.",
            evolving: "I see both your creative fire and emotional depth evolving. Trust this archetypal dance.",
        };
        if (intent.confidence > 0.8) {
            return intent.primary === "fire"
                ? wisdomTemplates.fire_dominant
                : wisdomTemplates.water_dominant;
        }
        if (intent.secondary) {
            return wisdomTemplates.balanced;
        }
        return wisdomTemplates.evolving;
    }
    determineWisdomVector(fire, water) {
        if (fire?.wisdomVector && water?.wisdomVector) {
            if (fire.wisdomVector === water.wisdomVector) {
                return fire.wisdomVector;
            }
            return "synthesis";
        }
        return fire?.wisdomVector || water?.wisdomVector || "sensing";
    }
    determineTransformationGoal(fire, water, intent) {
        const fireGoal = fire?.metadata?.transformationGoal;
        const waterGoal = water?.metadata?.transformationGoal;
        if (fireGoal && waterGoal) {
            return `${fireGoal}_${waterGoal}_integration`;
        }
        return fireGoal || waterGoal || "archetypal_integration";
    }
}
exports.agentOrchestrator = new AgentOrchestrator();
