'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import ShareButtons from './ShareButtons'

export default function DailyWinner() {
  const [winner, setWinner] = useState<{
    id: string;
    imageUrl: string;
    createdAt: string;
    user: {
      name: string;
      image: string | null;
    };
    _count: {
      votes: number;
    };
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        const response = await fetch('/api/winners/daily')
        const data = await response.json()
        setWinner(data)
      } catch (error) {
        console.error('Error fetching winner:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWinner()
    const interval = setInterval(fetchWinner, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black border border-amber-500/10 rounded-xl p-8 text-center"
      >
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </motion.div>
    )
  }

  if (!winner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black border border-amber-500/10 rounded-xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Today's Winner</h2>
        <p className="text-amber-500/60">No posts yet today!</p>
      </motion.div>
    )
  }

  const images = winner.imageUrl.split(',')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-amber-500/10 rounded-xl overflow-hidden"
    >
      <div className="relative aspect-video">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt="Winner"
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-amber-500' : 'bg-amber-500/30'
                }`}
              />
            ))}
          </div>
        )}
        <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-amber-500 font-bold">🏆 Today's Winner</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={winner.user.image || '/default-avatar.png'}
              alt={winner.user.name}
              className="w-10 h-10 rounded-full border-2 border-amber-500"
            />
            <div>
              <h3 className="font-medium text-amber-500">{winner.user.name}</h3>
              <p className="text-xs text-amber-500/60">
                {format(new Date(winner.createdAt), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-amber-500">
              {winner._count.votes} votes
            </span>
          </div>
        </div>
        <ShareButtons
          url={`${window.location.origin}/posts/${winner.id}`}
          title="Check out today's winning Iftar!"
        />
      </div>
    </motion.div>
  )
}