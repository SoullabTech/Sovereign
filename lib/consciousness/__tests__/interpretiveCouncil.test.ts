/**
 * Interpretive Council — tests for normalization, registry integrity, and resolution precedence.
 *
 * Lock these down. The compatibility layer is load-bearing: old DB values must
 * resolve correctly, invalid values must fall back to 'auto', and precedence
 * rules must be deterministic.
 */

import {
  normalizeGuideId,
  resolveCouncil,
  getGuide,
  getGuidesByElement,
  getElementFromGuide,
  COUNCIL_REGISTRY,
  COUNCIL_BY_ELEMENT,
  LEGACY_FRAMEWORK_MAP,
  buildCouncilPromptSection,
  type InterpretiveGuideId,
} from '../interpretiveCouncil';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Registry integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('COUNCIL_REGISTRY integrity', () => {
  const REQUIRED_FIELDS = [
    'id', 'label', 'archetypeName', 'element', 'domain',
    'shortDescription', 'promptStyle', 'questionStyle',
    'useCases', 'avoidWhen', 'defaultTone', 'icon', 'color',
  ] as const;

  test('every guide has all required fields', () => {
    for (const [id, guide] of Object.entries(COUNCIL_REGISTRY)) {
      for (const field of REQUIRED_FIELDS) {
        expect(guide[field]).toBeDefined();
        if (typeof guide[field] === 'string') {
          expect((guide[field] as string).length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('every guide has a valid ElementalDomain', () => {
    const VALID_ELEMENTS = new Set(['aether', 'fire', 'water', 'earth', 'air']);
    for (const [id, guide] of Object.entries(COUNCIL_REGISTRY)) {
      expect(VALID_ELEMENTS.has(guide.element)).toBe(true);
    }
  });

  test('every guide id matches its registry key', () => {
    for (const [id, guide] of Object.entries(COUNCIL_REGISTRY)) {
      expect(guide.id).toBe(id);
    }
  });

  test('COUNCIL_BY_ELEMENT covers all guides exactly once', () => {
    const allFromElements = Object.values(COUNCIL_BY_ELEMENT).flat();
    const allIds = Object.keys(COUNCIL_REGISTRY) as InterpretiveGuideId[];
    expect(allFromElements.sort()).toEqual(allIds.sort());
  });

  test('every guide in COUNCIL_BY_ELEMENT matches its element field', () => {
    for (const [element, ids] of Object.entries(COUNCIL_BY_ELEMENT)) {
      for (const id of ids) {
        expect(COUNCIL_REGISTRY[id as InterpretiveGuideId].element).toBe(element);
      }
    }
  });

  test('useCases and avoidWhen are non-empty arrays', () => {
    for (const [id, guide] of Object.entries(COUNCIL_REGISTRY)) {
      expect(Array.isArray(guide.useCases)).toBe(true);
      expect(guide.useCases.length).toBeGreaterThan(0);
      expect(Array.isArray(guide.avoidWhen)).toBe(true);
      expect(guide.avoidWhen.length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Backward compatibility — normalizeGuideId
// ─────────────────────────────────────────────────────────────────────────────

describe('normalizeGuideId — compatibility', () => {
  test('null → auto', () => {
    expect(normalizeGuideId(null)).toBe('auto');
  });

  test('undefined → auto', () => {
    expect(normalizeGuideId(undefined)).toBe('auto');
  });

  test('empty string → auto', () => {
    expect(normalizeGuideId('')).toBe('auto');
  });

  test('unrecognized string → auto', () => {
    expect(normalizeGuideId('garbage')).toBe('auto');
    expect(normalizeGuideId('null')).toBe('auto');
    expect(normalizeGuideId('UNKNOWN')).toBe('auto');
  });

  // Legacy TherapeuticFramework values
  test('auto → auto', () => {
    expect(normalizeGuideId('auto')).toBe('auto');
  });

  test('jungian → jungian (direct match)', () => {
    expect(normalizeGuideId('jungian')).toBe('jungian');
  });

  test('cbt → cbt (direct match)', () => {
    expect(normalizeGuideId('cbt')).toBe('cbt');
  });

  test('somatic → somatic (direct match)', () => {
    expect(normalizeGuideId('somatic')).toBe('somatic');
  });

  test('ifs → ifs (direct match)', () => {
    expect(normalizeGuideId('ifs')).toBe('ifs');
  });

  test('humanistic → humanistic (direct match)', () => {
    expect(normalizeGuideId('humanistic')).toBe('humanistic');
  });

  test('existential → existential (direct match)', () => {
    expect(normalizeGuideId('existential')).toBe('existential');
  });

  test('tcm → tcm (direct match)', () => {
    expect(normalizeGuideId('tcm')).toBe('tcm');
  });

  // Legacy remaps
  test('relational → family_systems (remap)', () => {
    expect(normalizeGuideId('relational')).toBe('family_systems');
  });

  test('hemispheric → psychodynamic (remap)', () => {
    expect(normalizeGuideId('hemispheric')).toBe('psychodynamic');
  });

  test('alchemical → jungian (remap)', () => {
    expect(normalizeGuideId('alchemical')).toBe('jungian');
  });

  test('archetypal → spiritual (remap)', () => {
    expect(normalizeGuideId('archetypal')).toBe('spiritual');
  });

  // New guide IDs pass through
  test('new guide ids pass through unchanged', () => {
    const newIds: InterpretiveGuideId[] = [
      'psychodynamic', 'family_systems', 'developmental', 'spiritual',
    ];
    for (const id of newIds) {
      expect(normalizeGuideId(id)).toBe(id);
    }
  });

  test('every legacy map value resolves to a valid registry entry', () => {
    for (const [legacy, mapped] of Object.entries(LEGACY_FRAMEWORK_MAP)) {
      expect(COUNCIL_REGISTRY[mapped]).toBeDefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Council resolution — precedence
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveCouncil — precedence', () => {
  test('session override beats account default', () => {
    const result = resolveCouncil({
      accountDefault: 'jungian',
      sessionOverride: 'cbt',
    });
    expect(result.guide.id).toBe('cbt');
    expect(result.source).toBe('session_override');
  });

  test('account default beats auto when session is absent', () => {
    const result = resolveCouncil({
      accountDefault: 'somatic',
      sessionOverride: null,
    });
    expect(result.guide.id).toBe('somatic');
    expect(result.source).toBe('account_default');
  });

  test('account default = auto → falls through to auto_integrator', () => {
    const result = resolveCouncil({
      accountDefault: 'auto',
      sessionOverride: null,
    });
    expect(result.guide.id).toBe('auto');
    expect(result.source).toBe('auto_integrator');
  });

  test('null account default → auto_integrator', () => {
    const result = resolveCouncil({
      accountDefault: null,
      sessionOverride: null,
    });
    expect(result.guide.id).toBe('auto');
    expect(result.source).toBe('auto_integrator');
  });

  test('invalid session override → ignored, falls to account default', () => {
    // 'auto' session override is treated as absent (no override)
    const result = resolveCouncil({
      accountDefault: 'ifs',
      sessionOverride: 'auto',
    });
    expect(result.guide.id).toBe('ifs');
    expect(result.source).toBe('account_default');
  });

  test('invalid/unrecognized session override → normalises to auto → falls to account default', () => {
    const result = resolveCouncil({
      accountDefault: 'jungian',
      sessionOverride: 'nonsense_value',
    });
    // 'nonsense_value' normalises to 'auto' which is treated as absent
    expect(result.guide.id).toBe('jungian');
    expect(result.source).toBe('account_default');
  });

  test('legacy account default value resolves correctly', () => {
    const result = resolveCouncil({
      accountDefault: 'relational', // legacy → family_systems
      sessionOverride: null,
    });
    expect(result.guide.id).toBe('family_systems');
    expect(result.source).toBe('account_default');
  });

  test('legacy session override value resolves correctly', () => {
    const result = resolveCouncil({
      accountDefault: 'auto',
      sessionOverride: 'alchemical', // legacy → jungian
    });
    expect(result.guide.id).toBe('jungian');
    expect(result.source).toBe('session_override');
  });

  test('cue-based hinting only fires when source is auto_integrator', () => {
    const result = resolveCouncil({
      accountDefault: 'cbt',
      sessionOverride: null,
      message: 'I keep dreaming about this shadowy figure',
    });
    // Account default wins over cue-based; source should not be cue_based
    expect(result.source).toBe('account_default');
    expect(result.guide.id).toBe('cbt');
  });

  test('auto_integrator uses cue-based hinting when appropriate', () => {
    const result = resolveCouncil({
      accountDefault: 'auto',
      sessionOverride: null,
      message: 'I keep having this dream about a shadowy figure in my house',
    });
    expect(result.source).toBe('auto_integrator');
    expect(result.guide.id).toBe('auto');
    // Should suggest an alternative guide from the dream/shadow cue
    expect(result.alternativeGuides).toBeDefined();
    expect(result.alternativeGuides!.length).toBeGreaterThan(0);
  });

  test('resolved guide always exists in registry', () => {
    const cases = [
      { accountDefault: 'jungian', sessionOverride: null },
      { accountDefault: 'alchemical', sessionOverride: null },
      { accountDefault: null, sessionOverride: 'cbt' },
      { accountDefault: null, sessionOverride: null },
    ];
    for (const input of cases) {
      const result = resolveCouncil(input);
      expect(COUNCIL_REGISTRY[result.guide.id as InterpretiveGuideId]).toBeDefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Helper functions
// ─────────────────────────────────────────────────────────────────────────────

describe('getGuide', () => {
  test('returns correct guide for valid id', () => {
    const guide = getGuide('jungian');
    expect(guide.id).toBe('jungian');
    expect(guide.archetypeName).toBe('The Symbolist');
  });

  test('normalises legacy values', () => {
    const guide = getGuide('relational');
    expect(guide.id).toBe('family_systems');
  });

  test('normalises unrecognized values to auto', () => {
    const guide = getGuide('garbage_value');
    expect(guide.id).toBe('auto');
  });
});

describe('getGuidesByElement', () => {
  test('returns guides for water element', () => {
    const guides = getGuidesByElement('water');
    const ids = guides.map(g => g.id);
    expect(ids).toContain('jungian');
    expect(ids).toContain('ifs');
    expect(ids).toContain('psychodynamic');
  });

  test('all returned guides have matching element field', () => {
    for (const element of ['fire', 'water', 'earth', 'air', 'aether'] as const) {
      const guides = getGuidesByElement(element);
      for (const guide of guides) {
        expect(guide.element).toBe(element);
      }
    }
  });
});

describe('getElementFromGuide', () => {
  test('returns correct element for known guide', () => {
    expect(getElementFromGuide('cbt')).toBe('earth');
    expect(getElementFromGuide('jungian')).toBe('water');
    expect(getElementFromGuide('developmental')).toBe('fire');
    expect(getElementFromGuide('auto')).toBe('aether');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Prompt section generation
// ─────────────────────────────────────────────────────────────────────────────

describe('buildCouncilPromptSection', () => {
  const jungianResolution = {
    guide: COUNCIL_REGISTRY['jungian'],
    source: 'account_default' as const,
    rationale: 'test',
  };

  const autoResolution = {
    guide: COUNCIL_REGISTRY['auto'],
    source: 'auto_integrator' as const,
    rationale: 'test',
  };

  test('auto guide with no alternatives returns empty string', () => {
    const section = buildCouncilPromptSection(autoResolution, 5);
    expect(section).toBe('');
  });

  test('non-auto guide at threshold depth returns a short hint', () => {
    const section = buildCouncilPromptSection(jungianResolution, 2); // threshold
    expect(section).toBeTruthy();
    expect(section.length).toBeLessThan(500); // should be brief
    expect(section).toContain('light');
  });

  test('non-auto guide at core depth returns full orientation', () => {
    const section = buildCouncilPromptSection(jungianResolution, 5); // core
    expect(section).toContain('The Symbolist');
    expect(section).toContain('Water');
    expect(section).toContain('Interpretive orientation');
  });

  test('prompt section includes constraint statement at core depth', () => {
    const section = buildCouncilPromptSection(jungianResolution, 5);
    expect(section.toLowerCase()).toContain('constraint');
  });

  test('auto with cue-based alternatives at threshold returns light hint', () => {
    const resolution = {
      guide: COUNCIL_REGISTRY['auto'],
      source: 'auto_integrator' as const,
      rationale: 'cue test',
      alternativeGuides: ['jungian' as InterpretiveGuideId],
    };
    const section = buildCouncilPromptSection(resolution, 2);
    expect(section).toBeTruthy();
    expect(section).toContain('Integrator');
  });

  test('auto with cue-based alternatives at core depth mentions alternative guide', () => {
    const resolution = {
      guide: COUNCIL_REGISTRY['auto'],
      source: 'auto_integrator' as const,
      rationale: 'cue test',
      alternativeGuides: ['somatic' as InterpretiveGuideId],
    };
    const section = buildCouncilPromptSection(resolution, 6);
    expect(section).toContain('Body Listener');
  });
});
