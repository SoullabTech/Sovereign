'use client';

/**
 * Client Inquiry Panel
 *
 * Allows the practitioner to:
 * 1. Select a prompt set for the client
 * 2. Record the client's answers
 * 3. View prior inquiry responses
 *
 * The completed inquiry feeds into the council evidence bundle.
 * If no inquiry is present, the council proceeds gracefully with available sources.
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { ClientInquiryResponse, InquiryPromptSet } from '@/lib/studio/practitioner/types';
import { MessageSquare, ChevronDown, ChevronRight, Check, Plus } from 'lucide-react';

interface Props {
  decisionId?: string;
  changeId?: string;
  clientId?: string | null;
  clientName?: string | null;
}

export default function ClientInquiryPanel({ decisionId, changeId, clientId, clientName }: Props) {
  const [responses, setResponses] = useState<ClientInquiryResponse[]>([]);
  const [promptSets, setPromptSets] = useState<InquiryPromptSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadResponses(), loadPromptSets()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionId, changeId]);

  async function loadResponses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (decisionId) params.set('decisionId', decisionId);
      if (changeId)   params.set('changeId', changeId);
      const res = await apiFetch(`/api/studio/client-inquiry/responses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResponses(data.responses || []);
      }
    } catch { /* graceful */ }
    finally { setLoading(false); }
  }

  async function loadPromptSets() {
    try {
      const res = await apiFetch('/api/studio/client-inquiry/prompt-sets');
      if (res.ok) {
        const data = await res.json();
        setPromptSets(data.promptSets || []);
        if (data.promptSets?.length > 0 && !selectedSetId) {
          setSelectedSetId(data.promptSets[0].id);
        }
      }
    } catch { /* graceful */ }
  }

  const selectedSet = promptSets.find((ps) => ps.id === selectedSetId);

  function handleSelectSet(id: string) {
    setSelectedSetId(id);
    setAnswers({});
  }

  async function handleSave() {
    if (!selectedSet) return;
    setSaving(true);
    try {
      const responseList = selectedSet.questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] || '',
      }));

      const res = await apiFetch('/api/studio/client-inquiry/responses', {
        method: 'POST',
        body: JSON.stringify({
          decisionId: decisionId || null,
          changeId: changeId || null,
          clientId: clientId || null,
          promptSetId: selectedSet.id,
          responses: responseList,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResponses((prev) => [data.response, ...prev]);
        setAdding(false);
        setAnswers({});
        setExpandedResponse(data.response.id);
      }
    } catch { /* keep form open */ }
    finally { setSaving(false); }
  }

  const hasAnswers = selectedSet?.questions.some((q) => answers[q.id]?.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Client Inquiry</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured questions for {clientName || 'the client'} — feeds into council synthesis
          </p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Record inquiry
        </button>
      </div>

      {adding && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 space-y-4">
          {/* Prompt set selector */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Inquiry prompt set</label>
            <div className="space-y-1.5">
              {promptSets.map((ps) => (
                <button
                  key={ps.id}
                  onClick={() => handleSelectSet(ps.id)}
                  className={`w-full text-left px-3 py-2 rounded border text-xs transition-colors ${
                    selectedSetId === ps.id
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                      : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-medium">{ps.title}</div>
                  <div className="text-slate-500 mt-0.5">{ps.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          {selectedSet && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                Record {clientName ? `${clientName}'s` : "client's"} responses below. Leave blank if not answered.
              </p>
              {selectedSet.questions.map((q) => (
                <div key={q.id}>
                  <div className="flex items-start justify-between mb-1">
                    <label className="text-xs text-slate-300 leading-relaxed flex-1">{q.text}</label>
                    {q.maxLength && (
                      <span className={`text-[10px] ml-2 flex-shrink-0 tabular-nums ${
                        (answers[q.id] || '').length > (q.maxLength * 0.9)
                          ? (answers[q.id] || '').length >= q.maxLength
                            ? 'text-red-400'
                            : 'text-amber-400'
                          : 'text-slate-600'
                      }`}>
                        {(answers[q.id] || '').length}/{q.maxLength}
                      </span>
                    )}
                  </div>

                  {/* Body sensation chips */}
                  {q.answerMode === 'bodymap' && q.bodySensations && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {q.bodySensations.map((sensation) => {
                        const current = answers[q.id] || '';
                        const active = current.toLowerCase().includes(sensation.toLowerCase());
                        return (
                          <button
                            key={sensation}
                            type="button"
                            onClick={() => {
                              const current = answers[q.id] || '';
                              const already = current.toLowerCase().includes(sensation.toLowerCase());
                              if (already) {
                                // remove it
                                const next = current.replace(new RegExp(`,?\\s*${sensation}`, 'i'), '').replace(/^,\s*/, '').trim();
                                setAnswers((a) => ({ ...a, [q.id]: next }));
                              } else {
                                // append it
                                const next = current ? `${current}, ${sensation}` : sensation;
                                setAnswers((a) => ({ ...a, [q.id]: next }));
                              }
                            }}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                              active
                                ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                                : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            {sensation}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Single-line short answer */}
                  {q.answerMode === 'short' ? (
                    <input
                      value={answers[q.id] || ''}
                      onChange={(e) => {
                        const val = q.maxLength ? e.target.value.slice(0, q.maxLength) : e.target.value;
                        setAnswers((a) => ({ ...a, [q.id]: val }));
                      }}
                      placeholder={q.placeholder || 'Client response...'}
                      maxLength={q.maxLength}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600"
                    />
                  ) : (
                    /* Textarea (text or bodymap) */
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => {
                        const val = q.maxLength ? e.target.value.slice(0, q.maxLength) : e.target.value;
                        setAnswers((a) => ({ ...a, [q.id]: val }));
                      }}
                      placeholder={q.placeholder || 'Client response...'}
                      rows={q.answerMode === 'bodymap' ? 1 : 2}
                      maxLength={q.maxLength}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/50">
            <button
              onClick={() => setAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasAnswers}
              className="text-xs bg-amber-600/80 hover:bg-amber-600 text-white px-3 py-1.5 rounded disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3 h-3" />
              {saving ? 'Saving...' : 'Save inquiry'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-600">Loading...</p>
      ) : responses.length === 0 ? (
        <p className="text-xs text-slate-600 italic">
          No client inquiry recorded. Inquiry responses feed directly into council synthesis — the council sees the client's own words, not just the practitioner's summary.
        </p>
      ) : (
        <div className="space-y-2">
          {responses.map((resp) => (
            <div key={resp.id} className="bg-slate-800/40 border border-slate-700/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedResponse((v) => v === resp.id ? null : resp.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400/70" />
                  <span className="text-xs font-medium text-slate-300">{resp.promptSetTitle}</span>
                  <span className="text-xs text-slate-600">
                    {resp.responses.filter((r) => r.answer?.trim()).length} answers
                  </span>
                </div>
                {expandedResponse === resp.id
                  ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {expandedResponse === resp.id && (
                <div className="px-3 pb-3 border-t border-slate-700/30 space-y-3 pt-3">
                  {resp.responses.map((r, i) => r.answer?.trim() ? (
                    <div key={i}>
                      <p className="text-xs text-slate-500 leading-relaxed">{r.questionText}</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{r.answer}</p>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
