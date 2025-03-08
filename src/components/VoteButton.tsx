'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoteButtonProps {
  post: {
    id: string
    _count: {
      votes: number
    }
  }
}

export default function VoteButton({ post }: VoteButtonProps) {
  const { data: session } = useSession()
  const [isVoting, setIsVoting] = useState(false)
  const [voteCount, setVoteCount] = useState(post._count.votes)

  const handleVote = async () => {
    if (!session) {
      toast.error('Please sign in to vote')
      return
    }

    try {
      setIsVoting(true)
      const res = await fetch(`/api/votes?postId=${post.id}`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to vote')
      }

      const data = await res.json()
      setVoteCount(data.voteCount)
      toast.success('Vote recorded!')
    } catch (error) {
      toast.error('Failed to vote')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={isVoting}
      className="flex items-center space-x-2 text-amber-500 hover:text-amber-400 disabled:opacity-50 transition-colors"
    >
      <Heart className={`w-5 h-5 ${isVoting ? 'animate-pulse' : ''}`} />
      <span>{voteCount}</span>
    </button>
  )
}