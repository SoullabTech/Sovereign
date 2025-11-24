"use strict";
/**
 * Decan Calculator - Degree to Decan Mapping Logic
 *
 * Integrates Swiss Ephemeris planetary positions with the 36 Faces decan system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProgressedDecan = exports.getDecanTransitTiming = exports.getStrongestDecanInfluence = exports.calculateDecanRulerDistribution = exports.calculateDecanElementDistribution = exports.getDecanSummary = exports.calculateBirthChartDecans = exports.calculatePlanetaryDecan = exports.getDegreeInSign = exports.getSignFromDegree = void 0;
const decanSystem_1 = require("./decanSystem");
/**
 * Zodiac sign boundaries in absolute degrees (0-360)
 */
const SIGN_BOUNDARIES = {
    Aries: { start: 0, end: 30 },
    Taurus: { start: 30, end: 60 },
    Gemini: { start: 60, end: 90 },
    Cancer: { start: 90, end: 120 },
    Leo: { start: 120, end: 150 },
    Virgo: { start: 150, end: 180 },
    Libra: { start: 180, end: 210 },
    Scorpio: { start: 210, end: 240 },
    Sagittarius: { start: 240, end: 270 },
    Capricorn: { start: 270, end: 300 },
    Aquarius: { start: 300, end: 330 },
    Pisces: { start: 330, end: 360 },
};
/**
 * Get zodiac sign from absolute degree
 */
function getSignFromDegree(degree) {
    const normalizedDegree = degree % 360;
    for (const [sign, bounds] of Object.entries(SIGN_BOUNDARIES)) {
        if (normalizedDegree >= bounds.start && normalizedDegree < bounds.end) {
            return sign;
        }
    }
    return 'Aries'; // Default fallback
}
exports.getSignFromDegree = getSignFromDegree;
/**
 * Get degree within sign (0-30) from absolute degree (0-360)
 */
function getDegreeInSign(absoluteDegree) {
    const normalizedDegree = absoluteDegree % 360;
    return normalizedDegree % 30;
}
exports.getDegreeInSign = getDegreeInSign;
function calculatePlanetaryDecan(planet, absoluteDegree) {
    const sign = getSignFromDegree(absoluteDegree);
    const degreeInSign = getDegreeInSign(absoluteDegree);
    const decan = (0, decanSystem_1.getDecanByDegree)(absoluteDegree);
    if (!decan) {
        console.error(`Could not find decan for ${planet} at ${absoluteDegree}°`);
        return null;
    }
    return {
        planet,
        absoluteDegree,
        sign,
        degreeInSign,
        decan,
        decanNumber: decan.decanNumber,
        decanRuler: decan.ruler,
        interpretation: (0, decanSystem_1.interpretPlanetInDecan)(planet, decan),
    };
}
exports.calculatePlanetaryDecan = calculatePlanetaryDecan;
function calculateBirthChartDecans(planetaryPositions) {
    const decans = {};
    const planets = [
        'Sun',
        'Moon',
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
        'Pluto',
        'NorthNode',
    ];
    for (const planet of planets) {
        const position = planetaryPositions.get(planet);
        if (position) {
            const planetDecan = calculatePlanetaryDecan(planet, position.degree);
            if (planetDecan) {
                decans[planet] = planetDecan;
            }
        }
    }
    return decans;
}
exports.calculateBirthChartDecans = calculateBirthChartDecans;
/**
 * Get decan interpretation summary for chart overview
 */
