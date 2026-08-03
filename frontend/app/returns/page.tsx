import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { AlertCircle } from 'lucide-react'

export default function ReturnsPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6EE]">
      <Header />
      <main className="flex-grow pt-32 pb-16 px-6 md:px-10 max-w-4xl mx-auto w-full">
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#300D14] text-center uppercase tracking-wider" style={{ fontFamily: '"Playfair Display", serif' }}>
          Return & Refund Policy
        </h1>
        <p className="text-center text-[#9C1D21] font-medium mb-12">Effective Date: June 2026</p>
        
        <div className="space-y-10 text-[#300D14]/80 text-[15px] leading-relaxed" style={{ fontFamily: '"Assistant", sans-serif' }}>
          
          <div className="bg-white p-6 md:p-8 rounded-xl border border-[#DAAC57]/20 shadow-sm text-center italic text-[16px]">
            "At Soil Goddess by Sri Akila, every piece is crafted with natural fabrics, handloom traditions, and earth-sourced materials. We take great care in delivering products that honour this ethos. Please read our policy carefully before placing your order."
          </div>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">1. Our Commitment</h2>
            <p>We want you to love what you receive. If something isn't right, we're here to make it better — within the terms below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">2. Eligible Items for Return</h2>
            <p className="mb-4">Returns are accepted only in the following cases:</p>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Damaged or defective product received (torn, stained, or broken on arrival)</li>
              <li>Wrong item sent (different product, colour, or size than ordered)</li>
              <li>Missing item in your package</li>
            </ul>
            <div className="bg-[#FFF4F4] p-4 rounded-lg flex items-start gap-3 border border-[#9C1D21]/20">
              <AlertCircle className="w-6 h-6 text-[#9C1D21] shrink-0 mt-0.5" />
              <p className="text-[#9C1D21] font-medium text-[14px]">
                <strong className="font-bold">Note:</strong> Due to the handcrafted and natural nature of our products, slight variations in weave, texture, colour, or finish are not defects — they are the hallmark of authentic artisan work.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">3. Non-Returnable Items</h2>
            <p className="mb-4">The following cannot be returned or exchanged:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Products that have been used, washed, or worn</li>
              <li>Items without original packaging or tags</li>
              <li>Cosmetics and personal care products (hygiene reasons)</li>
              <li>Jewellery, once worn</li>
              <li>Products purchased during sales, discounts, or with coupon codes, as well as items from clearance sales, are non-returnable and non-exchangeable</li>
              <li>Custom or made-to-order products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">4. Return Window</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Returns must be raised within 48 hours of delivery</li>
              <li>Requests raised after 48 hours will not be entertained</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">5. How to Return Your Product</h2>
            <ul className="list-disc pl-5 space-y-4 mb-6">
              <li><strong className="text-[#300D14]">360-Degree unboxing Video:</strong> Please take a 360 degree video of unboxing or opening video of the package for any claims. Without this video exchange/return is not possible. Send us the unboxing video and a photo showing the condition of the product.</li>
              <li><strong className="text-[#300D14]">Pickup:</strong> If you choose the reverse pickup option, please ensure the product is unused, unwashed, and all original tags are still attached.</li>
              <li><strong className="text-[#300D14]">Self-Ship:</strong> If we are unable to offer pickup in your area, you may ship the item back at your own cost. Please include your order number and return ID in the package.</li>
            </ul>
            
            <div className="bg-white p-6 rounded-xl border border-[#DAAC57]/20 shadow-sm mt-6">
              <ul className="list-disc pl-5 space-y-3">
                <li>Email us at <strong className="text-[#300D14]">care@soilgoddess.com</strong> or WhatsApp us at <strong className="text-[#300D14]">+91 94441-99944</strong> within 48 hours of delivery</li>
                <li>Share your Order ID, a brief description of the issue, and clear photos/videos of the product</li>
                <li>Our team will review and respond within 2 business days</li>
                <li>If approved, we'll arrange a reverse pickup (where serviceable) or guide you through self-shipping</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">6. Refund Process</h2>
            <p className="mb-4">Once your return is received and inspected:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Approved refunds will be processed within 5–7 business days</li>
              <li>Refund will be credited to your original payment method (UPI, bank account, card)</li>
              <li>Shipping charges are non-refundable unless the return is due to our error.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">7. Exchange Policy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We offer one-time size exchange for eligible sarees and clothing, subject to stock availability. Exchange requests follow the same 48-hour window and video-verification process.</li>
              <li>All shipping costs for exchange, both sending back and receiving the new size are borne by the customer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">8. Cancellations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Orders can be cancelled before they are shipped</li>
              <li>Once shipped, cancellation is not possible.</li>
            </ul>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
