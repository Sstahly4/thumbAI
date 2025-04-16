import Link from "next/link";

export default function CheckoutSuccess() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full bg-white/5 p-8 rounded-lg text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">
          Thank you for subscribing to ThumbAI. You now have full access to all features.
        </p>
        
        <Link
          href="/dashboard"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium mb-4"
        >
          Start Creating Thumbnails
        </Link>
        
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
} 