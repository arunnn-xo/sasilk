import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Loader2, Truck, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, listResource } from '../services/api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: listData, isLoading: isFetching } = useQuery({
    queryKey: ['resource', 'settings'],
    queryFn: () => listResource('settings'),
  })

  const existingShipping = listData?.items?.find((i: any) => i.key === 'shipping_config')
  const shippingValue = (existingShipping?.value || {}) as Record<string, any>

  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('')

  useEffect(() => {
    if (!isFetching) {
      setFreeShippingEnabled(Boolean(shippingValue.freeShippingEnabled))
      setFreeShippingThreshold(shippingValue.freeShippingThreshold ? String(shippingValue.freeShippingThreshold) : '')
    }
  }, [isFetching, existingShipping])

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveShipping.mutate()
  }

  const effectiveThreshold = freeShippingEnabled ? (Number(freeShippingThreshold) || 0) : 0
  const isFreeForAll = freeShippingEnabled && effectiveThreshold === 0

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[var(--burgundy)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--burgundy)]/10 text-[var(--burgundy)]">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipping Status</h1>
          <p className="text-sm text-gray-500">Manage free shipping configuration</p>
        </div>
      </div>

      {/* Current Status Banner */}
      <div className={`mb-6 rounded-lg border p-4 ${freeShippingEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
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

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
          <button
            type="submit"
            disabled={saveShipping.isPending}
            className="inline-flex items-center gap-2 rounded bg-[var(--burgundy)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--burgundy-dark)] disabled:opacity-50"
          >
            {saveShipping.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
          {saveShipping.isSuccess && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          {saveShipping.isError && <span className="text-sm text-red-500">{saveShipping.error.message}</span>}
        </div>
      </form>
    </div>
  )
}
