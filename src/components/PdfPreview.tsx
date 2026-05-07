'use client';

import { useState } from 'react';

interface PdfPreviewProps {
  pdfUrl?: string;
  pdfBase64?: string;
  filename?: string;
  loading?: boolean;
}

export default function PdfPreview({ 
  pdfUrl, 
  pdfBase64, 
  filename = 'scaler-pdf.pdf',
  loading = false 
}: PdfPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  console.log('📄 [DEBUG] PdfPreview props:', { pdfUrl, pdfBase64, filename, loading });

  const getSrc = () => {
    const src = pdfUrl || pdfBase64 ? `data:application/pdf;base64,${pdfBase64}` : null;
    console.log('🔗 [DEBUG] PDF src generated:', src ? src.substring(0, 100) + '...' : 'null');
    return src;
  };

  const handleLoadError = () => {
    setError('Failed to load PDF. Please try generating again.');
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-white">Generating PDF...</p>
          <p className="text-sm text-gray-400">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-red-700 rounded-xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-900/20">
            ❌
          </div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const src = getSrc();
  if (!src) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-700">
            📄
          </div>
          <p className="text-white">No PDF generated yet</p>
          <p className="text-sm mt-2 text-gray-400">Generate a PDF to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{filename}</span>
          <a
            href={src}
            download={filename}
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Download
          </a>
        </div>
      </div>
      <div className="p-4 bg-gray-800">
        <iframe
          src={src}
          className="w-full h-96 rounded bg-white border border-gray-600"
          title="PDF Preview"
          onLoad={() => console.log('✅ [DEBUG] PDF iframe loaded successfully')}
          onError={(e) => console.error('❌ [DEBUG] PDF iframe error:', e)}
        />
        </div>
    </div>
  );
}
