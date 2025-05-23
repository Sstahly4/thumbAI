import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required and must be a non-empty string.' }, { status: 400 });
    }
    
    // Optional: Add more validation for name length, characters, etc.
    if (name.trim().length > 50) { // Example: Max length for name
        return NextResponse.json({ error: 'Name cannot exceed 50 characters.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name.trim() }, // Trim whitespace before saving
    });

    return NextResponse.json({ message: 'Name updated successfully' });

  } catch (error) {
    console.error('Update name error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 