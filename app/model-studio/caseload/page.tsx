'use client';

/**
 * MODEL STUDIO - Caseload Page
 *
 * Demo caseload management with treatment progress tracking
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Target,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';

const demoCaseload = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: 'SM',
    diagnosis: 'Generalized Anxiety Disorder',
    startDate: 'Oct 2025',
    sessions: 12,
    progress: 'improving',
    lastSession: '2 days ago',
    nextSession: 'Today, 2:00 PM',
    goals: [
      { name: 'Reduce panic attacks', progress: 75, status: 'on-track' },
      { name: 'Improve sleep quality', progress: 60, status: 'on-track' },
      { name: 'Develop coping strategies', progress: 80, status: 'ahead' },
    ],
    riskLevel: 'low',
    notes: 'Responding well to CBT. Consider maintenance phase soon.',
  },
  {
    id: '2',
    name: 'James Roberts',
    avatar: 'JR',
    diagnosis: 'Grief/Bereavement',
    startDate: 'Dec 2025',
    sessions: 8,
    progress: 'stable',
    lastSession: '1 week ago',
    nextSession: 'Today, 3:30 PM',
    goals: [
      { name: 'Process grief stages', progress: 40, status: 'on-track' },
      { name: 'Maintain daily routine', progress: 55, status: 'on-track' },
      { name: 'Build support network', progress: 30, status: 'behind' },
    ],
    riskLevel: 'moderate',
    notes: 'Struggling with anniversary of loss. Monitor closely.',
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: 'EC',
    diagnosis: 'Major Depressive Disorder',
    startDate: 'May 2025',
    sessions: 24,
    progress: 'improving',
    lastSession: '3 days ago',
    nextSession: 'Tomorrow, 10:00 AM',
    goals: [
      { name: 'Stabilize mood', progress: 85, status: 'ahead' },
      { name: 'Return to work', progress: 90, status: 'ahead' },
      { name: 'Establish healthy habits', progress: 70, status: 'on-track' },
    ],
    riskLevel: 'low',
    notes: 'Ready for termination planning. Significant progress made.',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'DK',
    diagnosis: 'PTSD',
    startDate: 'Jan 2026',
    sessions: 3,
    progress: 'early',
    lastSession: '1 day ago',
    nextSession: 'Next Monday, 11:00 AM',
    goals: [
      { name: 'Reduce hypervigilance', progress: 15, status: 'on-track' },
      { name: 'Process trauma memories', progress: 10, status: 'on-track' },
      { name: 'Improve sleep', progress: 20, status: 'on-track' },
    ],
    riskLevel: 'high',
    notes: 'Early in treatment. Building rapport before EMDR.',
  },
  {
    id: '5',
    name: 'Chris Martinez',
    avatar: 'CM',
    diagnosis: 'Relationship Issues',
    startDate: 'Sep 2025',
    sessions: 15,
    progress: 'improving',
    lastSession: '4 days ago',
    nextSession: 'Thursday, 1:00 PM',
    goals: [
      { name: 'Improve communication', progress: 65, status: 'on-track' },
      { name: 'Resolve conflict patterns', progress: 50, status: 'behind' },
      { name: 'Rebuild trust', progress: 45, status: 'on-track' },
    ],
    riskLevel: 'moderate',
    notes: 'Couples work progressing. Individual sessions helping.',
  },
];

const progressIcons = {
  improving: { icon: TrendingUp, color: 'text-emerald-400' },
  stable: { icon: Minus, color: 'text-amber-400' },
  declining: { icon: TrendingDown, color: 'text-red-400' },
  early: { icon: Clock, color: 'text-blue-400' },
};

const riskColors = {
  low: 'bg-emerald-500/20 text-emerald-400',
  moderate: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
};

const goalStatusColors = {
  'on-track': 'bg-blue-500',
  ahead: 'bg-emerald-500',
  behind: 'bg-amber-500',
};

export default function ModelCaseloadPage() {
  const [selectedCase, setSelectedCase] = useState<typeof demoCaseload[0] | null>(null);

  const activeCount = demoCaseload.length;
  const highRiskCount = demoCaseload.filter(c => c.riskLevel === 'high').length;
  const improvingCount = demoCaseload.filter(c => c.progress === 'improving').length;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Briefcase className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Caseload</h1>
            <p className="text-slate-500 mt-1">Treatment progress tracking</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Briefcase className="w-5 h-5 text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white">{activeCount}</div>
          <div className="text-sm text-slate-400">Active Cases</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-white">{improvingCount}</div>
          <div className="text-sm text-slate-400">Improving</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
          <div className="text-2xl font-bold text-white">{highRiskCount}</div>
          <div className="text-sm text-slate-400">High Risk</div>
        </div>
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
          <Target className="w-5 h-5 text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-white">68%</div>
          <div className="text-sm text-slate-400">Goals On Track</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Case List */}
        <div className="col-span-2 space-y-3">
          {demoCaseload.map((caseItem) => {
            const progress = progressIcons[caseItem.progress as keyof typeof progressIcons];
            const ProgressIcon = progress.icon;
            return (
              <motion.div
                key={caseItem.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedCase(caseItem)}
                className={`bg-[#1e1e38] border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedCase?.id === caseItem.id
                    ? 'border-amber-500/50'
                    : 'border-slate-800/50 hover:border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium ${
                    caseItem.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                    caseItem.riskLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {caseItem.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{caseItem.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${riskColors[caseItem.riskLevel as keyof typeof riskColors]}`}>
                        {caseItem.riskLevel} risk
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{caseItem.diagnosis}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Since {caseItem.startDate}
                      </span>
                      <span>{caseItem.sessions} sessions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${progress.color}`}>
                      <ProgressIcon className="w-4 h-4" />
                      <span className="text-xs capitalize">{caseItem.progress}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>

                {/* Goal Progress Bars */}
                <div className="mt-4 flex gap-1">
                  {caseItem.goals.map((goal, i) => (
                    <div key={i} className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden" title={goal.name}>
                      <div
                        className={`h-full rounded-full ${goalStatusColors[goal.status as keyof typeof goalStatusColors]}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Case Details */}
        <div className="space-y-4">
          {selectedCase ? (
            <>
              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium ${
                    selectedCase.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                    selectedCase.riskLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {selectedCase.avatar}
                  </div>
                  <div>
                    <h2 className="font-medium text-white">{selectedCase.name}</h2>
                    <p className="text-sm text-slate-400">{selectedCase.diagnosis}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Treatment Start</span>
                    <span className="text-white">{selectedCase.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Sessions</span>
                    <span className="text-white">{selectedCase.sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Session</span>
                    <span className="text-amber-400">{selectedCase.nextSession}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Treatment Goals</h3>
                <div className="space-y-4">
                  {selectedCase.goals.map((goal, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{goal.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                          goal.status === 'ahead' ? 'bg-emerald-500/20 text-emerald-400' :
                          goal.status === 'behind' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${goalStatusColors[goal.status as keyof typeof goalStatusColors]}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-slate-500 mt-1">{goal.progress}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Clinical Notes</h3>
                <p className="text-sm text-white">{selectedCase.notes}</p>
              </div>
            </>
          ) : (
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
