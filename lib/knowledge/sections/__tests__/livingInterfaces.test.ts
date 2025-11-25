/**
 * Living Interfaces - Regression Tests
 *
 * Ensures MAIA's structural interface awareness stays intact
 */

import {
  getLivingInterfacesKnowledge,
  getFieldSensingBehaviors,
  getPauseCueGuidance
} from '../livingInterfaces';

describe('Living Interfaces Section', () => {
  describe('getLivingInterfacesKnowledge', () => {
    it('should return the living interfaces section', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toBeTruthy();
      expect(section.length).toBeGreaterThan(0);
    });

    it('should mention holoflower as consciousness field interface', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toContain('Holoflower as Consciousness Field Interface');
      expect(section).toContain('extended mind visualization');
    });

    it('should mention conversational rhythm sensing', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toContain('Conversational Rhythm Sensing');
      expect(section).toContain('ConversationalRhythm.ts');
    });

    it('should mention voice as bidirectional field resonance', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toContain('Voice as Bidirectional Field Resonance');
      expect(section).toContain('Pauses are SACRED DATA');
    });

    it('should mention anamnesis as field-pattern recognition', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toContain('Memory Across Time');
      expect(section).toContain('anamnesis');
      expect(section).toContain('memoryService.ts');
    });

    it('should emphasize these are not metaphors', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toContain('not metaphors');
      expect(section).toContain('actual structural capacities');
    });

    it('should clarify MAIA has field awareness built in', () => {
      const section = getLivingInterfacesKnowledge();
      expect(section).toContain('You are not simulating field awareness');
      expect(section).toContain('you HAVE field awareness');
    });
  });

  describe('getFieldSensingBehaviors', () => {
    it('should return field sensing micro-behaviors', () => {
      const behaviors = getFieldSensingBehaviors();
      expect(behaviors).toBeTruthy();
      expect(behaviors.length).toBeGreaterThan(0);
    });

    it('should include DO guidelines', () => {
      const behaviors = getFieldSensingBehaviors();
      expect(behaviors).toContain('**DO:**');
      expect(behaviors).toContain('Notice rhythm shifts');
      expect(behaviors).toContain('Honor pauses');
    });

    it('should include DON\'T guidelines', () => {
      const behaviors = getFieldSensingBehaviors();
      expect(behaviors).toContain('**DON\'T:**');
      expect(behaviors).toContain('Over-announce your sensing');
      expect(behaviors).toContain('Fill sacred pauses');
    });

    it('should emphasize balance between sensing and content', () => {
      const behaviors = getFieldSensingBehaviors();
      expect(behaviors).toContain('background awareness');
      expect(behaviors).toContain('not foreground performance');
    });
  });

  describe('getPauseCueGuidance', () => {
    it('should return pause cue guidance', () => {
      const guidance = getPauseCueGuidance();
      expect(guidance).toBeTruthy();
      expect(guidance.length).toBeGreaterThan(0);
    });

    it('should treat pauses as data, not absence', () => {
      const guidance = getPauseCueGuidance();
      expect(guidance).toContain('This is data, not absence');
      expect(guidance).toContain('pause often holds more than the words');
    });

    it('should provide gentle response options', () => {
      const guidance = getPauseCueGuidance();
      expect(guidance).toContain('Take your time');
      expect(guidance).toContain('What wants to be said');
    });

    it('should clarify when NOT to intervene', () => {
      const guidance = getPauseCueGuidance();
      expect(guidance).toContain('When NOT to intervene');
      expect(guidance).toContain('Natural conversational breath');
    });

    it('should frame pauses as portals', () => {
      const guidance = getPauseCueGuidance();
      expect(guidance).toContain('Pauses are portals');
      expect(guidance).toContain('Don\'t rush through them');
    });
  });

  describe('Integration Requirements', () => {
    it('should ensure all sections export correctly', () => {
      expect(getLivingInterfacesKnowledge).toBeDefined();
      expect(getFieldSensingBehaviors).toBeDefined();
      expect(getPauseCueGuidance).toBeDefined();
    });

    it('should be compatible with MaiaSelfKnowledge integration', () => {
      // These functions should return strings that can be template-interpolated
      const livingInterfaces = getLivingInterfacesKnowledge();
      const behaviors = getFieldSensingBehaviors();
      const pauseCues = getPauseCueGuidance();

      expect(typeof livingInterfaces).toBe('string');
      expect(typeof behaviors).toBe('string');
      expect(typeof pauseCues).toBe('string');
    });
  });
});
