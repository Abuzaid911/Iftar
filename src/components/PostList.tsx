"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import DeletePostModal from "./DeletePostModal"
import { toast } from "react-hot-toast"
import ImageLightbox from "./ImageLightbox"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import LoadingBar from "./LoadingBar"
import { Heart, Trash2, ImageIcon } from "lucide-react"

// Updated TypeScript Interface for Post
// Update the Post type to include optional imageUrl
type Post = {
  id: string
  imageUrls: string[]
  imageUrl?: string  // Add this line
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
  const [error, setError] = useState<string | null>(null)
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Fetch posts from API with improved error handling
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    if (!append) {
      setLoading(true)
      setError(null)
    }

    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=9&excludeHistory=true`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const responseData = await response.json()

      // Handle different response formats
      let postsData: Post[] = []
      if (Array.isArray(responseData)) {
        postsData = responseData
      } else if (responseData.data && responseData.data.posts) {
        postsData = responseData.data.posts
      } else if (responseData.posts) {
        postsData = responseData.posts
      }

      // Ensure imageUrls is always an array
      // Update the data transformation logic
      postsData = postsData.map((post) => ({
        ...post,
        imageUrls: Array.isArray(post.imageUrls) 
          ? post.imageUrls 
          : (post.imageUrl || '').split(',').filter(Boolean)
      }))

      if (postsData.length < 9) {
        setHasMore(false)
      }

      setPosts((prev) => (append ? [...prev, ...postsData] : postsData))
    } catch (error) {
      console.error("Error fetching posts:", error)
      setError(error instanceof Error ? error.message : "Failed to load posts")
      setHasMore(false)

      if (!append) {
        setPosts([])
      }

      toast.error("Failed to load posts", {
        style: { background: "#000", color: "#EF4444" },
      })
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchPosts(1, false)
  }, [fetchPosts])

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore && !loading) {
      setIsLoadingMore(true)
      const nextPage = Math.ceil(posts.length / 9) + 1
      fetchPosts(nextPage, true)
    }
  }, [inView, hasMore, isLoadingMore, loading, posts.length, fetchPosts])

  // Handle voting with optimistic UI update
  const handleVote = useCallback(
    async (postId: string) => {
      if (!session || votingId) return

      try {
        setVotingId(postId)

        // Optimistic update
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _count: {
                    votes: post._count.votes + 1,
                  },
                }
              : post,
          ),
        )

        const response = await fetch(`/api/posts/${postId}/vote`, { method: "POST" })

        if (!response.ok) {
          // Revert optimistic update on error
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    _count: {
                      votes: post._count.votes - 1,
                    },
                  }
                : post,
            ),
          )

          const errorData = await response.json().catch(() => ({}))
          toast.error(errorData.error || "Failed to vote", {
            style: { background: "#000", color: "#EF4444" },
          })
          return
        }

        toast.success("Vote added!", {
          style: { background: "#000", color: "#F7B538" },
          icon: "❤️",
        })
      } catch (error) {
        // Revert optimistic update on error
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _count: {
                    votes: post._count.votes - 1,
                  },
                }
              : post,
          ),
        )

        toast.error("Failed to vote", {
          style: { background: "#000", color: "#EF4444" },
        })
      } finally {
        setVotingId(null)
      }
    },
    [session, votingId],
  )

  // Handle post deletion
  const handleDeleteConfirm = useCallback(async () => {
    if (!deletePostId || isDeleting) return

    try {
      setIsDeleting(true)

      // Optimistic UI update
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== deletePostId))

      const response = await fetch(`/api/posts?id=${deletePostId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Post deleted successfully", {
          style: { background: "#000", color: "#F7B538" },
        })
      } else {
        // Revert on error by refetching
        await fetchPosts()
        throw new Error("Failed to delete post")
      }
    } catch (error) {
      toast.error("Failed to delete post", {
        style: { background: "#000", color: "#EF4444" },
      })
      // We already refetched posts above on error
    } finally {
      setIsDeleting(false)
      setDeletePostId(null)
    }
  }, [deletePostId, isDeleting, fetchPosts])

  // Open image lightbox
  const openLightbox = useCallback((post: Post, index = 0) => {
    const images = post.imageUrls.length > 0 ? post.imageUrls : ["/default-image.jpg"]
    setSelectedImage({ images, index })
  }, [])

  // Empty state
  if (!loading && posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/50 border border-amber-500/10 rounded-xl p-8 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-amber-500/50" />
        </div>
        <h3 className="text-xl font-bold text-amber-500 mb-2">No Posts Yet</h3>
        <p className="text-amber-500/60 mb-6">
          {error ? `Error: ${error}` : "Be the first to share your Iftar photos!"}
        </p>
        {session && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-4 py-2 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 transition-colors"
          >
            Share Photos
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <>
      {(loading || isLoadingMore) && <LoadingBar />}

      <AnimatePresence>
        {selectedImage && (
          <ImageLightbox
            images={selectedImage.images}
            initialIndex={selectedImage.index}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <DeletePostModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {posts.map((post, index) => {
            const postImages = post.imageUrls.length > 0 ? post.imageUrls : ["/default-image.jpg"]
            const isOwner = session?.user?.email === post.user.email

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                className="bg-black border border-amber-500/10 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-amber-500/20 hover:-translate-y-1"
                layout
              >
                <div className="relative group">
                  <div className="cursor-zoom-in" onClick={() => openLightbox(post)}>
                    <Image
                      src={postImages[0] || "/placeholder.svg"}
                      alt="Iftar"
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Multiple images indicator */}
                  {postImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {postImages.map((_, imgIndex) => (
                        <button
                          key={imgIndex}
                          onClick={() => openLightbox(post, imgIndex)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            imgIndex === 0 ? "bg-amber-500" : "bg-amber-500/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Vote count badge */}
                  <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-amber-500 mr-1" fill={post._count.votes > 0 ? "#F7B538" : "none"} />
                    <span className="text-sm font-medium text-amber-500">{post._count.votes}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={post.user.image || "/default-avatar.png"}
                        alt={post.user.name}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-amber-500/20"
                      />
                      <div>
                        <span className="font-medium text-amber-500">{post.user.name}</span>
                        <p className="text-xs text-amber-500/60">{format(new Date(post.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-amber-500/60">
                      {postImages.length > 1 ? `${postImages.length} photos` : "1 photo"}
                    </div>

                    <div className="flex gap-2">
                      {isOwner ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeletePostId(post.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="text-xs">Delete</span>
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleVote(post.id)}
                          disabled={votingId === post.id}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
                            votingId === post.id
                              ? "bg-amber-500/50 text-black cursor-not-allowed"
                              : "bg-amber-500 text-black hover:bg-amber-400"
                          }`}
                        >
                          <Heart className="w-3 h-3" fill="currentColor" />
                          <span className="text-xs font-medium">{votingId === post.id ? "Loving..." : "Love"}</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={ref} className="h-24 flex items-center justify-center mt-8">
          {isLoadingMore && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-2"></div>
              <span className="text-xs text-amber-500/60">Loading more posts...</span>
            </div>
          )}
        </div>
      )}

      {/* End of posts message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-amber-500/60">
          <p>You've reached the end of the feed</p>
        </div>
      )}
    </>
  )
}

