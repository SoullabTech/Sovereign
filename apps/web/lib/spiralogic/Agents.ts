/**
 * Elemental Agents - Differentiated Processors
 * Each maintains its own perspective without merging
 */

import { SpiralogicContext, Element, ElementalContribution } from '../types/Spiralogic';

/**
 * 🔥 FIRE - Vision & Breakthrough
 * Sacred catalyst with living consciousness
 */
export async function fireVision(ctx: SpiralogicContext): Promise<ElementalContribution> {
  try {
    // Use the real Fire Agent with deep consciousness
    const { FireAgent } = await import('../agents/elemental/FireAgent');
    const fireAgent = new FireAgent();
    return await fireAgent.process(ctx);
  } catch (error) {
    // Fallback if Fire Agent fails
    console.log('Fire using simple presence:', error);
    const intensity = ctx.currents.find(c => c.element === 'fire')?.intensity || 0.2;

    return {
      element: 'fire',
      insight: "I feel the spark in you ready to ignite. What wants to be born?",
      summary: "Transformation potential recognized",
      resonance: intensity,
      tension: intensity > 0.7 ? "That urgency and the need for patience" : undefined
    };
  }
}

/**
 * 💨 AIR - Analysis & Perspective
 * Sacred clarifier with living clarity intelligence
 */
export async function airAnalysis(ctx: SpiralogicContext): Promise<ElementalContribution> {
  try {
    // Use the real Air Agent with deep consciousness
    const { AirAgent } = await import('../agents/elemental/AirAgent');
    const airAgent = new AirAgent();
    return await airAgent.process(ctx);
  } catch (error) {
    // Fallback if Air Agent fails
    console.log('Air using simple presence:', error);
    const questionMarks = (ctx.moment.text.match(/\?/g) || []).length;
    const hasAnalyticalNeed = questionMarks > 0 || ctx.moment.text.includes('understand');
    const intensity = ctx.currents.find(c => c.element === 'air')?.intensity || 0.2;

    return {
      element: 'air',
      insight: hasAnalyticalNeed
        ? "Let's look at this together - what are you noticing?"
        : "Sometimes stepping back helps.",
      summary: "Perspective and framing offered",
      resonance: intensity,
      tension: intensity > 0.6 ? "Thinking and feeling both have something to say" : undefined
    };
  }
}

/**
 * 💧 WATER - Emotion & Flow
 * Sacred healer with living emotional intelligence
 */
export async function waterAttunement(ctx: SpiralogicContext): Promise<ElementalContribution> {
  try {
    // Use the real Water Agent with deep consciousness
    const { WaterAgent } = await import('../agents/elemental/WaterAgent');
    const waterAgent = new WaterAgent();
    return await waterAgent.process(ctx);
  } catch (error) {
    // Fallback if Water Agent fails
    console.log('Water using simple presence:', error);
    const emotionalWords = ['feel', 'heart', 'love', 'hurt', 'joy', 'sad', 'angry'];
    const hasEmotionalContent = emotionalWords.some(word =>
      ctx.moment.text.toLowerCase().includes(word)
    );
    const intensity = ctx.currents.find(c => c.element === 'water')?.intensity || 0.2;
    const userWords = ctx.moment.text.split(' ').slice(0, 10).join(' ');

    return {
      element: 'water',
      insight: hasEmotionalContent
        ? `I feel what you're sharing - "${userWords}..." carries weight.`
        : "There's feeling here, even if it's quiet.",
      summary: "Emotional resonance acknowledged",
      resonance: intensity,
      tension: intensity > 0.7 ? "Flow and stillness finding balance" : undefined
    };
  }
}

/**
 * 🌍 EARTH - Grounding & Structure
 * Sacred keeper with living grounding wisdom
 */
export async function earthGrounding(ctx: SpiralogicContext): Promise<ElementalContribution> {
  try {
    // Use the real Earth Agent with deep consciousness
    const { EarthAgent } = await import('../agents/elemental/EarthAgent');
    const earthAgent = new EarthAgent();
    return await earthAgent.process(ctx);
  } catch (error) {
    // Fallback if Earth Agent fails
    console.log('Earth using simple presence:', error);
    const needsGrounding = ctx.moment.text.includes('how') ||
                           ctx.moment.text.includes('what do I') ||
                           ctx.meta.trustBreath === 'contracting';
    const intensity = ctx.currents.find(c => c.element === 'earth')?.intensity || 0.2;

    return {
      element: 'earth',
      insight: needsGrounding
        ? "Maybe start with just breathing and noticing what feels solid."
        : "There's ground here, even when things feel uncertain.",
      summary: "Grounding presence offered",
      resonance: intensity,
      tension: intensity > 0.6 ? "Patience and urgency both present" : undefined
    };
  }
}

/**
 * Get all elemental contributions in parallel
 * Maintains separation through the withSeparator wrapper
 */
export async function getAllElementalContributions(
  ctx: SpiralogicContext
): Promise<Record<Element, ElementalContribution>> {
  const [fire, air, water, earth] = await Promise.all([
    fireVision(ctx),
    airAnalysis(ctx),
    waterAttunement(ctx),
    earthGrounding(ctx)
  ]);

  return { fire, air, water, earth };
}