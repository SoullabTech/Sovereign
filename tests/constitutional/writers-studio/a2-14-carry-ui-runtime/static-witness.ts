import fs from 'node:fs';

const host=fs.readFileSync('app/writers-studio/rebuild/RebuildStudioClient.tsx','utf8');
const desk=fs.readFileSync('app/writers-studio/insight/RevisionDesk.tsx','utf8');
const client=fs.readFileSync('lib/writersStudio/rebuild/editorialCollaboration.ts','utf8');
let pass=0,fail=0;
const check=(name:string,ok:boolean)=>{console.log((ok?'PASS':'FAIL')+'  '+name);if(ok)pass++;else fail++;};

const sendStart=host.indexOf('const sendEditorial = useCallback');
const posture=host.indexOf('const posture = readCurrentSanctuaryPosture();',sendStart);
const resolve=host.indexOf('const thread = await resolveEditorialForAct();',sendStart);
const clear=host.indexOf('if (carry) setSelectedCarrySource(null);',sendStart);
const transport=host.indexOf('const out = await sendBoundEditorialTurn(',sendStart);
check('current posture is read before Editorial resolution/transport',posture>sendStart&&posture<resolve&&resolve<transport);
check('matching selected carry clears before transport',clear>resolve&&clear<transport);
check('unresolved posture returns before the clear/transport path',host.slice(posture,resolve).includes("if (!posture.resolved)"));
check('identity-change effect clears chooser and selected source',host.includes("setCarryChooser({ kind: 'closed' });\n    setSelectedCarrySource(null);\n  }, [a2Relationship?.id, editorialThread?.threadId, focusId, context?.manuscriptId, workspaceOpen]);"));
check('async chooser admission is guarded by generation + relationship + thread',host.includes('generation !== carryChooserGen.current')&&host.includes('a2RelationshipIdRef.current !== relationshipId')&&host.includes('editorialThreadIdRef.current !== receiverThreadId'));
check('RevisionDesk receives presentation state/callbacks rather than fetching sources',desk.includes('carryChooser?: CarryChooserPresentation')&&desk.includes('onSelectCarrySource?:')&&!desk.includes('readEligibleCarrySources'));
check('send helper transmits carry as a separate field',client.includes('...(carry ? { carry } : {})'));
check('RevisionDesk keeps selected source outside the member textarea',desk.indexOf('Earlier MAIA response context')<desk.indexOf('className="wsi-page-reply"')&&desk.includes('value={instruction}'));

console.log(`\nA2-14 STATIC HOST WITNESS ${pass}/${pass+fail}`);
process.exitCode=fail?1:0;
