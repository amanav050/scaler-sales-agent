'use client';

import { useState } from 'react';

interface AudioUploaderProps {
  onTranscriptComplete: (transcript: string) => void;
  onError: (error: string) => void;
  isTranscribing?: boolean;
  setIsTranscribing: (transcribing: boolean) => void;
}

export default function AudioUploader({ 
  onTranscriptComplete, 
  onError, 
  isTranscribing = false,
  setIsTranscribing
}: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/mp3', 'audio/x-m4a', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      onError('Invalid file type. Please upload MP3, WAV, or M4A files only.');
      return;
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      onError('File size exceeds 25MB limit');
      return;
    }

    setFileName(file.name);
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      onTranscriptComplete(data.transcript);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
      setFileName(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-gray-600 bg-gray-800 hover:border-gray-500'
        } ${isTranscribing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isTranscribing ? (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <div>
              <p className="text-lg font-medium text-white">Transcribing audio...</p>
              <p className="text-sm mt-1 text-gray-400">
                {fileName && `Processing: ${fileName}`}
              </p>
              <p className="text-xs mt-2 text-gray-500">This may take a few minutes</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gray-700">
              🎵
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                Upload Audio Recording
              </p>
              <p className="text-sm mt-1 text-gray-400">
                Drag and drop or click to browse
              </p>
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-6 py-3 rounded-lg inline-block hover:opacity-90 transition-opacity">
                  Choose Audio File
                </span>
                <input
                  type="file"
                  accept="audio/*,video/mp4,video/webm"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isTranscribing}
                />
              </label>
            </div>
            <div className="text-xs space-y-1 text-gray-400">
              <p>• Supports MP3, WAV, M4A, MP4, WEBM formats</p>
              <p>• Maximum file size: 25MB</p>
              <p>• English language only</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {isTranscribing && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-300">
                Transcribing with AI...
              </p>
              <p className="text-xs mt-1 text-blue-400">
                Using Groq Whisper for accurate transcription
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
