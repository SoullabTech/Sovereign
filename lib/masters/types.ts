/**
 * Master's Field — Type System
 *
 * Each Master is a field holder. Their portal is sovereign space —
 * not a Soullab page, not a product page. A threshold into their work.
 */

export type FieldOffer = {
  title: string;
  description: string;
  cta: string;
  href: string;
};

export type FieldPortal = {
  slug: string; // 'with-me' | 'with-others' | 'hold-the-field'
  label: string;
  invitation: string; // the single line that draws someone in
  description: string;
  href: string;
};

export type MaiaPersona = {
  /** Tonal orientation for MAIA in this field */
  tone: 'somatic-precise' | 'expansive-exploratory' | 'grounded-analytical' | 'relational-warm';
  /** Response cadence */
  cadence: 'slow' | 'measured' | 'fluid';
  /** Response length tendency */
  responseStyle: 'short' | 'medium' | 'full';
  /** Core frameworks MAIA is trained to hold */
  frameworks: string[];
  /** What MAIA tracks for in this field */
  trackFor: string[];
  /** What MAIA avoids in this field */
  avoidPatterns: string[];
  /** What MAIA moves toward */
  preferPatterns: string[];
  /** System prompt addendum for this master's field */
  systemPromptBlock: string;
};

export type MasterField = {
  /** URL slug — used in routing and subdomain */
  slug: string; // e.g. 'jondi'
  subdomain: string; // e.g. 'jondi.soullab.life'
  name: string; // full name for display
  shortName: string; // first name or field name

  /** Threshold presence — what appears on landing */
  presence: {
    openingLine: string;
    subLine?: string;
    backgroundDescription: string; // visual direction
  };

  /** Full presence page — story, lineage, authority */
  story: {
    headline: string;
    lead: string;            // 2-3 sentence essence
    paragraphs: string[];    // body copy, each a paragraph
    lineage: string[];       // credentials / affiliations (brief)
    offers: FieldOffer[];    // what they offer
  };

  /** The three portals */
  portals: [FieldPortal, FieldPortal, FieldPortal];

  /** MAIA tuned to this master */
  maia: MaiaPersona;

  /** Visual identity — quick access colors for inline use */
  palette: {
    primary: string; // hex
    accent: string; // hex
    background: string; // hex
    text: string; // hex
  };

  /** Full theme — drives CSS vars, density, motion, voice */
  theme: import('./theme').FieldTheme;

  active: boolean;

  /** Slugs of partner fields that can access the /partner-view workspace */
  partnerSlugs?: string[];

  /**
   * Practitioner ID in the Stellium system.
   * When set, oracle checks practitioner_personas for a trained Virtual Self
   * before falling back to the static systemPromptBlock.
   * Set when the master registers as a practitioner in the platform.
   */
  practitionerId?: string;
};
