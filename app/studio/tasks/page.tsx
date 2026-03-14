'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  ChevronDown,
  ChevronRight,
  GitBranch,
  X,
  Loader2,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Zap,
  HelpCircle,
  Archive,
  ArrowRight,
  Timer,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { useTeamContext } from '@/hooks/useStudioData';
import { apiFetch } from '@/lib/http/apiBase';
import { FocusGarden } from '@/components/ganesha/FocusGarden';
import type { FocusGardenResult } from '@/components/ganesha/FocusGarden';

// ─── Types ───────────────────────────────────────────────

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

type EnergyState = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface Task {
  id: string;
  memberId: string;
  teamId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'delegated' | 'completed' | 'released';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  project?: string;
  tags: string[];
  assignee?: string;
  subtasks: Subtask[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  energyMatch?: EnergyState | null;
  feltTimeMinutes?: number | null;
  nextStep?: string | null;
  releasedAt?: string | null;
  releaseReason?: string | null;
}

type ViewMode = 'now' | 'queue' | 'completed';

// ─── Constants ───────────────────────────────────────────

const ENERGY_CONFIG: Record<EnergyState, {
  label: string;
  description: string;
  icon: typeof Flame;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  fire: {
    label: 'Fire',
    description: 'Wired / Push energy',
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  water: {
    label: 'Water',
    description: 'Emotional / Tender',
    icon: Droplets,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  earth: {
    label: 'Earth',
    description: 'Steady / Practical',
    icon: Mountain,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  air: {
    label: 'Air',
    description: 'Scattered / Restless',
    icon: Wind,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  aether: {
    label: 'Aether',
    description: 'Spacious / Unclear',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
};

const FELT_TIME_LABELS: { max: number; label: string }[] = [
  { max: 2, label: 'a deep breath' },
  { max: 5, label: 'making coffee' },
  { max: 10, label: 'one song' },
  { max: 20, label: 'a short walk' },
  { max: 30, label: 'one episode' },
  { max: 60, label: 'a focused hour' },
  { max: 120, label: 'a deep session' },
  { max: Infinity, label: 'a half day' },
];

function getFeltTimeLabel(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  const entry = FELT_TIME_LABELS.find(e => minutes <= e.max);
  return entry ? entry.label : null;
}

const priorityConfig = {
  low: { label: 'Low', color: 'slate' },
  medium: { label: 'Medium', color: 'blue' },
  high: { label: 'High', color: 'amber' },
  urgent: { label: 'Urgent', color: 'red' },
};

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'slate' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'blue' },
  delegated: { label: 'Delegated', icon: GitBranch, color: 'purple' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'emerald' },
  released: { label: 'Released', icon: Archive, color: 'slate' },
};

// ─── Focus Garden escalation heuristics ──────────────────

const ESCALATION_KEYWORDS = [
  'ashamed', 'shame', 'terrified', 'terror', 'avoid', 'avoiding',
  'freeze', 'frozen', 'dread', 'can\'t face', 'don\'t know why',
  'paralyzed', 'afraid', 'overwhelm', 'stuck for weeks',
  'keep putting off', 'what\'s wrong with me',
];

function shouldSuggestFocusGarden(
  answers: string[],
  task: Task,
  _energy: EnergyState | null,
): boolean {
  // Check if answers contain deep-resistance language
  const allText = answers.join(' ').toLowerCase();
  const hasEmotionalKeywords = ESCALATION_KEYWORDS.some(kw => allText.includes(kw));
  if (hasEmotionalKeywords) return true;

  // Task has been sitting 14+ days untouched
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate >= 14) return true;

  return false;
}

// ─── Energy-aware task scoring ───────────────────────────

function scoreTaskForEnergy(task: Task, energy: EnergyState | null): number {
  let score = 0;

  // Direct energy match is strongest signal
  if (energy && task.energyMatch === energy) {
    score += 100;
  }

  // Priority boost
  if (task.priority === 'urgent') score += 40;
  if (task.priority === 'high') score += 20;
  if (task.priority === 'medium') score += 10;

  // Due date urgency
  if (task.dueDate) {
    const daysUntilDue = Math.ceil(
      (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 0) score += 50; // Overdue
    else if (daysUntilDue <= 1) score += 30;
    else if (daysUntilDue <= 3) score += 15;
  }

  // Energy heuristics when no explicit match
  if (!task.energyMatch && energy) {
    // Felt-time matching for energy states
    const minutes = task.feltTimeMinutes || 30; // Default estimate
    if (energy === 'air' && minutes <= 10) score += 30; // Scattered? Quick wins.
    if (energy === 'fire' && minutes >= 30) score += 20; // Wired? Deep work.
    if (energy === 'earth' && task.priority !== 'low') score += 15; // Steady? Important stuff.
    if (energy === 'water' && task.priority === 'low') score += 20; // Tender? Light touch.
    if (energy === 'aether') score += 5; // Spacious? Everything equal.
  }

  // In-progress tasks get a boost (momentum)
  if (task.status === 'in_progress') score += 25;

  // Has a next step defined (easier to start)
  if (task.nextStep) score += 10;

  return score;
}

// ─── Main Component ──────────────────────────────────────

export default function TasksPage() {
  const { currentTeamId, includePersonal } = useTeamContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('now');
  const [showQueue, setShowQueue] = useState(false);

  // Energy state
  const [energy, setEnergy] = useState<EnergyState | null>(null);
  const [showEnergyPicker, setShowEnergyPicker] = useState(false);
  const [energyLoading, setEnergyLoading] = useState(true);

  // Help me decide
  const [decidingTaskId, setDecidingTaskId] = useState<string | null>(null);
  const [decideStep, setDecideStep] = useState(0);
  const [decideAnswers, setDecideAnswers] = useState<string[]>([]);

  // Release dialog
  const [releasingTaskId, setReleasingTaskId] = useState<string | null>(null);
  const [releaseReason, setReleaseReason] = useState('');

  // Focus Garden (Ganesha escalation from Help Me Decide)
  const [isFocusGardenOpen, setIsFocusGardenOpen] = useState(false);
  const [focusGardenContext, setFocusGardenContext] = useState('');
  const [focusGardenTaskId, setFocusGardenTaskId] = useState<string | null>(null);

  // ─── Fetch tasks ─────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentTeamId) {
        params.set('teamId', currentTeamId);
        if (includePersonal) params.set('includePersonal', 'true');
      }

      const res = await apiFetch(`/api/studio/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTeamId, includePersonal]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ─── Fetch energy state ──────────────────────────────

  useEffect(() => {
    async function fetchEnergy() {
      try {
        const res = await apiFetch('/api/studio/energy');
        if (res.ok) {
          const data = await res.json();
          if (data.energy) {
            // Check if set within last 4 hours (energy state is ephemeral)
            const setAt = data.setAt ? new Date(data.setAt) : null;
            const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
            if (setAt && setAt > fourHoursAgo) {
              setEnergy(data.energy);
            } else {
              setShowEnergyPicker(true);
            }
          } else {
            setShowEnergyPicker(true);
          }
        }
      } catch {
        // Graceful — just show picker
        setShowEnergyPicker(true);
      } finally {
        setEnergyLoading(false);
      }
    }
    fetchEnergy();
  }, []);

  // ─── Derived state ───────────────────────────────────

  const activeTasks = useMemo(() =>
    tasks.filter(t => t.status !== 'completed' && t.status !== 'released'),
    [tasks]
  );

  const completedTasks = useMemo(() =>
    tasks.filter(t => t.status === 'completed'),
    [tasks]
  );

  const filteredActiveTasks = useMemo(() => {
    let filtered = activeTasks;
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [activeTasks, searchQuery]);

  // Score and sort tasks by energy match
  const rankedTasks = useMemo(() => {
    return [...filteredActiveTasks].sort((a, b) =>
      scoreTaskForEnergy(b, energy) - scoreTaskForEnergy(a, energy)
    );
  }, [filteredActiveTasks, energy]);

  const nowTask = rankedTasks[0] || null;
  const queueTasks = rankedTasks.slice(1);

  // Stale tasks (5+ days untouched, not completed)
  const staleTasks = useMemo(() =>
    activeTasks.filter(t => {
      const updated = new Date(t.updatedAt);
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      return updated < fiveDaysAgo;
    }),
    [activeTasks]
  );

  const todoCount = activeTasks.filter(t => t.status === 'todo').length;
  const inProgressCount = activeTasks.filter(t => t.status === 'in_progress').length;

  // ─── Actions ─────────────────────────────────────────

  const setEnergyState = async (newEnergy: EnergyState) => {
    setEnergy(newEnergy);
    setShowEnergyPicker(false);
    try {
      await apiFetch('/api/studio/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energy: newEnergy }),
      });
    } catch (err) {
      console.error('Failed to save energy state:', err);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      const res = await apiFetch('/api/studio/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!res.ok) {
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, status: task.status } : t
        ));
      }
    } catch {
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, status: task.status } : t
      ));
    }
  };

  const releaseTask = async (taskId: string, reason: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: 'released' as const, releaseReason: reason } : t
    ));
    setReleasingTaskId(null);
    setReleaseReason('');

    try {
      await apiFetch('/api/studio/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: 'released',
          releaseReason: reason,
        }),
      });
    } catch (err) {
      console.error('Failed to release task:', err);
      fetchTasks(); // Revert by re-fetching
    }
  };

  // ─── Focus Garden integration ─────────────────────────

  const openFocusGardenForTask = (
    task: Task,
    decideDraft?: { benefit?: string; smallestStep?: string; cost?: string }
  ) => {
    setFocusGardenTaskId(task.id);

    const lines: string[] = [`Task: ${task.title}`];
    if (task.nextStep) lines.push(`Current next step: ${task.nextStep}`);
    if (decideDraft?.benefit) lines.push(`What finishing gives me: ${decideDraft.benefit}`);
    if (decideDraft?.smallestStep) lines.push(`Smallest step: ${decideDraft.smallestStep}`);
    if (decideDraft?.cost) lines.push(`Cost of not doing it: ${decideDraft.cost}`);

    setFocusGardenContext(lines.join('\n'));
    setIsFocusGardenOpen(true);

    // Close Help Me Decide modal
    setDecidingTaskId(null);
    setDecideStep(0);
    setDecideAnswers([]);
  };

  const handleFocusGardenComplete = async (result: FocusGardenResult) => {
    const taskId = focusGardenTaskId;
    setIsFocusGardenOpen(false);
    setFocusGardenTaskId(null);
    if (!taskId) return;

    // The Focus Garden's chosenAction (from Gate 3 "small action that honors both")
    // becomes the task's next step
    const nextStep = result.chosenAction || result.gateAnswers.smallAction;

    if (nextStep) {
      // Update task with the Focus Garden result
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, nextStep } : t
      ));

      try {
        await apiFetch('/api/studio/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, nextStep }),
        });
      } catch (err) {
        console.error('Failed to update task from Focus Garden:', err);
        fetchTasks(); // Revert by re-fetching
      }
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          teamId: currentTeamId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks([data.task, ...tasks]);
        setShowNewTaskModal(false);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ListTodo className="w-7 h-7 text-amber-400" />
            Tasks
          </h1>
          <p className="text-slate-400 mt-1">
            {todoCount} to do, {inProgressCount} in progress
            {staleTasks.length > 0 && (
              <span className="text-amber-400/70 ml-2">
                · {staleTasks.length} need triage
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Energy indicator */}
          {energy && (
            <button
              onClick={() => setShowEnergyPicker(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${ENERGY_CONFIG[energy].bgColor} ${ENERGY_CONFIG[energy].borderColor} ${ENERGY_CONFIG[energy].color}`}
            >
              {(() => { const Icon = ENERGY_CONFIG[energy].icon; return <Icon className="w-4 h-4" />; })()}
              <span className="text-sm">{ENERGY_CONFIG[energy].label}</span>
            </button>
          )}

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Energy Picker Overlay */}
      <AnimatePresence>
        {(showEnergyPicker || (energyLoading === false && !energy)) && !energyLoading && (
          <EnergyPicker
            currentEnergy={energy}
            onSelect={setEnergyState}
            onDismiss={energy ? () => setShowEnergyPicker(false) : undefined}
          />
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : activeTasks.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 text-slate-500">
          <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">No tasks yet</div>
          <div className="text-sm mt-1 mb-6">Create a task to get started</div>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      ) : (
        <>
          {/* ═══ NOW CARD ═══ */}
          {nowTask && viewMode === 'now' && (
            <NowCard
              task={nowTask}
              energy={energy}
              onComplete={() => updateTaskStatus(nowTask.id, 'completed')}
              onStart={() => updateTaskStatus(nowTask.id, 'in_progress')}
              onDelegate={() => updateTaskStatus(nowTask.id, 'delegated')}
              onRelease={() => setReleasingTaskId(nowTask.id)}
              onHelpDecide={() => {
                setDecidingTaskId(nowTask.id);
                setDecideStep(0);
                setDecideAnswers([]);
              }}
              onSkip={() => {
                // Move this task to end by marking it as just-updated
                setTasks(tasks.map(t =>
                  t.id === nowTask.id ? { ...t, updatedAt: new Date().toISOString() } : t
                ));
              }}
            />
          )}

          {/* ═══ VIEW TOGGLE ═══ */}
          <div className="flex items-center gap-2 mb-4 mt-6">
            {(['now', 'queue', 'completed'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {mode === 'now' && 'Now'}
                {mode === 'queue' && `Queue (${queueTasks.length})`}
                {mode === 'completed' && `Done (${completedTasks.length})`}
              </button>
            ))}

            {viewMode === 'queue' && (
              <div className="flex-1 max-w-xs ml-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ═══ QUEUE LIST ═══ */}
          {viewMode === 'queue' && (
            <div className="space-y-2">
              {/* Stale tasks triage banner */}
              {staleTasks.length > 0 && (
                <StaleBanner
                  count={staleTasks.length}
                  tasks={staleTasks}
                  onDo={(id) => updateTaskStatus(id, 'in_progress')}
                  onDelegate={(id) => updateTaskStatus(id, 'delegated')}
                  onRelease={(id) => {
                    setReleasingTaskId(id);
                  }}
                />
              )}

              <AnimatePresence>
                {queueTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    energy={energy}
                    isExpanded={expandedTask === task.id}
                    onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    onToggleStatus={() =>
                      updateTaskStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')
                    }
                    onDelegate={() => updateTaskStatus(task.id, 'delegated')}
                    onRelease={() => setReleasingTaskId(task.id)}
                  />
                ))}
              </AnimatePresence>

              {queueTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-sm">Queue is empty. Everything is in the Now Card.</div>
                </div>
              )}
            </div>
          )}

          {/* ═══ COMPLETED LIST ═══ */}
          {viewMode === 'completed' && (
            <div className="space-y-2">
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    energy={energy}
                    isExpanded={expandedTask === task.id}
                    onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    onToggleStatus={() => updateTaskStatus(task.id, 'todo')}
                    onDelegate={() => {}}
                    onRelease={() => {}}
                  />
                ))}
              </AnimatePresence>

              {completedTasks.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-sm">No completed tasks yet.</div>
                </div>
              )}
            </div>
          )}

          {/* ═══ NOW VIEW (below the card) — collapsed queue peek ═══ */}
          {viewMode === 'now' && queueTasks.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowQueue(!showQueue)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3"
              >
                {showQueue ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {queueTasks.length} more in queue
              </button>

              <AnimatePresence>
                {showQueue && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {queueTasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 px-3 py-2 bg-slate-900/50 rounded-lg text-sm"
                      >
                        <span className="text-slate-500">{task.priority === 'urgent' ? '!!' : task.priority === 'high' ? '!' : ''}</span>
                        <span className="text-slate-300 flex-1 truncate">{task.title}</span>
                        {task.feltTimeMinutes && (
                          <span className="text-slate-600 text-xs flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {getFeltTimeLabel(task.feltTimeMinutes)}
                          </span>
                        )}
                        {task.energyMatch && (
                          <span className={`text-xs ${ENERGY_CONFIG[task.energyMatch].color}`}>
                            {(() => { const Icon = ENERGY_CONFIG[task.energyMatch].icon; return <Icon className="w-3 h-3" />; })()}
                          </span>
                        )}
                      </div>
                    ))}
                    {queueTasks.length > 5 && (
                      <button
                        onClick={() => setViewMode('queue')}
                        className="text-xs text-teal-400 hover:text-teal-300 pl-3"
                      >
                        View all {queueTasks.length} tasks
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ═══ MODALS ═══ */}

      <AnimatePresence>
        {showNewTaskModal && (
          <NewTaskModal
            onClose={() => setShowNewTaskModal(false)}
            onSubmit={createTask}
            saving={saving}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {releasingTaskId && (
          <ReleaseModal
            task={tasks.find(t => t.id === releasingTaskId)!}
            reason={releaseReason}
            onReasonChange={setReleaseReason}
            onRelease={() => releaseTask(releasingTaskId, releaseReason)}
            onClose={() => {
              setReleasingTaskId(null);
              setReleaseReason('');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {decidingTaskId && (
          <HelpMeDecideModal
            task={tasks.find(t => t.id === decidingTaskId)!}
            energy={energy}
            step={decideStep}
            answers={decideAnswers}
            onAnswer={(answer) => {
              setDecideAnswers([...decideAnswers, answer]);
              setDecideStep(decideStep + 1);
            }}
            onClose={() => {
              setDecidingTaskId(null);
              setDecideStep(0);
              setDecideAnswers([]);
            }}
            onStartTask={() => {
              updateTaskStatus(decidingTaskId, 'in_progress');
              setDecidingTaskId(null);
            }}
            onEnterFocusGarden={(task, draft) => openFocusGardenForTask(task, draft)}
          />
        )}
      </AnimatePresence>

      {/* Ganesha's Focus Garden — escalation from Help Me Decide */}
      <FocusGarden
        isOpen={isFocusGardenOpen}
        onClose={() => {
          setIsFocusGardenOpen(false);
          setFocusGardenTaskId(null);
        }}
        initialContext={focusGardenContext}
        onComplete={handleFocusGardenComplete}
      />
    </div>
  );
}

// ─── NOW CARD ──────────────────────────────────────────

function NowCard({
  task,
  energy,
  onComplete,
  onStart,
  onDelegate,
  onRelease,
  onHelpDecide,
  onSkip,
}: {
  task: Task;
  energy: EnergyState | null;
  onComplete: () => void;
  onStart: () => void;
  onDelegate: () => void;
  onRelease: () => void;
  onHelpDecide: () => void;
  onSkip: () => void;
}) {
  const feltTime = getFeltTimeLabel(task.feltTimeMinutes);
  const energyMatch = task.energyMatch ? ENERGY_CONFIG[task.energyMatch] : null;
  const isInProgress = task.status === 'in_progress';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-700 rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Energy accent bar */}
      {energyMatch && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${energyMatch.bgColor.replace('/10', '/40')}`} />
      )}

      {/* Top row: status + priority */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            {isInProgress ? 'In Progress' : 'Up Next'}
          </span>
          {energyMatch && (
            <span className={`flex items-center gap-1 text-xs ${energyMatch.color}`}>
              {(() => { const Icon = energyMatch.icon; return <Icon className="w-3 h-3" />; })()}
              matches your {energyMatch.label.toLowerCase()} energy
            </span>
          )}
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-white mb-2">{task.title}</h2>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-slate-400 mb-4">{task.description}</p>
      )}

      {/* Next step (if defined) */}
      {task.nextStep && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
          <ArrowRight className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-sm text-teal-300">
            Next step: {task.nextStep}
          </span>
        </div>
      )}

      {/* Metadata row */}
      <div className="flex items-center gap-4 mb-6 text-sm text-slate-500">
        {feltTime && (
          <span className="flex items-center gap-1.5">
            <Timer className="w-4 h-4" />
            ~{feltTime}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.project && (
          <span>{task.project}</span>
        )}
        <span className={`px-2 py-0.5 text-xs rounded ${
          priorityConfig[task.priority].color === 'red' ? 'bg-red-500/20 text-red-400' :
          priorityConfig[task.priority].color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
          priorityConfig[task.priority].color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-700 text-slate-400'
        }`}>
          {priorityConfig[task.priority].label}
        </span>
      </div>

      {/* Action buttons — Do / Delegate / Release */}
      <div className="flex items-center gap-3">
        {isInProgress ? (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            Done
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-400 transition-colors font-medium"
          >
            <Zap className="w-4 h-4" />
            Do This
          </button>
        )}

        <button
          onClick={onDelegate}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors text-sm"
        >
          <GitBranch className="w-4 h-4" />
          Delegate
        </button>

        <button
          onClick={onRelease}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-colors text-sm"
        >
          <Archive className="w-4 h-4" />
          Release
        </button>

        <div className="flex-1" />

        <button
          onClick={onHelpDecide}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors text-sm"
        >
          <HelpCircle className="w-4 h-4" />
          Help me decide
        </button>
      </div>
    </motion.div>
  );
}

// ─── ENERGY PICKER ─────────────────────────────────────

function EnergyPicker({
  currentEnergy,
  onSelect,
  onDismiss,
}: {
  currentEnergy: EnergyState | null;
  onSelect: (energy: EnergyState) => void;
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 bg-slate-900 border border-slate-700 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">What&apos;s your energy right now?</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Tasks will match your state, not fight it.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {(Object.entries(ENERGY_CONFIG) as [EnergyState, typeof ENERGY_CONFIG[EnergyState]][]).map(([key, config]) => {
          const Icon = config.icon;
          const isSelected = currentEnergy === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                ${isSelected
                  ? `${config.bgColor} ${config.borderColor} ${config.color}`
                  : 'border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200'
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{config.label}</span>
              <span className="text-xs text-stone-500 text-center leading-tight">{config.description}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── TASK ROW ──────────────────────────────────────────

function TaskRow({
  task,
  energy,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onDelegate,
  onRelease,
}: {
  task: Task;
  energy: EnergyState | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onDelegate: () => void;
  onRelease: () => void;
}) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status] || statusConfig.todo;
  const StatusIcon = status.icon;
  const feltTime = getFeltTimeLabel(task.feltTimeMinutes);
  const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`
        bg-slate-900 border border-slate-800 rounded-xl overflow-hidden
        ${task.status === 'completed' ? 'opacity-60' : ''} /* Intentional: state indicator, not text dimming */
      `}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggleStatus}
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0
            ${task.status === 'completed'
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-600 hover:border-teal-500'}
          `}
        >
          {task.status === 'completed' && (
            <CheckCircle2 className="w-3 h-3 text-white" />
          )}
        </button>

        {/* Expand Button */}
        <button
          onClick={onToggleExpand}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${
              task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'
            }`}>
              {task.title}
            </h3>
            {totalSubtasks > 0 && (
              <span className="text-xs text-slate-500">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            {task.nextStep && (
              <span className="text-teal-400/70 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                {task.nextStep}
              </span>
            )}
            {feltTime && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                ~{feltTime}
              </span>
            )}
            {task.project && <span>{task.project}</span>}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1 text-purple-400">
                <GitBranch className="w-3 h-3" />
                {task.assignee}
              </span>
            )}
          </div>
        </div>

        {/* Energy match indicator */}
        {task.energyMatch && (
          <span className={`${ENERGY_CONFIG[task.energyMatch].color}`}>
            {(() => { const Icon = ENERGY_CONFIG[task.energyMatch].icon; return <Icon className="w-4 h-4" />; })()}
          </span>
        )}

        {/* Priority */}
        <span className={`
          px-2 py-0.5 text-xs rounded
          ${priority.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
          ${priority.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
          ${priority.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
          ${priority.color === 'red' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {priority.label}
        </span>

        {/* Status */}
        <span className={`
          flex items-center gap-1 px-2 py-0.5 text-xs rounded
          ${status.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
          ${status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
          ${status.color === 'purple' ? 'bg-purple-500/20 text-purple-400' : ''}
          ${status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : ''}
        `}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800"
          >
            <div className="p-4 space-y-4">
              {task.description && (
                <p className="text-sm text-slate-400">{task.description}</p>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-2">Subtasks</div>
                  <div className="space-y-1">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 text-sm">
                        <div className={`
                          w-4 h-4 rounded border flex items-center justify-center
                          ${subtask.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}
                        `}>
                          {subtask.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={subtask.done ? 'text-slate-500 line-through' : 'text-slate-300'}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-500" />
                  {task.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {task.status !== 'delegated' && task.status !== 'completed' && (
                  <>
                    <button
                      onClick={onDelegate}
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-1.5"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Delegate
                    </button>
                    <button
                      onClick={onRelease}
                      className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Release
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── STALE TASKS BANNER ────────────────────────────────

function StaleBanner({
  count,
  tasks,
  onDo,
  onDelegate,
  onRelease,
}: {
  count: number;
  tasks: Task[];
  onDo: (id: string) => void;
  onDelegate: (id: string) => void;
  onRelease: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <RotateCcw className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-amber-300">
          {count} task{count > 1 ? 's have' : ' has'} been waiting 5+ days
        </span>
        <span className="text-xs text-slate-500 ml-1">
          Do, delegate, or let go?
        </span>
        <ChevronDown className={`w-4 h-4 text-amber-400/50 ml-auto transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-t border-amber-500/10">
                <span className="text-sm text-slate-300 flex-1 truncate">{task.title}</span>
                <span className="text-xs text-slate-600">
                  {Math.floor((Date.now() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24))}d
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDo(task.id)}
                    className="px-2 py-1 text-xs bg-teal-500/20 text-teal-400 rounded hover:bg-teal-500/30 transition-colors"
                  >
                    Do
                  </button>
                  <button
                    onClick={() => onDelegate(task.id)}
                    className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                  >
                    Delegate
                  </button>
                  <button
                    onClick={() => onRelease(task.id)}
                    className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded hover:bg-slate-600 transition-colors"
                  >
                    Release
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── RELEASE MODAL ─────────────────────────────────────

function ReleaseModal({
  task,
  reason,
  onReasonChange,
  onRelease,
  onClose,
}: {
  task: Task;
  reason: string;
  onReasonChange: (r: string) => void;
  onRelease: () => void;
  onClose: () => void;
}) {
  if (!task) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <h3 className="text-lg font-medium text-white mb-1">Release this task</h3>
          <p className="text-sm text-slate-400 mb-4">
            Not everything needs to be done. Releasing is not failing — it&apos;s choosing.
          </p>

          <div className="bg-slate-800 rounded-lg p-3 mb-4">
            <span className="text-sm text-slate-300">{task.title}</span>
          </div>

          <label className="block text-sm text-slate-400 mb-2">
            Why are you letting this go? (optional)
          </label>
          <textarea
            value={reason}
            onChange={e => onReasonChange(e.target.value)}
            placeholder="e.g., No longer relevant, someone else handled it, not aligned..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 resize-none text-sm"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Keep it
            </button>
            <button
              onClick={onRelease}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              Release
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── HELP ME DECIDE MODAL ──────────────────────────────

const DECIDE_QUESTIONS = [
  'What would finishing this give you?',
  'What\'s the smallest real step — something you could do in 2 minutes?',
  'If you don\'t do it, what\'s the cost — and is that acceptable?',
];

function HelpMeDecideModal({
  task,
  energy,
  step,
  answers,
  onAnswer,
  onClose,
  onStartTask,
  onEnterFocusGarden,
}: {
  task: Task;
  energy: EnergyState | null;
  step: number;
  answers: string[];
  onAnswer: (answer: string) => void;
  onClose: () => void;
  onStartTask: () => void;
  onEnterFocusGarden: (task: Task, draft: { benefit?: string; smallestStep?: string; cost?: string }) => void;
}) {
  const [input, setInput] = useState('');
  const isComplete = step >= DECIDE_QUESTIONS.length;

  // Detect if Focus Garden should be suggested
  const suggestGarden = isComplete && shouldSuggestFocusGarden(answers, task, energy);

  if (!task) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-amber-500/20 rounded-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-medium text-white">
                {isComplete ? 'Your next move' : 'Help me decide'}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Task title */}
          <div className="bg-slate-800 rounded-lg p-3 mb-4">
            <span className="text-sm text-slate-300">{task.title}</span>
          </div>

          {/* Previous answers */}
          {answers.map((answer, i) => (
            <div key={i} className="mb-3">
              <div className="text-xs text-amber-400/60 mb-1">{DECIDE_QUESTIONS[i]}</div>
              <div className="text-sm text-slate-300 pl-3 border-l-2 border-amber-500/20">
                {answer}
              </div>
            </div>
          ))}

          {/* Current question or result */}
          {!isComplete ? (
            <div>
              <div className="text-sm text-amber-300 mb-3">{DECIDE_QUESTIONS[step]}</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && input.trim()) {
                      onAnswer(input.trim());
                      setInput('');
                    }
                  }}
                  placeholder="Type your answer..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (input.trim()) {
                      onAnswer(input.trim());
                      setInput('');
                    }
                  }}
                  disabled={!input.trim()}
                  className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-30"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-3">
                {DECIDE_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < step ? 'bg-amber-400' : i === step ? 'bg-amber-400/40' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Result */
            <div className="space-y-3">
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-xs text-teal-400 uppercase tracking-wider mb-1">Your next step</div>
                  <div className="text-sm text-white font-medium">{answers[1]}</div>
                </div>
                <div>
                  <div className="text-xs text-teal-400 uppercase tracking-wider mb-1">10-minute container</div>
                  <div className="text-sm text-slate-300">
                    Set a timer for 10 minutes. Start with just that step. If it feels lighter after, continue. If heavier, delegate or defer.
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onStartTask}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors text-sm font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    Start now
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    Not yet
                  </button>
                </div>
              </div>

              {/* Focus Garden escalation — shown when resistance patterns detected */}
              {suggestGarden ? (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm text-amber-300/90 mb-3">
                    This feels like it might go deeper than a task. The obstacle might be carrying information.
                  </p>
                  <button
                    onClick={() => onEnterFocusGarden(task, {
                      benefit: answers[0],
                      smallestStep: answers[1],
                      cost: answers[2],
                    })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-colors text-sm w-full justify-center"
                  >
                    <span className="text-lg">🐘</span>
                    Enter Focus Garden
                  </button>
                  <p className="text-xs text-slate-600 mt-2 text-center">
                    Not a productivity hack. A wisdom practice.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => onEnterFocusGarden(task, {
                    benefit: answers[0],
                    smallestStep: answers[1],
                    cost: answers[2],
                  })}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-400/70 transition-colors mx-auto"
                >
                  <span>🐘</span>
                  This feels deeper — enter Focus Garden
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── NEW TASK MODAL ────────────────────────────────────

interface NewTaskModalProps {
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  saving: boolean;
}

function NewTaskModal({ onClose, onSubmit, saving }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [project, setProject] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [feltTimeMinutes, setFeltTimeMinutes] = useState<string>('');
  const [energyMatch, setEnergyMatch] = useState<EnergyState | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      project: project.trim() || undefined,
      tags,
      status: 'todo',
      subtasks: [],
      nextStep: nextStep.trim() || undefined,
      feltTimeMinutes: feltTimeMinutes ? parseInt(feltTimeMinutes) : undefined,
      energyMatch: energyMatch || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">New Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">What needs to be done? *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Name the task in one sentence"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              autoFocus
            />
          </div>

          {/* Next Step — the ADHD activation move */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Smallest next step (2 min)
            </label>
            <input
              type="text"
              value={nextStep}
              onChange={e => setNextStep(e.target.value)}
              placeholder="e.g., Open the doc and add a title"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
            <p className="text-xs text-slate-600 mt-1">The tiny move that gets you started</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
            />
          </div>

          {/* Priority & Felt Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">How long? (felt time)</label>
              <select
                value={feltTimeMinutes}
                onChange={e => setFeltTimeMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="">Not sure</option>
                <option value="2">A deep breath (~2 min)</option>
                <option value="5">Making coffee (~5 min)</option>
                <option value="10">One song (~10 min)</option>
                <option value="20">A short walk (~20 min)</option>
                <option value="30">One episode (~30 min)</option>
                <option value="60">A focused hour</option>
                <option value="120">A deep session (~2 hr)</option>
              </select>
            </div>
          </div>

          {/* Energy Match & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Best energy for this</label>
              <select
                value={energyMatch}
                onChange={e => setEnergyMatch(e.target.value as EnergyState | '')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="">Any energy</option>
                <option value="fire">Fire (wired / push)</option>
                <option value="water">Water (emotional / tender)</option>
                <option value="earth">Earth (steady / practical)</option>
                <option value="air">Air (scattered / quick wins)</option>
                <option value="aether">Aether (spacious / creative)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50 input-dark-native"
              />
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Project</label>
            <input
              type="text"
              value={project}
              onChange={e => setProject(e.target.value)}
              placeholder="e.g., MAIA App, Marketing"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g., bug, feature, urgent"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
