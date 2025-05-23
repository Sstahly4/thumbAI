import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required and must be a string.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ status: 'existing_user' });
    } else {
      return NextResponse.json({ status: 'new_user' });
    }
  } catch (error) {
    console.error('Check user status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 