/**
 * Cross-Quadrant Weaver - Connects multiple dimensions of experience
 */

export interface QuadrantalMemory {
  earth: Map<string, any>;  // Body states
  water: Set<string>;       // Emotions
  air: Set<string>;         // Topics/thoughts
  fire: Set<string>;        // Possibilities
  aether: Set<string>;      // Paradoxes
}

export class QuadrantWeaver {
  weave(memory: QuadrantalMemory): string | null {
    // Body-Emotion bridge
    const bodyStates = Array.from(memory.earth.values());
    const urgentBody = bodyStates.find(s => s.intensity >= 0.5);
    const emotions = Array.from(memory.water);

    if (urgentBody && emotions.length > 0) {
      const responses = [
        `Your ${urgentBody.part} ${urgentBody.state} while feeling ${emotions[0]} - those often go together. What helps when both hit at once?`,
        `${urgentBody.part.charAt(0).toUpperCase() + urgentBody.part.slice(1)} ${urgentBody.state} + ${emotions[0]} feelings. How do those connect for you?`,
        `When ${emotions[0]} shows up, your ${urgentBody.part} responds with ${urgentBody.state}. What would soothe both?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Emotion-Thought connection
    const thoughts = Array.from(memory.air);
    if (emotions.length > 0 && thoughts.includes('ADHD')) {
      const responses = [
        `${emotions[0]} feelings + ADHD brain - that's an intense combo. How do you usually navigate that intersection?`,
        `ADHD and ${emotions[0]} together can be overwhelming. What tiny adjustment might help?`,
        `The ADHD-${emotions[0]} loop is real. What breaks that cycle for you?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Body-Possibility link
    const possibilities = Array.from(memory.fire);
    if (urgentBody && possibilities.length > 0) {
      return `Even with ${urgentBody.part} ${urgentBody.state}, you're thinking about ${possibilities[0]}. That tension between body saying 'stop' and mind saying 'go' - familiar?`;
    }

    // Paradox-Action bridge
    const paradoxes = Array.from(memory.aether);
    if (paradoxes.length > 0 && possibilities.length > 0) {
      return `Holding the paradox of "${paradoxes[0]}" while wanting ${possibilities[0]}. What micro-step honors both sides?`;
    }

    // Multi-emotion integration
    if (emotions.length >= 2) {
      const [first, second] = emotions;
      const responses = [
        `${first.charAt(0).toUpperCase() + first.slice(1)} AND ${second} at once. That's a lot to hold. Which needs attention first?`,
        `You're feeling both ${first} and ${second}. What would it look like to honor both?`,
        `The ${first}-${second} combo is intense. Want to focus on one or hold both?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Multi-thought complexity
    if (thoughts.length >= 2 && emotions.length > 0) {
      return `Lot happening - ${emotions[0]} emotionally, thinking about ${thoughts[0]} and ${thoughts[1]}. If you had to pick ONE thing to shift by 10%, what would it be?`;
    }

    // Body-only focus (when strong)
    if (urgentBody && urgentBody.intensity >= 0.6) {
      return `Your ${urgentBody.part} is really speaking up with that ${urgentBody.state}. What's it trying to tell you?`;
    }

    return null;
  }
}