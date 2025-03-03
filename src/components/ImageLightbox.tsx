'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface ImageLightboxProps {
  images: string[]
  onClose: () => void
}

export default function ImageLightbox({ images, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 p-2 rounded-full bg-black/50 text-amber-500 hover:bg-black/70"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 p-2 rounded-full bg-black/50 text-amber-500 hover:bg-black/70"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-amber-500' : 'bg-amber-500/30'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}