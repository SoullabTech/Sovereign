// src/services/facetService.ts

export interface Facet {
  id: string;
  name: string;
  description?: string;
  element?: "Fire" | "Water" | "Earth" | "Air" | "Aether";
}

const mockFacets: Record<string, Facet> = {
  "fire-1": {
    id: "fire-1",
    name: "Visionary Spark",
    description: "Initiates new ideas and ignites purpose.",
    element: "Fire",
  },
  "water-2": {
    id: "water-2",
    name: "Emotional Alchemy",
    description: "Facilitates emotional integration and healing.",
    element: "Water",
  },
  "earth-1": {
    id: "earth-1",
    name: "Stabilizing Root",
    description: "Grounds vision into structure and practice.",
    element: "Earth",
  },
};

export const facetService = {
  getFacet: (id: string): Facet | null => {
    return mockFacets[id] || null;
  },

  listFacets: (): Facet[] => {
    return Object.values(mockFacets);
  },

  createFacet: (facet: Facet): Facet => {
    mockFacets[facet.id] = facet;
    return facet;
  },
};
