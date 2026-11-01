/** @jest-environment jsdom */
// @ts-nocheck
// This copied CommonJS Jest fixture must be a TypeScript MODULE so its
// local "const React" does not shadow the project-wide React type namespace.
// Marking the boundary has no effect on the mocked browser behavior.
export {};
// Source-owned faithful executable copy of the independent fictional 12-case
// A2 revalidation fixture; imports ACTUAL current integration controller.
// External reviewer original remains unchanged.

/*
 * REVIEWER-ONLY fictional mounted-controller deferred-response witness.
 * No app server, no provider, no account or Source data, no runtime edits.
 */
const React = require('react');
const {createRoot} = require('react-dom/client');
const original = 'A fictional lantern glows beside the river.';
const section = {id:'section-a', draftSectionId:'section-a',sourceSectionId:null,
  position:0,heading:'Fictional chapter',headingDepth:1,headingSignal:null,
  body:original,editable:true};
const mockContext = {state:'section_aware',manuscriptId:'fiction-manuscript',
  title:'Fictional book',version:1,updatedAt:'2026-10-20T00:00:00Z',sections:[section]};
const mockWorks = {
  A:{id:'fiction-work-A',title:'Work A',purpose:null,form:'Book',
    stage:'writing',manuscriptState:'partial-manuscript',createdAt:'2026-10-20T00:00:00Z',
    updatedAt:'2026-10-20T00:00:00Z',expressions:[],materials:[]},
  B:{id:'fiction-work-B',title:'Work B',purpose:null,form:'Book',
    stage:'writing',manuscriptState:'partial-manuscript',createdAt:'2026-10-20T00:00:00Z',
    updatedAt:'2026-10-20T00:00:00Z',expressions:[],materials:[]},
};
let mockWorkKey = 'A';
let mockDeepLinkThreadId = null;
let mockCreateDeferred=false;
let mockResolveCreate=null;
const mockAddressChanges=[];
const mockReturnWrites=[];
let mockEnableBRelationship = false;
let mockBDeclarationWithdrawn = false;
let mockDiscoverLegacyThread = false;
let mockPosture = {resolved:true,sanctuary:false};
let mockViewProps=null;
let mockResolveTurn=null;
const mockSendBound=jest.fn();
const mockAdopt=jest.fn();
const mockApiCalls=[];
let mockWritingBody=original;
let mockWritingRevision=1;
let mockWritingStatus='clean';
let mockWritingUnsaved=false;
let mockContextRead=null;
let mockUndoReply=null;
let mockReconcileResult=true;
let mockChangeToken={};
const mockRevisionReader=()=>mockWritingRevision;
const mockReconcile=jest.fn((input)=>{
  if(!mockReconcileResult)return false;
  mockWritingBody=input.authoritativeSections.find(section=>section.id===input.observation.sectionId).body;
  mockWritingRevision=input.authoritativeRevision;
  return true;
});
const mockWriting={
  sections:[section],activeId:'section-a',active:section,
  get activeBody(){return mockWritingBody},statusOf:()=>mockWritingStatus,bodyOf:()=>mockWritingBody,
  goToSection:jest.fn(),edit:jest.fn(),editSection:jest.fn(),
  captureForUnmount:()=>true, hasUnsavedWork:()=>mockWritingUnsaved,
  currentRevisionId:mockRevisionReader,
  observeCleanSection:(sectionId)=> mockWritingUnsaved || mockWritingStatus!=='clean' ? null
    : ({sectionId,body:mockWritingBody,revision:mockWritingRevision,changeToken:mockChangeToken}),
  reconcileCleanSection:mockReconcile,flushPending:jest.fn(),
};
const mockThread={
  threadId:'fiction-thread',chainId:'fiction-chain',workId:'fiction-manuscript',
  targetSectionId:'section-a',sectionLabel:'Fictional chapter',
  locusText:original,legacyLocus:false,
  turns:[],versions:[],headVersionId:null,application:null,
};
const mockResponseThread=(suffix)=>({...mockThread,turns:[{
  speaker:'maia',turnIndex:0,body:'FICTIONAL_OLD_REPLY_'+suffix
}]});

