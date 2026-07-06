// Canonical Living Field dimensions. Single source of truth, imported by both
// the fields list route and the encounter route (avoids importing across
// Next.js route module files).

export const CANONICAL_FIELD_KEYS: { key: string; label: string }[] = [
  { key: 'who_i_am_becoming', label: 'Who I Am Becoming' },
  { key: 'what_i_am_learning', label: "What I'm Learning" },
  { key: 'current_life_phase', label: 'Current Life Phase' },
  { key: 'emotional_weather', label: 'Emotional Weather' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'body_soma', label: 'Body / Soma' },
  { key: 'work_vocation', label: 'Work / Vocation' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'spiritual_life', label: 'Spiritual Life / Meaning' },
  { key: 'current_questions', label: 'Current Questions' },
  { key: 'practices', label: 'Practices' },
  { key: 'dreams_symbols', label: 'Dreams / Symbols' },
  { key: 'thresholds_transitions', label: 'Thresholds / Transitions' },
]
