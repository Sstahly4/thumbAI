'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Temporary interface for session user
interface ExtendedUser {
  planType?: string | null;
  // Add other usage-related fields from session if available later
  // e.g., premiumRequestsUsed?: number; premiumRequestsLimit?: number;
}
interface ExtendedSession {
  user?: ExtendedUser | null;
  expires: string;
}

export default function UsageCard() {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession | null;

  // Mock data - replace with actual data from session/API later
  const [daysUntilRefresh, setDaysUntilRefresh] = useState(23);
  const [premiumUsed, setPremiumUsed] = useState(480);
  const [premiumLimit, setPremiumLimit] = useState(500);
  const [freeUsed, setFreeUsed] = useState(10);
  const freeLimit = Infinity; // Or a specific number if free tier has limits

  const [enableUsageBased, setEnableUsageBased] = useState(false);
  const [enableUsageBasedPremium, setEnableUsageBasedPremium] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState("0");

  const premiumPercentage = premiumLimit > 0 ? (premiumUsed / premiumLimit) * 100 : 0;
  const hasHitPremiumLimit = premiumUsed >= premiumLimit;

  // Effect to simulate data fetching or updates from session
  useEffect(() => {
    // if (extendedSession?.user) {
    //   setPremiumUsed(extendedSession.user.premiumRequestsUsed || 0);
    //   setPremiumLimit(extendedSession.user.premiumRequestsLimit || 500);
    // }
  }, [extendedSession]);

  const handleSaveSettings = () => {
    // TODO: Implement API call to save these settings
    console.log('Saving usage settings:', { enableUsageBased, enableUsageBasedPremium, spendingLimit });
    // Add toast notification for success/failure
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-200">Usage</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Requests will refresh in {daysUntilRefresh} days.
      </p>

      {/* Premium Models Usage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="premium-progress" className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium models</Label>
          <span className={`text-sm ${hasHitPremiumLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {premiumUsed} / {premiumLimit}
          </span>
        </div>
        <Progress id="premium-progress" value={premiumPercentage} className={`h-3 ${hasHitPremiumLimit ? '[&>*]:bg-red-500' : ''}`} />
        {hasHitPremiumLimit && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" /> You've hit your limit of {premiumLimit} requests.
          </p>
        )}
      </div>

      {/* Free Models Usage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="free-progress" className="text-sm font-medium text-gray-700 dark:text-gray-300">Free models</Label>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {freeUsed} / {freeLimit === Infinity ? 'No Limit' : freeLimit}
          </span>
        </div>
        <Progress id="free-progress" value={freeLimit === Infinity ? 0 : (freeUsed/freeLimit)*100} className="h-3 [&>*]:bg-green-500" />
        {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You've used {freeUsed} requests of this model. You have no monthly quota.</p> */}
      </div>

      {/* Usage-based Pricing Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-start">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 shrink-0" />
        <div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
            Usage-based pricing allows you to pay for extra requests beyond your plan limits. 
            <Link href="/pricing#usage-based" className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-200">Learn more</Link>.
            </p>
        </div>
      </div>

      {/* Settings Subsection */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-300">Settings</h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Label htmlFor="usage-based-toggle" className="flex flex-col space-y-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">Enable usage-based pricing</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Allow charges for requests beyond your plan limit.</span>
            </Label>
            <Switch id="usage-based-toggle" checked={enableUsageBased} onCheckedChange={setEnableUsageBased} />
          </div>
          
          <div className={`flex items-center justify-between ${!enableUsageBased ? 'opacity-50' : ''}`}>
            <Label htmlFor="usage-based-premium-toggle" className="flex flex-col space-y-1">
              <span className={`font-medium ${!enableUsageBased ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>Enable usage-based pricing for premium models</span>
              <span className={`text-xs ${!enableUsageBased ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>Allow extra charges specifically for premium model requests.</span>
            </Label>
            <Switch id="usage-based-premium-toggle" disabled={!enableUsageBased} checked={enableUsageBasedPremium} onCheckedChange={setEnableUsageBasedPremium} />
          </div>

          <div className={`space-y-2 ${!enableUsageBased ? 'opacity-50' : ''}`}>
            <Label htmlFor="spending-limit" className={`font-medium ${!enableUsageBased ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>Monthly spending limit</Label>
            <div className="flex items-center space-x-2">
                <span className={`text-gray-500 dark:text-gray-400 ${!enableUsageBased ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>$</span>
                <Input 
                    type="number" 
                    id="spending-limit" 
                    value={spendingLimit} 
                    onChange={(e) => setSpendingLimit(e.target.value)} 
                    className="w-24 dark:bg-gray-700"
                    placeholder="0"
                    min="0"
                    disabled={!enableUsageBased}
                />
            </div>
            <p className={`text-xs ${!enableUsageBased ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>Set to $0 to disable spending beyond your plan.</p>
          </div>
          
          <Button onClick={handleSaveSettings} className="w-full sm:w-auto" disabled={!enableUsageBased && spendingLimit !== "0"}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
} 