jest.mock('next/navigation',()=>({
  useSearchParams:()=>new URLSearchParams('?m=fiction-manuscript&section=section-a'),
  usePathname:()=>'/writers-studio',
  useRouter:()=>({push:()=>{}}),
}),{virtual:true});
jest.mock('@/app/writers-studio/atmosphere/StudioAtmosphere',()=>({
  useAtmosphere:()=>({id:'day'})
}));
jest.mock('@/lib/http/apiBase',()=>({
  apiFetch: jest.fn(async (url,options)=>{
    mockApiCalls.push({url:String(url),method:options?.method||'GET',body:options?.body});
    if(String(url).startsWith('/api/writers-studio/rebuild/context?'))
      return mockContextRead ? mockContextRead() : {status:200,ok:true,json:async()=>mockContext};
    if(String(url)==='/api/writers-studio/editorial/version')
      return {status:409,ok:false,json:async()=>({})};
    if(String(url)==='/api/writers-studio/editorial/undo')
      return mockUndoReply ? mockUndoReply() : {status:409,ok:false,json:async()=>({kind:'refused'})};
    throw Error('Unexpected fake URL '+url);
  })
}));
jest.mock('@/lib/sanctuary/currentClientPosture',()=>({
  readCurrentSanctuaryPosture:()=>mockPosture
}));
jest.mock('@/app/writers-studio/useLivingWorks',()=>({
  useLivingWorks:()=>({phase:'ready',works:[mockWorks[mockWorkKey]],reload:async()=>{}})
}));
jest.mock('@/app/writers-studio/workContext',()=>({
  currentWork:context=>context.work
}));
jest.mock('@/app/writers-studio/situatedWork',()=>({
  resolveSituatedWorkContext:()=> mockWorkKey==='none' ? {kind:'none'}
    : mockWorkKey==='ambiguous' ? {kind:'ambiguous',works:[mockWorks.A,mockWorks.B]}
    : ({kind:'work',work:mockWorks[mockWorkKey]}),
  studioHomeReturnSearch:()=>'',STUDIO_WORK_PARAM:'work'
}));
jest.mock('@/app/writers-studio/useHouseStudioH1WorkClaim',()=>({
  useHouseStudioH1WorkClaim:()=>({resolved:true,admitted:false})
}));
jest.mock('@/app/writers-studio/h1Arrival',()=>({
  h1AdmissionNeeded:()=>false, resolveH1Arrival:()=>({workId:null})
}));
jest.mock('@/app/writers-studio/canvasIdentity',()=>({
  canvasWithRelationship:(_path,_search,id)=>'/writers-studio?relationship='+id,
  canvasWithoutRelationship:()=>'/writers-studio',
  canvasWithEditorialThread:(_path,_search,id)=>'/writers-studio?thread='+id,
  canvasWithoutEditorialThread:()=>'/writers-studio',
  editorialThreadIdFrom:()=>mockDeepLinkThreadId,relationshipIdFrom:()=>null
}));
jest.mock('@/app/writers-studio/rebuild/RebuildWritingBoundary',()=>({
  __esModule:true, default:({children})=>children(mockWriting)
}));
jest.mock('@/lib/writersStudio/rebuild/model',()=>({
  chapterSpanFor:()=>({sections:[section]})
}));
jest.mock('@/lib/writersStudio/placeInWork',()=>({
  SECTION_PARAM:'section',resolveInitialSection:()=>({sectionId:'section-a',rewriteLocation:false}),
  locationForSection:()=>'/writers-studio',replacePlaceAddress:(v)=>{mockAddressChanges.push(v)}
}));
jest.mock('@/lib/writersStudio/rebuild/editorialCollaboration',()=>({
  discoverEditorialRelationships: jest.fn(async()=>({ok:true,relationships:mockDiscoverLegacyThread ? [{
    threadId:'fiction-thread',locusText:'A fictional lantern glows beside the river.'
  }]:[]})),
  openBoundEditorialThread:jest.fn(async()=>({ok:true,thread:mockThread})),
  openBoundEditorialPassage:jest.fn(async()=>({ok:true,thread:mockThread})),
  sendBoundEditorialTurn:mockSendBound,
  readBoundEditorialThread:jest.fn(async()=>({ok:true,thread:mockThread})),
  exactVersion:()=>({id:'fiction-version-a',author:'maia',wording:'A fictional edited passage',supersedes:null,rationale:'Fixture'}),locateUniquePassage:()=>null,
  adoptBoundEditorialVersion:mockAdopt
}));
jest.mock('@/app/writers-studio/insight/EditingLatitude',()=>({
  useEditingLatitude:()=>({latitude:1,setLatitude:()=>{},
    mayRemoveParagraphs:false,setMayRemoveParagraphs:()=>{},
    mayProposeImmediately:false,setMayProposeImmediately:()=>{}})
}));
jest.mock('@/lib/writersStudio/editorialApproaches',()=>({
  appendEditorialNote:(a,b)=>a+b
}));
jest.mock('@/lib/writersStudio/insightCanvas',()=>({
  INSIGHT_OBSERVATION:'insightObservation',INSIGHT_READING:'insightReading',
  loadCanvasInsight:jest.fn(async()=>null)
}));
jest.mock('@/lib/writersStudio/rebuild/relationshipOrchestration',()=>({
  listA2Relationships:jest.fn(async()=>({ok:true,relationships:mockEnableBRelationship ? [{
    id:'fiction-relationship-b',livingWorkId:'fiction-work-B',manuscriptId:'fiction-manuscript'
  }]:[]})),
  createA2Relationship:jest.fn(()=>mockCreateDeferred
    ? new Promise(resolve=>{mockResolveCreate=resolve;})
    : Promise.resolve(mockWorkKey==='B'?{
        ok:true,relationship:{id:'fiction-new-B-A2',livingWorkId:'fiction-work-B',
          manuscriptId:'fiction-manuscript',createdAt:'2026-10-20T00:00:00Z',episodeCount:0}
      }:{ok:false})),

  // Current real A2 read/list services can return historical A2 metadata after
  // its manuscript declaration is withdrawn (separately independently proven).
  // The response carries no active/current declaration flag. We preserve the
  // same actual returned shape for both active and revoked test states.
  readA2Relationship:jest.fn(async()=> mockEnableBRelationship ? {ok:true,relationship:{
    id:'fiction-relationship-b',livingWorkId:'fiction-work-B',manuscriptId:'fiction-manuscript'
  }}:{ok:false}),
  readEligibleCarrySources:jest.fn(async()=>({ok:false})),
  // Preserve the real controller's exact return-binding contract while this
  // suite replaces the network-facing relationship module. This is test-only:
  // no URL, client memory, latest-version or fuzzy prose authority is admitted.
  resolveEditorialReturnBinding:(thread,liveText)=>{
    const locate=(text,source)=>{
      if(!text)return null;
      const first=liveText.indexOf(text);
      if(first<0||liveText.indexOf(text,first+1)>=0)return null;
      const start=[...liveText.slice(0,first)].length;
      return {source,text,start,end:start+[...text].length};
    };
    const original=locate(thread.locusText,'original_locus');
    if(original)return original;
    const app=thread.application;
    if(!app||app.undone||app.canUndo!==true)return null;
    const version=thread.versions?.find(item=>item.id===app.versionId);
    return version?locate(version.wording,'active_application'):null;
  }
}));
jest.mock('@/lib/writersStudio/rebuild/returnStateClient',()=>({
  readPlaceReturnClient:jest.fn(async()=>({ok:true,sectionId:null})),
  persistPlaceReturnOrdered:jest.fn(async()=>{}),
  readRelationshipReturnClient:jest.fn(async()=>({ok:true,relationshipId:mockEnableBRelationship ? 'fiction-relationship-b' : null})),
  writeRelationshipReturnClient:jest.fn(async(scope,id)=>{mockReturnWrites.push({scope,id})}),
  clearRelationshipReturnClient:jest.fn(async()=>{})
}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView',()=>({
  UNDO_RESTORED_MESSAGES: {complete: 'That application was undone. The original passage is restored.', historyPending: 'The original passage is restored. Its editorial history could not be refreshed just now.'},
  P4R1Pc3WriteEditView:(props)=>{
    mockViewProps=props;
    return React.createElement('main',{'data-testid':'fictional-controller-view'},
      React.createElement('span',{'data-work':props.work?.id||''},
        props.work?.id||'no-work'),
      React.createElement('span',{'data-busy':String(props.editorialBusy)},
        String(props.editorialBusy)),
      React.createElement('span',{'data-failure':'true'},props.editorialFailure||''),
      React.createElement('span',{'data-turn':'true'},props.lastMaiaEditorialTurn?.body||''),
      React.createElement('button',{type:'button',onClick:()=>props.onSendEditorial('Fictional editorial request', {proposalPolicy:'reply_only'})},
        'Send fictional turn'));
  }
}));

