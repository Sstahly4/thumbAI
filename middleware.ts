import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (token?.sub) {
    // Get IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Check if user has a plan
    const hasPlan = token.planType !== null;
    
    // If user is trying to access protected routes without a plan, redirect to payment
    if (!hasPlan && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/payment', request.url));
    }
    
    const response = NextResponse.next();
    response.headers.set('x-user-ip', ip);
    response.headers.set('x-user-agent', userAgent);
    return response;
  }

  return NextResponse.next();
}

// Only run middleware on API routes and dashboard pages
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*'
  ]
}; 