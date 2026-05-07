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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const [transcriptText, setTranscriptText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleAudioError = (error: string) => {
    console.error('Audio upload error:', error);
    // Error will be handled by the parent component
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName(null);
    setTranscriptText(null);
    setErrorMessage(null);
  };

  const handleFile = async (file: File) => {
    console.log('🎵 Audio file selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    resetUpload();
    
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/mp3', 'audio/x-m4a', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Please upload MP3, WAV, or M4A files only.';
      console.error('❌ File validation failed:', errorMsg);
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setUploadStatus('error');
      return;
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      const errorMsg = 'File size exceeds 25MB limit';
      console.error('❌ File size validation failed:', errorMsg);
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setIsTranscribing(true);
    
    console.log('📤 Starting upload for:', file.name);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      
      console.log('🌐 Sending request to /api/transcribe');
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      
      console.log('📊 Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API response error:', errorText);
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log('✅ API response received:', data);
      
      if (data.error) {
        console.error('❌ API returned error:', data.error);
        throw new Error(data.error);
      }
      
      console.log('🤖 Transcription completed, transcript:', data.transcript);
      
      setTranscriptText(data.transcript);
      onTranscriptComplete(data.transcript);
      setUploadStatus('completed');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to transcribe audio';
      console.error('💥 Upload/transcription error:', err);
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setUploadStatus('error');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Messages */}
      {uploadStatus === 'uploading' && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-300">
                Transcribing with Whisper...
              </p>
              <p className="text-xs mt-1 text-purple-400">
                {fileName && `Processing: ${fileName}`}
              </p>
            </div>
          </div>
        </div>
      )}
      
            
      {uploadStatus === 'completed' && transcriptText && (
        <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-300">
                  Transcription Complete
                </p>
                <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 max-h-20 overflow-y-auto">
                  {transcriptText.substring(0, 200)}{transcriptText.length > 200 ? '...' : ''}
                </div>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
      
      {uploadStatus === 'error' && errorMessage && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-300">
                  Error
                </p>
                <p className="text-xs mt-1 text-red-400">
                  {errorMessage}
                </p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

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
              <p className="text-lg font-medium text-white">Processing audio...</p>
              <p className="text-sm mt-1 text-gray-400">
                {fileName && `File: ${fileName}`}
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
    </div>
  );
}
