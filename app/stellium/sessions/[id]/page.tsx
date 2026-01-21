"use client";

/**
 * STELLIUM SESSION DETAIL PAGE
 *
 * Shows session details, MAIA prep, notes, and client context
 * Read-first, relational continuity view
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Brain,
  FileText,
  MessageSquare,
  Loader2,
  Edit2,
  Video,
  Phone,
  Building,
  Mail,
} from 'lucide-react';
import { PractitionerSession, MaiaSessionPrep, PractitionerClient } from '@/lib/stellium/types';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

interface SessionContext {
  session: PractitionerSession;
  client?: PractitionerClient;
  recentThemes?: string[];
  sessionCount?: number;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { practitionerId, isLoading: authLoading } = usePractitionerContext();

  const [session, setSession] = useState<PractitionerSession | null>(null);
  const [client, setClient] = useState<PractitionerClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (practitionerId && sessionId) {
      fetchSessionData();
    }
  }, [practitionerId, sessionId]);

  const fetchSessionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/stellium/sessions/${sessionId}?practitionerId=${practitionerId}&context=true`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error('Failed to fetch session');
      }

      const data: SessionContext = await response.json();
      setSession(data.session);
      setClient(data.client || data.session.client || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <Building className="w-4 h-4" />;
      case 'async':
        return <Mail className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300';
      case 'confirmed':
        return 'bg-indigo-500/20 text-indigo-300';
      case 'in_progress':
        return 'bg-amber-500/20 text-amber-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      case 'no_show':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
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
            <p className="text-red-300">{error || 'Session not found'}</p>
            <button
              onClick={() => router.push('/stellium/sessions')}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Back to Sessions
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
        <span>Back to Sessions</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-light text-gray-100">
                    {session.session_type || 'Session'}
                  </h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(session.scheduled_at)}</span>
                  </div>
                  {session.scheduled_at && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(session.scheduled_at)}
                        {session.duration_minutes && ` (${session.duration_minutes} min)`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                {session.location_type && (
                  <div className="flex items-center space-x-2 mt-2 text-gray-500">
                    {getLocationIcon(session.location_type)}
                    <span className="capitalize">{session.location_type.replace('_', ' ')}</span>
                    {session.location_details && (
                      <span className="text-gray-600">- {session.location_details}</span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/stellium/sessions/${sessionId}/edit`)}
                className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Notes & MAIA Prep */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* MAIA Prep */}
          {session.maia_prep && (
            <Card className="bg-indigo-900/20 backdrop-blur-xl border-indigo-500/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <CardTitle className="text-sm font-medium text-indigo-300">MAIA Session Prep</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.maia_prep.summary && (
                  <div>
                    <h4 className="text-xs text-indigo-400 mb-1">Summary</h4>
                    <p className="text-gray-300 text-sm">{session.maia_prep.summary}</p>
                  </div>
                )}

                {session.maia_prep.client_history && (
                  <div>
                    <h4 className="text-xs text-indigo-400 mb-1">Client History</h4>
                    <p className="text-gray-300 text-sm">{session.maia_prep.client_history}</p>
                  </div>
                )}

                {session.maia_prep.suggested_focus && session.maia_prep.suggested_focus.length > 0 && (
                  <div>
                    <h4 className="text-xs text-indigo-400 mb-1">Suggested Focus Areas</h4>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      {session.maia_prep.suggested_focus.map((focus, i) => (
                        <li key={i}>{focus}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {session.maia_prep.open_threads && session.maia_prep.open_threads.length > 0 && (
                  <div>
                    <h4 className="text-xs text-indigo-400 mb-1">Open Threads</h4>
                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                      {session.maia_prep.open_threads.map((thread, i) => (
                        <li key={i}>{thread}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {session.maia_prep.transit_context && (
                  <div>
                    <h4 className="text-xs text-indigo-400 mb-1">Transit Context</h4>
                    <p className="text-gray-300 text-sm">{session.maia_prep.transit_context}</p>
                  </div>
                )}

                <p className="text-xs text-indigo-500">
                  Generated {new Date(session.maia_prep.generated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Prep Notes */}
          {session.prep_notes && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <CardTitle className="text-sm font-medium text-gray-400">Prep Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{session.prep_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Session Notes */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-400">Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {session.session_notes ? (
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{session.session_notes}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">No session notes yet</p>
              )}
            </CardContent>
          </Card>

          {/* Follow-up Notes */}
          {(session.follow_up_notes || session.follow_up_sent) && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <CardTitle className="text-sm font-medium text-gray-400">Follow-up</CardTitle>
                </div>
                {session.follow_up_sent && (
                  <span className="text-xs text-green-400">
                    Sent {session.follow_up_sent_at && formatDate(session.follow_up_sent_at)}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                {session.follow_up_notes ? (
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{session.follow_up_notes}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">No follow-up notes</p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Sidebar - Client & Themes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Client Card */}
          {client && (
            <Card
              className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => router.push(`/stellium/clients/${client.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-sacred-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-sacred-gold" />
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">
                      {client.preferred_name || client.name}
                    </p>
                    {client.key_placements?.sun_sign && (
                      <p className="text-xs text-gray-500">
                        {client.key_placements.sun_sign} Sun
                        {client.key_placements.moon_sign && ` / ${client.key_placements.moon_sign} Moon`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Themes */}
          {session.themes && session.themes.length > 0 && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {session.themes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-lg"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {session.insights && session.insights.length > 0 && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {session.insights.map((insight, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                      <span className="text-sacred-gold mt-1">*</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Payment (if applicable) */}
          {session.fee !== undefined && session.fee > 0 && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">${session.fee}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      session.paid
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {session.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {session.payment_method && (
                  <p className="text-xs text-gray-500 mt-1">{session.payment_method}</p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
