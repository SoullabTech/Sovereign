'use client';

/**
 * MODEL STUDIO - Tasks Page
 *
 * Demo task management with sample data
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  Calendar,
  User,
  Filter,
  MoreVertical,
  Inbox,
  Flag,
} from 'lucide-react';

const demoTasks = [
  {
    id: '1',
    title: 'New client inquiry - Sarah M.',
    description: 'Review intake form and schedule initial consultation',
    priority: 'urgent',
    status: 'pending',
    dueDate: 'Today',
    category: 'intake',
    assignedTo: 'Me',
  },
  {
    id: '2',
    title: 'Complete session notes for James R.',
    description: 'Document progress and treatment plan updates from today\'s session',
    priority: 'high',
    status: 'pending',
    dueDate: 'Today',
    category: 'documentation',
    assignedTo: 'Me',
  },
  {
    id: '3',
    title: 'Insurance claim follow-up - Emily C.',
    description: 'Call insurance company about denied claim #45892',
    priority: 'medium',
    status: 'pending',
    dueDate: 'Tomorrow',
    category: 'billing',
    assignedTo: 'Me',
  },
  {
    id: '4',
    title: 'Update intake questionnaire',
    description: 'Add new anxiety screening questions per updated protocol',
    priority: 'low',
    status: 'in_progress',
    dueDate: 'This week',
    category: 'admin',
    assignedTo: 'Me',
  },
  {
    id: '5',
    title: 'Prepare mindfulness group materials',
    description: 'Create handouts for next week\'s session on body scan meditation',
    priority: 'medium',
    status: 'pending',
    dueDate: 'Friday',
    category: 'preparation',
    assignedTo: 'Me',
  },
  {
    id: '6',
    title: 'Schedule supervision session',
    description: 'Book monthly supervision with Dr. Martinez',
    priority: 'low',
    status: 'completed',
    dueDate: 'Done',
    category: 'admin',
    assignedTo: 'Me',
  },
  {
    id: '7',
    title: 'Review EMDR protocol updates',
    description: 'Read new research on EMDR for complex trauma',
    priority: 'low',
    status: 'completed',
    dueDate: 'Done',
    category: 'education',
    assignedTo: 'Me',
  },
  {
    id: '8',
    title: 'Send welcome packet to new client',
    description: 'Email onboarding materials to Rachel G.',
    priority: 'high',
    status: 'pending',
    dueDate: 'Today',
    category: 'intake',
    assignedTo: 'MAIA',
  },
];

const priorityConfig = {
  urgent: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle, label: 'Urgent' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Flag, label: 'High' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Flag, label: 'Medium' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Flag, label: 'Low' },
};

const statusConfig = {
  pending: { color: 'text-slate-400', icon: Circle },
  in_progress: { color: 'text-blue-400', icon: Clock },
  completed: { color: 'text-emerald-400', icon: CheckCircle },
};

export default function ModelTasksPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [tasks, setTasks] = useState(demoTasks);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'completed';
    return task.status === 'completed';
  });

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'completed' ? 'pending' : 'completed',
          dueDate: task.status === 'completed' ? 'Today' : 'Done',
        };
      }
      return task;
    }));
  };

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const urgentCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-500 mt-1">
            {pendingCount} pending · {urgentCount} urgent
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-[#1e1e38] border border-slate-700 rounded-lg p-1">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-sm capitalize transition-colors ${
                filter === f ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1e38] border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Task Categories */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Urgent', count: urgentCount, color: 'text-red-400', bg: 'bg-red-500/20' },
          { label: 'Due Today', count: tasks.filter(t => t.dueDate === 'Today' && t.status !== 'completed').length, color: 'text-amber-400', bg: 'bg-amber-500/20' },
          { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { label: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
          const status = statusConfig[task.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.01 }}
              className={`bg-[#1e1e38] border rounded-xl p-4 transition-all ${
                task.status === 'completed' ? 'border-slate-800/30 opacity-60' : 'border-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 flex-shrink-0 ${status.color} hover:scale-110 transition-transform`}
                >
                  <StatusIcon className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${priority.bg} ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignedTo}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded">{task.category}</span>
                  </div>
                </div>

                <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
