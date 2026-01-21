"use client";

/**
 * COLLEAGUES LIST
 *
 * Your trusted network of practitioners.
 * Shows pending requests and accepted connections.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  MapPin,
  Check,
  X,
} from 'lucide-react';

interface DirectoryProfile {
  display_name: string | null;
  location: string | null;
  modalities: string[];
  tags: string[];
  accepting_referrals: boolean;
}

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  requested_at: string;
  responded_at: string | null;
  colleague_name: string;
  colleague_profile: DirectoryProfile | null;
}

interface ColleaguesListProps {
  onSelectColleague?: (connection: Connection) => void;
  onSendReferral?: (toPractitionerId: string) => void;
}

export default function ColleaguesList({
  onSelectColleague,
  onSendReferral,
}: ColleaguesListProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/practitioner/referrals/connections');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (err) {
      console.error('[ColleaguesList] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (connectionId: string, response: 'accepted' | 'declined') => {
    try {
      setRespondingTo(connectionId);
      const res = await fetch(`/api/practitioner/referrals/connections/${connectionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) throw new Error('Failed to respond');

      // Refresh connections
      await fetchConnections();
    } catch (err) {
      console.error('[ColleaguesList] Respond error:', err);
    } finally {
      setRespondingTo(null);
    }
  };

  const pending = connections.filter(c => c.status === 'pending');
  const accepted = connections.filter(c => c.status === 'accepted');

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-sacred-gold" />
          Trusted Colleagues
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="colleagues" className="space-y-4">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="colleagues" className="data-[state=active]:bg-gray-700">
              <UserCheck className="w-4 h-4 mr-1" />
              Colleagues ({accepted.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gray-700">
              <Clock className="w-4 h-4 mr-1" />
              Pending ({pending.length})
            </TabsTrigger>
          </TabsList>

          {/* Accepted Colleagues */}
          <TabsContent value="colleagues" className="space-y-3">
            {accepted.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No colleagues yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Search the directory to find and connect
                </p>
              </div>
            ) : (
              accepted.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-sacred-gold/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sacred-gold/10 flex items-center justify-center border border-sacred-gold/20">
                      <span className="text-sm font-medium text-sacred-gold">
                        {conn.colleague_name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">
                        {conn.colleague_profile?.display_name || conn.colleague_name}
                      </p>
                      {conn.colleague_profile?.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {conn.colleague_profile.location}
                        </p>
                      )}
                      {conn.colleague_profile?.tags && conn.colleague_profile.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {conn.colleague_profile.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-1.5 py-0.5 bg-gray-700/50 text-gray-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {onSendReferral && conn.colleague_profile?.accepting_referrals && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Determine colleague ID
                        const colleagueId = conn.colleague_profile
                          ? (conn as any).colleague_id
                          : conn.requester_id === (conn as any).colleague_id
                            ? conn.recipient_id
                            : conn.requester_id;
                        onSendReferral(colleagueId);
                      }}
                      className="border-sacred-gold/30 text-sacred-gold hover:bg-sacred-gold/10"
                    >
                      Send Referral
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Pending Requests */}
          <TabsContent value="pending" className="space-y-3">
            {pending.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No pending requests</p>
              </div>
            ) : (
              pending.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <span className="text-sm font-medium text-amber-400">
                        {conn.colleague_name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">
                        {conn.colleague_profile?.display_name || conn.colleague_name}
                      </p>
                      <p className="text-xs text-amber-400">
                        Wants to connect
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(conn.id, 'accepted')}
                      disabled={respondingTo === conn.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {respondingTo === conn.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(conn.id, 'declined')}
                      disabled={respondingTo === conn.id}
                      className="border-gray-600 text-gray-400 hover:bg-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
