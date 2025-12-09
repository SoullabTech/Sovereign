/**
 * Centralized emotional analysis utilities
 */
/**
 * Analyze emotional tone from text
 */
export declare function analyzeEmotionalTone(text: string): {
    primary: string;
    secondary?: string;
    scores: Map<string, number>;
};
/**
 * Assess content depth from text
 */
export declare function assessContentDepth(text: string): number;
/**
 * Extract topics from text
 */
export declare function extractTopics(text: string): string[];
/**
 * Detect emotional intensity
 */
export declare function detectEmotionalIntensity(text: string): number;
//# sourceMappingURL=emotional-analysis.d.ts.map