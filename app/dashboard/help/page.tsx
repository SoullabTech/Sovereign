import React from 'react';
import { HelpCircle, Book, MessageCircle, ExternalLink, Lightbulb } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Help & Support
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Get help with using Soullab and Maya
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Getting Started */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700
                      hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Getting Started
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Learn the basics of interacting with Maya and using voice commands.
          </p>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View Guide →
          </button>
        </div>

        {/* Voice Features */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700
                      hover:border-green-300 dark:hover:border-green-600 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Voice Features
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Discover advanced voice interaction capabilities and tips.
          </p>
          <button className="text-sm text-green-600 dark:text-green-400 hover:underline">
            Learn More →
          </button>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700
                      hover:border-amber-300 dark:hover:border-amber-600 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Troubleshooting
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Common issues and solutions for voice, audio, and connection problems.
          </p>
          <button className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
            Get Help →
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Book className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer
                             text-sm font-medium text-neutral-700 dark:text-neutral-300
                             hover:text-neutral-900 dark:hover:text-neutral-100">
              How do I enable voice interactions?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 pl-4">
              Click the microphone button and allow browser permissions for microphone access.
              Maya will respond with voice automatically.
            </div>
          </details>

          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer
                             text-sm font-medium text-neutral-700 dark:text-neutral-300
                             hover:text-neutral-900 dark:hover:text-neutral-100">
              Why isn't Maya responding to my voice?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 pl-4">
              Check your microphone permissions in browser settings. Ensure you're in a quiet environment
              and speaking clearly. Try refreshing the page if issues persist.
            </div>
          </details>

          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer
                             text-sm font-medium text-neutral-700 dark:text-neutral-300
                             hover:text-neutral-900 dark:hover:text-neutral-100">
              Can I use Soullab on mobile devices?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 pl-4">
              Yes! Soullab is optimized for mobile browsers. Voice features work best with a stable
              internet connection and good microphone quality.
            </div>
          </details>

          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer
                             text-sm font-medium text-neutral-700 dark:text-neutral-300
                             hover:text-neutral-900 dark:hover:text-neutral-100">
              How is my data protected?
              <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 pl-4">
              All conversations are encrypted, and personal data is anonymized. We follow strict
              privacy standards and you can export or delete your data anytime.
            </div>
          </details>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                    rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Still Need Help?
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4 max-w-md mx-auto">
            Our support team is here to help with any questions or technical issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="flex items-center justify-center gap-2 px-4 py-2
                             bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                             transition-colors duration-200">
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2
                             border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300
                             hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg
                             transition-colors duration-200">
              <ExternalLink className="w-4 h-4" />
              Community Forum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}