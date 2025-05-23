'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardThemeToggle } from "@/components/DashboardThemeToggle";

// Updated ExtendedUser to include hasPassword
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  planType?: string | null;
  stripeSubscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  hasPassword?: boolean; // Added from session
}

interface ExtendedSession {
  user?: ExtendedUser | null;
  expires: string;
}

// Plan order and display names for maintainability
const PLAN_ORDER = [
  { key: 'free', label: 'Free' },
  { key: 'hobby', label: 'Hobby' },
  { key: 'most_popular', label: 'Most Popular', badge: 'Most Popular' },
  { key: 'plus', label: 'Plus' },
  { key: 'business', label: 'Business' },
];

function getPlanIndex(planType: string | null | undefined) {
  if (!planType) return 0;
  const idx = PLAN_ORDER.findIndex(p => p.key.toLowerCase() === planType.toLowerCase());
  return idx === -1 ? 0 : idx;
}

function getNextPlan(planType: string | null | undefined) {
  const idx = getPlanIndex(planType);
  return PLAN_ORDER[idx + 1] || null;
}

function getPlanLabel(planType: string | null | undefined) {
  const plan = PLAN_ORDER.find(p => p.key.toLowerCase() === (planType || '').toLowerCase());
  return plan ? plan.label : 'Free';
}

export default function AccountCard() {
  const { data: session, update } = useSession();
  const extendedSession = session as ExtendedSession | null;
  
  // State for password form visibility and fields
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(""); // For change password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false); // State for collapsible

  const userEmail = extendedSession?.user?.email;
  const hasPasswordSet = extendedSession?.user?.hasPassword;

  const planType = (extendedSession?.user?.planType || 'free').toLowerCase();
  const nextPlan = getNextPlan(planType);
  const isSubscribed = planType !== 'free';
  const stripeCustomerId = extendedSession?.user?.stripeCustomerId || null;
  const STRIPE_BASE_CUSTOMER_PORTAL_URL = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL_BASE;

  const handleManageSubscription = () => {
    if (stripeCustomerId && STRIPE_BASE_CUSTOMER_PORTAL_URL) {
      window.open(`${STRIPE_BASE_CUSTOMER_PORTAL_URL}`, '_blank');
    } else {
      console.warn("Stripe Customer ID or Base Portal URL not found for this user.");
    }
  };
  
  const canManageSubscription = isSubscribed && stripeCustomerId && STRIPE_BASE_CUSTOMER_PORTAL_URL;

  const handlePasswordFormToggle = () => {
    setShowPasswordForm(!showPasswordForm);
    // Reset fields and messages when toggling
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsPasswordLoading(true);

    if (hasPasswordSet && !currentPassword) {
        setPasswordError("Current password is required to change your password.");
        setIsPasswordLoading(false);
        return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setIsPasswordLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const payload: any = { password: newPassword };
      if (hasPasswordSet && currentPassword) {
        // Later, API will use this. For now, it's just sent.
        payload.currentPassword = currentPassword; 
      }

      const response = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || "Failed to update password.");
      } else {
        setPasswordSuccess("Password updated successfully!");
        setShowPasswordForm(false); // Hide form on success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Important: update session to reflect hasPassword is now true if it wasn't before
        // or if other session data dependent on password status needs refresh.
        await update({ event: "session" }); // Request a session update from the server
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordError("An unexpected error occurred while changing password.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
      {/* Account Info Section */}
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mr-1">Account</h2>
          <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 h-auto whitespace-nowrap">
            {getPlanLabel(planType)}
          </Badge>
          {nextPlan && (
            <Link href={nextPlan.key === 'business' ? '/studio-plan' : `/pricing?plan=${nextPlan.key}`} passHref>
              <Button size="sm" variant="outline" className="text-xs h-auto px-2.5 py-1 whitespace-nowrap">
                Upgrade to {nextPlan.label}
                {nextPlan.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold uppercase tracking-wide dark:bg-purple-900/50 dark:text-purple-300">
                    {nextPlan.badge}
                  </span>
                )}
                </Button>
            </Link>
        )}
      </div>
        {/* Manage Subscription Button - Always visible in dashboard */}
        <Button 
            onClick={handleManageSubscription} 
            variant="outline"
          className="rounded-lg px-4 py-2 text-sm font-medium mt-2"
          disabled={!canManageSubscription} // Still disabled if Stripe info is missing
          title={canManageSubscription ? "Manage your subscription" : "Subscription management details are not yet configured."}
        >
          Manage Subscription
        </Button>
      </div>

      {/* Advanced Settings Collapsible Section */}
      <Collapsible open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen} className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <CollapsibleTrigger className="w-full flex justify-between items-center py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          <span>Advanced</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedSettingsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-6 space-y-8">
          {/* Authentication Section (now inside collapsible) */}
          <div> {/* Wrapped in a div to maintain spacing with space-y-8 from parent CollapsibleContent */} 
            <h3 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-200">Authentication & Security</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</Label>
                    <span className="text-sm text-gray-800 dark:text-gray-200">{userEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Password</Label>
                    {hasPasswordSet && !showPasswordForm && (
                        <span className="text-sm text-gray-800 dark:text-gray-200">••••••••••••</span>
                    )}
                    <Button variant="link" onClick={handlePasswordFormToggle} className="p-0 h-auto text-purple-600 hover:text-purple-500">
                    {showPasswordForm ? "Cancel" : (hasPasswordSet ? "Change Password" : "Set Password")}
                    </Button>
                </div>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 py-4 border-t border-gray-200 dark:border-gray-600">
                {hasPasswordSet && (
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      type="password" 
                      id="currentPassword" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="Enter your current password"
                      className="mt-1 w-full"
                      disabled={isPasswordLoading}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    type="password" 
                    id="newPassword" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Enter new password (min. 8 characters)"
                    className="mt-1 w-full"
                    disabled={isPasswordLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    id="confirmPassword" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm new password"
                    className="mt-1 w-full"
                    disabled={isPasswordLoading}
                  />
                </div>
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                {passwordSuccess && <p className="text-xs text-green-500">{passwordSuccess}</p>}
                <div className="flex justify-end">
                    <Button type="submit" className="sm:w-auto" disabled={isPasswordLoading || !newPassword || !confirmPassword || (hasPasswordSet && !currentPassword)}>
                        {isPasswordLoading ? "Saving..." : (hasPasswordSet ? "Save Changes" : "Set Password")}
                    </Button>
                </div>
              </form>
            )}
          </div>

          {/* Appearance Section (now inside collapsible) */}
          <div> {/* Wrapped in a div for spacing */} 
            <h3 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-200">Appearance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</Label>
                <DashboardThemeToggle />
              </div>
            </div>
          </div>

          {/* Danger Zone (now inside collapsible) */}
          <div> {/* Wrapped in a div for spacing */} 
            <h3 className="text-base font-semibold mb-4 text-gray-700 dark:text-gray-200">Danger Zone</h3>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={() => alert("Delete account functionality to be implemented.")}>
                Delete Account
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This action is irreversible. All your data will be permanently deleted.</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
} 