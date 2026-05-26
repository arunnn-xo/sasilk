'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const [show, setShow] = useState(true)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Check if it's a touch device (Coarse pointer like tablets/mobiles)
    if (window.matchMedia("(pointer: coarse)").matches) {
      setShow(false)
      return
    }

    const cursor = cursorRef.current
    if (!cursor) return

    let lastParticleTime = 0

    // 2. Track mouse movement and position custom cursor
    const onMouseMove = (e: MouseEvent) => {
      // Make cursor visible on first movement inside window
      if (cursor.style.display === 'none' || !cursor.style.display) {
        cursor.style.display = 'flex'
      }

      // Position using left and top for high compatibility
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`

      // Generate golden sparkles on movement (throttled to 25ms for 60fps performance)
      const now = Date.now()
      if (now - lastParticleTime > 25) {
        createGoldenParticle(e.clientX, e.clientY)
        lastParticleTime = now
      }
    }

    // 3. Create single trailing golden particle
    const createGoldenParticle = (x: number, y: number) => {
      const particle = document.createElement('div')
      particle.className = 'golden-particle'

      // Random sizes (3px to 8px)
      const size = Math.random() * 5 + 3
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`

      // Curated ethnic gold palette
      const goldColors = ['#D4AF37', '#C5A059', '#FDB931', '#E5C158', '#FFF8DC']
      const color = goldColors[Math.floor(Math.random() * goldColors.length)]
      particle.style.backgroundColor = color
      particle.style.boxShadow = `0 0 ${size + 2}px ${color}`

      // Random trajectory variables
      const tx = (Math.random() - 0.5) * 70
      const ty = (Math.random() - 0.5) * 70 + 15
      particle.style.setProperty('--tx', `${tx}px`)
      particle.style.setProperty('--ty', `${ty}px`)

      document.body.appendChild(particle)

      // Self-cleanup after animation ends (800ms)
      setTimeout(() => {
        particle.remove()
      }, 800)
    }

    // 4. Create multi-particle burst on click
    const createBurst = (x: number, y: number) => {
      const numParticles = 14
      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div')
        particle.className = 'golden-particle'

        const size = Math.random() * 6 + 4
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${x}px`
        particle.style.top = `${y}px`

        const goldColors = ['#D4AF37', '#C5A059', '#FDB931', '#E5C158', '#FFF8DC']
        const color = goldColors[Math.floor(Math.random() * goldColors.length)]
        particle.style.backgroundColor = color
        particle.style.boxShadow = `0 0 ${size + 2}px ${color}`

        const angle = (i / numParticles) * Math.PI * 2
        const velocity = Math.random() * 60 + 30
        const tx = Math.cos(angle) * velocity
        const ty = Math.sin(angle) * velocity

        particle.style.setProperty('--tx', `${tx}px`)
        particle.style.setProperty('--ty', `${ty}px`)
        particle.style.animation = 'burstAnim 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards'

        document.body.appendChild(particle)

        setTimeout(() => {
          particle.remove()
        }, 500)
      }
    }

    // 5. Interactive clicking effects
    const onMouseDown = (e: MouseEvent) => {
      cursor.classList.add('clicking')
      createBurst(e.clientX, e.clientY)
    }

    const onMouseUp = () => {
      cursor.classList.remove('clicking')
    }

    // 6. Global Hover Detection using Event Delegation (avoids route change breakage)
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      const isClickable = !!target.closest(
        'a, button, input, select, textarea, [role="button"], .cursor-pointer, .interactive, .swiper-button-next, .swiper-button-prev'
      )

      if (isClickable) {
        cursor.classList.add('hovering')
      } else {
        cursor.classList.remove('hovering')
      }
    }

    // 7. Hide/Show when leaving or entering window bounds
    const onMouseEnterWindow = () => {
      cursor.style.display = 'flex'
    }

    const onMouseLeaveWindow = () => {
      cursor.style.display = 'none'
    }

    // Setup window event listeners
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseenter', onMouseEnterWindow)
    document.addEventListener('mouseleave', onMouseLeaveWindow)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseenter', onMouseEnterWindow)
      document.removeEventListener('mouseleave', onMouseLeaveWindow)
    }
  }, [show])

  if (!show) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide system cursor on mouse-supported screens */
        @media (pointer: fine) {
          body, body * {
            cursor: none !important;
          }
        }

        /* Cursor Core styles */
        .custom-cursor {
          position: fixed;
          width: 32px;
          height: 32px;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition: transform 0.05s ease-out;
          display: none;
          align-items: center;
          justify-content: center;
        }

        /* SVG shape transitions */
        .custom-cursor svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(2px 4px 5px rgba(0,0,0,0.4));
          transition: transform 0.2s ease, filter 0.2s ease; 
        }

        /* Glossy letter branding */
        .custom-cursor .letter-s {
          position: absolute;
          color: #ffffff;
          font-weight: bold;
          font-size: 16px;
          font-family: serif; 
          margin-top: -2px;
          pointer-events: none;
          text-shadow: -1px -1px 1px rgba(255,255,255,0.4), 1px 1px 3px rgba(0,0,0,0.8);
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }

        /* Clicking scale down */
        .custom-cursor.clicking {
          transform: translate(-50%, -50%) scale(0.8);
        }
        
        /* 3D Pulse on Hover */
        .custom-cursor.hovering svg {
          animation: heartPulse3D 1s infinite ease-in-out;
        }

        .custom-cursor.hovering .letter-s {
          color: #FFD700;
          text-shadow: -1px -1px 1px rgba(255,255,255,0.2), 0 0 8px rgba(255, 215, 0, 1), 1px 1px 2px rgba(0,0,0,0.8);
        }

        @keyframes heartPulse3D {
          0% { transform: scale(1) translateY(0); filter: drop-shadow(2px 4px 5px rgba(0,0,0,0.4)); }
          50% { transform: scale(1.25) translateY(-2px); filter: drop-shadow(4px 8px 8px rgba(0,0,0,0.3)); }
          100% { transform: scale(1) translateY(0); filter: drop-shadow(2px 4px 5px rgba(0,0,0,0.4)); }
        }

        /* Particle Trail */
        .golden-particle {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          z-index: 99998;
          animation: sparkle 0.8s ease-out forwards;
        }

        @keyframes sparkle {
          0% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); 
            opacity: 0; 
          }
        }

        /* Fast click burst */
        @keyframes burstAnim {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
        }
      `}} />

      <div className="custom-cursor" id="customCursor" ref={cursorRef}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="heart3d" cx="30%" cy="30%" r="70%" fx="25%" fy="25%">
              <stop offset="0%" stopColor="#9a2b3e" />
              <stop offset="35%" stopColor="#5b1420" />
              <stop offset="85%" stopColor="#3a0a12" />
              <stop offset="100%" stopColor="#1a0307" />
            </radialGradient>
          </defs>
          <path 
            fill="url(#heart3d)" 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <span className="letter-s">S</span>
      </div>
    </>
  )
}
