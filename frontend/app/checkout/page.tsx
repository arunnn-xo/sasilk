import CheckoutForm from '@/components/checkout/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import { CheckoutProvider } from '@/components/checkout/CheckoutContext'

export default function CheckoutPage({ searchParams }: { searchParams?: { buyNow?: string } }) {
  const isBuyNow = !!searchParams?.buyNow

  return (
    <CheckoutProvider>
      <Header />

      {/* Main Checkout Content */}
      <main className="min-h-screen bg-white font-sans text-gray-900 relative">
        {/* Split screen backgrounds for desktop */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none">
          <div className="flex h-full w-full">
            <div className="w-[55%] bg-white h-full" />
            <div className="w-[45%] bg-[#fafafa] border-l border-gray-200 h-full" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl flex flex-col-reverse lg:flex-row">
          
          {/* Left Column: Form Flow */}
          <div className="w-full lg:w-[55%] px-4 sm:px-6 lg:pr-12 xl:pr-16 py-8 sm:py-12 bg-white">
            <CheckoutForm isBuyNow={isBuyNow} />
          </div>

          {/* Right Column: Order Summary (Sticky on Desktop) */}
          <div className="w-full lg:w-[45%] px-4 sm:px-6 lg:pl-12 xl:pl-16 py-8 sm:py-12 bg-[#fafafa] lg:bg-transparent border-b lg:border-b-0 border-gray-200 lg:min-h-screen">
            <div className="lg:sticky lg:top-8">
              <OrderSummary isBuyNow={isBuyNow} />
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <FloatingActions />
    </CheckoutProvider>
  )
}
