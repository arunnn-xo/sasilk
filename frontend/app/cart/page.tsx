'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, CreditCard, ShoppingCart, Trash2 } from 'lucide-react'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import { useCart } from '@/lib/context/CartContext'

function formatPrice(value: number) {
  return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()

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
          <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-[#333333] transition hover:text-[#A34336]">
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
                  key={`${item.productId}-${item.variantId ?? ''}`}
                  className="group relative flex flex-col gap-6 rounded-xl border border-[#D9B86E]/50 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row"
                >
                  <div className="pointer-events-none absolute inset-1 rounded-lg border border-[#D9B86E]/20 opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 h-52 w-full shrink-0 overflow-hidden rounded-lg sm:h-40 sm:w-32">
                    <img src={item.imageUrl} className="h-full w-full border border-[#D9B86E]/40 object-cover shadow-sm transition-transform duration-700 ease-out group-hover:scale-110" alt={item.name} />
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="pr-4 text-[18px] font-bold leading-tight text-[#300D14] transition-colors duration-300 group-hover:text-[#9C1A21]">{item.name}</h3>
                        <button
                          type="button"
                          className="text-[#7A6065] transition hover:text-[#9C1A21]"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeItem(item.productId, item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[13px] text-[#5A4045]">
                        Variant: <span className="font-semibold text-[#300D14]">{item.variantLabel}</span>
                      </p>
                      <p className="text-[12px] text-[#A57C3A] mt-0.5">SKU: {item.sku}</p>
                    </div>

                    <div className="mt-6 flex items-end justify-between sm:items-center">
                      <div className="flex h-10 w-28 items-center overflow-hidden rounded-lg border border-[#D9B86E]/60 bg-[#FAF6EE]">
                        <button type="button" className="flex h-full w-1/3 items-center justify-center text-sm font-bold text-[#300D14] transition hover:bg-[#D9B86E]/20" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}>
                          -
                        </button>
                        <input value={item.quantity} readOnly className="h-full w-1/3 border-none bg-transparent text-center text-sm font-bold text-[#9C1A21] outline-none" aria-label={`${item.name} quantity`} />
                        <button type="button" className="flex h-full w-1/3 items-center justify-center text-sm font-bold text-[#300D14] transition hover:bg-[#D9B86E]/20" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}>
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="block text-xl font-bold text-[#9C1A21]">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="w-full" aria-label="Order summary">
              <div className="relative rounded-2xl border border-[#D9B86E]/60 bg-white px-5 py-7 shadow-[0_12px_34px_rgba(42,26,30,0.06)] sm:px-8 lg:px-10">
                <div className="pointer-events-none absolute inset-2 border border-[#A34336]/10" />

                <div className="relative z-10 mx-auto max-w-[1020px]">
                  <h2 className="mb-7 border-b border-gold pb-5 text-center text-xl font-semibold uppercase tracking-[0.22em] text-[#333333]">
                    Order Summary
                  </h2>

                  <div className="mb-7 space-y-5 text-[15px] sm:text-[16px]">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-gold">
                      <span>Subtotal</span>
                      <span className="text-right font-semibold text-[#333333]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-gold">
                      <span>Estimated Shipping</span>
                      <span className="text-right font-semibold text-green-600">Free</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-4 text-gold">
                      <span>Estimated Taxes</span>
                      <span className="text-right font-semibold text-[#333333]">Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="mb-9 border-t border-[#A34336]/20 pt-6">
                    <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                      <div>
                        <span className="block text-lg font-semibold text-[#333333]">Total</span>
                        <p className="mt-3 text-[12px] text-gold sm:text-[13px]">Secure checkout powered by Razorpay</p>
                      </div>
                      <span className="text-right text-2xl font-bold text-[#A34336] sm:text-3xl">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <button type="button" className="group relative z-10 flex w-full items-center justify-center gap-2 overflow-hidden bg-[#A34336] py-4 text-[14px] font-semibold uppercase tracking-widest text-gold shadow-md transition-all duration-300 sm:text-[15px]">
                    <span className="absolute inset-0 z-[-1] origin-left scale-x-0 bg-[#8e382b] transition-transform duration-500 ease-out group-hover:scale-x-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                  </button>

                  <div className="mt-6 flex justify-center gap-4 border-t border-gold pt-6 text-gold">
                    {['Visa', 'Mastercard', 'GPay', 'ApplePay'].map(label => (
                      <div key={label} className="flex h-9 w-12 items-center justify-center rounded border border-gold text-[10px] font-bold uppercase transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:border-[#A34336]/30 hover:text-[#A34336]">
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
            <p className="mx-auto mb-8 max-w-md text-gold">Looks like you haven&apos;t added any gorgeous sarees to your cart yet.</p>
            <Link href="/shop" className="inline-block bg-[#A34336] px-8 py-3.5 text-[14px] font-medium uppercase tracking-wider text-gold shadow-md transition duration-300 hover:bg-[#8e382b]">
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
