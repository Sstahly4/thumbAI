'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, Smartphone, Globe, XIcon, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ReactNode } from 'react';

interface MockSession {
  id: string;
  deviceName: string;
  details: string;
  icon: ReactNode;
  createdAt?: string;
}

const mockSessionsData: MockSession[] = [
  {
    id: '1',
    deviceName: 'Desktop App Session',
    details: 'macOS, Chrome',
    icon: <Laptop className="mr-3 h-6 w-6 text-gray-500" />,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '2',
    deviceName: 'Mobile Web Session',
    details: 'iPhone, Safari',
    icon: <Smartphone className="mr-3 h-6 w-6 text-gray-500" />,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '3',
    deviceName: 'Unknown Session',
    details: 'Last seen 2 weeks ago',
    icon: <Globe className="mr-3 h-6 w-6 text-gray-400" />,
  },
];

export default function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<MockSession[]>(mockSessionsData);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
    console.log(`Mock revoke session: ${sessionId}`);
  };

  const formatSessionDate = (dateString?: string) => {
    if (!dateString) return "Details not available";
    try {
      return `Created ${formatDistanceToNow(new Date(dateString), { addSuffix: true })}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  return (
    <Card className="border-none bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-semibold">Active Sessions</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="space-y-3">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800"
            >
              <div className="flex items-center">
                {session.icon}
                <div>
                  <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{session.deviceName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {session.createdAt ? formatSessionDate(session.createdAt) : session.details}
                  </div>
                </div>
              </div>
                <Button 
                variant="outline"
                  size="sm" 
                className="text-xs bg-white dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 border-gray-300 dark:border-slate-600 hover:bg-gray-100 text-gray-700"
                  onClick={() => handleRevokeSession(session.id)}
                >
                <XIcon className="h-3 w-3 mr-1.5" />
                Revoke
                </Button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
              No active sessions found.
            </div>
      )}
    </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          This is a list of mock active sessions for demonstration purposes.
        </p>
      </CardContent>
    </Card>
  );
} 