'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Calendar, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface AboutData {
  profile: {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    bio: string;
    photo_url: string | null;
    specialties: string[];
    years_experience: number;
    brand: {
      name: string;
    };
  };
  extended_bio?: string;
  philosophy?: string;
  training?: string[];
  credentials?: string[];
}

export default function PortalAboutPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [homeRes, aboutRes] = await Promise.all([
          fetch(`/api/portal/${slug}/home`),
          fetch(`/api/portal/${slug}/about`),
        ]);

        let aboutData: AboutData = { profile: {} as AboutData['profile'] };

        if (homeRes.ok) {
          const homeData = await homeRes.json();
          aboutData.profile = homeData.profile;
        }

        if (aboutRes.ok) {
          const extendedData = await aboutRes.json();
          aboutData = { ...aboutData, ...extendedData };
        }

        setData(aboutData);
      } catch (err) {
        console.error('Failed to load about:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-[#D4AF37]" />
        </motion.div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <p className="text-[#A89FC4]">Profile not found</p>
      </div>
    );
  }

  const { profile, extended_bio, philosophy, training, credentials } = data;

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center text-[#9D8EC7] hover:text-[#D4AF37] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {profile.photo_url && (
            <div className="w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 shadow-lg shadow-[#9D8EC7]/20">
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="font-cinzel text-4xl md:text-5xl text-[#F5F0FF] mb-4">
            {profile.name}
          </h1>

          {profile.tagline && (
            <p className="font-quicksand text-xl text-[#9D8EC7] mb-6">
              {profile.tagline}
            </p>
          )}

          {profile.specialties && profile.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {profile.specialties.map((specialty, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full text-sm font-quicksand
                           bg-[#251F33] text-[#E8B4CB] border border-[#3A3347]"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {profile.years_experience > 0 && (
            <p className="text-[#6B6280] text-sm">
              {profile.years_experience}+ years of experience
            </p>
          )}
        </motion.div>

        {/* Bio Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="font-cinzel text-2xl text-[#F5F0FF] mb-6 text-center">
            My Story
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="font-quicksand text-[#A89FC4] leading-relaxed whitespace-pre-line">
              {extended_bio || profile.bio || 'Bio coming soon...'}
            </p>
          </div>
        </motion.section>

        {/* Philosophy Section */}
        {philosophy && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 p-8 rounded-2xl bg-[#251F33]/50 border border-[#3A3347]"
          >
            <h2 className="font-cinzel text-2xl text-[#F5F0FF] mb-6 text-center">
              My Approach
            </h2>
            <p className="font-quicksand text-[#A89FC4] leading-relaxed whitespace-pre-line text-center">
              {philosophy}
            </p>
          </motion.section>
        )}

        {/* Training & Credentials */}
        {(training?.length || credentials?.length) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16 grid md:grid-cols-2 gap-8"
          >
            {training && training.length > 0 && (
              <div>
                <h3 className="font-cinzel text-xl text-[#F5F0FF] mb-4">Training</h3>
                <ul className="space-y-2">
                  {training.map((item, i) => (
                    <li key={i} className="font-quicksand text-[#A89FC4] flex items-start">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mt-2 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {credentials && credentials.length > 0 && (
              <div>
                <h3 className="font-cinzel text-xl text-[#F5F0FF] mb-4">Credentials</h3>
                <ul className="space-y-2">
                  {credentials.map((item, i) => (
                    <li key={i} className="font-quicksand text-[#A89FC4] flex items-start">
                      <span className="w-1.5 h-1.5 bg-[#E8B4CB] rounded-full mt-2 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center p-8 rounded-2xl bg-gradient-to-br from-[#251F33] to-[#1A1625] border border-[#9D8EC7]/30"
        >
          <h3 className="font-cinzel text-2xl text-[#F5F0FF] mb-4">
            Ready to Begin?
          </h3>
          <p className="font-quicksand text-[#A89FC4] mb-8 max-w-xl mx-auto">
            Whether you&apos;re seeking clarity about your path, understanding your relationships,
            or navigating a life transition, I&apos;m here to guide you through the cosmic wisdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/portal/${slug}/services`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full
                       bg-gradient-to-r from-[#D4AF37] to-[#C9A962] text-[#0D0B14]
                       font-quicksand font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/20
                       transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Services
            </Link>
            <Link
              href={`/portal/${slug}/chat`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full
                       border border-[#9D8EC7] text-[#F5F0FF]
                       font-quicksand hover:bg-[#251F33] transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask a Question
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
