import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    
    // Mock collective archetype distribution data
    const archetypeDistribution = {
      "Sage": 15,
      "Explorer": 12,
      "Magician": 18,
      "Lover": 9,
      "Jester": 7,
      "Caregiver": 11
    };

    // Generate constellation positions for archetype nodes
    const nodes = Object.entries(archetypeDistribution).map(
      ([archetype, count], i) => ({
        id: archetype,
        value: count,
        x: Math.cos((i / 6) * 2 * Math.PI) * 200,
        y: Math.sin((i / 6) * 2 * Math.PI) * 200,
      })
    );

    // Mock user archetype data
    const userArchetypes = {
      "Sage": 0.8,
      "Explorer": 0.6,
      "Magician": 0.9,
      "Lover": 0.4,
      "Jester": 0.3,
      "Caregiver": 0.5
    };

    const userNode = userId ? {
      id: "You",
      archetype: Object.entries(userArchetypes).sort(
        (a, b) => b[1] - a[1]
      )[0][0],
      x: 0,
      y: 0,
    } : null;

    return new Response(
      JSON.stringify({ nodes, userNode }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id"
        } 
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}