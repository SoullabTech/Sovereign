"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DreamAgent = void 0;
const oracleAgent_1 = require("./oracleAgent");
const oracleLogger_1 = require("../utils/oracleLogger");
const MemoryModule = __importStar(require("../utils/memoryModule"));
const modelService_1 = __importDefault(require("../../utils/modelService"));
/**
 * DreamAgent: Embodies symbolic guidance, imagination, and messages from the subconscious.
 */
class DreamAgent extends oracleAgent_1.OracleAgent {
    constructor() {
        super({ debug: false });
    }
    async processQuery(query) {
        const contextMemory = MemoryModule.getRecentEntries(2);
        const dreamPrompt = `You are an oracle of dreams. Interpret the symbols and metaphors in the message with mystical depth.`;
        const contextHeader = contextMemory.length
            ? `🌙 Dream echoes:\n${contextMemory.map((e) => `- ${e.response}`).join("\n")}\n\n`
            : "";
        const augmentedInput = `${dreamPrompt}\n\n${contextHeader}${query.input}`;
        const augmentedQuery = {
            ...query,
            input: augmentedInput,
        };
        const baseResponse = await modelService_1.default.getResponse(augmentedQuery);
        const personalityFlair = `\n\n🌀 What stirs in dreams often stirs the soul.`;
        const enhancedResponse = `${baseResponse.response}${personalityFlair}`;
        MemoryModule.addEntry({
            timestamp: new Date().toISOString(),
            query: query.input,
            response: enhancedResponse,
        });
        await (0, oracleLogger_1.logOracleInsight)({
            anon_id: query.userId || null,
            archetype: baseResponse.metadata?.archetype || "Dreamer",
            element: "Aether",
            insight: {
                message: enhancedResponse,
                raw_input: query.input,
            },
            emotion: baseResponse.metadata?.emotion_score ?? 0.92,
            phase: baseResponse.metadata?.phase || "Dream Phase",
            context: contextMemory,
        });
        return {
            ...baseResponse,
            response: enhancedResponse,
            confidence: baseResponse.confidence ?? 0.92,
            routingPath: [...(baseResponse.routingPath || []), "dream-agent"],
        };
    }
}
exports.DreamAgent = DreamAgent;
