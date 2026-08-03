'use client'

import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { fetchNavMenu, type NavMenuItem } from '@/lib/services/storefront.service'

type Props = {
  open: boolean
  onClose: () => void
}

export default function NavPreviewModal({ open, onClose }: Props) {
  const [nav, setNav] = useState<NavMenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchNavMenu()
      .then(setNav)
      .catch(() => setNav([]))
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-burgundy/50" onClick={onClose} />
      <div className="relative bg-burgundy rounded-xl shadow-2xl border border-gold w-full max-w-5xl mx-4 max-h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold">
          <h2 className="text-lg font-bold text-gold">Navigation Preview</h2>
          <button onClick={onClose} className="p-1.5 text-gold hover:text-gold rounded-lg hover:bg-burgundy">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(70vh-64px)]">
          {loading ? (
            <div className="text-center py-12 text-gold">Loading...</div>
          ) : nav.length === 0 ? (
            <div className="text-center py-12 text-gold">
              No navigation items. Add categories with <strong>Nav Visible</strong> enabled.
            </div>
          ) : (
            <div className="bg-burgundy rounded-xl p-4">
              <div className="flex items-center gap-6 bg-burgundy rounded-lg px-6 py-3 shadow-sm border border-gold">
                <span className="font-bold text-gold text-sm">SOIL GODDESS</span>
                {nav.map((item, i) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <button
                      className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold rounded-lg transition ${
                        hoveredIndex === i
                          ? 'text-[#c9a96e] bg-[#c9a96e]/10'
                          : 'text-gold hover:text-gold'
                      }`}
                    >
                      {item.label}
                      {item.subCategories && item.subCategories.length > 0 && (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      {item.isSale && (
                        <span className="text-[10px] font-bold uppercase text-red-500 ml-0.5">Sale</span>
                      )}
                    </button>

                    {hoveredIndex === i && item.subCategories && item.subCategories.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 bg-burgundy rounded-xl shadow-xl border border-gold p-4 min-w-[200px] z-10">
                        <div className="flex gap-6">
                          {item.subCategories.map(sub => (
                            <div key={sub.name} className="min-w-[160px]">
                              <div className="font-semibold text-gold text-sm mb-2">{sub.name}</div>
                              {sub.products && sub.products.length > 0 && (
                                <ul className="space-y-1">
                                  {sub.products.map(p => (
                                    <li key={p.name}>
                                      <span className="text-xs text-gold hover:text-[#c9a96e] cursor-pointer inline-flex items-center gap-1">
                                        {p.name}
                                        {p.isHot && <span className="text-[10px] text-orange-500 font-bold">HOT</span>}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {sub.directLink && (
                                <div className="text-xs text-gold italic mt-1">Direct link</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gold text-center">
                Hover over each item to preview its dropdown. This is how the mega-menu appears on the frontend.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
