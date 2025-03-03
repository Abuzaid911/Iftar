'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function Stats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    posts: 0,
    votes: 0,
    users: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to reset all stats?')) return

    try {
      const response = await fetch('/api/stats/reset', {
        method: 'DELETE',
      })

      if (response.ok) {
        setStats({ posts: 0, votes: 0, users: 0 })
      }
    } catch (error) {
      console.error('Error resetting stats:', error)
    }
  }

  return (
    <div className="relative">
      {session?.user?.email === 'your-admin-email@example.com' && (
        <motion.button
          onClick={handleDelete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute -top-2 -right-2 z-20 bg-red-500 text-white p-2 rounded-full shadow-lg 
            hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
            focus:ring-offset-black group"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 
            transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded">
            Reset Stats
          </span>
        </motion.button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-black to-amber-950/30 border border-amber-500/10 rounded-xl p-6 text-center relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative z-10">
            <span className="text-3xl mb-3 block">📸</span>
            <h3 className="text-amber-500/80 text-sm font-medium">Total Posts</h3>
            <p className="text-3xl font-bold text-amber-500 mt-2">{stats.posts}</p>
            <p className="text-xs text-amber-500/40 mt-2 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-amber-500/40 rounded-full animate-pulse" />
              Today
            </p>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-black to-amber-950/30 border border-amber-500/10 rounded-xl p-6 text-center relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative z-10">
            <span className="text-3xl mb-3 block">🔥</span>
            <h3 className="text-amber-500/80 text-sm font-medium">Total Votes</h3>
            <p className="text-3xl font-bold text-amber-500 mt-2">{stats.votes}</p>
            <p className="text-xs text-amber-500/40 mt-2 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-amber-500/40 rounded-full animate-pulse" />
              Today
            </p>
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-black to-amber-950/30 border border-amber-500/10 rounded-xl p-6 text-center relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative z-10">
            <span className="text-3xl mb-3 block">👥</span>
            <h3 className="text-amber-500/80 text-sm font-medium">Active Users</h3>
            <p className="text-3xl font-bold text-amber-500 mt-2">{stats.users}</p>
            <p className="text-xs text-amber-500/40 mt-2 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-amber-500/40 rounded-full animate-pulse" />
              Online now
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}