/**
 * G2-3D FICTIONAL HTML fixture only. Never a product route or live member view.
 * Renders the isolated composition preview with local Tailwind CSS.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { composeVerifiedPersonalField } from '../../lib/ganesha/personalFieldIntegration';
import { PersonalFieldReadOnlyPreview } from '../../components/ganesha/PersonalFieldReadOnlyPreview';
const TS='2026-10-13T12:00:00Z';
const history:any={
  owner:'member',access:'bounded_read_only',coverage:'personal_records_with_verified_provenance_only',
  records:{
    notes:[{id:'11111111-1111-4111-8111-111111111111',section:'tending',
      body:'I want to return to the garden.',createdAt:'2026-09-13T12:00:00Z'}],
    attention:[{id:'22222222-2222-4222-8222-222222222222',field:'emerging',
      kind:'note',label:'Older idea for the garden',createdAt:TS}],
    decisions:[],changes:[],processItems:[],
  },
};
const input=composeVerifiedPersonalField({
  legacyStatus:'active',history,
  nativeNotes:[{id:'33333333-3333-4333-8333-333333333333',section:'alive',
    body:'A walk by the river helped me notice what is alive.',createdAt:TS}],
  nativeAttention:[{id:'44444444-4444-4444-8444-444444444444',kind:'note',
    field:'important',label:'Make time to be outdoors',position:0,createdAt:TS}],
  nativeEvents:[{id:'55555555-5555-4555-8555-555555555555',
    title:'Morning garden walk',eventAt:'2026-10-20T14:00:00Z',createdAt:TS}],
  nativePeople:[{id:'66666666-6666-4666-8666-666666666666',name:'A fictional friend',
    note:'Remember our next conversation',createdAt:TS}],
  legacyEvents:[],legacyPeople:[],
});
const css=readFileSync('/tmp/ganesha-g2d-preview.css','utf8');
const html='<!doctype html><html lang="en"><head><meta charset="utf-8" />'+
  '<meta name="viewport" content="width=device-width, initial-scale=1" />'+
  '<title>Ganesha Personal Field — fictional preview</title><style>'+css+
  '</style></head><body class="bg-stone-100">'+
  renderToStaticMarkup(React.createElement(PersonalFieldReadOnlyPreview,{view:input}))+
  '</body></html>';
writeFileSync('/tmp/ganesha-g2d-preview.html',html,'utf8');
process.stdout.write('G2D_FICTIONAL_HTML_WRITTEN\n');
