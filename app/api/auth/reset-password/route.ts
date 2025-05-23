import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Helper function to hash a token (consistent with request-password-reset)
async function verifyToken(token: string, hashedTokenDb: string): Promise<boolean> {
  // This is a simplified conceptual verification. 
  // In a real scenario, if you store pre-hashed tokens from crypto.randomBytes, 
  // you'd compare them directly if the token in URL is the pre-image.
  // However, the request-password-reset hashes the token before storing.
  // So, we must re-hash the incoming token to compare.
  // This means the token sent in the URL should be the *original* unhashed token.
  const salt = hashedTokenDb.substring(0, bcrypt.getRounds(hashedTokenDb) === 10 ? 29 : 0); // Extract salt if bcrypt was used with salt
  // Note: Bcrypt's genSalt and hash include the salt in the resulting hash.
  // Comparing plain text against a bcrypt hash is done by bcrypt.compare.
  // The token from URL is plain. The token in DB is hashed.
  // We need to find the DB record by the *hashed version* of the token from the URL,
  // or, if we stored the *original* token, find by original and then verify.
  // The current request-password-reset hashes the token. So we assume the URL token is the pre-image.

  // Let's adjust the logic: The token in the URL is the raw token.
  // We need to iterate over potential tokens or find a way to query by a part of it if possible,
  // or, more practically, we should have sent an identifier with the token
  // or the token itself should be findable (e.g. if it was shorter and indexed).
  // Given the current setup (long random token, hashed in DB),
  // the most straightforward way is to iterate if necessary, but that's not scalable.
  // The request-password-reset route creates a hashed token.
  // It's crucial that the `reset-password?token=` URL parameter is the *original* unhashed token.
  // Then, this API route will hash it again to find the match in PasswordResetToken table.
  
  // This function is actually not needed if we hash the input token and compare.
  // The direct comparison will be `hashedInputToken === storedHashedToken`.
  // However, to be absolutely sure, bcrypt.compare is safer if there's any doubt about salt handling.
  // For now, let's assume we'll re-hash the input token and find the DB record.
  // This helper will be more for direct comparison if we change strategy.
  return false; // Placeholder, direct hashing and comparison will be used.
}


export async function POST(req: Request) {
  console.log('Actual password reset attempt received');
  try {
    const { token, newPassword } = await req.json();
    console.log('Request body:', { token, newPassword });

    if (!token || typeof token !== 'string') {
      console.log('Invalid or missing token');
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      console.log('Invalid or missing new password, or password too short');
      return NextResponse.json({ error: 'A new password is required (minimum 8 characters).' }, { status: 400 });
    }

    // Hash the incoming token to find it in the database,
    // because we stored the hashed version.
    // This requires the same hashing mechanism as in `request-password-reset`.
    // For simplicity, let's assume crypto.createHash was used there for the final stored token,
    // or we adjust. The `request-password-reset` uses bcrypt.hash.
    // So we must use bcrypt.compare by finding the user first, then their tokens.

    // Find the PasswordResetToken record. The token in the DB is hashed.
    // We cannot directly query by the raw token from the URL if the DB stores its hashed version.
    // We must iterate or fetch tokens and use bcrypt.compare. This is inefficient.
    // A better approach for request-password-reset would be to store the token selector/verifier pair
    // or ensure the token sent to user can be used to find the record.

    // Let's refine: the `request-password-reset` route generates `resetToken` (crypto.randomBytes)
    // and then `hashedToken = await hashToken(resetToken)` where `hashToken` uses bcrypt.
    // So, `PasswordResetToken.token` stores `hashedToken`.
    // The URL contains the original `resetToken`.

    // We need to find a token record where bcrypt.compare(original_token_from_url, stored_hashed_token) is true.
    // This means we have to retrieve potential tokens first.
    // This is not ideal. A common pattern is to hash the token from the URL with a secret pepper
    // or use a lookup identifier.

    // Simpler temporary approach: If we assume tokens are unique enough even after hashing,
    // we might try to hash the incoming token and find *that*.
    // This assumes `crypto.randomBytes(32).toString('hex')` fed into `bcrypt.hash` produces unique enough hashes
    // to be used as lookup keys if the original token is lost. This is not how bcrypt is designed to be used for lookups.

    // Correct approach: Fetch token records that are not expired, then iterate and use bcrypt.compare.
    const now = new Date();
    const potentialTokens = await prisma.passwordResetToken.findMany({
      where: {
        expires: {
          gt: now, // Greater than now (not expired)
        },
      },
      include: {
        user: true, // Include user data to update the password
      },
    });

    let validTokenEntry = null;
    for (const record of potentialTokens) {
      const isTokenValid = await bcrypt.compare(token, record.token);
      if (isTokenValid) {
        validTokenEntry = record;
        break;
      }
    }

    if (!validTokenEntry) {
      console.log('Invalid or expired token provided, or no match found after bcrypt.compare.');
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // Token is valid, proceed to update password
    console.log('Valid token found for user:', validTokenEntry.userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: validTokenEntry.userId },
      data: { password: hashedPassword },
    });
    console.log('User password updated successfully for user:', validTokenEntry.userId);

    // Invalidate the token by deleting it
    await prisma.passwordResetToken.delete({
      where: { id: validTokenEntry.id },
    });
    console.log('Password reset token invalidated (deleted):', validTokenEntry.id);

    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Actual password reset error:', error);
    // Generic error for security
    return NextResponse.json({ error: 'An error occurred while resetting your password. Please try again.' }, { status: 500 });
  }
} 