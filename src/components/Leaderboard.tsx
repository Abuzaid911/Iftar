'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Image from 'next/image'

type Winner = {
  id: string
  imageUrl: string | null
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
      {winners.length === 0 ? (
        <p className="text-amber-500/60 text-center">No winners yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {winners.map((winner, index) => {
            const imageUrl = winner.imageUrl?.split(',')[0] || '/default-image.jpg';

            return (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-amber-500/5 rounded-lg"
              >
                <Image
                  src={imageUrl}
                  alt={`Winner ${index + 1}`}
                  width={256}
                  height={256}
                  className="rounded-lg object-cover"
                />
                <Image
                  src={winner.user.image || '/default-avatar.png'}
                  alt={winner.user.name}
                  width={32}
                  height={32}
                  className="rounded-full border border-amber-500/20"
                />
                <div className="flex-1">
                  <span className="text-amber-500 font-medium">{winner.user.name}</span>
                  <p className="text-xs text-amber-500/60">
                    {format(new Date(winner.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-amber-500 font-bold">{winner._count.votes}</span>
                  <p className="text-xs text-amber-500/60">votes</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}