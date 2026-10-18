/**
 * Wisdom-keeper linkout contract, review-only.
 * No fetching author text, browsing, user data or source ingestion.
 * Compares the public browser-safe link metadata against source provenance.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(source('docs/wisdom/source-candidates/glenn-perry/sources.json'));
let temp, links;

test.before(async()=>{
  temp=fs.mkdtempSync(path.join(os.tmpdir(),'perry-wisdom-links-'));
  const moduleText=source('lib/maia/knowledge/perryWisdomKeeperLinks.ts');
  fs.writeFileSync(path.join(temp,'links.mjs'),
    stripTypeScriptTypes(moduleText,{mode:'strip'}));
  links=(await import(pathToFileURL(path.join(temp,'links.mjs')).href))
    .GLENN_PERRY_WISDOM_KEEPER_LINKS;
});

test.after(()=>{if(temp)fs.rmSync(temp,{recursive:true,force:true});});

test('Perry wisdom-keeper references preserve both official sites',()=>{
  const d=manifest.wisdom_keeper_discovery;
  assert.equal(d.primary_website,'https://aaperry.com/');
  assert.equal(d.teaching_institution,'https://astropsychology.org/');
  assert.equal(d.author,'Glenn Perry, Ph.D.');
  assert.equal(d.status,'outbound_author_navigation_only');
  assert.equal(d.verified_on,'2026-10-17');
});

test('web link data and the source registry match exactly without duplicates',()=>{
  const recorded=manifest.wisdom_keeper_discovery.resources;
  assert.equal(recorded.length,6);
  assert.equal(links.length,6);
  assert.deepEqual(new Set(links.map(x=>x.id)).size,6);
  assert.deepEqual(new Set(recorded.map(x=>x.id)).size,6);
  for(const l of links){
    const r=recorded.find(x=>x.id===l.id);
    assert.ok(r,'No editorial custody for '+l.id);
    assert.equal(l.url,r.url);
    assert.equal(l.label,r.label);
    assert.equal(l.kind,r.kind);
    assert.ok(typeof l.description==='string'&&l.description.length>12);
  }
});

test('all outbound navigation is clean HTTPS to the two named official sites',()=>{
  for(const item of links){
    const url=new URL(item.url);
    assert.equal(url.protocol,'https:');
    assert.ok(['aaperry.com','astropsychology.org'].includes(url.hostname));
    assert.equal(url.username,'');
    assert.equal(url.password,'');
    assert.equal(url.search,'');
    assert.equal(url.hash,'');
    assert.ok(!url.pathname.includes('..'));
  }
  assert.equal(links.filter(x=>x.kind==='book').length,2);
  assert.equal(links.filter(x=>x.kind==='academy').length,1);
  assert.equal(links.filter(x=>x.kind==='author').length,1);
});

test('both physical books point to the same exact author product pages',()=>{
  const books=manifest.references.filter(x=>x.type==='book');
  assert.equal(books.length,2);
  const fromSite=links.filter(x=>x.kind==='book').map(x=>x.url).sort();
  const fromSource=books.map(x=>x.url).sort();
  assert.deepEqual(fromSite,fromSource);
  assert.ok(links.some(x=>x.id==='books-collection'));
  assert.ok(links.some(x=>x.id==='essays-collection'));
});

test('public navigation does not grant copyright or corpus authority',()=>{
  assert.equal(manifest.flags.admitted_to_corpus,false);
  assert.equal(manifest.flags.auto_ingest_allowed,false);
  assert.equal(manifest.flags.embedding_allowed,false);
  assert.equal(manifest.flags.production_retrieval_enabled,false);
  assert.equal(manifest.wisdom_keeper_discovery.endorsement.includes('No author affiliation'),true);
  for(const r of manifest.references){
    assert.equal(r.full_text_stored,false);
    assert.equal(r.embedding_allowed,false);
  }
  const publicCode=source('lib/maia/knowledge/perryWisdomKeeperLinks.ts');
  assert.ok(!publicCode.includes('await fetch('));
  assert.ok(!publicCode.includes('clientSecret'));
  assert.ok(!publicCode.includes('model_training_enabled'));
});

test('founder preview only renders normal user-initiated external anchors',()=>{
  const ui=source('components/maia/knowledge/PerryLensFounderPreview.tsx');
  assert.ok(ui.includes('GLENN_PERRY_WISDOM_KEEPER_LINKS.map('));
  assert.ok(ui.includes('href={resource.url}'));
  assert.ok(ui.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(ui.includes('Honoring the source'));
  assert.ok(ui.includes('does not claim Glenn Perry endorses MAIA') ||
    ui.includes('a claim that Glenn Perry endorses MAIA'));
  assert.ok(!ui.includes('window.open('));
  assert.ok(!ui.includes('apiFetch('));
});

test('the broader reciprocity guide stays review-only',()=>{
  const guide=source('docs/wisdom/source-candidates/glenn-perry/WISDOM-KEEPER-RECIPROCITY-CANDIDATE-20261017.md');
  assert.match(guide,/^status: review$/m);
  assert.match(guide,/^safe_for_retrieval: false$/m);
  assert.match(guide,/No silent substitution/);
  assert.match(guide,/Don.t imply endorsement/);
});
