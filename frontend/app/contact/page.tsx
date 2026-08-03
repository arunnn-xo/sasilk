import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { MapPin, Mail, MessageCircle, Globe } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6EE]">
      <Header />
      <main className="flex-grow pt-32 pb-16 px-6 md:px-10 max-w-4xl mx-auto w-full flex flex-col items-center">
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#300D14] uppercase tracking-wider" style={{ fontFamily: '"Playfair Display", serif' }}>
          Contact Us
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-12 text-[#9C1D21]" style={{ fontFamily: '"Playfair Display", serif' }}>
          Soil Goddess by Sri Akila
        </h2>
        
        <div className="flex flex-col items-start gap-6 mb-16 w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-[#DAAC57]/20" style={{ fontFamily: '"Assistant", sans-serif' }}>
          
          <div className="flex items-center gap-4 text-[#300D14] text-[16px] md:text-[18px]">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#DAAC57]/10 text-[#DAAC57]">
              <MapPin className="w-5 h-5" />
            </div>
            <span>Coimbatore, Tamil Nadu</span>
          </div>

          <Link href="mailto:care@soilgoddess.com" className="flex items-center gap-4 text-[#300D14] text-[16px] md:text-[18px] hover:text-[#9C1D21] transition-colors no-underline">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#DAAC57]/10 text-[#DAAC57]">
              <Mail className="w-5 h-5" />
            </div>
            <span>care@soilgoddess.com</span>
          </Link>

          <Link href="https://wa.me/919444199944" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-[#300D14] text-[16px] md:text-[18px] hover:text-[#25D366] transition-colors no-underline group">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span>+91 94441-99944</span>
          </Link>

          <Link href="/" className="flex items-center gap-4 text-[#300D14] text-[16px] md:text-[18px] hover:text-[#9C1D21] transition-colors no-underline">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#DAAC57]/10 text-[#DAAC57]">
              <Globe className="w-5 h-5" />
            </div>
            <span>www.soilgoddess.com</span>
          </Link>

        </div>

        <div className="max-w-2xl mx-auto text-center p-8 bg-[#300D14] rounded-xl shadow-md text-[#FAF6EE]" style={{ fontFamily: '"Assistant", sans-serif' }}>
          <p className="text-[16px] md:text-[18px] leading-relaxed italic">
            "We believe in honest materials, and lasting relationships with our customers. Thank you for supporting handcrafted and natural products."
          </p>
        </div>

      </main>
      <Footer />
    </div>
  )
}
