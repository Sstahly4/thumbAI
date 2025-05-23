'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, DollarSign, FileText, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface UsageEvent {
  id: string;
  type: 'generation' | 'subscription' | 'credit_purchase' | 'adjustment' | 'other';
  description: string;
  date: Date;
  amount?: number; // Positive for charges, negative for credits/refunds
  currency?: string;
  detailsLink?: string; // Link to an invoice or more detailed view
}

// Mock data for recent usage events - replace with actual data fetching later
const mockUsageEvents: UsageEvent[] = [
  {
    id: '1',
    type: 'generation',
    description: 'Thumbnail Generation - Premium Model',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    amount: 0.04,
    currency: 'USD',
    detailsLink: '/dashboard/billing/invoice/inv_123xyz' // Mock link
  },
  {
    id: '2',
    type: 'generation',
    description: 'Batch Generation (3 images) - Standard Model',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    amount: 0.00, // Assuming standard model is free within limits
    currency: 'USD',
  },
  {
    id: '3',
    type: 'subscription',
    description: 'Monthly Subscription - Pro Plan Renewal',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    amount: 10.00,
    currency: 'USD',
    detailsLink: '/dashboard/billing/invoice/inv_abc789' // Mock link
  },
  {
    id: '4',
    type: 'credit_purchase',
    description: 'Purchased 100 Extra Credits',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    amount: 5.00,
    currency: 'USD',
    detailsLink: '/dashboard/billing/receipt/rec_def456' // Mock link
  },
];

const EventIcon = ({ type }: { type: UsageEvent['type'] }) => {
  switch (type) {
    case 'generation':
      return <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    case 'subscription':
      return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    case 'credit_purchase':
      return <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />;
    case 'adjustment':
        return <HelpCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    default:
      return <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  }
};

export default function RecentUsageEventsCard() {
  // In a real app, you would fetch these events
  const events = mockUsageEvents;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Recent Usage Events</h2>
      {events.length > 0 ? (
        <ul className="space-y-1">
          {events.map((event) => (
            <li key={event.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-md transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <EventIcon type={event.type} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(event.date, 'MMM dd, yyyy, hh:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  {event.amount !== undefined && (
                    <p className={`text-sm font-semibold ${event.amount >= 0 ? 'text-gray-700 dark:text-gray-200' : 'text-green-600 dark:text-green-400'}`}>
                      {event.amount < 0 ? '-' : ''}${Math.abs(event.amount).toFixed(2)} {event.currency}
                    </p>
                  )}
                  {event.detailsLink && (
                    <Link href={event.detailsLink} passHref>
                      <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        View Details
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent usage events found.</p>
      )}
      {events.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link href="/dashboard/billing/history" passHref>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Full Billing History
                </Button>
            </Link>
          </div>
      )}
    </div>
  );
} 