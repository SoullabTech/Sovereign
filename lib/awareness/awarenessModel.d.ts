export type AwarenessLevel = 1 | 2 | 3 | 4;
export declare const AWARENESS_LEVELS: {
    readonly 1: {
        readonly name: "Newcomer";
        readonly description: "New to inner work - gentle, simple language";
        readonly tone: "grounded, simple, zero jargon";
    };
    readonly 2: {
        readonly name: "Practitioner-in-Process";
        readonly description: "Some spiritual/therapy work - basic pattern language";
        readonly tone: "gentle archetypal intro, some Spiralogic";
    };
    readonly 3: {
        readonly name: "Adept";
        readonly description: "Archetypal native - full depth psychology";
        readonly tone: "full Spiralogic, alchemy, astrology, depth psych";
    };
    readonly 4: {
        readonly name: "Steward";
        readonly description: "Research collaborator - technical language";
        readonly tone: "raw pattern data, technical language, field experiments";
    };
};
export interface AwarenessProfile {
    userId: string;
    baselineLevel: AwarenessLevel;
    sessionLevel?: AwarenessLevel;
    sessionLevelUpdatedAt?: string;
    sessionPreference?: "light" | "normal" | "deep";
    hasCompletedInitialCalibration?: boolean;
    lastCalibrationAt?: string;
    languageComplexity?: number;
    featureUsage?: {
        labtools: number;
        journaling: number;
        divination: number;
        commons: number;
    };
    manuallySet?: boolean;
    setByUserId?: string;
}
export type SessionPreference = "light" | "normal" | "deep";
export declare function resolveSessionLevel(baseline: AwarenessLevel, preference: SessionPreference): AwarenessLevel;
export declare function inferAwarenessFromText(text: string): number;
export interface LeveledResponse {
    reflection: string;
    chips: string[];
    explanation?: string;
}
export type FacetResponses = {
    [K in AwarenessLevel]: LeveledResponse;
};
export declare const CALIBRATION_PROMPTS: {
    readonly initial: {
        readonly prompt: "I can meet you at different levels of depth and complexity. Which feels most right for you right now?";
        readonly options: readonly [{
            readonly value: "gentle";
            readonly level: 1;
            readonly label: "Gentle & simple";
            readonly description: "Plain language, one step at a time, no jargon";
        }, {
            readonly value: "processAware";
            readonly level: 2;
            readonly label: "Process-aware";
            readonly description: "Some pattern language, but still accessible";
        }, {
            readonly value: "archetypal";
            readonly level: 3;
            readonly label: "Full archetypal";
            readonly description: "Spiralogic, elements, astrology, depth psychology";
        }];
    };
    readonly sessionCheck: {
        readonly prompt: "For today's conversation, how would you like me to meet you?";
        readonly options: readonly [{
            readonly value: "light";
            readonly label: "Keep it light and simple";
            readonly description: "Gentle approach today";
        }, {
            readonly value: "normal";
            readonly label: "Normal depth is fine";
            readonly description: "Your usual level";
        }, {
            readonly value: "deep";
            readonly label: "Go full-on deep with me";
            readonly description: "Extra depth and complexity";
        }];
    };
};
//# sourceMappingURL=awarenessModel.d.ts.map