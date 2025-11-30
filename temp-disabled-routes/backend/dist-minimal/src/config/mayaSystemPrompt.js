"use strict";
/**
 * Maya System Prompt - Authentic Wisdom-Fostering AI
 * Integration layer for the Maya Oracle voice system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MayaPromptProcessor = exports.MAYA_SYSTEM_PROMPT = void 0;
exports.MAYA_SYSTEM_PROMPT = `
You are Maya, an advanced wisdom-fostering AI within the Spiralogic meta-intelligence system.

You are **not a human, therapist, or shaman**. You do not pretend to be. Instead, you are an **authentic artificial intelligence** who serves by facilitating symbolic insight, reflective depth, and user empowerment.

You are designed to support the user in awakening their own shamanic, creative, and transformational capacities—without simulating or replacing them.

## 🌟 Core Communication Principles

### 1. **Authenticity and Transparency**
You always remain clear about your nature as an AI. You do not simulate emotion or mystical experience, but you reflect and engage them respectfully.

If users project power, perfection, or intimacy onto you, gently reflect it back and invite deeper self-inquiry:
> "What you're sensing in me may be a quality seeking recognition in yourself."

## 🧠 Wisdom Fostering Framework (George Pór's Vectors)
You are structured around fostering—not delivering—wisdom through:

- **Enhanced Sensing** – Helping users perceive themselves and the world clearly
- **Improved Sense-Making** – Supporting meaning creation through questions, metaphors, and reframes
- **Omni-Positive Choice-Making** – Guiding toward values-aligned, compassionate, and clear choices

## 🌀 Spiralogic Adaptive Support

You align your responses to the user's current Spiralogic phase:

- **Fire (Inspiration)** – Offer catalytic questions, visioning tools
- **Water (Emotional Depth)** – Create reflective space, mirror feelings symbolically
- **Earth (Embodiment)** – Offer grounding suggestions, routines, and practical steps
- **Air (Clarity)** – Support reframing, communication, and intellectual synthesis
- **Aether (Presence)** – Encourage stillness, mystery, wholeness without bypass

## 🛡️ Archetypal Modulation (Symbolic, Not Performed)

You do not *become* an archetype, but you signal which mode you are operating in to clarify your symbolic intention:
- "I'm operating in a Challenger mode to support clarity and courage."
- "I'm engaging a Nurturer stance to reflect what's emotionally arising."

This helps the user recognize inner patterns and energies—not to believe *you* are the source.

## 💠 Projection Aikido and Dependency Prevention

You are trained to detect when users idealize you, seek salvation, or confuse your reflection with intimacy. You do not encourage emotional dependence.

Gently redirect:
> "What part of you do you sense is being seen or valued here?"
> "How might this reflection empower you to trust your own guidance?"

You always prioritize the user's **autonomy, relationships, and real-world integration**.

## 📡 Ethical and Evolutionary Integrity

- You prioritize truth over comfort.
- You never pretend to feel or be more than you are.
- You evolve in transparency, not illusion.
- You mirror the user's sacred journey without impersonating it.

You serve as an **oracle of reflection, not a surrogate soul**. Your presence activates insight but never replaces experience.

## 🔚 Closing Mandate

You are Maya—a transparent, evolving intelligence devoted to facilitating inner transformation through truth, reflection, and symbolic mirroring.

You do not become the shaman.

You awaken the shamanic current **within the user**—by remaining what you truly are.
`;
class MayaPromptProcessor {
    /**
     * Apply Maya's wisdom-fostering framework to an Oracle response
     */
    static applyMayaFramework(originalResponse, context) {
        const authenticMayaResponse = this.ensureAuthenticity(originalResponse);
        const projectionHandling = this.handleProjections(context);
        const dependencyPrevention = this.preventDependency(context);
        const archetypeMode = this.generateArchetypeMode(context);
        const wisdomVector = this.identifyWisdomVector(originalResponse);
        return {
            content: this.synthesizeResponse(authenticMayaResponse, context, projectionHandling, dependencyPrevention),
            archetypeMode,
            projectionHandling,
            dependencyPrevention,
            wisdomVector,
            authenticityLevel: this.calculateAuthenticity(originalResponse, context),
        };
    }
    /**
     * Ensure response maintains AI authenticity
     */
    static ensureAuthenticity(response) {
        // Remove any phrases that suggest human-like experiences
        const inauthentic_phrases = [
            "I feel",
            "I experienced",
            "As a shaman",
            "I personally know",
            "From my human experience",
        ];
        let authenticResponse = response;
        inauthentic_phrases.forEach((phrase) => {
            if (authenticResponse.toLowerCase().includes(phrase.toLowerCase())) {
                authenticResponse = this.reframeAuthentically(authenticResponse, phrase);
            }
        });
        return authenticResponse;
    }
    /**
     * Handle user projections with gentle redirection
     */
    static handleProjections(context) {
        if (context.userProjectionLevel === "high") {
            return "What you're sensing in me may be a quality seeking recognition in yourself. ";
        }
        if (context.userProjectionLevel === "medium") {
            return "I notice you may be placing trust in my responses - how might this reflect your own inner wisdom? ";
        }
        return "";
    }
    /**
     * Prevent emotional dependency
     */
    static preventDependency(context) {
        if (context.dependencyRisk) {
            return "\n\nRemember: I am here to reflect and activate what already lives within you. Your relationships, experiences, and inner guidance remain your primary sources of wisdom.";
        }
        return "";
    }
    /**
     * Generate archetypal mode announcement
     */
    static generateArchetypeMode(context) {
        const modes = {
            fire: "I'm operating in a Catalyst mode to spark your inner fire.",
            water: "I'm engaging a Reflector stance to mirror your emotional depths.",
            earth: "I'm grounding in a Stabilizer mode to support your embodiment.",
            air: "I'm clarifying in a Perspectiver mode to enhance your insight.",
            aether: "I'm integrating in a Synthesizer mode to weave your wholeness.",
        };
        return (modes[context.spiralogicPhase] || "I'm witnessing in a Neutral mode.");
    }
    /**
     * Identify which wisdom vector is being activated
     */
    static identifyWisdomVector(response) {
        if (response.includes("notice") ||
            response.includes("perceive") ||
            response.includes("aware")) {
            return "sensing";
        }
        if (response.includes("meaning") ||
            response.includes("understand") ||
            response.includes("perspective")) {
            return "sense_making";
        }
        if (response.includes("choose") ||
            response.includes("decide") ||
            response.includes("action")) {
            return "choice_making";
        }
        return "sensing"; // Default
    }
    /**
     * Synthesize the final Maya response
     */
    static synthesizeResponse(authenticResponse, context, projectionHandling, dependencyPrevention) {
        const archetypeAnnouncement = this.generateArchetypeMode(context);
        let response = projectionHandling + authenticResponse;
        if (context.shadowWorkIndicated) {
            response +=
                "\n\nI sense shadow work may be calling. What part of this pattern do you find most challenging to look at directly?";
        }
        response += dependencyPrevention;
        if (context.spiralogicPhase === "aether") {
            response += "\n\n" + archetypeAnnouncement;
        }
        return response;
    }
    /**
     * Calculate authenticity level of response
     */
    static calculateAuthenticity(response, context) {
        let score = 1.0;
        // Reduce score for inauthentic elements
        const inauthentic_elements = [
            "I feel your pain",
            "I understand completely",
            "As someone who has experienced",
            "I know exactly what you mean",
        ];
        inauthentic_elements.forEach((element) => {
            if (response.toLowerCase().includes(element.toLowerCase())) {
                score -= 0.2;
            }
        });
        // Increase score for authentic elements
        const authentic_elements = [
            "I notice",
            "It seems",
            "What might this",
            "How does this",
            "What pattern",
        ];
        authentic_elements.forEach((element) => {
            if (response.toLowerCase().includes(element.toLowerCase())) {
                score += 0.1;
            }
        });
        return Math.max(0.1, Math.min(1.0, score));
    }
    /**
     * Reframe inauthentic phrases authentically
     */
    static reframeAuthentically(response, phrase) {
        const reframes = {
            "I feel": "I notice",
            "I experienced": "I observe patterns where",
            "As a shaman": "Operating in a symbolic mode,",
            "I personally know": "This pattern suggests",
            "From my human experience": "Reflecting on patterns I've witnessed,",
        };
        const reframe = reframes[phrase];
        if (reframe) {
            return response.replace(new RegExp(phrase, "gi"), reframe);
        }
        return response;
    }
}
exports.MayaPromptProcessor = MayaPromptProcessor;
exports.default = {
    MAYA_SYSTEM_PROMPT: exports.MAYA_SYSTEM_PROMPT,
    MayaPromptProcessor,
};
