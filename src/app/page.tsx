"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import Layout from "@/components/Layout"
import PostList from "@/components/PostList"
import CreatePost from "@/components/CreatePost"
import DailyWinner from "@/components/DailyWinner"
import TrendingPosts from "@/components/TrendingPosts"
import Leaderboard from "@/components/Leaderboard"
import { Camera, ChevronDown } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Track scroll position for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <Layout>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#000",
            color: "#F7B538",
            border: "1px solid rgba(247, 181, 56, 0.1)",
          },
        }}
      />

      {/* Mobile floating action button for create post */}
      {isMobile && session && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-40 bg-amber-500 text-black p-4 rounded-full shadow-lg"
          onClick={() => setShowCreatePost(!showCreatePost)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showCreatePost ? <ChevronDown /> : <Camera />}
        </motion.button>
      )}

      {/* Mobile slide-up create post panel */}
      {isMobile && (
        <AnimatePresence>
          {showCreatePost && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-amber-500/20 rounded-t-xl shadow-lg p-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent">
                  Share Your Iftar Photos
                </h2>
                <button onClick={() => setShowCreatePost(false)} className="text-amber-500/60">
                  <ChevronDown />
                </button>
              </div>
              <CreatePost />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <DailyWinner />
          </motion.div>

          {/* Desktop create post (hidden on mobile) */}
          {!isMobile && status === "loading" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="animate-pulse h-32 bg-black/50 border border-amber-500/10 rounded-xl"
            />
          ) : !isMobile && session ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CreatePost />
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PostList />
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                transform: isMobile ? "none" : `translateY(${scrollPosition * 0.1}px)`,
              }}
            >
              <TrendingPosts />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{
                transform: isMobile ? "none" : `translateY(${scrollPosition * 0.05}px)`,
              }}
            >
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

