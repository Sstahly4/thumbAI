import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/email-templates';

// Configure how long the reset token is valid (e.g., 1 hour)
const RESET_TOKEN_EXPIRY_HOURS = 1;

async function hashToken(token: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
}

export async function POST(req: Request) {
  console.log('Password reset request received');
  try {
    const { email } = await req.json();
    console.log('Request body:', { email });

    if (!email || typeof email !== 'string') {
      console.log('Invalid email format');
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    console.log('Looking up user in database...');
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('User lookup result:', user ? 'User found' : 'User not found');

    // Important: Only allow password reset if the user exists AND has a password set.
    // If they don't have a password (e.g., only use OAuth or magic links), 
    // a password reset doesn't make sense.
    if (!user || !user.password) {
      // Return a generic message to avoid leaking information about email existence or password status.
      console.log(`Password reset request for non-existent user or user without password: ${email}`);
      return NextResponse.json({
        message: 'If an account with this email exists and has a password, a reset link will be processed.',
      });
    }

    console.log('Generating reset token...');
    // Generate a secure, URL-friendly token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await hashToken(resetToken);

    const expires = new Date();
    expires.setHours(expires.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    console.log('Storing reset token in database...');
    // Store the hashed token in the database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expires,
      },
    });

    // Construct the reset URL (replace with your actual domain later)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Reset URL generated:', resetUrl);

    // Send the password reset email using Resend
    try {
      console.log('Attempting to send password reset email to:', email);
      console.log('Using Resend API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
      await sendPasswordResetEmail({ url: resetUrl, email, name: user.name || undefined });
      console.log('Password reset email sent successfully');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success to user for security
    }

    return NextResponse.json({
      message: 'If your email is registered and has a password, you will receive a password reset link shortly.',
    });

  } catch (error) {
    console.error('Request password reset error:', error);
    // Generic error for security
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
  }
} 