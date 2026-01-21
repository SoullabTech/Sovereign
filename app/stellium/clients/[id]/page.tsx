"use client";

/**
 * STELLIUM CLIENT DETAIL PAGE
 *
 * Shows client profile, birth data, and session history
 * Read-first, relational continuity view
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Star,
  Loader2,
  Edit2,
  Archive,
} from 'lucide-react';
import { PractitionerClient, PractitionerSession, ClientTimeline } from '@/lib/stellium/types';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { practitionerId, isLoading: authLoading } = usePractitionerContext();

  const [client, setClient] = useState<PractitionerClient | null>(null);
  const [sessions, setSessions] = useState<PractitionerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (practitionerId && clientId) {
      fetchClientData();
    }
  }, [practitionerId, clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/stellium/clients/${clientId}?practitionerId=${practitionerId}&timeline=true`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Client not found');
        }
        throw new Error('Failed to fetch client');
      }

      const data: ClientTimeline = await response.json();
      setClient(data.client);
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-300">{error || 'Client not found'}</p>
            <button
              onClick={() => router.push('/stellium/clients')}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Back to Clients
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Clients</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-sacred-gold/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-sacred-gold" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-gray-100">
                    {client.preferred_name || client.name}
                  </h1>
                  {client.preferred_name && client.preferred_name !== client.name && (
                    <p className="text-sm text-gray-500">{client.name}</p>
                  )}
                  {client.pronouns && (
                    <p className="text-sm text-gray-500">{client.pronouns}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        client.status === 'active'
                          ? 'bg-green-500/20 text-green-300'
                          : client.status === 'inactive'
                          ? 'bg-gray-500/20 text-gray-400'
                          : client.status === 'waitlist'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-gray-700/50 text-gray-500'
                      }`}
                    >
                      {client.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {client.total_sessions} session{client.total_sessions !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push(`/stellium/clients/${clientId}/edit`)}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Birth Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Contact Info */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${client.email}`} className="hover:text-sacred-gold transition-colors">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{client.phone}</span>
                </div>
              )}
              {!client.email && !client.phone && (
                <p className="text-gray-500 text-sm">No contact info</p>
              )}
            </CardContent>
          </Card>

          {/* Birth Data (for astrology) */}
          {(client.birth_date || client.birth_location) && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Birth Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.birth_date && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(client.birth_date)}</span>
                  </div>
                )}
                {client.birth_time && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>
                      {client.birth_time}
                      {client.birth_time_accuracy && client.birth_time_accuracy !== 'exact' && (
                        <span className="text-gray-500 text-xs ml-1">
                          ({client.birth_time_accuracy})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {client.birth_location && (
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{client.birth_location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Placements */}
          {client.key_placements && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Key Placements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {client.key_placements.sun_sign && (
                    <div>
                      <span className="text-gray-500">Sun</span>
                      <p className="text-gray-200">{client.key_placements.sun_sign}</p>
                    </div>
                  )}
                  {client.key_placements.moon_sign && (
                    <div>
                      <span className="text-gray-500">Moon</span>
                      <p className="text-gray-200">{client.key_placements.moon_sign}</p>
                    </div>
                  )}
                  {client.key_placements.rising_sign && (
                    <div>
                      <span className="text-gray-500">Rising</span>
                      <p className="text-gray-200">{client.key_placements.rising_sign}</p>
                    </div>
                  )}
                  {client.key_placements.saturn_sign && (
                    <div>
                      <span className="text-gray-500">Saturn</span>
                      <p className="text-gray-200">
                        {client.key_placements.saturn_sign}
                        {client.key_placements.saturn_house && ` (H${client.key_placements.saturn_house})`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Private Notes */}
          {client.private_notes && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{client.private_notes}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Session Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Session History</CardTitle>
              <span className="text-xs text-gray-500">{sessions.length} sessions</span>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No sessions yet</p>
                  <button
                    onClick={() => router.push(`/stellium/sessions/new?clientId=${clientId}`)}
                    className="mt-4 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold text-sm rounded-lg"
                  >
                    Schedule First Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => router.push(`/stellium/sessions/${session.id}`)}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-sacred-gold/50" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-200 font-medium">
                            {session.session_type || 'Session'}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              session.status === 'completed'
                                ? 'bg-green-500/20 text-green-300'
                                : session.status === 'scheduled'
                                ? 'bg-blue-500/20 text-blue-300'
                                : session.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(session.scheduled_at)}
                        </p>
                        {session.themes && session.themes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.themes.slice(0, 3).map((theme, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-xs rounded"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Relationship Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                {client.first_session && (
                  <div>
                    <span className="text-gray-500">First session</span>
                    <p className="text-gray-300">{formatDate(client.first_session)}</p>
                  </div>
                )}
                {client.last_session && (
                  <div>
                    <span className="text-gray-500">Last session</span>
                    <p className="text-gray-300">{formatDate(client.last_session)}</p>
                  </div>
                )}
                {client.next_session && (
                  <div>
                    <span className="text-gray-500">Next session</span>
                    <p className="text-sacred-gold">{formatDate(client.next_session)}</p>
                  </div>
                )}
              </div>
              <div className="text-gray-500">
                Client since {formatDate(client.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
