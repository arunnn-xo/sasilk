'use client'

const messages = [
  'Shipping Worldwide',
  'Easy Return & Exchange*',
  'EMI Option Available*',
  'Saving Scheme available*',
  'Delivery Time: 1 - 3 Weeks',
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
