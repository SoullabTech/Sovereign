/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
const mockPush = jest.fn();
const mockReloadWorks = jest.fn();
const mockReloadManuscripts = jest.fn();
let mockSearch = new URLSearchParams();
let mockWorks: any[] = [];
let mockH1 = { admitted: true, resolved: true };
let mockHomeProps: any, mockImportProps: any, mockShellProps: any;
jest.mock('next/navigation', () => ({
 usePathname: () => '/writers-studio', useRouter: () => ({ push: mockPush }),
 useSearchParams: () => mockSearch,
}));
jest.mock('@/app/writers-studio/atmosphere/StudioAtmosphere', () => ({useAtmosphere:()=>({id:'day'})}));
jest.mock('@/app/writers-studio/useLivingWorks', () => ({useLivingWorks:()=>({phase:'ready',works:mockWorks,reload:mockReloadWorks})}));
jest.mock('@/app/writers-studio/useCurrentManuscript', () => ({useCurrentManuscript:()=>({phase:'none',manuscripts:[],reload:mockReloadManuscripts})}));
jest.mock('@/app/writers-studio/useMarkedLines',()=>({useMarkedLines:()=>({lines:[]})}));
jest.mock('@/app/writers-studio/useStudioHistory',()=>({useStudioHistory:()=>({acts:[]})}));
jest.mock('@/app/writers-studio/useSectionActivity',()=>({useSectionActivity:()=>({})}));
jest.mock('@/app/writers-studio/useHouseStudioH1WorkClaim',()=>({useHouseStudioH1WorkClaim:()=>mockH1}));
jest.mock('@/lib/http/apiBase',()=>({apiFetch:jest.fn()}));
jest.mock('@/lib/writersStudio/useWriterReleaseCapabilities',()=>({useWriterReleaseCapabilities:()=>({
 authority:{sourceIntakeReleased:false,exportsCertified:{pdf:false,epub:false}},
})}));
jest.mock('@/app/writers-studio/full-redesign/Shell',()=>({Shell:(props:any)=>{
 mockShellProps=props;return React.createElement('div',null,props.work);
}}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1HomeView',()=>({__esModule:true,default:(props:any)=>{
 mockHomeProps=props;return React.createElement('div',null,'Home');
}}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1WorkArrival',()=>({__esModule:true,default:()=>null}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ImportManuscript',()=>({__esModule:true,default:(props:any)=>{
 mockImportProps=props;return React.createElement('div',null,'Import');
}}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1ProducePanel',()=>({__esModule:true,default:()=>null}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1InteriorProof',()=>({__esModule:true,default:(props:any)=>
 React.createElement('div',{'data-interior-title':props.workTitle??''})}));
jest.mock('@/app/dev/writers-studio-pc3-live/P4R1CoverStudy',()=>({__esModule:true,default:(props:any)=>
 React.createElement('div',{'data-cover-title':props.workTitle??''})}));
