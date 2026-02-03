"use client";

/**
 * PRACTITIONER SIGNUP PAGE
 *
 * Entry point for members to become practitioners.
 * Flow:
 * 1. Check for member session (redirect to /signin if none)
 * 2. Check if already practitioner (redirect to admin if so)
 * 3. Show signup form: practice name, slug, email
 * 4. On submit → create practitioner → store context → redirect to onboarding
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setPractitionerContext } from '@/lib/auth/practitionerAuth';

interface MemberSession {
  id: string;
  name: string;
  email?: string;
}

export default function PractitionerSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberSession | null>(null);
  const [formData, setFormData] = useState({
    practiceName: '',
    slug: '',
    email: '',
  });
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetReason, setResetReason] = useState<string | null>(null);

  // Check member session and practitioner status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        // Get member from localStorage
        const betaUser = localStorage.getItem('beta_user');
        if (!betaUser) {
          // No session, redirect to signin with return URL
          router.push('/signin?return=/practitioners/signup');
          return;
        }

        const user = JSON.parse(betaUser);
        if (!user.id) {
          router.push('/signin?return=/practitioners/signup');
          return;
        }

        setMember(user);
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
        }));

        // Check if already a practitioner
        const checkRes = await fetch('/api/practitioners/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: user.id }),
        });

        const checkData = await checkRes.json();

        if (checkData.hasPractitioner) {
          // Already a practitioner, store context and redirect to admin
          setPractitionerContext({
            id: checkData.practitioner.id,
            slug: checkData.practitioner.slug,
            name: checkData.practitioner.name,
          });
          router.push(`/stellium`);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('[Practitioner Signup] Auth check error:', err);
        setError('Failed to check authentication status');
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  // Check for reset reason breadcrumb (one-shot)
  useEffect(() => {
    const reason = sessionStorage.getItem('practitioner_context_reset_reason');
    if (reason) {
      setResetReason(reason);
      sessionStorage.removeItem('practitioner_context_reset_reason');
    }
  }, []);

  // Generate slug from practice name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
      .replace(/^-|-$/g, '');
  };

  // Check slug availability with debounce
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 4) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await fetch(`/api/practitioners/check?slug=${formData.slug}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch (err) {
        console.error('[Practitioner Signup] Slug check error:', err);
      } finally {
        setSlugChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handlePracticeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      practiceName: name,
      slug: generateSlug(name),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member) {
      setError('No member session found');
      return;
    }

    if (!formData.practiceName || !formData.slug || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    if (slugAvailable === false) {
      setError('Please choose a different URL - this one is taken');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/practitioners/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          practiceName: formData.practiceName,
          slug: formData.slug,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create practitioner account');
      }

      // Store practitioner context for auth provider
      setPractitionerContext({
        id: data.practitioner.id,
        slug: data.practitioner.slug,
        name: data.practitioner.name,
      });

      // Redirect to onboarding
      router.push('/practitioners/onboarding/step/1');
    } catch (err) {
      console.error('[Practitioner Signup] Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sacred-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Checking your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-100 tracking-tight">
            Become a Practitioner
          </h1>
          <p className="mt-3 text-gray-400">
            Set up your practice portal and start working with clients through MAIA.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {resetReason && (
            <div className="rounded-xl bg-amber-900/20 border border-amber-700/30 p-4 text-sm text-amber-200">
              <p className="font-medium mb-1">Session reset</p>
              <p className="text-amber-300/80">
                {resetReason === 'demo_id_detected'
                  ? 'Your previous session used a temporary ID. Please sign up or sign in to continue.'
                  : 'Your session couldn\'t be verified. Please sign up or sign in to continue.'}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-700/30 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="practiceName" className="block text-sm font-medium text-gray-300">
              Practice Name
            </label>
            <input
              id="practiceName"
              type="text"
              value={formData.practiceName}
              onChange={handlePracticeNameChange}
              placeholder="e.g., Starseed Astrology"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-sacred-gold focus:outline-none focus:ring-1 focus:ring-sacred-gold"
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300">
              Your Portal URL
            </label>
            <div className="flex items-center rounded-xl bg-gray-900 border border-gray-700 overflow-hidden focus-within:border-sacred-gold focus-within:ring-1 focus-within:ring-sacred-gold">
              <span className="px-4 py-3 text-gray-500 bg-gray-800/50 border-r border-gray-700 text-sm">
                soullab.network/
              </span>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="your-practice"
                className="flex-1 bg-transparent px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:outline-none"
                required
                disabled={submitting}
                minLength={4}
                maxLength={50}
              />
            </div>
            {formData.slug.length >= 4 && (
              <div className="flex items-center gap-2 text-sm">
                {slugChecking ? (
                  <span className="text-gray-400">Checking availability...</span>
                ) : slugAvailable === true ? (
                  <span className="text-green-400">Available</span>
                ) : slugAvailable === false ? (
                  <span className="text-red-400">Already taken</span>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Contact Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-sacred-gold focus:outline-none focus:ring-1 focus:ring-sacred-gold"
              required
              disabled={submitting}
            />
            <p className="text-xs text-gray-500">
              This is where clients can reach you. Not shown publicly by default.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || slugAvailable === false}
            className="w-full rounded-xl bg-sacred-gold text-gray-900 py-3 px-6 font-semibold hover:bg-sacred-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating your practice...' : 'Create Practice'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have a practice?{' '}
          <a href="/signin" className="text-sacred-gold hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
