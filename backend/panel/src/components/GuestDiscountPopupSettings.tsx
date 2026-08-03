import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Info, Loader2, Tag } from 'lucide-react'
import { apiFetch, listResource } from '../services/api'

export default function GuestDiscountPopupSettings() {
  const queryClient = useQueryClient()

  const { data: listData, isLoading: isFetching } = useQuery({
    queryKey: ['resource', 'settings'],
    queryFn: () => listResource('settings'),
  })

  const existingGuestPopup = listData?.items?.find((i: any) => i.key === 'guest_discount_popup')
  const guestPopupValue = (existingGuestPopup?.value || {}) as Record<string, any>

  const [guestPopupEnabled, setGuestPopupEnabled] = useState(false)
  const [guestPopupDiscount, setGuestPopupDiscount] = useState('')
  const [guestPopupMessage, setGuestPopupMessage] = useState('')

  useEffect(() => {
    if (!isFetching) {
      setGuestPopupEnabled(Boolean(guestPopupValue.enabled))
      setGuestPopupDiscount(guestPopupValue.discountPercentage ? String(guestPopupValue.discountPercentage) : '10')
      setGuestPopupMessage(guestPopupValue.message || 'Register now and get {percentage}% OFF on your purchase!')
    }
  }, [isFetching, existingGuestPopup])

  const saveGuestPopup = useMutation({
    mutationFn: async () => {
      const discountPercentage = Math.min(100, Math.max(0, Number(guestPopupDiscount) || 0))
      const body = {
        key: 'guest_discount_popup',
        value: {
          enabled: guestPopupEnabled,
          discountPercentage,
          message: guestPopupMessage.trim() || 'Register now and get {percentage}% OFF on your purchase!',
        },
      }
      if (existingGuestPopup?.id) {
        return apiFetch(`/admin/settings/${existingGuestPopup.id}`, { method: 'PUT', body: JSON.stringify(body) })
      }
      return apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', 'settings'] })
    },
  })

  useEffect(() => {
    if (saveGuestPopup.isSuccess) {
      const timer = setTimeout(() => {
        saveGuestPopup.reset()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveGuestPopup.isSuccess, saveGuestPopup])

  function handleGuestPopupSubmit(e: FormEvent) {
    e.preventDefault()
    saveGuestPopup.mutate()
  }

  const guestPopupPreview = guestPopupMessage.replace(
    '{percentage}',
    String(guestPopupDiscount || 0),
  )

  if (isFetching) {
    return (
      <section className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex min-h-[120px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Guest Discount Popup</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage the registration discount popup shown to guest visitors.</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-4.5 transition-all ${guestPopupEnabled ? 'border-emerald-200/80 bg-emerald-50/70' : 'border-slate-200/80 bg-slate-50'}`}>
        <div className="flex items-start gap-3">
          <Info className={`mt-0.5 h-5 w-5 shrink-0 ${guestPopupEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
          <div>
            <p className={`text-sm font-bold ${guestPopupEnabled ? 'text-emerald-900' : 'text-slate-700'}`}>
              {guestPopupEnabled ? 'Guest Discount Popup is Enabled' : 'Guest Discount Popup is Disabled'}
            </p>
            <p className={`mt-1 text-xs font-semibold ${guestPopupEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
              {guestPopupEnabled
                ? 'Guests (not logged in) will see this popup with the message below.'
                : 'Guests will not see any discount popup.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleGuestPopupSubmit} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-5">
        <div className="space-y-5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={guestPopupEnabled}
              onChange={e => setGuestPopupEnabled(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
            />
            <span className="text-sm font-bold text-slate-800">Enable Guest Discount Popup</span>
          </label>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={guestPopupDiscount}
              onChange={e => setGuestPopupDiscount(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Popup Message</label>
            <input
              type="text"
              value={guestPopupMessage}
              onChange={e => setGuestPopupMessage(e.target.value)}
              placeholder="Register now and get {percentage}% OFF on your purchase!"
              className="w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Use <code className="rounded-md bg-slate-200/60 px-1.5 py-0.5 text-slate-700 font-mono">{'{percentage}'}</code> as a placeholder — it will be replaced with the discount percentage above.
            </p>
            <p className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg inline-block border border-amber-200/60">Preview: {guestPopupPreview}</p>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed font-medium">
              When enabled, this discount is applied automatically — no code entry needed — at checkout for a
              customer's first-ever order, as long as they're registered and logged in. Customers can still
              manually switch to a real coupon code instead if one is available. No separate coupon needs to be
              created for this — the percentage above is all that's needed.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saveGuestPopup.isPending}
            className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-6 py-2.5 rounded-full shadow-lg shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {saveGuestPopup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
            Save Changes
          </button>
          {saveGuestPopup.isSuccess && <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">Saved successfully!</span>}
          {saveGuestPopup.isError && <span className="text-xs text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-full">{saveGuestPopup.error.message}</span>}
        </div>
      </form>
    </section>
  )
}
