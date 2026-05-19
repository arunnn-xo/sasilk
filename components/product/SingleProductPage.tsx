'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  Clock3,
  Headphones,
  Link as LinkIcon,
  Medal,
  MessageCircle,
  Minus,
  Percent,
  Plus,
  Repeat2,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  StarHalf,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import ProductCard, { type ProductCardProduct } from '@/components/product/ProductCard'

const productImages = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1583391733958-6c5905d76161?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1620242273111-c918ffce8231?auto=format&fit=crop&q=80&w=1000',
]

const colorVariants = [
  { name: 'Mustard Yellow', image: productImages[0] },
  { name: 'Teal Blue', image: productImages[1] },
  { name: 'Deep Maroon', image: productImages[2] },
  { name: 'Emerald Green', image: productImages[3] },
  { name: 'Dusty Pink', image: productImages[4] },
]

const accordions = [
  {
    id: 'desc',
    title: 'Description',
    content:
      'Embrace elegance with our Soft Silk Woven Zari Saree. Crafted with precision, this lightweight saree features intricate zari weaving all over, ensuring you look radiant for festive occasions and weddings. Paired with a contrast half blouse for a modern touch.',
  },
  {
    id: 'saree',
    title: 'Saree & Blouse',
    list: ['Fabric: Premium Soft Silk', 'Length: 5.5 Meters', 'Blouse: 0.8 Meters Unstitched (Included)', 'Work: Woven Zari Pattern'],
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    content: 'Dispatched in 24-48 hours. Delivery takes 3-7 working days depending on your location. Tracking details will be shared via email/SMS.',
  },
  {
    id: 'wash',
    title: 'Wash Care & Maintenance',
    content: 'Dry clean only. Do not bleach. Store in a cool, dry place away from direct sunlight. Wrap in soft muslin cloth for longevity.',
  },
]

const relatedProducts: ProductCardProduct[] = [
  { id: 'related-1', badge: 'Bestseller', name: 'Soft Silk Woven Zari Saree', price: 2580, oldPrice: 5160, image: productImages[1], category: 'Sarees', fabric: 'Silk', occasion: 'Festive', rating: 4.8, reviews: 42 },
  { id: 'related-2', badge: 'New', name: 'Kanjeevaram Soft Silk Saree', price: 3100, oldPrice: 6200, image: productImages[2], category: 'Sarees', fabric: 'Silk', occasion: 'Bridal', rating: 4.7, reviews: 28 },
  { id: 'related-3', badge: 'Bestseller', name: 'Banarasi Semi Silk Saree', price: 1950, oldPrice: 3900, image: productImages[3], category: 'Sarees', fabric: 'Silk', occasion: 'Festive', rating: 4.6, reviews: 19 },
  { id: 'related-4', name: 'Art Silk Handloom Saree', price: 2200, oldPrice: 4400, image: productImages[4], category: 'Sarees', fabric: 'Silk', occasion: 'Daily', rating: 4.5, reviews: 14 },
]

const recentlyViewedProduct: ProductCardProduct = {
  id: 'recent-1',
  badge: 'Sale',
  name: 'Premium Woven Zari Saree',
  price: 2800,
  oldPrice: 3111,
  image: productImages[5],
  category: 'Sarees',
  fabric: 'Silk',
  occasion: 'Festive',
  rating: 4.8,
  reviews: 14,
}

const trustItems = [
  { Icon: Truck, title: 'Free Shipping', effect: 'truck' },
  { Icon: Headphones, title: 'Premium Support', effect: 'support' },
  { Icon: Medal, title: 'Assured Quality', effect: 'quality' },
  { Icon: Repeat2, title: 'Easy Return/Exchange', effect: 'return' },
]

