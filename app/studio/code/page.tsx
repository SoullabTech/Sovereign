'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FileCode,
  ChevronRight,
  Plus,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAgentTasks, useDailyLog, AgentTask } from '@/hooks/useStudioData';

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} days ago`;
}

const statusConfig = {
  pending: { icon: Clock, label: 'Queued', color: 'slate' },
  running: { icon: RefreshCw, label: 'Running', color: 'blue' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'amber' },
  failed: { icon: XCircle, label: 'Failed', color: 'red' },
};

export default function CodeSessionsPage() {
  const { tasks, loading, updateTask, createTask } = useAgentTasks();
  const { incrementCounter } = useDailyLog();
  const [filter, setFilter] = useState<string>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newAgent, setNewAgent] = useState('maia-dev');

  const runningCount = tasks.filter(t => t.status === 'running').length;
  const queuedCount = tasks.filter(t => t.status === 'pending').length;
  const pendingReviewCount = tasks.filter(t => t.review_status === 'pending_review').length;

  // Map 'queued' filter to 'pending' status
  const statusFilter = filter === 'queued' ? 'pending' : filter;
  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  const handleCreateTask = async () => {
    if (!newTitle.trim() || !newPrompt.trim()) return;
    await createTask({
      title: newTitle,
      prompt: newPrompt,
      agent_type: newAgent,
    });
    await incrementCounter('delegated');
    setNewTitle('');
    setNewPrompt('');
    setShowNewForm(false);
  };

  const handleApprove = async (task: AgentTask) => {
    await updateTask(task.id, { review_status: 'approved' });
    await incrementCounter('reviewed');
    await incrementCounter('shipments');
  };

  const handleReject = async (task: AgentTask) => {
    await updateTask(task.id, { review_status: 'rejected' });
    await incrementCounter('reviewed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            Code Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {runningCount} running, {queuedCount} queued
            {pendingReviewCount > 0 && `, ${pendingReviewCount} pending review`}
          </p>
        </div>

        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      {/* New Task Form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Detailed prompt for the agent..."
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 h-24 resize-none font-mono text-sm"
              />
              <div className="flex items-center gap-3">
                <select
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="maia-dev">maia-dev</option>
                  <option value="explore">explore</option>
                  <option value="maia-ops">maia-ops</option>
                  <option value="ain-architect">ain-architect</option>
                </select>
                <div className="flex-1" />
                <button
                  onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTitle.trim() || !newPrompt.trim()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'running', 'queued', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-3 py-1.5 rounded-lg text-sm transition-colors
              ${filter === f
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}
            `}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.map((task) => {
            const status = statusConfig[task.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedSession === task.id;
            const isPendingReview = task.review_status === 'pending_review';

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`bg-[#1e1e38] border rounded-xl overflow-hidden ${
                  isPendingReview ? 'border-amber-500/50' : 'border-slate-800/50'
                }`}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedSession(isExpanded ? null : task.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  {/* Status Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${status.color === 'slate' ? 'bg-slate-800' : ''}
                    ${status.color === 'blue' ? 'bg-blue-500/20' : ''}
                    ${status.color === 'amber' ? 'bg-amber-500/20' : ''}
                    ${status.color === 'red' ? 'bg-red-500/20' : ''}
                  `}>
                    <StatusIcon className={`w-5 h-5
                      ${status.color === 'slate' ? 'text-slate-400' : ''}
                      ${status.color === 'blue' ? 'text-blue-400 animate-spin' : ''}
                      ${status.color === 'amber' ? 'text-amber-400' : ''}
                      ${status.color === 'red' ? 'text-red-400' : ''}
                    `} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-medium">{task.title}</h3>
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                        {task.agent_type}
                      </span>
                      {isPendingReview && (
                        <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                          Needs Review
                        </span>
                      )}
                      {task.review_status === 'approved' && (
                        <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded">
                          Approved
                        </span>
                      )}
                      {task.review_status === 'rejected' && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                          Rejected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {task.status === 'running' && task.started_at && (
                        <span>Started {formatRelativeTime(task.started_at)}</span>
                      )}
                      {task.status === 'completed' && task.completed_at && (
                        <span>Completed {formatRelativeTime(task.completed_at)}</span>
                      )}
                      {task.status === 'pending' && (
                        <span>Queued {formatRelativeTime(task.created_at)}</span>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800/50"
                    >
                      <div className="p-4 space-y-4">
                        {/* Prompt */}
                        <div>
                          <div className="text-xs text-slate-500 uppercase mb-2">Prompt</div>
                          <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300 font-mono whitespace-pre-wrap">
                            {task.prompt}
                          </div>
                        </div>

                        {/* Output */}
                        {task.output && (
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-2">Output</div>
                            <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300 whitespace-pre-wrap">
                              {task.output}
                            </div>
                          </div>
                        )}

                        {/* Files Changed (from artifacts) */}
                        {task.artifacts && task.artifacts.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-2">Artifacts</div>
                            <div className="space-y-1">
                              {task.artifacts.map((artifact, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-2 text-sm">
                                    <FileCode className="w-4 h-4 text-slate-400" />
                                    <span className="font-mono text-slate-300">{artifact.path}</span>
                                  </div>
                                  <span className="text-xs text-slate-500">{artifact.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Review Notes */}
                        {task.review_notes && (
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-2">Review Notes</div>
                            <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300">
                              {task.review_notes}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          {task.status === 'completed' && isPendingReview && (
                            <>
                              <button
                                onClick={() => handleApprove(task)}
                                className="flex-1 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
                              >
                                Approve & Ship
                              </button>
                              <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                                Needs Changes
                              </button>
                              <button
                                onClick={() => handleReject(task)}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {task.status === 'running' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                              <Terminal className="w-4 h-4" />
                              View Live Output
                            </button>
                          )}
                          {task.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateTask(task.id, { status: 'running' })}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                              >
                                <Play className="w-4 h-4" />
                                Run Now
                              </button>
                              <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm">
                                Edit
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
          })}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">No code sessions</div>
          <div className="text-sm mt-1">Start a new session to delegate coding tasks</div>
        </div>
      )}
    </div>
  );
}
