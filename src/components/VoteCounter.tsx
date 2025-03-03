import { motion, AnimatePresence } from 'framer-motion'

export default function VoteCounter({ count }: { count: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-amber-500"
      >
        {count} votes
      </motion.span>
    </AnimatePresence>
  )
}