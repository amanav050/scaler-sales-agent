'use client';

import { useState } from 'react';

interface ApprovalGateProps {
  onApprove: (message: string) => void;
  onEdit: (message: string) => void;
  onSkip: () => void;
  loading?: boolean;
  leadName?: string;
  pdfUrl?: string;
}

export default function ApprovalGate({ 
  onApprove, 
  onEdit, 
  onSkip, 
  loading = false,
  leadName = 'the lead',
  pdfUrl
}: ApprovalGateProps) {
  const [message, setMessage] = useState(
    `Hi ${leadName}, here's the personalized PDF addressing your questions from our call. It has specific details about Scaler programs that match your goals. Please take a look and let me know if you'd like to proceed with the entrance test!`
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleApprove = () => {
    onApprove(message);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit(message);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4 relative">
      {/* Aurora glow behind main card */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-xl blur-xl"></div>
      </div>
      
      <div className="text-center relative z-10">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/20">
          <span className="text-green-400 text-2xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-white">
          Ready to Send to {leadName}?
        </h3>
        <p className="text-sm text-gray-400">
          Review WhatsApp message below before sending
        </p>
      </div>

      {/* WhatsApp Message Preview */}
      <div className="p-4 bg-gray-800 rounded-xl relative z-10">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-600">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <div className="flex-1">
            <div className="bg-gray-700 border border-gray-600 rounded-xl p-3">
              {isEditing ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-24 resize-none bg-gray-800 border border-gray-600 text-white rounded-lg p-3"
                  placeholder="Type your message here..."
                />
              ) : (
                <p className="whitespace-pre-wrap text-gray-200">{message}</p>
              )}
            </div>
            {pdfUrl && !isEditing && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
                <span>📎</span>
                <span>Personalized PDF attached</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 flex-1 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Message'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="bg-transparent text-white border border-gray-600 rounded-lg px-6 py-3 hover:bg-gray-800 flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 flex-1 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Opening WhatsApp...' : '✅ Send to BDA WhatsApp'}
            </button>
            <button
              onClick={handleEdit}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 flex-1 disabled:opacity-50"
            >
              ✏️ Edit Message
            </button>
            <button
              onClick={onSkip}
              disabled={loading}
              className="bg-transparent text-white border border-gray-600 rounded-lg px-6 py-3 hover:bg-gray-800 flex-1 disabled:opacity-50"
            >
              ⏭️ Skip
            </button>
          </>
        )}
      </div>

      {/* Character count for editing */}
      {isEditing && (
        <div className="text-right relative z-10">
          <span className={`text-xs ${
            message.length > 300 ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {message.length}/300 characters (WhatsApp limit ~300)
          </span>
        </div>
      )}
    </div>
  );
}
