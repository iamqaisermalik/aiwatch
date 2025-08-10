'use client';

import { useState, useEffect } from 'react';
import FloatingChat from '@/components/FloatingChat';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

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
                <button 
                  onClick={() => setShowInstallModal(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
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

      {/* Installation Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Install AIWatch Extension</h2>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-600 text-lg mr-2">⚠️</span>
                    <h3 className="font-semibold text-yellow-800">Important: Use Chrome or Edge</h3>
                  </div>
                  <p className="text-yellow-700 text-sm">Safari extensions require complex setup. For testing, use Chrome or Edge instead.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">🚀 Quick Installation (Chrome/Edge)</h3>
                  
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-medium text-gray-900">Step 1: Enable Developer Mode</h4>
                      <ol className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>1. Open Chrome/Edge</li>
                        <li>2. Go to <code className="bg-gray-100 px-2 py-1 rounded">chrome://extensions/</code> or <code className="bg-gray-100 px-2 py-1 rounded">edge://extensions/</code></li>
                        <li>3. Enable "Developer mode" (toggle in top-right corner)</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium text-gray-900">Step 2: Load Extension</h4>
                      <ol className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>1. Click "Load unpacked"</li>
                        <li>2. Navigate to: <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">/Users/qaisermalik/Documents/aiwatch/browser-extension</code></li>
                        <li>3. Select the folder and click "Open"</li>
                        <li>4. Extension is now installed! ✅</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium text-gray-900">Step 3: Test the Extension</h4>
                      <ol className="text-sm text-gray-600 mt-1 space-y-1">
                        <li>1. Visit any website (e.g., google.com)</li>
                        <li>2. Look for the AIWatch floating interface at bottom center</li>
                        <li>3. Click the voice button 🎤 to start talking</li>
                        <li>4. The AI will respond with voice 🔊</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🎤 Voice Features:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ Voice Commands - Click microphone to speak</li>
                    <li>✅ Speech Responses - AI speaks back to you</li>
                    <li>✅ Visual Conversation - See chat history</li>
                    <li>✅ Context Awareness - Knows what page you're on</li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🔧 Troubleshooting:</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li><strong>Extension Not Visible:</strong> Check if "Developer mode" is enabled, refresh webpage</li>
                    <li><strong>Voice Not Working:</strong> Allow microphone permission, use HTTPS sites, use Chrome/Edge</li>
                    <li><strong>No AI Response:</strong> Check if Vercel app is running and WebSocket connection</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}