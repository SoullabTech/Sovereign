"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRitualForPhase = getRitualForPhase;
const ritualPrompts = [
    {
        title: "Ignite the Vision",
        description: "Write a declaration of purpose. What are you ready to burn for?",
        phase: "Fire",
    },
    {
        title: "Flow of Meaning",
        description: "Reflect on your current emotional undercurrents. What truth is rising?",
        phase: "Water",
    },
    {
        title: "Root in Practice",
        description: "What structure or habit can anchor your growth?",
        phase: "Earth",
    },
    {
        title: "Clear the Signal",
        description: "What message needs to be spoken or clarified today?",
        phase: "Air",
    },
    {
        title: "Synthesize Wholeness",
        description: "What unseen pattern wants to be integrated now?",
        phase: "Aether",
    },
];
function getRitualForPhase(phase) {
    return (ritualPrompts.find((ritual) => ritual.phase === phase) ?? {
        title: "Center in Mystery",
        description: "Pause. Listen inwardly. Let the unknown reveal a step.",
        phase: "Aether",
    });
}
