"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function ContactSalesPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log({ name, email, company, message });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-xl">
        <Link href="/" passHref className="inline-block mb-8 text-purple-600 dark:text-purple-400 hover:underline">
          <ArrowLeft className="inline-block mr-2 h-5 w-5" />
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-10">
          Contact Our Sales Team
        </h1>

        {submitted ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Thank You!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your message has been received. Our sales team will get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</Label>
              <Input 
                type="text" 
                name="name" 
                id="name" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="dark:bg-slate-700 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</Label>
              <Input 
                type="email" 
                name="email" 
                id="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="dark:bg-slate-700 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500"
              />
            </div>
            <div>
              <Label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company (Optional)</Label>
              <Input 
                type="text" 
                name="company" 
                id="company" 
                value={company} 
                onChange={(e) => setCompany(e.target.value)} 
                className="dark:bg-slate-700 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500"
              />
            </div>
            <div>
              <Label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Message</Label>
              <Textarea 
                name="message" 
                id="message" 
                rows={5} 
                required 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className="dark:bg-slate-700 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-500"
              />
            </div>
            <div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white dark:text-white"
                size="lg"
              >
                Send Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 