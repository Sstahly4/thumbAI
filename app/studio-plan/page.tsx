"use client"; // If you intend to add client-side interactions later

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function StudioPlanPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
        <Link href="/" passHref className="inline-block mb-8 text-purple-600 dark:text-purple-400 hover:underline">
          <ArrowLeft className="inline-block mr-2 h-5 w-5" />
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
          ThumbAI Studio Plan
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
          Our Studio plan is designed for agencies, enterprises, and high-volume creators 
          requiring custom solutions, dedicated support, and advanced features. 
          We tailor this plan to meet your specific needs.
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-10">
          Please contact our sales team to discuss your requirements and receive a custom quote.
        </p>
        <Link href="/contact-sales" passHref>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:text-white"
          >
            Contact Sales
          </Button>
        </Link>
      </div>
    </div>
  );
} 