"use strict";
// MAIA's Depth-Sense: Awareness Model
// Tracks how deeply/complexity someone wants MAIA to engage
Object.defineProperty(exports, "__esModule", { value: true });
exports.CALIBRATION_PROMPTS = exports.AWARENESS_LEVELS = void 0;
exports.resolveSessionLevel = resolveSessionLevel;
exports.inferAwarenessFromText = inferAwarenessFromText;
// The four levels of depth/complexity
exports.AWARENESS_LEVELS = {
    1: {
        name: "Newcomer",
        description: "New to inner work - gentle, simple language",
        tone: "grounded, simple, zero jargon"
    },
    2: {
        name: "Practitioner-in-Process",
        description: "Some spiritual/therapy work - basic pattern language",
        tone: "gentle archetypal intro, some Spiralogic"
    },
    3: {
        name: "Adept",
        description: "Archetypal native - full depth psychology",
        tone: "full Spiralogic, alchemy, astrology, depth psych"
    },
    4: {
        name: "Steward",
        description: "Research collaborator - technical language",
        tone: "raw pattern data, technical language, field experiments"
    }
};
function resolveSessionLevel(baseline, preference) {
    switch (preference) {
        case "light":
            return Math.max(1, baseline - 1);
        case "deep":
            return Math.min(4, baseline + 1);
        case "normal":
        default:
            return baseline;
    }
}
// For inferring awareness from language patterns
function inferAwarenessFromText(text) {
    const indicators = {
        // L1 indicators (0.1-0.3)
        basic: [
            /\b(feel|feeling|feelings|stuck|lost|anxious|confused|help)\b/gi,
            /\b(don't know|not sure|unclear|overwhelmed)\b/gi
        ],
        // L2 indicators (0.4-0.6)
        processAware: [
            /\b(pattern|cycle|process|inner work|therapy|spiritual)\b/gi,
            /\b(notice|aware|realize|understand|growth)\b/gi,
            /\b(shadow|healing|integration|transformation)\b/gi
        ],
        // L3+ indicators (0.7-1.0)
        archetypal: [
            /\b(archetyp|fire|water|earth|air|aether)\b/gi,
            /\b(spiralogic|facet|calling|sacred|ritual)\b/gi,
            /\b(underworld|pluto|saturn|mercury|venus|mars)\b/gi,
            /\b(projection|anima|animus|persona|complex)\b/gi
        ]
    };
    let score = 0;
    let totalMatches = 0;
    // Count matches for each level
    for (const regex of indicators.basic) {
        const matches = text.match(regex)?.length || 0;
        score += matches * 0.2;
        totalMatches += matches;
    }
    for (const regex of indicators.processAware) {
        const matches = text.match(regex)?.length || 0;
        score += matches * 0.5;
        totalMatches += matches;
    }
    for (const regex of indicators.archetypal) {
        const matches = text.match(regex)?.length || 0;
        score += matches * 0.8;
        totalMatches += matches;
    }
    // Normalize by text length and total matches
    if (totalMatches === 0)
        return 0.5; // neutral default
    return Math.min(1, score / Math.max(totalMatches, text.split(' ').length / 10));
}
// Example calibration prompts
exports.CALIBRATION_PROMPTS = {
    initial: {
        prompt: `I can meet you at different levels of depth and complexity. Which feels most right for you right now?`,
        options: [
            {
                value: "gentle",
                level: 1,
                label: "Gentle & simple",
                description: "Plain language, one step at a time, no jargon"
            },
            {
                value: "processAware",
                level: 2,
                label: "Process-aware",
                description: "Some pattern language, but still accessible"
            },
            {
                value: "archetypal",
                level: 3,
                label: "Full archetypal",
                description: "Spiralogic, elements, astrology, depth psychology"
            }
        ]
    },
    sessionCheck: {
        prompt: `For today's conversation, how would you like me to meet you?`,
        options: [
            {
                value: "light",
                label: "Keep it light and simple",
                description: "Gentle approach today"
            },
            {
                value: "normal",
                label: "Normal depth is fine",
                description: "Your usual level"
            },
            {
                value: "deep",
                label: "Go full-on deep with me",
                description: "Extra depth and complexity"
            }
        ]
    }
};
//# sourceMappingURL=awarenessModel.js.map