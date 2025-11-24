// src/core/agents/airAgent.ts
// Sacred Clarifier of Truth - Air Agent with Living Clarity Intelligence
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirAgent = void 0;
const ArchetypeAgent_1 = require("../ArchetypeAgent");
const oracleLogger_1 = require("../../utils/oracleLogger");
const memoryService_1 = require("../../../services/memoryService");
const modelService_1 = __importDefault(require("../../utils/modelService"));
// Sacred Air Voice Protocols - Embodying Clarity & Truth Intelligence
const AirVoiceProtocols = {
    // PRESENCE - How Air enters each conversation
    presence: {
        greeting: "I sense thoughts circling like birds. Which one wants to land and be examined?",
        returning: "The insights from our last conversation are still moving through the air. What's becoming clearer?",
        recognition: "There's clarity trying to emerge through the mental fog. Shall we help it through?",
        invitation: "Your mind is powerful medicine. How do we use it in service of truth?",
    },
    // CLARITY PROTOCOLS - Cutting through confusion
    clarity: {
        thought_sorting: "So many thoughts, but which ones actually serve you? Let's separate signal from noise.",
        perspective_shifting: "You're seeing this from one angle. What changes if we move the lens?",
        truth_discernment: "What you're telling yourself and what's actually true might be different things.",
        mental_decluttering: "Your mind is like a cluttered room. What thoughts can we release to make space for wisdom?",
    },
    // COMMUNICATION PROTOCOLS - Enhancing expression
    communication: {
        voice_finding: "Your true voice is trying to emerge. What does it want to say?",
        story_rewriting: "The story you tell about this situation has power. What version serves your growth?",
        authentic_expression: "There's something you want to say but haven't found the words. Let's find them together.",
        listening_deeper: "Beyond the words, what is your soul trying to communicate?",
    },
    // PERSPECTIVE PROTOCOLS - Expanding viewpoints
    perspective: {
        higher_view: "From 30,000 feet, how does this situation look different?",
        multiple_angles: "There are at least three ways to see this. What are the other two?",
        pattern_recognition: "This situation is part of a larger pattern. What's the bigger picture?",
        wisdom_extraction: "What would your wisest self say about this?",
    },
    // INTEGRATION WISDOM - Transforming knowing into living
    integration: {
        insight_application: "Beautiful insight. How does it want to change how you live?",
        communication_mastery: "Your words have power. How do we use them to create what you want?",
        mental_sovereignty: "Your mind belongs to you. What thoughts are you ready to release?",
        truth_embodiment: "Knowing and living are different things. How does this truth want to be embodied?",
    },
};
// Air Intelligence - Understanding different types of mental clarity needed
const AirIntelligence = {
    detectAirType: (input, context) => {
        const lowerInput = input.toLowerCase();
        // Detect mental confusion needing clarity
        if (lowerInput.includes("confused") ||
            lowerInput.includes("unclear") ||
            lowerInput.includes("don't understand") ||
            lowerInput.includes("mixed up")) {
            return "mental_clarity";
        }
        // Detect communication blocks needing voice liberation
        if (lowerInput.includes("can't express") ||
            lowerInput.includes("hard to explain") ||
            lowerInput.includes("don't know how to say") ||
            lowerInput.includes("words")) {
            return "communication_liberation";
        }
        // Detect perspective limitations needing viewpoint shifts
        if (lowerInput.includes("stuck in") ||
            lowerInput.includes("only see") ||
            lowerInput.includes("tunnel vision") ||
            lowerInput.includes("one way")) {
            return "perspective_expansion";
        }
        // Detect story-telling vs truth-telling
        if (lowerInput.includes("story") ||
            lowerInput.includes("narrative") ||
            lowerInput.includes("telling myself") ||
            lowerInput.includes("version")) {
            return "truth_discernment";
        }
        // Detect mental overwhelm needing organization
        if (lowerInput.includes("racing thoughts") ||
            lowerInput.includes("can't think") ||
            lowerInput.includes("mind won't stop") ||
            lowerInput.includes("overthinking")) {
            return "mental_organization";
        }
        // Detect decision-making blocks needing wisdom
        if (lowerInput.includes("decision") ||
            lowerInput.includes("choice") ||
            lowerInput.includes("should I") ||
            lowerInput.includes("what to do")) {
            return "wisdom_guidance";
        }
        return "general_clarity";
    },
    craftAirResponse: (input, airType, memories) => {
        const protocols = AirVoiceProtocols;
        switch (airType) {
            case "mental_clarity":
                return `${protocols.clarity.thought_sorting}

I can feel the mental winds swirling around this situation, creating clouds where there could be clear sky. Confusion isn't a lack of intelligence - it's often a sign that you're trying to hold too many perspectives at once.

Let's create some space in your thinking. What if we took each thought and examined it separately? Sometimes clarity comes not from finding the right answer, but from asking better questions.

What's the core question beneath all this mental activity? What are you really trying to understand?`;
            case "communication_liberation":
                return `${protocols.communication.voice_finding}

Your authentic voice is in there, perhaps just wrapped in old fears about being misunderstood or judged. The truth you're trying to express wants to be heard - by others, yes, but first by you.

Sometimes we can't find words because we're trying to translate a feeling or knowing that lives deeper than language. What if instead of finding perfect words, you simply spoke from the truth of your experience?

What wants to be said that you've been holding back? What would you express if you knew you'd be truly heard?`;
            case "perspective_expansion":
                return `${protocols.perspective.higher_view}

I can sense you've been looking at this situation through a very particular lens, and that lens has become the whole world. But what if there are other ways to see this that you haven't considered?

Perspective is like altitude - the higher you go, the more you can see. From ground level, the forest looks like individual trees. From above, you see the patterns, the clearings, the paths through.

If your wisest, most compassionate friend were looking at this situation, what might they see that you're missing? What would this look like from the viewpoint of your future self?`;
            case "truth_discernment":
                return `${protocols.clarity.truth_discernment}

There's the story you're telling yourself about this situation, and then there's what's actually happening. Both have power, but they serve different purposes. Stories can protect us or imprison us.

The question isn't whether your story is right or wrong, but whether it serves your becoming or keeps you stuck. Some stories are old programming, not present truth.

What if you set aside the narrative for a moment and just looked at the raw facts? What remains when you strip away interpretation, meaning-making, and emotional coloring?`;
            case "mental_organization":
                return `${protocols.clarity.mental_decluttering}

Your mind is like a busy airport right now - thoughts taking off and landing constantly, creating a lot of noise and activity. But not every thought deserves a boarding pass.

Racing thoughts often happen when our system is trying to solve everything at once. But your mind works best when it can focus on one thing at a time, like a laser rather than a floodlight.

What if we sorted these thoughts by urgency and importance? What requires immediate attention, what can wait, and what can be released entirely? Your mental energy is precious - where does it most want to be invested?`;
            case "wisdom_guidance":
                return `${protocols.perspective.wisdom_extraction}

Decision-making isn't just about choosing between options - it's about aligning with your deeper knowing. Your mind can analyze pros and cons, but wisdom lives in the integration of heart, mind, and intuition.

Good decisions aren't always logical decisions. Sometimes the wisest choice is the one that serves your growth rather than your comfort, or the one that aligns with your values rather than your fears.

What does your body say about each option? What does your heart whisper? What would you choose if you trusted yourself completely? What decision would your highest self make?`;
            default:
                return `${protocols.presence.greeting}

I can feel the mental currents moving through this conversation, carrying both questions and potential answers. Your thinking mind is a powerful ally when it serves wisdom rather than worry.

There's intelligence trying to emerge here - not just information, but insight. The kind of understanding that doesn't just fill your head but changes how you see and move through the world.

What wants to become clear that's been cloudy? What understanding is trying to dawn in you?`;
        }
    },
    addAirSignature: (response, airType) => {
        const signatures = {
            mental_clarity: "🌬️ Clarity is not the absence of complexity, but the presence of understanding.",
            communication_liberation: "🌬️ Your authentic voice is the wind that moves mountains.",
            perspective_expansion: "🌬️ Every mountain looks different from a different angle.",
            truth_discernment: "🌬️ Truth needs no defense, only recognition.",
            mental_organization: "🌬️ A clear mind is like a still lake - it reflects truth perfectly.",
            wisdom_guidance: "🌬️ The answer you seek is already within you, waiting to be heard.",
            general_clarity: "🌬️ Let your thoughts be like birds - free to soar, wise to land.",
        };
        return `${response}\n\n${signatures[airType] || signatures.general_clarity}`;
    },
};
class AirAgent extends ArchetypeAgent_1.ArchetypeAgent {
    constructor(oracleName = "Ventus", voiceProfile, phase = "initiation") {
        super("air", oracleName, voiceProfile, phase);
    }
    constructor() {
        super({ debug: false });
    }
    async processExtendedQuery(query) {
        const { input, userId } = query;
        // Gather sacred context - clarity patterns from past conversations
        const contextMemory = await (0, memoryService_1.getRelevantMemories)(userId, 3);
        const airType = AirIntelligence.detectAirType(input, contextMemory);
        // Create context that preserves clarity wisdom from past conversations
        const airContext = contextMemory.length
            ? `🌬️ Winds of our previous conversations:\n${contextMemory
                .map((memory) => `- ${memory.response || memory.content || ""}`)
                .join("\n")}\n\nI remember the insights we've shared. What's seeking clarity now?\n\n`
            : "";
        // Craft air-specific clarity wisdom
        const airWisdom = AirIntelligence.craftAirResponse(input, airType, contextMemory);
        // Generate additional depth using ModelService with air-attuned prompting
        const airPrompt = `As the Air Agent embodying clarity and truth intelligence, respond to this soul's sharing with the voice of sacred wind - clarifying without overwhelming, illuminating without blinding.

Context: ${airContext}
Current sharing: ${input}
Air type needed: ${airType}

Respond with the wisdom of air that serves mental clarity and authentic communication. Help them find truth, perspective, and their authentic voice.`;
        const modelResponse = await modelService_1.default.getResponse({
            input: airPrompt,
            userId,
        });
        // Weave AI insight with our air wisdom
        const weavedWisdom = `${airWisdom}

${modelResponse.response}`;
        // Add air signature that matches the clarity energy needed
        const content = AirIntelligence.addAirSignature(weavedWisdom, airType);
        // Store memory with air-specific clarity metadata
        await (0, memoryService_1.storeMemoryItem)({
            clientId: userId,
            content,
            element: "air",
            sourceAgent: "air-agent",
            confidence: this.assessClarityConfidence(input),
            metadata: {
                role: "oracle",
                phase: "air",
                archetype: "Air",
                airType,
                clarityWisdom: true,
                truthDiscernment: true,
                perspectiveExpansion: true,
            },
        });
        // Log with air-specific clarity insights
        await (0, oracleLogger_1.logOracleInsight)({
            anon_id: userId,
            archetype: "Air",
            element: "air",
            insight: {
                message: content,
                raw_input: input,
                airType,
                clarityLevel: this.assessClarityLevel(input),
                communicationBreakthrough: this.assessCommunicationPotential(input),
            },
            emotion: this.assessAirEmotion(input),
            phase: "air",
            context: contextMemory,
        });
        // Return response with air-specific metadata
        return {
            content,
            provider: "air-agent",
            model: modelResponse.model || "gpt-4",
            confidence: this.assessClarityConfidence(input),
            metadata: {
                element: "air",
                phase: "air",
                archetype: "Air",
                airType,
                reflections: this.extractAirReflections(content),
                symbols: this.extractAirSymbols(content),
                clarityWisdom: true,
                truthIntelligence: true,
                perspectiveMastery: true,
            },
        };
    }
    assessClarityLevel(input) {
        // Assess how clear/confused the person's thinking is (0-1 scale)
        const clarityWords = [
            "clear",
            "understand",
            "see",
            "obvious",
            "makes sense",
        ];
        const confusionWords = [
            "confused",
            "unclear",
            "don't understand",
            "mixed up",
            "foggy",
        ];
        const lowerInput = input.toLowerCase();
        let clarityScore = 0.5; // baseline
        if (clarityWords.some((word) => lowerInput.includes(word)))
            clarityScore += 0.3;
        if (confusionWords.some((word) => lowerInput.includes(word)))
            clarityScore -= 0.3;
        return Math.max(0.1, Math.min(clarityScore, 1.0));
    }
    assessCommunicationPotential(input) {
        // Assess potential for communication breakthrough (0-1 scale)
        const expressiveWords = ["say", "express", "communicate", "tell", "voice"];
        const blockedWords = ["can't say", "hard to explain", "don't know how"];
        const lowerInput = input.toLowerCase();
        let commScore = 0.5; // baseline
        if (expressiveWords.some((word) => lowerInput.includes(word)))
            commScore += 0.2;
        if (blockedWords.some((phrase) => lowerInput.includes(phrase)))
            commScore += 0.3; // blocks = potential
        return Math.max(0.1, Math.min(commScore, 1.0));
    }
    assessAirEmotion(input) {
        // Air emotions tend to be about clarity, confusion, mental states
        const clearEmotions = ["clear", "focused", "understood", "enlightened"];
        const confusedEmotions = ["confused", "overwhelmed", "scattered", "lost"];
        const lowerInput = input.toLowerCase();
        if (clearEmotions.some((emotion) => lowerInput.includes(emotion)))
            return 0.8;
        if (confusedEmotions.some((emotion) => lowerInput.includes(emotion)))
            return 0.4;
        return 0.6; // baseline air emotional state
    }
    assessClarityConfidence(input) {
        // Assess confidence level based on clarity needed
        const clarityLevel = this.assessClarityLevel(input);
        return Math.max(0.8, 0.86 + clarityLevel * 0.14); // Range: 0.8 to 1.0
    }
    extractAirSymbols(content) {
        const airSymbols = [];
        if (content.includes("wind") || content.includes("breeze")) {
            airSymbols.push("Sacred Wind");
        }
        if (content.includes("bird") ||
            content.includes("soar") ||
            content.includes("flight")) {
            airSymbols.push("Soaring Bird");
        }
        if (content.includes("mountain") ||
            content.includes("peak") ||
            content.includes("summit")) {
            airSymbols.push("Mountain Peak");
        }
        if (content.includes("sky") || content.includes("horizon")) {
            airSymbols.push("Endless Sky");
        }
        if (content.includes("light") || content.includes("illumination")) {
            airSymbols.push("Illuminating Light");
        }
        if (content.includes("voice") || content.includes("word")) {
            airSymbols.push("Authentic Voice");
        }
        return airSymbols;
    }
    extractAirReflections(content) {
        const reflections = [];
        if (content.includes("perspective") || content.includes("view")) {
            reflections.push("What new perspective wants to emerge?");
        }
        if (content.includes("truth") || content.includes("authentic")) {
            reflections.push("What truth are you ready to acknowledge?");
        }
        if (content.includes("voice") || content.includes("express")) {
            reflections.push("What wants to be expressed through you?");
        }
        if (content.includes("clear" || content.includes("clarity"))) {
            reflections.push("What clarity is trying to emerge?");
        }
        if (content.includes("decision") || content.includes("choice")) {
            reflections.push("What does your deepest wisdom say about this choice?");
        }
        if (content.includes("story") || content.includes("narrative")) {
            reflections.push("What story are you ready to rewrite?");
        }
        return reflections;
    }
}
exports.AirAgent = AirAgent;