export default function SingleProductPage() {
  const [mainImage, setMainImage] = useState(productImages[0])
  const [selectedColor, setSelectedColor] = useState(colorVariants[0].name)
  const [qty, setQty] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const activeThumb = useMemo(() => {
    return productImages.find(image => image === mainImage) ?? productImages[0]
  }, [mainImage])

  const subtotal = useMemo(() => `₹ ${(2580 * qty).toLocaleString('en-IN')}.00`, [qty])

  useEffect(() => {
    if (!cartOpen) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [cartOpen])

  useEffect(() => {
    function handleGlobalCartClick(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const control = target.closest('a, button')

      if (!(control instanceof HTMLElement)) {
        return
      }

      const href = control instanceof HTMLAnchorElement ? control.getAttribute('href') ?? '' : ''
      const label = [
        control.getAttribute('aria-label'),
        control.getAttribute('title'),
        control.textContent,
        control.className,
        href,
      ]
        .join(' ')
        .toLowerCase()

      if (label.includes('add to cart')) {
        return
      }

      const isCartControl =
        label.includes('cart') ||
        label.includes('bag') ||
        href === '/cart' ||
        href.endsWith('/cart') ||
        href.includes('cart')

      if (!isCartControl) {
        return
      }

      event.preventDefault()
      window.location.href = '/cart'
    }

    document.addEventListener('click', handleGlobalCartClick, true)

    return () => {
      document.removeEventListener('click', handleGlobalCartClick, true)
    }
  }, [])

  function updateQty(change: number) {
    setQty(current => Math.max(1, current + change))
  }

  return (
    <main className="product-page min-h-screen bg-white font-product text-[#333333] antialiased">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 md:py-10 lg:px-8 xl:py-12">
        <div className="flex min-w-0 flex-col items-start gap-8 lg:flex-row lg:gap-8 xl:gap-14">
          <section className="flex w-full min-w-0 flex-col items-start gap-4 lg:w-[48%] lg:flex-row-reverse xl:sticky xl:top-[76px] xl:h-[calc(100vh-92px)] xl:w-[45%]">
            <div className="group relative aspect-[3/4] w-full min-w-0 flex-1 cursor-crosshair overflow-hidden rounded-sm bg-gray-100 lg:aspect-[3/4] xl:h-full xl:min-h-0 xl:aspect-auto">
              <img
                src={mainImage}
                alt="Soft Silk Woven Zari Saree"
                className="h-full w-full origin-top object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute right-0 top-4 rounded-l-md bg-[#A34336] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Bestseller
              </div>
            </div>

            <div className="product-thumb-scroll flex w-full shrink-0 gap-3 overflow-x-auto pb-2 lg:max-h-[650px] lg:w-[78px] lg:flex-col lg:overflow-y-auto lg:pb-0 xl:h-full xl:max-h-full xl:w-[85px]">
              {productImages.map(image => {
                const isActive = activeThumb === image
                return (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setMainImage(image)}
                    className={`aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-sm transition-colors duration-200 sm:w-20 lg:w-full ${
                      isActive ? 'border-2 border-[#A34336]' : 'border border-gray-200 hover:border-[#A34336]'
                    }`}
                    aria-label="Change product image"
                  >
                    <img src={image.replace('w=1000', 'w=220')} alt="" className="h-full w-full object-cover" />
                  </button>
                )
              })}
            </div>
          </section>

          <section className="flex w-full min-w-0 flex-col lg:w-[52%] xl:w-[55%]">
            <h1 className="mb-1 break-words text-[22px] font-semibold leading-tight text-[#333333] sm:text-2xl md:text-3xl">Soft Silk Woven Zari Saree with Half Blouse</h1>
            <p className="mb-4 text-sm uppercase tracking-wider text-[#666666]">SKU: PSSV8201</p>

            <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold text-[#A34336] md:text-[28px]">₹ 2,580.00 INR</span>
              <span className="text-lg text-gray-400 line-through">₹ 5,160.00 INR</span>
            </div>
            <p className="mb-6 text-[13px] text-gray-500">Tax included.</p>

            <div className="mb-6">
              <div className="mb-3 flex items-start gap-2">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#A34336]" />
                <span className="min-w-0 text-sm font-medium leading-6 text-[#333333]">Order in 14 hrs 30 mins to get it by Thursday</span>
              </div>

              <p className="mb-2 text-sm font-medium">
                Color: <span className="font-normal text-gray-600">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map(variant => {
                  const isSelected = selectedColor === variant.name
                  return (
                    <button
                      key={variant.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(variant.name)
                        setMainImage(variant.image)
                      }}
                      className={`h-16 w-12 cursor-pointer overflow-hidden rounded-[4px] transition ${
                        isSelected ? 'border-2 border-[#A34336] p-0.5' : 'border border-gray-300 hover:border-[#A34336]'
                      }`}
                      aria-label={`Select ${variant.name}`}
                    >
                      <img src={variant.image.replace('w=1000', 'w=140')} alt="" className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-4">
              <div className="flex h-10 w-28 items-center overflow-hidden rounded-[4px] border border-gray-300">
                <button type="button" className="flex h-full w-1/3 items-center justify-center text-gray-600 transition hover:bg-gray-100" onClick={() => updateQty(-1)}>
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input value={qty} readOnly className="h-full w-1/3 border-none text-center text-sm font-medium outline-none" aria-label="Quantity" />
                <button type="button" className="flex h-full w-1/3 items-center justify-center text-gray-600 transition hover:bg-gray-100" onClick={() => updateQty(1)}>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button type="button" className="w-full rounded-[4px] bg-[#A34336] py-3.5 text-[15px] font-medium tracking-wide text-white transition duration-300 hover:bg-[#8e382b]" onClick={() => setCartOpen(true)}>
                ADD TO CART
              </button>
            </div>

            <div className="mb-6 space-y-3 rounded-[4px] border border-[#A34336]/10 bg-[#FDF6F5]/50 p-4">
              {[
                { Icon: Truck, text: 'Free Shipping On Prepaid Orders Within India' },
                { Icon: RotateCcw, text: '7 Days Return/Exchange Available' },
                { Icon: ShieldCheck, text: '100% Secure Payment Guarantee' },
                { Icon: BadgeCheck, text: 'Premium Quality Assured Products' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-5 shrink-0 text-[#A34336]" />
                  <span className="text-[13px] text-gray-700">{text}</span>
                </div>
              ))}
            </div>

            <div className="mb-4 rounded-[4px] border border-[#A34336]/20 bg-[#FEF3EB] p-4">
              <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A34336] text-white">
                  <Percent className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 border-b border-dashed border-[#A34336]/30 pb-3">
                    <p className="mb-1 text-[14px] font-medium text-[#333333]">Get ₹300 OFF on your first order</p>
                    <p className="text-[12px] text-gray-600">
                      Use code: <span className="rounded border border-[#A34336]/20 bg-white px-2 py-0.5 font-bold text-[#A34336]">SUTI300</span>
                    </p>
                  </div>
                  <p className="mb-1 text-[14px] font-medium text-[#333333]">Buy 2+ & get 15% OFF</p>
                  <p className="text-[12px] text-gray-600">
                    Use code: <span className="rounded border border-[#A34336]/20 bg-white px-2 py-0.5 font-bold text-[#A34336]">SUTI15</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8 flex items-start gap-3 rounded-[4px] border border-gray-200 bg-[#F6F6F6] p-4 sm:items-center sm:gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-600">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <p className="text-[14px] font-medium text-[#333333]">Extra ₹100 OFF on Prepaid Orders</p>
            </div>

            <div className="border-t border-gray-200">
              {accordions.map(item => {
                const isOpen = openAccordion === item.id
                return (
                  <div key={item.id} className="border-b border-gray-200">
                    <button type="button" className="flex w-full items-center justify-between py-4 text-left" onClick={() => setOpenAccordion(isOpen ? null : item.id)}>
                      <span className="text-[15px] font-medium text-gray-800">{item.title}</span>
                      {isOpen ? <Minus className="h-4 w-4 text-gray-400" /> : <Plus className="h-4 w-4 text-gray-400" />}
                    </button>
                    <div className={`overflow-hidden transition-[max-height] duration-300 ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                      {item.list ? (
                        <ul className="list-disc space-y-1 pb-4 pl-4 text-[14px] text-gray-600">
                          {item.list.map(line => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="pb-4 text-[14px] leading-relaxed text-gray-600">{item.content}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-[14px] text-gray-500">Share:</span>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-[#A34336] hover:text-[#A34336]" aria-label="Share on WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-[#A34336] hover:text-[#A34336]" aria-label="Share on Facebook">
                f
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-600 transition hover:border-[#A34336] hover:text-[#A34336]" aria-label="Share on X">
                X
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-[#A34336] hover:text-[#A34336]" aria-label="Copy link">
                <LinkIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>
        </div>

        <section className="my-10 grid grid-cols-2 gap-4 border-y border-gray-200 py-10 sm:gap-6 sm:py-12 md:grid-cols-4" aria-label="Service highlights">
          {trustItems.map(({ Icon, title, effect }) => (
            <div key={title} className="product-trust-item flex flex-col items-center gap-3 text-center">
              <div className={`product-trust-icon product-trust-icon-${effect} flex h-14 w-14 items-center justify-center rounded-full border border-[#E8DCCB] bg-[#FAF0E6] text-[#A34336] sm:h-16 sm:w-16`}>
                <Icon className="product-trust-svg h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h4 className="text-xs font-medium leading-5 text-gray-800 sm:text-sm">{title}</h4>
            </div>
          ))}
        </section>

        <section className="mb-12 sm:mb-16">
          <h2 className="mb-6 text-center text-xl font-medium text-[#333333] sm:mb-8 sm:text-2xl">Related products</h2>
          <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-4 md:gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id ?? product.name} product={product} onAddToCart={() => setCartOpen(true)} />
            ))}
          </div>
        </section>

        <section className="mb-12 flex flex-col items-center sm:mb-16">
          <h2 className="mb-6 text-center text-xl font-medium text-[#333333] sm:mb-8 sm:text-2xl">Recently viewed products</h2>
          <div className="w-full max-w-[280px] min-[420px]:w-1/2 md:w-1/4">
            <ProductCard product={recentlyViewedProduct} onAddToCart={() => setCartOpen(true)} />
          </div>
        </section>

        <section className="mb-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between rounded-lg border border-[#EFEBE4] bg-[#FDFBF9] p-5 shadow-sm sm:p-8 md:flex-row">
            <div className="mb-4 text-center md:mb-0 md:text-left">
              <h3 className="mb-2 text-xl font-medium text-gray-800">Customer Experiences</h3>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <div className="flex gap-0.5 text-[#F5B50A]">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <StarHalf className="h-4 w-4 fill-current" />
                </div>
                <span className="text-sm text-gray-500">Based on 42 reviews</span>
              </div>
            </div>
            <button type="button" className="w-full rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto">
              Write a review
            </button>
          </div>
        </section>
      </div>

      <div
        className={`fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-[120] flex h-full w-full max-w-[420px] flex-col border-l-[4px] border-[#A34336] bg-[#FDFBF9] shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-transform duration-300 max-[420px]:border-l-0 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
        aria-hidden={!cartOpen}
      >
        <div className="relative flex items-center justify-between border-b border-[#A34336]/20 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute inset-1.5 border border-[#A34336]/10" />
          <h2 className="relative z-10 flex items-center gap-2 text-lg font-medium text-[#333333]">
            <ShoppingCart className="h-5 w-5 text-[#A34336]" />
            Your Cart (1)
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-[#A34336]/5 hover:text-[#A34336]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          <div className="group relative flex min-w-0 gap-3 border border-[#A34336]/20 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
            <div className="pointer-events-none absolute inset-1 border border-[#A34336]/10" />
            <img src={mainImage.replace('w=1000', 'w=180')} className="relative z-10 h-24 w-16 shrink-0 border border-gray-200 object-cover shadow-sm sm:h-28 sm:w-20" alt="Soft Silk Woven Zari Saree" />
            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <h3 className="min-w-0 pr-2 text-[13px] font-medium leading-tight text-[#333333] sm:text-[14px]">Soft Silk Woven Zari Saree</h3>
                <button type="button" className="shrink-0 text-gray-400 transition hover:text-red-500" aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-[12px] text-gray-500">Color: {selectedColor}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex h-8 w-20 items-center overflow-hidden border border-[#A34336]/30 bg-white">
                  <button type="button" className="flex h-full w-1/3 items-center justify-center text-xs text-gray-600 transition hover:bg-[#A34336]/10" onClick={() => updateQty(-1)} aria-label="Decrease cart quantity">
                    <Minus className="h-3 w-3" />
                  </button>
                  <input value={qty} readOnly className="h-full w-1/3 border-none bg-transparent text-center text-xs font-medium text-[#A34336] outline-none" aria-label="Cart quantity" />
                  <button type="button" className="flex h-full w-1/3 items-center justify-center text-xs text-gray-600 transition hover:bg-[#A34336]/10" onClick={() => updateQty(1)} aria-label="Increase cart quantity">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-[15px] font-semibold text-[#A34336]">₹ 2,580.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-auto border-t border-[#A34336]/20 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="pointer-events-none absolute inset-1.5 border border-[#A34336]/10" />
          <div className="relative z-10">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium uppercase tracking-wider text-[#333333]">Subtotal</span>
              <span className="text-xl font-bold text-[#A34336]">{subtotal}</span>
            </div>
            <p className="mb-5 text-[12px] text-gray-500">Tax included. Shipping calculated at checkout.</p>
            <button type="button" className="w-full bg-[#A34336] py-3.5 text-[14px] font-medium uppercase tracking-wider text-white shadow-md transition duration-300 hover:bg-[#8e382b]">
              CHECKOUT
            </button>
            <button type="button" onClick={() => setCartOpen(false)} className="mt-4 w-full text-center text-[13px] font-medium uppercase tracking-wider text-gray-500 transition hover:text-[#A34336]">
              Continue Shopping
            </button>
          </div>
        </div>
      </aside>
    </main>
  )
}
