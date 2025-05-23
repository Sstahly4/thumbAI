'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StripeCancelReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const canceled = searchParams.get('canceled');
    const email = searchParams.get('email');
    const priceId = searchParams.get('priceId');

    const paramsToForward = new URLSearchParams();
    if (canceled) paramsToForward.set('canceled', canceled);
    if (email) paramsToForward.set('email', email);
    if (priceId) paramsToForward.set('priceId', priceId);

    // Redirect to the actual signup page with the parameters
    router.replace(`/signup?${paramsToForward.toString()}`);
  }, [router, searchParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>Please wait, redirecting...</p>
      {/* You can add a spinner here if you like */}
    </div>
  );
} 