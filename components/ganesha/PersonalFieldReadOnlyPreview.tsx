/**
 * G2-3D read-only composition preview. NOT mounted by the House or the
 * existing Personal Studio; it receives only server-verified view models.
 * No paywall, no clinical framing, no automatic insight or member scoring.
 */
import React from 'react';
import type { composeVerifiedPersonalField } from '@/lib/ganesha/personalFieldIntegration';

type View = ReturnType<typeof composeVerifiedPersonalField>;
type Props = { view: View };
const questions=[
  {key:'alive',label:'What is alive?'},
  {key:'asking',label:'What is asking for attention?'},
  {key:'emerging',label:'What is emerging?'},
  {key:'tending',label:'What are you tending?'},
] as const;
const placements=[
  {key:'important',label:'Important to you'},
  {key:'attention',label:'Needs attention'},
  {key:'emerging',label:'Emerging'},
] as const;
function utcTime(s:string){
  // Do not infer the member's local timezone from the hosting server.
  return s.replace('T',' ').replace(/\.\d{3}Z$/,' UTC');
}
export function PersonalFieldReadOnlyPreview({view}:Props){
  return (
    <main aria-labelledby="ganesha-personal-title"
      className="relative mx-auto min-h-screen w-full max-w-6xl bg-stone-100 px-4 py-8 text-stone-900 sm:px-8">
      <header className="mb-10 max-w-3xl">
        <p className="mb-2 text-sm tracking-wide text-stone-600">Ganesha Life Flow · Personal Field</p>
        <h1 id="ganesha-personal-title" className="text-3xl font-medium tracking-tight sm:text-4xl">
          Your living field
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-700 sm:text-lg">
          A place for what you have named, chosen, and are tending.
          Nothing here is ranked for you.
        </p>
        <p className="mt-3 text-sm text-stone-600" role="status">
          Read-only preview · Your earlier writing remains yours.
          This is a bounded view, not your complete history.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)] lg:gap-10">
        <div className="space-y-10">
          <section aria-labelledby="ganesha-attention-title">
            <h2 id="ganesha-attention-title" className="mb-2 text-2xl font-medium">What matters to you</h2>
            <p className="mb-5 text-sm text-stone-600">
              Arranged as you left it, separately for current and earlier writing.
            </p>
            {([
              ['memberNative','From your personal field'],
              ['historical','From earlier Personal Studio writing'],
            ] as const).map(([source,heading])=>(
              <section aria-label={heading} key={source} className="mb-5 rounded-2xl border border-stone-300/70 bg-stone-50 p-4 sm:p-5">
                <h3 className="text-base font-medium text-stone-800">{heading}</h3>
                {view.attention[source].length===0
                  ? <p className="mt-3 text-sm text-stone-600">Nothing placed in this part of your field yet.</p>
                  : placements.filter(category=>view.attention[source].some(i=>i.field===category.key))
                    .map(category=>{
                      const items=view.attention[source].filter(i=>i.field===category.key);
                      return <div key={category.key} className="mt-4">
                        <h4 className="text-sm font-medium text-stone-700">{category.label}</h4>
                        <ul className="mt-2 space-y-2">
                          {items.map(i=><li key={i.key} className="rounded-lg bg-white px-3 py-2 text-base leading-relaxed">
                            {i.label}
                          </li>)}
                        </ul>
                      </div>;
                    })}
              </section>
            ))}
          </section>
          <section aria-labelledby="ganesha-notes-title" id="ganesha-notes">
            <h2 id="ganesha-notes-title" className="mb-4 text-2xl font-medium">Words you've placed</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {questions.map(question=>{
                const notes=view.notes.filter(n=>n.section===question.key);
                return <section key={question.key} aria-label={question.label}
                  className="rounded-2xl border border-stone-300/70 px-4 py-5">
                  <h3 className="text-base font-medium">{question.label}</h3>
                  {notes.length>0
                    ? <ul className="mt-3 space-y-3">{notes.map(n=>(
                      <li key={n.key} className="border-l-2 border-stone-300 pl-3">
                        <p className="whitespace-pre-wrap text-base leading-relaxed">{n.body}</p>
                        <p className="mt-1 text-xs text-stone-600">{n.origin==='member-native'?'Your writing':'Earlier writing'}</p>
                      </li>
                    ))}</ul>
                    : <p className="mt-3 text-sm text-stone-500">Quiet here for now.</p>}
                </section>;
              })}
            </div>
          </section>
        </div>
        <aside className="space-y-8">
          <section aria-labelledby="ganesha-events-title" className="rounded-2xl border border-stone-300/70 p-5">
            <h2 id="ganesha-events-title" className="text-xl font-medium">Events you've named</h2>
            <p className="mt-2 text-sm text-stone-600">Times shown in UTC until you choose your timezone.</p>
            {view.events.length>0
              ? <ul className="mt-4 space-y-4">{view.events.map(e=>
                <li key={e.key}>
                  <p className="text-base">{e.title}</p>
                  <time dateTime={e.eventAt} className="mt-1 block text-sm text-stone-600">{utcTime(e.eventAt)}</time>
                  <p className="text-xs text-stone-500">{e.origin==='member-native'?'Your entry':'Earlier entry'}</p>
                </li>)}</ul>
              : <p className="mt-4 text-sm text-stone-600">No authored events in this view.</p>}
          </section>
          <section aria-labelledby="ganesha-people-title" className="rounded-2xl border border-stone-300/70 p-5">
            <h2 id="ganesha-people-title" className="text-xl font-medium">People you're tending</h2>
            <p className="mt-2 text-sm text-stone-600">Only people you've chosen to name.</p>
            {view.people.length>0
              ? <ul className="mt-4 space-y-4">{view.people.map(p=>
                <li key={p.key}>
                  <p className="text-base">{p.name}</p>
                  {p.note?<p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{p.note}</p>:null}
                  <p className="mt-1 text-xs text-stone-500">{p.origin==='member-native'?'Your entry':'Earlier entry'}</p>
                </li>)}</ul>
              : <p className="mt-4 text-sm text-stone-600">No people named in this view.</p>}
          </section>
        </aside>
      </div>
    </main>
  );
}
