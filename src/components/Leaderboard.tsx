'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

type Winner = {
  id: string
  imageUrl: string
  createdAt: string
  user: {
    name: string
    image: string | null
  }
  _count: {
    votes: number
  }
}

export default function Leaderboard() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch('/api/winners/history')
        const data = await response.json()
        setWinners(data)
      } catch (error) {
        console.error('Error fetching winners:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWinners()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-amber-500/10 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-black border border-amber-500/10 rounded-xl p-6">
      <h2 className="text-xl font-bold text-amber-500 mb-6">🏆 Hall of Fame</h2>
      <div className="space-y-4">
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 bg-amber-500/5 rounded-lg"
          >
            <img
              src={winner.imageUrl.split(',')[0]}
              alt={`Winner ${index + 1}`}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <img
                  src={winner.user.image || '/default-avatar.png'}
                  alt={winner.user.name}
                  className="w-6 h-6 rounded-full border border-amber-500/20"
                />
                <span className="text-amber-500 font-medium">{winner.user.name}</span>
              </div>
              <p className="text-xs text-amber-500/60">
                {format(new Date(winner.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-amber-500 font-bold">{winner._count.votes}</span>
              <p className="text-xs text-amber-500/60">votes</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}