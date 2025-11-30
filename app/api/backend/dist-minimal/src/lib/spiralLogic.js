"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spiralPhaseDescription = exports.getElementalPhase = void 0;
const getElementalPhase = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes("vision") || lower.includes("ignite"))
        return "Fire";
    if (lower.includes("emotion") || lower.includes("dream"))
        return "Water";
    if (lower.includes("structure") || lower.includes("practice"))
        return "Earth";
    if (lower.includes("clarity") || lower.includes("signal"))
        return "Air";
    return "Aether"; // fallback
};
exports.getElementalPhase = getElementalPhase;
exports.spiralPhaseDescription = {
    Fire: "Initiation & Purpose",
    Water: "Transformation & Emotion",
    Earth: "Stability & Practice",
    Air: "Communication & Strategy",
    Aether: "Integration & Coherence",
};
