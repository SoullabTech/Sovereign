/**
 * ACCESS_RULES - Auto-generated from OFFERINGS_INVENTORY.json
 * Generated: 2026-01-20T19:38:57.240Z
 * Source version: 1.0.0
 *
 * DO NOT EDIT MANUALLY - Run scripts/generate-access-matrix.ts
 */

export const ACCESS_RULES: AccessRule[] = [
  // Access + Identity
  { exact: '/', public: true, notes: 'Landing page' },
  { exact: '/signup', public: true, notes: 'Sign up' },
  { exact: '/signin', public: true, notes: 'Sign in' },
  { exact: '/reset-password', public: true, notes: 'Password reset' },
  { exact: '/magic-link-success', public: true, notes: 'Magic link success' },
  { exact: '/oauth-success', public: true, notes: 'OAuth success' },
  { prefix: '/onboarding', public: true, notes: 'Onboarding' },
  { prefix: '/welcome', public: true, notes: 'Welcome flow' },
  { prefix: '/beta-', public: true, notes: 'Invite-gated' },

  // Trust & Stewardship (public)
  { exact: '/maia/stewardship', public: true, notes: 'Stewardship & sustainability' },
  { exact: '/maia/privacy', public: true, notes: 'Privacy & sovereignty' },
  { exact: '/account/settings', minTier: 'free', notes: 'Account settings' },
  { exact: '/account/security', minTier: 'free', notes: 'Account security' },

  // Dashboard + Core
  { exact: '/dashboard', minTier: 'personal', notes: 'Dashboard home' },
  { exact: '/dashboard/overview', minTier: 'personal', notes: 'Dashboard overview' },
  { exact: '/dashboard/dreams', minTier: 'personal', notes: 'Dreams' },
  { exact: '/dashboard/shadow', minTier: 'personal', notes: 'Shadow work' },
  { exact: '/dashboard/relationships', minTier: 'personal', notes: 'Relationships' },
  { exact: '/dashboard/reflections', minTier: 'personal', notes: 'Reflections' },
  { exact: '/dashboard/evolution', minTier: 'personal', notes: 'Evolution' },
  { exact: '/dashboard/metrics', minTier: 'personal', notes: 'Metrics' },
  { exact: '/dashboard/export', minTier: 'personal', notes: 'Export' },
  { exact: '/dashboard/settings', minTier: 'personal', notes: 'Settings' },
  { exact: '/dashboard/theme', minTier: 'personal', notes: 'Theme' },
  { exact: '/dashboard/help', minTier: 'personal', notes: 'Help' },
  { exact: '/dashboard/diamond', minTier: 'pro', notes: 'Diamond features' },
  { prefix: '/dashboard/beta', minTier: 'pro', notes: 'Beta analytics' },
  { exact: '/dashboard/ops', minTier: 'pro', notes: 'Operations' },

  // MAIA Interface
  { exact: '/maia', minTier: 'personal', notes: 'MAIA main' },
  { exact: '/maia/compact', minTier: 'personal', notes: 'MAIA compact' },
  { exact: '/ask-maia', minTier: 'personal', notes: 'Ask MAIA' },
  { exact: '/maia/mandala', minTier: 'personal', notes: 'Mandala' },
  { exact: '/maia/field-dashboard', minTier: 'personal', notes: 'Field dashboard' },
  { exact: '/maia/soul-consciousness', minTier: 'personal', notes: 'Soul consciousness' },
  { exact: '/maia/consciousness-computing', minTier: 'personal', notes: 'Consciousness computing' },
  { exact: '/maia/interfaces', minTier: 'personal', notes: 'Interface selection' },
  { exact: '/maia/membership', minTier: 'free', notes: 'Membership (accessible to all authed users)' },
  { exact: '/maia/training', minTier: 'personal', notes: 'Training' },
  { exact: '/maia/realtime-monitor', minTier: 'pro', notes: 'Real-time monitor' },
  { exact: '/maia/labtools', minTier: 'pro', notes: 'Lab tools' },
  { exact: '/maia/invites', minTier: 'pro', notes: 'Invites' },

  // Community Commons
  { exact: '/maia/community', public: true, notes: 'Community hub' },
  { exact: '/maia/community/library', public: true, notes: 'Library browse' },
  { exact: '/maia/community/wisdom-sources', public: true, notes: 'Wisdom sources' },
  { exact: '/maia/community/faq', public: true, notes: 'FAQ' },
  { exact: '/maia/community/events', public: true, notes: 'Events' },
  { exact: '/maia/community/commons', public: true, notes: 'Commons home' },
  { prefix: '/maia/community/content', public: true, notes: 'Content pages' },
  { prefix: '/maia/community/category', public: true, notes: 'Category view' },
  { prefix: '/maia/community/territory', public: true, notes: 'Territory view' },
  { exact: '/maia/community/commons/orientation', public: true, notes: 'Safety orientation' },
  { exact: '/maia/community/contribute', minTier: 'personal', notes: 'Contribute' },
  { exact: '/maia/community/commons/my-offerings', minTier: 'personal', notes: 'My offerings' },
  { exact: '/maia/community/share', minTier: 'personal', notes: 'Share' },
  { exact: '/maia/community/new-post', minTier: 'personal', notes: 'New post' },
  { exact: '/maia/community/chat', minTier: 'personal', notes: 'Chat' },
  { exact: '/maia/community/reality-check', minTier: 'personal', notes: 'Reality check' },
  { exact: '/maia/community/commons/review', minTier: 'pro', rolesAnyOf: ['curator', 'steward', 'admin'], notes: 'Review queue' },

  // Elemental Alchemy
  { exact: '/maia/community/elemental-alchemy', minTier: 'personal', notes: 'Hub' },
  { exact: '/maia/community/elemental-alchemy/assessment', minTier: 'personal', notes: 'Assessment' },
  { exact: '/maia/community/elemental-alchemy/practices', minTier: 'personal', notes: 'Practices' },
  { exact: '/maia/community/elemental-alchemy/journal', minTier: 'personal', notes: 'Journal' },
  { exact: '/maia/community/elemental-alchemy/reader', minTier: 'personal', notes: 'Reader' },

  // Oracle + Divination
  { exact: '/oracle', public: true, notes: 'Limited for free' },
  { exact: '/oracle/library', public: true, notes: 'Oracle library' },
  { exact: '/oracle/iching', minTier: 'personal', notes: 'I-Ching' },
  { exact: '/oracle/tarot', minTier: 'personal', notes: 'Tarot' },
  { exact: '/oracle/runes', minTier: 'personal', notes: 'Runes' },
  { exact: '/oracle/yijing', minTier: 'personal', notes: 'Yi Jing' },
  { exact: '/oracle/consciousness', minTier: 'personal', notes: 'Consciousness oracle' },
  { exact: '/oracle/interactive', minTier: 'personal', notes: 'Interactive oracle' },

  // Astrology
  { exact: '/astrology', public: true, notes: 'Astrology hub' },
  { exact: '/birth-chart', minTier: 'personal', notes: 'Birth chart' },
  { exact: '/chart', minTier: 'personal', notes: 'Chart generator' },
  { exact: '/astrology/chinese', minTier: 'personal', notes: 'Chinese astrology' },
  { exact: '/astrology/mayan', minTier: 'personal', notes: 'Mayan astrology' },
  { exact: '/astrology/vedic', minTier: 'personal', notes: 'Vedic astrology' },
  { prefix: '/astrology/aspects', minTier: 'personal', notes: 'Aspects' },
  { prefix: '/astrology/pathways', minTier: 'personal', notes: 'Pathways' },
  { exact: '/astrology/synastry', minTier: 'personal', notes: 'Synastry' },
  { prefix: '/astrology/synastry', minTier: 'personal', notes: 'Saved synastry' },

  // Consciousness Systems
  { exact: '/consciousness/dashboard', minTier: 'personal', notes: 'Dashboard' },
  { exact: '/consciousness/meditation', minTier: 'personal', notes: 'Meditation' },
  { exact: '/consciousness/omnidimensional-test', minTier: 'personal', notes: 'Omnidimensional test' },
  { exact: '/consciousness/portals', minTier: 'personal', notes: 'Portals' },
  { exact: '/consciousness-computing', minTier: 'personal', notes: 'Computing' },
  { exact: '/consciousness-computing/feedback', minTier: 'personal', notes: 'Computing feedback' },
  { exact: '/consciousness-computing/pwa', minTier: 'personal', notes: 'Computing PWA' },
  { exact: '/consciousness-insights', minTier: 'personal', notes: 'Insights' },
  { exact: '/consciousness/portals/admin', minTier: 'pro', rolesAnyOf: ['admin', 'steward'], notes: 'Portal admin' },
  { exact: '/consciousness/portals/analytics', minTier: 'pro', rolesAnyOf: ['admin', 'steward'], notes: 'Portal analytics' },
  { exact: '/consciousness-lab', minTier: 'pro', notes: 'Consciousness lab' },
  { exact: '/consciousness-monitor', minTier: 'pro', notes: 'Consciousness monitor' },
  { exact: '/pfi-monitor', minTier: 'pro', notes: 'PFI monitor' },

  // Lab Tools
  { exact: '/labtools', minTier: 'pro', notes: 'Lab tools hub' },
  { exact: '/labtools/ain', minTier: 'pro', notes: 'AIN' },
  { exact: '/labtools/beta-testing', minTier: 'pro', notes: 'Beta testing' },
  { exact: '/labtools/books', minTier: 'pro', notes: 'Books' },
  { exact: '/labtools/elemental-alchemy', minTier: 'pro', notes: 'Elemental alchemy labs' },
  { exact: '/labtools/field-analytics', minTier: 'pro', notes: 'Field analytics' },
  { exact: '/labtools/gifts', minTier: 'pro', notes: 'Gifts' },
  { exact: '/labtools/journal', minTier: 'pro', notes: 'Journal labs' },
  { exact: '/labtools/language', minTier: 'pro', notes: 'Language tools' },
  { exact: '/labtools/metrics', minTier: 'pro', notes: 'Metrics labs' },
  { exact: '/labtools/navigator', minTier: 'pro', notes: 'Navigator' },
  { exact: '/labtools/prompts', minTier: 'pro', notes: 'Prompts library' },
  { exact: '/labtools/rlm', minTier: 'pro', notes: 'RLM system' },
  { exact: '/labtools/settings', minTier: 'pro', notes: 'Lab settings' },
  { exact: '/labtools/sovereignty', minTier: 'pro', notes: 'Sovereignty tools' },
  { exact: '/labtools/voice', minTier: 'pro', notes: 'Voice tools' },
  { exact: '/labtools/admin/beta-testers', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Admin beta testers' },

  // Admin + Stewardship
  { exact: '/admin', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Admin panel' },
  { exact: '/admin/beta-testers', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Beta testers' },
  { exact: '/admin/consciousness-analytics', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Consciousness analytics' },
  { exact: '/admin/opus-pulse', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Opus Pulse admin' },
  { prefix: '/admin/partners', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Partner admin' },
  { exact: '/steward/opus-pulse', minTier: 'pro', rolesAnyOf: ['steward', 'admin'], notes: 'Steward Opus Pulse' },

  // Practitioner Portal
  { regex: /^/portal/[^/]+$/, public: true, notes: 'Portal home' },
  { regex: /^/portal/[^/]+/about$/, public: true, notes: 'About' },
  { regex: /^/portal/[^/]+/services$/, public: true, notes: 'Services' },
  { regex: /^/portal/[^/]+/book$/, public: true, notes: 'Booking' },
  { regex: /^/portal/[^/]+/faq$/, public: true, notes: 'FAQ' },
  { regex: /^/portal/[^/]+/free$/, public: true, notes: 'Free offer' },
  { regex: /^/portal/[^/]+/learn$/, public: true, notes: 'Learning hub' },
  { regex: /^/portal/[^/]+/learn/[^/]+$/, public: true, notes: 'Article' },
  { exact: '/practitioner/dashboard', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Practitioner dashboard' },
  { regex: /^/practitioner/[^/]+/admin$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Practitioner admin' },
  { regex: /^/practitioner/[^/]+/admin/clients$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Client management' },
  { regex: /^/portal/[^/]+/admin$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Portal admin' },
  { exact: '/practitioners/signup', minTier: 'pro', notes: 'Practitioner signup' },
  { prefix: '/practitioners/onboarding', minTier: 'pro', notes: 'Practitioner onboarding' },

  // Stellium (Practice Management)
  { exact: '/stellium', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Stellium hub' },
  { exact: '/stellium/clients', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Clients' },
  { regex: /^/stellium/clients/[^/]+$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Client detail' },
  { exact: '/stellium/marketing', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Marketing' },
  { exact: '/stellium/marketing/campaigns', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Campaigns' },
  { exact: '/stellium/marketing/contacts', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Contacts' },
  { exact: '/stellium/marketing/generate', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Content generation' },
  { exact: '/stellium/persona', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Persona' },
  { exact: '/stellium/sessions', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Sessions' },
  { regex: /^/stellium/sessions/[^/]+$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Session detail' },
  { exact: '/stellium/settings', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Settings' },

  // Caseload (Clinical Notes)
  { exact: '/caseload', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Caseload list' },
  { regex: /^/caseload/[^/]+$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Case detail' },
  { regex: /^/caseload/[^/]+/notes$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Case notes' },
  { regex: /^/caseload/[^/]+/notes/new$/, minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'New note' },

  // Book Companion
  { exact: '/book/companion', minTier: 'personal', notes: 'Book companion' },
  { exact: '/book/ask', minTier: 'personal', notes: 'Book ask' },
  { exact: '/book-companion/ain', minTier: 'personal', notes: 'Book companion AIN' }

];