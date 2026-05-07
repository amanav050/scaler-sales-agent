export interface LeadProfile {
  name: string;
  company: string;
  role: string;
  yearsOfExperience: number;
  intent: string;
  linkedinNotes: string;
  phone?: string;
}

export interface OpenQuestion {
  question: string;
  context: string;
  bdaResponseQuality: 'inadequate' | 'vague' | 'deflected';
}

export interface PdfSection {
  questionAddressed: string;
  heading: string;
  body: string;
  keyStat: string | null;
}

export interface PdfContent {
  leadName: string;
  headline: string;
  sections: PdfSection[];
  personalNote: string;
  ctaText: string;
}

export interface NudgeResponse {
  nudgeText: string;
}

export interface TranscriptionResponse {
  transcript: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  fallbackUrl?: string;
  waMeUrl?: string;
}
