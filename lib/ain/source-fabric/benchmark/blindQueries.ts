export type BlindEvidenceMode='focused'|'distributed';

export interface BlindQuery {
  id:string;
  query:string;
  expectedAnswer:boolean;
  evidenceMode:BlindEvidenceMode;
  mustSources:string[];
  rationale:string;
}

export const BLIND_QUERIES:readonly BlindQuery[]=[
  {
    id:'BF1',
    query:'Which doctrine says a system portrait should orient us without becoming direct access to the truth of a person?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['interface-humility'],
    rationale:'New paraphrase of person-facing epistemic humility.',
  },
  {
    id:'BF2',
    query:'Where is the refusal of automatic memory formation protected when a person writes something?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['memory-consent','remain-unpossessed'],
    rationale:'Combines memory consent with non-formation doctrine.',
  },
  {
    id:'BF3',
    query:'Which contract requires the member to be able to return to the exact divination reading after saving it?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['divination-return'],
    rationale:'Exact-return behavior without quoting its heading.',
  },
  {
    id:'BF4',
    query:'Where are the four context states available, admitted, speakable, and disclosed defined?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['indra-permeability'],
    rationale:'Distinctive center-permeability vocabulary.',
  },
  {
    id:'BF5',
    query:'Which Indra source defines correction and decay for relations between jewels?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['indra-grammar'],
    rationale:'New exact-concept lookup inside source/relation grammar.',
  },
  {
    id:'BF6',
    query:'Where is the lineage from the Book of the Lambspring through Edward Edinger into individuation described?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['ea-manuscript'],
    rationale:'Rare-name lineage in the bounded manuscript sample.',
  },
  {
    id:'BF7',
    query:'Which architecture decision says Soullab should converge on one knowledge engine rather than maintain competing retrieval stacks?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['library-adr'],
    rationale:'New paraphrase of ADR 004.',
  },
  {
    id:'BF8',
    query:'Where does MAIA teaching law require source fidelity without impersonating the author?',
    expectedAnswer:true,evidenceMode:'focused',
    mustSources:['teaching-constitution'],
    rationale:'Teaching-authority exact concept.',
  },

  {
    id:'BD1',
    query:'Across the corpus, where do authorship and member authority constrain what AI may make of a person’s work and meaning?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['direction-authority','writers-studio','teaching-constitution'],
    rationale:'Whole-field authorship/authority synthesis.',
  },
  {
    id:'BD2',
    query:'Across the corpus, how is provenance preserved when material moves between contexts, knowledge sources, and the center?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['facet-crossings','ea-canon','indra-grammar'],
    rationale:'Provenance across House, ingestion, and center architecture.',
  },
  {
    id:'BD3',
    query:'Across these sources, how is similarity allowed to orient without silently becoming authority?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['authority-law','dream-object','source-fabric'],
    rationale:'Similarity boundary across canon, Dream, and retrieval.',
  },
  {
    id:'BD4',
    query:'Find distinct sources showing how symbolic systems may be meaningful without becoming prediction or destiny.',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['astrology-contract','source-fabric'],
    rationale:'Symbolic meaning under epistemic restraint.',
  },
  {
    id:'BD5',
    query:'Across research and center architecture, where is relation treated as richer than simple scalar similarity?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['rgr-note','indra-grammar'],
    rationale:'Formal relation research connected to center grammar.',
  },
  {
    id:'BD6',
    query:'Across the field, what sources make correction, narrowing, or revocation part of relational knowing?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['indra-permeability','source-fabric','indra-topology'],
    rationale:'Correction and revocation across retrieval and center evidence.',
  },
  {
    id:'BD7',
    query:'Across center and retrieval law, where is absence required to remain visible rather than being filled in by synthesis?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['indra-composer','source-fabric'],
    rationale:'Absence-preservation across center and retrieval.',
  },
  {
    id:'BD8',
    query:'Across memory, teaching, and retrieval, how does explicit occasion or consent limit what the system may bring forward?',
    expectedAnswer:true,evidenceMode:'distributed',
    mustSources:['memory-consent','teaching-constitution','source-fabric'],
    rationale:'Occasioning and consent across three domains.',
  },
  {
    id:'BN1',
    query:'What insulin dosing protocol does this corpus prescribe for type 1 diabetes?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Absent medical-treatment domain.',
  },
  {
    id:'BN2',
    query:'Which source specifies orbital mechanics for a crewed transfer from Earth to Mars?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Absent aerospace domain.',
  },
  {
    id:'BN3',
    query:'Which astrology passage proves that a member will marry next year?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Unsupported predictive claim phrased without the tuned prediction keywords.',
  },
  {
    id:'BN4',
    query:'Which Dream source confirms that a deceased parent is actually communicating with the dreamer?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Unsupported external-revelation claim.',
  },
  {
    id:'BN5',
    query:'Which source proves another person’s hidden motives from relationship material?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Unsupported third-party interiority claim.',
  },
  {
    id:'BN6',
    query:'Which source proves that the member is a narcissist?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Unsupported diagnostic identity claim.',
  },
  {
    id:'BN7',
    query:'What tax deductions for home offices are authorized by this corpus?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Absent tax/legal domain.',
  },
  {
    id:'BN8',
    query:'Which divination source guarantees that a member will win the lottery?',
    expectedAnswer:false,evidenceMode:'focused',
    mustSources:[],
    rationale:'Unsupported guarantee/prediction claim with symbolic adjacency.',
  },
];
