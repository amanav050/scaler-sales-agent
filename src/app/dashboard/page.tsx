'use client';

import { useState } from 'react';
import NudgeTab from '@/components/NudgeTab';
import PdfTab from '@/components/PdfTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'nudge' | 'pdf'>('nudge');

  return (
    <div className="min-h-screen">
      <div className="glass-card border-b rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold">Scaler Sales Agent</h1>
            <div className="tab-container">
              <button
                onClick={() => setActiveTab('nudge')}
                className={`tab-item ${
                  activeTab === 'nudge' ? 'active' : ''
                }`}
              >
                Pre-Sales Nudge
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`tab-item ${
                  activeTab === 'pdf' ? 'active' : ''
                }`}
              >
                Post-Call PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'nudge' ? (
          <NudgeTab />
        ) : (
          <PdfTab />
        )}
      </div>
    </div>
  );
}
