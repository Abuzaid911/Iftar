'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import ShareButtons from './ShareButtons'
import { isWinnerSelectionTime } from '@/lib/utils'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
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
}

export default function DailyWinner() {
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [timeUntilAnnouncement, setTimeUntilAnnouncement] = useState('')
  const [origin, setOrigin] = useState('')

  // Get window.location.origin safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  // Countdown effect (updates every second)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const target = new Date()
      target.setUTCHours(22, 0, 0, 0) // 10 PM GMT
      
      if (now.getUTCHours() >= 22) {
        target.setDate(target.getDate() + 1)
      }
      
      const diff = target.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilAnnouncement(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000) // Update every second
    return () => clearInterval(interval)
  }, [])

  // Fetch winner effect with cleanup to prevent memory leaks
  useEffect(() => {
    let isMounted = true
    const fetchWinner = async () => {
      try {
        if (isWinnerSelectionTime()) {
          const response = await fetch('/api/winners/daily')
          const data = await response.json()
          if (isMounted) {
            setWinner(data)
            setShowConfetti(true) // Show confetti when winner is fetched
          }
        }
      } catch (error) {
        console.error('Error fetching winner:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchWinner()
    const interval = setInterval(fetchWinner, 60000) // Check every minute

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="bg-black border border-amber-500/10 rounded-xl p-8 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    )
  }

  if (!winner) {
    return (
      <div className="bg-black border border-amber-500/10 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-amber-500 mb-2">Today&apos;s Winner</h2>
        <p className="text-amber-500/60 mb-2">Winner announcement in</p>
        <p className="text-2xl font-bold text-amber-500">{timeUntilAnnouncement}</p>
      </div>
    )
  }

  const images = winner?.imageUrl?.split(',') ?? ['/default-image.jpg'];

  return (
    <div className="relative">
      {showConfetti && 
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          colors={['#F7B538', '#FFD700', '#FFA500']}
        />
      }
      <div className="bg-black border border-amber-500/10 rounded-xl overflow-hidden hover:border-amber-500/20 transition-all duration-300">
        <div className="relative aspect-video group">
          <Image
            src={images[currentImageIndex]}
            alt="Winner"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
          <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full transform -translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-amber-500 font-bold">🏆 Today&apos;s Winner</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Image
                src={winner.user.image || '/default-avatar.png'}
                alt={winner.user.name}
                width={40}
                height={40}
                className="rounded-full border-2 border-amber-500"
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
            url={`${origin}/posts/${winner.id}`}
            title="Check out today&apos;s winning Iftar!"
          />
        </div>
      </div>
    </div>
  )
}