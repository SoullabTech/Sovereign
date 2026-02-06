'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FolderOpen,
  Users,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
  Search,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Client {
  id: string;
  name: string;
  email: string;
}

type GroupType = 'cohort' | 'ongoing' | 'program' | 'category';
type LocationType = 'video' | 'phone' | 'in_person';

const groupTypes: { type: GroupType; label: string; description: string }[] = [
  { type: 'cohort', label: 'Cohort', description: 'Time-bound group (e.g., "Spring 2026 Workshop")' },
  { type: 'ongoing', label: 'Ongoing', description: 'Recurring meetings (e.g., "Monday Evening Group")' },
  { type: 'program', label: 'Program', description: 'Multi-session program (e.g., "12-Week Transformation")' },
  { type: 'category', label: 'Category', description: 'Business segment (e.g., "Corporate Clients")' },
];

const locationOptions: { type: LocationType; label: string; icon: typeof Video }[] = [
  { type: 'video', label: 'Video', icon: Video },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'in_person', label: 'In Person', icon: MapPin },
];

const dayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const colorOptions = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export default function NewGroupPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [groupType, setGroupType] = useState<GroupType>('cohort');
  const [meetingDay, setMeetingDay] = useState<number>(1);
  const [meetingTime, setMeetingTime] = useState('18:00');
  const [meetingDuration, setMeetingDuration] = useState(90);
  const [meetingLocationType, setMeetingLocationType] = useState<LocationType>('video');
  const [meetingLink, setMeetingLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSessions, setTotalSessions] = useState<number | ''>('');
  const [maxMembers, setMaxMembers] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Client selection
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  // Fetch clients for selection
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await apiFetch('/api/studio/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoadingClients(false);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c =>
    !selectedClients.find(s => s.id === c.id) &&
    (c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
     c.email.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  const isValid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      const groupData: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        groupType,
        notes: notes.trim() || undefined,
        clientIds: selectedClients.map(c => c.id),
      };

      // Add type-specific fields
      if (groupType === 'ongoing') {
        groupData.meetingDay = meetingDay;
        groupData.meetingTime = meetingTime;
        groupData.meetingDurationMinutes = meetingDuration;
        groupData.meetingLocationType = meetingLocationType;
        if (meetingLocationType === 'video' && meetingLink) {
          groupData.meetingLink = meetingLink;
        }
      }

      if (groupType === 'cohort' || groupType === 'program') {
        if (startDate) groupData.startDate = startDate;
        if (endDate) groupData.endDate = endDate;
        if (totalSessions) groupData.totalSessions = totalSessions;
      }

      if (maxMembers) {
        groupData.maxMembers = maxMembers;
      }

      const response = await apiFetch('/api/studio/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create group');
      }

      router.push(`/studio/groups/${data.group.id}`);
    } catch (err) {
      console.error('Failed to create group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/studio/groups"
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            Create New Group
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize clients into cohorts, programs, or categories
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Group Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monday Evening Group"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group for?"
                rows={2}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg transition-all border-2 ${
                      color === c
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 border-white/50'
                        : 'border-slate-600 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Group Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Group Type</h2>

          <div className="grid grid-cols-2 gap-3">
            {groupTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => setGroupType(type.type)}
                className={`p-4 rounded-lg text-left transition-all ${
                  groupType === type.type
                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                    : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className={`font-medium ${groupType === type.type ? 'text-indigo-300' : 'text-white'}`}>
                  {type.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ongoing Group Settings */}
        {groupType === 'ongoing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Meeting Schedule
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Day</label>
                  <select
                    value={meetingDay}
                    onChange={(e) => setMeetingDay(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                  >
                    {dayOptions.map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={meetingDuration}
                  onChange={(e) => setMeetingDuration(Number(e.target.value))}
                  min={15}
                  max={240}
                  step={15}
                  className="w-32 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Location</label>
                <div className="flex gap-2">
                  {locationOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setMeetingLocationType(option.type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                          meetingLocationType === option.type
                            ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {meetingLocationType === 'video' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cohort/Program Settings */}
        {(groupType === 'cohort' || groupType === 'program') && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Program Dates
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Total Sessions</label>
                <input
                  type="number"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g., 12"
                  min={1}
                  className="w-32 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Capacity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Capacity (Optional)</h2>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Maximum Members</label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value ? Number(e.target.value) : '')}
              placeholder="Leave empty for unlimited"
              min={1}
              className="w-40 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Initial Members */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Add Members (Optional)
          </h2>

          {/* Selected Members */}
          {selectedClients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg"
                >
                  <span className="text-sm text-indigo-300">{client.name}</span>
                  <button
                    onClick={() => setSelectedClients(prev => prev.filter(c => c.id !== client.id))}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Clients */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search clients to add..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Client List */}
          {clientSearch && (
            <div className="mt-2 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg">
              {loadingClients ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-500" />
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.slice(0, 10).map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClients(prev => [...prev, client]);
                      setClientSearch('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                  >
                    <div className="text-white font-medium">{client.name}</div>
                    <div className="text-sm text-slate-400">{client.email}</div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-sm text-slate-500 text-center">No clients found</div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this group..."
            rows={3}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Failed to create group</p>
              <p className="text-red-300/70 text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/studio/groups"
            className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              isValid && !submitting
                ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