const Controller=require('@/app/dev/writers-studio-pc3-live/P4R1WriteEditController').default;
describe('G3 reviewer independent: mounted actual controller deferred MAIA turn',()=>{
  let host,root;
  beforeEach(()=>{
    globalThis.IS_REACT_ACT_ENVIRONMENT=true;
    mockWorkKey='A';mockCreateDeferred=false;mockResolveCreate=null;mockAddressChanges.length=0;mockReturnWrites.length=0;mockDeepLinkThreadId=null;mockEnableBRelationship=false;mockBDeclarationWithdrawn=false;mockDiscoverLegacyThread=false;mockPosture={resolved:true,sanctuary:false};
    mockWritingBody=original;mockWritingRevision=1;mockWritingStatus='clean';mockWritingUnsaved=false;
    mockWriting.currentRevisionId=mockRevisionReader;mockContextRead=null;mockUndoReply=null;mockReconcileResult=true;mockChangeToken={};
    mockReconcile.mockClear();mockContext.version=1;mockContext.sections=[{...section}];
    mockThread.versions=[];mockThread.headVersionId=null;
    require('@/lib/writersStudio/rebuild/editorialCollaboration').readBoundEditorialThread.mockImplementation(async()=>({ok:true,thread:mockThread}));
    mockApiCalls.length=0;mockThread.application=null;mockResolveTurn=null;mockViewProps=null;mockThread.turns=[];mockSendBound.mockReset();mockAdopt.mockReset();mockAdopt.mockResolvedValue({ok:true,outcome:{kind:'applied'}});
    mockSendBound.mockImplementation(()=>new Promise(resolve=>{mockResolveTurn=resolve;}));
    window.localStorage.clear();
    host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);
  });
  afterEach(async()=>{
    await React.act(async()=>root.unmount());
    host.remove();window.localStorage.clear();
  });
  async function settle(n=10){for(let i=0;i<n;i++)await Promise.resolve()}
  async function render(){
    await React.act(async()=>{root.render(React.createElement(Controller));await settle()});
    expect(mockViewProps).not.toBeNull();
  }
  async function begin(){
    await render();
    await React.act(async()=>{
      host.querySelector('button').click();await settle(40);
    });
    expect(mockSendBound).toHaveBeenCalledTimes(1);
    expect(typeof mockResolveTurn).toBe('function');
  }
  async function deliver(what){
    await React.act(async()=>{
      mockResolveTurn({ok:true,thread:mockResponseThread(what),
        producedVersionId:'fiction-version-a',voice:null});
      await settle(25);
    });
  }
const readA2 = () => require('@/lib/writersStudio/rebuild/relationshipOrchestration').readA2Relationship;
const createA2 = () => require('@/lib/writersStudio/rebuild/relationshipOrchestration').createA2Relationship;
const returnClient = () => require('@/lib/writersStudio/rebuild/returnStateClient');
const validB = (id='fiction-relationship-b') => ({
  ok:true, relationship:{id,livingWorkId:'fiction-work-B',manuscriptId:'fiction-manuscript',
    createdAt:'2026-10-20T00:00:00Z',episodeCount:0}
});
beforeEach(() => {
  jest.clearAllMocks();
  readA2().mockImplementation(async()=>mockEnableBRelationship ? validB() : {ok:false,reason:'not_found'});
});
async function mountB() {
  mockWorkKey='B';mockEnableBRelationship=true;
  await render();await React.act(async()=>{await settle(85)});
}
async function choose(id) {
  await React.act(async()=>{mockViewProps.onChooseMaiaRelationship(id);await settle(85)});
}
function noProtectedOrAutomaticEffects() {
  expect(mockSendBound).not.toHaveBeenCalled();
  expect(mockAdopt).not.toHaveBeenCalled();
  expect(createA2()).not.toHaveBeenCalled();
  expect(mockApiCalls.filter(x=>x.method!=='GET')).toEqual([]);
}

it('C01 current matching detail can restore B without a send or mutation',async()=>{
  await mountB();
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockViewProps.editorialThread).toBeNull();
  noProtectedOrAutomaticEffects();
});

