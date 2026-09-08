'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, Loader2, Lock, MapPin, X } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/components/cart/CartContext'
import { useAuth } from '@/components/auth/AuthContext'
import { fetchAddresses } from '@/lib/api/auth'
import type { CustomerAddress } from '@/lib/api/auth'
import { apiFetch } from '@/lib/api/client'
import { useCheckout } from './CheckoutContext'
import { fetchShippingConfig, confirmCodOrder, type ShippingConfig } from '@/lib/api/storefront'
import { openCashfreeCheckout } from '@/lib/cashfree'

type Step = 'contact' | 'shipping' | 'payment'

export default function CheckoutForm({ isBuyNow }: { isBuyNow?: boolean }) {
  const router = useRouter()
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart()
  const { session } = useAuth()
  const { shippingTotal, setShippingTotal, shippingCalculated, setShippingCalculated, setIsProcessing, paymentMethod, couponCode } = useCheckout()

  const buyNowRaw = useMemo(() => {
    if (!isBuyNow) return null
    try {
      const raw = sessionStorage.getItem('buyNowItem')
      if (!raw) return null
      const parsed = JSON.parse(raw) as Record<string, unknown>
      // Validate required fields to prevent crashes from corrupted data
      if (!parsed.id || !parsed.name || parsed.price == null || parsed.qty == null) return null
      if (typeof parsed.name !== 'string' || Number(parsed.price) < 0 || Number(parsed.qty) < 1) return null
      return parsed
    } catch { return null }
  }, [isBuyNow])

  const checkoutItems = buyNowRaw ? [buyNowRaw as any] : cartItems
  const checkoutSubtotal = buyNowRaw
    ? Number((buyNowRaw as any).price ?? 0) * Number((buyNowRaw as any).qty ?? 1)
    : cartSubtotal
  const [activeStep, setActiveStep] = useState<Step>('contact')
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([])

  useEffect(() => {
    if (session) {
      setEmail(session.email)
      fetchAddresses().then(data => {
        setSavedAddresses(data.addresses)
        const defaultAddr = data.addresses.find(a => a.isDefault) || data.addresses[0]
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
          setFirstName(defaultAddr.firstName)
          setLastName(defaultAddr.lastName || '')
          setAddress(defaultAddr.address)
          setCity(defaultAddr.city)
          setState(defaultAddr.state)
          setPincode(defaultAddr.pincode)
          setPhone(defaultAddr.phone)
        }
      }).catch(() => {})
    }
  }, [session])

  function handleSelectAddress(addr: CustomerAddress) {
    setSelectedAddressId(addr.id)
    setFirstName(addr.firstName)
    setLastName(addr.lastName || '')
    setAddress(addr.address)
    setCity(addr.city)
    setState(addr.state)
    setPincode(addr.pincode)
    setPhone(addr.phone)
  }

  // Form states
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [phone, setPhone] = useState('')
  const [, setLocalPaymentMethod] = useState('upi')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryInfo, setDeliveryInfo] = useState<{ available: boolean; rate: number; estimatedDays: string; courierName: string } | null>(null)
  const [deliveryChecking, setDeliveryChecking] = useState(false)
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [shipTouched, setShipTouched] = useState<Record<string, boolean>>({})
  const [shipErrors, setShipErrors] = useState<Record<string, string>>({})

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showCodConfirm, setShowCodConfirm] = useState(false)
  const [codOrderId, setCodOrderId] = useState<number | null>(null)
  const [codGuestToken, setCodGuestToken] = useState<string | undefined>(undefined)

  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({ freeShippingEnabled: false, freeShippingThreshold: 0 })

  useEffect(() => {
    fetchShippingConfig().then(setShippingConfig)
  }, [])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchShippingConfig().then(setShippingConfig)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const hasFreeShipping = shippingConfig.freeShippingEnabled && shippingConfig.freeShippingThreshold > 0 && checkoutSubtotal >= shippingConfig.freeShippingThreshold

  function validateShipField(field: string, value: string): string {
    switch (field) {
      case 'firstName': return !value.trim() ? 'First name is required' : value.trim().length < 2 ? 'Enter at least 2 characters' : ''
      case 'address': return !value.trim() ? 'Address is required' : ''
      case 'city': return !value.trim() ? 'City is required' : ''
      case 'state': return !value ? 'Please select a state' : ''
      case 'pincode': return !value.trim() ? 'Pincode is required' : !/^\d{6}$/.test(value.trim()) ? 'Enter a valid 6-digit pincode' : ''
      case 'phone': return !value.trim() ? 'Phone number is required' : !/^\d{10}$/.test(value.trim().replace(/\D/g, '')) ? 'Enter a valid 10-digit phone number' : ''
      default: return ''
    }
  }

  function handleShipBlur(field: string) {
    setShipTouched(p => ({ ...p, [field]: true }))
    const value = { firstName, address, city, state, pincode, phone }[field] || ''
    setShipErrors(p => ({ ...p, [field]: validateShipField(field, value) }))
  }

  function isShippingValid(): boolean {
    const fields = ['firstName', 'address', 'city', 'state', 'pincode', 'phone'] as const
    const values = { firstName, address, city, state, pincode, phone }
    const errs: Record<string, string> = {}
    let valid = true
    fields.forEach(f => {
      const e = validateShipField(f, values[f])
      if (e) { errs[f] = e; valid = false }
    })
    setShipErrors(errs)
    setShipTouched(Object.fromEntries(fields.map(f => [f, true])))
    return valid
  }

  async function calculateShipping(pin: string) {
    if (!pin || pin.length < 6 || checkoutItems.length === 0) return
    setDeliveryChecking(true)
    setDeliveryInfo(null)

    if (hasFreeShipping) {
      setShippingTotal(0)
      setDeliveryInfo({ available: true, rate: 0, estimatedDays: '2-5 business days', courierName: 'Free Shipping' })
      setShippingCalculated(true)
      setDeliveryChecking(false)
      return
    }

    try {
      const data = await apiFetch<{ shippingOptions: Array<{ courierName: string; rate: number; estimatedDays: string }> }>(
        '/storefront/orders/calculate-shipping',
        {
          method: 'POST',
          body: JSON.stringify({
            pincode: pin,
            items: checkoutItems.map(i => ({ weight: (i as any).weightKg ?? 0.5, quantity: i.qty })),
            subtotal: checkoutSubtotal,
            cod: paymentMethod === 'cod',
          }),
        },
      )
      if (data.shippingOptions.length > 0) {
        const lowest = data.shippingOptions.reduce((min, c) => c.rate < min.rate ? c : min)
        setShippingTotal(lowest.rate)
        setDeliveryInfo({ available: true, ...lowest })
        setShippingCalculated(true)
      } else {
        setShippingTotal(0)
        setDeliveryInfo({ available: false, rate: 0, estimatedDays: '', courierName: '' })
        setShippingCalculated(false)
      }
    } catch {
      setShippingTotal(0)
      setDeliveryInfo(null)
      setShippingCalculated(false)
    } finally {
      setDeliveryChecking(false)
    }
  }

  useEffect(() => {
    if (pincode.length === 6) {
      const timer = setTimeout(async () => {
        // 1. Auto-fill city/state from pincode
        try {
          const pincodeData = await apiFetch<{ isValid: boolean; city: string; district: string; state: string }>(
            `/storefront/pincode/${pincode}`,
          )
          if (pincodeData.isValid) {
            setCity(pincodeData.district || pincodeData.city)
            setState(pincodeData.state)
            setPincodeAutoFilled(true)
            setShipErrors(p => ({ ...p, city: '', state: '' }))
          } else {
            setCity('')
            setState('')
            setPincodeAutoFilled(false)
          }
        } catch {
          // Pincode lookup failed
        }
        // 2. Fetch shipping rate from Shiprocket
        calculateShipping(pincode)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setCity('')
      setState('')
      setPincodeAutoFilled(false)
      setShippingCalculated(false)
    }
    setDeliveryInfo(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode])

  // Recalculate shipping when payment method changes (COD vs online affects rates)
  useEffect(() => {
    if (pincode.length === 6) calculateShipping(pincode)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod])

  // Update shipping when free shipping threshold is crossed
  useEffect(() => {
    if (hasFreeShipping && shippingCalculated) {
      setShippingTotal(0)
      setDeliveryInfo({ available: true, rate: 0, estimatedDays: '2-5 business days', courierName: 'Free Shipping' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFreeShipping])

  const handleNext = (nextStep: Step) => {
    if (nextStep === 'payment' && !isShippingValid()) return
    setError(null)
    setActiveStep(nextStep)
  }

  async function pollVerifyPayment(cashfreeOrderId: string, orderId: number): Promise<void> {
    const started = Date.now()
    const timeout = 3 * 60 * 1000
    const attempt = async (): Promise<void> => {
      try {
        await apiFetch<{ order: { id: number } }>(
          '/storefront/orders/verify-payment',
          {
            method: 'POST',
            timeoutMs: 30000,
            body: JSON.stringify({ cashfreeOrderId, orderId }),
          },
        )
        return
      } catch {
        if (Date.now() - started > timeout) return
        await new Promise(r => setTimeout(r, 3000))
        return attempt()
      }
    }
    await attempt()
  }

  async function handleCashfreePayment(body: Record<string, unknown>): Promise<{ order: { id: number }; guestToken?: string }> {
    const cashfreeData = await apiFetch<{ cashfreeOrderId: string | null; paymentSessionId: string | null; amount: number; currency: string; orderId: number; status?: string; guestToken?: string }>(
      '/storefront/orders/create-cashfree-order',
      { method: 'POST', body: JSON.stringify(body) },
    )

    if (!cashfreeData.cashfreeOrderId) {
      return { order: { id: cashfreeData.orderId }, guestToken: cashfreeData.guestToken }
    }

    await openCashfreeCheckout(cashfreeData.paymentSessionId!)
    await pollVerifyPayment(cashfreeData.cashfreeOrderId, cashfreeData.orderId)
    return { order: { id: cashfreeData.orderId }, guestToken: cashfreeData.guestToken }
  }

  const handlePlaceOrder = async () => {
    setError(null)

    // Block if delivery is not serviceable to this pincode
    if (deliveryInfo && !deliveryInfo.available) {
      setError('Delivery is not available to this pincode. Please try a different address.')
      return
    }

    setIsLoading(true)
    setIsProcessing(true)

    const body: Record<string, unknown> = {
      paymentMethod,
      items: checkoutItems.map((item: any) => ({
        productId: typeof item.id === 'number' ? item.id : Number(item.id) || undefined,
        variantId: item.variantId,
        name: item.name,
        variantLabel: item.variantLabel,
        color: item.color,
        size: item.size,
        imageUrl: item.image,
        quantity: Number(item.qty),
        unitPrice: Number(item.price),
        total: Number(item.price) * Number(item.qty),
      })),
      customerEmail: email || undefined,
      shippingAddress: {
        firstName,
        lastName: lastName || undefined,
        address,
        city,
        state,
        pincode,
        phone,
      },
      shippingTotal,
      ...(couponCode ? { couponCode } : {}),
    }

    try {
      let data: { order: { id: number }; guestToken?: string }
      let guestToken: string | undefined

      if (paymentMethod === 'cod') {
        const orderData = await apiFetch<{ cashfreeOrderId: string; amount: number; currency: string; orderId: number; status: string; guestToken?: string }>(
          '/storefront/orders/create-cashfree-order',
          { method: 'POST', body: JSON.stringify(body) },
        )
        data = { order: { id: orderData.orderId } }
        guestToken = orderData.guestToken
      } else {
        data = await handleCashfreePayment(body)
        guestToken = data.guestToken
      }

      if (buyNowRaw) {
        sessionStorage.removeItem('buyNowItem')
      } else {
        clearCart()
      }
      const qs = guestToken ? `orderId=${data.order.id}&token=${encodeURIComponent(guestToken)}` : `orderId=${data.order.id}`
      router.push(`/order-confirmation?${qs}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  const handleCreateCodOrder = async () => {
    setError(null)

    if (deliveryInfo && !deliveryInfo.available) {
      setError('Delivery is not available to this pincode. Please try a different address.')
      return
    }

    setIsLoading(true)
    setIsProcessing(true)

    const body: Record<string, unknown> = {
      paymentMethod: 'cod',
      items: checkoutItems.map((item: any) => ({
        productId: typeof item.id === 'number' ? item.id : Number(item.id) || undefined,
        variantId: item.variantId,
        name: item.name,
        variantLabel: item.variantLabel,
        color: item.color,
        size: item.size,
        imageUrl: item.image,
        quantity: Number(item.qty),
        unitPrice: Number(item.price),
        total: Number(item.price) * Number(item.qty),
      })),
      customerEmail: email || undefined,
      shippingAddress: {
        firstName,
        lastName: lastName || undefined,
        address,
        city,
        state,
        pincode,
        phone,
      },
      shippingTotal,
      ...(couponCode ? { couponCode } : {}),
    }

    try {
      const orderData = await apiFetch<{ orderId: number; status: string; guestToken?: string }>(
        '/storefront/orders/create-cashfree-order',
        { method: 'POST', body: JSON.stringify(body) },
      )
      setCodOrderId(orderData.orderId)
      setCodGuestToken(orderData.guestToken)
      setShowCodConfirm(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  const handleConfirmCodOrder = async () => {
    if (!codOrderId) return
    setError(null)
    setIsLoading(true)

    try {
      await confirmCodOrder(codOrderId, codGuestToken)
      if (buyNowRaw) {
        sessionStorage.removeItem('buyNowItem')
      } else {
        clearCart()
      }
      const qs = codGuestToken ? `orderId=${codOrderId}&token=${encodeURIComponent(codGuestToken)}` : `orderId=${codOrderId}`
      router.push(`/order-confirmation?${qs}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
      setShowCodConfirm(false)
    }
  }

  const handleCancelCodOrder = () => {
    setShowCodConfirm(false)
    setCodOrderId(null)
    setCodGuestToken(undefined)
  }

  return (
    <>
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
      {checkoutItems.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="mb-4 text-xl font-medium text-[var(--charcoal)]">Your cart is empty</h2>
          <p className="mb-6 text-gray-500">Add items to your cart before checking out.</p>
          <Link
            href="/shop"
            className="inline-block bg-[var(--burgundy)] px-8 py-3 text-sm font-medium uppercase tracking-wider text-white shadow-md transition hover:bg-[var(--burgundy-dark)]"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
      <>

      {/* 1. Contact Info */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-3 text-lg font-semibold text-[var(--charcoal)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--burgundy)] text-[11px] font-bold text-white">1</span>
            Contact
          </h2>
          {activeStep !== 'contact' && (
            <button onClick={() => setActiveStep('contact')} className="text-sm font-medium text-[var(--burgundy)] hover:underline">
              Edit
            </button>
          )}
        </div>

        {activeStep === 'contact' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
              {!session && <Link href="/login" className="text-xs font-semibold text-[var(--burgundy)] hover:underline">Log in</Link>}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailTouched) setEmailError(!e.target.value.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim()) ? 'Enter a valid email' : '') }}
              onBlur={() => { setEmailTouched(true); setEmailError(!email.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Enter a valid email' : '') }}
              placeholder="you@example.com"
              className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${emailTouched && emailError ? 'border-red-400' : 'border-gray-300'}`}
            />
            {emailTouched && emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}

            <label className="mt-4 flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[var(--burgundy)] focus:ring-[var(--burgundy)] accent-[var(--burgundy)]" defaultChecked />
              <span className="text-sm text-gray-600">Email me with news and offers</span>
            </label>

            <button
              onClick={() => { setEmailTouched(true); const err = !email.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Enter a valid email' : ''; setEmailError(err); if (!err) handleNext('shipping') }}
              className="mt-5 w-full rounded-md bg-[var(--burgundy)] py-3 text-[14px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[var(--burgundy-dark)] sm:w-auto sm:px-8"
            >
              Continue to shipping
            </button>
          </div>
        )}
        {activeStep !== 'contact' && (
          <div className="text-sm text-gray-500">
            {email || 'Not provided'}
          </div>
        )}
      </div>

      {/* 2. Shipping Address */}
      <div className={`border-b border-gray-200 pb-5 transition-opacity duration-300 ${activeStep === 'contact' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-3 text-lg font-semibold text-[var(--charcoal)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--burgundy)] text-[11px] font-bold text-white">2</span>
            Delivery
          </h2>
          {activeStep === 'payment' && (
            <button onClick={() => setActiveStep('shipping')} className="text-sm font-medium text-[var(--burgundy)] hover:underline">
              Edit
            </button>
          )}
        </div>

        {activeStep === 'shipping' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Saved Addresses</p>
                <div className="space-y-2">
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full text-left rounded-md border p-3 transition ${
                        selectedAddressId === addr.id
                          ? 'border-[var(--burgundy)] bg-[var(--burgundy)]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        <div className="min-w-0 text-sm">
                          <span className="font-medium text-[var(--charcoal)]">{addr.firstName} {addr.lastName || ''}</span>
                          {addr.isDefault && <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--burgundy)]">Default</span>}
                          <p className="text-gray-500">{addr.address}, {addr.city}, {addr.state} — {addr.pincode}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input type="text" placeholder="First name *" value={firstName} onChange={e => { setFirstName(e.target.value); if (shipTouched.firstName) setShipErrors(p => ({ ...p, firstName: validateShipField('firstName', e.target.value) })) }} onBlur={() => handleShipBlur('firstName')} className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${shipTouched.firstName && shipErrors.firstName ? 'border-red-400' : 'border-gray-300'}`} />
                {shipTouched.firstName && shipErrors.firstName && <p className="mt-1 text-xs text-red-500">{shipErrors.firstName}</p>}
              </div>
              <div>
                <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full rounded-md shadow-sm border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white" />
              </div>
              <div className="sm:col-span-2">
                <input type="text" placeholder="Address (House No., Building, Street) *" value={address} onChange={e => { setAddress(e.target.value); if (shipTouched.address) setShipErrors(p => ({ ...p, address: validateShipField('address', e.target.value) })) }} onBlur={() => handleShipBlur('address')} className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${shipTouched.address && shipErrors.address ? 'border-red-400' : 'border-gray-300'}`} />
                {shipTouched.address && shipErrors.address && <p className="mt-1 text-xs text-red-500">{shipErrors.address}</p>}
              </div>
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="City *"
                    value={city}
                    onChange={e => { setCity(e.target.value); if (shipTouched.city) setShipErrors(p => ({ ...p, city: validateShipField('city', e.target.value) })) }}
                    onBlur={() => handleShipBlur('city')}
                    className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${shipTouched.city && shipErrors.city ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {pincodeAutoFilled && city && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Auto-filled</span>
                  )}
                </div>
                {shipTouched.city && shipErrors.city && <p className="mt-1 text-xs text-red-500">{shipErrors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="State *"
                  value={state}
                  onChange={e => { setState(e.target.value); if (shipTouched.state) setShipErrors(p => ({ ...p, state: validateShipField('state', e.target.value) })) }}
                  onBlur={() => handleShipBlur('state')}
                  className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${shipTouched.state && shipErrors.state ? 'border-red-400' : 'border-gray-300'}`}
                />
                {shipTouched.state && shipErrors.state && <p className="mt-1 text-xs text-red-500">{shipErrors.state}</p>}
              </div>
              <div>
                <input type="text" placeholder="Pincode *" value={pincode} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setPincode(v); if (shipTouched.pincode) setShipErrors(p => ({ ...p, pincode: validateShipField('pincode', v) })) }} onBlur={() => handleShipBlur('pincode')} maxLength={6} className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${shipTouched.pincode && shipErrors.pincode ? 'border-red-400' : 'border-gray-300'}`} />
                {shipTouched.pincode && shipErrors.pincode && <p className="mt-1 text-xs text-red-500">{shipErrors.pincode}</p>}
                {deliveryChecking && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking delivery…
                  </p>
                )}
                {deliveryInfo && !deliveryChecking && (
                  <div className={`mt-2 p-3 rounded-md border text-xs leading-relaxed ${deliveryInfo.available ? 'bg-green-50/65 border-green-200 text-green-800' : 'bg-red-50/65 border-red-200 text-red-700'}`}>
                    <p className="font-semibold flex items-center gap-1.5 mb-1.5 text-[13px]">
                      {deliveryInfo.available ? '✅ Delivery Serviceable' : '❌ Delivery Not Serviceable'}
                    </p>
                    {deliveryInfo.available ? (
                      <div className="space-y-1 font-medium text-gray-700">
                        <div><span className="text-gray-500 font-normal">Shipping Charges:</span> ₹{deliveryInfo.rate}</div>
                        {deliveryInfo.estimatedDays && (
                          <div><span className="text-gray-500 font-normal">Est. Delivery:</span> {deliveryInfo.estimatedDays}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">We do not deliver to postcode {pincode}. Please try another postcode.</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <input type="tel" placeholder="Phone (10 digits) *" value={phone} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setPhone(v); if (shipTouched.phone) setShipErrors(p => ({ ...p, phone: validateShipField('phone', v) })) }} onBlur={() => handleShipBlur('phone')} maxLength={10} className={`w-full rounded-md shadow-sm border px-3 py-2.5 text-sm outline-none transition focus:border-[var(--burgundy)]/50 focus:ring-1 focus:ring-[var(--burgundy)]/50 bg-white ${shipTouched.phone && shipErrors.phone ? 'border-red-400' : 'border-gray-300'}`} />
                {shipTouched.phone && shipErrors.phone && <p className="mt-1 text-xs text-red-500">{shipErrors.phone}</p>}
              </div>
            </div>

            <button
              onClick={() => handleNext('payment')}
              className="mt-5 w-full rounded-md bg-[var(--burgundy)] py-3 text-[14px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[var(--burgundy-dark)] sm:w-auto sm:px-8"
            >
              Continue to payment
            </button>
          </div>
        )}
        {activeStep === 'payment' && (
          <div className="text-sm text-gray-500">
            {address ? `${address}, ${city}, ${state} ${pincode}` : 'Not provided'}
          </div>
        )}
      </div>

      {/* 3. Payment Method */}
      <div className={`transition-opacity duration-300 ${activeStep !== 'payment' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-3 text-lg font-semibold text-[var(--charcoal)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--burgundy)] text-[11px] font-bold text-white">3</span>
            Payment
          </h2>
        </div>

        {activeStep === 'payment' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="mb-4 text-sm text-gray-500">All transactions are secure and encrypted.</p>

            <div className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
              {/* Online Payment (only option — COD is currently disabled) */}
              <div className="flex items-center gap-4 bg-[#fafafa] p-4">
                <div className="flex-1">
                  <span className="text-sm font-medium text-[var(--charcoal)]">Online Payment</span>
                  <p className="mt-0.5 text-[11px] text-gray-400">UPI, Credit/Debit Card, Netbanking — select at payment</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {deliveryInfo && !deliveryInfo.available && (
                <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Delivery is not available to pincode {pincode}. Please update your address.
                </div>
              )}
              <button
                onClick={() => handlePlaceOrder()}
                disabled={isLoading || (deliveryInfo != null && !deliveryInfo.available)}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--burgundy)] py-3.5 text-[15px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[var(--burgundy-dark)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={16} strokeWidth={2.5} />
                    Pay with Cashfree
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* COD Confirmation Modal */}
      {showCodConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--charcoal)]">Confirm COD Order</h3>
              <button type="button" onClick={handleCancelCodOrder} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-1 text-sm text-gray-600">
              You are placing a <strong>Cash on Delivery</strong> order.
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Payment will be collected at the time of delivery.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelCodOrder}
                className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCodOrder}
                disabled={isLoading}
                className="flex-1 rounded-md bg-[var(--burgundy)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
              >
                {isLoading ? 'Placing...' : 'Yes, Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
