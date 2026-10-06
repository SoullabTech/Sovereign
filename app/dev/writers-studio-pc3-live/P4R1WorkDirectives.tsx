'use client';

import { useMemo, useState } from 'react';
import { useWorkDirectives } from '@/app/writers-studio/useWorkDirectives';
import {
  WORK_DIRECTIVE_KINDS,
  WORK_DIRECTIVE_LABEL,
  type WorkDirectiveKind,
} from '@/lib/writersStudio/workDirectives';

export default function P4R1WorkDirectives({ workId }: { workId: string }) {
  const { phase, directives, add, act } = useWorkDirectives(workId);
  const [adding, setAdding] = useState<WorkDirectiveKind | null>(null);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => Object.fromEntries(
    WORK_DIRECTIVE_KINDS.map((kind) => [
      kind,
      directives.filter((directive) => directive.kind === kind && directive.active),
    ]),
  ) as Record<WorkDirectiveKind, typeof directives>, [directives]);

  if (phase === 'loading') {
    return (
      <section className="p4r1-work-directives">
        <p className="fr-home-eyebrow">Editorial compass</p>
        <p>Opening what you’ve asked the Studio to carry…</p>
      </section>
    );
  }
  if (phase !== 'ready') return null;

  const save = async () => {
    if (!adding || !text.trim() || busy) return;
    setBusy(true);
    const ok = await add(adding, text.trim());
    setBusy(false);
    if (ok) {
      setText('');
      setAdding(null);
    }
  };

  const saveRevision = async () => {
    if (!editingId || !editingText.trim() || busy) return;
    setBusy(true);
    const ok = await act(editingId, 'revise', editingText.trim());
    setBusy(false);
    if (ok) {
      setEditingId(null);
      setEditingText('');
    }
  };

  return (
    <section
      className="p4r1-work-directives"
      aria-label="Editorial compass"
      data-work-directives
    >
      <header>
        <div>
          <p className="fr-home-eyebrow">Editorial compass</p>
          <h3>What this Work asks us to remember</h3>
        </div>
        <p>
          These are your directions for the Work. MAIA may use them as context;
          they never become manuscript text or editing permission.
        </p>
      </header>

      <div className="p4r1-work-directive-groups">
        {WORK_DIRECTIVE_KINDS.map((kind) => (
          <section key={kind} data-directive-kind={kind}>
            <div className="p4r1-work-directive-head">
              <b>{WORK_DIRECTIVE_LABEL[kind]}</b>
              <button
                type="button"
                onClick={() => {
                  setAdding(kind);
                  setText('');
                }}
              >
                Add
              </button>
            </div>
            {groups[kind].length > 0 ? (
              <ul>
                {groups[kind].map((directive) => (
                  <li key={directive.id}>
                    {editingId === directive.id ? (
                      <div className="p4r1-work-directive-edit">
                        <textarea
                          autoFocus
                          rows={3}
                          maxLength={4000}
                          value={editingText}
                          onChange={(event) => setEditingText(event.target.value)}
                          aria-label={'Revise: ' + directive.text}
                        />
                        <div>
                          <button
                            type="button"
                            disabled={busy || !editingText.trim()}
                            onClick={() => void saveRevision()}
                          >
                            Keep revision
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setEditingId(null);
                              setEditingText('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span>{directive.text}</span>
                        <div className="p4r1-work-directive-actions">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setEditingId(directive.id);
                              setEditingText(directive.text);
                            }}
                          >
                            Revise
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void act(directive.id, 'retire')}
                            aria-label={'Retire: ' + directive.text}
                          >
                            Retire
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p4r1-work-directive-empty">Nothing held here yet.</p>
            )}
          </section>
        ))}
      </div>

      {adding ? (
        <div className="p4r1-work-directive-compose">
          <label htmlFor="p4r1-work-directive-text">
            {WORK_DIRECTIVE_LABEL[adding]}
          </label>
          <textarea
            id="p4r1-work-directive-text"
            autoFocus
            rows={3}
            value={text}
            maxLength={4000}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              adding === 'protect'
                ? 'What should MAIA protect when helping with this Work?'
                : adding === 'decision'
                  ? 'What have you decided about this Work?'
                  : 'What should remain open rather than settled?'
            }
          />
          <div>
            <button
              type="button"
              disabled={busy || !text.trim()}
              onClick={() => void save()}
            >
              {busy ? 'Saving…' : 'Keep this'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setAdding(null);
                setText('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
