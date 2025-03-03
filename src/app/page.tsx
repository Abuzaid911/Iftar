'use client'

import Layout from '@/components/Layout'
import PostList from '@/components/PostList'
import CreatePost from '@/components/CreatePost'
import DailyWinner from '@/components/DailyWinner'
import TrendingPosts from '@/components/TrendingPosts'
import { useSession } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function Home() {
  const { data: session } = useSession()

  return (
    <Layout>
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <DailyWinner />
          {session && <CreatePost />}
          <PostList />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <TrendingPosts />
          </div>
        </div>
      </div>
    </Layout>
  )
}