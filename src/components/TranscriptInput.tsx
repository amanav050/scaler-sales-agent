'use client';

import { useState } from 'react';
import AudioUploader from './AudioUploader';

interface TranscriptInputProps {
  onTranscriptChange: (transcript: string) => void;
  onAudioUpload: (file: File) => void;
  isTranscribing?: boolean;
}

export default function TranscriptInput({ 
  onTranscriptChange, 
  onAudioUpload, 
  isTranscribing = false 
}: TranscriptInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const [transcript, setTranscript] = useState('');
  const [isTranscribingLocal, setIsTranscribingLocal] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTranscript(value);
    onTranscriptChange(value);
  };

  const handleAudioTranscriptComplete = (audioTranscript: string) => {
    setTranscript(audioTranscript);
    onTranscriptChange(audioTranscript);
  };

  const handleAudioError = (error: string) => {
    console.error('Audio upload error:', error);
    // Error will be handled by the parent component
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex bg-gray-800 border border-gray-600 rounded-lg p-1">
        <button
          onClick={() => setInputMode('text')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'text' 
              ? 'bg-indigo-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          📝 Paste Transcript
        </button>
        <button
          onClick={() => setInputMode('audio')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'audio' 
              ? 'bg-indigo-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          🎵 Upload Audio
        </button>
      </div>

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 block">
            Call Transcript
          </label>
          <textarea
            value={transcript}
            onChange={handleTextChange}
            placeholder="Paste call transcript here. The AI will extract questions that weren't adequately answered..."
            className="w-full h-48 resize-none bg-gray-800 border border-gray-600 text-white rounded-lg p-3"
          />
          <p className="text-xs text-gray-400">
            Tip: Include full conversation between BDA and lead for best results
          </p>
        </div>
      )}

      {/* Audio Upload Mode */}
      {inputMode === 'audio' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 block">
            Audio Recording
          </label>
          <AudioUploader
            onTranscriptComplete={handleAudioTranscriptComplete}
            onError={handleAudioError}
            isTranscribing={isTranscribingLocal}
            setIsTranscribing={setIsTranscribingLocal}
          />
        </div>
      )}

      {/* Character count for text mode */}
      {inputMode === 'text' && (
        <div className="text-right">
          <span className={`text-xs ${
            transcript.length > 10000 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {transcript.length.toLocaleString()} characters
            {transcript.length > 10000 && ' (consider shorter transcript for better results)'}
          </span>
        </div>
      )}
    </div>
  );
}
