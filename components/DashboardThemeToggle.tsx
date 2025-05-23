"use client"

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function DashboardThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    // Only toggle between light and dark
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) {
    // Avoid rendering mismatch by not rendering until mounted on client
    // You could render a placeholder button or null
    return <Button variant="outline" size="sm" disabled className="w-20">...-</Button>;
  }

  // Determine current theme text for Light/Dark only
  const currentThemeText = theme === "light" ? "Light" : "Dark";

  return (
    <Button
      variant="outline" // Changed from ghost to outline for better text visibility
      size="sm" // Adjusted size for text
      onClick={cycleTheme}
      aria-label={`Switch theme. Current: ${currentThemeText}`}
      className="w-20 min-w-max" // Added min-w-max to ensure text fits, w-20 for a decent default
    >
      {currentThemeText}
    </Button>
  );
} 