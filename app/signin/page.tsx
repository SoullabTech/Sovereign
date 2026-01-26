'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

export default function SigninPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const sessionState = betaSession.restoreSession();
    if (sessionState.isAuthenticated && sessionState.user) {
      router.replace('/maia');
    }
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Get stored users from registry
      let usersJson = localStorage.getItem('beta_users');

      // Initialize default test users if no registry exists
      if (!usersJson) {
        const defaultUsers: Record<string, {
          id: string;
          username: string;
          name: string;
          email: string;
          password: string;
          onboarded: boolean;
          createdAt: string;
        }> = {};

        // Beta test users with their credentials
        const betaUsersList = [
          { username: 'kelly', name: 'Kelly', email: 'kelly@soullab.life', password: 'Mandala21' },
          { username: 'nathan', name: 'Nathan Kane', email: 'Nathan.Kane@thermofisher.com', password: 'Mandala21' },
          { username: 'jason', name: 'Jason Ruder', email: 'JHRuder@gmail.com', password: 'Mandala21' },
          { username: 'travis', name: 'Travis Diamond', email: 'tcdiamond70@gmail.com', password: 'Mandala21' },
          { username: 'andrea', name: 'Andrea Nezat', email: 'andreanezat@gmail.com', password: 'Mandala21' },
          { username: 'justin', name: 'Justin Boucher', email: 'justin.boucher@gmail.com', password: 'Mandala21' },
          { username: 'susan', name: 'Susan Bragg', email: 'phoenixrises123@gmail.com', password: 'Mandala21' },
          { username: 'meagan', name: 'Meagan dAquin', email: 'mdaquin@gmail.com', password: 'Mandala21' },
          { username: 'patrick', name: 'Patrick Koehn', email: 'plkoehn@gmail.com', password: 'Mandala21' },
          { username: 'tamara', name: 'Tamara Moore', email: 'tamaramoorecolorado@gmail.com', password: 'Mandala21' },
          { username: 'kristen', name: 'Kristen Nezat', email: 'Inhomesanctuary@gmail.com', password: 'Mandala21' },
          { username: 'doug', name: 'Doug Foreman', email: 'dougaforeman@gmail.com', password: 'Mandala21' },
          { username: 'augusten', name: 'Augusten Nezat', email: 'augustennezat@gmail.com', password: 'Mandala21' },
          { username: 'sophie', name: 'Sophie Nezat', email: 'snezat27@sacredhearthamden.org', password: 'Mandala21' },
        ];

        betaUsersList.forEach(user => {
          const fullUser = {
            id: `user_${user.username}_default`,
            username: user.username,
            name: user.name,
            email: user.email,
            password: user.password,
            onboarded: true,
            createdAt: new Date().toISOString()
          };

          // Store with lowercase key for consistent lookup
          defaultUsers[user.username.toLowerCase()] = fullUser;
          // Also store by email for flexible login
          defaultUsers[user.email.toLowerCase()] = fullUser;
        });

        localStorage.setItem('beta_users', JSON.stringify(defaultUsers));
        usersJson = JSON.stringify(defaultUsers);
        console.log('✅ Initialized default beta users in localStorage');
      }

      const users = JSON.parse(usersJson);

      // Case-insensitive lookup: try exact match first, then normalized
      const normalizedUsername = username.toLowerCase();
      let user = users[username] || users[normalizedUsername];

      // If still not found, search all keys case-insensitively
      if (!user) {
        const matchingKey = Object.keys(users).find(
          key => key.toLowerCase() === normalizedUsername
        );
        if (matchingKey) {
          user = users[matchingKey];
        }
      }

      console.log('🔍 [Signin Debug]', {
        usernameEntered: username,
        normalizedUsername,
        userFound: !!user,
        userHasPassword: user ? !!user.password : false,
        availableUsernames: Object.keys(users)
      });

      // Validate credentials
      if (!user) {
        setError('Username not found.');
        setIsLoading(false);
        return;
      }

      // If user doesn't have a password, they need to go through signup flow
      if (!user.password) {
        setError('This account needs to set a password. Please use "Start Fresh" to complete setup.');
        setIsLoading(false);
        return;
      }

      if (user.password !== password) {
        // Note: Never log actual passwords - security risk
        console.log('❌ Password mismatch for user:', user.username);
        setError('Incorrect password.');
        setIsLoading(false);
        return;
      }

      // Create active session
      localStorage.setItem('beta_user', JSON.stringify(user));

      // Ensure identity markers are set
      localStorage.setItem('explorerId', user.id || user.username);
      localStorage.setItem('explorerName', user.name || username);
      localStorage.setItem('betaOnboardingComplete', 'true');

      // Redirect to MAIA
      router.push('/maia');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">

      {/* Sacred Holoflower */}
      <div className="mb-12">
        <div className="w-24 h-24 mx-auto">
          <Holoflower size="lg" glowIntensity="medium" animate={true} />
        </div>
      </div>

      {/* Sign In Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-8 shadow-2xl border max-w-md w-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 35px 70px -12px rgba(14, 116, 144, 0.4), 0 10px 20px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        }}
      >
        <h1 className="text-2xl font-extralight text-teal-900 mb-6 text-center tracking-[0.2em]">
          Sign In
        </h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-light text-teal-800 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-light text-teal-800 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
              border: '1px solid rgba(110, 231, 183, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span className="text-teal-900">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </span>
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/begin')}
            className="text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300"
          >
            New to Soullab? Begin Journey
          </button>
        </div>
      </motion.div>
    </div>
  );
}