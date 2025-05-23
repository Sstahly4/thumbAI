"use client";

import { useSessionUpdate } from '@/hooks/useSessionUpdate';
 
export default function SessionUpdater() {
  useSessionUpdate();
  return null;
} 