it('C02 current B can be explicitly chosen after A to B',async()=>{
  await render();mockWorkKey='B';mockEnableBRelationship=true;await render();
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockViewProps.editorialThread).toBeNull();
  noProtectedOrAutomaticEffects();
});

it('C03 cold detail not_found cannot activate B',async()=>{
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await mountB();
  expect(readA2()).toHaveBeenCalledWith('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship).toBeNull();
  noProtectedOrAutomaticEffects();
});

it('C04 proposed fail-closed gate: same active ID must stop being current after not_found revalidation',async()=>{
  await mountB();
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-relationship-b');
  expect(readA2()).toHaveBeenLastCalledWith('fiction-relationship-b');
  expect(mockViewProps.maiaRelationshipMessage).toContain('not available');
  noProtectedOrAutomaticEffects();
  // The existing public view contract has no separate ineligible/read-only
  // status. maiaRelationship is the current active presentation prop.
  expect(mockViewProps.maiaRelationship).toBeNull();
});

it('C05 proposed fail-closed gate: unreadable same-ID revalidation suspends current presentation without calling it withdrawal',async()=>{
  await mountB();
  readA2().mockResolvedValue({ok:false,reason:'unreadable'});
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationshipMessage).toContain('not available');
  noProtectedOrAutomaticEffects();
  expect(mockViewProps.maiaRelationship).toBeNull();
});

it('C06 refusal of a distinct candidate preserves the confirmed B relationship',async()=>{
  await mountB();
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-other-b');
  expect(readA2()).toHaveBeenLastCalledWith('fiction-other-b');
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockReturnWrites.some(x=>x.id==='fiction-other-b')).toBe(false);
  noProtectedOrAutomaticEffects();
});

it('C07 explicit refusal supersedes a late automatic success in the same Work',async()=>{
  let resolveAutomatic;
  readA2().mockImplementationOnce(()=>new Promise(resolve=>{resolveAutomatic=resolve}));
  await mountB();
  expect(typeof resolveAutomatic).toBe('function');
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-relationship-b');
  const writesBefore=mockReturnWrites.length;
  await React.act(async()=>{resolveAutomatic(validB());await settle(85)});
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockReturnWrites.length).toBe(writesBefore);
  noProtectedOrAutomaticEffects();
});

it('C08 Leave prevents a pending detail success from restoring the relationship',async()=>{
  await mountB();
  let resolveChoice;
  readA2().mockImplementationOnce(()=>new Promise(resolve=>{resolveChoice=resolve}));
  await choose('fiction-relationship-b');
  expect(typeof resolveChoice).toBe('function');
  await React.act(async()=>{mockViewProps.onLeaveMaiaRelationship();await settle(30)});
  const writesBefore=mockReturnWrites.length;
  await React.act(async()=>{resolveChoice(validB());await settle(85)});
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockReturnWrites.length).toBe(writesBefore);
  noProtectedOrAutomaticEffects();
});

it('C09 Work switch prevents a pending detail success from installing B into A',async()=>{
  await mountB();
  let resolveChoice;
  readA2().mockImplementationOnce(()=>new Promise(resolve=>{resolveChoice=resolve}));
  await choose('fiction-relationship-b');
  expect(typeof resolveChoice).toBe('function');
  mockWorkKey='A';mockEnableBRelationship=false;await render();
  const addressesBefore=mockAddressChanges.length;
  await React.act(async()=>{resolveChoice(validB());await settle(85)});
  expect(mockViewProps.work?.id).toBe('fiction-work-A');
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockAddressChanges.slice(addressesBefore).some(x=>x.includes('fiction-relationship-b'))).toBe(false);
  noProtectedOrAutomaticEffects();
});

