'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Plus,
  Check,
  Loader2,
  Search,
  Link2,
  AlertCircle,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
}

type LocationType = 'video' | 'phone' | 'in_person';

const sessionTypes = [
  { id: 'initial', name: 'Initial Consultation', duration: 90 },
  { id: 'follow_up', name: 'Follow Up', duration: 60 },
  { id: 'check_in', name: 'Check-in', duration: 45 },
  { id: 'deep_dive', name: 'Deep Dive', duration: 120 },
  { id: 'custom', name: 'Custom', duration: 60 },
];

const locationOptions: { type: LocationType; label: string; icon: typeof Video }[] = [
  { type: 'video', label: 'Video Call', icon: Video },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'in_person', label: 'In Person', icon: MapPin },
];


export default function NewSessionPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [addingClient, setAddingClient] = useState(false);
  const [sessionType, setSessionType] = useState(sessionTypes[1]); // Default to Follow Up
  const [customDuration, setCustomDuration] = useState(60);
  const [locationType, setLocationType] = useState<LocationType>('video');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiFetch('/api/studio/clients');
        const data = await response.json();
        // Clients API returns { clients: [...] }
        if (data.clients) {
          setClients(data.clients.map((c: { id: string; name: string; email: string }) => ({
            id: c.id,
            name: c.name,
            email: c.email || '',
          })));
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const duration = sessionType.id === 'custom' ? customDuration : sessionType.duration;

  const isValid = selectedClient && date && time;

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;

    setAddingClient(true);

    try {
      const response = await apiFetch('/api/studio/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName.trim(),
          email: newClientEmail.trim() || null,
        }),
      });

      const data = await response.json();

      // Clients API returns { client: {...} } on success, { error: '...' } on failure
      if (data.error) {
        throw new Error(data.error);
      }

      const newClient: Client = {
        id: data.client.id,
        name: data.client.name,
        email: data.client.email || '',
      };

      // Add to local list and select
      setClients((prev) => [...prev, newClient]);
      setSelectedClient(newClient);
      setShowAddClient(false);
      setShowClientDropdown(false);
      setNewClientName('');
      setNewClientEmail('');
      setClientSearch('');
    } catch (error) {
      console.error('Failed to add client:', error);
    } finally {
      setAddingClient(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      const sessionData = {
        client_id: selectedClient.id,
        session_type: sessionType.name,
        scheduled_at: new Date(`${date}T${time}`).toISOString(),
        duration_minutes: duration,
        location_type: locationType,
        meeting_link: locationType === 'video' ? meetingLink : undefined,
        prep_notes: notes || undefined,
      };

      const response = await apiFetch('/api/studio/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to book session');
      }

      // Success - redirect to sessions list
      router.push('/studio/sessions');
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to book session. Please try again.');
      setSubmitting(false);
    }
  };

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setDate(dateStr);
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/studio/sessions"
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Book New Session
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule a session with a client
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Client Selection */}
        <div className={`bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 relative ${
          (showClientDropdown || showAddClient) && !selectedClient ? 'z-50' : 'z-0'
        }`}>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <Users className="w-4 h-4 inline mr-2" />
            Client
          </label>

          <div className="relative">
            {/* Click-outside overlay to close dropdown */}
            {(showClientDropdown || showAddClient) && !selectedClient && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setShowClientDropdown(false);
                  setShowAddClient(false);
                }}
              />
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={selectedClient ? selectedClient.name : clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setSelectedClient(null);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Search for a client..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              {selectedClient && (
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    setClientSearch('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showClientDropdown && !selectedClient && !showAddClient && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-4 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </div>
                ) : (
                  <>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setClientSearch('');
                          setShowClientDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/50"
                      >
                        <div className="text-white font-medium">{client.name}</div>
                        <div className="text-sm text-slate-400">{client.email}</div>
                      </button>
                    ))}
                    {filteredClients.length === 0 && clientSearch && (
                      <div className="px-4 py-3 text-slate-400 text-sm">
                        No clients found for "{clientSearch}"
                      </div>
                    )}
                    {/* Add New Client button */}
                    <button
                      onClick={() => {
                        setShowAddClient(true);
                        setNewClientName(clientSearch);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-amber-500/10 transition-colors flex items-center gap-2 text-amber-400 border-t border-slate-700/50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add new client{clientSearch ? `: "${clientSearch}"` : ''}</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* Add Client Form */}
            {showAddClient && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 w-full mt-2 bg-slate-800 border border-amber-500/30 rounded-lg shadow-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-amber-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Client
                  </span>
                  <button
                    onClick={() => {
                      setShowAddClient(false);
                      setNewClientName('');
                      setNewClientEmail('');
                    }}
                    className="text-slate-400 hover:text-white text-lg"
                  >
                    &times;
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Client name"
                      autoFocus
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <button
                    onClick={handleAddClient}
                    disabled={!newClientName.trim() || !newClientEmail.trim() || addingClient}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      newClientName.trim() && newClientEmail.trim() && !addingClient
                        ? 'bg-amber-500 text-white hover:bg-amber-400'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {addingClient ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Add Client
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Session Type */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Session Type
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sessionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSessionType(type)}
                className={`p-3 rounded-lg text-sm transition-all ${
                  sessionType.id === type.id
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                    : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{type.duration} min</div>
              </button>
            ))}
          </div>

          {sessionType.id === 'custom' && (
            <div className="mt-4">
              <label className="block text-sm text-slate-400 mb-2">
                Custom Duration (minutes)
              </label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                min={15}
                max={240}
                step={15}
                className="w-32 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            <Clock className="w-4 h-4 inline mr-2" />
            Date & Time
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Duration: {duration} minutes
          </p>
        </div>

        {/* Location Type */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Location
          </label>

          <div className="flex gap-2">
            {locationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => setLocationType(option.type)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm transition-all ${
                    locationType === option.type
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                      : 'bg-slate-900/50 border border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Meeting Link - shown when Video Call is selected */}
          {locationType === 'video' && (
            <div className="mt-4">
              <label className="block text-xs text-slate-500 mb-1">
                <Link2 className="w-3 h-3 inline mr-1" />
                Meeting Link (Teams, Zoom, etc.)
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://teams.live.com/meet/..."
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Notes (optional)
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes for this session..."
            rows={3}
            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
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
              <p className="text-red-300 font-medium">Failed to book session</p>
              <p className="text-red-300/70 text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Validation Hint */}
        {!isValid && !error && (
          <div className="text-sm text-slate-500 text-center">
            {!selectedClient && 'Please select a client'}
            {selectedClient && !date && 'Please select a date'}
            {selectedClient && date && !time && 'Please select a time'}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/studio/sessions"
            className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              isValid && !submitting
                ? 'bg-amber-500 text-white hover:bg-amber-400'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Book Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
