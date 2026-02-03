"use client";

/**
 * DIRECTORY PROFILE CARD
 *
 * Edit your listing in the practitioner directory.
 * Private by default — must explicitly opt in.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  MapPin,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface DirectoryProfile {
  practitioner_id: string;
  is_listed: boolean;
  accepting_referrals: boolean;
  display_name: string | null;
  location: string | null;
  bio: string | null;
  modalities: string[];
  tags: string[];
  languages: string[];
  accepts_sliding_scale: boolean;
}

export default function DirectoryProfileCard() {
  const [profile, setProfile] = useState<DirectoryProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [isListed, setIsListed] = useState(false);
  const [acceptingReferrals, setAcceptingReferrals] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [modalities, setModalities] = useState('');
  const [tags, setTags] = useState('');
  const [languages, setLanguages] = useState('');
  const [acceptsSlidingScale, setAcceptsSlidingScale] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/practitioner/referrals/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      const p = data.profile;

      setProfile(p);
      setIsListed(p.is_listed);
      setAcceptingReferrals(p.accepting_referrals);
      setDisplayName(p.display_name || '');
      setLocation(p.location || '');
      setBio(p.bio || '');
      setModalities(p.modalities?.join(', ') || '');
      setTags(p.tags?.join(', ') || '');
      setLanguages(p.languages?.join(', ') || '');
      setAcceptsSlidingScale(p.accepts_sliding_scale);
    } catch (err) {
      setError('Failed to load profile');
      console.error('[DirectoryProfileCard] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const parseList = (str: string) =>
        str.split(',').map(s => s.trim()).filter(Boolean);

      const response = await fetch('/api/practitioner/referrals/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_listed: isListed,
          accepting_referrals: acceptingReferrals,
          display_name: displayName || null,
          location: location || null,
          bio: bio || null,
          modalities: parseList(modalities),
          tags: parseList(tags),
          languages: parseList(languages),
          accepts_sliding_scale: acceptsSlidingScale,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-sacred-gold" />
              Directory Profile
            </CardTitle>
            <CardDescription className="mt-1">
              {isListed
                ? 'Your profile is visible to other practitioners'
                : 'Your profile is private (opt-in to be listed)'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isListed ? (
              <Eye className="w-4 h-4 text-green-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-500" />
            )}
            <Switch checked={isListed} onCheckedChange={setIsListed} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Accepting referrals */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div>
            <Label className="text-gray-300">Accepting referrals</Label>
            <p className="text-xs text-gray-500">
              Allow colleagues to send you warm handoffs
            </p>
          </div>
          <Switch
            checked={acceptingReferrals}
            onCheckedChange={setAcceptingReferrals}
          />
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-gray-300 text-sm">
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="How you'd like to appear"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-gray-300 text-sm">
            <MapPin className="w-3 h-3 inline mr-1" />
            Location (general)
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="e.g., Bay Area, NYC, Online"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-gray-300 text-sm">
            Short Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
            placeholder="A few sentences about your practice..."
            rows={3}
          />
        </div>

        {/* Modalities */}
        <div className="space-y-2">
          <Label htmlFor="modalities" className="text-gray-300 text-sm">
            Modalities
          </Label>
          <Input
            id="modalities"
            value={modalities}
            onChange={(e) => setModalities(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="IFS, somatic, EMDR, etc. (comma-separated)"
          />
        </div>

        {/* Tags (good with) */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-gray-300 text-sm">
            Good With
          </Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="grief, anxiety, transitions, couples, etc."
          />
          <p className="text-xs text-gray-500">
            Areas where you have strength and capacity
          </p>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label htmlFor="languages" className="text-gray-300 text-sm">
            Languages
          </Label>
          <Input
            id="languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="English, Spanish, etc."
          />
        </div>

        {/* Sliding scale */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div>
            <Label className="text-gray-300">Accepts Sliding Scale</Label>
            <p className="text-xs text-gray-500">
              Show in searches for affordable options
            </p>
          </div>
          <Switch
            checked={acceptsSlidingScale}
            onCheckedChange={setAcceptsSlidingScale}
          />
        </div>

        {/* Error/Success */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Profile saved</span>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-sacred-gold text-gray-900 hover:bg-sacred-gold/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
