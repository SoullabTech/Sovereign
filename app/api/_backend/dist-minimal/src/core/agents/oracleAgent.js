"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleAgent = void 0;
const ritualEngine_1 = require("../../lib/ritualEngine");
const spiralLogic_1 = require("../../lib/spiralLogic");
class OracleAgent {
    constructor(options = {}) {
        this.debug = options.debug ?? false;
    }
    async processQuery(query) {
        if (this.debug) {
            console.log("[OracleAgent] Processing query:", query);
        }
        const detectedElement = this.detectElement(query);
        const ritual = (0, ritualEngine_1.getRitualForPhase)(detectedElement); // Type assertion for Step 2
        const simulatedResponse = `Processed query: ${query}`;
        const metadata = {
            timestamp: new Date().toISOString(),
            element: detectedElement,
            processedAt: new Date().toISOString(),
            prefect: {
                task: "simulate",
                status: "success",
            },
            ritual, // 👈 New metadata field
        };
        return {
            content: simulatedResponse,
            response: simulatedResponse, // Legacy compatibility
            confidence: 0.9,
            metadata,
            // routingPath: [detectedElement.toLowerCase(), "oracle-agent"], // Temporarily removed for Step 2
        };
    }
    detectElement(text) {
        return (0, spiralLogic_1.getElementalPhase)(text); // using spiralLogic.ts
    }
}
exports.OracleAgent = OracleAgent;
