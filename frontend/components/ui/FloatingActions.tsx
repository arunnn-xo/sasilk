'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'

export default function FloatingActions() {
  return (
    <>
      <Link
        href="/reviews"
        className="floating-review-tab group"
        aria-label="View Customer Reviews and Ratings"
      >
        <Star
          size={16}
          className="text-[#D9B86E] fill-[#D9B86E] transition-transform duration-300 group-hover:scale-125 drop-shadow-[0_0_6px_rgba(217,184,110,0.85)]"
          strokeWidth={0}
        />
        <span className="group-hover:text-[#D9B86E] transition-colors duration-200">Reviews</span>
      </Link>

      <div className="floating-action-stack" aria-label="Quick actions">
        <a
          href="https://wa.me/"
          className="floating-whatsapp-btn"
          aria-label="Chat on WhatsApp"
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon size={28} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.22)]" />
        </a>
      </div>
    </>
  )
}
