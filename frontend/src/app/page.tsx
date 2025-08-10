'use client';

import { useState, useEffect } from 'react';
import FloatingChat from '@/components/FloatingChat';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AIWatch</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showDashboard ? 'Home' : 'Dashboard'}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showDashboard ? (
          <Dashboard />
        ) : (
          <div className="text-center">
            {/* Hero Section */}
            <div className="mb-16">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
                Universal Web{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Assistant
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                AI-powered contextual guidance that works on any website. Get intelligent help
                wherever you browse with our universal browser extension.
              </p>
              
              <div className="flex justify-center space-x-4 mb-12">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Install Extension
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Universal Integration</h3>
                <p className="text-gray-600">Works on any website with our browser extension. No setup required.</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contextual Intelligence</h3>
                <p className="text-gray-600">Understands webpage content and provides relevant guidance.</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-600">Minimal data collection with full user control and transparency.</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Development Status</h2>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold">✅ Database</div>
                  <div className="text-gray-600">Connected & Schema Ready</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold">✅ AI Service</div>
                  <div className="text-gray-600">Claude API Configured</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-semibold">🔄 Frontend</div>
                  <div className="text-gray-600">In Development</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-semibold">🔄 Extension</div>
                  <div className="text-gray-600">Coming Next</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat - Always visible */}
      <FloatingChat />
    </div>
  );
}