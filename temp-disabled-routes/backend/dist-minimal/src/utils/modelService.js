"use strict";
// src/utils/modelService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openaiClient_1 = require("../lib/openaiClient"); // adjust if using other clients
const logger_1 = __importDefault(require("./logger"));
class ModelService {
    /**
     * Get a response from the configured LLM model.
     * @param query - An object containing the user's input and optional context.
     */
    async getResponse(query) {
        const { input, userId, context = {} } = query;
        try {
            logger_1.default.info("🔮 Sending query to model", { userId, input });
            const completion = await openaiClient_1.openai.chat.completions.create({
                model: "gpt-4", // or 'gpt-3.5-turbo' / 'claude' depending on your setup
                messages: [
                    {
                        role: "system",
                        content: "You are an insightful Oracle. Offer reflective and transformative guidance.",
                    },
                    {
                        role: "user",
                        content: input,
                    },
                ],
                temperature: 0.8,
                max_tokens: 800,
            });
            const responseText = completion.choices[0]?.message?.content?.trim() ?? "";
            const response = {
                response: responseText,
                confidence: 0.9,
                metadata: {
                    timestamp: new Date().toISOString(),
                    context,
                },
            };
            logger_1.default.info("✅ Model response received", {
                userId,
                model: "gpt-4",
            });
            return response;
        }
        catch (error) {
            logger_1.default.error("❌ ModelService failed to get a response", {
                error,
                userId,
                input,
            });
            throw error;
        }
    }
}
exports.default = new ModelService();
