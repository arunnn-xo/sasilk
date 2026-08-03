import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function ShippingPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6EE]">
      <Header />
      <main className="flex-grow pt-32 pb-16 px-6 md:px-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-[#300D14] text-center uppercase tracking-wider" style={{ fontFamily: '"Playfair Display", serif' }}>
          Shipping Policy
        </h1>
        
        <div className="space-y-10 text-[#300D14]/80 text-[15px] leading-relaxed" style={{ fontFamily: '"Assistant", sans-serif' }}>
          {/* Domestic Shipping */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">Domestic Shipping</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Shipping Charges will be calculated during checkout depending on the destination and weight of the package.</li>
              <li>Our logistic Courier Partners are Professional, DTDC, Delivery, Post Office and ST.</li>
              <li>Orders are delivered within 5 to 15 working days or earlier from the date of the order.</li>
              <li>We ship throughout the week except during Sundays and Public Holidays.</li>
            </ol>
          </section>

          {/* International Shipping */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">International Shipping</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Shipping Charges will be calculated during checkout depending on the destination and weight of the package.</li>
              <li>Our logistic Partner is DHL & FedEx & others.</li>
              <li>Orders are delivered within 14 to 20 working days or earlier from the date of the order.</li>
              <li>We ship throughout the week except during Sundays and Public Holidays.</li>
              <li>Any additional Taxes/Import Duties/Customs charges levied by the country of import will be borne by the customer. The customer is liable to reimburse the carrier for any such charges paid by carrier on behalf of the customer.</li>
            </ol>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-[#300D14] uppercase tracking-wide">Disclaimer</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                Our products are packed in a secure tamper proof packaging. If you find the package is tampered, Please do not accept delivery and return it back to the delivery person.<br/>
                <span className="block mt-2">Please email us at <strong className="text-[#300D14]">info@soilgoddess.com</strong> mentioning your Order ID and we'll do the needful.</span>
                <span className="block mt-2">If the delivery has been accepted, it will be assumed that the package was received in a secure manner.</span>
              </li>
              <li>We are not liable for any delays in delivery by the courier company. But will definitely support our customer to track down a package through our logistic partner.</li>
            </ol>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
