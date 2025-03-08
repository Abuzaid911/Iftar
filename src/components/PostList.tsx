'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import DeletePostModal from './DeletePostModal'
import { toast } from 'react-hot-toast'
import ImageLightbox from './ImageLightbox'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import LoadingBar from './LoadingBar'
import PostCard from './PostCard'

// Updated TypeScript Interface for Post
type Post = {
  id: string
  imageUrls: string[] // Changed from imageUrl to imageUrls
  createdAt: string
  user: {
    name: string
    image: string | null
    email: string
  }
  _count: {
    votes: number
  }
}

export default function PostList() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ images: string[]; index: number } | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { ref, inView } = useInView()

  // Fetch posts from API
  const fetchPosts = async (pageNum = 1, append = false) => {
    if (!append) {
      setLoading(true)
    }

    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=9`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const { data } = await response.json()
      const posts = data.posts
      
      if (posts.length < 9) {
        setHasMore(false)
      }

      setPosts(prev => (append ? [...prev, ...posts] : posts))
    } catch {
      setHasMore(false) // Prevents infinite loop
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
      fetchPosts(posts.length / 9 + 1, true)
    }
  }, [inView, hasMore, isLoadingMore, loading, posts.length])

  // Handle voting
  const handleVote = async (postId: string) => {
    if (!session || votingId) return

    try {
      setVotingId(postId)
      const response = await fetch(`/api/posts/${postId}/vote`, { method: 'POST' })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error, { style: { background: '#000', color: '#EF4444' } })
        return
      }

      await fetchPosts()
    } catch {
      toast.error('Failed to vote', { style: { background: '#000', color: '#EF4444' } })
    } finally {
      setVotingId(null)
    }
  }

  // Handle post deletion
  const handleDeleteConfirm = async () => {
    if (!deletePostId || isDeleting) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/posts?id=${deletePostId}`, { 
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Post deleted successfully', { style: { background: '#000', color: '#F7B538' } })
        await fetchPosts()
      } else {
        throw new Error('Failed to delete post')
      }
    } catch {
      toast.error('Failed to delete post', { style: { background: '#000', color: '#EF4444' } })
    } finally {
      setIsDeleting(false)
      setDeletePostId(null)
    }
  }

  return (
    <>
      {(loading || isLoadingMore) && <LoadingBar />}
      {selectedImage && <ImageLightbox images={selectedImage.images} initialIndex={selectedImage.index} onClose={() => setSelectedImage(null)} />}
      <DeletePostModal isOpen={!!deletePostId} onClose={() => setDeletePostId(null)} onConfirm={handleDeleteConfirm} isDeleting={isDeleting} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => {
          const postImages = post.imageUrls.length > 0 ? post.imageUrls : ['/default-image.jpg']

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-black rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-amber-500/20 hover:-translate-y-1"
            >
              <div className="relative group cursor-pointer">
                <Image
                  src={postImages[0]}
                  alt="Iftar"
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setSelectedImage({ images: postImages, index: 0 })}
                />
                <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1">
                  <span className="text-sm font-medium text-amber-500">{post._count.votes} votes</span>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image src={post.user.image || '/default-avatar.png'} alt={post.user.name} width={32} height={32} className="rounded-full border-2 border-amber-500/20" />
                  <div>
                    <span className="font-medium text-amber-500">{post.user.name}</span>
                    <p className="text-xs text-gray-400">{format(new Date(post.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {session?.user?.email === post.user.email && (
                    <button 
                      onClick={() => setDeletePostId(post.id)} 
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  {session?.user?.email !== post.user.email && (
                    <button 
                      onClick={() => handleVote(post.id)} 
                      disabled={votingId === post.id} 
                      className="btn-vote"
                    >
                      {votingId === post.id ? 'Loving...' : 'Love'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      {hasMore && <div ref={ref} className="h-20 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div></div>}
    </>
  )
}