'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShareButtons from './ShareButtons'
import { toast } from 'react-hot-toast'

interface PostShareProps {
  post: {
    id: string
    title?: string
    description?: string
    imageUrl: string
  }
}

export default function PostShare({ post }: PostShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const shareUrl = `${window.location.origin}/posts/${post.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!', {
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
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-amber-500/10 transition-colors"
      >
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-2 p-4 bg-black/90 backdrop-blur-sm border border-amber-500/10 rounded-xl shadow-xl z-50"
          >
            <ShareButtons
              url={shareUrl}
              title="Check out this amazing Iftar post!"
              image={post.imageUrl}
              description={post.description}
            />
            <button
              onClick={handleCopyLink}
              className="mt-3 w-full px-4 py-2 text-sm text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-colors"
            >
              Copy Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}