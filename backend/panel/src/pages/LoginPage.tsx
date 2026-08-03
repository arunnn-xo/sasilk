import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { adminLogin } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const errors: { email?: string; password?: string } = {}
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.'
    }
    if (!password) {
      errors.password = 'Password is required.'
    }
    return errors
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      await adminLogin({ email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-12 text-[var(--text)]">
      {/* Full Screen Generated Traditional Zari Background Wallpaper */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('/modern-admin-bg.jpg')` }}
      />
      {/* Dark Vignette Overlay for perfect readability */}
      <div className="absolute inset-0 z-1 bg-black/65 backdrop-blur-[3px]" />

      {/* Centered Luxury Login Card */}
      <div className="relative z-10 w-full max-w-[430px]">
        <form 
          onSubmit={submit} 
          className="w-full rounded-2xl border border-white/20 bg-white/10 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-10" 
          noValidate
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 w-52 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Soil Goddess Logo" className="w-full h-full object-contain scale-[1.85]" />
            </div>
            <p className="text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-blue-300 drop-shadow-md">
              Admin Portal
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white drop-shadow-md">
              Welcome Back
            </h2>
            <p className="mt-1 text-[13px] text-slate-300">
              Sign in to manage orders & inventory
            </p>
          </div>

          {/* Email */}
          <label className="mb-5 block">
            <span className="mb-2 block text-[12.5px] font-bold uppercase tracking-wider text-slate-300">
              Email Address <span className="text-red-400">*</span>
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`w-full rounded-xl !pl-[38px] py-3 text-[14.5px] bg-white/5 border text-white placeholder-slate-400 transition-all focus:bg-white/10 focus:ring-2 focus:ring-blue-400/50 ${
                  fieldErrors.email ? 'border-red-500' : 'border-white/20'
                }`}
                type="email"
                value={email}
                onChange={event => {
                  setEmail(event.target.value)
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }))
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {fieldErrors.email ? (
              <p className="mt-1.5 text-[12.5px] font-semibold text-red-400">{fieldErrors.email}</p>
            ) : null}
          </label>

          {/* Password */}
          <label className="mb-7 block">
            <span className="mb-2 block text-[12.5px] font-bold uppercase tracking-wider text-slate-300">
              Password <span className="text-red-400">*</span>
            </span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`w-full rounded-xl !pl-[38px] !pr-[38px] py-3 text-[14.5px] bg-white/5 border text-white placeholder-slate-400 transition-all focus:bg-white/10 focus:ring-2 focus:ring-blue-400/50 ${
                  fieldErrors.password ? 'border-red-500' : 'border-white/20'
                }`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => {
                  setPassword(event.target.value)
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }))
                }}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="mt-1.5 text-[12.5px] font-semibold text-red-400">{fieldErrors.password}</p>
            ) : null}
          </label>

          {/* Error */}
          {error ? (
            <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-5 py-3.5 text-[14.5px] font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:brightness-110 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 bg-gradient-to-r from-blue-600 to-blue-800 border border-blue-400/30"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
