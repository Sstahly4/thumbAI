'use client';

import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Check your email</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A sign-in link has been sent to your email address.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can close this page.
        </p>
        <div className="mt-8">
            <Link href="/" legacyBehavior>
                <a className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
                    Go to homepage
                </a>
            </Link>
        </div>
      </div>
    </div>
  );
} 