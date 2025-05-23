"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import DrawingCanvas from "../components/DrawingCanvas";
import LoadingSpinner from "../components/LoadingSpinner";
import AspectRatioImage from "../components/AspectRatioImage";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import NewUserSubscriptionRedirector from '@/components/auth/NewUserSubscriptionRedirector';
import { ArrowLeft, CheckCircle, ImageIcon, User, Zap, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "next-auth";

// Fallback thumbnails in case of errors or timeout
const FALLBACK_THUMBNAILS = [
  "https://placehold.co/1280x720/3b82f6/FFFFFF/png?text=Generation+Timeout+1",
  "https://placehold.co/1280x720/ef4444/FFFFFF/png?text=Generation+Timeout+2",
  "https://placehold.co/1280x720/22c55e/FFFFFF/png?text=Generation+Timeout+3",
  "https://placehold.co/1280x720/f59e0b/FFFFFF/png?text=Generation+Timeout+4",
  "https://placehold.co/1280x720/8b5cf6/FFFFFF/png?text=Generation+Timeout+5",
];

// Polling constants
const POLLING_INTERVAL_MS = 3000; // Check every 3 seconds
const POLLING_TIMEOUT_MS = 120000; // Give up after 2 minutes

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() as { 
    data: Session | null, 
    status: "loading" | "authenticated" | "unauthenticated" 
  };

  const [email, setEmail] = useState<string | null>(null);
  const [sketch, setSketch] = useState<File | null>(null);
  const [sketchDataUrl, setSketchDataUrl] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "draw">("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  
  const pollJobStatus = useRef<NodeJS.Timeout | null>(null);
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    return () => {
      if (pollJobStatus.current) {
        clearInterval(pollJobStatus.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (jobId && pollingActive) {
      if (pollJobStatus.current) {
        clearInterval(pollJobStatus.current);
      }
      
      const interval = setInterval(async () => {
        try {
          const now = Date.now();
          
          if (pollingStartTime && now - pollingStartTime > POLLING_TIMEOUT_MS) {
            clearInterval(interval);
            setPollingActive(false);
            setError("Generation timed out. Please try again.");
            setThumbnails(FALLBACK_THUMBNAILS);
            return;
          }
          
          const response = await axios.get(`/api/status?jobId=${jobId}`);
          
          if (response.data && response.data.status) {
            const status = response.data.status;
            
            if (status === 'completed' && response.data.thumbnails && response.data.thumbnails.length > 0) {
              setThumbnails(response.data.thumbnails);
              setError("");
              setPollingActive(false);
              clearInterval(interval);
            } else if (status === 'failed') {
              const errorMessage = response.data.error || "Generation failed. Please try again.";
              setError(`Error: ${errorMessage}`);
              setThumbnails(response.data.thumbnails || FALLBACK_THUMBNAILS);
              setPollingActive(false);
              clearInterval(interval);
            } else if (status === 'pending') {
              const waitMessage = response.data.message || "Waiting for the thumbnail to be generated...";
              setError(`Waiting: ${waitMessage}`);
            }
          }
        } catch (pollError) {
          console.error("Error polling for job status:", pollError);
        }
      }, POLLING_INTERVAL_MS);
      
      pollJobStatus.current = interval;
    }
  }, [jobId, pollingActive, pollingStartTime]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pendingSignupEmail");
    setEmail(storedEmail);

    if (session) {
      sessionStorage.removeItem("pendingSignupEmail");
      sessionStorage.removeItem("pendingSignupPassword");
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    // Adjust textarea height on initial load if there's already prompt text
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [promptText]); // Rerun when promptText changes externally too

  const handlePromptInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
    // Auto-adjust height
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto"; // Reset height to shrink if needed
      textAreaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleGenerate = async () => {
    if (!promptText) {
      setError("Please provide a prompt for your thumbnail");
      return;
    }
    if (isGenerating) return;

    setError("");
    setIsGenerating(true);
    setThumbnails([]);
    
    setJobId(null);
    setPollingActive(false);
    if (pollJobStatus.current) {
      clearInterval(pollJobStatus.current);
      pollJobStatus.current = null;
    }

    try {
      const formData = new FormData();
      if (sketch) formData.append("sketch", sketch);
      referenceImages.forEach((img, i) => {
        formData.append(`reference${i}`, img);
      });
      formData.append("prompt", promptText);
      if (session?.user?.email) formData.append("userEmail", session.user.email);

      setError("Generation started! This may take up to 25 seconds...");

      const response = await axios.post("/api/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      if (response.data.status === 'completed' && response.data.thumbnails && response.data.thumbnails.length > 0) {
        setThumbnails(response.data.thumbnails);
        setError("");
      } else if (response.data.status === 'pending' && response.data.jobId) {
        setJobId(response.data.jobId);
        setPollingActive(true);
        setPollingStartTime(Date.now());
        setError(`Waiting: ${response.data.message || "Processing your request..."}`);
        
        setThumbnails(response.data.thumbnails || FALLBACK_THUMBNAILS);
      } else if (response.data.status === 'failed') {
        const errorMessage = response.data.error || "Generation failed. Please try again.";
        setError(`Error: ${errorMessage}`);
        setThumbnails(response.data.thumbnails || FALLBACK_THUMBNAILS);
      } else {
        setError("Unexpected response from server. Please try again.");
        setThumbnails(FALLBACK_THUMBNAILS);
      }
    } catch (err: any) {
      console.error("Error generating thumbnails:", err);
      let errorMessage = "Failed to generate thumbnails. Please try again.";
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = "Request timed out. Generation is taking longer than expected.";
        } else {
          errorMessage = `Error: ${err.response?.data?.error || err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setThumbnails(FALLBACK_THUMBNAILS);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSketch(file);
      setSketchDataUrl(URL.createObjectURL(file));
    }
  };

  const handleReferenceImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReferenceImages(Array.from(e.target.files));
    }
  };

  const handleSketchCreated = (dataUrl: string) => {
    setSketchDataUrl(dataUrl);
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "sketch.png", { type: "image/png" });
        setSketch(file);
      });
  };

  const handleEnhancePrompt = async () => {
    if (!promptText.trim()) {
      setError("Please enter a prompt to enhance.");
      return;
    }
    setIsEnhancing(true);
    setError("");
    try {
      const response = await axios.post("/api/enhance-prompt", { prompt: promptText });
      if (response.data.enhancedPrompt) {
        setPromptText(response.data.enhancedPrompt);
      } else {
        setError(response.data.error || "Failed to enhance prompt. No enhanced prompt received.");
      }
    } catch (err: any) {
      console.error("Error enhancing prompt:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "Failed to enhance prompt. Please try again.");
      } else {
        setError("Failed to enhance prompt. Please try again.");
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      setError("");
      
      const loadImage = (url: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = document.createElement('img');
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
          img.src = url;
        });
      };
      
      const img = await loadImage(imageUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const aspectRatio = img.width / img.height;
      let drawWidth, drawHeight, drawX, drawY;
      
      if (aspectRatio > 16/9) {
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `thumbnail-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (err) {
      console.error('Error downloading image:', err);
      setError("Failed to download image. Please try again.");
    }
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "authenticated" && session) {
    const userImage = session.user?.image;
    const userName = session.user?.name;
    const userEmail = session.user?.email;
    const planType = session.user?.planType;
    const initials = (userName ? userName.split(' ').map((n: string) => n[0]).join('') : (userEmail ? userEmail[0] : '')).toUpperCase();

    return (
      <>
        <NewUserSubscriptionRedirector />
        {planType !== 'pending_subscription' && (
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center p-4 md:p-6">
            <header className="w-full max-w-[95%] mb-8 flex justify-between items-center">
              <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Thumbnail Dashboard</h1>
                <p className="text-base text-gray-600 dark:text-gray-400">Welcome, {userName || userEmail || 'User'}!</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/settings" passHref>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  {userImage && <AvatarImage src={userImage} alt={userName || userEmail || "User"} />}
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
            <Button onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</Button>
          </div>
      </header>

        {/* Main dashboard grid */}
            <div className="w-full max-w-[95%] grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Column 1: Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">1. Provide Input</h2>
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button onClick={() => setActiveTab("upload")} className={`py-2 px-4 text-base ${activeTab === "upload" ? "border-b-2 border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"} focus:outline-none`}>Upload Sketch</button>
                    <button onClick={() => setActiveTab("draw")} className={`py-2 px-4 text-base ${activeTab === "draw" ? "border-b-2 border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"} focus:outline-none`}>Draw Sketch</button>
            </div>
              {activeTab === "upload" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Sketch (Optional)</label>
                  <input type="file" onChange={handleSketchUpload} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 dark:file:bg-purple-700 file:text-purple-700 dark:file:text-purple-200 hover:file:bg-purple-100 dark:hover:file:bg-purple-600" />
                  {sketchDataUrl && <img src={sketchDataUrl} alt="Sketch preview" className="mt-2 max-h-40 rounded" />}
                </div>
              )}
              {activeTab === "draw" && <DrawingCanvas onSketchCreated={handleSketchCreated} />}
                </div>
                
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Upload Reference Images (Optional, up to 3)</label>
              <input type="file" multiple onChange={handleReferenceImagesUpload} accept="image/*" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 dark:file:bg-purple-700 file:text-purple-700 dark:file:text-purple-200 hover:file:bg-purple-100 dark:hover:file:bg-purple-600" />
              </div>
              
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">2. Describe Your Thumbnail</h2>
                      <div className="relative">
                        <label htmlFor="prompt" className="block text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Enter Your Prompt</label>
                        <textarea 
                          ref={textAreaRef}
                          value={promptText} 
                          onChange={handlePromptInput} 
                          placeholder="e.g., A surprised cat reacts to a giant ball of yarn..." 
                          rows={4}
                          className="w-full p-3 pr-12 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 transition-shadow shadow-sm hover:shadow-md resize-none overflow-y-hidden focus:outline-none focus:bg-gray-50 dark:focus:bg-slate-600 focus:border-gray-400 dark:focus:border-slate-500"
                          style={{ minHeight: 'calc(1.5em * 4 + 1.5rem)' }}
                        />
                        <Button
                          onClick={handleEnhancePrompt}
                          disabled={isEnhancing || !promptText.trim()}
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-3 right-3 h-8 w-8 rounded-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-600/70 dark:shadow-purple-400/70 dark:hover:shadow-purple-300/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-700 transition-all duration-150 ease-in-out transform hover:scale-110"
                          aria-label="Enhance Prompt"
                        >
                          {isEnhancing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Zap className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      {error.includes("prompt") && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
                <Button onClick={handleGenerate} disabled={isGenerating || !promptText} className="w-full py-3 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-400 dark:hover:to-pink-400 text-white dark:text-white disabled:opacity-50 rounded-lg mt-6">
              {isGenerating ? <LoadingSpinner /> : "Generate Thumbnails"}
            </Button>
            {error && !isGenerating && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                      </div>
                      
          {/* Column 2: Results */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[500px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">3. Your Thumbnails</h2>
            {(isGenerating && !thumbnails.length && !error) && (
                  <div className="flex justify-center items-center h-80">
                    <LoadingSpinner /><p className="ml-3 text-base text-gray-600 dark:text-gray-400">Generating, please wait...</p>
                        </div>
            )}
            {error && isGenerating && (
                   <div className="flex justify-center items-center h-80">
                      <LoadingSpinner /><p className="ml-3 text-yellow-500 dark:text-yellow-400">{error}</p>
                        </div>
            )}
            {!isGenerating && !thumbnails.length && !error && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-base">Your generated thumbnails will appear here.</p>
                      </div>
            )}
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {thumbnails.map((src, index) => (
                  <div key={index} className="group relative">
                    <AspectRatioImage src={src} alt={`Generated Thumbnail ${index + 1}`} />
                    <Button onClick={() => handleDownload(src, index)} size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/75 text-white">Download</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </>
    );
  }
} 