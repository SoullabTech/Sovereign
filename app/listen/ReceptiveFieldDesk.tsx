'use client';

import { useState } from 'react';
import { usePersistentListening } from '@/components/listening/PersistentListeningProvider';
import {
  ORIGINAL_RECEPTIVE_CONTROLS, RECEPTIVE_INVITATIONS, RECEPTIVE_INTENTIONS,
  RECEPTIVE_SHELF_MAX_FIELDS, newReceptiveRecipe, validatedReceptiveControls,
} from '@/lib/listening/receptiveField';
import type {
  ReceptiveFieldRecipe, ReceptiveJourney, ReceptiveControls, ReceptiveIntention,
} from '@/lib/listening/receptiveField';
import {
  encryptReceptiveFields, decryptReceptiveFields, MAX_RECEPTIVE_PRIVATE_BACKUP_BYTES,
} from '@/lib/listening/receptiveFieldBackup';
import styles from './listen.module.css';

type Props = {
  journey: ReceptiveJourney;
  onSelectJourney: (journey: ReceptiveJourney) => void;
  onPlay: (journey: ReceptiveJourney) => Promise<boolean>;
};

type MixKey = keyof ReceptiveControls;
const dials: ReadonlyArray<{key:MixKey;label:string;meaning:string}>=[
  {key:'pulse',label:'Organic Current',meaning:'Warmth, movement and a gentle rhythmic swell'},
  {key:'space',label:'Open Water',meaning:'Resonance, air and the length of the sound'},
  {key:'density',label:'Texture & stillness',meaning:'From a minimal sound to a fuller harmony'},
];

function statusOf(error:unknown,fallback:string):string {
  return error instanceof Error ? error.message : fallback;
}

function downloadEncrypted(text:string) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;
  a.download='soullab-my-receptive-fields-private.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

/** Review-only receptive listening shelf in the existing Listening Room.
 * Preset and dial changes affect ONLY the approved LOW-GAIN synthesized sketch.
 * Selected member files, provider music and recorded masters are never remixed.
 * No account persistence, sound recording, login, MAIA analysis or sync occurs.
 */