import Home from '@/app/dev/writers-studio-pc3-live/P4R1HomeController';
import Publish from '@/app/dev/writers-studio-pc3-live/P4R1PublishRoom';
(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
let host:HTMLDivElement,root:Root;
beforeEach(()=>{
 jest.clearAllMocks();mockSearch=new URLSearchParams();mockWorks=[];mockH1={admitted:true,resolved:true};
 mockReloadWorks.mockResolvedValue(undefined);mockReloadManuscripts.mockResolvedValue(undefined);
 mockHomeProps=mockImportProps=mockShellProps=null;
 host=document.createElement('div');document.body.append(host);root=createRoot(host);
});
afterEach(()=>{act(()=>root.unmount());host.remove();});
const work=(id:string,title:string)=>({id,title,expressions:[{expressionType:'manuscript',expressionId:'new-manuscript'}]});

it('starts a new import without carrying a different Work or House arrival, preserving local review',async()=>{
 mockSearch=new URLSearchParams('mode=home&m=old-manuscript&s=old-section&work=old-work&localReview=1');
 await act(async()=>root.render(React.createElement(Home)));
 act(()=>mockHomeProps.onImport());
 const next=new URL(mockPush.mock.calls[0][0],'http://localhost');
 expect(next.searchParams.get('import')).toBe('1');
 expect(next.searchParams.get('localReview')).toBe('1');
 for(const key of ['work','from','m','s'])expect(next.searchParams.has(key)).toBe(false);
});
it('awaits refresh and opens the exact returned import without inheriting an old Work claim',async()=>{
 mockSearch=new URLSearchParams('mode=home&import=1&work=old-work&from=house&m=old-manuscript&s=old-section&localReview=1');
 let release!:()=>void;mockReloadWorks.mockReturnValue(new Promise<void>(r=>{release=r;}));
 await act(async()=>root.render(React.createElement(Home)));
 let completion!:Promise<void>;
 await act(async()=>{completion=mockImportProps.onComplete('new-manuscript');});
 expect(completion).toBeInstanceOf(Promise);expect(mockPush).not.toHaveBeenCalled();
 await act(async()=>{release();await completion;});
 const next=new URL(mockPush.mock.calls[0][0],'http://localhost');
 expect(next.searchParams.get('mode')).toBe('write');expect(next.searchParams.get('m')).toBe('new-manuscript');
 expect(next.searchParams.get('localReview')).toBe('1');
 for(const key of ['work','from','import','s'])expect(next.searchParams.has(key)).toBe(false);
});
it('opens a successfully saved import even if the list refresh fails',async()=>{
 mockSearch=new URLSearchParams('mode=home&import=1');mockReloadWorks.mockRejectedValue(new Error('fictional refresh refusal'));
 await act(async()=>root.render(React.createElement(Home)));
 await act(async()=>mockImportProps.onComplete('new-manuscript'));
 expect(mockPush.mock.calls[0][0]).toContain('m=new-manuscript');
});
it('uses the uniquely declared Work title in both Publish previews',async()=>{
 mockSearch=new URLSearchParams('mode=publish&m=new-manuscript');mockWorks=[work('a','Window and Rain')];
 await act(async()=>root.render(React.createElement(Publish)));
 expect(mockShellProps.workTitle).toBe('Window and Rain');
 expect(host.querySelector('[data-interior-title]')?.getAttribute('data-interior-title')).toBe('Window and Rain');
 expect(host.querySelector('[data-cover-title]')?.getAttribute('data-cover-title')).toBe('Window and Rain');
});
it('does not select a Work by URL when the carried claim lacks H1 admission',async()=>{
 mockSearch=new URLSearchParams('mode=publish&m=new-manuscript&work=b');
 mockWorks=[work('a','First Work'),work('b','Second Work')];mockH1={admitted:false,resolved:true};
 await act(async()=>root.render(React.createElement(Publish)));
 expect(mockShellProps.workTitle).toBeUndefined();
 expect(host.querySelector('[data-cover-title]')?.getAttribute('data-cover-title')).toBe('');
});
it('honours an admitted declared Work choice without choosing the first Work',async()=>{
 mockSearch=new URLSearchParams('mode=publish&m=new-manuscript&work=b');mockWorks=[work('a','First Work'),work('b','Second Work')];
 await act(async()=>root.render(React.createElement(Publish)));
 expect(mockShellProps.workTitle).toBe('Second Work');
 expect(host.querySelector('[data-cover-title]')?.getAttribute('data-cover-title')).toBe('Second Work');
});
it('waits for a carried Work admission decision before initializing editable Publish previews',async()=>{
 mockSearch=new URLSearchParams('mode=publish&m=new-manuscript&work=b');
 mockWorks=[work('a','First Work'),work('b','Second Work')];mockH1={admitted:false,resolved:false};
 await act(async()=>root.render(React.createElement(Publish)));
 expect(host.querySelector('[data-cover-title]')).toBeNull();expect(host.textContent).toContain('Opening your Work');
});
