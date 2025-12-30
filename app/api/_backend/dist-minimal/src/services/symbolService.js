"use strict";
// oracle-backend/src/services/symbolService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSymbolicTags = extractSymbolicTags;
const facetUtil_1 = require("../utils/facetUtil");
function extractSymbolicTags(input, sourceAgent = "system") {
    const cleaned = input.trim().toLowerCase();
    if (!cleaned)
        return [];
    const element = (0, facetUtil_1.detectFacetFromInput)(cleaned);
    const symbolTag = {
        symbol: cleaned.slice(0, 25), // crude default
        agent: sourceAgent,
        element,
        facet: undefined,
        phase: undefined,
        timestamp: new Date().toISOString(),
        confidence: 0.8,
    };
    return [symbolTag];
}