it('C10 automatic return must reject a different detail ID even inside the same Work and manuscript',async()=>{
  readA2().mockResolvedValue(validB('fiction-substitute-b'));
  await mountB();
  expect(readA2()).toHaveBeenCalledWith('fiction-relationship-b');
  noProtectedOrAutomaticEffects();
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockReturnWrites.some(x=>x.id==='fiction-substitute-b')).toBe(false);
});

it('C11 explicit choice rejects a different detail ID without replacing confirmed B',async()=>{
  await mountB();
  readA2().mockResolvedValue(validB('fiction-substitute-b'));
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockReturnWrites.some(x=>x.id==='fiction-substitute-b')).toBe(false);
  noProtectedOrAutomaticEffects();
});

it('C12 proposed fail-closed gate: explicit fictional send after same-ID not_found must not reuse the unconfirmed A2 ID',async()=>{
  await mountB();
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationshipMessage).toContain('not available');
  mockSendBound.mockResolvedValue({ok:false,reason:'unavailable'});
  await React.act(async()=>{
    mockViewProps.onSendEditorial('Fictional request after unavailable relationship');
    await settle(85);
  });
  // sendBoundEditorialTurn is entirely inert in this fixture. No route,
  // authenticated session, database, real Source, or model is reached.
  // A future safe fresh path is allowed, but cannot carry the denied ID.
  const relationshipIds=mockSendBound.mock.calls.map(args=>args[5]?.relationshipId ?? null);
  expect(relationshipIds).not.toContain('fiction-relationship-b');
  // Do not silently fall through from the denied A2 ID to the legacy
  // manuscript-global optional-relationship pathway, either.
  expect(mockSendBound).not.toHaveBeenCalled();
  expect(mockViewProps.editorialFailure).toContain('not available');
  expect(mockViewProps.maiaRelationshipPhase).toBe('ready');
  expect(mockViewProps.maiaRelationshipChoices).toHaveLength(0);
});

it('C13 pending recheck of current B blocks Send before the server reply arrives',async()=>{
  await mountB();
  let resolveDetail;
  readA2().mockImplementationOnce(()=>new Promise(resolve=>{resolveDetail=resolve}));
  await React.act(async()=>{
    mockViewProps.onChooseMaiaRelationship('fiction-relationship-b');
    await settle(30);
  });
  expect(typeof resolveDetail).toBe('function');
  await React.act(async()=>{
    mockViewProps.onSendEditorial('Fictional attempt during relationship verification');
    await settle(35);
  });
  expect(mockSendBound).not.toHaveBeenCalled();
  expect(mockViewProps.editorialFailure).toContain('being checked');
  await React.act(async()=>{resolveDetail(validB());await settle(85)});
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockSendBound).not.toHaveBeenCalled();
});

it('C14 newly verified current B can be explicitly chosen again after an unreadable failure',async()=>{
  await mountB();
  readA2().mockResolvedValue({ok:false,reason:'unreadable'});
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockViewProps.maiaRelationshipMessage).toContain('not available');
  readA2().mockResolvedValue(validB());
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockViewProps.maiaRelationshipMessage).toBeNull();
  noProtectedOrAutomaticEffects();
});

it('C15 same ID returning a different Work must retire the previously current relationship',async()=>{
  await mountB();
  const old=validB();
  readA2().mockResolvedValue({...old,
    relationship:{...old.relationship,livingWorkId:mockWorks.A.id}});
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockViewProps.maiaRelationshipMessage).toContain('not available');
  noProtectedOrAutomaticEffects();
});

it('C16 after suspension an explicit fresh B relationship can restore the author entry',async()=>{
  await mountB();
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship).toBeNull();
  await React.act(async()=>{mockViewProps.onBeginMaiaRelationship();await settle(65)});
  expect(createA2()).toHaveBeenCalledTimes(1);
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-new-B-A2');
  expect(mockViewProps.maiaRelationshipMessage).toBeNull();
  expect(mockSendBound).not.toHaveBeenCalled();
  expect(mockAdopt).not.toHaveBeenCalled();
});

it('C17 later automatic refresh never resurrects an explicitly suspended B relationship',async()=>{
  await mountB();
  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-relationship-b');
  expect(mockViewProps.maiaRelationship).toBeNull();
  const readsAtRefusal=readA2().mock.calls.length;
  readA2().mockResolvedValue(validB());
  // Simulate a later reloaded Work object with the SAME ID and manuscript.
  // Background A2 hydration may rerun; its saved ID is not fresh consent.
  mockWorks.B={...mockWorks.B};
  await render();
  await React.act(async()=>{await settle(85)});
  expect(mockViewProps.maiaRelationship).toBeNull();
  expect(mockViewProps.maiaRelationshipMessage).toContain('not available');
  expect(readA2().mock.calls.length).toBe(readsAtRefusal);
  noProtectedOrAutomaticEffects();
});

