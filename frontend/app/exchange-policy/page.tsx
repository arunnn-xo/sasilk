import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function ExchangePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6EE]">
      <Header />
      <main className="flex-grow pt-32 pb-16 px-6 md:px-10 max-w-3xl mx-auto w-full">
        
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-[#300D14] text-center uppercase tracking-wider" style={{ fontFamily: '"Playfair Display", serif' }}>
          Exchange Policy
        </h1>
        
        <div className="space-y-8 text-[#300D14]/80 text-[15px] leading-relaxed" style={{ fontFamily: '"Assistant", sans-serif' }}>
          
          <div className="bg-white p-6 md:p-8 rounded-xl border border-[#DAAC57]/20 shadow-sm text-center italic mb-10">
            "We want you to be completely satisfied with your purchase. If you need to return an item, please read through our return and refund policies below to ensure a smooth process."
          </div>

          <p className="text-[16px] md:text-[18px] mb-6 text-center text-[#300D14] font-medium">
            To initiate an exchange, here’s how the process works:
          </p>

          <div className="space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-xl border border-[#DAAC57]/20 shadow-sm relative overflow-hidden group hover:border-[#DAAC57]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#9C1D21]"></div>
              <h3 className="text-lg font-bold text-[#9C1D21] mb-2 uppercase tracking-wide">Exchange Approval</h3>
              <p>
                Once your exchange request is approved, our courier will pick up the item. If we are unable to offer pickup in your area, you may ship the item back at your own cost. Please include your order number in the package.
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl border border-[#DAAC57]/20 shadow-sm relative overflow-hidden group hover:border-[#DAAC57]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#DAAC57]"></div>
              <h3 className="text-lg font-bold text-[#9C1D21] mb-2 uppercase tracking-wide">Return Verification</h3>
              <p>
                After receiving the returned item, our team will verify its condition and contact you via whatsapp.
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl border border-[#DAAC57]/20 shadow-sm relative overflow-hidden group hover:border-[#DAAC57]/50 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#46510E]"></div>
              <h3 className="text-lg font-bold text-[#9C1D21] mb-2 uppercase tracking-wide">Processing Time</h3>
              <p>
                The entire process may take 7-15 working days.
              </p>
            </div>

          </div>

          <div className="mt-16 pt-8 border-t border-[#DAAC57]/30 text-center">
            <p className="mb-4 text-[16px]">
              For any assistance, feel free to reach us at <strong className="text-[#300D14]">care@soilgoddess.com</strong>
            </p>
            <p className="font-semibold text-[#9C1D21] text-xl font-playfair mt-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              Thank you for shopping with Soil Goddess by Sri Akila!
            </p>
          </div>
          
        </div>
      </main>
      <Footer />
    </div>
  )
}
