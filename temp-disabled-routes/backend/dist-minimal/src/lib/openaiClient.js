"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiClient = exports.openai = void 0;
// src/lib/openaiClient.ts
const openai_1 = __importDefault(require("openai"));
const openaiInstance = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.openai = openaiInstance;
exports.openaiClient = {
    async generateResponse(prompt) {
        try {
            const response = await openaiInstance.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: prompt }],
            });
            return { content: response.choices[0]?.message?.content || "" };
        }
        catch (error) {
            console.error("OpenAI API error:", error);
            return { content: `Generated response for prompt: ${prompt}` };
        }
    },
};
