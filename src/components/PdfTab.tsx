'use client';

import { useState } from 'react';
import LeadProfileForm from './LeadProfileForm';
import TranscriptInput from './TranscriptInput';
import PdfPreview from './PdfPreview';
import ApprovalGate from './ApprovalGate';
import { LeadProfile } from '../lib/types';

export default function PdfTab() {
  const [leadProfile, setLeadProfile] = useState<LeadProfile | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [status, setStatus] = useState('');
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [showApproval, setShowApproval] = useState(false);

  const handleLeadProfileChange = (profile: LeadProfile) => {
    setLeadProfile(profile);
    setError('');
  };

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    setError('');
  };

  const handleGeneratePdf = async () => {
    try {
      setStatus('Extracting questions...');
      setError('');
      
      const extractRes = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      
      if (!extractRes.ok) {
        const err = await extractRes.json();
        throw new Error(err.error || 'Failed to extract questions');
      }
      
      const { questions } = await extractRes.json();
      setStatus('Generating content...');
      
      const contentRes = await fetch('/api/generate-pdf-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadProfile, openQuestions: questions })
      });
      
      if (!contentRes.ok) {
        const err = await contentRes.json();
        throw new Error(err.error || 'Failed to generate content');
      }
      
      const pdfContent = await contentRes.json();
      setStatus('Creating PDF...');
      
      const pdfRes = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pdfContent)
      });
      
      if (!pdfRes.ok) {
        const err = await pdfRes.json();
        throw new Error(err.error || 'Failed to generate PDF');
      }
      
      const { pdfBase64 } = await pdfRes.json();
      setPdfData(pdfBase64);
      setStatus('Done');
      setShowApproval(true);
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStatus('');
    }
  };

  const handleSendWhatsApp = async (message: string) => {
    if (!leadProfile?.phone) {
      setError('Lead phone number is required to send WhatsApp');
      return;
    }

    setCurrentStep('Opening WhatsApp...');

    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: leadProfile.phone,
          message,
        }),
      });

      if (!response.ok) throw new Error('Failed to create WhatsApp link');

      const result = await response.json();

      if (result.success && result.waMeUrl) {
        window.open(result.waMeUrl, '_blank');
        setCurrentStep('WhatsApp opened successfully!');
        setTimeout(() => setCurrentStep(''), 3000);
      } else {
        throw new Error(result.error || 'Failed to create WhatsApp link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create WhatsApp link');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Aurora glow behind main content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-64 bg-gradient-to-r from-indigo-500/15 to-purple-600/15 rounded-full blur-3xl mt-8"></div>
      </div>
      
      {/* Status Display */}
      {currentStep && (
        <div className="bg-blue-900 border border-blue-700 rounded-xl p-4 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="text-blue-300">{currentStep}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-gray-900 border border-red-700 rounded-xl p-4 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">❌</span>
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Lead Profile */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
        <h3 className="text-lg font-semibold mb-4 text-white">Lead Information</h3>
        <LeadProfileForm
          onSubmit={handleLeadProfileChange}
          initialData={leadProfile || undefined}
          hideSubmitButton={true}
        />
      </div>

      {/* Transcript Input */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
        <h3 className="text-lg font-semibold mb-4 text-white">Call Transcript</h3>
        <TranscriptInput
          onTranscriptChange={handleTranscriptChange}
          onAudioUpload={() => {}}
          isTranscribing={false}
        />
      </div>

      {/* Generate Button */}
      {transcript.trim() && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>
      )}

      {/* PDF Preview */}
      {pdfData && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-white">PDF Preview</h3>
          <PdfPreview
            pdfBase64={pdfData}
            filename={`scaler-pdf-${leadProfile?.name || 'lead'}.pdf`}
          />
        </div>
      )}

      {/* Approval Gate */}
      {pdfData && leadProfile && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-white">Send to Lead</h3>
          <ApprovalGate
            onApprove={handleSendWhatsApp}
            onEdit={() => {}}
            onSkip={() => {}}
            loading={false}
            leadName={leadProfile.name}
          />
        </div>
      )}
    </div>
  );
}
