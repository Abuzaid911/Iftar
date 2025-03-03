'use client'

import { motion } from 'framer-motion'

export default function Stats() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-black border border-amber-500/10 rounded-xl p-4 text-center"
      >
        <h3 className="text-amber-500/60 text-sm">Total Posts</h3>
        <p className="text-2xl font-bold text-amber-500 mt-1">24</p>
        <p className="text-xs text-amber-500/40 mt-1">Today</p>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-black border border-amber-500/10 rounded-xl p-4 text-center"
      >
        <h3 className="text-amber-500/60 text-sm">Total Votes</h3>
        <p className="text-2xl font-bold text-amber-500 mt-1">142</p>
        <p className="text-xs text-amber-500/40 mt-1">Today</p>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-black border border-amber-500/10 rounded-xl p-4 text-center"
      >
        <h3 className="text-amber-500/60 text-sm">Active Users</h3>
        <p className="text-2xl font-bold text-amber-500 mt-1">18</p>
        <p className="text-xs text-amber-500/40 mt-1">Online now</p>
      </motion.div>
    </div>
  )
}