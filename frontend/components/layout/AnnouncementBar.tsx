'use client'

import { useEffect, useState } from 'react'
import { fetchAnnouncementBar } from '@/lib/services/storefront.service'

export default function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAnnouncementBar()
        if (data && data.length > 0) {
          setMessages(data.map(a => a.text))
        }
      } catch {
        // No announcements available
      }
    }
    load()
  }, [])

  // Only render when real announcements exist
  if (messages.length === 0) return null

  const doubled = [...messages, ...messages]

  return (
    <div
      style={{ backgroundColor: '#BA232B' }}
      className="py-2 overflow-hidden border-b border-[#9E1A21]"
    >
      <div className="flex gap-16 marquee-track whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span
            key={i}
            className="text-xs tracking-widest uppercase font-semibold"
            style={{ color: '#FFFFFF' }}
          >
            <span style={{ color: '#FFD700', opacity: 0.95, marginRight: 12, fontSize: 9 }}>✦</span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
