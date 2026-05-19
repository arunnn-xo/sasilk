import type { Metadata } from 'next'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import ProductCard, { type ProductCardProduct } from '@/components/product/ProductCard'

export const metadata: Metadata = {
  title: 'Wishlist | SOIL GODDESS',
  description: 'View your saved SOIL GODDESS products.',
}

const wishlistProducts: ProductCardProduct[] = [
  {
    name: 'Soft Silk Woven Zari Saree',
    category: 'Sarees',
    fabric: 'Silk',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=900',
    price: 2580,
    oldPrice: 5160,
    badge: 'Bestseller',
    rating: 4.8,
    reviews: 42,
  },
  {
    name: 'Organic Chettinad Cotton Saree',
    category: 'Sarees',
    fabric: 'Cotton',
    occasion: 'Daily',
    image: '/saree4.png',
    price: 1350,
    badge: 'New',
    rating: 4.8,
    reviews: 31,
  },
  {
    name: 'Lotus Linen Office Saree',
    category: 'Sarees',
    fabric: 'Linen',
    occasion: 'Office',
    image: '/saree5.png',
    price: 3890,
    oldPrice: 4590,
    badge: 'Sale',
    rating: 4.5,
    reviews: 11,
  },
  {
    name: 'Zari Tassel Potli Bag',
    category: 'Accessories',
    fabric: 'Silk',
    occasion: 'Festive',
    image: 'https://images.unsplash.com/photo-1620242273111-c918ffce8231?auto=format&fit=crop&q=80&w=900',
    price: 890,
    oldPrice: 1290,
    badge: 'Sale',
    rating: 4.3,
    reviews: 12,
  },
]

export default function WishlistRoute() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-[#FAF6EE] text-[#2A1A1E]">
        <section className="border-b border-[#E8DCC4] bg-[#4A0F1C]">
          <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[#E8C97E]">Saved Pieces</p>
            <h1 className="text-4xl font-semibold text-[#FAF6EE] sm:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              Wishlist
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F5EDD6]">
              Your saved SOIL GODDESS products stay ready here for the next time you want to compare, style, or purchase.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-2 rounded-lg border border-[#E8DCC4] bg-white p-4 shadow-[0_12px_34px_rgba(74,15,28,0.05)] sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-[#6B1A2A]">Showing {wishlistProducts.length} saved products</p>
            <p className="text-xs text-[#7A6065]">UI-only wishlist preview for now.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {wishlistProducts.map(product => (
              <ProductCard key={product.name} product={product} wished />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}