it('C18 a relationship choice cancels an already-pending reply with truthful feedback, not Apply',async()=>{
  await mountB();
  await React.act(async()=>{
    mockViewProps.onSendEditorial('Fictional request before a relationship change');
    await settle(80);
  });
  expect(mockSendBound).toHaveBeenCalledTimes(1);
  expect(typeof mockResolveTurn).toBe('function');

  readA2().mockResolvedValue({ok:false,reason:'not_found'});
  await choose('fiction-different-candidate');
  // An unrelated candidate refusal preserves the prior B selection, but
  // relationship selection invalidates the old response's presentation ticket.
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  await deliver('AFTER_RELATIONSHIP_SELECTION');
  expect(mockViewProps.lastMaiaEditorialTurn).toBeNull();
  expect(mockViewProps.editorialFailure).toContain('earlier reply was withheld');
  expect(mockViewProps.editorialFailure).toContain('No change was applied');
  expect(mockAdopt).not.toHaveBeenCalled();
  expect(mockSendBound).toHaveBeenCalledTimes(1); // no hidden retry
});



// The accepted 732efd162e boundary forbids URL/prose-only ownership claims.
// Preserve all 25 original test bodies and assertions; add the negatives below.
const legacyModule = () => require('@/lib/writersStudio/rebuild/editorialCollaboration');
function noLegacyThreadOperations() {
  expect(legacyModule().readBoundEditorialThread).not.toHaveBeenCalled();
  expect(legacyModule().openBoundEditorialThread).not.toHaveBeenCalled();
  expect(legacyModule().openBoundEditorialPassage).not.toHaveBeenCalled();
  noProtectedOrAutomaticEffects();
}
it('D01 URL-only thread cannot read, open, send, save or apply history', async () => {
  mockDeepLinkThreadId='fiction-thread';await render();await React.act(async()=>{await settle(85)});
  expect(mockViewProps.editorialThread).toBeNull();
  expect(mockViewProps.editorialFailure).toContain('has not been verified for the current Living Work');
  noLegacyThreadOperations();
});
it('D02 verified A2 relationship is not ownership of a URL-only manuscript thread', async () => {
  mockDeepLinkThreadId='fiction-thread';await mountB();
  expect(mockViewProps.maiaRelationship?.id).toBe('fiction-relationship-b');
  expect(mockViewProps.editorialThread).toBeNull();
  expect(mockViewProps.editorialFailure).toContain('Nothing was opened, sent, saved or applied');
  noLegacyThreadOperations();
});
it('D03 explicit legacy-thread selection cannot invent LivingWork provenance', async () => {
  await mountB();await React.act(async()=>{mockViewProps.onChooseRelationship('fiction-thread');await settle(85)});
  expect(mockViewProps.editorialThread).toBeNull();
  expect(mockViewProps.editorialFailure).toContain('independently verified');noLegacyThreadOperations();
});
// Founder ruling 2026-11-01 supersedes the original D04 dead end: matching prose
// still never authorizes reuse, but an unverified older thread no longer blocks
// the passage — a new conversation opens in this Living Work beside it.
it('D04 matching discovered prose cannot authorize historical-thread reuse; a new Work conversation opens instead', async () => {
  mockDiscoverLegacyThread=true;await mountB();
  legacyModule().readBoundEditorialThread.mockResolvedValueOnce({ok:false,reason:'origin_unavailable'});
  const fresh={...mockThread,threadId:'fiction-new-thread'};
  legacyModule().openBoundEditorialThread.mockResolvedValueOnce({ok:true,thread:fresh});
  legacyModule().openBoundEditorialPassage.mockResolvedValueOnce({ok:true,thread:fresh});
  await React.act(async()=>{mockViewProps.onSendEditorial('Fictional request with legacy history');await settle(100)});
  expect(legacyModule().discoverEditorialRelationships).toHaveBeenCalled();
  // The older thread is only ever checked against the server's origin record
  // for THIS Work's relationship — never read or resumed on prose alone.
  expect(legacyModule().readBoundEditorialThread).toHaveBeenCalledTimes(1);
  expect(legacyModule().readBoundEditorialThread.mock.calls[0][0]).toBe('fiction-thread');
  expect(legacyModule().readBoundEditorialThread.mock.calls[0][2]).toBe('fiction-relationship-b');
  const opens = legacyModule().openBoundEditorialThread.mock.calls.length
    + legacyModule().openBoundEditorialPassage.mock.calls.length;
  expect(opens).toBe(1);
  expect(mockViewProps.editorialThread?.threadId).toBe('fiction-new-thread');
  expect(mockViewProps.editorialFailure).toBeNull();
  expect(mockViewProps.editorialNotice).toContain('left untouched');
});
it('D04b a discovered thread the server verifies for this Work is resumed, not duplicated', async () => {
  mockDiscoverLegacyThread=true;await mountB();
  await React.act(async()=>{mockViewProps.onSendEditorial('Fictional request with verified history');await settle(100)});
  expect(legacyModule().readBoundEditorialThread).toHaveBeenCalledWith('fiction-thread', expect.anything(), 'fiction-relationship-b');
  expect(legacyModule().openBoundEditorialThread).not.toHaveBeenCalled();
  expect(legacyModule().openBoundEditorialPassage).not.toHaveBeenCalled();
  expect(mockViewProps.editorialNotice ?? null).toBeNull();
});
// Production 2026-11-01: the Work's context arrives after first render without
// moving the gesture epoch, so a leave handler memoized without the scope kept
// the first render's empty scope and Return silently did nothing.
it('D04c Return and Choose a passage leave Focus when the Work arrived after first render', async () => {
  await render();await React.act(async()=>{await settle(85)});
  expect(mockViewProps.work?.id).toBe('fiction-work-A');
  await React.act(async()=>{mockViewProps.onOpenWorkspace();await settle(10)});
  expect(mockViewProps.workspaceOpen).toBe(true);
  await React.act(async()=>{mockViewProps.onCloseWorkspace();await settle(10)});
  expect(mockViewProps.workspaceOpen).toBe(false);
  await React.act(async()=>{mockViewProps.onOpenWorkspace();await settle(10)});
  expect(mockViewProps.workspaceOpen).toBe(true);
  await React.act(async()=>{mockViewProps.onChoosePassage();await settle(10)});
  expect(mockViewProps.workspaceOpen).toBe(false);
});
// Production 2026-11-01: a conversation about one paragraph stayed bound when the
// writer held another passage in the same section, and its reply showed there.
it('D04d holding a different passage in the same section unbinds that passage’s conversation', async () => {
  mockDiscoverLegacyThread=true;await mountB();
  await React.act(async()=>{mockViewProps.onSendEditorial('Fictional request with verified history');await settle(100)});
  await React.act(async()=>{mockResolveTurn({ok:true,thread:mockResponseThread('D04d'),producedVersionId:null,voice:null});await settle(40)});
  expect(mockViewProps.editorialThread?.threadId).toBe('fiction-thread');
  // Its own passage again: the conversation stays.
  await React.act(async()=>{mockViewProps.onHoldPassage(section,0,[...original].length,original);await settle(10)});
  expect(mockViewProps.editorialThread?.threadId).toBe('fiction-thread');
  // A different passage in the same section: it is no longer shown there.
  await React.act(async()=>{mockViewProps.onHoldPassage(section,20,[...original].length,original.slice(20));await settle(10)});
  expect(mockViewProps.editorialThread).toBeNull();
});
it('D05 explicitly requested new thread rejects a foreign manuscript response', async () => {
  await mountB();legacyModule().openBoundEditorialThread.mockResolvedValueOnce({ok:true,thread:{...mockThread,workId:'fiction-foreign-manuscript'}});
  await React.act(async()=>{mockViewProps.onSendEditorial('Fictional wrong manuscript response');await settle(100)});
  expect(mockViewProps.editorialThread).toBeNull();
  expect(mockViewProps.editorialFailure).toContain('could not be verified against the active Work and section');
  expect(mockSendBound).not.toHaveBeenCalled();expect(mockAdopt).not.toHaveBeenCalled();
});
it('D06 explicitly requested new thread rejects a different section response', async () => {
  await mountB();legacyModule().openBoundEditorialThread.mockResolvedValueOnce({ok:true,thread:{...mockThread,targetSectionId:'fiction-foreign-section'}});
  await React.act(async()=>{mockViewProps.onSendEditorial('Fictional wrong section response');await settle(100)});
  expect(mockViewProps.editorialThread).toBeNull();
  expect(mockViewProps.editorialFailure).toContain('could not be verified against the active Work and section');
  expect(mockSendBound).not.toHaveBeenCalled();expect(mockAdopt).not.toHaveBeenCalled();
});

