'use client';

import { useState } from 'react';
import { LeadProfile } from '@/lib/types';

interface LeadProfileFormProps {
  onSubmit: (profile: LeadProfile) => void;
  initialData?: Partial<LeadProfile>;
  isLoading?: boolean;
  hideSubmitButton?: boolean;
}

export default function LeadProfileForm({ onSubmit, initialData, isLoading, hideSubmitButton = false }: LeadProfileFormProps) {
  const [formData, setFormData] = useState<LeadProfile>({
    name: initialData?.name || '',
    company: initialData?.company || '',
    role: initialData?.role || '',
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    intent: initialData?.intent || '',
    linkedinNotes: initialData?.linkedinNotes || '',
    phone: initialData?.phone || '',
  });

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // If hideSubmitButton is true, call onSubmit immediately on any change
    if (hideSubmitButton) {
      onSubmit({ ...formData, [name]: newValue });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="text-sm text-gray-400 block mb-2">
            Lead Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Rohan Sharma"
            className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="company" className="text-sm text-gray-400 block mb-2">
            Company *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="TCS"
            className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="text-sm text-gray-400 block mb-2">
            Role *
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Software Engineer"
            className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="yearsOfExperience" className="text-sm text-gray-400 block mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            min="0"
            max="50"
            placeholder="4"
            className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="intent" className="text-sm text-gray-400 block mb-2">
          Intent/Goal *
        </label>
        <textarea
          id="intent"
          name="intent"
          value={formData.intent}
          onChange={handleChange}
          rows={3}
          placeholder="Want to switch to a product company, interested in AI engineering roles"
          className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full resize-none"
          required
        />
      </div>

      <div>
        <label htmlFor="linkedinNotes" className="text-sm text-gray-400 block mb-2">
          LinkedIn/Background Notes
        </label>
        <textarea
          id="linkedinNotes"
          name="linkedinNotes"
          value={formData.linkedinNotes}
          onChange={handleChange}
          rows={3}
          placeholder="B.Tech CSE VIT Vellore '20, AWS Solutions Architect cert"
          className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full resize-none"
        />
      </div>

      <div>
        <label htmlFor="phone" className="text-sm text-gray-400 block mb-2">
          Phone Number (for WhatsApp)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+919876543210"
          className="bg-[#1e293b] border border-[#334155] text-white rounded-lg p-3 w-full"
        />
      </div>

      {!hideSubmitButton && (
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg px-6 py-3 hover:opacity-90 w-full disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Generate'}
        </button>
      )}
    </form>
  );
}
