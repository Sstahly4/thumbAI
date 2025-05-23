import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming @/ is mapped in tsconfig for lib
import { prisma } from '@/lib/prisma'; // Assuming @/ is mapped in tsconfig for lib

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET(req: NextRequest) {
  console.log("[/api/user/sessions] GET request received");
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as SessionUser).id) {
    console.log("[/api/user/sessions] Unauthorized access attempt.");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as SessionUser).id;
  console.log(`[/api/user/sessions] Fetching active sessions for userId: ${userId}`);

  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: userId,
        expires: {
          gt: new Date(), // Only fetch active sessions
        },
      },
      orderBy: {
        lastSeenAt: 'desc',
      },
      select: {
        id: true,
        sessionToken: true,
        createdAt: true,
        ipAddress: true,
        userAgent: true,
        lastSeenAt: true,
      },
    });

    console.log(`[/api/user/sessions] Found ${sessions.length} active sessions for userId: ${userId}`, sessions);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error(`[/api/user/sessions] Error fetching active user sessions for userId: ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
} 