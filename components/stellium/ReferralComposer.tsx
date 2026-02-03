"use client";

/**
 * REFERRAL COMPOSER
 *
 * Create warm handoffs to trusted colleagues.
 * De-identified by default — identifying info requires explicit consent.
 *
 * "The UI mirrors the DB CHECK."
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Loader2,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  User,
  Lock,
} from 'lucide-react';

interface ReferralComposerProps {
  toPractitionerId: string;
  toPractitionerName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReferralComposer({
  toPractitionerId,
  toPractitionerName,
  onSuccess,
  onCancel,
}: ReferralComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'compose' | 'success'>('compose');

  // De-identified fields (always shown)
  const [clientAgeRange, setClientAgeRange] = useState('');
  const [clientPronouns, setClientPronouns] = useState('');
  const [presentingThemes, setPresentingThemes] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'soon' | 'time_sensitive'>('routine');
  const [constraints, setConstraints] = useState('');
  const [requesterNote, setRequesterNote] = useState('');

  // Consent section (collapsed by default)
  const [showIdentitySection, setShowIdentitySection] = useState(false);
  const [clientConsentGiven, setClientConsentGiven] = useState(false);
  const [clientNameShared, setClientNameShared] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');

  const parseList = (str: string) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!requesterNote.trim()) {
      setError('Please add a note about why this person would be a good fit.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Step 1: Create draft
      const createRes = await fetch('/api/practitioner/referrals/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_practitioner_id: toPractitionerId,
          client_age_range: clientAgeRange || undefined,
          client_pronouns: clientPronouns || undefined,
          presenting_themes: presentingThemes ? parseList(presentingThemes) : undefined,
          urgency,
          constraints: constraints ? parseList(constraints) : undefined,
          requester_note: requesterNote,
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || 'Failed to create referral');
      }

      const { referral } = await createRes.json();

      // Step 2: Record consent if applicable
      if (clientConsentGiven) {
        const consentRes = await fetch(`/api/practitioner/referrals/requests/${referral.id}/consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_consent_given: true,
            client_name_shared: clientNameShared,
            client_name: clientNameShared ? clientName : undefined,
            client_contact: clientNameShared ? clientContact : undefined,
          }),
        });

        if (!consentRes.ok) {
          const data = await consentRes.json();
          throw new Error(data.error || 'Failed to record consent');
        }
      }

      // Step 3: Send the referral
      const sendRes = await fetch(`/api/practitioner/referrals/requests/${referral.id}/send`, {
        method: 'POST',
      });

      if (!sendRes.ok) {
        const data = await sendRes.json();
        throw new Error(data.error || 'Failed to send referral');
      }

      setStep('success');
      setTimeout(() => onSuccess?.(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Referral Sent
          </h3>
          <p className="text-gray-400">
            {toPractitionerName} will be notified of your warm handoff.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="w-5 h-5 text-sacred-gold" />
          Send Referral
        </CardTitle>
        <CardDescription>
          Warm handoff to {toPractitionerName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* De-identified Section (always visible) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Shield className="w-4 h-4 text-green-400" />
            <span>De-identified by default</span>
          </div>

          {/* Client descriptors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageRange" className="text-gray-300 text-sm">
                Age Range
              </Label>
              <Input
                id="ageRange"
                value={clientAgeRange}
                onChange={(e) => setClientAgeRange(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
                placeholder="e.g., 30-40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pronouns" className="text-gray-300 text-sm">
                Pronouns
              </Label>
              <Input
                id="pronouns"
                value={clientPronouns}
                onChange={(e) => setClientPronouns(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
                placeholder="e.g., they/them"
              />
            </div>
          </div>

          {/* Presenting themes */}
          <div className="space-y-2">
            <Label htmlFor="themes" className="text-gray-300 text-sm">
              What they're looking for
            </Label>
            <Input
              id="themes"
              value={presentingThemes}
              onChange={(e) => setPresentingThemes(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="grief, transition, relationship..."
            />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Urgency</Label>
            <div className="flex gap-2">
              {(['routine', 'soon', 'time_sensitive'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    urgency === u
                      ? u === 'time_sensitive'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : u === 'soon'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-700 text-gray-200 border border-gray-600'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {u === 'time_sensitive' ? 'Time Sensitive' : u === 'soon' ? 'Soon' : 'Routine'}
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-2">
            <Label htmlFor="constraints" className="text-gray-300 text-sm">
              Constraints / Needs
            </Label>
            <Input
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="telehealth, evenings, sliding scale..."
            />
          </div>

          {/* Requester note (private) */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-gray-300 text-sm">
              Why this practitioner? <span className="text-gray-500">(private to you)</span>
            </Label>
            <Textarea
              id="note"
              value={requesterNote}
              onChange={(e) => setRequesterNote(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
              placeholder="What makes this a good fit? What should they know?"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              <Lock className="w-3 h-3 inline mr-1" />
              This note stays with you for your records.
            </p>
          </div>
        </div>

        {/* Identifying Info Section (collapsed by default) */}
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setShowIdentitySection(!showIdentitySection)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4" />
              <span>Share identifying information</span>
            </div>
            {showIdentitySection ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showIdentitySection && (
            <div className="mt-4 space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-500">
                Only share identifying information if your client has explicitly consented.
              </p>

              {/* Consent checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentGiven"
                  checked={clientConsentGiven}
                  onChange={(e) => {
                    setClientConsentGiven(e.target.checked);
                    if (!e.target.checked) {
                      setClientNameShared(false);
                      setClientName('');
                      setClientContact('');
                    }
                  }}
                  className="mt-1 rounded border-gray-700 bg-gray-800 text-sacred-gold focus:ring-sacred-gold"
                />
                <label htmlFor="consentGiven" className="text-sm text-gray-300">
                  Client gave consent to share identifying details
                </label>
              </div>

              {/* Name sharing (only if consent given) */}
              {clientConsentGiven && (
                <>
                  <div className="flex items-start gap-3 ml-6">
                    <input
                      type="checkbox"
                      id="nameShared"
                      checked={clientNameShared}
                      onChange={(e) => {
                        setClientNameShared(e.target.checked);
                        if (!e.target.checked) {
                          setClientName('');
                          setClientContact('');
                        }
                      }}
                      className="mt-1 rounded border-gray-700 bg-gray-800 text-sacred-gold focus:ring-sacred-gold"
                    />
                    <label htmlFor="nameShared" className="text-sm text-gray-300">
                      Share name and contact information
                    </label>
                  </div>

                  {/* Name/contact fields (only if sharing enabled) */}
                  {clientNameShared && (
                    <div className="ml-6 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="clientName" className="text-gray-300 text-sm">
                          Client Name
                        </Label>
                        <Input
                          id="clientName"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clientContact" className="text-gray-300 text-sm">
                          Contact Info
                        </Label>
                        <Input
                          id="clientContact"
                          value={clientContact}
                          onChange={(e) => setClientContact(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                          placeholder="Email or phone"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !requesterNote.trim()}
            className="flex-1 bg-sacred-gold text-gray-900 hover:bg-sacred-gold/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Referral
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
