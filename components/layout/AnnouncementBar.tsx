'use client'

const messages = [
  'Free Shipping across India',
  'Delivery: 10–15 Working Days',
  'Worldwide Shipping Available',
  'Authentic Handloom Weaves',
  'First Order: Use Code SAS15OFF',
]

export default function AnnouncementBar() {
  const doubled = [...messages, ...messages]

  return (
    <div
      style={{ backgroundColor: 'var(--burgundy-dark)' }}
      className="py-2 overflow-hidden"
    >
      <div className="flex gap-16 marquee-track whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span
            key={i}
            className="text-xs tracking-widest uppercase font-medium"
            style={{ color: 'var(--gold-light)' }}
          >
            <span style={{ color: 'var(--gold)', marginRight: 12, fontSize: 9 }}>✦</span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
