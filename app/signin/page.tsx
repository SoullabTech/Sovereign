"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Test credentials for development
      const testCredentials = {
        'Kelly@Soullab.org': 'Mandala21',
        'kelly@soullab.org': 'Mandala21',
        'Kelly': 'Mandala21'
      };

      // Check test credentials first
      if (testCredentials[username] && testCredentials[username] === password) {
        // Create and set user session
        const testUser = {
          id: `user_kelly_${Date.now()}`,
          username: username,
          name: 'Kelly',
          email: 'Kelly@Soullab.org',
          onboarded: true,
          createdAt: new Date().toISOString(),
        };

        betaSession.setUser(testUser);

        // Also store in beta_users collection for consistency
        const betaUsers = JSON.parse(localStorage.getItem('beta_users') || '{}');
        betaUsers[username] = { ...testUser, password };
        localStorage.setItem('beta_users', JSON.stringify(betaUsers));

        // Redirect to MAIA
        router.push('/maia');
        return;
      }

      // Check localStorage for existing beta users
      const betaUsersStr = localStorage.getItem('beta_users');
      if (betaUsersStr) {
        const betaUsers = JSON.parse(betaUsersStr);
        const user = betaUsers[username];

        if (user && user.password === password) {
          // Set the user session
          betaSession.setUser({
            id: user.id || `user_${Date.now()}`,
            username: user.username,
            name: user.name,
            email: user.email,
            onboarded: user.onboarded || false,
            createdAt: user.createdAt || new Date().toISOString(),
          });

          // Redirect to MAIA
          router.push('/maia');
          return;
        }
      }

      // If no user found, show error
      setError('Invalid username or password');
    } catch (err) {
      setError('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a0c4c7] via-[#7fb5b3] to-[#6ee7b7] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background holoflower with amber sunlight */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center transform -translate-y-20">
          {/* Amber sunlight glow behind holoflower */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-amber-300/40 via-amber-200/20 to-transparent scale-150 blur-2xl"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-200/30 via-amber-100/15 to-transparent scale-125 blur-xl"></div>

          {/* Main holoflower */}
          <img
            src="/holoflower.png"
            alt="Elemental Holoflower"
            className="w-[28rem] h-[28rem] opacity-30 filter drop-shadow-2xl mx-auto"
          />

          {/* Amber overlay holoflower */}
          <img
            src="/holoflower-amber.png"
            alt="Amber Holoflower"
            className="absolute inset-0 w-[28rem] h-[28rem] opacity-20 filter drop-shadow-lg"
          />
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-cinzel text-white mb-2">
            Welcome back
          </h1>
          <p className="text-white/80 font-cinzel">Sign in to continue your journey</p>
        </div>

        {/* Sign-in form */}
        <div className="relative mb-8">
          {/* Teal glow behind form */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-teal-600/20 rounded-3xl blur-xl scale-110"></div>

          {/* Main glass form */}
          <div className="relative bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl w-full max-w-md">
            {/* Inner teal accent */}
            <div className="absolute inset-2 rounded-2xl border border-teal-300/20 pointer-events-none"></div>

            {/* Deep shadow for plaque effect */}
            <div className="absolute -bottom-2 left-2 right-2 h-full bg-black/20 rounded-3xl blur-lg -z-10"></div>
            <form onSubmit={handleSignIn} className="space-y-6 relative">

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-cinzel">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-cinzel">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full bg-transparent border border-white/40 text-white py-3 px-6 rounded-full font-cinzel tracking-[0.1em] hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/0 to-teal-300/0 group-hover:from-teal-400/20 group-hover:to-teal-300/10 transition-all duration-300 blur-sm"></div>
                <span className="relative">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </span>
              </button>

            </form>

            <div className="text-center mt-6 pt-6 border-t border-white/20">
              <p className="text-white/60 text-sm font-cinzel mb-2">
                Don't have an account?
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="text-teal-300 hover:text-teal-200 transition-colors font-cinzel text-sm underline mb-4"
                disabled={isLoading}
              >
                Create Account
              </button>
              <p className="text-white/60 text-sm font-cinzel">
                Need help? Contact hello@soullab.life
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
