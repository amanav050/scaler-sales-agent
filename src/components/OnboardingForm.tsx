'use client';

import { useState } from 'react';

interface OnboardingFormProps {
  onSubmit: (phoneNumber: string) => void;
}

export default function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      onSubmit(`${countryCode}${phoneNumber}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Aurora glow behind main card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-2xl h-96 bg-gradient-to-r from-indigo-500/15 to-purple-600/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Scaler Sales Agent</h1>
          <p className="text-gray-400">AI-powered sales support for BDAs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="text-sm text-gray-400 block mb-2">
              WhatsApp Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-gray-800 border border-gray-600 text-white rounded-lg p-3"
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
              </select>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg p-3 w-full"
                required
              />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-600 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-cyan-400">WhatsApp Integration</h3>
            <p className="text-sm text-gray-400">
              Enter your WhatsApp phone number to enable sending personalized messages and PDFs to leads directly through WhatsApp.
            </p>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 w-full"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
