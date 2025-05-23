import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming @/ is mapped in tsconfig for lib
import { prisma } from '@/lib/prisma'; // Assuming @/ is mapped in tsconfig for lib

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as SessionUser).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as SessionUser).id;
  const { sessionId } = params;

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const sessionToDelete = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: userId, // Ensure the session belongs to the authenticated user
      },
    });

    if (!sessionToDelete) {
      return NextResponse.json(
        { error: 'Session not found or you are not authorized to delete it' },
        { status: 404 }
      );
    }

    await prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    return NextResponse.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
} 