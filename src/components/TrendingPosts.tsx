'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

export default function TrendingPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredPost, setHoveredPost] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/posts/trending')
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black border border-amber-500/10 rounded-xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2 mb-6">
          <span className="inline-block w-6 h-6 bg-amber-500/10 rounded-full animate-pulse"></span>
          <div className="h-8 bg-amber-500/10 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-24 h-24 bg-amber-500/10 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-amber-500/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-amber-500/10 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-amber-500/10 rounded-xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-500 flex items-center">
          <span className="mr-2">🔥</span>
          Trending Today
        </h2>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-xs text-amber-500/60 bg-amber-500/10 px-2 py-1 rounded-full"
        >
          Live
        </motion.div>
      </div>
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {posts.map((post: any, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredPost(post.id)}
              onHoverEnd={() => setHoveredPost(null)}
              className="flex space-x-4 group cursor-pointer rounded-lg p-2 transition-colors hover:bg-amber-500/5"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <motion.img
                  src={post.imageUrl.split(',')[0]}
                  alt=""
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPost === post.id ? 1 : 0.8 }}
                  className="absolute bottom-2 right-2 text-xs font-medium bg-black/70 backdrop-blur-sm text-amber-500 px-2 py-1 rounded-full flex items-center space-x-1"
                >
                  <span>{post._count.votes}</span>
                  <motion.span
                    animate={{ scale: hoveredPost === post.id ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    🔥
                  </motion.span>
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <img
                      src={post.user.image || '/default-avatar.png'}
                      alt={post.user.name}
                      className="w-6 h-6 rounded-full border border-amber-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-black"></div>
                  </div>
                  <span className="text-sm font-medium text-amber-500/90 truncate">
                    {post.user.name}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-xs text-amber-500/60">
                  <span>{format(new Date(post.createdAt), 'h:mm a')}</span>
                  <span>•</span>
                  <span>#{index + 1} Trending</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}