'use client';

/**
 * MODEL STUDIO - Groups Page
 *
 * Demo group management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  UserPlus,
  Settings,
  FileText,
} from 'lucide-react';

const demoGroups = [
  {
    id: '1',
    name: 'Mindfulness & Meditation',
    description: 'Weekly group exploring mindfulness practices and meditation techniques',
    members: 8,
    maxMembers: 10,
    schedule: 'Thursdays, 5:00 PM',
    duration: '90 min',
    location: 'Room A - Downtown Office',
    status: 'active',
    nextSession: 'Today',
    topics: ['Anxiety', 'Stress', 'Self-care'],
  },
  {
    id: '2',
    name: 'Grief Support Circle',
    description: 'Safe space for processing loss and supporting each other through grief',
    members: 6,
    maxMembers: 8,
    schedule: 'Tuesdays, 6:30 PM',
    duration: '75 min',
    location: 'Video Call',
    status: 'active',
    nextSession: 'Next Tuesday',
    topics: ['Grief', 'Loss', 'Healing'],
  },
  {
    id: '3',
    name: 'Men\'s Process Group',
    description: 'Exploring masculinity, emotions, and authentic connection',
    members: 5,
    maxMembers: 8,
    schedule: 'Mondays, 7:00 PM',
    duration: '90 min',
    location: 'Room B - Downtown Office',
    status: 'active',
    nextSession: 'Next Monday',
    topics: ['Identity', 'Relationships', 'Growth'],
  },
  {
    id: '4',
    name: 'Anxiety Workshop Series',
    description: '6-week structured program for understanding and managing anxiety',
    members: 10,
    maxMembers: 12,
    schedule: 'Wednesdays, 4:00 PM',
    duration: '60 min',
    location: 'Video Call',
    status: 'enrolling',
    nextSession: 'Starts Feb 12',
    topics: ['Anxiety', 'CBT', 'Skills'],
  },
  {
    id: '5',
    name: 'Creative Expression Therapy',
    description: 'Using art and creativity as tools for self-discovery and healing',
    members: 4,
    maxMembers: 6,
    schedule: 'Saturdays, 10:00 AM',
    duration: '120 min',
    location: 'Art Studio',
    status: 'paused',
    nextSession: 'Resuming March',
    topics: ['Art', 'Expression', 'Healing'],
  },
];

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400',
  enrolling: 'bg-amber-500/20 text-amber-400',
  paused: 'bg-slate-500/20 text-slate-400',
};

export default function ModelGroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<typeof demoGroups[0] | null>(null);

  const activeGroups = demoGroups.filter(g => g.status === 'active').length;
  const totalMembers = demoGroups.reduce((sum, g) => sum + g.members, 0);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Groups</h1>
          <p className="text-slate-500 mt-1">{activeGroups} active · {totalMembers} total members</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="col-span-2 space-y-4">
          {demoGroups.map((group) => (
            <motion.div
              key={group.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedGroup(group)}
              className={`bg-[#1e1e38] border rounded-xl p-5 cursor-pointer transition-all ${
                selectedGroup?.id === group.id
                  ? 'border-amber-500/50'
                  : 'border-slate-800/50 hover:border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{group.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColors[group.status as keyof typeof statusColors]}`}>
                      {group.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{group.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="w-4 h-4 text-slate-500" />
                  {group.members}/{group.maxMembers}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {group.schedule}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {group.location}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {group.topics.map((topic) => (
                    <span key={topic} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                      {topic}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-amber-400">Next: {group.nextSession}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Group Details */}
        <div className="space-y-4">
          {selectedGroup ? (
            <>
              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-medium text-white">{selectedGroup.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColors[selectedGroup.status as keyof typeof statusColors]}`}>
                      {selectedGroup.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4">{selectedGroup.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Members</span>
                    <span className="text-white">{selectedGroup.members} / {selectedGroup.maxMembers}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(selectedGroup.members / selectedGroup.maxMembers) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Schedule</span>
                    <span className="text-white">{selectedGroup.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white">{selectedGroup.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white">{selectedGroup.location}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Start Session
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">
                    <FileText className="w-4 h-4" />
                    Group Notes
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a group to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
