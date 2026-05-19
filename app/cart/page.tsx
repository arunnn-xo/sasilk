'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CreditCard, ShoppingCart, Trash2 } from 'lucide-react'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'

type CartItem = {
  id: number
  name: string
  color: string
  sku: string
  image: string
  price: number
  oldPrice?: number
  qty: number
}

const initialItems: CartItem[] = [
  {
    id: 1,
    name: 'Soft Silk Woven Zari Saree with Half Blouse',
    color: 'Mustard Yellow',
    sku: 'PSSV8201',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300',
    price: 2580,
    oldPrice: 5160,
    qty: 1,
  },
  {
    id: 2,
    name: 'Premium Kanchipuram Silk Saree',
    color: 'Emerald Green',
    sku: 'PKSS4402',
    image: 'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&q=80&w=300',
    price: 3200,
    qty: 1,
  },
]

function formatPrice(value: number) {
  return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CartPage() {
  const [items, setItems] = useState(initialItems)

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.qty, 0)
  }, [items])

  function updateQty(id: number, change: number) {
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, qty: Math.max(1, item.qty + change) } : item)),
    )
  }

  function removeItem(id: number) {
    setItems(current => current.filter(item => item.id !== id))
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="relative z-10 flex-grow overflow-hidden bg-[#FBF9F6]">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12] mix-blend-multiply"
          style={{ backgroundImage: "url('/bgabstractimage/cartabstract.png')" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#FBF9F6]/78" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#FBF9F6]/25 via-[#FBF9F6]/64 to-transparent" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <Link href="/products/soft-silk-woven-zari-saree" className="mb-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[#333333] transition hover:text-[#A34336]">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-medium text-[#333333] md:text-4xl">Your Shopping Cart</h1>
          <p className="text-sm uppercase tracking-wider text-[#666666]">Review your selected items</p>
        </div>

          {items.length > 0 ? (
            <div className="flex flex-col gap-10">
            <section className="flex w-full flex-col gap-6" aria-label="Cart items">
              {items.map(item => (
                <article
                  key={item.id}
                  className="group relative flex flex-col gap-6 border border-[#A34336]/20 bg-white p-5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:flex-row"
                >
                  <div className="pointer-events-none absolute inset-1 border border-[#A34336]/10 opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 h-52 w-full shrink-0 overflow-hidden sm:h-40 sm:w-32">
                    <img src={item.image} className="h-full w-full border border-gray-200 object-cover shadow-sm transition-transform duration-700 ease-out group-hover:scale-110" alt={item.name} />
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="pr-4 text-[18px] font-medium leading-tight text-[#333333] transition-colors duration-300 group-hover:text-[#A34336]">{item.name}</h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 transition-all duration-300 hover:rotate-3 hover:scale-110 hover:text-[#A34336]"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="mb-1 text-[14px] text-gray-500">
                        Color: <span className="font-medium text-[#333333]">{item.color}</span>
                      </p>
                      <p className="text-[14px] text-gray-500">SKU: {item.sku}</p>
                    </div>

                    <div className="mt-6 flex items-end justify-between sm:items-center">
                      <div className="flex h-10 w-28 items-center overflow-hidden border border-[#A34336]/30 bg-white">
                        <button type="button" className="flex h-full w-1/3 items-center justify-center text-sm text-gray-600 transition hover:bg-[#A34336]/10" onClick={() => updateQty(item.id, -1)}>
                          -
                        </button>
                        <input value={item.qty} readOnly className="h-full w-1/3 border-none bg-transparent text-center text-sm font-medium text-[#A34336] outline-none" aria-label={`${item.name} quantity`} />
                        <button type="button" className="flex h-full w-1/3 items-center justify-center text-sm text-gray-600 transition hover:bg-[#A34336]/10" onClick={() => updateQty(item.id, 1)}>
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        {item.oldPrice ? <span className="mb-1 block text-[13px] text-gray-400 line-through">{formatPrice(item.oldPrice)}</span> : null}
                        <span className="block text-xl font-semibold text-[#A34336]">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="w-full" aria-label="Order summary">
              <div className="relative border-x border-b border-t-[4px] border-[#EAD3CE] bg-white px-5 py-7 shadow-[0_10px_32px_rgba(0,0,0,0.05)] sm:px-8 lg:px-10">
                <div className="pointer-events-none absolute inset-2 border border-[#A34336]/10" />

                <div className="relative z-10 mx-auto max-w-[1020px]">
                  <h2 className="mb-7 border-b border-gray-100 pb-5 text-center text-xl font-semibold uppercase tracking-[0.22em] text-[#333333]">
                    Order Summary
                  </h2>

                  <div className="mb-7 space-y-5 text-[15px] sm:text-[16px]">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-gray-600">
                      <span>Subtotal</span>
                      <span className="text-right font-semibold text-[#333333]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-gray-600">
                      <span>Estimated Shipping</span>
                      <span className="text-right font-semibold text-green-600">Free</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-gray-600">
                      <span>Estimated Taxes</span>
                      <span className="text-right font-semibold text-[#333333]">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="mb-9 border-t border-[#A34336]/20 pt-6">
                    <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                      <div>
                        <span className="block text-lg font-semibold text-[#333333]">Total</span>
                        <p className="mt-3 text-[12px] text-gray-500 sm:text-[13px]">Secure checkout powered by Razorpay</p>
                      </div>
                      <span className="text-right text-2xl font-bold text-[#A34336] sm:text-3xl">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <button type="button" className="group relative z-10 flex w-full items-center justify-center gap-2 overflow-hidden bg-[#A34336] py-4 text-[14px] font-semibold uppercase tracking-widest text-white shadow-md transition-all duration-300 sm:text-[15px]">
                    <span className="absolute inset-0 z-[-1] origin-left scale-x-0 bg-[#8e382b] transition-transform duration-500 ease-out group-hover:scale-x-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                  </button>

                  <div className="mt-6 flex justify-center gap-4 border-t border-gray-100 pt-6 text-gray-400">
                    {['Visa', 'Mastercard', 'GPay', 'ApplePay'].map(label => (
                      <div key={label} className="flex h-9 w-12 items-center justify-center rounded border border-gray-200 text-[10px] font-bold uppercase transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:border-[#A34336]/30 hover:text-[#A34336]">
                        <CreditCard className="h-4 w-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
            </div>
          ) : (
            <div className="py-20 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#A34336]/10 text-[#A34336]">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h2 className="mb-4 text-2xl font-medium text-[#333333]">Your cart is empty</h2>
            <p className="mx-auto mb-8 max-w-md text-gray-500">Looks like you haven&apos;t added any gorgeous sarees to your cart yet.</p>
            <Link href="/products/soft-silk-woven-zari-saree" className="inline-block bg-[#A34336] px-8 py-3.5 text-[14px] font-medium uppercase tracking-wider text-white shadow-md transition duration-300 hover:bg-[#8e382b]">
              Continue Shopping
            </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </>
  )
}
