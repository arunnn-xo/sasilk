'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'

export type CartItem = {
  productId: number
  variantId?: number
  name: string
  imageUrl: string
  variantLabel: string
  sku: string
  unitPrice: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  updateQuantity: (productId: number, variantId: number | undefined, quantity: number) => void
  removeItem: (productId: number, variantId: number | undefined) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'sg_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    saveCart(items)
  }, [items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prev => {
      const idx = prev.findIndex(
        i => i.productId === item.productId && i.variantId === item.variantId,
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + (item.quantity ?? 1) }
        return next
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 } as CartItem]
    })
  }, [])

  const updateQuantity = useCallback((productId: number, variantId: number | undefined, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === productId && i.variantId === variantId)
      if (idx < 0) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], quantity }
      return next
    })
  }, [])

  const removeItem = useCallback((productId: number, variantId: number | undefined) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }), [items, addItem, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
