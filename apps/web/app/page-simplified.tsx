/**
 * Simplified Landing Page - Clear value proposition
 * Focus on practical benefits, not mystical concepts
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Brain, Heart, Target, Shield, MessageCircle, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen  from-blue-50 to-white">
      {/* Hero Section - Clear, simple value prop */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Reflection for Personal Growth
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Have meaningful conversations with Maya, your AI reflection partner. 
            Discover patterns, gain insights, and track your growth journey.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                Start Free Conversation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Your privacy protected
          </p>
        </div>
      </section>

      {/* Benefits Section - Concrete value */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple Tools for Real Growth
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Understand Your Patterns
              </h3>
              <p className="text-gray-600">
                Maya helps you notice recurring themes in your thoughts and behaviors, 
                making invisible patterns visible.
              </p>
            </Card>

            <Card className="p-6">
              <Heart className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Track Your Mood
              </h3>
              <p className="text-gray-600">
                Simple daily check-ins help you understand your emotional rhythms 
                and what influences them.
              </p>
            </Card>

            <Card className="p-6">
              <Target className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Get Actionable Insights
              </h3>
              <p className="text-gray-600">
                Receive practical suggestions based on your conversations, 
                helping you make small, meaningful changes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Simple process */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Share What&apos;s on Your Mind
                </h3>
                <p className="text-gray-600">
                  Talk to Maya like you would a thoughtful friend. 
                  No judgment, just understanding.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Explore Your Patterns Together
                </h3>
                <p className="text-gray-600">
                  Maya helps you notice themes and connections you might have missed, 
                  asking gentle questions to deepen understanding.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Track Your Progress
                </h3>
                <p className="text-gray-600">
                  See your growth over time with simple metrics and insights. 
                  Celebrate small wins and stay motivated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Address concerns */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Built with Safety and Privacy in Mind
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="flex gap-4">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Your Privacy Protected</h3>
                <p className="text-gray-600">
                  Conversations are encrypted and never shared. 
                  You can delete your data anytime.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <MessageCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Clear Boundaries</h3>
                <p className="text-gray-600">
                  Maya is a reflection tool, not a therapist. 
                  We&apos;ll always recommend professional help when needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Build trust */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Beta Users Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                "Maya helped me realize I always put others first. 
                Now I check in with myself daily. It&apos;s been transformative."
              </p>
              <p className="font-semibold">— Sarah, Teacher</p>
            </Card>

            <Card className="p-6">
              <p className="text-gray-600 mb-4">
                "I was skeptical about AI understanding emotions, but the pattern 
                insights have been surprisingly accurate and helpful."
              </p>
              <p className="font-semibold">— Michael, Engineer</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Reflection Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands discovering insights about themselves.
          </p>
          <Link href="/chat">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Your First Conversation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm mt-4 opacity-75">
            Free to start • No credit card • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p>&copy; 2024 SpiralogicAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}