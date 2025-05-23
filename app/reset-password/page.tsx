'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError('Password reset token is missing or invalid. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!token) {
      setError('Cannot reset password without a valid token.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setMessage('Your password has been reset successfully! You can now log in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
      // Optionally redirect to login page after a delay
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="flex flex-col justify-center min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto text-center">
          <h2 className="mt-6 text-2xl font-extrabold text-red-600 dark:text-red-400">
            Invalid Token
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {tokenError}
          </p>
          <div className="mt-6">
            <Link href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="new-password">
                New Password <span className="text-xs text-gray-500">(min. 8 characters)</span>
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 dark:text-green-400 text-center">{message}</p>}

          <div>
            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 dark:focus:ring-offset-gray-950"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </form>
        {message && (
          <div className="mt-6 text-center">
            <p className="text-sm">
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
                Proceed to Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// It's good practice to wrap pages that use useSearchParams in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Basic fallback, customize as needed */}
      <ResetPasswordForm />
    </Suspense>
  );
} 