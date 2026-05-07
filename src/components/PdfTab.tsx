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
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleLeadProfileChange = (profile: LeadProfile) => {
    setLeadProfile(profile);
    setError(null);
  };

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    setError(null);
  };

  const handleGeneratePdf = async () => {
    if (!leadProfile || !transcript.trim()) {
      setError('Please provide lead profile and transcript first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPdfBase64(null);

    try {
      // Step 1: Extract questions
      setCurrentStep('Extracting questions from transcript...');
      const questionsResponse = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      
      if (!questionsResponse.ok) throw new Error('Failed to extract questions');
      const { questions } = await questionsResponse.json();

      // Step 2: Generate PDF content
      setCurrentStep('Generating personalized PDF content...');
      const contentResponse = await fetch('/api/generate-pdf-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadProfile, openQuestions: questions }),
      });
      
      if (!contentResponse.ok) throw new Error('Failed to generate PDF content');
      const pdfContent = await contentResponse.json();

      // Step 3: Generate PDF
      setCurrentStep('Creating PDF document...');
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfContent }),
      });
      
      if (!pdfResponse.ok) throw new Error('Failed to generate PDF');
      const { pdf } = await pdfResponse.json();

      setPdfBase64(pdf);
      setCurrentStep('PDF generated successfully!');
      setTimeout(() => setCurrentStep(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
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
      {leadProfile && transcript.trim() && (
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
      {pdfBase64 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative z-10">
          <h3 className="text-lg font-semibold mb-4 text-white">PDF Preview</h3>
          <PdfPreview
            pdfBase64={pdfBase64}
            filename={`scaler-pdf-${leadProfile?.name || 'lead'}.pdf`}
          />
        </div>
      )}

      {/* Approval Gate */}
      {pdfBase64 && leadProfile && (
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
