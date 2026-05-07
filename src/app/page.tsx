'use client';

import { useState } from 'react';
import OnboardingForm from '@/components/OnboardingForm';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  if (phoneNumber) {
    // Redirect to dashboard after onboarding
    window.location.href = '/dashboard';
    return null;
  }

  return <OnboardingForm onSubmit={setPhoneNumber} />;
}