// Real controller orchestration with simulated protected HTTP and an explicit
// writing-session adapter. The separate mounted boundary/hook suite exercises
// the real reconciliation contract and save queue; neither suite is a browser
// or physical PostgreSQL acceptance claim.
const appliedWords='The fictional revised lantern beside the river.';
async function mountAppliedThread() {
  await mountB();
  mockSendBound.mockResolvedValue({ok:true,thread:mockThread,producedVersionId:null,voice:null});
  await React.act(async()=>{
    mockViewProps.onSendEditorial('Fictional opening request');await settle(100);
  });
  expect(mockViewProps.editorialThread?.threadId).toBe('fiction-thread');
  mockThread.application={authorizationId:'fiction-authorization',versionId:'fiction-applied',
    resultingVersion:2,undone:false,canUndo:true};
  mockThread.versions=[{id:'fiction-applied',author:'member',wording:appliedWords,
    supersedes:null,rationale:null}];
  mockThread.headVersionId='fiction-applied';
  mockWritingBody=appliedWords;mockWritingRevision=2;
  mockContext.version=2;mockContext.sections=[{...section,body:appliedWords}];
  await render();
  expect(mockViewProps.editorialThread?.application?.canUndo).toBe(true);
}
function freshUndoContext() {
  return {...mockContext,version:3,sections:[{...section,body:original}]};
}
function admitUndoReadback() {
  mockUndoReply=async()=>({status:200,ok:true,json:async()=>({kind:'undone'})});
  mockContextRead=async()=>({status:200,ok:true,json:async()=>freshUndoContext()});
  require('@/lib/writersStudio/rebuild/editorialCollaboration').readBoundEditorialThread
    .mockResolvedValue({ok:true,thread:{...mockThread,
      application:{...mockThread.application,undone:true,canUndo:false}}});
}

