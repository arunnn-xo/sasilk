import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Film,
  Info,
  Loader2,
  Package,
  Settings,
  Truck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  apiFetch,
  listResource,
} from '../services/api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Retrieve settings list
  const { data: listData, isLoading: isFetching } = useQuery({
    queryKey: ['resource', 'settings'],
    queryFn: () => listResource('settings'),
  })

  // ─── Existing Shipping Configuration ──────────────────────────────────────
  const existingShipping = listData?.items?.find((i: any) => i.key === 'shipping_config')
  const shippingValue = (existingShipping?.value || {}) as Record<string, any>

  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('')

  // ─── Existing New Arrivals Configuration ──────────────────────────────────
  const existingNewArrivals = listData?.items?.find((i: any) => i.key === 'home_new_arrivals_config')
  const newArrivalsValue = (existingNewArrivals?.value || {}) as Record<string, any>

  const [newArrivalsEnabled, setNewArrivalsEnabled] = useState(false)
  const [newArrivalsLimit, setNewArrivalsLimit] = useState('')
  const [newArrivalsTouched, setNewArrivalsTouched] = useState(false)

  const newArrivalsLimitNum = parseInt(newArrivalsLimit, 10)
  const newArrivalsLimitValid = !isNaN(newArrivalsLimitNum) && newArrivalsLimitNum >= 1 && newArrivalsLimitNum <= 12

  // ─── Existing Intro Video Status ──────────────────────────────────────────
  const existingIntroVideo = listData?.items?.find((i: any) => i.key === 'intro_video_config')
  const introVideoValue = (existingIntroVideo?.value || {}) as Record<string, any>
  const introVideoActive = Boolean(introVideoValue?.enabled)

  // ─── State Synchronization ────────────────────────────────────────────────
  useEffect(() => {
    if (!isFetching) {
      // Sync Shipping
      setFreeShippingEnabled(Boolean(shippingValue.freeShippingEnabled))
      setFreeShippingThreshold(shippingValue.freeShippingThreshold ? String(shippingValue.freeShippingThreshold) : '')

      // Sync New Arrivals
      setNewArrivalsEnabled(Boolean(newArrivalsValue.enabled))
      setNewArrivalsLimit(newArrivalsValue.limit != null ? String(newArrivalsValue.limit) : '4')
    }
  }, [isFetching, existingShipping, existingNewArrivals])

  // ─── Shipping Mutation ────────────────────────────────────────────────────
  const saveShipping = useMutation({
    mutationFn: async () => {
      const threshold = Number(freeShippingThreshold) || 0
      const body = {
        key: 'shipping_config',
        value: {
          freeShippingEnabled,
          freeShippingThreshold: freeShippingEnabled ? threshold : 0,
        },
      }
      if (existingShipping?.id) {
        return apiFetch(`/admin/settings/${existingShipping.id}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      return apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })

  useEffect(() => {
    if (saveShipping.isSuccess) {
      const timer = setTimeout(() => {
        saveShipping.reset()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveShipping.isSuccess, saveShipping])

  // ─── New Arrivals Mutation ────────────────────────────────────────────────
  const saveNewArrivals = useMutation({
    mutationFn: async () => {
      const body = {
        key: 'home_new_arrivals_config',
        value: {
          enabled: newArrivalsEnabled,
          limit: parseInt(newArrivalsLimit, 10) || 4,
        },
      }
      if (existingNewArrivals?.id) {
        return apiFetch(`/admin/settings/${existingNewArrivals.id}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      return apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })

  useEffect(() => {
    if (saveNewArrivals.isSuccess) {
      const timer = setTimeout(() => {
        saveNewArrivals.reset()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveNewArrivals.isSuccess, saveNewArrivals])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveShipping.mutate()
  }

  function handleNewArrivalsSubmit(e: FormEvent) {
    e.preventDefault()
    setNewArrivalsTouched(true)
    if (!newArrivalsLimitValid) return
    saveNewArrivals.mutate()
  }

  const effectiveThreshold = freeShippingEnabled ? Number(freeShippingThreshold) || 0 : 0
  const isFreeForAll = freeShippingEnabled && effectiveThreshold === 0

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[var(--burgundy)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-b border-[#EFE8DA] pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6B1A2A] text-white shadow-md">
          <Settings className="h-6 w-6 text-[#D9B86E]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1F080D]">Settings</h1>
          <p className="text-sm text-[#7A6065]">
            Manage shipping rules, storefront settings, and homepage configurations
          </p>
        </div>
      </div>

      {/* ─── Shipping Status Card ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40 shadow-sm shrink-0">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F080D]">Shipping & Delivery</h2>
            <p className="text-xs sm:text-sm text-[#7A6065]">Manage free shipping threshold and delivery rules</p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div
          className={`rounded-lg border p-4 ${
            freeShippingEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className={`mt-0.5 h-4 w-4 shrink-0 ${freeShippingEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className={`text-sm font-semibold ${freeShippingEnabled ? 'text-green-800' : 'text-gray-700'}`}>
                {freeShippingEnabled ? 'Free Shipping is Enabled' : 'Free Shipping is Disabled'}
              </p>
              {freeShippingEnabled && (
                <p className="mt-1 text-sm text-green-700">
                  {isFreeForAll
                    ? 'All orders get free shipping — no minimum amount required.'
                    : `Orders at or above ₹${effectiveThreshold.toLocaleString('en-IN')} get free shipping.`}
                </p>
              )}
              {!freeShippingEnabled && (
                <p className="mt-1 text-sm text-gray-500">
                  Customers will see shipping charges calculated at checkout.
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={e => setFreeShippingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--burgundy)] focus:ring-[var(--burgundy)]"
              />
              <span className="text-sm font-medium text-gray-700">Enable Free Shipping</span>
            </label>

            {freeShippingEnabled && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Minimum Order Amount for Free Shipping (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={freeShippingThreshold}
                  onChange={e => setFreeShippingThreshold(e.target.value)}
                  placeholder="0 for free shipping on all orders"
                  className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--burgundy)] focus:ring-1 focus:ring-[var(--burgundy)]/30"
                />
                <p className="mt-2 text-xs text-amber-700">
                  {effectiveThreshold === 0
                    ? 'Set to 0 — all orders will get free shipping regardless of cart value.'
                    : `Set to ₹${effectiveThreshold.toLocaleString('en-IN')} — orders below this amount will see normal shipping charges.`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={saveShipping.isPending} className="admin-btn-primary">
              {saveShipping.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save Shipping Settings
            </button>
            {saveShipping.isSuccess && <span className="text-sm text-green-600 font-medium">Saved!</span>}
            {saveShipping.isError && <span className="text-sm text-red-500">{saveShipping.error.message}</span>}
          </div>
        </form>
      </div>

      {/* ─── Storefront Intro Video Shortcut Card ───────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40 shadow-sm shrink-0">
              <Film className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#1F080D]">Storefront Intro Video</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${
                    introVideoActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {introVideoActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7A6065] mt-1">
                Dedicated page for fullscreen video upload, live player preview, skip countdown, and session rules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/intro-video')}
            className="admin-btn-primary inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <span>Manage Intro Video</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Home New Arrivals Configuration Card ──────────────────────── */}
      <form
        onSubmit={handleNewArrivalsSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EFE8DA] space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F8] text-[#6B1A2A] border border-[#D9B86E]/40 shadow-sm shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F080D]">Homepage New Arrivals</h2>
            <p className="text-xs sm:text-sm text-[#7A6065]">Configure product display limit for new arrivals section</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newArrivalsEnabled}
              onChange={e => setNewArrivalsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--burgundy)] focus:ring-[var(--burgundy)]"
            />
            <span className="text-sm font-medium text-gray-700">Enable New Arrivals Section on Homepage</span>
          </label>

          {newArrivalsEnabled && (
            <div className="rounded-md border border-[#EFE8DA] bg-[#FAF6EE]/50 p-4 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6065]">
                Display Limit (1 – 12 products)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={newArrivalsLimit}
                onChange={e => setNewArrivalsLimit(e.target.value)}
                className="w-32 rounded-xl border border-[#EFE8DA] bg-white px-3.5 py-2 text-sm font-medium outline-none transition focus:border-[#6B1A2A] focus:ring-2 focus:ring-[#6B1A2A]/20"
              />
              {newArrivalsTouched && !newArrivalsLimitValid && (
                <p className="text-xs font-semibold text-red-600">Please enter a valid number between 1 and 12.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saveNewArrivals.isPending} className="admin-btn-primary">
            {saveNewArrivals.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save New Arrivals Settings
          </button>
          {saveNewArrivals.isSuccess && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          {saveNewArrivals.isError && <span className="text-sm text-red-500">{saveNewArrivals.error.message}</span>}
        </div>
      </form>
    </div>
  )
}
