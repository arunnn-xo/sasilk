'use client'

import { useEffect, useState, useMemo } from 'react'
import { fetchAnnouncementBar, AnnouncementData } from '@/lib/services/storefront.service'

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([])

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await fetchAnnouncementBar()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAnnouncements(data)
        }
      } catch {
        // No announcements available or network error
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  // Repeat items so that each track is sufficiently long even with only 1 announcement text
  const baseItems = useMemo(() => {
    if (announcements.length === 0) return []
    const minItems = 12
    const repeatCount = Math.max(2, Math.ceil(minItems / announcements.length))
    return Array.from({ length: repeatCount }, () => announcements).flat()
  }, [announcements])

  // Only render when announcements exist
  if (announcements.length === 0 || baseItems.length === 0) return null

  // Maintain a smooth, constant scrolling speed (~3.5s per item)
  const duration = Math.max(25, baseItems.length * 3.5)

  return (
    <div
      role="region"
      aria-label="Announcement Bar"
      style={{ backgroundColor: '#BA232B' }}
      className="relative w-full py-2 overflow-hidden border-b border-[#9E1A21] select-none announcement-bar-container"
    >
      <div className="flex w-max">
        {/* Track 1 (Main Track) */}
        <div
          className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16 animate-marquee-continuous"
          style={{ animationDuration: `${duration}s` }}
        >
          {baseItems.map((item, i) => (
            <span
              key={`t1-${i}-${item.id || i}`}
              className="inline-flex items-center text-[11px] sm:text-xs tracking-widest uppercase font-semibold text-white whitespace-nowrap"
            >
              <span className="text-[#FFD700] text-[9px] mr-3 opacity-95">✦</span>
              {item.linkUrl && item.linkUrl.trim() !== '' ? (
                <a
                  href={item.linkUrl}
                  className="hover:text-[#FFD700] transition-colors underline-offset-4 hover:underline"
                >
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </span>
          ))}
        </div>

        {/* Track 2 (Clone for infinite seamless continuity) */}
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16 animate-marquee-continuous"
          style={{ animationDuration: `${duration}s` }}
        >
          {baseItems.map((item, i) => (
            <span
              key={`t2-${i}-${item.id || i}`}
              className="inline-flex items-center text-[11px] sm:text-xs tracking-widest uppercase font-semibold text-white whitespace-nowrap"
            >
              <span className="text-[#FFD700] text-[9px] mr-3 opacity-95">✦</span>
              {item.linkUrl && item.linkUrl.trim() !== '' ? (
                <a
                  href={item.linkUrl}
                  tabIndex={-1}
                  className="hover:text-[#FFD700] transition-colors underline-offset-4 hover:underline"
                >
                  {item.text}
                </a>
              ) : (
                item.text
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

