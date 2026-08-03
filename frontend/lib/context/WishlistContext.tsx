'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'

export type WishlistItem = {
  productId: number
  name: string
  imageUrl: string
  price: number
  slug: string
}

type WishlistContextValue = {
  items: WishlistItem[]
  itemCount: number
  isInWishlist: (productId: number) => boolean
  toggleItem: (item: WishlistItem) => void
  addItem: (item: WishlistItem) => void
  removeItem: (productId: number) => void
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = 'sg_wishlist'

function loadWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(loadWishlist)

  useEffect(() => {
    saveWishlist(items)
  }, [items])

  const isInWishlist = useCallback((productId: number) => {
    return items.some(i => i.productId === productId)
  }, [items])

  const addItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.productId === item.productId)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(prev => {
      if (prev.some(i => i.productId === item.productId)) {
        return prev.filter(i => i.productId !== item.productId)
      }
      return [...prev, item]
    })
  }, [])

  const clearWishlist = useCallback(() => setItems([]), [])

  const value = useMemo<WishlistContextValue>(() => ({
    items,
    itemCount: items.length,
    isInWishlist,
    toggleItem,
    addItem,
    removeItem,
    clearWishlist,
  }), [items, isInWishlist, toggleItem, addItem, removeItem, clearWishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
