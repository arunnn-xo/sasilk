'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, Leaf, LockKeyhole, Mail, MapPin, ShieldCheck, Sparkles, Truck, UserRound } from 'lucide-react'
import { registerCustomer } from '@/lib/api/auth'

type SignupFields = {
  name: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
  terms: boolean
}

type SignupErrors = Partial<Record<keyof SignupFields, string>>

const initialFields: SignupFields = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  terms: false,
}

function validateSignup(fields: SignupFields) {
  const errors: SignupErrors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!fields.name.trim()) errors.name = 'Full name is required.'
  if (!fields.email.trim()) errors.email = 'Email address is required.'
  if (fields.email.trim() && !emailPattern.test(fields.email.trim())) errors.email = 'Enter a valid email address.'
  if (!fields.password) {
    errors.password = 'Password is required.'
  } else if (fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  } else if (/\s/.test(fields.password)) {
    errors.password = 'Password cannot contain spaces.'
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Password must contain at least one uppercase letter.'
  } else if (!/[a-z]/.test(fields.password)) {
    errors.password = 'Password must contain at least one lowercase letter.'
  } else if (!/\d/.test(fields.password)) {
    errors.password = 'Password must contain at least one digit.'
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(fields.password)) {
    errors.password = 'Password must contain at least one special character.'
  }
  if (!fields.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  if (fields.password && fields.confirmPassword && fields.password !== fields.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  if (!fields.terms) errors.terms = 'Please accept the account terms.'

  const digits = fields.mobile.trim().replace(/\D/g, '')
  if (!fields.mobile.trim()) errors.mobile = 'Mobile number is required.'
  else if (!/^\d{10}$/.test(digits)) errors.mobile = 'Enter a valid 10-digit mobile number.'

  return errors
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-medium text-[#A34336]">{message}</p> : null
}

export default function SignupPage() {
  const router = useRouter()
  const [fields, setFields] = useState(initialFields)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [toast, setToast] = useState('')
  const [apiError, setApiError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    setApiError('')
    const nextErrors = validateSignup(fields)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      setSubmitting(true)
      try {
        await registerCustomer({
          name: fields.name.trim(),
          email: fields.email.trim(),
          mobile: fields.mobile.trim(),
          password: fields.password,
        })
        setToast('Account created successfully')
        setFields(initialFields)
        window.setTimeout(() => {
          setToast('');
          router.push('/login');
        }, 1500)
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Unable to create account right now.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <main className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 antialiased">
      {/* Background Image with Soil Goddess Luxury Silk Gradient */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/auth_luxury_bg.jpg" 
          alt="Soil Goddess Luxury Background" 
          className="h-full w-full object-cover object-center filter brightness-[0.95]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
      </div>

      {/* Centered Signup Container */}
      <div className="relative z-10 w-full max-w-[540px] overflow-hidden rounded-2xl border border-white/30 bg-white/95 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-lg sm:p-10 md:p-12">
        <div className="mb-8 text-center">
          <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.25em] text-[#6B1A2A]">Soil Goddess</p>
          <h1 className="font-playfair mt-1 text-3xl sm:text-4xl font-semibold tracking-wide text-gray-900">Create Account</h1>
          <p className="font-sans mt-2 text-sm text-gray-600 font-medium">Join us & keep your saree journey beautifully organized.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="signup-name">
              Full name <span className="text-[#A34336]">*</span>
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="signup-name"
                value={fields.name}
                onChange={event => updateField('name', event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                placeholder="Enter your full name"
              />
            </div>
            <FieldError message={errors.name} />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="signup-email">
              Email address <span className="text-[#A34336]">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="signup-email"
                type="email"
                value={fields.email}
                onChange={event => updateField('email', event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                placeholder="you@example.com"
              />
            </div>
            <FieldError message={errors.email} />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="signup-mobile">
              Mobile number <span className="text-[#A34336]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">+91</span>
              <input
                id="signup-mobile"
                type="tel"
                inputMode="numeric"
                value={fields.mobile}
                onChange={event => updateField('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                placeholder="98765 43210"
              />
            </div>
            <FieldError message={errors.mobile} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="signup-password">
                Password <span className="text-[#A34336]">*</span>
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={fields.password}
                  onChange={event => updateField('password', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-10 pr-9 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                  placeholder="Min 6 chars"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B1A2A]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-700" htmlFor="signup-confirm">
                Confirm password <span className="text-[#A34336]">*</span>
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={fields.confirmPassword}
                  onChange={event => updateField('confirmPassword', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white/80 py-3 pl-10 pr-9 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#6B1A2A] focus:bg-white focus:ring-1 focus:ring-[#6B1A2A]"
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B1A2A]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={errors.confirmPassword} />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={fields.terms}
                onChange={event => updateField('terms', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#6B1A2A] transition cursor-pointer"
              />
              <span className="text-xs leading-relaxed text-gray-600 group-hover:text-gray-900">
                I agree to receive order updates and accept the Soil Goddess <a href="/terms-conditions" className="font-semibold text-[#6B1A2A] hover:underline">account terms</a>.
              </span>
            </label>
            <FieldError message={errors.terms} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#6B1A2A] py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md transition hover:bg-[#521220] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="absolute inset-0 z-0 origin-left scale-x-0 bg-[#3b0b15] transition-transform duration-500 group-hover:scale-x-100" />
            <span className="relative z-10 flex items-center gap-2">
              {submitting ? 'Creating Account...' : 'Create Account'}
              <Sparkles className="h-4 w-4" />
            </span>
          </button>

          {apiError ? <p className="text-center text-xs font-medium text-[#A34336]">{apiError}</p> : null}
        </form>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-200/80 pt-5 text-xs text-gray-600 sm:flex-row">
          <Link href="/login" className="font-semibold text-[#6B1A2A] hover:underline">
            Already have an account? Sign in
          </Link>
          <Link href="/cart" className="font-medium text-gray-500 hover:text-gray-800">
            Continue as guest
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900/90 backdrop-blur-md px-6 py-3 text-white shadow-2xl transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 pointer-events-none opacity-0'}`}>
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <span className="text-sm font-medium tracking-wide">{toast || 'Account created successfully'}</span>
      </div>
    </main>
  )
}
