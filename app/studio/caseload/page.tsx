'use client';

import { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Case {
  id: string;
  clientName: string;
  status: 'active' | 'on-hold' | 'closed';
  lastSession: string;
  nextSession: string | null;
  notes: number;
  flags: string[];
}

// Placeholder data
const PLACEHOLDER_CASES: Case[] = [
  {
    id: '1',
    clientName: 'Example Client',
    status: 'active',
    lastSession: '2026-01-28',
    nextSession: '2026-02-05',
    notes: 12,
    flags: [],
  },
];

export default function CaseloadPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on-hold' | 'closed'>('all');

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-amber-400" />
              Caseload
            </h1>
            <p className="text-slate-400 mt-1">
              Case management and treatment tracking
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'active', 'on-hold', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-xl font-medium text-white mb-3">
            Caseload Management
          </h2>

          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Track client cases, treatment plans, session notes, and progress over time.
            Consult MAIA for clinical insights across your caseload.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <FileText className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300">Session Notes</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300">Treatment Plans</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <MessageSquare className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300">Progress Tracking</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-slate-300">MAIA Consult</p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Coming soon for Clinician portal types
          </p>
        </div>
      </div>
    </div>
  );
}
