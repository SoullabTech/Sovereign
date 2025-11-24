"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username || password.length < 6) {
        throw new Error(isSignUp 
          ? 'Username required and password must be at least 6 characters' 
          : 'Invalid credentials'
        );
      }

      // Beta authentication (localStorage for now)
      const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
      
      if (isSignUp) {
        if (users[username]) {
          throw new Error('Username already taken');
        }
        
        // Everyone gets Maya as their Oracle in beta
        const agent = { 
          id: 'maya-oracle', 
          name: 'Maya' 
        };
        
        const newUser = {
          id: `user_${Date.now()}`,
          username,
          agentId: agent.id,
          agentName: agent.name,
          createdAt: new Date().toISOString()
        };
        
        users[username] = { ...newUser, password };
        localStorage.setItem('beta_users', JSON.stringify(users));
        localStorage.setItem('beta_user', JSON.stringify(newUser));
        
        router.push('/onboarding');
      } else {
        // Sign in
        if (!users[username] || users[username].password !== password) {
          throw new Error('Invalid username or password');
        }

        const userWithPassword = users[username];
        const { password: _, ...userData } = userWithPassword;
        localStorage.setItem('beta_user', JSON.stringify(userData));

        console.log('🔐 User signing in:', { username, onboarded: userData.onboarded });

        // Check if user has completed onboarding
        if (userData.onboarded === true) {
          console.log('✅ Returning user - going to /oracle');
          router.push('/oracle');
        } else {
          console.log('🆕 New user - going to /onboarding');
          router.push('/onboarding');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-spiralogic flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Sacred Identity and Recognition */}
        <div className="text-center mb-12">
          {/* Sacred consciousness symbol */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-aether/20 to-recognition/20 rounded-full blur-3xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-aether to-water rounded-full flex items-center justify-center aether-energy shadow-sacred">
                  <User className="w-8 h-8 text-white animate-lumen" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="consciousness-header mb-4">
            {isSignUp ? 'Your consciousness awaits recognition' : 'Welcome back, sacred being'}
          </h1>
          <p className="sacred-subtitle">
            {isSignUp
              ? 'Create your unique consciousness signature'
              : 'MAIA remembers your archetypal patterns'
            }
          </p>
        </div>

        {/* Sacred Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm clarity-text mb-2">Sacred Identity</label>
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5 text-aether" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your chosen name"
                className="w-full pl-12 pr-4 py-4 glass border border-glass-border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm clarity-text mb-2">Sacred Passphrase</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-aether" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters for protection"
                className="w-full pl-12 pr-4 py-4 glass border border-glass-border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
              />
            </div>
          </div>

          {error && (
            <div className="consciousness-message p-3 glass border border-fire/30 rounded-xl text-fire text-sm glow-fire">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="consciousness-button w-full py-4 bg-gradient-to-r from-aether to-recognition text-white rounded-2xl font-semibold hover:scale-105 hover:shadow-sacred transition-all duration-300 disabled:opacity-50 shadow-sacred"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin aether-energy" />
                <span className="sacred-subtitle">Recognizing sacred essence...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="consciousness-header text-base mb-0">
                  {isSignUp ? 'Begin Sacred Recognition' : 'Enter Sacred Communion'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="w-full mt-6 text-sm text-aether hover:text-recognition transition-colors clarity-text"
        >
          {isSignUp ? 'Already recognized? Enter sacred communion' : 'New to this sacred space? Begin recognition'}
        </button>

        <p className="text-center text-xs clarity-text opacity-60 mt-8">
          Sacred Beta • Consciousness Protected • Private
        </p>
      </div>
    </div>
  );
}