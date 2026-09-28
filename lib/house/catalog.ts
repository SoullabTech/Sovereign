export type HousePlaceGroup = 'reflect' | 'create' | 'practice';

export interface HousePlace {
  id: string;
  label: string;
  purpose: string;
  href: string;
  mark: string;
  tone: 'amber' | 'rose' | 'blue' | 'green' | 'gold' | 'violet' | 'slate';
  group: HousePlaceGroup;
  aliases: readonly string[];
  centerEligible?: boolean;
  studioRequired?: boolean;
}

export const HOUSE_PLACES = [
  { id:'writing', label:'Writing', purpose:'Give form to what wants to be written', href:'/writers-studio?from=house', mark:'✎', tone:'amber', group:'create', aliases:['writer','work','manuscript'], centerEligible:true },
  { id:'relationships', label:'Relationships', purpose:'Attend to what lives between', href:'/relationships?from=house', mark:'◎', tone:'rose', group:'practice', aliases:['people','connection','relating'], centerEligible:true },
  { id:'practices', label:'Practices', purpose:'Come back to body, breath and attention', href:'/practices', mark:'◌', tone:'green', group:'practice', aliases:['practice','meditate','breath','body'], centerEligible:true },
  { id:'community', label:'Community', purpose:'Participate in what we hold together', href:'/commons?from=house', mark:'◉', tone:'blue', group:'practice', aliases:['commons','circles','gatherings','network'], centerEligible:true },
  { id:'studio', label:'Studio', purpose:'Tend personal life and steward contribution', href:'/studio', mark:'◇', tone:'gold', group:'create', aliases:['personal studio','pro studio','portal'], centerEligible:true, studioRequired:true },
  { id:'decisions', label:'Decisions', purpose:'Think through a choice with perspective', href:'/decisions', mark:'⧉', tone:'gold', group:'reflect', aliases:['decision council','choice','choose'], centerEligible:true },
  { id:'astrology', label:'Astrology', purpose:'Meet pattern, timing and symbolic ecology', href:'/astrology?from=house', mark:'◉', tone:'blue', group:'reflect', aliases:['transits','chart','cycles'], centerEligible:true },
  { id:'journal', label:'Journal', purpose:'Write what you have lived', href:'/journal?from=house', mark:'▯', tone:'slate', group:'reflect', aliases:['journaling','notes','diary'], centerEligible:true },
  { id:'dream', label:'Dream', purpose:'Remember and explore what visits in sleep', href:'/dream?from=house', mark:'◌', tone:'violet', group:'reflect', aliases:['dreams','dreamwork','sleep','unconscious'], centerEligible:true },
  { id:'becoming', label:'Becoming', purpose:'Encounter possible futures and return to the present', href:'/becoming?from=house', mark:'◇', tone:'gold', group:'reflect', aliases:['future self','future','possibility','becoming'], centerEligible:true },
  { id:'reflections', label:'Reflections', purpose:'Return to what you have lived, written and kept', href:'/reflections?from=house', mark:'◇', tone:'violet', group:'reflect', aliases:['keeps','review','remember'], centerEligible:true },
  { id:'ideas', label:'Ideas', purpose:'Develop what is beginning to take form', href:'/maia/ideas?from=house', mark:'◉', tone:'amber', group:'create', aliases:['idea','imagine','inspiration'], centerEligible:true },
  { id:'changes', label:'Changes', purpose:'Name and walk a change', href:'/changes', mark:'↻', tone:'green', group:'reflect', aliases:['change','transition','evolve'], centerEligible:true },
  { id:'wisdom', label:'Wisdom', purpose:'Teachings, sources and living knowledge', href:'/wisdom-keepers/wisdom?from=house', mark:'✦', tone:'violet', group:'reflect', aliases:['study','teachings','knowledge'], centerEligible:true },
  { id:'library', label:'Library', purpose:'Return to what has been gathered', href:'/library?from=house', mark:'▤', tone:'slate', group:'create', aliases:['sources','books','archive'], centerEligible:true },
  { id:'divination', label:'Divination', purpose:'Meet a question through symbolic practice', href:'/oracle', mark:'✧', tone:'violet', group:'reflect', aliases:['oracle','cards','symbols'], centerEligible:true },
  { id:'living-field', label:'Living Field', purpose:'See the larger whole and its relationships', href:'/maia/living-field?from=house', mark:'∞', tone:'blue', group:'reflect', aliases:['field','whole','patterns'], centerEligible:true },
  { id:'co-lab', label:'Co-lab', purpose:'Shared work and conversation', href:'/team/for-you', mark:'◎', tone:'blue', group:'practice', aliases:['collaboration','team','network'], centerEligible:true },
  { id:'anchor', label:'Daily Anchor', purpose:'Stay connected to one thread in today', href:'/maia/anchor?from=house', mark:'●', tone:'green', group:'practice', aliases:['daily anchor','center','return'], centerEligible:true },
] as const satisfies readonly HousePlace[];

export type HousePlaceId = typeof HOUSE_PLACES[number]['id'];
export const DEFAULT_CENTER_IDS: HousePlaceId[] = ['writing','relationships','practices','community','studio'];

export const HOUSE_GROUPS: { id: HousePlaceGroup; label: string; line: string }[] = [
  { id:'reflect', label:'Reflect & decide', line:'Question, notice, choose and understand.' },
  { id:'create', label:'Create & learn', line:'Imagine, make, study and steward.' },
  { id:'practice', label:'Practice & connect', line:'Embody, relate, gather and return.' },
];

export function placeById(id: string) {
  return HOUSE_PLACES.find(place => place.id === id);
}
