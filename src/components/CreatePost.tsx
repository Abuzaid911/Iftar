'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Camera, Upload, X, ImageIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function CreatePost() {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      
      // Validate files
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        setError('Only image files are allowed')
        return
      }
      
      // Check file size (10MB limit per file)
      const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024)
      if (largeFiles.length > 0) {
        setError('Some files exceed the 10MB size limit')
        return
      }
      
      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
      setImages(prev => [...prev, ...files])
    }
  }, [])

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      
      // Validate files
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
      if (invalidFiles.length > 0) {
        setError('Only image files are allowed')
        return
      }
      
      // Check file size (10MB limit per file)
      const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024)
      if (largeFiles.length > 0) {
        setError('Some files exceed the 10MB size limit')
        return
      }
      
      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
      setImages(prev => [...prev, ...files])
    }
  }, [])

  // Remove image at specific index
  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index])
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }, [previews])

  // Clear all images
  const clearImages = useCallback(() => {
    // Revoke all object URLs
    previews.forEach(preview => URL.revokeObjectURL(preview))
    setPreviews([])
    setImages([])
  }, [previews])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      setError('Please select at least one image')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setUploadProgress(0)
      
      // Create FormData
      const formData = new FormData()
      images.forEach(image => {
        formData.append('images', image)
      })

      // Show upload starting toast
      const loadingToast = toast.loading('Uploading images...', {
        style: {
          background: '#000',
          color: '#F7B538',
          border: '1px solid rgba(247, 181, 56, 0.1)',
        },
      })

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      })

      // Clear progress interval
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      // Show success toast with sparkles
      toast.success('Post created successfully!', {
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

      // Clear form
      clearImages()
      router.refresh()
    } catch (error: unknown) {
      console.error('Error:', error)
      
      // Fixed: Properly handle the unknown error type
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      setError(errorMessage)
      
      // Show error toast
      toast.error(errorMessage, {
        style: {
          background: '#000',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.1)',
        },
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-amber-500/10 rounded-xl shadow-lg p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent">
          Share Your Iftar Photos
        </h2>
        {images.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearImages}
            className="text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            Clear all
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
            >
              <p className="text-red-500 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300
            ${dragActive ? 'border-amber-500 bg-amber-500/10' : 'border-amber-500/20 bg-transparent'}
            ${images.length > 0 ? 'bg-amber-500/5' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <motion.div 
              animate={{ 
                scale: dragActive ? 1.1 : 1,
                y: dragActive ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="mx-auto"
            >
              {dragActive ? (
                <Sparkles className="mx-auto h-12 w-12 text-amber-500" />
              ) : (
                <ImageIcon className="mx-auto h-12 w-12 text-amber-500/50" />
              )}
            </motion.div>
            <p className="mt-4 text-sm text-amber-500/80">
              {images.length > 0 
                ? `${images.length} image${images.length > 1 ? 's' : ''} selected`
                : 'Drop images here or click to upload'}
            </p>
            <p className="mt-2 text-xs text-amber-500/60">
              Max size: 10MB per image
            </p>
          </div>
        </div>

        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-1.5 text-xs text-amber-500/80 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {(images[index].size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="mt-4">
            <div className="h-1.5 w-full bg-amber-500/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
            <p className="mt-2 text-xs text-center text-amber-500/60">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading || images.length === 0}
          className="mt-6 w-full bg-amber-500 text-black px-4 py-3 rounded-lg font-medium
            transition-all duration-200 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sharing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Camera className="mr-2 h-5 w-5" />
              Share Iftar
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
