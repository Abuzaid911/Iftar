// In your auth/signin/page.tsx
// Add better error handling and fallback

'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Extract error from URL if present
    const errorFromUrl = searchParams.get('error');
    if (errorFromUrl) {
      let errorMessage = 'Authentication failed';
      
      // Map error codes to user-friendly messages
      if (errorFromUrl === 'Configuration') {
        errorMessage = 'Server configuration error. Please try again later.';
      } else if (errorFromUrl === 'AccessDenied') {
        errorMessage = 'Access denied. Please try a different account.';
      } else if (errorFromUrl === 'Callback') {
        errorMessage = 'Error during sign-in process. Please try again.';
      }
      
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Log for debugging
      console.log('Starting Google sign-in...');
      
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true
      });
      
      // Note: The code below will only run if redirect: false
      router.push('/');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Your existing UI */}
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
          bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium
          hover:from-amber-400 hover:to-amber-500 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
    </div>
  );
}