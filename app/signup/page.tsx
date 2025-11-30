"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password validation rules
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  };

  const isPasswordValid = Object.values(passwordRules).every(rule => rule);
  const isFormValid = formData.username.trim() && formData.name.trim() &&
                      formData.email.trim() && isPasswordValid;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear errors when user types
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.username.trim()) {
        setError('Username is required');
        return;
      }

      if (!formData.name.trim()) {
        setError('Full name is required');
        return;
      }

      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!isPasswordValid) {
        setError('Please ensure your password meets all requirements');
        return;
      }

      // Check if username already exists
      const betaUsersStr = localStorage.getItem('beta_users');
      const betaUsers = betaUsersStr ? JSON.parse(betaUsersStr) : {};

      if (betaUsers[formData.username]) {
        setError('Username already exists. Please choose a different username.');
        return;
      }

      // Check if email already exists
      const emailExists = Object.values(betaUsers).some((user: any) =>
        user.email?.toLowerCase() === formData.email.toLowerCase()
      );

      if (emailExists) {
        setError('Email already registered. Please use a different email or sign in.');
        return;
      }

      // Create new user
      const newUser = {
        id: `user_${formData.username}_${Date.now()}`,
        username: formData.username,
        name: formData.name,
        email: formData.email,
        onboarded: false, // New users need onboarding
        createdAt: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
      };

      // Add to beta_users collection
      betaUsers[formData.username] = { ...newUser, password: formData.password };
      localStorage.setItem('beta_users', JSON.stringify(betaUsers));

      // Set user session
      betaSession.setUser(newUser);

      setSuccess('Account created successfully! Redirecting...');

      // Brief success display then redirect
      setTimeout(() => {
        router.push('/maia');
      }, 1500);

    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  const handleSignInRedirect = () => {
    router.push('/signin');
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
            Join the Journey
          </h1>
          <p className="text-white/80 font-cinzel">Create your Soullab account</p>
        </div>

        {/* Sign-up form */}
        <div className="relative mb-8">
          {/* Teal glow behind form */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-teal-600/20 rounded-3xl blur-xl scale-110"></div>

          {/* Main glass form */}
          <div className="relative bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl w-full max-w-md">
            {/* Inner teal accent */}
            <div className="absolute inset-2 rounded-2xl border border-teal-300/20 pointer-events-none"></div>

            {/* Deep shadow for plaque effect */}
            <div className="absolute -bottom-2 left-2 right-2 h-full bg-black/20 rounded-3xl blur-lg -z-10"></div>

            <form onSubmit={handleSignUp} className="space-y-4 relative">

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-cinzel">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                  placeholder="Choose a unique username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-cinzel">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                  placeholder="Your full name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-cinzel">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                  placeholder="your@email.com"
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
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                    placeholder="Choose a strong password"
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

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 font-cinzel">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-teal-400 transition-colors backdrop-blur-sm"
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              {formData.password && (
                <div className="text-xs space-y-1">
                  <p className="text-white/70 font-cinzel mb-1">Password requirements:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <div className={`flex items-center gap-1 ${passwordRules.minLength ? 'text-green-300' : 'text-white/50'}`}>
                      {passwordRules.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRules.hasUpper ? 'text-green-300' : 'text-white/50'}`}>
                      {passwordRules.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRules.hasLower ? 'text-green-300' : 'text-white/50'}`}>
                      {passwordRules.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRules.hasNumber ? 'text-green-300' : 'text-white/50'}`}>
                      {passwordRules.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Number</span>
                    </div>
                    {formData.confirmPassword && (
                      <div className={`flex items-center gap-1 ${passwordRules.match ? 'text-green-300' : 'text-red-300'}`}>
                        {passwordRules.match ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>Passwords match</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-transparent border border-white/40 text-white py-3 px-6 rounded-full font-cinzel tracking-[0.1em] hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/0 to-teal-300/0 group-hover:from-teal-400/20 group-hover:to-teal-300/10 transition-all duration-300 blur-sm"></div>
                <span className="relative">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </span>
              </button>

            </form>

            <div className="text-center mt-6 pt-6 border-t border-white/20">
              <p className="text-white/60 text-sm font-cinzel mb-2">
                Already have an account?
              </p>
              <button
                onClick={handleSignInRedirect}
                className="text-teal-300 hover:text-teal-200 transition-colors font-cinzel text-sm underline"
                disabled={isLoading}
              >
                Sign In
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}