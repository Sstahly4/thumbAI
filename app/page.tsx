import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">
          ThumbAI: YouTube Thumbnail Generator
        </h1>
        
        <div className="bg-white/5 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate stunning YouTube thumbnails in seconds</h2>
          <p className="mb-4">Upload a sketch, add reference photos, and describe your vision. ThumbAI will generate 5 engaging, click-worthy thumbnails.</p>
          
          <div className="flex justify-center mt-6">
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium text-center"
            >
              Start Creating
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Upload or Draw</h3>
            <p>Upload a rough sketch or draw directly in our editor.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Describe Your Vision</h3>
            <p>Tell us what you want with simple text prompts.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Generate & Download</h3>
            <p>Get 5 professional thumbnails and download your favorites.</p>
          </div>
        </div>
      </div>
    </main>
  );
} 