it('U01 Undo publishes restored wording only after the protected context is accepted by the same writing session',async()=>{
  await mountAppliedThread();admitUndoReadback();
  await React.act(async()=>{mockViewProps.onUndo();await settle(100)});
  expect(mockApiCalls.filter(call=>call.url==='/api/writers-studio/editorial/undo'))
    .toEqual([{url:'/api/writers-studio/editorial/undo',method:'POST',
      body:JSON.stringify({authorizationId:'fiction-authorization'})}]);
  expect(mockReconcile).toHaveBeenCalledTimes(1);
  expect(mockReconcile).toHaveBeenCalledWith({observation:{sectionId:'section-a',body:appliedWords,revision:2,changeToken:mockChangeToken},
    authoritativeRevision:3,
    authoritativeSections:[{id:'section-a',body:original,editable:true}]});
  expect(mockViewProps.context.version).toBe(3);
  expect(mockWritingBody).toBe(original);
  expect(mockViewProps.undoMessage).toContain('original passage is restored');
});

it('U02 unsettled member writing blocks Undo before an HTTP mutation is sent',async()=>{
  await mountAppliedThread();admitUndoReadback();
  mockWritingUnsaved=true;mockWritingStatus='dirty';mockWritingBody='Newer member words';
  await React.act(async()=>{mockViewProps.onUndo();await settle(60)});
  expect(mockApiCalls.some(call=>call.url==='/api/writers-studio/editorial/undo')).toBe(false);
  expect(mockReconcile).not.toHaveBeenCalled();
  expect(mockWritingBody).toBe('Newer member words');
  expect(mockViewProps.undoMessage).toContain('Nothing was submitted');
});

it('U03 a refused local reconciliation never claims visible restoration after the server Undo succeeds',async()=>{
  await mountAppliedThread();admitUndoReadback();
  mockReconcileResult=false;
  await React.act(async()=>{mockViewProps.onUndo();await settle(100)});
  expect(mockReconcile).toHaveBeenCalledTimes(1);
  expect(mockWritingBody).toBe(appliedWords);
  expect(mockViewProps.context.version).toBe(2);
  expect(mockViewProps.undoMessage).toContain('Undo was saved on the server');
  expect(mockViewProps.undoMessage).toContain('local writing has been preserved');
  expect(mockViewProps.undoMessage).not.toContain('original passage is restored');
});

it('U04 a changed writing-session identity invalidates the pending Undo publication',async()=>{
  await mountAppliedThread();admitUndoReadback();
  let resolveUndo;
  mockUndoReply=()=>new Promise(resolve=>{resolveUndo=resolve});
  await React.act(async()=>{mockViewProps.onUndo();await settle(30)});
  expect(typeof resolveUndo).toBe('function');
  mockWriting.currentRevisionId=()=>2; // a different mounted queue, same numeric revision
  await React.act(async()=>{
    resolveUndo({status:200,ok:true,json:async()=>({kind:'undone'})});await settle(80);
  });
  expect(mockReconcile).not.toHaveBeenCalled();
  expect(mockWritingBody).toBe(appliedWords);
  expect(mockViewProps.adoptionBusy).toBe(false);
});

it('U05 a Work change while the protected context read is pending cannot publish the old Work body',async()=>{
  await mountAppliedThread();admitUndoReadback();
  let resolveContext;
  mockContextRead=()=>new Promise(resolve=>{resolveContext=resolve});
  await React.act(async()=>{mockViewProps.onUndo();await settle(35)});
  expect(typeof resolveContext).toBe('function');
  const oldRead=freshUndoContext();
  mockWorkKey='A';mockEnableBRelationship=false;await render();
  await React.act(async()=>{
    resolveContext({status:200,ok:true,json:async()=>oldRead});await settle(90);
  });
  expect(mockReconcile).not.toHaveBeenCalled();
  expect(mockViewProps.work.id).toBe('fiction-work-A');
  expect(mockViewProps.context.version).toBe(2);
});

it('U06 unreadable post-Undo context keeps the local text and reports the confirmed server result truthfully',async()=>{
  await mountAppliedThread();admitUndoReadback();
  mockContextRead=async()=>{throw Error('fictional read failure')};
  await React.act(async()=>{mockViewProps.onUndo();await settle(80)});
  expect(mockReconcile).not.toHaveBeenCalled();
  expect(mockWritingBody).toBe(appliedWords);
  expect(mockViewProps.undoMessage).toContain('Undo was saved on the server');
  expect(mockViewProps.undoMessage).not.toContain('original passage is restored');
});

it('U07 a history read failure after reconciliation does not misreport the already restored local text',async()=>{
  await mountAppliedThread();admitUndoReadback();
  require('@/lib/writersStudio/rebuild/editorialCollaboration').readBoundEditorialThread
    .mockRejectedValueOnce(Error('fictional history read failure'));
  await React.act(async()=>{mockViewProps.onUndo();await settle(80)});
  expect(mockWritingBody).toBe(original);
  expect(mockViewProps.context.version).toBe(3);
  expect(mockViewProps.undoMessage).toContain('original passage is restored');
  expect(mockViewProps.undoMessage).toContain('history could not be refreshed');
  expect(mockViewProps.undoMessage).not.toContain('current text could not be read');
  expect(mockViewProps.adoptionBusy).toBe(false);
});

});
