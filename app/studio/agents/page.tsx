'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileCode,
  AlertCircle,
} from 'lucide-react';

interface AgentTask {
  id: string;
  title: string;
  prompt: string;
  agentType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  artifacts?: { type: string; path: string }[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

const mockTasks: AgentTask[] = [
  {
    id: '1',
    title: 'Fix iOS redirect after signin',
    prompt: 'The signin page redirects to /maia but on native iOS it should redirect to /maia.html for Capacitor static serving. Find all redirect paths in signin/page.tsx and fix them.',
    agentType: 'maia-dev',
    status: 'completed',
    output: 'Fixed 6 redirect paths in app/signin/page.tsx. Created navigateToApp() helper that detects native platform and uses .html extension. Build passes.',
    artifacts: [
      { type: 'file', path: 'app/signin/page.tsx' },
    ],
    startedAt: '10:23 AM',
    completedAt: '10:31 AM',
    createdAt: '10:22 AM',
  },
  {
    id: '2',
    title: 'Add voice mode toggle to capture',
    prompt: 'Add a toggle in the CaptureSheet component to switch between text input and voice recording mode.',
    agentType: 'maia-dev',
    status: 'running',
    startedAt: '10:45 AM',
    createdAt: '10:44 AM',
  },
  {
    id: '3',
    title: 'Investigate slow /maia load times',
    prompt: 'Profile the /maia page load. Identify the slowest operations and suggest optimizations.',
    agentType: 'explore',
    status: 'pending',
    createdAt: '10:50 AM',
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'slate', icon: Clock },
  running: { label: 'Running', color: 'blue', icon: RefreshCw },
  completed: { label: 'Completed', color: 'emerald', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'red', icon: XCircle },
};

export default function AgentsPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [expandedTask, setExpandedTask] = useState<string | null>('1');

  const runningCount = tasks.filter(t => t.status === 'running').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GitBranch className="w-7 h-7 text-blue-400" />
            Agent Work
          </h1>
          <p className="text-slate-400 mt-1">
            Delegated tasks in progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          {runningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {runningCount} running
            </div>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm">
              <Clock className="w-4 h-4" />
              {pendingCount} queued
            </div>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        <AnimatePresence>
          {tasks.map((task) => {
            const config = statusConfig[task.status];
            const isExpanded = expandedTask === task.id;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
                >
                  {/* Status Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${task.status === 'running' ? 'bg-blue-500/20' : ''}
                    ${task.status === 'completed' ? 'bg-emerald-500/20' : ''}
                    ${task.status === 'failed' ? 'bg-red-500/20' : ''}
                    ${task.status === 'pending' ? 'bg-slate-800' : ''}
                  `}>
                    <config.icon className={`w-5 h-5
                      ${task.status === 'running' ? 'text-blue-400 animate-spin' : ''}
                      ${task.status === 'completed' ? 'text-emerald-400' : ''}
                      ${task.status === 'failed' ? 'text-red-400' : ''}
                      ${task.status === 'pending' ? 'text-slate-400' : ''}
                    `} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{task.title}</h3>
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                        {task.agentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {task.status === 'running' && task.startedAt && (
                        <span>Started {task.startedAt}</span>
                      )}
                      {task.status === 'completed' && task.completedAt && (
                        <span>Completed {task.completedAt}</span>
                      )}
                      {task.status === 'pending' && (
                        <span>Queued {task.createdAt}</span>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

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
                        {/* Prompt */}
                        <div>
                          <div className="text-xs text-slate-500 uppercase mb-2">Delegation Prompt</div>
                          <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300 font-mono">
                            {task.prompt}
                          </div>
                        </div>

                        {/* Output (if completed) */}
                        {task.output && (
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-2">Agent Output</div>
                            <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300">
                              {task.output}
                            </div>
                          </div>
                        )}

                        {/* Artifacts */}
                        {task.artifacts && task.artifacts.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-2">Files Changed</div>
                            <div className="space-y-1">
                              {task.artifacts.map((artifact, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-slate-400"
                                >
                                  <FileCode className="w-4 h-4" />
                                  <span className="font-mono">{artifact.path}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          {task.status === 'completed' && (
                            <>
                              <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm">
                                Approve & Ship
                              </button>
                              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                                Review Changes
                              </button>
                              <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                                Reject
                              </button>
                            </>
                          )}
                          {task.status === 'running' && (
                            <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm flex items-center gap-2">
                              <Terminal className="w-4 h-4" />
                              View Live Output
                            </button>
                          )}
                          {task.status === 'pending' && (
                            <>
                              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Run Now
                              </button>
                              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm">
                                Edit Prompt
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

      {tasks.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">No agent tasks</div>
          <div className="text-sm mt-1">Delegate work from the Triage queue</div>
        </div>
      )}
    </div>
  );
}
