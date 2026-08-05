import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import WishlistContent from '@/components/wishlist/WishlistContent'

export const metadata: Metadata = {
  title: 'Wishlist | Soil Goddess',
  description: 'View your saved Soil Goddess products.',
}

export default function WishlistRoute() {
  return (
    <>
      <Header />
      <main className="bg-[#FAF6EE] text-[#2A1A1E]">
        <section className="border-b border-[#E8DCC4] bg-[#4A0F1C]">
          <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <p className="font-montserrat mb-3 text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#E8C97E]">Saved Pieces</p>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide text-[#FAF6EE]">
              Wishlist
            </h1>
            <p className="font-sans mt-4 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-[#F5EDD6]">
              Your saved Soil Goddess products stay ready here for the next time you want to compare, style, or purchase.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <WishlistContent />
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}
