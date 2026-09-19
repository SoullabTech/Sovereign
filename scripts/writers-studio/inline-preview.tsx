/** Synthetic interaction preview using the production passage and revision components.
 * No model, manuscript, persistence, or undo acceptance is claimed by this fixture. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ManuscriptPassage from '../../app/writers-studio/insight/ManuscriptPassage';
import RevisionDesk from '../../app/writers-studio/insight/RevisionDesk';
import '../../app/writers-studio/insight/insight.css';
const original = 'The lantern stayed lit as the room grew quiet, its warmth still reaching the table.';
const body = 'Evening settled across the garden. The last leaves moved against the window.\n\n' + original + '\n\nAcross the table, the blue notebook remained closed. There was time to listen before opening it.';
const version = { id:'v1', author:'maia' as const, wording:'The lantern stayed lit as the room grew quiet, its warmth resting on the table.', supersedes:null, rationale:'Editorial purpose: A quieter image\nThis could make the scene feel stiller; it loses the movement carried by “reaching.”' };
const thread = { threadId:'preview', chainId:'preview', locusText:original, targetSectionId:'s1', sectionLabel:'A quiet room', legacyLocus:false, turns:[{ speaker:'maia' as const, turnIndex:0, body:'This could make the scene feel stiller. “Reaching” connects the lantern to the notebook; “resting” changes that movement. Which matters more to this passage?' }], versions:[version], headVersionId:'v1' };
function Preview() {
  const [open,setOpen]=useState(true), [instruction,setInstruction]=useState('');
  const [preview,setPreview]=useState<{original:string;wording:string;changes:boolean}|null>(null);
  const [message,setMessage]=useState<string|null>(null);
  return <><header className="preview-top">SOULLAB · Writer’s Studio <span>WRITE · DEVELOP</span></header><div className="preview-shell"><nav className="preview-outline"><h3>Manuscript exploration</h3><p>Chapter 1</p><strong>A quiet room</strong><p>Chapter 2</p><p>Returning to the garden</p></nav><main><div className="preview-toolbar"><span>Chapter 1 / A quiet room</span><button onClick={()=>setOpen(!open)}>{open?'Clean manuscript':'Show editorial layer'}</button></div><article className="preview-page"><small>CHAPTER 1 · SYNTHETIC PREVIEW</small><h1>A quiet room</h1><p className="preview-note">Real editing components · invented text · no manuscript changes</p>
  <ManuscriptPassage body={body} range={{start:Array.from(body.split(original)[0]).length,end:Array.from(body.split(original)[0]).length+Array.from(original).length}} proposal={open?preview:null}>
    <div className="ws-insight wsi-inline" hidden={!open}><header className="wsi-inline-header"><strong>01 · Image and movement</strong><button onClick={()=>setOpen(false)}>Collapse</button></header>
    <RevisionDesk inline active={open} onPreview={setPreview} showInspiration={false} manuscriptId="synthetic-preview" title="A quiet room" currentText={original} sectionBody={body} thread={thread as any} version={version} instruction={instruction} onInstruction={setInstruction} onSend={()=>setMessage('Preview only: your question and draft are preserved. No model request was sent.')} onSelectVersion={()=>{}} onApply={()=>setMessage('Preview only: no manuscript was changed.')} onSaveMember={async()=>{setMessage('Preview only: no version was persisted.');return false;}} busy={false} message={message} response={null} onKeep={()=>{setPreview(null);setMessage('Current wording retained.');}} />
    </div>
  </ManuscriptPassage><section className="preview-next"><small>RELATED SECTION · CHAPTER 2</small><h2>Returning to the garden</h2><p>The garden was different in the morning. What had looked like stillness now held small movements: a bird at the wall, a leaf turning toward the light.</p><p>Coming back did not repeat the evening. It let something else become visible.</p></section></article></main></div></>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
