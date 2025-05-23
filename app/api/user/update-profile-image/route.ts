import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define the allowed default profile image paths for validation
const ALLOWED_DEFAULT_IMAGES = [
  "/images/profile/Pandemic.png",
  "/images/profile/Wojak.png",
  "/images/profile/Pepe.png",
  "/images/profile/SmugPepe.png",
  "/images/profile/Soyjack.png",
  // Add paths of other default images here as you add them
  // e.g., "/images/profile/AnotherImage.png",
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (!session.user.email && !session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image: selectedImagePath } = await req.json();

    // Allow null for default avatar
    if (selectedImagePath === null) {
      const updatedUser = await prisma.user.update({
        where: session.user.id ? { id: session.user.id } : { email: session.user.email },
        data: { image: null },
        select: { image: true },
      });
      return NextResponse.json({ message: 'Profile picture reset to default', image: updatedUser.image });
    }

    if (!selectedImagePath || typeof selectedImagePath !== 'string') {
      return NextResponse.json({ error: 'Image path is required.' }, { status: 400 });
    }

    // Validate that the selected image path is one of the allowed defaults
    if (!ALLOWED_DEFAULT_IMAGES.includes(selectedImagePath)) {
      return NextResponse.json({ error: 'Invalid image path selected.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email },
      data: { image: selectedImagePath },
      select: { image: true },
    });

    return NextResponse.json({ message: 'Profile picture updated successfully', image: updatedUser.image });

  } catch (error) {
    console.error('Update profile image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 