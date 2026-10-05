#!/usr/bin/env node
// @ts-check
/** B5R7 — Finance is a first-class attention domain, fail-closed before connection. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
let failures=0;
function check(ok,law,detail){ console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`); if(!ok) failures++; }
const domains=renderer.slice(renderer.indexOf('function deriveAttentionDomains'),renderer.indexOf('function attentionDomainCard'));
check(/id:'finance', label:'Finance'/.test(domains),'B5R7-L1','Finance is first-class rather than buried inside Platform.');
check(/will not infer financial safety from missing data/.test(domains),'B5R7-L2','No finance data never becomes a false financial all-clear.');
check(/Cash, revenue, receivables, spending, taxes, runway, pricing, and family-provision signals/.test(domains),'B5R7-L3','Finance scope includes operating economics and founder/family provision.');
check(!/fetch\(|submitTask\(|workUnitAction\(/.test(domains),'B5R7-L4','Finance placeholder creates no model, network, mutation, or execution authority.');
console.log(failures===0?'\nB5R7 FINANCE DOMAIN: ALL LAWS HOLD (exit 0)':`\nB5R7 FINANCE DOMAIN: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
