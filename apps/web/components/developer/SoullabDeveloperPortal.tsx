"use client";

import React from "react";

export default function SoullabDeveloperPortal() {
  return (
    <div className="min-h-screen bg-[#0E0F1B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F6E27F] mb-4">
            Developer Portal
          </h1>
          <p className="text-gray-300">
            Access API documentation, manage keys, and explore integration options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              API Documentation
            </h2>
            <p className="text-gray-400 mb-4">
              Explore our comprehensive API documentation and endpoints.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              View Docs →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              API Keys
            </h2>
            <p className="text-gray-400 mb-4">
              Generate and manage your API keys for secure access.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Manage Keys →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              SDKs & Tools
            </h2>
            <p className="text-gray-400 mb-4">
              Download SDKs and tools for various platforms.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Get Started →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              Webhooks
            </h2>
            <p className="text-gray-400 mb-4">
              Configure webhooks for real-time event notifications.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Configure →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              Rate Limits
            </h2>
            <p className="text-gray-400 mb-4">
              View your current usage and rate limit information.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              View Usage →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              Support
            </h2>
            <p className="text-gray-400 mb-4">
              Get help from our developer support team.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Contact Support →
            </button>
          </div>
        </div>

        <div className="mt-12 bg-[#1a1b2e] rounded-lg p-8 border border-[#F6E27F]/20">
          <h2 className="text-2xl font-bold text-[#F6E27F] mb-4">
            Quick Start Guide
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#F6E27F] mr-3">1.</span>
              <div>
                <h3 className="font-semibold mb-1">Get your API key</h3>
                <p className="text-gray-400">
                  Generate an API key from the API Keys section above.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[#F6E27F] mr-3">2.</span>
              <div>
                <h3 className="font-semibold mb-1">Install the SDK</h3>
                <p className="text-gray-400">
                  Choose your platform and install the appropriate SDK.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[#F6E27F] mr-3">3.</span>
              <div>
                <h3 className="font-semibold mb-1">Make your first request</h3>
                <p className="text-gray-400">
                  Use the example code in our documentation to get started.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}