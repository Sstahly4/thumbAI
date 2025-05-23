'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BasicInfoCard from '@/components/dashboard/settings/BasicInfoCard';
import AccountCard from '@/components/dashboard/settings/AccountCard';
import ActiveSessionsCard from '@/components/dashboard/settings/ActiveSessionsCard';
import UsageCard from '@/components/dashboard/settings/UsageCard';
import CurrentUsageCard from '@/components/dashboard/settings/CurrentUsageCard';
import RecentUsageEventsCard from '@/components/dashboard/settings/RecentUsageEventsCard';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Extend session type for planType - this is a temporary workaround for TS
  // In a real scenario, NextAuth session callback would populate this.
  interface ExtendedUser {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    planType?: string | null;
    stripeSubscriptionStatus?: string | null;
  }

  interface ExtendedSession {
    user?: ExtendedUser | null;
    expires: string;
  }

  const extendedSession = session as ExtendedSession | null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/dashboard/settings');
    }
  }, [status, router]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      console.log('Sending password update request with:', { newPassword });
      const response = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: newPassword
        }),
      });

      const data = await response.json();
      console.log('Password update response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
        <p className="ml-2 text-gray-700 dark:text-gray-300">Loading settings...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !extendedSession) {
    // This case handles unauthenticated or session not yet available after loading
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
        <p className="ml-2 text-gray-700 dark:text-gray-300">Redirecting to login...</p>
      </div>
    );
  }

  // At this point, user is authenticated. 
  // The variable isSubscribed can be used by child components if needed.
  // const isSubscribed = extendedSession?.user?.planType && extendedSession?.user?.planType !== 'free';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto max-w-full px-4 md:px-8 lg:px-16 py-4 md:py-8">
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="icon" className="mr-4 h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              You can manage your account, billing, and other settings here.
            </p>
          </div>
        </div>
      </header>

      {/* Responsive Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (for Basic Info, Account, Active Sessions) */}
        <div className="lg:col-span-1 space-y-6">
          <BasicInfoCard />
          <AccountCard />
          <ActiveSessionsCard />
        </div>

        {/* Right Column (for Usage, Current Usage, Recent Events) */}
        <div className="lg:col-span-2 space-y-6">
          <UsageCard />
          <CurrentUsageCard />
          <RecentUsageEventsCard />
          </div>
        </div>
      </div>
    </div>
  );
} 