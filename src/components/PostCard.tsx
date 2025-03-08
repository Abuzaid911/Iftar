'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import VoteButton from './VoteButton'
import PostShare from './PostShare'

interface PostCardProps {
  post: {
    id: string
    imageUrl: string
    createdAt: string
    user: {
      name: string
      image: string | null
    }
    _count: {
      votes: number
    }
  }
  compact?: boolean
}

export default function PostCard({ post, compact = false }: PostCardProps) {
  const { data: session } = useSession()
  const images = post.imageUrl.split(',')
  
  if (compact) {
    return (
      <motion.div
        className="bg-black/50 rounded-xl overflow-hidden h-24"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex h-full">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={images[0]}
              alt="Iftar photo"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-2">
              {post.user.image && (
                <Image
                  src={post.user.image}
                  alt={post.user.name || 'User'}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-gray-300">{post.user.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{post._count.votes} votes</span>
              <span>•</span>
              <span>{format(new Date(post.createdAt), 'MMM d')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-black/20 rounded-xl border border-amber-500/10 overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={images[0]}
          alt="Iftar post"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {post.user.image && (
              <Image
                src={post.user.image}
                alt={post.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-amber-500">{post.user.name}</span>
          </div>
          <span className="text-amber-500/60 text-sm">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <VoteButton post={post} />
          <PostShare post={post} />
        </div>
      </div>
    </div>
  )
}