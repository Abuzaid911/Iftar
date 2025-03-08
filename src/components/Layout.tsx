'use client'

import { ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import MoonLogo from './MoonLogo'
import Image from 'next/image'

export default function Layout({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-secondary">
      <nav className="bg-black border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-amber-500">
                <MoonLogo />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent">
                Iftar Share
              </h1>
            </div>
            <div className="flex items-center">
              {session?.user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={session.user.image || '/default-avatar.png'}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-amber-500/20"
                    />
                    <span className="text-amber-500 font-medium">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg transition-all duration-200 
                      hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black
                      transform hover:scale-105 active:scale-95"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="bg-amber-500 text-black px-4 py-2 rounded-lg transition-all duration-200 
                    hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black
                    transform hover:scale-105 active:scale-95"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}