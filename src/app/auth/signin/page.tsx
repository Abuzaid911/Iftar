'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

// Fix for hydration issue with useSearchParams
function useSafeSearchParams() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<string | null>(null);

  useEffect(() => {
    setParams(searchParams.get('error'));
  }, [searchParams]);

  return params;
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const error = useSafeSearchParams();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-amber-950/30"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-8 bg-black/80 backdrop-blur-sm rounded-2xl border border-amber-500/10 shadow-xl"
      >
        <div className="text-center">
          <motion.h2 className="mt-6 text-4xl font-bold text-amber-500">Fa6oor</motion.h2>
          <motion.p className="mt-2 text-amber-500/60">Share and vote for Iftar meals</motion.p>

          {error && (
            <motion.p className="mt-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">
              {error === 'Callback' ? 'Authentication failed. Please try again.' : error}
            </motion.p>
          )}
        </div>

        <motion.div className="mt-8">
          <motion.button
            onClick={handleSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
              bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium
              hover:from-amber-400 hover:to-amber-500 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M23.5 12h22v4h-22v-4z"/>
                  <path fill="#34A853" d="M23.5 24h22v4h-22v-4z"/>
                  <path fill="#FBBC05" d="M23.5 36h22v4h-22v-4z"/>
                  <path fill="#EA4335" d="M4 24c0 2.12.56 4.12 1.6 5.88l3.2-2.6A10.4 10.4 0 019 24c0-1.52.36-2.96 1-4.28l-3.2-2.6A12.72 12.72 0 004 24z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 rounded-full border-t-transparent"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}