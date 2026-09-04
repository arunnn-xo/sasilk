'use client'

import { Film } from 'lucide-react'
import { resolveImageUrl } from '@/lib/api/client'

export interface EventVideoPlayerProps {
  videoUrl?: string | null
  eventName: string
  posterImageUrl?: string | null
}

export type ParsedVideo =
  | { type: 'youtube'; embedUrl: string }
  | { type: 'vimeo'; embedUrl: string }
  | { type: 'direct'; src: string }

export function parseVideoUrl(url: string | null | undefined): ParsedVideo | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // 1. YouTube: watch, shorts, embed, youtu.be
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  )
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    }
  }

  // 2. Vimeo: standard & player links
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i)
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`,
    }
  }

  // 3. Direct video asset or file upload
  return {
    type: 'direct',
    src: resolveImageUrl(trimmed) || trimmed,
  }
}

export default function EventVideoPlayer({ videoUrl, eventName, posterImageUrl }: EventVideoPlayerProps) {
  // Gracefully return null if no video URL is provided (zero voids)
  const parsed = parseVideoUrl(videoUrl)
  if (!parsed) {
    return null
  }

  const poster = posterImageUrl ? resolveImageUrl(posterImageUrl) : undefined

  return (
    <section aria-label="Event Highlights & Glimpses" className="mt-10 border-t border-[#D9B86E]/40 pt-10">
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9B86E]/60 bg-[#F6EED8]/60 px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6D4B]">
          <Film size={12} className="text-[#8B1A2B]" />
          Event Highlights &amp; Glimpses
        </span>
        <h3 className="mt-2 font-serif text-2xl font-bold text-[#300D14]">
          Experience the Ambiance &amp; Glimpses
        </h3>
        <p className="mt-1 font-sans text-xs text-[#7A6065]">
          A preview of what awaits you at this exclusive gathering
        </p>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#D9B86E]/50 bg-black shadow-lg">
        {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
          <iframe
            src={parsed.embedUrl}
            title={`${eventName} video highlights`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            poster={poster}
            className="h-full w-full object-contain"
          >
            <source src={parsed.src} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </section>
  )
}