export default function ReceptiveFieldDesk({
  journey,onSelectJourney,onPlay,
}:Props) {
  const persistent=usePersistentListening();
  const [fallbackShape,setFallbackShape]=useState<ReceptiveControls>({...ORIGINAL_RECEPTIVE_CONTROLS});
  const [fallbackFields,setFallbackFields]=useState<ReceptiveFieldRecipe[]>([]);
  const [tailor,setTailor]=useState(false);
  const [title,setTitle]=useState('');
  const [intentions,setIntentions]=useState<ReceptiveIntention[]>([]);
  const [status,setStatus]=useState('Choose a sound to receive. Nothing starts until you press Play.');
  const [password,setPassword]=useState('');
  const [repeat,setRepeat]=useState('');
  const [selectedBackup,setSelectedBackup]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);

  const shape=persistent?.shape||fallbackShape;
  const fields=persistent?.fields||fallbackFields;
  const localFileSelected=persistent?.snapshot.kind==='local-file';
  const playEnabled=Boolean(persistent) && !localFileSelected;
  const matchingSketch=persistent?.snapshot.kind==='sketch' &&
    persistent.snapshot.mood===journey && persistent.snapshot.playback==='playing';

  const changeShape=(next:ReceptiveControls) => {
    const verified=validatedReceptiveControls(next);
    if(persistent) persistent.setShape(verified);
    else setFallbackShape(verified);
  };

  const chooseInvitation=(option:typeof RECEPTIVE_INVITATIONS[number])=>{
    if(option.journey!==journey)onSelectJourney(option.journey);
    changeShape(option.controls);
    setTitle(option.title);
    setIntentions([option.intention]);
    setStatus(option.id==='release'
      ? 'A more expressive field is ready. Listen only if you choose; pause is always available.'
      : 'A listening invitation is ready. Play whenever you want.');
  };

  const toggleIntention=(which:ReceptiveIntention)=>{
    setIntentions(old=>{
      if(old.includes(which))return old.filter(item=>item!==which);
      if(old.length>=4) {setStatus('Choose up to four intentions, all selected by you.');return old;}
      return [...old,which];
    });
  };

  const keepCurrent = () => {
    if(fields.length>=RECEPTIVE_SHELF_MAX_FIELDS){
      setStatus('The private shelf holds up to 24 go-to fields. Export or remove one first.');
      return;
    }
    if(!title.trim()){setStatus('Give this sound field a name before keeping it.');return;}
    if(typeof crypto==='undefined'||typeof crypto.randomUUID!=='function'){
      setStatus('A secure browser context is needed to save a field.');
      return;
    }
    try {
      const next=newReceptiveRecipe(
        title,journey,shape,intentions,'field-'+crypto.randomUUID().replace(/-/g,'')
      );
      if(persistent){
        if(!persistent.keepField(next))throw Error('Could not keep this field in the current session.');
      } else {
        setFallbackFields(prev=>[next,...prev]);
      }
      setStatus('Kept in this open listening session. Use an encrypted export to keep it beyond this tab.');
    } catch(e){setStatus(statusOf(e,'Could not save this listening field.'));}
  };

  const recall=(recipe:ReceptiveFieldRecipe)=>{
    if(recipe.journey!==journey)onSelectJourney(recipe.journey);
    changeShape(recipe.controls);
    setTitle(recipe.title);
    setIntentions(recipe.intentions);
    setStatus('Returned to your chosen field. Nothing plays automatically.');
  };

  const drop=(id:string)=>{
    if(persistent)persistent.dropField(id);
    else setFallbackFields(prev=>prev.filter(r=>r.id!==id));
    setStatus('Removed from this session’s go-to fields.');
  };

  const restore=(items:ReceptiveFieldRecipe[])=>{
    if(persistent)persistent.replaceFields(items);
    else setFallbackFields(items);
  };

  const savePrivate=async()=>{
    if(busy)return;
    if(password!==repeat){setStatus('The two passphrases do not match.');return;}
    if(fields.length===0){setStatus('Keep a listening field before making a private backup.');return;}
    setBusy(true);
    try{
      const sealed=await encryptReceptiveFields(fields,password);
      downloadEncrypted(sealed);
      setPassword('');setRepeat('');
      setStatus('Encrypted fields exported to your device. Only your passphrase can unlock them; Soullab cannot recover it.');
    } catch(e){setStatus(statusOf(e,'Could not export fields.'));}
    finally{setBusy(false);}
  };

  const loadPrivate=async()=>{
    if(!selectedBackup){setStatus('Choose your private fields backup first.');return;}
    if(selectedBackup.size>MAX_RECEPTIVE_PRIVATE_BACKUP_BYTES){
      setStatus('The selected private field backup is too large.');return;
    }
    if(busy)return;
    setBusy(true);
    try{
      const recovered=await decryptReceptiveFields(await selectedBackup.text(),password);
      if(fields.length && !window.confirm('Replace the go-to fields kept in this session with the unlocked backup?')){
        setStatus('Restore canceled. Nothing changed.');
        return;
      }
      restore(recovered);
      setSelectedBackup(null);setPassword('');setRepeat('');
      setStatus(`Unlocked ${recovered.length} go-to fields in this session. No music files were imported.`);
    }catch(e){setStatus(statusOf(e,'Could not restore private fields.'));}
    finally{setBusy(false);}
  };

  return <section className={styles.panel} aria-labelledby="receptive-field-title"
    data-listen23-receptive-field="true">
    <span className={styles.smallcaps}>RECEPTIVE FIELD · REVIEW ONLY</span>
    <div className={styles.sectionHead}><div>
      <h2 id="receptive-field-title">The sounds you return to.</h2>
    </div></div>
    <p className={styles.muted}>
      You do not have to make music to belong here. Receive an existing sound,
      tailor it if you wish, and remember the combinations that feel meaningful
      to you. No AI decides what a feeling means.
    </p>
    <div role="group" aria-label="Choose a receptive listening invitation"
      style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10,margin:'18px 0'}}>
      {RECEPTIVE_INVITATIONS.map(option=>
        <button type="button" key={option.id}
          data-listen23-invitation={option.id}
          className={styles.tile}
          onClick={()=>chooseInvitation(option)}
          style={{minHeight:120,textAlign:'left',display:'flex',flexDirection:'column',justifyContent:'center',gap:8}}>
          <strong>{option.title}</strong>
          <span style={{fontSize:12,opacity:.83}}>{option.explanation}</span>
        </button>)}
    </div>
    <div className={styles.importRow}>
      {playEnabled && <button type="button" className={styles.addButton}
        aria-label={matchingSketch?'Pause this sound field':'Play this sound field'}
        onClick={()=> {
          if(matchingSketch){persistent?.pause();setStatus('Paused by your choice.');}
          else void onPlay(journey).then(ok=>setStatus(ok
            ? 'Playing your chosen, locally synthesized field. Adjust it gently, or stop at any time.'
            : 'Audio is busy or unavailable. No sound was started.'));
        }}>{matchingSketch?'Pause my field':'Listen to this field'}</button>}
      <button type="button" className={styles.ghost}
        aria-expanded={tailor}
        onClick={()=>setTailor(v=>!v)}>{tailor?'Hide sound shaping':'Tailor this sound'}</button>
      <button type="button" className={styles.ghost}
        onClick={()=>{changeShape({...ORIGINAL_RECEPTIVE_CONTROLS});setStatus('Restored the original synthetic sketch balance. Nothing auto-plays.');}}>
        Restore original sketch
      </button>
    </div>
    {!persistent && <p className={styles.muted}>
      Live shaping is available when the existing shared listening host is mounted.
      This standalone review displays settings but cannot change its separate sound.
    </p>}
    {localFileSelected && <p className={styles.muted}>
      Your selected local recording is left untouched. These controls only shape Soullab’s original synthetic sketch.
    </p>}
    {tailor && <div data-listen23-soundboard="true"
      style={{margin:'16px 0',padding:16,border:'1px solid rgba(210,181,134,.22)',borderRadius:12,
        display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))',gap:18}}>
      {dials.map(dial=><label key={dial.key} htmlFor={`receptive-${dial.key}`}
        style={{display:'grid',gap:8}}>
        <strong>{dial.label} · <span data-listen23-dial={dial.key}>{shape[dial.key]}%</span></strong>
        <span className={styles.muted} style={{fontSize:12}}>{dial.meaning}</span>
        <input id={`receptive-${dial.key}`} type="range" min={0} max={100} step={5}
          value={shape[dial.key]} disabled={localFileSelected}
          onChange={event=>changeShape({...shape,[dial.key]:Number(event.target.value)})}/>
      </label>)}
    </div>}
    <div style={{marginTop:20}}>
      <span className={styles.smallcaps}>YOUR WORDS · NEVER A DIAGNOSIS</span>
      <p className={styles.muted}>What might you want this field to invite? Choose nothing, or up to four.</p>
      <div role="group" aria-label="Choose your own listening intentions"
        style={{display:'flex',flexWrap:'wrap',gap:7}}>
        {RECEPTIVE_INTENTIONS.map(item=><button type="button" key={item.id}
          data-listen23-intention={item.id}
          aria-pressed={intentions.includes(item.id)}
          onClick={()=>toggleIntention(item.id)}
          className={styles.ghost}
          style={{borderColor:intentions.includes(item.id)?'#d4b17c':undefined,
            background:intentions.includes(item.id)?'rgba(211,175,120,.17)':undefined}}>
          {item.label}</button>)}
      </div>
      <p className={styles.muted} style={{fontSize:11}}>
        Cathartic or grief-filled listening can be personally meaningful. You choose the intensity and timing;
        this is not a promise of therapy, transformation or healing.
      </p>
    </div>
    <div className={styles.formRow} style={{marginTop:14}}>
      <label htmlFor="receptive-field-name">Name this go-to field
        <input id="receptive-field-name" type="text" maxLength={80}
          value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="An evening of release"/>
      </label>
      <button type="button" className={styles.addButton} data-listen23-keep="true"
        onClick={keepCurrent}>Keep in my go-to fields</button>
      <span className={styles.muted}>{fields.length}/{RECEPTIVE_SHELF_MAX_FIELDS} in this session</span>
    </div>
    <div style={{display:'grid',gap:10,margin:'16px 0'}} data-listen23-shelf="true">
      {fields.length===0 && <p className={styles.muted}>Your go-to fields appear here. Nothing is stored on a server or saved to your account.</p>}
      {fields.map(recipe=><article key={recipe.id}
        data-listen23-saved-field={recipe.id}
        style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',justifyContent:'space-between',
          padding:13,border:'1px solid rgba(210,181,134,.23)',borderRadius:12}}>
        <div><strong>{recipe.title}</strong>
          <p className={styles.muted} style={{margin:0,fontSize:12}}>
            {recipe.journey} · A {recipe.controls.pulse} · B {recipe.controls.space} · Stillness {recipe.controls.density}
            {recipe.intentions.length? ' · '+recipe.intentions.map(id=>RECEPTIVE_INTENTIONS.find(x=>x.id===id)?.label).join(', '):''}
          </p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className={styles.addButton} type="button"
            onClick={()=>recall(recipe)}>Return to field</button>
          <button className={styles.ghost} type="button"
            aria-label={`Remove ${recipe.title}`}
            onClick={()=>drop(recipe.id)}>Remove</button>
        </div>
      </article>)}
    </div>
    <details style={{marginTop:18,padding:15,border:'1px solid rgba(210,181,134,.21)',borderRadius:12}}>
      <summary style={{cursor:'pointer',fontWeight:600}}>
        Keep these beyond this tab · private encrypted export
      </summary>
      <p className={styles.muted}>The go-to shelf survives navigation only while this shared
        listening session stays open. To keep it, download a passphrase-encrypted file.
        There is no account sync or password recovery. No song, recording or raw journal is included.</p>
      <div className={styles.backupRow}>
        <label htmlFor="receptive-private-passphrase">Private passphrase
          <input id="receptive-private-passphrase" type="password"
            autoComplete="off" maxLength={500} value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="At least 12 characters"/>
        </label>
        <label htmlFor="receptive-private-confirm">Repeat to create backup
          <input id="receptive-private-confirm" type="password"
            autoComplete="off" maxLength={500} value={repeat}
            onChange={e=>setRepeat(e.target.value)}
            placeholder="Repeat your phrase"/>
        </label>
      </div>
      <div className={styles.importRow}>
        <button type="button" className={styles.addButton}
          disabled={busy||fields.length===0} onClick={()=>void savePrivate()}>
          {busy?'Working…':'Export my encrypted go-to fields'}</button>
        <label className={styles.fileLabel} htmlFor="receptive-private-file">
          Choose private go-to backup
          <input id="receptive-private-file" type="file" accept=".json,application/json"
            onChange={e=>{setSelectedBackup(e.currentTarget.files?.[0]||null);e.currentTarget.value='';}}/>
        </label>
        <button type="button" className={styles.ghost} disabled={busy||!selectedBackup}
          onClick={()=>void loadPrivate()}>Restore private fields</button>
      </div>
      {selectedBackup && <p className={styles.muted}>Selected: {selectedBackup.name}</p>}
      <p className={styles.quality}>AES-256-GCM · PBKDF2-SHA256, 600,000 rounds · local export only.
        Independent cryptography, member identity and deletion/recovery acceptance remain held.</p>
    </details>
    <p className={styles.muted} role="status" aria-live="polite" data-listen23-status="true">{status}</p>
    <p className={styles.quality}>
      REVIEW SOUND ONLY · ORIGINAL SYNTHETIC STUDIES · NOT MASTER STEMS OR LICENSED COMMERCIAL MUSIC
    </p>
  </section>;
}
