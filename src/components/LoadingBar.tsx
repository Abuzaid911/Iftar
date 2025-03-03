'use client'

import { motion } from 'framer-motion'

export default function LoadingBar() {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-amber-500/20 z-50"
      initial={{ scaleX: 0, transformOrigin: '0%' }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="absolute top-0 left-0 bottom-0 bg-amber-500"
        initial={{ scaleX: 0, transformOrigin: '0%' }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1 }}
      />
    </motion.div>
  )
}