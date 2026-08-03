'use client'

import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ProductCard from '@/components/product/ProductCard'
import { useWishlist } from '@/lib/context/WishlistContext'

export default function WishlistRoute() {
  const { items } = useWishlist()

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-[#FAF6EE] text-[#2A1A1E] min-h-screen">
        <section className="border-b border-[#D9B86E]/50 bg-[#FAF6EE]">
          <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 md:py-14 lg:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#A57C3A]">Saved Pieces</p>
            <h1 className="text-3xl font-bold text-[#300D14] sm:text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              Wishlist
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5A4045]">
              Your saved SOIL GODDESS products stay ready here for the next time you want to compare, style, or purchase.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-2 rounded-xl border border-[#D9B86E]/60 bg-white p-4.5 shadow-[0_4px_16px_rgba(42,26,30,0.04)] sm:flex-row sm:items-center">
            <p className="text-sm font-bold text-[#300D14]">Showing {items.length} saved products</p>
          </div>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {items.map(item => (
                <ProductCard
                  key={item.productId}
                  product={{
                    name: item.name,
                    category: '',
                    fabric: '',
                    occasion: '',
                    image: item.imageUrl,
                    price: item.price,
                    href: `/products/${item.slug}`,
                  }}
                  wished
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#D9B86E]/60 bg-white p-12 text-center shadow-[0_12px_34px_rgba(42,26,30,0.06)]">
              <h2 className="text-3xl font-bold text-[#300D14]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Your wishlist is empty
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5A4045]">
                Browse our collection and save your favorite pieces here.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}
