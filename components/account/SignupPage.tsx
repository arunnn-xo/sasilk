'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { CheckCircle2, Leaf, LockKeyhole, Mail, ShieldCheck, Sparkles, Truck, UserRound } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type SignupFields = {
  firstName: string
  lastName: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
  terms: boolean
}

type SignupErrors = Partial<Record<keyof SignupFields, string>>
type ToastState = {
  message: string
  type: 'success' | 'error'
}

const initialFields: SignupFields = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  terms: false,
}

const ACCOUNT_READY_KEY = 'soil_goddess_account_ready'

function validateSignup(fields: SignupFields) {
  const errors: SignupErrors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const mobilePattern = /^(\+91)?[6-9]\d{9}$/

  if (!fields.firstName.trim()) errors.firstName = 'First name is required.'
  if (!fields.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!fields.email.trim()) errors.email = 'Email address is required.'
  if (fields.email.trim() && !emailPattern.test(fields.email.trim())) errors.email = 'Enter a valid email address.'
  if (!fields.mobile.trim()) errors.mobile = 'Mobile number is required.'
  if (fields.mobile.trim() && !mobilePattern.test(fields.mobile.trim())) errors.mobile = 'Enter a valid 10-digit mobile number.'
  if (!fields.password) errors.password = 'Password is required.'
  if (fields.password && fields.password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (!fields.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  if (fields.password && fields.confirmPassword && fields.password !== fields.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!fields.terms) errors.terms = 'Please accept the account terms.'

  return errors
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-medium text-[#A34336]">{message}</p> : null
}

export default function SignupPage() {
  const router = useRouter()
  const [fields, setFields] = useState(initialFields)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trustItems = useMemo(
    () => [
      { Icon: ShieldCheck, label: 'Secure profile' },
      { Icon: Truck, label: 'Faster checkout' },
      { Icon: Leaf, label: 'Saved wishlist' },
    ],
    [],
  )

  function updateField<Key extends keyof SignupFields>(key: Key, value: SignupFields[Key]) {
    setFields(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateSignup(fields)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const response = await apiFetch('/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          phone: fields.mobile.trim(),
          password: fields.password,
          confirmPassword: fields.confirmPassword,
          acceptTerms: fields.terms,
        }),
      })

      const data = (await response.json().catch(() => null)) as { message?: string } | null
      const message = data?.message || (response.ok ? 'Account created successfully' : 'Unable to create account')

      if (!response.ok) {
        setToast({ message, type: 'error' })
        window.setTimeout(() => setToast(null), 3500)
        return
      }

      setToast({ message, type: 'success' })
      window.localStorage.setItem(ACCOUNT_READY_KEY, 'true')
      setFields(initialFields)
      window.setTimeout(() => router.push('/account'), 900)
      window.setTimeout(() => setToast(null), 3500)
    } catch {
      setToast({ message: 'Backend connection failed. Please check API URL and server status.', type: 'error' })
      window.setTimeout(() => setToast(null), 3500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative overflow-hidden bg-[#FBF9F6]">
      <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] translate-x-28 -translate-y-20 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat opacity-[0.05]" />
      <div className="mx-auto grid min-h-[720px] max-w-[1280px] gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <section className="relative overflow-hidden border border-[#A34336]/15 bg-[#300D14] p-8 text-[#FAF6EE] shadow-[0_18px_42px_rgba(48,13,20,0.14)] md:p-10">
          <div className="pointer-events-none absolute inset-3 border border-[#C4A462]/25" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-[#C4A462]/20" />
          <div className="pointer-events-none absolute -right-8 top-10 h-48 w-48 bg-[url('/sectionicon/white-gold-flowers.png')] bg-contain bg-no-repeat opacity-10" />

          <div className="relative z-10 flex min-h-full flex-col justify-between gap-12">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#C4A462]">SOIL GODDESS Account</p>
              <h1 className="mb-5 text-4xl font-semibold leading-tight md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Keep your saree journey beautifully organized.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[#E8DFD0]">
                Create your account to save addresses, revisit favorite drapes, and move through checkout with a calm, crafted experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {trustItems.map(({ Icon, label }) => (
                <div key={label} className="border border-[#C4A462]/25 bg-white/[0.04] p-4">
                  <Icon className="mb-3 h-5 w-5 text-[#C4A462]" />
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-x border-b border-t-[4px] border-[#EAD3CE] bg-white p-5 shadow-[0_10px_32px_rgba(0,0,0,0.05)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-2 border border-[#A34336]/10" />
          <div className="relative z-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#A34336]/10 text-[#A34336]">
                <UserRound className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-3xl font-medium text-[#333333]">Create Account</h2>
              <p className="text-sm text-[#666666]">Use your email and password to start.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="signup-first-name">
                    First Name
                  </label>
                  <input
                    id="signup-first-name"
                    value={fields.firstName}
                    onChange={event => updateField('firstName', event.target.value)}
                    className="w-full border border-[#E8DCC4] bg-[#FBF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#A34336] focus:bg-white"
                    placeholder="First name"
                  />
                  <FieldError message={errors.firstName} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="signup-last-name">
                    Last Name
                  </label>
                  <input
                    id="signup-last-name"
                    value={fields.lastName}
                    onChange={event => updateField('lastName', event.target.value)}
                    className="w-full border border-[#E8DCC4] bg-[#FBF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#A34336] focus:bg-white"
                    placeholder="Last name"
                  />
                  <FieldError message={errors.lastName} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="signup-email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A34336]" />
                  <input
                    id="signup-email"
                    type="email"
                    value={fields.email}
                    onChange={event => updateField('email', event.target.value)}
                    className="w-full border border-[#E8DCC4] bg-[#FBF9F6] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#A34336] focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>
                <FieldError message={errors.email} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="signup-mobile">
                  Mobile number
                </label>
                <input
                  id="signup-mobile"
                  value={fields.mobile}
                  onChange={event => updateField('mobile', event.target.value)}
                  className="w-full border border-[#E8DCC4] bg-[#FBF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#A34336] focus:bg-white"
                  placeholder="+91 mobile number"
                />
                <FieldError message={errors.mobile} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="signup-password">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A34336]" />
                    <input
                      id="signup-password"
                      type="password"
                      value={fields.password}
                      onChange={event => updateField('password', event.target.value)}
                      className="w-full border border-[#E8DCC4] bg-[#FBF9F6] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#A34336] focus:bg-white"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <FieldError message={errors.password} />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#666666]" htmlFor="signup-confirm">
                    Confirm password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    value={fields.confirmPassword}
                    onChange={event => updateField('confirmPassword', event.target.value)}
                    className="w-full border border-[#E8DCC4] bg-[#FBF9F6] px-4 py-3 text-sm outline-none transition focus:border-[#A34336] focus:bg-white"
                    placeholder="Repeat password"
                  />
                  <FieldError message={errors.confirmPassword} />
                </div>
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm leading-6 text-[#666666]">
                  <input
                    type="checkbox"
                    checked={fields.terms}
                    onChange={event => updateField('terms', event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#A34336]"
                  />
                  <span>I agree to receive order updates and accept the SOIL GODDESS account terms.</span>
                </label>
                <FieldError message={errors.terms} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-[#A34336] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 z-0 origin-left scale-x-0 bg-[#8e382b] transition-transform duration-500 group-hover:scale-x-100" />
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                  <Sparkles className="h-4 w-4" />
                </span>
              </button>
            </form>

            <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-5 text-sm text-[#666666] sm:flex-row">
              <Link href="/account" className="font-medium text-[#A34336] underline-offset-4 hover:underline">
                Already have an account? Sign in
              </Link>
              <Link href="/cart" className="font-medium text-[#A34336] underline-offset-4 hover:underline">
                Continue as guest
              </Link>
            </div>
          </div>
        </section>
      </div>

      <div className={`fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 rounded px-6 py-3 text-white shadow-xl transition-opacity duration-300 ${toast ? 'opacity-100' : 'pointer-events-none opacity-0'} ${toast?.type === 'error' ? 'bg-[#A34336]' : 'bg-black'}`}>
        <CheckCircle2 className={`h-4 w-4 ${toast?.type === 'error' ? 'text-[#F7D7D1]' : 'text-green-400'}`} />
        <span className="text-sm">{toast?.message || 'Account created successfully'}</span>
      </div>
    </main>
  )
}
