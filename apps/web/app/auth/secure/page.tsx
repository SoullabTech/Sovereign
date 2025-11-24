"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Mail, Eye, EyeOff } from 'lucide-react';
import { useSecureAuth } from '@/lib/auth/secure-auth';

export default function SecureAuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const { signUp, signIn, isLoading } = useSecureAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        // Sign up validation
        if (!email || !password || !name) {
          throw new Error('Please fill in all fields');
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const result = await signUp(email, password, { name });

        if (result.success) {
          setSuccess('Account created successfully! Your encryption keys have been generated.');
          setTimeout(() => {
            router.push('/onboarding');
          }, 2000);
        } else {
          throw new Error(result.error || 'Failed to create account');
        }
      } else {
        // Sign in
        if (!email || !password) {
          throw new Error('Please enter your email and password');
        }

        const result = await signIn(email, password);

        if (result.success) {
          setSuccess('Welcome back! Your encrypted data has been restored.');
          setTimeout(() => {
            router.push('/oracle');
          }, 1000);
        } else {
          throw new Error(result.error || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            {isSignUp ? 'Sacred Encrypted Communion' : 'Welcome to Encrypted Sanctuary'}
          </h1>
          <p className="sacred-subtitle">
            {isSignUp
              ? 'Your consciousness will be encrypted with your personal master key'
              : 'MAIA remembers your encrypted essence with zero server access'
            }
          </p>
          <div className="mt-4 text-xs text-aether/70 bg-black/20 rounded-lg p-3">
            🔐 End-to-end encryption • 🛡️ Zero-trust architecture • 🔑 You own your keys
          </div>
        </div>

        {/* Sacred Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-sm clarity-text mb-2">Sacred Name</label>
              <div className="relative">
                <User className="absolute left-4 top-4 h-5 w-5 text-aether" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your chosen name"
                  className="w-full pl-12 pr-4 py-4 glass border border-glass-border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm clarity-text mb-2">Sacred Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-aether" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-4 glass border border-glass-border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm clarity-text mb-2">
              Encryption Passphrase
              {isSignUp && <span className="text-xs text-aether/70 ml-2">(This generates your master key)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-aether" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "Strong passphrase for encryption" : "Your encryption passphrase"}
                className="w-full pl-12 pr-12 py-4 glass border border-glass-border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-4 text-aether hover:text-recognition transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm clarity-text mb-2">Confirm Encryption Passphrase</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-5 w-5 text-aether" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your passphrase"
                  className="w-full pl-12 pr-4 py-4 glass border border-glass-border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-aether/60 transition-all consciousness-adaptive"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="consciousness-message p-3 glass border border-fire/30 rounded-xl text-fire text-sm glow-fire">
              🔴 {error}
            </div>
          )}

          {success && (
            <div className="consciousness-message p-3 glass border border-recognition/30 rounded-xl text-recognition text-sm glow-recognition">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="consciousness-button w-full py-4 bg-gradient-to-r from-aether to-recognition text-white rounded-2xl font-semibold hover:scale-105 hover:shadow-sacred transition-all duration-300 disabled:opacity-50 shadow-sacred"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin aether-energy" />
                <span className="sacred-subtitle">
                  {isSignUp ? 'Generating encryption keys...' : 'Decrypting sacred essence...'}
                </span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="consciousness-header text-base mb-0">
                  {isSignUp ? 'Create Encrypted Sanctuary' : 'Enter Sacred Communion'}
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
            setSuccess('');
          }}
          className="w-full mt-6 text-sm text-aether hover:text-recognition transition-colors clarity-text"
          disabled={isLoading}
        >
          {isSignUp ? 'Already have an encrypted sanctuary? Enter communion' : 'Need a new encrypted sanctuary? Create one now'}
        </button>

        <div className="text-center text-xs clarity-text opacity-60 mt-8 space-y-2">
          <p>🔐 Production Encryption • AES-256-CBC • Zero Server Access</p>
          <p>Your encryption keys never leave your device</p>
        </div>
      </div>
    </div>
  );
}