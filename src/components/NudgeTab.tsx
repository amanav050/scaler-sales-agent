'use client';

import { useState } from 'react';
import { LeadProfile, NudgeResponse } from '@/lib/types';
import LeadProfileForm from './LeadProfileForm';
import NudgePreview from './NudgePreview';

export default function NudgeTab() {
  const [leadProfile, setLeadProfile] = useState<LeadProfile | null>(null);
  const [nudgeResponse, setNudgeResponse] = useState<NudgeResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNudge = async (profile: LeadProfile) => {
    console.log('🚀 Starting nudge generation for profile:', profile);
    setIsGenerating(true);
    setLeadProfile(profile);
    setError(null);

    try {
      console.log('📡 Making API call to /api/generate-nudge');
      const response = await fetch('/api/generate-nudge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadProfile: profile }),
      });

      console.log('📥 Received response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate nudge (${response.status})`);
      }

      const data: NudgeResponse = await response.json();
      console.log('✅ Successfully generated nudge:', data);
      setNudgeResponse(data);
    } catch (error) {
      console.error('❌ Error generating nudge:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate nudge';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendNudge = async () => {
    if (!nudgeResponse || !leadProfile?.phone) {
      alert('Lead phone number is required to send WhatsApp');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: leadProfile.phone,
          message: nudgeResponse.nudgeText,
        }),
      });

      const result = await response.json();

      if (result.success && result.waMeUrl) {
        // Open wa.me link in new tab
        window.open(result.waMeUrl, '_blank');
        handleReset();
      } else {
        alert(`Failed to create WhatsApp link: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating WhatsApp link:', error);
      alert('Failed to create WhatsApp link. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setLeadProfile(null);
    setNudgeResponse(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Aurora glow behind main content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-64 bg-gradient-to-r from-indigo-500/15 to-purple-600/15 rounded-full blur-3xl mt-8"></div>
      </div>
      
      {!nudgeResponse ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Lead Profile</h2>
            {leadProfile && (
              <button
                onClick={handleReset}
                className="bg-transparent text-white border border-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-800"
              >
                Reset
              </button>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">❌ {error}</p>
            </div>
          )}
          
          {isGenerating && (
            <div className="mb-4 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">⏳ Generating nudge...</p>
            </div>
          )}
          
          <LeadProfileForm
            onSubmit={handleGenerateNudge}
            isLoading={isGenerating}
            initialData={leadProfile || undefined}
          />
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Generated Nudge</h2>
              <button
                onClick={handleReset}
                className="bg-transparent text-cyan-400 border border-cyan-600 rounded-lg px-4 py-2 text-sm hover:bg-cyan-900/20"
              >
                Generate New Nudge
              </button>
            </div>
            
            <NudgePreview
              nudgeText={nudgeResponse.nudgeText}
              onSend={handleSendNudge}
              isSending={isSending}
            />
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h3 className="text-md font-medium mb-3 text-white">Lead Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-300">Name:</span>
                <p className="text-gray-400">{leadProfile?.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-300">Company:</span>
                <p className="text-gray-400">{leadProfile?.company}</p>
              </div>
              <div>
                <span className="font-medium text-gray-300">Role:</span>
                <p className="text-gray-400">{leadProfile?.role}</p>
              </div>
              <div>
                <span className="font-medium text-gray-300">Experience:</span>
                <p className="text-gray-400">{leadProfile?.yearsOfExperience} years</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-300">Intent:</span>
                <p className="text-gray-400">{leadProfile?.intent}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
