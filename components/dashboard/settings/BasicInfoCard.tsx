'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NextImage from 'next/image';
import { Loader2 } from 'lucide-react';

// Temporary interface for session user, matching what's in settings/page.tsx
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  planType?: string | null;
}

interface ExtendedSession {
  user?: ExtendedUser | null;
  expires: string;
}

const DEFAULT_PROFILE_PICS = [
  { name: "Pandemic", path: "/images/profile/Pandemic.png" },
  // Add more default images here in the future
];

export default function BasicInfoCard() {
  const { data: session, update } = useSession();
  const extendedSession = session as ExtendedSession | null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentImage, setCurrentImage] = useState<string | undefined | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(session?.user?.image || null);
  const [pendingImageUpdate, setPendingImageUpdate] = useState<string | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showImageSelection, setShowImageSelection] = useState(false);

  const [isNameLoading, setIsNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccessMessage, setNameSuccessMessage] = useState<string | null>(null);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccessMessage, setImageSuccessMessage] = useState<string | null>(null);

  const defaultImages = [
    "/images/profile/Pandemic.png",
    "/images/profile/Wojak.png",
    "/images/profile/Pepe.png",
    "/images/profile/SmugPepe.png",
    "/images/profile/Soyjack.png",
  ];

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    if (session?.user?.image) {
      setSelectedImagePreview(session.user.image || null); // Ensure undefined becomes null
    }
  }, [session]);

  useEffect(() => {
    setCurrentImage(session?.user?.image ?? null);
  }, [session?.user?.image]);

  const getInitials = (nameStr: string, emailStr: string) => {
    return (nameStr ? nameStr.split(' ').map(n => n[0]).join('') : (emailStr && emailStr !== 'Not available' ? emailStr[0] : '')).toUpperCase();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(null);
    setNameSuccessMessage(null);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    setIsNameLoading(true);
    setNameError(null);
    setNameSuccessMessage(null);

    try {
      const response = await fetch('/api/user/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update name.");
      }

      setNameSuccessMessage("Name updated successfully!");
      await update();
      
    } catch (err: any) {
      setNameError(err.message || "An unexpected error occurred.");
    } finally {
      setIsNameLoading(false);
    }
  };

  const handleSelectDefaultImage = (imagePath: string) => {
    setSelectedImagePreview(imagePath);
    setPendingImageUpdate(imagePath);
    setShowImageSelector(false);
    setImageError(null);
    setImageSuccessMessage(null);
  };

  const handleSaveImage = async () => {
    if (pendingImageUpdate === currentImage) return;
    setIsImageLoading(true);
    setImageError(null);
    setImageSuccessMessage(null);
    try {
      const response = await fetch('/api/user/update-profile-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: pendingImageUpdate }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile picture.");
      }

      setImageSuccessMessage("Profile picture updated successfully!");
      await update();
      setPendingImageUpdate(null);
    } catch (err: any) {
      setImageError(err.message || "An unexpected error occurred updating image.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const originalName = extendedSession?.user?.name || "";
  const nameHasChanged = name !== originalName;
  const imageHasChanged = pendingImageUpdate !== null && pendingImageUpdate !== currentImage;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Basic Information</h2>
      
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="relative group">
          <Avatar className="h-24 w-24">
            <AvatarImage src={selectedImagePreview || session?.user?.image || undefined} alt={session?.user?.name || "User"} />
            <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full bg-background hover:bg-muted"
            onClick={() => setShowImageSelection(!showImageSelection)}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>

        {showImageSelection && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Select a new profile picture:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {(() => {
                const selected = pendingImageUpdate !== null && pendingImageUpdate !== undefined ? pendingImageUpdate : currentImage;
                return (
                  <>
                    <div
                      className={`w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 ${selected === null ? "border-primary" : "border-transparent"} hover:border-primary/50 transition-all flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700`}
                      onClick={() => {
                        setSelectedImagePreview(null);
                        setPendingImageUpdate(null);
                      }}
                    >
                      <div className="w-20 h-20 flex items-center justify-center">
                        <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      </div>
                      <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">Default</span>
                    </div>
                    {defaultImages.map((imgPath) => (
                      <div
                        key={imgPath}
                        className={`w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 ${selected === imgPath ? "border-primary" : "border-transparent"} hover:border-primary/50 transition-all flex items-center justify-center`}
                        onClick={() => {
                          setSelectedImagePreview(imgPath);
                          setPendingImageUpdate(imgPath);
                        }}
                      >
                        <NextImage
                          src={imgPath}
                          alt={imgPath.split("/").pop()?.split(".")[0] || "Profile image"}
                          width={80}
                          height={80}
                          className="object-cover aspect-square"
                        />
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
            {(pendingImageUpdate !== currentImage) && (
              <Button onClick={handleSaveImage} className="mt-4" disabled={isImageLoading}>
                {isImageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Picture
              </Button>
            )}
          </div>
        )}
        {imageError && <p className="text-sm text-red-500 text-center">{imageError}</p>}
        {imageSuccessMessage && <p className="text-sm text-green-500 text-center">{imageSuccessMessage}</p>}
      </div>
      
      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
            <p className="text-lg font-medium text-gray-800 dark:text-white mr-2">{name || "Set your name"}</p>
            {email && <p className="text-sm text-gray-500 dark:text-gray-400">({email})</p>}
        </div>
        <div>
          <Label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
          <Input 
            type="text" 
            name="profileName" 
            id="profileName" 
            value={name} 
            onChange={handleNameChange}
            placeholder="Enter your name"
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <Label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
          <Input 
            type="email" 
            name="profileEmail" 
            id="profileEmail" 
            disabled 
            value={email}
            className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
        {nameError && <p className="text-sm text-red-500">{nameError}</p>}
        {nameSuccessMessage && <p className="text-sm text-green-500">{nameSuccessMessage}</p>}
        {nameHasChanged && (
          <Button 
            onClick={handleSaveName} 
            disabled={isNameLoading || !name.trim()}
            className="mt-2 w-full sm:w-auto"
          >
            {isNameLoading ? "Saving Name..." : "Save Name"}
          </Button>
        )}
      </div>
    </div>
  );
} 