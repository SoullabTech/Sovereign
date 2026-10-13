import {describe,expect,it} from '@jest/globals';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PersonalFieldReadOnlyPreview} from '@/components/ganesha/PersonalFieldReadOnlyPreview';
import {composeVerifiedPersonalField} from '../personalFieldIntegration';

const A='11111111-1111-4111-8111-111111111111';
const DATE='2026-10-13T12:00:00Z';
const emptyHistory=()=>({
  records:{notes:[],attention:[],decisions:[],changes:[],processItems:[]},
  owner:'member',access:'bounded_read_only',coverage:'personal_records_with_verified_provenance_only',
});
const fixture=()=>composeVerifiedPersonalField({
  legacyStatus:'none',
  history:emptyHistory() as any,
  nativeNotes:[{id:A,section:'alive',body:'A member-authored note',createdAt:DATE}],
  nativeAttention:[{id:A,kind:'note',field:'important',
    position:0,label:'My own placement',createdAt:DATE}],
  nativeEvents:[{id:A,title:'An event I added',eventAt:DATE,createdAt:DATE}],
  nativePeople:[{id:A,name:'Someone I named',note:'A private chosen note',createdAt:DATE}],
  legacyEvents:[],legacyPeople:[],
});
describe('G2-3D humane read-only preview contract',()=>{
  it('renders accessible headings without inferred identities or interpretations',()=>{
    const html=renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:fixture()}));
    for(const text of [
      'Your living field','What matters to you','What is alive?',
      'What is asking for attention?','What is emerging?','What are you tending?',
      'Events you&#x27;ve named','People you&#x27;re tending',
    ])expect(html).toContain(text);
    expect(html).toContain('aria-labelledby');
    expect(html).not.toContain('relationshipScore');
    expect(html).not.toContain('practitionerId');
    expect(html).not.toContain('memberId');
  });
  it('shows explicitly authored content, no invented Today or local timezone',()=>{
    const html=renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:fixture()}));
    expect(html).toContain('A member-authored note');
    expect(html).toContain('Someone I named');
    expect(html).toContain('My own placement');
    expect(html).toContain('UTC');
    expect(html).toContain('until you choose your timezone');
    expect(html).not.toContain('Open now');
  });
  it('is read-only with no destructive or unreviewed create/edit controls',()=>{
    const html=renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:fixture()}));
    expect(html).not.toMatch(/<button\b/i);
    expect(html).not.toMatch(/<form\b/i);
    expect(html).not.toMatch(/method="delete"/);
    expect(html).not.toContain('/api/studio/');
    expect(html).toContain('Read-only preview');
  });
  it('uses a single-column mobile baseline and wider layout at large breakpoints',()=>{
    const html=renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:fixture()}));
    expect(html).toContain('bg-stone-100');
    expect(html).toContain('min-h-screen');
    expect(html).toContain('grid-cols-1');
    expect(html).toContain('lg:grid-cols-');
    expect(html).toContain('sm:grid-cols-2');
  });
  it('does not treat an empty view as absence of personal history',()=>{
    const empty=composeVerifiedPersonalField({
      legacyStatus:'ambiguous',history:emptyHistory() as any,
      nativeNotes:[],nativeAttention:[],nativeEvents:[],nativePeople:[],
      legacyEvents:[],legacyPeople:[],
    });
    const html=renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:empty}));
    expect(html).toContain('not your complete history');
    expect(html).toContain('Quiet here for now');
  });
  it('never surfaces stale unauthorized cached text after source revocation',()=>{
    const r=fixture();
    const adjusted={...r, attention:{
      ...r.attention,
      memberNative:[{...r.attention.memberNative[0],gone:true,label:'Reference unavailable'}],
    }};
    const html=renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:adjusted}));
    expect(html).toContain('Reference unavailable');
    expect(html).not.toContain('My own placement');
  });
});
