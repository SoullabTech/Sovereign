'use client';

import { useState, useCallback } from 'react';
import { Check, Pencil, Trash2, Plus, RefreshCw, Loader2, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  FACET_REGISTRY,
  VALENCE_LABELS,
  FacetKey,
  NodeRole,
  StateValence,
  CaseElementNode,
  SpiralogicElement,
  getRingFacets,
  getCenterFacets,
} from '@/lib/consciousness/facetRegistry';

// ─── Element colours ──────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<SpiralogicElement, { bg: string; text: string; border: string; glow: string }> = {
  fire:   { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/40', glow: 'shadow-orange-500/30' },
  water:  { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/40',   glow: 'shadow-blue-500/30' },
  earth:  { bg: 'bg-amber-600/20',   text: 'text-amber-300',   border: 'border-amber-600/40',  glow: 'shadow-amber-600/30' },
  air:    { bg: 'bg-teal-500/20',    text: 'text-teal-300',    border: 'border-teal-500/40',   glow: 'shadow-teal-500/30' },
  aether: { bg: 'bg-purple-500/20',  text: 'text-purple-300',  border: 'border-purple-500/40', glow: 'shadow-purple-500/30' },
};

const VALENCE_COLORS: Record<StateValence, string> = {
  positive: 'ring-2 ring-emerald-400/70',
  neutral:  'ring-2 ring-yellow-400/50',
  negative: 'ring-2 ring-red-400/60',
};

const ROLE_SHAPES: Record<NodeRole, string> = {
  marker:   'rounded-full',
  goal:     'rounded-sm rotate-45',
  grounding: 'rounded-none',
};

// ─── Board layout positions (% of container) ─────────────────────────────
// Fire: top, Water: right, Earth: bottom, Air: left, Aether: center

const FACET_POSITIONS: Record<FacetKey, { x: number; y: number }> = {
  // Fire (top arc) — left to right: fire_1, fire_2, fire_3
  fire_1: { x: 28, y: 8 },
  fire_2: { x: 50, y: 4 },
  fire_3: { x: 72, y: 8 },

  // Water (right arc) — top to bottom: water_1, water_2, water_3
  water_1: { x: 88, y: 28 },
  water_2: { x: 93, y: 50 },
  water_3: { x: 88, y: 72 },

  // Earth (bottom arc) — right to left: earth_1, earth_2, earth_3
  earth_1: { x: 72, y: 90 },
  earth_2: { x: 50, y: 94 },
  earth_3: { x: 28, y: 90 },

  // Air (left arc) — bottom to top: air_1, air_2, air_3
  air_1: { x: 12, y: 72 },
  air_2: { x: 7,  y: 50 },
  air_3: { x: 12, y: 28 },

  // Aether (center) — triangle formation around midpoint
  aether_1: { x: 50, y: 38 },
  aether_2: { x: 58, y: 54 },
  aether_3: { x: 42, y: 54 },
};

// ─── Add Node Modal ───────────────────────────────────────────────────────

function AddNodeModal({
  onAdd,
  onClose,
}: {
  onAdd: (facet: FacetKey, role: NodeRole, valence: StateValence | null, note: string) => void;
  onClose: () => void;
}) {
  const [facet, setFacet] = useState<FacetKey>('fire_1');
  const [role, setRole] = useState<NodeRole>('marker');
  const [valence, setValence] = useState<StateValence | ''>('');
  const [note, setNote] = useState('');

  const groupedFacets: Record<SpiralogicElement, FacetKey[]> = {
    fire:   ['fire_1','fire_2','fire_3'],
    water:  ['water_1','water_2','water_3'],
    earth:  ['earth_1','earth_2','earth_3'],
    air:    ['air_1','air_2','air_3'],
    aether: ['aether_1','aether_2','aether_3'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Add Node</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Facet</label>
            <select
              value={facet}
              onChange={e => setFacet(e.target.value as FacetKey)}
              className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
            >
              {(Object.entries(groupedFacets) as [SpiralogicElement, FacetKey[]][]).map(([el, keys]) => (
                <optgroup key={el} label={el.charAt(0).toUpperCase() + el.slice(1)}>
                  {keys.map(k => (
                    <option key={k} value={k}>{FACET_REGISTRY[k].canonicalName}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Role</label>
            <div className="flex gap-2">
              {(['marker','goal','grounding'] as NodeRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1.5 text-xs rounded border capitalize transition-colors
                    ${role === r ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-gray-400 hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">State valence (optional)</label>
            <div className="flex gap-2">
              {(['positive','neutral','negative',''] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setValence(v)}
                  className={`flex-1 py-1.5 text-xs rounded border capitalize transition-colors
                    ${valence === v ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-gray-400 hover:text-white'}`}
                >
                  {v === '' ? 'unset' : VALENCE_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-white text-sm resize-none"
              placeholder="Practitioner note…"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-400 border border-white/10 rounded hover:border-white/20">
            Cancel
          </button>
          <button
            onClick={() => onAdd(facet, role, valence || null, note)}
            className="flex-1 py-2 text-sm text-white bg-purple-600/40 border border-purple-500/40 rounded hover:bg-purple-600/60"
          >
            Add Node
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Node tooltip ─────────────────────────────────────────────────────────

function NodeTooltip({ node }: { node: CaseElementNode }) {
  const def = FACET_REGISTRY[node.facet];
  const colors = ELEMENT_COLORS[node.element];
  return (
    <div className={`absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 w-52
      bg-gray-900 border ${colors.border} rounded-lg p-3 text-xs shadow-lg pointer-events-none`}>
      <div className={`font-semibold mb-1 ${colors.text}`}>{def.canonicalName}</div>
      <div className="text-gray-400 capitalize mb-1">{node.role}
        {node.stateValence && <span className="ml-1">· {VALENCE_LABELS[node.stateValence]}</span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {node.confidence != null && (
          <span className="text-gray-500">{Math.round(node.confidence * 100)}% confidence</span>
        )}
        {node.sourceType && (
          <span className="text-gray-600 capitalize">
            from {node.sourceType.replace('_', ' ')}
          </span>
        )}
      </div>
      {node.sessionContext && (
        <div className="text-gray-500 mt-1 italic text-[10px]">{node.sessionContext}</div>
      )}
      {!node.confirmedByPractitioner && (
        <div className="text-yellow-500/80 mt-1">provisional — awaiting confirmation</div>
      )}
      {node.confirmedByPractitioner && (
        <div className="text-emerald-500/70 mt-1">confirmed</div>
      )}
      {node.practitionerNote && (
        <div className="text-gray-300 mt-1 border-t border-white/10 pt-1">{node.practitionerNote}</div>
      )}
      <div className="text-gray-600 mt-1 text-[10px] leading-tight border-t border-white/5 pt-1">
        {def.developmentalLogic}
      </div>
    </div>
  );
}

// ─── Single node marker ───────────────────────────────────────────────────

function NodeMarker({
  node,
  onConfirm,
  onDelete,
}: {
  node: CaseElementNode;
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = ELEMENT_COLORS[node.element];
  const shape = ROLE_SHAPES[node.role];
  const valenceRing = node.stateValence ? VALENCE_COLORS[node.stateValence] : '';
  const opacity = node.confirmedByPractitioner ? 'opacity-100' : 'opacity-50';

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Node dot */}
      <div className={`w-4 h-4 ${shape} ${colors.bg} border ${colors.border}
        ${valenceRing} ${opacity} cursor-pointer transition-all hover:opacity-100
        hover:shadow-lg ${colors.glow} shadow`} />

      {/* Tooltip */}
      {hovered && <NodeTooltip node={node} />}

      {/* Actions (hover) */}
      {hovered && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 flex gap-1 z-40">
          {!node.confirmedByPractitioner && (
            <button
              onClick={() => onConfirm(node.id)}
              className="p-1 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-800/60"
              title="Confirm"
            >
              <Check size={10} />
            </button>
          )}
          <button
            onClick={() => onDelete(node.id)}
            className="p-1 rounded bg-red-900/60 border border-red-500/40 text-red-400 hover:bg-red-800/60"
            title="Remove"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Facet slot (label + stacked nodes) ──────────────────────────────────

function FacetSlot({
  facetKey,
  nodes,
  onConfirm,
  onDelete,
}: {
  facetKey: FacetKey;
  nodes: CaseElementNode[];
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const def = FACET_REGISTRY[facetKey];
  const pos = FACET_POSITIONS[facetKey];
  const colors = ELEMENT_COLORS[def.element];
  const hasNodes = nodes.length > 0;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {/* Facet label */}
      <span className={`text-[9px] font-medium whitespace-nowrap leading-none
        ${def.boardRegion === 'center'
          ? (hasNodes ? 'text-purple-300' : 'text-purple-600/40')
          : (hasNodes ? colors.text : 'text-gray-600')
        }`}>
        {def.canonicalName}
      </span>

      {/* Nodes stacked horizontally */}
      {hasNodes && (
        <div className="flex gap-0.5 flex-wrap justify-center max-w-16">
          {nodes.map(n => (
            <NodeMarker key={n.id} node={n} onConfirm={onConfirm} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* Empty slot indicator */}
      {!hasNodes && (
        <div className="w-3 h-3 rounded-full border border-dashed border-gray-700/50" />
      )}
    </div>
  );
}

// ─── Main board ───────────────────────────────────────────────────────────

interface Props {
  caseId: string;
  initialNodes?: CaseElementNode[];
}

export function SpiralogicFieldBoard({ caseId, initialNodes = [] }: Props) {
  const [nodes, setNodes] = useState<CaseElementNode[]>(initialNodes);
  const [generating, setGenerating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nodesByFacet = useCallback(
    (facetKey: FacetKey) => nodes.filter(n => n.facet === facetKey),
    [nodes],
  );

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/api/studio/cases/${caseId}/element-nodes`,
        { method: 'POST', body: JSON.stringify({ action: 'generate' }) },
      );
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json() as { nodes: CaseElementNode[]; newCount: number };
      setNodes(data.nodes);
    } catch {
      setError('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async (nodeId: string) => {
    try {
      const res = await apiFetch(
        `/api/studio/cases/${caseId}/element-nodes/${nodeId}`,
        { method: 'PATCH', body: JSON.stringify({ confirmed: true }) },
      );
      if (!res.ok) throw new Error('Confirm failed');
      const data = await res.json() as { node: CaseElementNode };
      setNodes(prev => prev.map(n => n.id === nodeId ? data.node : n));
    } catch {
      setError('Confirm failed');
    }
  };

  const handleDelete = async (nodeId: string) => {
    try {
      const res = await apiFetch(
        `/api/studio/cases/${caseId}/element-nodes/${nodeId}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error('Delete failed');
      setNodes(prev => prev.filter(n => n.id !== nodeId));
    } catch {
      setError('Delete failed');
    }
  };

  const handleAdd = async (facet: FacetKey, role: NodeRole, valence: StateValence | null, note: string) => {
    setShowAdd(false);
    try {
      const res = await apiFetch(
        `/api/studio/cases/${caseId}/element-nodes`,
        {
          method: 'POST',
          body: JSON.stringify({ action: 'create', facet, role, stateValence: valence, practitionerNote: note || undefined }),
        },
      );
      if (!res.ok) throw new Error('Add failed');
      const data = await res.json() as { node: CaseElementNode };
      setNodes(prev => [...prev, data.node]);
    } catch {
      setError('Add failed');
    }
  };

  const confirmedCount = nodes.filter(n => n.confirmedByPractitioner).length;
  const provisionalCount = nodes.filter(n => !n.confirmedByPractitioner).length;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-white">Developmental Field</h3>
          <div className="flex gap-2 text-xs text-gray-500">
            {confirmedCount > 0 && <span className="text-emerald-400">{confirmedCount} confirmed</span>}
            {provisionalCount > 0 && <span className="text-yellow-500/70">{provisionalCount} provisional</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 border border-white/10
              rounded hover:border-white/20 hover:text-white disabled:opacity-50 transition-colors"
          >
            {generating ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {generating ? 'Generating…' : 'Generate Candidates'}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-300 border border-purple-500/30
              rounded hover:border-purple-500/50 hover:text-white transition-colors"
          >
            <Plus size={11} />
            Add Node
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/30 inline-block" /> marker
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm rotate-45 bg-white/20 border border-white/30 inline-block" /> goal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-white/20 border border-white/30 inline-block" /> grounding
        </span>
        <span className="flex items-center gap-1 ml-2">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-400/70 inline-block" /> coherent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-yellow-400/50 inline-block" /> emergent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-red-400/60 inline-block" /> constricted
        </span>
        <span className="flex items-center gap-1 ml-2 opacity-50">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed border-gray-600 inline-block" /> inactive
        </span>
      </div>

      {/* Field */}
      <div className="relative w-full aspect-square max-w-md mx-auto
        bg-gray-900/60 border border-white/5 rounded-2xl overflow-hidden">

        {/* Subtle element zone backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Fire top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-1/4 bg-orange-500/3 rounded-b-full" />
          {/* Water right */}
          <div className="absolute top-1/4 right-0 bottom-1/4 w-1/4 bg-blue-500/3 rounded-l-full" />
          {/* Earth bottom */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1/4 bg-amber-600/3 rounded-t-full" />
          {/* Air left */}
          <div className="absolute top-1/4 left-0 bottom-1/4 w-1/4 bg-teal-500/3 rounded-r-full" />
          {/* Aether center cluster — differentiated triadic field */}
          <div className="absolute top-1/3 left-1/3 right-1/3 bottom-1/3 bg-purple-500/8 rounded-full" />
          <div className="absolute top-[38%] left-[38%] right-[38%] bottom-[38%] border border-dashed border-purple-500/20 rounded-full" />
        </div>

        {/* Element axis labels */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] text-orange-500/50 font-semibold tracking-wider uppercase">Fire</div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-amber-500/50 font-semibold tracking-wider uppercase">Earth</div>
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 text-[9px] text-blue-500/50 font-semibold tracking-wider uppercase" style={{ writingMode: 'vertical-rl' }}>Water</div>
        <div className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] text-teal-500/50 font-semibold tracking-wider uppercase" style={{ writingMode: 'vertical-lr' }}>Air</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-purple-500/40 font-semibold tracking-wider uppercase">Aether</div>

        {/* Ring facets (fire, water, earth, air) */}
        {getRingFacets().map(def => (
          <FacetSlot
            key={def.key}
            facetKey={def.key}
            nodes={nodesByFacet(def.key)}
            onConfirm={handleConfirm}
            onDelete={handleDelete}
          />
        ))}

        {/* Center Aether cluster (Emanation, Elevation, Equilibrium) */}
        {getCenterFacets().map(def => (
          <FacetSlot
            key={def.key}
            facetKey={def.key}
            nodes={nodesByFacet(def.key)}
            onConfirm={handleConfirm}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showAdd && <AddNodeModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
