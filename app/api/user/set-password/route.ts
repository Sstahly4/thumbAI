import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Now TypeScript knows session.user.id exists
    const userId = session.user.id;

    const rawRequestBody = await req.text();
    console.log('Raw request body text:', rawRequestBody);
    const body = JSON.parse(rawRequestBody);
    console.log('Parsed request body JSON:', { body });

    const newPassword = body.newPassword || body.password;

    if (!newPassword) {
      console.log('No newPassword or password field provided in parsed body, parsed body was:', body);
      return NextResponse.json({ error: 'New password is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }, // Use userId here
      select: { password: true }
    });

    if (!user) {
      console.log('User not found:', userId); // Use userId here
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has an existing password, we might need currentPassword (logic removed for first-time set)
    // For first-time password set, we don't need to check currentPassword.

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Updating password for user:', userId); // Use userId here
    
    await prisma.user.update({
      where: { id: userId }, // Use userId here
      data: { password: hashedPassword }
    });

    console.log('Password updated successfully for user:', userId); // Use userId here
    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
  }
} 