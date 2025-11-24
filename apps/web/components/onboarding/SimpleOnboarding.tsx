"use client";

import React from "react";

export function SimpleOnboarding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-gray-600">
            Let's get you started with the Oracle system
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Getting Started</h2>
            <p className="text-gray-600">
              The Oracle system is ready to guide you on your journey.
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue to Oracle
          </button>
        </div>
      </div>
    </div>
  );
}