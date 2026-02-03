"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryService = exports.getSpiritualPatternInsights = exports.getAggregatedWisdom = exports.getRelevantMemories = exports.storeMemoryItem = exports.memoryService = void 0;
const symbolService_1 = require("./symbolService");
const supabaseClient_1 = require("../lib/supabaseClient");
// Core Memory Service Object
exports.memoryService = {
    // Store a new memory item
    store: async (userId, content, element, sourceAgent, confidence, metadata) => {
        const symbols = (0, symbolService_1.extractSymbolicTags)(content, sourceAgent || &quot;oracle&quot;);
        // Extract themes from content
        const themes = extractThemesFromContent(content.toLowerCase());
        // Check for spiritual keywords
        const spiritualKeywords = detectSpiritualKeywords(content);
        // Enhanced metadata with pattern recognition
        const enhancedMetadata = {
            ...metadata,
            symbols,
            themes,
            spiritualKeywords,
            timestamp: new Date().toISOString(),
            moonPhase: calculateMoonPhase(), // Track lunar influence
            seasonalEnergy: getCurrentSeasonalEnergy(), // Track seasonal patterns
        };
        const { data, error } = await supabaseClient_1.supabase
            .from("memories")
            .insert([
            {
                user_id: userId,
                content,
                element,
                source_agent: sourceAgent,
                confidence,
                metadata: enhancedMetadata,
                timestamp: new Date().toISOString(),
            },
        ])
            .single();
        if (error) {
            console.error("Error storing memory:", error.message);
            return null;
        }
        // After storing, check for emerging patterns
        const recentMemories = await exports.memoryService.recall(userId, {
            userId,
            limit: 50,
        });
        const patterns = await checkForEmergingPatterns(recentMemories, data);
        if (patterns.length > 0) {
            // Store pattern alerts for the oracle agents to use
            await supabaseClient_1.supabase.from("pattern_alerts").insert(patterns.map((p) => ({
                user_id: userId,
                pattern_type: p.type,
                pattern_data: p.data,
                created_at: new Date().toISOString(),
            })));
        }
        return data;
    },
    // Recall memories for a user
    recall: async (userId, query) => {
        let queryBuilder = supabaseClient_1.supabase
            .from("memories")
            .select("*")
            .eq("user_id", userId)
            .order("timestamp", { ascending: false });
        if (query?.element) {
            queryBuilder = queryBuilder.eq("element", query.element);
        }
        if (query?.sourceAgent) {
            queryBuilder = queryBuilder.eq("source_agent", query.sourceAgent);
        }
        if (query?.limit) {
            queryBuilder = queryBuilder.limit(query.limit);
        }
        if (query?.offset) {
            queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 50) - 1);
        }
        const { data, error } = await queryBuilder;
        if (error) {
            console.error("Error recalling memories:", error.message);
            return [];
        }
        return data;
    },
    // Update a memory item
    update: async (memoryId, content, userId, metadata) => {
        const symbols = (0, symbolService_1.extractSymbolicTags)(content);
        const { error } = await supabaseClient_1.supabase
            .from("memories")
            .update({
            content,
            metadata: {
                ...metadata,
                symbols,
            },
            updated_at: new Date().toISOString(),
        })
            .eq("id", memoryId)
            .eq("user_id", userId);
        if (error) {
            console.error("Error updating memory:", error.message);
            return false;
        }
        return true;
    },
    // Delete a memory item
    delete: async (memoryId, userId) => {
        const { error } = await supabaseClient_1.supabase
            .from("memories")
            .delete()
            .eq("id", memoryId)
            .eq("user_id", userId);
        if (error) {
            console.error("Error deleting memory:", error.message);
            return false;
        }
        return true;
    },
    // Get memory insights for a user
    getMemoryInsights: async (userId) => {
        const memories = await exports.memoryService.recall(userId);
        const elementCounts = memories.reduce((acc, memory) => {
            const element = memory.element || "unknown";
            acc[element] = (acc[element] || 0) + 1;
            return acc;
        }, {});
        const agentCounts = memories.reduce((acc, memory) => {
            const agent = memory.source_agent || "unknown";
            acc[agent] = (acc[agent] || 0) + 1;
            return acc;
        }, {});
        // Extract spiritual themes and patterns
        const spiritualThemes = await exports.memoryService.recognizeSpiritualThemes(memories);
        const synchronicities = await exports.memoryService.detectSynchronicities(memories);
        const mysticalInsights = await exports.memoryService.extractMysticalInsights(memories);
        return {
            totalMemories: memories.length,
            elementBreakdown: elementCounts,
            agentBreakdown: agentCounts,
            recentActivity: memories.slice(0, 10),
            spiritualThemes,
            synchronicities,
            mysticalInsights,
        };
    },
    // Recognize recurring spiritual themes
    recognizeSpiritualThemes: async (memories) => {
        const themePatterns = {
            shadow_work: [
                "shadow",
                "dark",
                "hidden",
                "unconscious",
                "rejected",
                "denied",
            ],
            divine_feminine: [
                "feminine",
                "goddess",
                "moon",
                "intuition",
                "receptive",
                "yoni",
            ],
            divine_masculine: [
                "masculine",
                "warrior",
                "sun",
                "active",
                "penetrating",
                "shiva",
            ],
            kundalini_awakening: [
                "serpent",
                "rising",
                "spine",
                "energy",
                "chakra",
                "awakening",
            ],
            soul_retrieval: [
                "soul",
                "lost",
                "fragment",
                "return",
                "whole",
                "retrieve",
            ],
            ancestral_healing: [
                "ancestor",
                "lineage",
                "inherited",
                "generations",
                "family",
            ],
            twin_flame: [
                "twin",
                "mirror",
                "other half",
                "union",
                "separation",
                "reunion",
            ],
            christ_consciousness: [
                "christ",
                "unconditional",
                "love",
                "compassion",
                "forgiveness",
            ],
            void_work: [
                "void",
                "emptiness",
                "nothingness",
                "space",
                "silence",
                "stillness",
            ],
            death_rebirth: [
                "death",
                "rebirth",
                "phoenix",
                "transformation",
                "ending",
                "beginning",
            ],
            sacred_marriage: [
                "marriage",
                "union",
                "hieros gamos",
                "merge",
                "integrate",
            ],
            lightworker_path: [
                "light",
                "service",
                "healing",
                "mission",
                "purpose",
                "guide",
            ],
            dark_night: [
                "dark night",
                "soul",
                "despair",
                "lost",
                "crisis",
                "breakdown",
            ],
            unity_consciousness: [
                "oneness",
                "unity",
                "connected",
                "whole",
                "cosmic",
                "universal",
            ],
            inner_child: ["child", "innocent", "play", "wonder", "young", "little"],
        };
        const themes = new Map();
        memories.forEach((memory) => {
            const content = memory.content.toLowerCase();
            const symbols = memory.metadata?.symbols || [];
            Object.entries(themePatterns).forEach(([themeName, keywords]) => {
                const found = keywords.some((keyword) => content.includes(keyword) ||
                    symbols.some((symbol) => symbol.toLowerCase().includes(keyword)));
                if (found) {
                    const existing = themes.get(themeName) || {
                        name: themeName,
                        frequency: 0,
                        evolution: [],
                        relatedSymbols: [],
                        firstAppearance: memory.timestamp,
                        lastAppearance: memory.timestamp,
                    };
                    existing.frequency++;
                    existing.lastAppearance = memory.timestamp;
                    if (existing.evolution.length < 10) {
                        existing.evolution.push(`${memory.timestamp}: ${content.substring(0, 100)}...`);
                    }
                    existing.relatedSymbols = Array.from(new Set([...existing.relatedSymbols, ...symbols]));
                    themes.set(themeName, existing);
                }
            });
        });
        return Array.from(themes.values())
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10); // Top 10 themes
    },
    // Detect symbolic synchronicities
    detectSynchronicities: async (memories) => {
        const symbolOccurrences = new Map();
        // Sacred symbols to track
        const sacredSymbols = [
            &quot;phoenix&quot;,
            "serpent",
            "lotus",
            "rose",
            "cross",
            "spiral",
            "mandala",
            "tree of life",
            "ankh",
            "om",
            "yin yang",
            "pentagram",
            "hexagram",
            "chalice",
            "sword",
            "wand",
            "disk",
            "caduceus",
            "ouroboros",
            "merkaba",
            "flower of life",
            "seed of life",
            "metatron",
            "golden ratio",
            "pyramid",
            "crystal",
            "mirror",
            "veil",
            "bridge",
            "door",
            "key",
            "crown",
            "heart",
            "star",
            "moon",
            "sun",
            "rainbow",
            "lightning",
            "mountain",
            "cave",
            "water",
            "fire",
            "earth",
            "air",
            "aether",
            "void",
            "light",
            "shadow",
        ];
        memories.forEach((memory) => {
            const content = memory.content.toLowerCase();
            const memorySymbols = memory.metadata?.symbols || [];
            sacredSymbols.forEach((symbol) => {
                if (content.includes(symbol) ||
                    memorySymbols.some((s) => s.toLowerCase().includes(symbol))) {
                    const existing = symbolOccurrences.get(symbol) || {
                        symbol,
                        occurrences: [],
                        significance: "",
                        pattern: "",
                    };
                    existing.occurrences.push({
                        date: memory.timestamp,
                        context: content.substring(0, 200),
                        element: memory.element,
                        relatedThemes: extractThemesFromContent(content),
                    });
                    symbolOccurrences.set(symbol, existing);
                }
            });
        });
        // Analyze patterns and significance
        return Array.from(symbolOccurrences.values())
            .filter((sync) => sync.occurrences.length >= 3) // At least 3 occurrences
            .map((sync) => {
            // Detect pattern timing
            const dates = sync.occurrences.map((o) => new Date(o.date));
            sync.pattern = detectTimingPattern(dates);
            // Determine significance based on frequency and context
            sync.significance = determineSymbolicSignificance(sync);
            return sync;
        })
            .sort((a, b) => b.occurrences.length - a.occurrences.length);
    },
    // Extract mystical insights from memory patterns
    extractMysticalInsights: async (memories) => {
        const insights = [];
        // Pattern recognition for mystical insights
        const insightPatterns = [
            {
                pattern: ["death", "rebirth", "transform"],
                insight: "You are in a profound cycle of death and rebirth, shedding old identity",
                depth: "deep",
            },
            {
                pattern: ["shadow", "light", "integrate"],
                insight: "Shadow integration work is calling - wholeness comes from embracing all parts",
                depth: "emerging",
            },
            {
                pattern: ["void", "empty", "space"],
                insight: "The void is speaking - creative potential emerges from sacred emptiness",
                depth: "deep",
            },
            {
                pattern: ["synchron", "meaning", "sign"],
                insight: "The universe is communicating through synchronicities - pay attention",
                depth: "emerging",
            },
            {
                pattern: ["awaken", "conscious", "aware"],
                insight: "A spiritual awakening is unfolding - old reality structures dissolving",
                depth: "integrated",
            },
        ];
        // Check for insight patterns
        insightPatterns.forEach(({ pattern, insight, depth }) => {
            const matchingMemories = memories.filter((memory) => {
                const content = memory.content.toLowerCase();
                return pattern.every((keyword) => content.includes(keyword));
            });
            if (matchingMemories.length >= 2) {
                insights.push({
                    insight,
                    recognizedAt: new Date().toISOString(),
                    triggers: pattern,
                    depth,
                    relatedMemories: matchingMemories.map((m) => m.id),
                });
            }
        });
        // Advanced pattern detection
        const advancedInsights = detectAdvancedMysticalPatterns(memories);
        insights.push(...advancedInsights);
        return insights;
    },
};
// Helper functions for pattern recognition
function extractThemesFromContent(content) {
    const themes = [];
    const themeKeywords = {
        transformation: ["transform", "change", "evolve", "shift"],
        healing: ["heal", "restore", "mend", "recovery"],
        awakening: ["awaken", "realize", "conscious", "aware"],
        integration: ["integrate", "unite", "merge", "whole"],
        shadow: ["shadow", "dark", "hidden", "unconscious"],
        divine: ["divine", "sacred", "holy", "spiritual"],
    };
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
        if (keywords.some((keyword) => content.includes(keyword))) {
            themes.push(theme);
        }
    });
    return themes;
}
function detectTimingPattern(dates) {
    if (dates.length < 2)
        return "singular";
    const intervals = dates
        .slice(1)
        .map((date, i) => date.getTime() - dates[i].getTime());
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const dayInMs = 24 * 60 * 60 * 1000;
    if (avgInterval < dayInMs)
        return "intense_clustering";
    if (avgInterval < 7 * dayInMs)
        return "weekly_rhythm";
    if (avgInterval < 28 * dayInMs)
        return "lunar_cycle";
    if (avgInterval < 365 * dayInMs)
        return "seasonal_pattern";
    return "long_arc";
}
function determineSymbolicSignificance(sync) {
    const count = sync.occurrences.length;
    const elementDiversity = new Set(sync.occurrences.map((o) => o.element)).size;
    const hasIntenseClustering = sync.pattern === &quot;intense_clustering&quot;;
    if (count >= 7 && elementDiversity >= 3) {
        return "Major archetypal activation - this symbol is a primary guide";
    }
    if (hasIntenseClustering) {
        return "Urgent message from the unconscious - pay immediate attention";
    }
    if (sync.pattern === "lunar_cycle") {
        return "Rhythmic teaching aligned with natural cycles";
    }
    if (elementDiversity >= 4) {
        return "Cross-elemental integration symbol - bridging all aspects";
    }
    return "Emerging symbolic teacher - watch for deeper patterns";
}
function detectAdvancedMysticalPatterns(memories) {
    const insights = [];
    // Elemental progression patterns
    const elementalJourney = memories
        .filter((m) => m.element)
        .map((m) => m.element);
    if (elementalJourney.includes("fire") &&
        elementalJourney.includes("water") &&
        elementalJourney.includes("earth") &&
        elementalJourney.includes("air")) {
        insights.push({
            insight: "You have journeyed through all elements - integration into Aether consciousness is available",
            recognizedAt: new Date().toISOString(),
            triggers: ["elemental_completion"],
            depth: "integrated",
            relatedMemories: memories
                .filter((m) => m.element)
                .map((m) => m.id)
                .slice(-4),
        });
    }
    // Dark night to dawn pattern
    const darkNightMemories = memories.filter((m) => m.content.toLowerCase().includes("dark") ||
        m.content.toLowerCase().includes("lost") ||
        m.content.toLowerCase().includes("despair"));
    const dawnMemories = memories.filter((m) => m.content.toLowerCase().includes("light") ||
        m.content.toLowerCase().includes("hope") ||
        m.content.toLowerCase().includes("breakthrough"));
    if (darkNightMemories.length > 0 && dawnMemories.length > 0) {
        const lastDark = new Date(darkNightMemories[darkNightMemories.length - 1].timestamp);
        const firstLight = dawnMemories.find((m) => new Date(m.timestamp) > lastDark);
        if (firstLight) {
            insights.push({
                insight: "Dark night of the soul completed - dawn of new consciousness emerging",
                recognizedAt: new Date().toISOString(),
                triggers: ["dark_night_completion"],
                depth: "deep",
                relatedMemories: [
                    ...darkNightMemories.slice(-2).map((m) => m.id),
                    firstLight.id,
                ],
            });
        }
    }
    return insights;
}
// Alternative function exports for compatibility
const storeMemoryItem = async (userId, content, metadata) => {
    return exports.memoryService.store(userId, content, undefined, undefined, undefined, metadata);
};
exports.storeMemoryItem = storeMemoryItem;
const getRelevantMemories = async (userId, query, limit = 10) => {
    const memories = await exports.memoryService.recall(userId, { userId, limit });
    // Simple relevance filtering if query provided
    if (query) {
        const queryLower = query.toLowerCase();
        return memories.filter((memory) => memory.content.toLowerCase().includes(queryLower) ||
            (memory.metadata?.symbols &&
                memory.metadata.symbols.some((symbol) => symbol.toLowerCase().includes(queryLower))));
    }
    return memories;
};
exports.getRelevantMemories = getRelevantMemories;
const getAggregatedWisdom = async (userId) => {
    const memories = await exports.memoryService.recall(userId);
    // Extract key insights from memories
    const wisdom = memories
        .filter((memory) => memory.confidence && memory.confidence > 0.7)
        .map((memory) => memory.content)
        .slice(0, 20); // Top 20 high-confidence memories
    return wisdom;
};
exports.getAggregatedWisdom = getAggregatedWisdom;
// Get spiritual pattern insights for oracle responses
const getSpiritualPatternInsights = async (userId) => {
    const insights = await exports.memoryService.getMemoryInsights(userId);
    // Extract active themes
    const activeThemes = insights.spiritualThemes
        ?.filter((theme) => theme.frequency >= 3)
        .map((theme) => theme.name) || [];
    // Current synchronicities
    const currentSynchronicities = insights.synchronicities
        ?.filter((sync) => sync.pattern === "intense_clustering")
        .map((sync) => `${sync.symbol}: ${sync.significance}`) || [];
    // Emerging insights
    const emergingInsights = insights.mysticalInsights
        ?.filter((insight) => insight.depth === "emerging" || insight.depth === "deep")
        .map((insight) => insight.insight) || [];
    return {
        activeThemes,
        currentSynchronicities,
        emergingInsights,
        elementalBalance: insights.elementBreakdown || {},
    };
};
exports.getSpiritualPatternInsights = getSpiritualPatternInsights;
// Class-based MemoryService for compatibility
class MemoryService {
    async storeMemory(params) {
        return exports.memoryService.store(params.userId, params.content, params.element, params.sourceAgent, params.confidence, params.metadata);
    }
    async getMemoryInsights(userId) {
        return exports.memoryService.getMemoryInsights(userId);
    }
    async recallMemories(userId, query) {
        return exports.memoryService.recall(userId, query);
    }
    async retrieveMemories(userId, query) {
        return exports.memoryService.recall(userId, query);
    }
    async createSharedSpace(userId, name, participants) {
        // Placeholder implementation for shared spaces
        return {
            id: Date.now().toString(),
            userId,
            name,
            participants: participants || [],
            createdAt: new Date().toISOString(),
        };
    }
    async listSharedSpaces(userId) {
        // Placeholder implementation
        return [];
    }
}
exports.MemoryService = MemoryService;
// Additional helper functions for spiritual pattern detection
function detectSpiritualKeywords(content) {
    const keywords = [];
    const spiritualTerms = {
        awakening: ["awaken", "wake up", "conscious", "realize"],
        transformation: ["transform", "transmute", "alchemize", "metamorphosis"],
        shadow: ["shadow", "darkness", "hidden", "repressed"],
        light: ["light", "illuminate", "radiant", "bright"],
        soul: ["soul", "spirit", "essence", "higher self"],
        divine: ["divine", "god", "goddess", "sacred"],
        kundalini: ["kundalini", "serpent", "energy rising", "spine"],
        chakra: ["chakra", "energy center", "vortex", "wheel"],
        meditation: ["meditat", "contemplat", "mindful", "presence"],
        synchronicity: ["synchron", "coincidence", "meaningful", "sign"],
    };
    const lowerContent = content.toLowerCase();
    Object.entries(spiritualTerms).forEach(([category, terms]) => {
        if (terms.some((term) => lowerContent.includes(term))) {
            keywords.push(category);
        }
    });
    return keywords;
}
function calculateMoonPhase() {
    // Simplified moon phase calculation
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    const day = now.getDate();
    // Using a simplified algorithm - for production, use a proper astronomical library
    let c, e, jd, b;
    if (month < 3) {
        year--;
        month += 12;
    }
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    b = Math.floor(jd); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round
    const phases = [
        &quot;new_moon&quot;,
        "waxing_crescent",
        "first_quarter",
        "waxing_gibbous",
        "full_moon",
        "waning_gibbous",
        "last_quarter",
        "waning_crescent",
    ];
    return phases[b % 8];
}
function getCurrentSeasonalEnergy() {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    // Northern hemisphere seasons with energetic qualities
    if ((month === 11 && day >= 21) ||
        month === 0 ||
        month === 1 ||
        (month === 2 && day < 20)) {
        return "winter_introspection";
    }
    else if ((month === 2 && day >= 20) ||
        month === 3 ||
        month === 4 ||
        (month === 5 && day < 21)) {
        return "spring_renewal";
    }
    else if ((month === 5 && day >= 21) ||
        month === 6 ||
        month === 7 ||
        (month === 8 && day < 23)) {
        return "summer_expansion";
    }
    else {
        return "autumn_harvest";
    }
}
async function checkForEmergingPatterns(memories, newMemory) {
    const patterns = [];
    // Check for symbol repetition in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSymbols = memories
        .filter((m) => new Date(m.timestamp) > weekAgo)
        .flatMap((m) => m.metadata?.symbols || []);
    const symbolCounts = recentSymbols.reduce((acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1;
        return acc;
    }, {});
    // Alert if any symbol appears 3+ times in a week
    Object.entries(symbolCounts).forEach(([symbol, count]) => {
        if (count >= 3) {
            patterns.push({
                type: "recurring_symbol",
                data: { symbol, count, timeframe: "weekly" },
            });
        }
    });
    // Check for elemental imbalance
    const elementCounts = memories
        .filter((m) => m.element)
        .reduce((acc, m) => {
        acc[m.element] = (acc[m.element] || 0) + 1;
        return acc;
    }, {});
    const totalElemental = Object.values(elementCounts).reduce((a, b) => a + b, 0);
    Object.entries(elementCounts).forEach(([element, count]) => {
        const percentage = (count / totalElemental) * 100;
        if (percentage > 60) {
            patterns.push({
                type: "elemental_dominance",
                data: { element, percentage, recommendation: "seek_balance" },
            });
        }
    });
    // Check for spiritual emergence patterns
    const spiritualKeywords = memories.flatMap((m) => m.metadata?.spiritualKeywords || []);
    if (spiritualKeywords.filter((k) => k === "awakening").length >= 3) {
        patterns.push({
            type: "awakening_process",
            data: { stage: "active", intensity: "high" },
        });
    }
    return patterns;
}
// Default export
exports.default = exports.memoryService;
