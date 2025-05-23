"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useSessionUpdate() {
  const { data: session } = useSession();

  useEffect(() => {
    const updateSession = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/user/session-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ip: 'client-side', // This will be overridden by the server
            userAgent: navigator.userAgent
          }),
        });

        if (!response.ok) {
          console.error('Failed to update session');
        }
      } catch (error) {
        console.error('Error updating session:', error);
      }
    };

    // Update session when component mounts and session exists
    updateSession();

    // Set up an interval to update the session periodically
    const interval = setInterval(updateSession, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [session]);
} 