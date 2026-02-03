'use client';

import { useState, useEffect } from 'react';
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
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  GitBranch,
  X,
  Loader2,
} from 'lucide-react';
import { useTeamContext } from '@/hooks/useStudioData';

interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

interface Task {
  id: string;
  memberId: string;
  teamId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'delegated' | 'completed';
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
};

export default function TasksPage() {
  const { currentTeamId, includePersonal } = useTeamContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch tasks
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentTeamId) {
          params.set('teamId', currentTeamId);
          if (includePersonal) params.set('includePersonal', 'true');
        }
        if (statusFilter !== 'all') params.set('status', statusFilter);

        const res = await fetch(`/api/studio/tasks?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [currentTeamId, includePersonal, statusFilter]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'delegated').length;

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';

    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      const res = await fetch('/api/studio/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (!res.ok) {
        // Revert on failure
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, status: task.status } : t
        ));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, status: task.status } : t
      ));
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/studio/tasks', {
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

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ListTodo className="w-7 h-7 text-amber-400" />
            Tasks
          </h1>
          <p className="text-slate-400 mt-1">
            {todoCount} to do, {inProgressCount} in progress
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === key
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <config.icon className="w-3.5 h-3.5" />
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Task List */}
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTasks.map((task) => {
                const priority = priorityConfig[task.priority];
                const status = statusConfig[task.status];
                const StatusIcon = status.icon;
                const isExpanded = expandedTask === task.id;
                const completedSubtasks = task.subtasks?.filter(s => s.done).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`
                      bg-slate-900 border border-slate-800 rounded-xl overflow-hidden
                      ${task.status === 'completed' ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Main Row */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
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
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
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
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="text-xs text-slate-500">
                              {completedSubtasks}/{totalSubtasks}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
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

                      {/* More */}
                      <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
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
                            {/* Description */}
                            {task.description && (
                              <p className="text-sm text-slate-400">{task.description}</p>
                            )}

                            {/* Subtasks */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div>
                                <div className="text-xs text-slate-500 uppercase mb-2">Subtasks</div>
                                <div className="space-y-1">
                                  {task.subtasks.map((subtask) => (
                                    <div
                                      key={subtask.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <div className={`
                                        w-4 h-4 rounded border flex items-center justify-center
                                        ${subtask.done
                                          ? 'bg-emerald-500 border-emerald-500'
                                          : 'border-slate-600'}
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

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-slate-500" />
                                {task.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                              {task.status !== 'delegated' && task.status !== 'completed' && (
                                <button className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-1.5">
                                  <GitBranch className="w-3.5 h-3.5" />
                                  Delegate
                                </button>
                              )}
                              <button className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                                Edit
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg">No tasks found</div>
              <div className="text-sm mt-1">Create a task to get started</div>
            </div>
          )}
        </>
      )}

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTaskModal && (
          <NewTaskModal
            onClose={() => setShowNewTaskModal(false)}
            onSubmit={createTask}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg"
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
            <label className="block text-sm text-slate-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
            />
          </div>

          {/* Priority & Due Date */}
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
              <label className="block text-sm text-slate-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500/50"
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
