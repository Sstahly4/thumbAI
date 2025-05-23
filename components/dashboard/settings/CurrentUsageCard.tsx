'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

export default function CurrentUsageCard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mock data - replace with actual data from API later
  const currentSpending = 0.04;
  const spendingLimit = 0; // This might come from UsageCard settings in a real app

  const formattedMonthYear = format(currentMonth, 'MMMM yyyy');

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
    // TODO: Fetch usage data for the new month
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
    // TODO: Fetch usage data for the new month
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Current Usage</h2>

      <div className="mb-6">
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          ${currentSpending.toFixed(2)}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> of ${spendingLimit.toFixed(2)} limit</span>
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
          {formattedMonthYear}
        </p>
        <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>This reflects your current spending for usage-based services this billing period.</p>
        {/* Example text, update with actual cost structure */}
        <p className="text-xs">
           1 extra fast premium request beyond 500/month * 4 cents per such request ... $0.04
        </p>
      </div>

      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <CollapsibleTrigger className="w-full flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <span>View Pricing Details</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>Detailed breakdown of pricing:</p>
          <ul className="list-disc list-inside pl-2 text-xs">
            <li>Free Tier: 50 basic generations per month.</li>
            <li>Pro Tier ($10/month): 500 premium generations, then $0.04 per extra generation.</li>
            <li>Usage-based pricing for premium models: $0.04 per generation.</li>
            <li>Other features or services pricing will be listed here.</li>
          </ul>
          <p className="text-xs">
            Your invoice will reflect the total costs at the end of your billing cycle. 
            Visit our <a href="/pricing" className="underline hover:text-primary">pricing page</a> for more information.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
} 