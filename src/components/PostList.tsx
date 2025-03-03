'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function PostList() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (postId: string) => {
    if (!session) return
    
    try {
      setVotingId(postId)
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error)
        return
      }

      await fetchPosts() // Refresh posts after voting
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post: any, index: number) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-black rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-amber-500/20 hover:-translate-y-1"
        >
          <div className="relative group cursor-pointer">
            <img
              src={post.imageUrl.split(',')[0]}
              alt="Iftar"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="text-sm font-medium text-amber-500">
                {post._count.votes}
              </span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={post.user.image || '/default-avatar.png'}
                alt={post.user.name}
                className="w-8 h-8 rounded-full border-2 border-amber-500/20"
              />
              <div>
                <span className="font-medium text-amber-500">{post.user.name}</span>
                <p className="text-xs text-gray-400">
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            {session && session.user?.email !== post.user.email && (
              <button
                onClick={() => handleVote(post.id)}
                disabled={votingId === post.id}
                className="w-full mt-2 inline-flex justify-center items-center px-4 py-2 rounded-lg bg-amber-500 text-black font-medium text-sm transition-all duration-200 
                  hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black
                  disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {votingId === post.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Voting...
                  </>
                ) : (
                  'Vote'
                )}
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}