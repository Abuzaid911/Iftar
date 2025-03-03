'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import DeletePostModal from './DeletePostModal'
import { toast } from 'react-hot-toast'
import ImageLightbox from './ImageLightbox'

// Add these imports at the top
import { useInView } from 'react-intersection-observer'
import LoadingBar from './LoadingBar'
import PostShare from './PostShare'

export default function PostList() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ images: string[], index: number } | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { ref, inView } = useInView()

  const fetchPosts = async (pageNum = 1, append = false) => {
    if (!append) {
      setLoading(true)
    }
    
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=9`)
      const data = await response.json()
      
      if (data.length < 9) {
        setHasMore(false)
      }

      setPosts(prev => append ? [...prev, ...data] : data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts(1, false)
  }, [])

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !loading) {
      setIsLoadingMore(true)
      setPage(prev => prev + 1)
      fetchPosts(page + 1, true)
    }
  }, [inView, hasMore, isLoadingMore, loading, page])

  const handleVote = async (postId: string) => {
    if (!session) return
    
    try {
      setVotingId(postId)
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
      })
  
      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error, {
          style: {
            background: '#000',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.1)',
          },
        })
        return
      }
  
      await fetchPosts() // Refresh posts after voting
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to vote', {
        style: {
          background: '#000',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.1)',
        },
      })
    } finally {
      setVotingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletePostId) return
  
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/posts/${deletePostId}`, {
        method: 'DELETE',
      })
  
      if (response.ok) {
        toast.success('Post deleted successfully', {
          style: {
            background: '#000',
            color: '#F7B538',
            border: '1px solid rgba(247, 181, 56, 0.1)',
          },
          iconTheme: {
            primary: '#F7B538',
            secondary: '#000',
          },
        })
        await fetchPosts()
      } else {
        throw new Error('Failed to delete post')
      }
    } catch (_error) {
      toast.error('Failed to delete post', {
        style: {
          background: '#000',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.1)',
        },
      })
    } finally {
      setIsDeleting(false)
      setDeletePostId(null)
    }
  }

  return (
    <>
      {(loading || isLoadingMore) && <LoadingBar />}
      {selectedImage && (
        <ImageLightbox
          images={selectedImage.images}
          initialIndex={selectedImage.index}
          onClose={() => setSelectedImage(null)}
        />
      )}
      <DeletePostModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.div key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-black rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-amber-500/20 hover:-translate-y-1"
          >
            <div className="relative group cursor-pointer">
              <img
                src={post.imageUrl.split(',')[0]}
                alt="Iftar"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                onClick={() => setSelectedImage({
                  images: post.imageUrl.split(','),
                  index: 0
                })}
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-2">
                  <PostShare post={post} />
                  {session?.user?.email === post.user.email && (
                    <button
                      onClick={() => setDeletePostId(post.id)}
                      className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
                    >
                      <svg 
                        className="w-5 h-5 text-red-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {session && session.user?.email !== post.user.email && (
                <button
                  onClick={() => handleVote(post.id)}
                  disabled={votingId === post.id}
                  className="w-full mt-2 inline-flex justify-center items-center px-4 py-2 rounded-lg 
                    bg-black border border-amber-500/20 text-amber-500 font-medium text-sm transition-all duration-200 
                    hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {votingId === post.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      Love
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      )}
    </>
  )
}