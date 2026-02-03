"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalOracle = exports.PersonalOracleAgent = void 0;
const oracleAgent_1 = require("./oracleAgent");
const memoryService_1 = require("../../services/memoryService");
const oracleLogger_1 = require("../utils/oracleLogger");
const facetUtil_1 = require("../../utils/facetUtil");
const fireAgent_1 = require("./elemental/fireAgent");
const waterAgent_1 = require("./elemental/waterAgent");
const earthAgent_1 = require("./elemental/earthAgent");
const airAgent_1 = require("./elemental/airAgent");
const aetherAgent_1 = require("./elemental/aetherAgent");
const guideAgent_1 = require("./guideAgent");
const mentorAgent_1 = require("./mentorAgent");
const DreamAgent_1 = require("./DreamAgent");
const feedbackPrompts_1 = require("../../constants/feedbackPrompts");
const logger_1 = require("../../utils/logger");
const shadowWorkModule_1 = require("../../modules/shadowWorkModule");
// Simple query scoring function
function scoreQuery(input) {
    const lower = input.toLowerCase();
    return {
        fire: lower.includes("passion") ||
            lower.includes("energy") ||
            lower.includes("action")
            ? 1
            : 0,
        water: lower.includes("emotion") ||
            lower.includes("feeling") ||
            lower.includes("flow")
            ? 1
            : 0,
        earth: lower.includes("ground") ||
            lower.includes("practical") ||
            lower.includes("stable")
            ? 1
            : 0,
        air: lower.includes("think") ||
            lower.includes("idea") ||
            lower.includes("communicate")
            ? 1
            : 0,
        aether: 0.5, // default baseline
    };
}
class PersonalOracleAgent extends oracleAgent_1.OracleAgent {
    constructor() {
        super({ debug: false });
        this.fire = new fireAgent_1.FireAgent();
        this.water = new waterAgent_1.WaterAgent();
        this.earth = new earthAgent_1.EarthAgent();
        this.air = new airAgent_1.AirAgent();
        this.aether = new aetherAgent_1.AetherAgent();
        this.guide = new guideAgent_1.GuideAgent();
        this.mentor = new mentorAgent_1.MentorAgent();
        this.dream = new DreamAgent_1.DreamAgent();
    }
    // Add missing methods referenced in services
    async process(query) {
        return this.processQuery(query);
    }
    async processMessage(message, userId) {
        return this.processQuery({ input: message, userId });
    }
    async getTransformationMetrics(userId) {
        return {
            metricsAvailable: false,
            message: "Transformation metrics not yet implemented",
        };
    }
    async activateRetreatMode(userId, options) {
        return {
            retreatModeActive: false,
            message: "Retreat mode not yet implemented",
        };
    }
    async offerWeeklyReflection(userId, weekData) {
        return {
            reflectionOffered: false,
            message: "Weekly reflection not yet implemented",
        };
    }
    async processQuery(query) {
        const input = typeof query === "string" ? query : query.input;
        const userId = typeof query === "string" ? "anonymous" : query.userId;
        logger_1.logger.info("🔮 PersonalOracleAgent activated", { userId });
        const memories = await (0, memoryService_1.getRelevantMemories)(userId, input, 5);
        const lower = input.toLowerCase();
        // 1️⃣ Symbolic cue routing
        if (lower.includes("dream")) {
            return await this.wrapSpecialAgent(this.dream, { input, userId }, memories);
        }
        if (["coach", "mentor", "goal", "plan"].some((k) => lower.includes(k))) {
            return await this.wrapSpecialAgent(this.mentor, { input, userId }, memories);
        }
        // Relationship agent not implemented yet
        // if (["relationship", "partner", "conflict"].some(k => lower.includes(k))) {
        //   return await this.wrapAgent(this.relationship, query, memories);
        // }
        if (["guidance", "support", "direction"].some((k) => lower.includes(k))) {
            return await this.wrapSpecialAgent(this.guide, { input, userId }, memories);
        }
        // Adjuster agent not implemented yet
        // if (["rupture", "disruption", "realign", "fracture"].some(k => lower.includes(k))) {
        //   return await this.wrapAgent(this.adjuster, query, memories);
        // }
        // 2️⃣ Shadow work
        const shadow = await (0, shadowWorkModule_1.runShadowWork)(input, userId);
        if (shadow) {
            return {
                content: shadow.content || "Shadow work insight provided",
                provider: "shadow-agent",
                model: "shadow-work-v1",
                confidence: 0.8,
                metadata: {
                    ...shadow.metadata,
                    feedbackPrompt: feedbackPrompts_1.feedbackPrompts.shadow,
                },
            };
        }
        // 3️⃣ Elemental routing fallback
        const scores = scoreQuery(input);
        let best = "aether";
        for (const [k, v] of Object.entries(scores)) {
            if (v > scores[best])
                best = k;
        }
        const agent = {
            fire: this.fire,
            water: this.water,
            earth: this.earth,
            air: this.air,
            aether: this.aether,
        }[best];
        if (!agent) {
            throw new Error(`No agent found for element: ${best}`);
        }
        return await this.wrapAgent(agent, query, memories);
    }
    async wrapAgent(agent, query, context) {
        const input = typeof query === "string" ? query : query.input;
        const userId = typeof query === "string" ? "anonymous" : query.userId;
        // Handle different agent query signatures
        let response;
        if ("processExtendedQuery" in agent &&
            typeof agent.processExtendedQuery === "function") {
            // For ArchetypeAgent-based agents that expect extended queries
            const aiResponse = await agent.processExtendedQuery({
                input,
                userId,
            });
            response = {
                content: aiResponse.content,
                response: aiResponse.content,
                confidence: aiResponse.confidence,
                metadata: aiResponse.metadata,
                provider: aiResponse.provider,
                model: aiResponse.model,
            };
        }
        else if (agent.processQuery.length > 1 ||
            agent.constructor.name === "GuideAgent" ||
            agent.constructor.name === "MentorAgent" ||
            agent.constructor.name === "DreamAgent") {
            // For agents that expect object-style queries
            response = await agent.processQuery({ input, userId });
        }
        else {
            // For base OracleAgent that expects string queries
            response = await agent.processQuery(input);
        }
        const facet = await (0, facetUtil_1.detectFacetFromInput)(input);
        response.metadata = {
            ...response.metadata,
            facet,
            provider: agent.constructor.name,
        };
        response.metadata = {
            ...response.metadata,
            feedbackPrompt: feedbackPrompts_1.feedbackPrompts.elemental,
        };
        await (0, memoryService_1.storeMemoryItem)({
            userId,
            content: response.content,
            element: response.metadata?.element,
            sourceAgent: response.metadata?.provider,
            confidence: response.confidence,
            metadata: response.metadata,
        });
        await (0, oracleLogger_1.logOracleInsight)({
            anon_id: userId,
            archetype: response.metadata?.archetype || "Oracle",
            element: response.metadata?.element || "aether",
            insight: {
                message: response.content,
                raw_input: input,
            },
            emotion: response.confidence ?? 0.9,
            phase: response.metadata?.phase || "guidance",
            context,
        });
        return response;
    }
    // Special wrapper for agents that don't fit the OracleAgent signature
    async wrapSpecialAgent(agent, query, context) {
        const { input, userId } = query;
        const response = await agent.processQuery(query);
        const facet = await (0, facetUtil_1.detectFacetFromInput)(input);
        // Ensure response has required fields
        const normalizedResponse = {
            content: response.content || response.response || "No response provided",
            response: response.content || response.response || "No response provided", // Legacy compatibility
            confidence: response.confidence || 0.8,
            metadata: {
                ...response.metadata,
                facet,
                provider: agent.constructor.name,
                feedbackPrompt: feedbackPrompts_1.feedbackPrompts.elemental,
            },
        };
        await (0, memoryService_1.storeMemoryItem)({
            userId,
            content: normalizedResponse.content,
            element: normalizedResponse.metadata?.element,
            sourceAgent: normalizedResponse.metadata?.provider,
            confidence: normalizedResponse.confidence,
            metadata: normalizedResponse.metadata,
        });
        await (0, oracleLogger_1.logOracleInsight)({
            anon_id: userId,
            archetype: normalizedResponse.metadata?.archetype || "Oracle",
            element: normalizedResponse.metadata?.element || "aether",
            insight: {
                message: normalizedResponse.content,
                raw_input: input,
            },
            emotion: normalizedResponse.confidence ?? 0.9,
            phase: normalizedResponse.metadata?.phase || "guidance",
            context,
        });
        return normalizedResponse;
    }
}
exports.PersonalOracleAgent = PersonalOracleAgent;
exports.personalOracle = new PersonalOracleAgent();
