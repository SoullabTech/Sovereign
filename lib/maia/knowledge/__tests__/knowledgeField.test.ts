import {
  detectKnowledgeDomains,
  getKnowledgeConceptMatches,
  getKnowledgeDomain,
  listKnowledgeDomains,
  KNOWLEDGE_FIELD,
} from '@/lib/maia/knowledge/knowledgeField';

describe('knowledgeField', () => {
  describe('detectKnowledgeDomains', () => {
    it('detects Islamic psychology', () => {
      expect(
        detectKnowledgeDomains('How does Islamic psychology understand the nafs?')
      ).toContain('islamic_psychology');
    });

    it('detects Jungian psychology', () => {
      expect(
        detectKnowledgeDomains('How does Jung understand the shadow?')
      ).toContain('jungian_psychology');
    });

    it('detects neuroscience', () => {
      expect(
        detectKnowledgeDomains('What does neuroscience say about predictive processing?')
      ).toContain('neuroscience_cognitive');
    });

    it('detects mystical/contemplative traditions', () => {
      expect(
        detectKnowledgeDomains('Tell me about the dark night of the soul')
      ).toContain('mystical_contemplative');
    });

    it('detects multiple domains (cross-domain inquiry)', () => {
      const result = detectKnowledgeDomains(
        'How does Islamic psychology relate to Jung and individuation?'
      );
      expect(result).toContain('islamic_psychology');
      expect(result).toContain('jungian_psychology');
    });

    it('detects somatics', () => {
      expect(
        detectKnowledgeDomains('How does embodiment relate to felt sense?')
      ).toContain('somatics');
    });

    it('detects attachment/trauma', () => {
      expect(
        detectKnowledgeDomains('What is earned security in attachment?')
      ).toContain('attachment_trauma');
    });

    it('detects systems theory', () => {
      expect(
        detectKnowledgeDomains('How does systems theory explain emergence?')
      ).toContain('systems_theory');
    });

    it('returns empty for unrelated input', () => {
      expect(
        detectKnowledgeDomains('What should I have for lunch?')
      ).toEqual([]);
    });
  });

  describe('getKnowledgeConceptMatches', () => {
    it('finds concept matches across domains', () => {
      const matches = getKnowledgeConceptMatches(
        'I want to understand qalb and individuation'
      );

      expect(matches.some((m) => m.label === 'Qalb')).toBe(true);
      expect(matches.some((m) => m.label === 'Individuation')).toBe(true);
    });

    it('matches aliases', () => {
      const matches = getKnowledgeConceptMatches(
        'What is the lower self and how does purification work?'
      );

      // 'lower self' is an alias for nafs, 'purification' for tazkiyah
      expect(matches.some((m) => m.conceptId === 'nafs')).toBe(true);
      expect(matches.some((m) => m.conceptId === 'tazkiyah')).toBe(true);
    });

    it('returns empty for unrelated input', () => {
      expect(
        getKnowledgeConceptMatches('The weather is nice today')
      ).toEqual([]);
    });
  });

  describe('getKnowledgeDomain', () => {
    it('returns a domain object', () => {
      const domain = getKnowledgeDomain('spiralogic');
      expect(domain?.label).toBe('Spiralogic');
      expect(domain?.concepts.length).toBeGreaterThan(0);
    });

    it('returns null for unknown domain', () => {
      expect(getKnowledgeDomain('nonexistent' as any)).toBeNull();
    });
  });

  describe('listKnowledgeDomains', () => {
    it('returns all 12 domains', () => {
      const domains = listKnowledgeDomains();
      expect(domains).toHaveLength(12);
    });
  });

  describe('registry integrity', () => {
    it('all mappings reference valid domains', () => {
      const validDomains = Object.keys(KNOWLEDGE_FIELD);

      for (const domain of Object.values(KNOWLEDGE_FIELD)) {
        for (const mapping of domain.mappings) {
          for (const relation of mapping.relatesTo) {
            expect(validDomains).toContain(relation.domain);
          }
        }
      }
    });

    it('every domain has at least one concept', () => {
      for (const domain of Object.values(KNOWLEDGE_FIELD)) {
        expect(domain.concepts.length).toBeGreaterThan(0);
      }
    });

    it('every domain has keywords', () => {
      for (const domain of Object.values(KNOWLEDGE_FIELD)) {
        expect(domain.keywords.length).toBeGreaterThan(0);
      }
    });
  });
});
