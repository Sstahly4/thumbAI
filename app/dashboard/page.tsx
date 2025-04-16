"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";

export default function Dashboard() {
  const [sketch, setSketch] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleSketchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSketch(e.target.files[0]);
    }
  };

  const handleReferenceImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReferenceImages(Array.from(e.target.files));
    }
  };

  const handleGenerate = async () => {
    if (!sketch && !prompt) {
      setError("Please upload a sketch or provide a prompt");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const formData = new FormData();
      if (sketch) formData.append("sketch", sketch);
      referenceImages.forEach((img, i) => {
        formData.append(`reference${i}`, img);
      });
      formData.append("prompt", prompt);

      const response = await axios.post("/api/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setThumbnails(response.data.thumbnails);
    } catch (err) {
      console.error(err);
      setError("Failed to generate thumbnails. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `thumbai-${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">ThumbAI Dashboard</h1>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Thumbnail</h2>
            
            {error && (
              <div className="bg-red-500/20 text-red-200 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">Upload Sketch (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSketchUpload}
                className="w-full p-2 bg-white/10 rounded-md"
              />
              {sketch && (
                <div className="mt-2 text-sm text-gray-400">
                  Uploaded: {sketch.name}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">Reference Images (Optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleReferenceImagesUpload}
                className="w-full p-2 bg-white/10 rounded-md"
              />
              {referenceImages.length > 0 && (
                <div className="mt-2 text-sm text-gray-400">
                  Uploaded: {referenceImages.length} image(s)
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">Describe Your Thumbnail</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want in your thumbnail..."
                className="w-full p-3 bg-white/10 rounded-md h-32"
              ></textarea>
              <p className="text-sm text-gray-400 mt-1">
                Be specific about colors, style, emotions, and text you want to include.
              </p>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white p-3 rounded-md font-medium"
            >
              {isGenerating ? "Generating..." : "Generate Thumbnails"}
            </button>
          </div>
          
          <div className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            
            {thumbnails.length === 0 ? (
              <div className="flex items-center justify-center h-80 bg-white/10 rounded-lg">
                <p className="text-gray-400">
                  {isGenerating ? "Generating thumbnails..." : "Your thumbnails will appear here"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {thumbnails.map((thumbnail, i) => (
                  <div key={i} className="relative group">
                    <div className="aspect-video relative overflow-hidden rounded-md">
                      <Image 
                        src={thumbnail} 
                        alt={`Thumbnail ${i + 1}`} 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleDownload(thumbnail, i)}
                      className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 