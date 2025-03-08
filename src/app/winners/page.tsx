'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Winner {
  id: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
  _count: {
    votes: number;
  };
  badge?: string;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<{
    daily: Winner[];
    weekly: Winner[];
    monthly: Winner[];
    allTime: Winner[];
  }>({
    daily: [],
    weekly: [],
    monthly: [],
    allTime: []
  })

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await fetch('/api/winners')
        const data = await response.json()
        setWinners(data)
      } catch (error) {
        console.error('Failed to fetch winners:', error)
      }
    }
    fetchWinners()
  }, [])

  return (
    <Layout>
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6">🏆 Hall of Fame</h2>
          {winners.allTime.length === 0 ? (
            <p className="text-gray-500">No winners yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.allTime.map((winner) => {
                const imageUrl = winner.imageUrl?.split(',')[0] || '/default-image.jpg'
                return (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <Image
                      src={imageUrl}
                      alt="Winner"
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="flex items-center space-x-3 mb-2">
                      <Image
                        src={winner.user.image || '/default-avatar.png'}
                        alt={winner.user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border border-amber-500/20"
                      />
                      <div>
                        <p className="font-medium">{winner.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(winner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {winner.badge && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                          {winner.badge}
                        </span>
                      )}
                      <span className="text-gray-600">
                        {winner._count.votes} votes
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}