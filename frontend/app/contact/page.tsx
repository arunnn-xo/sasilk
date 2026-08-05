'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Mail, Phone, MapPin, Clock, Loader2, Send } from 'lucide-react'
import { submitContactEnquiry } from '@/lib/api/storefront'

interface FormFields {
  name: string
  email: string
  phonenumber: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  phonenumber?: string
  message?: string
}

export default function ContactPage() {
  const [fields, setFields] = useState<FormFields>({
    name: '',
    email: '',
    phonenumber: '',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function validate(data: FormFields): FormErrors {
    const nextErrors: FormErrors = {}
    
    if (!data.name.trim()) {
      nextErrors.name = 'Name is required.'
    } else if (data.name.trim().length > 140) {
      nextErrors.name = 'Name is too long (max 140 characters).'
    }

    if (!data.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    } else if (data.email.trim().length > 190) {
      nextErrors.email = 'Email is too long (max 190 characters).'
    }

    if (!data.phonenumber.trim()) {
      nextErrors.phonenumber = 'Phone number is required.'
    } else if (!/^\d{10}$/.test(data.phonenumber.replace(/\D/g, ''))) {
      nextErrors.phonenumber = 'Please enter a valid 10-digit phone number.'
    }

    if (!data.message.trim()) {
      nextErrors.message = 'Message is required.'
    } else if (data.message.trim().length < 5) {
      nextErrors.message = 'Message must be at least 5 characters long.'
    } else if (data.message.trim().length > 2000) {
      nextErrors.message = 'Message is too long (max 2000 characters).'
    }

    return nextErrors
  }

  function updateField<K extends keyof FormFields>(key: K, value: string) {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
    setStatusMsg(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMsg(null)

    const nextErrors = validate(fields)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      const resp = await submitContactEnquiry({
        name: fields.name.trim(),
        email: fields.email.trim(),
        phonenumber: fields.phonenumber.trim(),
        message: fields.message.trim(),
      })

      if (resp.success) {
        setStatusMsg({ type: 'success', text: resp.message || 'Your enquiry has been submitted successfully!' })
        setFields({ name: '', email: '', phonenumber: '', message: '' })
      } else {
        setStatusMsg({ type: 'error', text: resp.message || 'Something went wrong. Please try again.' })
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to submit enquiry right now. Please try again later.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--ivory)' }}>
        <div className="mx-auto max-w-5xl bg-white p-6 sm:p-8 md:p-12 shadow-sm rounded-md border border-[var(--ivory-dark)]">
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide text-[var(--burgundy)] mb-3">
              Contact Us
            </h1>
            <p className="font-montserrat text-[11px] md:text-xs tracking-[0.25em] uppercase font-bold text-[var(--gold)]">
              We'd love to hear from you
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16">
            {/* Form Section */}
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-medium italic tracking-wide text-[var(--charcoal)] mb-6">
                Send Us a Message
              </h2>
              
              {statusMsg && (
                <div className={`mb-6 p-4 rounded-md border text-sm font-medium ${
                  statusMsg.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {statusMsg.text}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="contact-name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={fields.name}
                    onChange={e => updateField('name', e.target.value)}
                    className={`w-full border px-4 py-3 text-sm outline-none transition rounded focus:bg-white ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-[#E8DCC4] bg-[#FBF9F6] focus:border-[var(--burgundy)]'
                    }`}
                    placeholder="Your full name"
                    disabled={submitting}
                  />
                  {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="contact-email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={fields.email}
                      onChange={e => updateField('email', e.target.value)}
                      className={`w-full border px-4 py-3 text-sm outline-none transition rounded focus:bg-white ${
                        errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#E8DCC4] bg-[#FBF9F6] focus:border-[var(--burgundy)]'
                      }`}
                      placeholder="you@example.com"
                      disabled={submitting}
                    />
                    {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="contact-phone">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={fields.phonenumber}
                      onChange={e => {
                        const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10)
                        e.target.value = sanitized
                        updateField('phonenumber', sanitized)
                      }}
                      onKeyDown={e => {
                        const allowed = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
                        if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return
                        if (!/^\d$/.test(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      className={`w-full border px-4 py-3 text-sm outline-none transition rounded focus:bg-white ${
                        errors.phonenumber ? 'border-red-500 focus:border-red-500' : 'border-[#E8DCC4] bg-[#FBF9F6] focus:border-[var(--burgundy)]'
                      }`}
                      placeholder="10-digit number"
                      disabled={submitting}
                    />
                    {errors.phonenumber && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phonenumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="contact-message">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={fields.message}
                    onChange={e => updateField('message', e.target.value)}
                    className={`w-full border px-4 py-3 text-sm outline-none transition rounded focus:bg-white ${
                      errors.message ? 'border-red-500 focus:border-red-500' : 'border-[#E8DCC4] bg-[#FBF9F6] focus:border-[var(--burgundy)]'
                    }`}
                    placeholder="How can we help you?"
                    disabled={submitting}
                  />
                  {errors.message && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[var(--burgundy)] px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-[var(--burgundy-dark)] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Section */}
            <div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-medium italic tracking-wide text-[var(--charcoal)] mb-6">
                Contact Information
              </h2>
              
              <div className="space-y-6 bg-[var(--ivory)] p-6 sm:p-8 rounded-md border border-[var(--ivory-dark)]">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 mt-0.5 text-[var(--gold)] shrink-0" />
                  <div>
                    <h3 className="font-montserrat font-bold text-[var(--burgundy)] uppercase tracking-[0.2em] text-xs mb-1">Email</h3>
                    <a href="mailto:support@soilgoddess.com" className="text-[#555] hover:text-[var(--burgundy)] transition-colors text-sm sm:text-base break-all">
                      support@soilgoddess.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 mt-0.5 text-[var(--gold)] shrink-0" />
                  <div>
                    <h3 className="font-montserrat font-bold text-[var(--burgundy)] uppercase tracking-[0.2em] text-xs mb-1">Phone / WhatsApp</h3>
                    <a href="tel:+919894229540" className="text-[#555] hover:text-[var(--burgundy)] transition-colors text-sm sm:text-base">
                      +91 98942 29540
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 mt-0.5 text-[var(--gold)] shrink-0" />
                  <div>
                    <h3 className="font-montserrat font-bold text-[var(--burgundy)] uppercase tracking-[0.2em] text-xs mb-1">Business Hours</h3>
                    <p className="text-[#555] text-sm sm:text-base">Monday to Saturday<br />9:00 AM to 6:00 PM (IST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 mt-0.5 text-[var(--gold)] shrink-0" />
                  <div>
                    <h3 className="font-montserrat font-bold text-[var(--burgundy)] uppercase tracking-[0.2em] text-xs mb-1">Address</h3>
                    <p className="text-[#555] leading-relaxed text-sm sm:text-base">
                      Soil Goddess,<br />
                      123, Weaver's Street,<br />
                      Kanchipuram, Tamil Nadu,<br />
                      India - 631501
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
