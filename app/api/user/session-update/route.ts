import { NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Define a type for the session user that includes id
interface UserWithId {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// This interface should align with ExtendedSession from lib/auth.ts
interface SessionWithUserIdAndToken extends Session { // Assuming Session is NextAuthSession here
  user?: UserWithId;
  sessionToken?: string; // Ensure sessionToken is part of the type, now optional as ExtendedSession makes it so
}

export async function POST(request: Request) {
  try {
    // console.log("[/api/user/session-update] Attempting to get session..."); // Can be removed or kept
    const session = await getServerSession(authOptions) as SessionWithUserIdAndToken; 
    console.log("[/api/user/session-update] Full session object from getServerSession:", JSON.stringify(session, null, 2)); // Added this log
    // console.log("[/api/user/session-update] Raw session object:", JSON.stringify(session, null, 2)); // Can be removed or kept

    if (!session?.user?.id || !session.sessionToken) { 
      console.error("[/api/user/session-update] Critical: Session, user.id, or sessionToken missing.", JSON.stringify(session, null, 2));
      return NextResponse.json({ error: 'Unauthorized: Session data incomplete.' }, { status: 401 });
    }

    const userId = session.user.id;
    const currentSessionToken = session.sessionToken; // Should now be present

    // Read IP and User-Agent from headers set by middleware
    const ipAddress = request.headers.get('x-user-ip') || 'unknown';
    const userAgent = request.headers.get('x-user-agent') || 'unknown';

    // Update only the current session record
    await prisma.session.update({
      where: {
        sessionToken: currentSessionToken,
      },
      data: {
        ipAddress: ipAddress,
        userAgent: userAgent,
        lastSeenAt: new Date()
      }
    });

    console.log(`[session-update] Updated session ${currentSessionToken} for user ${userId} with IP: ${ipAddress}, UserAgent: ${userAgent}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
} 