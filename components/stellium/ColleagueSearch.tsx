"use client";

/**
 * COLLEAGUE SEARCH
 *
 * Search the practitioner directory to find and connect.
 * Only shows listed practitioners accepting referrals.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  MapPin,
  Loader2,
  UserPlus,
  Check,
  DollarSign,
} from 'lucide-react';

interface DirectoryProfile {
  practitioner_id: string;
  display_name: string | null;
  location: string | null;
  bio: string | null;
  modalities: string[];
  tags: string[];
  languages: string[];
  accepts_sliding_scale: boolean;
  accepting_referrals: boolean;
}

interface ColleagueSearchProps {
  onConnect?: (practitionerId: string) => void;
}

export default function ColleagueSearch({ onConnect }: ColleagueSearchProps) {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectedTo, setConnectedTo] = useState<Set<string>>(new Set());

  // Search filters
  const [modalities, setModalities] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [slidingScaleOnly, setSlidingScaleOnly] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (modalities.trim()) {
        params.set('modalities', modalities.split(',').map(s => s.trim()).join(','));
      }
      if (tags.trim()) {
        params.set('tags', tags.split(',').map(s => s.trim()).join(','));
      }
      if (location.trim()) {
        params.set('location', location.trim());
      }
      if (slidingScaleOnly) {
        params.set('accepts_sliding_scale', 'true');
      }

      const response = await fetch(`/api/practitioner/referrals/directory?${params}`);
      if (!response.ok) throw new Error('Failed to search');

      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      console.error('[ColleagueSearch] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (practitionerId: string) => {
    try {
      setConnectingTo(practitionerId);

      const response = await fetch('/api/practitioner/referrals/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: practitionerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to connect');
      }

      setConnectedTo(prev => new Set(prev).add(practitionerId));
      onConnect?.(practitionerId);
    } catch (err) {
      console.error('[ColleagueSearch] Connect error:', err);
    } finally {
      setConnectingTo(null);
    }
  };

  // Search on mount with no filters
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5 text-sacred-gold" />
          Find Colleagues
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="modalities" className="text-gray-300 text-sm">
              Modalities
            </Label>
            <Input
              id="modalities"
              value={modalities}
              onChange={(e) => setModalities(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="IFS, somatic, EMDR..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-300 text-sm">
              Specialties
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="grief, anxiety, trauma..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-300 text-sm">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="Bay Area, NYC, Online..."
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="slidingScale"
              checked={slidingScaleOnly}
              onChange={(e) => setSlidingScaleOnly(e.target.checked)}
              className="rounded border-gray-700 bg-gray-800 text-sacred-gold focus:ring-sacred-gold"
            />
            <Label htmlFor="slidingScale" className="text-gray-300 text-sm">
              Accepts sliding scale
            </Label>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-sacred-gold text-gray-900 hover:bg-sacred-gold/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Directory
            </>
          )}
        </Button>

        {/* Results */}
        <div className="space-y-3">
          {profiles.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Search className="w-10 h-10 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No practitioners found</p>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your search filters
              </p>
            </div>
          )}

          {profiles.map((profile) => (
            <div
              key={profile.practitioner_id}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-sacred-gold/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-200 font-medium">
                      {profile.display_name || 'Practitioner'}
                    </p>
                    {profile.accepts_sliding_scale && (
                      <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 bg-sacred-gold/10 text-sacred-gold rounded">
                        <DollarSign className="w-3 h-3" />
                        Sliding Scale
                      </span>
                    )}
                  </div>

                  {profile.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.location}
                    </p>
                  )}

                  {profile.bio && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  {profile.modalities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.modalities.map((mod, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  )}

                  {profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {profile.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleConnect(profile.practitioner_id)}
                  disabled={
                    connectingTo === profile.practitioner_id ||
                    connectedTo.has(profile.practitioner_id)
                  }
                  className={
                    connectedTo.has(profile.practitioner_id)
                      ? 'bg-green-600 text-white'
                      : 'bg-sacred-gold text-gray-900 hover:bg-sacred-gold/90'
                  }
                >
                  {connectingTo === profile.practitioner_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : connectedTo.has(profile.practitioner_id) ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Requested
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
