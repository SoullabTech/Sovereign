"use client";

/**
 * CLIENT PROFILE PAGE
 *
 * Individual client view with timeline, notes, and chart data
 * The relationship memory center
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Clock,
  Star,
  Edit2,
  Save,
  X,
  Plus,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import type { PractitionerClient, PractitionerSession, ClientTimeline } from '@/lib/stellium/types';
import { GenerateInviteButton } from '@/components/portal/GenerateInviteButton';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  warning: '#E5A858',
  error: '#D98B8B',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-center space-x-3 py-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.stardust}50` }}>
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: colors.dim }}>{label}</p>
        <p className="text-sm" style={{ color: colors.starlight }}>{value}</p>
      </div>
    </div>
  );
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const clientId = params.id as string;
  const { practitionerId } = usePractitionerAuth();

  const [client, setClient] = useState<PractitionerClient | null>(null);
  const [sessions, setSessions] = useState<PractitionerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (practitionerId && clientId) {
      fetchClient();
      fetchSessions();
    }
  }, [practitionerId, clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stellium/clients/${clientId}?practitionerId=${practitionerId}`);
      if (!response.ok) throw new Error('Failed to fetch client');
      const data = await response.json();
      setClient(data.client);
      setEditedNotes(data.client.private_notes || '');
    } catch (err) {
      console.error('[Client] Error:', err);
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/stellium/sessions/list?practitionerId=${practitionerId}&clientId=${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('[Sessions] Error:', err);
    }
  };

  const saveNotes = async () => {
    if (!client) return;
    try {
      setSavingNotes(true);
      const response = await fetch(`/api/stellium/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          private_notes: editedNotes,
        }),
      });
      if (!response.ok) throw new Error('Failed to save notes');
      const data = await response.json();
      setClient(data.client);
      setIsEditing(false);
    } catch (err) {
      console.error('[Notes] Error:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const addTag = async () => {
    if (!client || !newTag.trim()) return;
    const updatedTags = [...(client.tags || []), newTag.trim()];
    try {
      const response = await fetch(`/api/stellium/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          tags: updatedTags,
        }),
      });
      if (!response.ok) throw new Error('Failed to add tag');
      const data = await response.json();
      setClient(data.client);
      setNewTag('');
    } catch (err) {
      console.error('[Tags] Error:', err);
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (!client) return;
    const updatedTags = (client.tags || []).filter(t => t !== tagToRemove);
    try {
      const response = await fetch(`/api/stellium/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          tags: updatedTags,
        }),
      });
      if (!response.ok) throw new Error('Failed to remove tag');
      const data = await response.json();
      setClient(data.client);
    } catch (err) {
      console.error('[Tags] Error:', err);
    }
  };

  // Use portal path for subdomain routing
  const basePath = `/portal/${slug}/admin`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-24 rounded-lg animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-96 rounded-xl animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}40` }}
      >
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.error }} />
        <p style={{ color: colors.error }}>{error || 'Client not found'}</p>
        <button
          onClick={() => router.push(`${basePath}/clients`)}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.gold, color: colors.void }}
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const zodiacSign = client.key_placements?.sun_sign;
  const upcomingSessions = sessions.filter(s => s.scheduled_at && new Date(s.scheduled_at) > new Date());
  const pastSessions = sessions.filter(s => s.status === 'completed' || (s.scheduled_at && new Date(s.scheduled_at) <= new Date()));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(`${basePath}/clients`)}
        className="flex items-center space-x-2 transition-colors"
        style={{ color: colors.muted }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Clients</span>
      </button>

      {/* Client Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6"
        style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.stardust}` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium"
              style={{
                background: `linear-gradient(135deg, ${colors.gold}40 0%, ${colors.violet}40 100%)`,
                color: colors.gold,
              }}
            >
              {(client.preferred_name || client.name || 'C')[0]}
            </div>
            <div>
              <h1 className="text-2xl font-display" style={{ color: colors.starlight }}>
                {client.preferred_name || client.name}
              </h1>
              {client.preferred_name && client.preferred_name !== client.name && (
                <p className="text-sm" style={{ color: colors.dim }}>
                  {client.name}
                </p>
              )}
              <div className="flex items-center space-x-3 mt-2">
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{
                    backgroundColor: client.status === 'active' ? `${colors.success}20` : `${colors.dim}20`,
                    color: client.status === 'active' ? colors.success : colors.dim,
                  }}
                >
                  {client.status}
                </span>
                {zodiacSign && (
                  <span className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5" style={{ color: colors.gold }} />
                    <span className="text-xs" style={{ color: colors.muted }}>{zodiacSign}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`${basePath}/clients/${clientId}/edit`)}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: `${colors.stardust}50`, color: colors.muted }}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <InfoRow
            icon={<Mail className="w-4 h-4" style={{ color: colors.gold }} />}
            label="Email"
            value={client.email}
          />
          <InfoRow
            icon={<Phone className="w-4 h-4" style={{ color: colors.violet }} />}
            label="Phone"
            value={client.phone}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" style={{ color: colors.gold }} />}
            label="Birth Date"
            value={client.birth_date ? `${formatDate(client.birth_date)}${client.birth_time ? ` at ${client.birth_time}` : ''}` : undefined}
          />
          <InfoRow
            icon={<MapPin className="w-4 h-4" style={{ color: colors.violet }} />}
            label="Birth Location"
            value={client.birth_location}
          />
        </div>

        {/* Tags */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.dim }}>Tags</p>
          <div className="flex items-center flex-wrap gap-2">
            {client.tags?.map(tag => (
              <span
                key={tag}
                className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${colors.violet}20`, color: colors.violet }}
              >
                <span>{tag}</span>
                <button onClick={() => removeTag(tag)} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="px-2 py-1 rounded-lg text-xs bg-transparent outline-none w-20"
                style={{ color: colors.muted, border: `1px solid ${colors.stardust}` }}
              />
              {newTag && (
                <button
                  onClick={addTag}
                  className="p-1 rounded"
                  style={{ backgroundColor: colors.gold, color: colors.void }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: `1px solid ${colors.stardust}` }}>
          <div className="text-center">
            <p className="text-2xl font-medium" style={{ color: colors.gold }}>{client.total_sessions}</p>
            <p className="text-xs" style={{ color: colors.dim }}>Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: colors.muted }}>
              {client.first_session ? formatDate(client.first_session) : 'N/A'}
            </p>
            <p className="text-xs" style={{ color: colors.dim }}>First Session</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: colors.muted }}>
              {client.last_session ? formatDate(client.last_session) : 'N/A'}
            </p>
            <p className="text-xs" style={{ color: colors.dim }}>Last Session</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline / Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium" style={{ color: colors.starlight }}>
              Session History
            </h2>
            <button
              onClick={() => router.push(`${basePath}/sessions/new?clientId=${clientId}`)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: colors.dim }}>Upcoming</p>
              {upcomingSessions.map(session => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.gold}40` }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.gold}20` }}
                    >
                      <Calendar className="w-5 h-5" style={{ color: colors.gold }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.starlight }}>
                        {session.session_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs" style={{ color: colors.muted }}>
                        {session.scheduled_at && formatDateTime(session.scheduled_at)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: colors.dim }} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: colors.dim }}>Past Sessions</p>
              {pastSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:bg-white/5"
                  style={{ backgroundColor: `${colors.nebula}80`, border: `1px solid ${colors.stardust}` }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.stardust}50` }}
                    >
                      <FileText className="w-5 h-5" style={{ color: colors.violet }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.starlight }}>
                        {session.session_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs" style={{ color: colors.muted }}>
                        {session.scheduled_at && formatDate(session.scheduled_at)}
                        {session.themes && session.themes.length > 0 && (
                          <> · {session.themes.slice(0, 2).join(', ')}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: colors.dim }} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
            >
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
              <p style={{ color: colors.muted }}>No sessions yet</p>
              <button
                onClick={() => router.push(`${basePath}/sessions/new?clientId=${clientId}`)}
                className="mt-4 px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
              >
                Schedule First Session
              </button>
            </div>
          )}
        </div>

        {/* Notes Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
              Private Notes
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded"
                style={{ color: colors.dim }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedNotes(client.private_notes || '');
                  }}
                  className="p-1 rounded"
                  style={{ color: colors.dim }}
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="p-1 rounded"
                  style={{ color: colors.gold }}
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.stardust}` }}
          >
            {isEditing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full h-48 bg-transparent outline-none resize-none text-sm"
                style={{ color: colors.starlight }}
                placeholder="Add notes about this client..."
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap" style={{ color: client.private_notes ? colors.muted : colors.dim }}>
                {client.private_notes || 'No notes yet. Click edit to add notes.'}
              </p>
            )}
          </div>

          {/* Themes */}
          {client.themes && client.themes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
                Recurring Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {client.themes.map(theme => (
                  <span
                    key={theme}
                    className="px-2 py-1 rounded-lg text-xs"
                    style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portal Access */}
          <div className="pt-4">
            <GenerateInviteButton
              slug={slug}
              clientId={clientId}
              clientName={client.preferred_name || client.name}
              portalClaimed={!!client.portal_claimed_at}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-4">
            <button
              onClick={() => router.push(`${basePath}/messages?clientId=${clientId}`)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-white/5"
              style={{ backgroundColor: `${colors.nebula}80`, border: `1px solid ${colors.stardust}` }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: colors.violet }} />
              <span className="text-sm" style={{ color: colors.muted }}>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
