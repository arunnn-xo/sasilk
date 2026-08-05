'use client'

import Link from 'next/link'
import { ShoppingBag, Star } from 'lucide-react'

export default function FloatingActions() {
  return (
    <>
      <Link
        href="/reviews"
        className="floating-review-tab"
        aria-label="Click to open Judge.me floating reviews"
      >
        <Star size={16} fill="#FACC15" strokeWidth={0} />
        <span>Reviews</span>
      </Link>

      <Link
        href="#newsletter"
        className="floating-newsletter-tab"
        aria-label="Click to subscribe to Newsletter"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <span>Newsletter</span>
      </Link>

      <div className="floating-action-stack" aria-label="Quick actions">
        {/* <Link
          href="/cart"
          className="floating-bag-btn"
          aria-label="Open shopping bag"
        >
          <ShoppingBag size={22} strokeWidth={2.2} />
          <Star
            className="floating-bag-star"
            size={12}
            fill="currentColor"
            strokeWidth={1.6}
          />
        </Link> */}

        <a
          href="https://wa.me/"
          className="floating-whatsapp-btn"
          aria-label="Chat on WhatsApp"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.76.45 3.42 1.25 4.87L2 22l5.34-1.19c1.42.74 3.03 1.16 4.67 1.16 5.53 0 10.01-4.48 10.01-10S17.54 2 12.01 2zM12 20c-1.46 0-2.87-.38-4.1-1.07l-.3-.17-3.14.7.72-3.07-.19-.3A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
            <path d="M16.48 14.8c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.3-.65-2.26-1.2-3.1-2.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42H8.9c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.34.98 2.5c.12.16 1.7 2.6 4.12 3.64 1.54.66 2.14.72 2.92.6.86-.14 2.14-.88 2.44-1.72.3-.84.3-1.56.2-1.72-.1-.16-.36-.24-.6-.36z" />
          </svg>
        </a>
      </div>
    </>
  )
}
