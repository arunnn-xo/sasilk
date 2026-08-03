'use client'

import { useEffect, useRef } from 'react'

export default function TabVisibilityHandler() {
  // Use a ref to store the original title so it doesn't get lost between renders
  const originalTitle = useRef<string>('')

  useEffect(() => {
    // Store the original title once when the component mounts
    if (!originalTitle.current) {
      originalTitle.current = document.title
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // When the user switches to another tab
        document.title = 'Come back... 🥺 | Soil Goddess'
      } else {
        // When the user comes back
        document.title = originalTitle.current || 'SOIL GODDESS by Sri Akila'
      }
    }

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup the event listener when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // This is a logic-only component, it doesn't render any UI
  return null
}
