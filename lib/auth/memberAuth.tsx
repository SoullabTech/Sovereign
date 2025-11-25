"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AstrologyProfile {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  birthChart?: string; // URL or base64 of chart image
  planetaryPlacements?: {
    mercury?: string;
    venus?: string;
    mars?: string;
    jupiter?: string;
    saturn?: string;
    uranus?: string;
    neptune?: string;
    pluto?: string;
  };
  houses?: {
    firstHouse?: string;
    secondHouse?: string;
    thirdHouse?: string;
    fourthHouse?: string;
    fifthHouse?: string;
    sixthHouse?: string;
    seventhHouse?: string;
    eighthHouse?: string;
    ninthHouse?: string;
    tenthHouse?: string;
    eleventhHouse?: string;
    twelfthHouse?: string;
  };
  aspects?: string[];
  notes?: string;
  lastUpdated?: string;
}

interface MemberProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  energyType: 'solar' | 'lunar' | 'elemental';
  primaryElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  sessionPreference: 'morning' | 'afternoon' | 'evening' | 'intuitive';
  transformationGoals: string[];
  previousExperience: 'beginner' | 'some' | 'experienced';
  healingModalities: string[];
  astrology?: AstrologyProfile;
  joinedAt: string;
  totalSessions: number;
  membershipType: 'trial' | 'monthly' | 'annual' | 'pay-per-session';
}

interface MemberAuthContextType {
  member: MemberProfile | null;
  loading: boolean;
  isMember: boolean;
  signInMember: (email: string) => Promise<void>;
  createMemberProfile: (profile: Partial<MemberProfile>) => Promise<MemberProfile>;
  updateMemberProfile: (updates: Partial<MemberProfile>) => Promise<void>;
  updateAstrologyProfile: (astrology: AstrologyProfile) => Promise<void>;
  signOutMember: () => void;
  getMemberBookings: () => Promise<any[]>;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing member session
    const storedMember = localStorage.getItem('soullab_member');
    if (storedMember) {
      setMember(JSON.parse(storedMember));
    }
    setLoading(false);
  }, []);

  const signInMember = async (email: string) => {
    // In production, this would validate the magic link token
    // For now, check if member exists in localStorage or create guest profile

    const existingMember = localStorage.getItem(`member_${email}`);
    if (existingMember) {
      const memberProfile = JSON.parse(existingMember);
      setMember(memberProfile);
      localStorage.setItem('soullab_member', JSON.stringify(memberProfile));
    } else {
      // Create basic profile for magic link signin
      const basicProfile: MemberProfile = {
        id: `member_${Date.now()}`,
        email,
        name: email.split('@')[0], // Temporary name
        energyType: 'lunar',
        primaryElement: 'water',
        sessionPreference: 'intuitive',
        transformationGoals: [],
        previousExperience: 'beginner',
        healingModalities: [],
        joinedAt: new Date().toISOString(),
        totalSessions: 0,
        membershipType: 'pay-per-session'
      };

      setMember(basicProfile);
      localStorage.setItem('soullab_member', JSON.stringify(basicProfile));
      localStorage.setItem(`member_${email}`, JSON.stringify(basicProfile));
    }
  };

  const createMemberProfile = async (profileData: Partial<MemberProfile>): Promise<MemberProfile> => {
    const newProfile: MemberProfile = {
      id: `member_${Date.now()}`,
      email: profileData.email || '',
      name: profileData.name || '',
      phone: profileData.phone,
      energyType: profileData.energyType || 'lunar',
      primaryElement: profileData.primaryElement || 'water',
      sessionPreference: profileData.sessionPreference || 'intuitive',
      transformationGoals: profileData.transformationGoals || [],
      previousExperience: profileData.previousExperience || 'beginner',
      healingModalities: profileData.healingModalities || [],
      joinedAt: new Date().toISOString(),
      totalSessions: 0,
      membershipType: 'pay-per-session'
    };

    setMember(newProfile);
    localStorage.setItem('soullab_member', JSON.stringify(newProfile));
    localStorage.setItem(`member_${newProfile.email}`, JSON.stringify(newProfile));

    return newProfile;
  };

  const updateMemberProfile = async (updates: Partial<MemberProfile>) => {
    if (!member) return;

    const updatedProfile = { ...member, ...updates };
    setMember(updatedProfile);
    localStorage.setItem('soullab_member', JSON.stringify(updatedProfile));
    localStorage.setItem(`member_${updatedProfile.email}`, JSON.stringify(updatedProfile));
  };

  const updateAstrologyProfile = async (astrology: AstrologyProfile) => {
    if (!member) return;

    const updatedAstrology = {
      ...astrology,
      lastUpdated: new Date().toISOString()
    };

    const updatedProfile = {
      ...member,
      astrology: updatedAstrology
    };

    setMember(updatedProfile);
    localStorage.setItem('soullab_member', JSON.stringify(updatedProfile));
    localStorage.setItem(`member_${updatedProfile.email}`, JSON.stringify(updatedProfile));
  };

  const signOutMember = () => {
    setMember(null);
    localStorage.removeItem('soullab_member');
  };

  const getMemberBookings = async () => {
    // In production, fetch from API
    // For now, return mock data based on member
    if (!member) return [];

    return [
      {
        id: 'booking_1',
        sessionType: 'consultation',
        date: '2024-11-20',
        time: '14:00',
        status: 'confirmed',
        practitioner: 'Kelly',
        notes: 'Initial discovery session'
      }
    ];
  };

  return (
    <MemberAuthContext.Provider value={{
      member,
      loading,
      isMember: !!member,
      signInMember,
      createMemberProfile,
      updateMemberProfile,
      updateAstrologyProfile,
      signOutMember,
      getMemberBookings
    }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (context === undefined) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
}