function getDecanSummary(decans) {
    const lines = [
        '═══════════════════════════════════════════════════════════',
        '🎭 THE 36 FACES - YOUR DECAN PLACEMENTS',
        '═══════════════════════════════════════════════════════════',
        '',
    ];
    // Most important: Sun, Moon, Ascendant
    const keyPoints = ['Sun', 'Moon', 'Ascendant'];
    for (const point of keyPoints) {
        const decan = decans[point];
        if (decan) {
            lines.push(`✨ ${point.toUpperCase()}`);
            lines.push(`   ${decan.decan.name} (${decan.sign} Decan ${decan.decanNumber})`);
            lines.push(`   Ruler: ${decan.decanRuler} | Tarot: ${decan.decan.tarotCard}`);
            lines.push(`   ${decan.decan.archetype}: ${decan.decan.symbolism}`);
            lines.push('');
        }
    }
    // Personal planets
    lines.push('🌟 PERSONAL PLANETS');
    const personalPlanets = ['Mercury', 'Venus', 'Mars'];
    for (const planet of personalPlanets) {
        const decan = decans[planet];
        if (decan) {
            lines.push(`   ${planet}: ${decan.decan.name} (${decan.decanRuler})`);
        }
    }
    lines.push('');
    // Outer planets
    lines.push('🪐 TRANSPERSONAL PLANETS');
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    for (const planet of outerPlanets) {
        const decan = decans[planet];
        if (decan) {
            lines.push(`   ${planet}: ${decan.decan.name} (${decan.decanRuler})`);
        }
    }
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    return lines.join('\n');
}
exports.getDecanSummary = getDecanSummary;
function calculateDecanElementDistribution(decans) {
    const distribution = {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0,
    };
    for (const planetDecan of Object.values(decans)) {
        if (planetDecan) {
            distribution[planetDecan.decan.element]++;
        }
    }
    return distribution;
}
exports.calculateDecanElementDistribution = calculateDecanElementDistribution;
function calculateDecanRulerDistribution(decans) {
    const distribution = {
        Mars: 0,
        Venus: 0,
        Mercury: 0,
        Moon: 0,
        Sun: 0,
        Jupiter: 0,
        Saturn: 0,
    };
    for (const planetDecan of Object.values(decans)) {
        if (planetDecan) {
            distribution[planetDecan.decanRuler]++;
        }
    }
    return distribution;
}
exports.calculateDecanRulerDistribution = calculateDecanRulerDistribution;
/**
 * Find strongest decan influence in chart
 */
function getStrongestDecanInfluence(decans) {
    const distribution = calculateDecanRulerDistribution(decans);
    let maxRuler = null;
    let maxCount = 0;
    for (const [ruler, count] of Object.entries(distribution)) {
        if (count > maxCount) {
            maxCount = count;
            maxRuler = ruler;
        }
    }
    if (!maxRuler || maxCount === 0)
        return null;
    const interpretations = {
        Mars: 'Your chart is strongly colored by Martian decan energy - courage, action, pioneering spirit, and warrior consciousness dominate your path.',
        Venus: 'Your chart resonates with Venusian decan energy - beauty, love, harmony, and aesthetic sensibility shape your journey.',
        Mercury: 'Your chart is infused with Mercurial decan energy - communication, intelligence, adaptability, and mental agility define your way.',
        Moon: 'Your chart flows with Lunar decan energy - emotion, intuition, nurturing, and psychic sensitivity guide your soul.',
        Sun: 'Your chart radiates Solar decan energy - leadership, creativity, vitality, and conscious self-expression illuminate your purpose.',
        Jupiter: 'Your chart expands with Jupiterian decan energy - wisdom, growth, abundance, and philosophical vision propel your evolution.',
        Saturn: 'Your chart is structured by Saturnian decan energy - discipline, mastery, responsibility, and earned authority form your foundation.',
    };
    return {
        ruler: maxRuler,
        count: maxCount,
        interpretation: interpretations[maxRuler],
    };
}
exports.getStrongestDecanInfluence = getStrongestDecanInfluence;
/**
 * Generate decan-based timing recommendations
 */
function getDecanTransitTiming(decan) {
    return {
        solarTransit: decan.ritualTiming,
        lunarPhase: decan.decan.tarotSuit === 'Cups' ? 'Full Moon optimal' :
            decan.decanNumber === 1 ? 'New Moon optimal' :
                decan.decanNumber === 2 ? 'First Quarter optimal' :
                    'Last Quarter optimal',
        planetaryHour: `${decan.ruler} hour during ${decan.sign} season`,
        ritualSuggestions: [
            decan.magicalPower,
            `Work with ${decan.ruler} energy`,
            `Meditate on ${decan.tarotCard}`,
            `Invoke archetype: ${decan.archetype}`,
        ],
    };
}
exports.getDecanTransitTiming = getDecanTransitTiming;
/**
 * Calculate secondary progressions decan (for advanced timing)
 */
function calculateProgressedDecan(natalDegree, yearsProgressed) {
    // Secondary progressions: 1 day = 1 year
    // Sun progresses ~1° per year
    const progressedDegree = (natalDegree + yearsProgressed) % 360;
    const decan = (0, decanSystem_1.getDecanByDegree)(progressedDegree);
    if (!decan)
        return null;
    return calculatePlanetaryDecan('Progressed Point', progressedDegree);
}
exports.calculateProgressedDecan = calculateProgressedDecan;
/**
 * Export all calculation functions
 */
exports.default = {
    getSignFromDegree,
    getDegreeInSign,
    calculatePlanetaryDecan,
    calculateBirthChartDecans,
    getDecanSummary,
    calculateDecanElementDistribution,
    calculateDecanRulerDistribution,
    getStrongestDecanInfluence,
    getDecanTransitTiming,
    calculateProgressedDecan,
};
//# sourceMappingURL=decanCalculator.js.map