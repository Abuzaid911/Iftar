"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function LoadingBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(30)
    }, 100)

    const timer2 = setTimeout(() => {
      setProgress(60)
    }, 500)

    const timer3 = setTimeout(() => {
      setProgress(80)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className="h-1 bg-amber-500"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "easeOut" }}
      />
    </div>
  )
}

