'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  Edit3,
  Grid2X2,
  Home,
  LogOut,
  MapPin,
  Package,
  Plus,
  Save,
  Settings,
  ShoppingBag,
  Ticket,
  CalendarDays,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { updateProfile, createAddress, deleteAddress, fetchAddresses, updateAddress, fetchOrders, changePassword, forgotPassword, resetPassword } from '@/lib/api/auth'
import type { AddressInput, CustomerAddress, CustomerOrder } from '@/lib/api/auth'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/components/auth/AuthContext'
import { resolveImageUrl } from '@/lib/api/client'
import { fetchMyEventBookings, type EventBookingListItem } from '@/lib/services/storefront.service'
import { formatEventDateTime } from '@/lib/utils/eventFormat'

type AccountTab = 'dashboard' | 'orders' | 'bookings' | 'address' | 'settings' | 'logout'

const tabs: Array<{ id: AccountTab; label: string; Icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', Icon: Grid2X2 },
  { id: 'orders', label: 'Orders', Icon: ShoppingBag },
  { id: 'bookings', label: 'Event Bookings', Icon: Ticket },
  { id: 'address', label: 'Address', Icon: MapPin },
  { id: 'settings', label: 'Settings', Icon: Settings },
  { id: 'logout', label: 'Logout', Icon: LogOut },
]

function EmptyOrdersPanel({ title = 'Recent orders', showViewAll = true }: { title?: string; showViewAll?: boolean }) {
  return (
    <section className="rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] p-4 sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="font-playfair text-2xl sm:text-3xl font-medium italic tracking-wide text-[#6B1A2A]">
          {title}
        </h2>
        {showViewAll ? (
          <button type="button" className="font-montserrat self-start text-xs font-bold uppercase tracking-[0.2em] text-[#6B1A2A] transition hover:text-[#C9A84C] sm:self-auto">
            View all
          </button>
        ) : null}
      </div>

      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E8DCC4] bg-[#FAF6EE]/45 px-4 py-7 text-center sm:min-h-[210px] sm:px-5 sm:py-8">
        <Package className="mb-5 h-8 w-8 text-[#8F8982] sm:mb-6 sm:h-9 sm:w-9" strokeWidth={1.8} />
        <p className="font-playfair mb-5 text-lg sm:text-xl font-medium italic tracking-wide text-[#2A1A1E]">
          No orders found yet.
        </p>
        <Link
          href="/shop"
          className="font-montserrat inline-flex w-full items-center justify-center rounded-md bg-[#6B1A2A] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#4A0F1C] sm:w-auto"
        >
          Start shopping
        </Link>
      </div>
    </section>
  )
}

export default function AccountDashboard() {
  const router = useRouter()
  const { session, refresh, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotStep, setForgotStep] = useState<'idle' | 'otp-sent' | 'otp-entered' | 'done'>('idle')

  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [bookings, setBookings] = useState<EventBookingListItem[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressInput>({
    firstName: '', lastName: '', address: '', city: '', state: '', pincode: '', phone: '', isDefault: false,
  })
  const [addressTouched, setAddressTouched] = useState<Record<string, boolean>>({})
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const pincodeTimer = useRef<ReturnType<typeof setTimeout>>()

  function validateAddressField(field: string, value: string): string {
    switch (field) {
      case 'firstName': return !value.trim() ? 'First name is required' : value.trim().length < 2 ? 'Enter at least 2 characters' : ''
      case 'address': return !value.trim() ? 'Address is required' : ''
      case 'city': return !value.trim() ? 'City is required' : ''
      case 'state': return !value.trim() ? 'State is required' : ''
      case 'pincode': return !value.trim() ? 'Pincode is required' : !/^\d{6}$/.test(value.trim()) ? 'Enter a valid 6-digit pincode' : ''
      case 'phone': return !value.trim() ? 'Phone number is required' : !/^\d{10}$/.test(value.trim().replace(/\D/g, '')) ? 'Enter a valid 10-digit phone number' : ''
      default: return ''
    }
  }

  function handleAddressFieldBlur(field: string) {
    setAddressTouched(p => ({ ...p, [field]: true }))
    const error = validateAddressField(field, addressForm[field as keyof AddressInput] as string || '')
    setAddressErrors(p => ({ ...p, [field]: error }))
  }

  function handleAddressFieldChange(field: keyof AddressInput, value: string) {
    setAddressForm(p => ({ ...p, [field]: value }))
    if (addressTouched[field]) {
      const error = validateAddressField(field, value)
      setAddressErrors(p => ({ ...p, [field]: error }))
    }
  }

  // Pincode auto-fill: when pincode reaches 6 digits, lookup city/state from India Post API
  useEffect(() => {
    if (addressForm.pincode.length === 6 && /^\d{6}$/.test(addressForm.pincode)) {
      clearTimeout(pincodeTimer.current)
      pincodeTimer.current = setTimeout(async () => {
        setPincodeLoading(true)
        try {
          const data = await apiFetch<{ isValid: boolean; city: string; district: string; state: string }>(
            `/storefront/pincode/${addressForm.pincode}`,
          )
          if (data.isValid) {
            setAddressForm(p => ({ ...p, city: data.district || data.city, state: data.state }))
            setPincodeAutoFilled(true)
            setAddressErrors(p => ({ ...p, city: '', state: '' }))
          } else {
            setPincodeAutoFilled(false)
          }
        } catch {
          // Pincode lookup failed silently
        } finally {
          setPincodeLoading(false)
        }
      }, 500)
    } else if (addressForm.pincode.length < 6) {
      setPincodeAutoFilled(false)
    }
    return () => clearTimeout(pincodeTimer.current)
  }, [addressForm.pincode])

  function isAddressFormValid(): boolean {
    const fields: (keyof AddressInput)[] = ['firstName', 'address', 'city', 'state', 'pincode', 'phone']
    const errs: Record<string, string> = {}
    let valid = true
    fields.forEach(f => {
      const val = addressForm[f] as string || ''
      const e = validateAddressField(f, val)
      if (e) { errs[f] = e; valid = false }
    })
    setAddressErrors(errs)
    setAddressTouched(Object.fromEntries(fields.map(f => [f, true])))
    return valid
  }

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      if (orders.length === 0 && activeTab === 'dashboard') {
        fetchOrders().then(data => setOrders(data.orders)).catch(() => setOrders([]))
      }
      if (activeTab === 'orders') {
        setOrdersLoading(true)
        fetchOrders()
          .then(data => setOrders(data.orders))
          .catch(() => setOrders([]))
          .finally(() => setOrdersLoading(false))
      }
    }
    if (activeTab === 'address') {
      setAddressesLoading(true)
      fetchAddresses()
        .then(data => setAddresses(data.addresses))
        .catch(() => setAddresses([]))
        .finally(() => setAddressesLoading(false))
    }
    if (activeTab === 'bookings') {
      setBookingsLoading(true)
      fetchMyEventBookings()
        .then(data => setBookings(data))
        .catch(() => setBookings([]))
        .finally(() => setBookingsLoading(false))
    }
  }, [activeTab])

  function openAddAddress() {
    setEditingAddress(null)
    setAddressForm({ firstName: '', lastName: '', address: '', city: '', state: '', pincode: '', phone: '', isDefault: false })
    setAddressTouched({})
    setAddressErrors({})
    setPincodeAutoFilled(false)
    setShowAddressForm(true)
  }

  function openEditAddress(addr: CustomerAddress) {
    setEditingAddress(addr)
    setAddressForm({
      firstName: addr.firstName,
      lastName: addr.lastName || '',
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      isDefault: addr.isDefault,
    })
    setAddressTouched({})
    setAddressErrors({})
    setPincodeAutoFilled(false)
    setShowAddressForm(true)
  }

  async function handleSaveAddress() {
    if (!isAddressFormValid()) return
    setSavingAddress(true)
    try {
      if (editingAddress) {
        const data = await updateAddress(editingAddress.id, addressForm)
        setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...a, ...data.address } : a))
      } else {
        const data = await createAddress(addressForm)
        setAddresses(prev => [data.address, ...prev])
      }
      setShowAddressForm(false)
      setEditingAddress(null)
    } catch {
      // ignore
    } finally {
      setSavingAddress(false)
    }
  }

  async function handleDeleteAddress(id: number) {
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleSetDefault(addr: CustomerAddress) {
    try {
      await updateAddress(addr.id, {
        firstName: addr.firstName,
        lastName: addr.lastName,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        phone: addr.phone,
        isDefault: true,
      })
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!session) return
    setProfile({
      name: session.name,
      email: session.email,
      mobile: session.mobile || '',
    })
  }, [session])

  if (!session) return null

  const displayAccount = {
    initials: session.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TN',
    name: session.name,
    email: session.email,
    mobile: session.mobile || '',
  }

  async function handleLogout() {
    await logout()
    router.replace('/')
  }

  async function handleSaveProfile() {
    setSaveError('')
    setSaving(true)
    try {
      const data = await updateProfile({
        name: profile.name,
        email: profile.email,
        mobile: profile.mobile || null,
      })
      setProfile({
        name: data.customer.name,
        email: data.customer.email,
        mobile: data.customer.mobile || '',
      })
      await refresh()
      setEditing(false)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const renderPanel = () => {
    if (activeTab === 'dashboard') {
      const stats = [
        { label: 'Total Orders', value: orders.length, color: 'text-[#6B1A2A]', bg: 'bg-[#6B1A2A]/5', border: 'border-[#6B1A2A]/20' },
        { label: 'In-Transit / Pending', value: orders.filter(o => o.status === 'confirmed' || o.status === 'packing' || o.status === 'dispatched' || o.status === 'out_for_delivery').length, color: 'text-amber-700', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
        { label: 'Delivered Orders', value: orders.filter(o => o.status === 'delivered').length, color: 'text-emerald-700', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: 'text-rose-700', bg: 'bg-rose-500/5', border: 'border-rose-500/20' },
      ]
      return (
        <div className="space-y-6">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
              <article key={stat.label} className={`min-w-0 rounded-xl border ${stat.border} ${stat.bg} p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}>
                <p className="font-montserrat mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  {stat.label}
                </p>
                <p className={`text-3xl font-extrabold leading-none ${stat.color} sm:text-4xl`}>{stat.value}</p>
              </article>
            ))}
          </div>

          {orders.length === 0 ? <EmptyOrdersPanel /> : (
            <div className="rounded-xl border border-[#E8DCC4] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-playfair text-xl font-semibold tracking-wide text-gray-900">Recent Activity</h3>
                <button type="button" onClick={() => setActiveTab('orders')} className="text-xs font-bold uppercase tracking-wider text-[#6B1A2A] hover:underline">
                  View All Orders &rarr;
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 4).map(order => (
                  <Link href={`/account/orders/${order.id}`} key={order.id} className="block rounded-lg border border-gray-100 bg-[#FDFBF7] p-4 transition-all hover:border-[#D9B86E] hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })} &bull; {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{order.status}</span>
                        <span className="font-bold text-[#6B1A2A]">₹{parseFloat(order.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'orders') {
      return (
        <section className="rounded-xl border border-[#E8DCC4] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="font-playfair text-2xl font-semibold tracking-wide text-gray-900">
              Order History
            </h2>
            <span className="text-xs font-medium text-gray-500">{orders.length} Total Orders</span>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#6B1A2A] border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyOrdersPanel title="Orders" showViewAll={false} />
          ) : (
            <div className="space-y-5">
              {orders.map(order => (
                <div key={order.id} className="overflow-hidden rounded-xl border border-gray-200 bg-[#FDFBF7] transition-all hover:border-[#D9B86E] hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/80 px-5 py-3.5 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Order #{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'confirmed' || order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' || order.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>{order.status}</span>
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'paid' || order.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>{order.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 py-2">
                        {item.imageUrl && (
                          <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                            <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.variantLabel || [item.color, item.size].filter(Boolean).join(' / ') || ''} &bull; Qty: {item.quantity}</p>
                        </div>
                        <p className="ml-4 shrink-0 font-bold text-[#6B1A2A]">₹{parseFloat(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}

                    {(order.status === 'dispatched' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
                      <div className="rounded-lg bg-white p-3 text-xs text-gray-600 border border-gray-100 space-y-1">
                        {order.trackingNumber ? <p><span className="font-semibold text-gray-700">Tracking Number:</span> {order.trackingNumber}</p> : null}
                        {order.deliveryAgentName ? <p><span className="font-semibold text-gray-700">Delivery Agent:</span> {order.deliveryAgentName} ({order.deliveryAgentPhone || ''})</p> : null}
                        {order.deliveredAt ? <p className="text-emerald-700 font-semibold">&check; Delivered on: {new Date(order.deliveredAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p> : null}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                      <Link href={`/account/orders/${order.id}`} className="text-xs font-bold uppercase tracking-wider text-[#6B1A2A] hover:underline">
                        View Detailed Invoice &rarr;
                      </Link>
                      <p className="text-base font-extrabold text-[#6B1A2A]">Total: ₹{parseFloat(order.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )
    }

    if (activeTab === 'bookings') {
      return (
        <section className="rounded-xl border border-[#E8DCC4] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-playfair text-2xl font-semibold tracking-wide text-gray-900">
                Event Bookings
              </h2>
              <p className="text-xs text-gray-500 mt-1">Your event tickets and entry passes.</p>
            </div>
            <span className="text-xs font-medium text-gray-500">{bookings.length} Total Booking{bookings.length === 1 ? '' : 's'}</span>
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#6B1A2A] border-t-transparent" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-[#FDFBF7] p-10 text-center">
              <Ticket className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="font-playfair text-lg font-semibold text-gray-900">No event bookings yet</p>
              <p className="text-xs text-gray-500 mt-1">Book a workshop or event and it will show up here with your QR and Zoom access.</p>
              <Link href="/events" className="font-montserrat mt-5 inline-flex items-center justify-center rounded-lg bg-[#6B1A2A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#521220]">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map(booking => (
                <div key={booking.id} className="overflow-hidden rounded-xl border border-gray-200 bg-[#FDFBF7] transition-all hover:border-[#D9B86E] hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/80 px-5 py-3.5 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{booking.event?.name ?? 'Event booking'}</p>
                      <p className="text-xs text-gray-500">
                        Booking #{booking.bookingNumber} &bull; {new Date(booking.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${booking.mode === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{booking.mode}</span>
                      <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        booking.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                        booking.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>{booking.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {booking.event && (
                      <p className="flex items-center gap-2 text-xs text-gray-600">
                        <CalendarDays size={14} className="text-[#6B1A2A]" />
                        {formatEventDateTime(booking.event.eventDate, booking.event.startTime)} – {booking.event.endTime}
                      </p>
                    )}
                    {booking.mode === 'offline' && booking.event?.venueAddress && (
                      <p className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={14} className="text-[#6B1A2A]" /> {booking.event.venueAddress}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/events/confirmation/${booking.id}`} className="text-xs font-bold uppercase tracking-wider text-[#6B1A2A] hover:underline">
                          View Details &rarr;
                        </Link>
                        {booking.mode === 'online' && booking.zoomLink && booking.paymentStatus === 'paid' && (
                          <a href={booking.zoomLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-wider text-[#2B4C9B] hover:underline">
                            Join Zoom Link
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500">{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</p>
                        <p className="text-base font-extrabold text-[#6B1A2A]">₹{booking.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )
    }

    if (activeTab === 'address') {
      return (
        <section className="rounded-xl border border-[#E8DCC4] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-playfair text-2xl font-semibold tracking-wide text-gray-900">
                Saved Addresses
              </h2>
              <p className="text-xs text-gray-500 mt-1">Manage your delivery addresses for seamless checkout.</p>
            </div>
            <button type="button" onClick={openAddAddress} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B1A2A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#521220]">
              <Plus className="h-4 w-4" />
              Add New Address
            </button>
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <div className="mb-6 rounded-xl border border-[#D9B86E]/50 bg-[#FDFBF7] p-6 shadow-sm">
              <h3 className="font-playfair mb-4 text-xl font-semibold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input value={addressForm.firstName} onChange={e => handleAddressFieldChange('firstName', e.target.value)} onBlur={() => handleAddressFieldBlur('firstName')} placeholder="First Name *" className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A] ${addressTouched.firstName && addressErrors.firstName ? 'border-rose-400' : 'border-gray-200'}`} />
                  {addressTouched.firstName && addressErrors.firstName && <p className="mt-1 text-xs text-rose-500">{addressErrors.firstName}</p>}
                </div>
                <div>
                  <input value={addressForm.lastName || ''} onChange={e => handleAddressFieldChange('lastName', e.target.value)} placeholder="Last Name" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A]" />
                </div>
                <div className="sm:col-span-2">
                  <input value={addressForm.address} onChange={e => handleAddressFieldChange('address', e.target.value)} onBlur={() => handleAddressFieldBlur('address')} placeholder="Full Address (House No., Building, Street) *" className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A] ${addressTouched.address && addressErrors.address ? 'border-rose-400' : 'border-gray-200'}`} />
                  {addressTouched.address && addressErrors.address && <p className="mt-1 text-xs text-rose-500">{addressErrors.address}</p>}
                </div>
                <div className="relative">
                  <input value={addressForm.city} onChange={e => handleAddressFieldChange('city', e.target.value)} onBlur={() => handleAddressFieldBlur('city')} placeholder="City *" className={`w-full rounded-lg border bg-white px-4 py-3 pr-16 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A] ${addressTouched.city && addressErrors.city ? 'border-rose-400' : 'border-gray-200'}`} />
                  {pincodeAutoFilled && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">Auto</span>}
                  {addressTouched.city && addressErrors.city && <p className="mt-1 text-xs text-rose-500">{addressErrors.city}</p>}
                </div>
                <div className="relative">
                  <input value={addressForm.state} onChange={e => handleAddressFieldChange('state', e.target.value)} onBlur={() => handleAddressFieldBlur('state')} placeholder="State *" className={`w-full rounded-lg border bg-white px-4 py-3 pr-16 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A] ${addressTouched.state && addressErrors.state ? 'border-rose-400' : 'border-gray-200'}`} />
                  {pincodeAutoFilled && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800">Auto</span>}
                  {addressTouched.state && addressErrors.state && <p className="mt-1 text-xs text-rose-500">{addressErrors.state}</p>}
                </div>
                <div className="relative">
                  <input value={addressForm.pincode} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); handleAddressFieldChange('pincode', v) }} onBlur={() => handleAddressFieldBlur('pincode')} placeholder="Pincode *" maxLength={6} className={`w-full rounded-lg border bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A] ${addressTouched.pincode && addressErrors.pincode ? 'border-rose-400' : 'border-gray-200'}`} />
                  {pincodeLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#6B1A2A] border-t-transparent" /></span>}
                  {addressTouched.pincode && addressErrors.pincode && <p className="mt-1 text-xs text-rose-500">{addressErrors.pincode}</p>}
                </div>
                <div>
                  <input value={addressForm.phone} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); handleAddressFieldChange('phone', v) }} onBlur={() => handleAddressFieldBlur('phone')} placeholder="Phone Number *" maxLength={10} className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A] ${addressTouched.phone && addressErrors.phone ? 'border-rose-400' : 'border-gray-200'}`} />
                  {addressTouched.phone && addressErrors.phone && <p className="mt-1 text-xs text-rose-500">{addressErrors.phone}</p>}
                </div>
              </div>
              <label className="mt-4 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addressForm.isDefault || false} onChange={e => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 accent-[#6B1A2A]" />
                <span className="text-xs font-medium text-gray-700">Set as default delivery address</span>
              </label>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={handleSaveAddress} disabled={savingAddress} className="rounded-lg bg-[#6B1A2A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#521220] disabled:opacity-50">
                  {savingAddress ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null) }} className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Address Cards Grid */}
          {addressesLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#6B1A2A] border-t-transparent" />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-[#FDFBF7] p-8 text-center">
              <Home className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="font-playfair text-lg font-semibold text-gray-900">No address saved yet</p>
              <p className="text-xs text-gray-500 mt-1">Add a delivery address to make your checkout super fast.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map(addr => (
                <div key={addr.id} className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${addr.isDefault ? 'border-[#D9B86E] bg-[#FDFBF7] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div>
                    {addr.isDefault && (
                      <span className="mb-3 inline-block rounded-full bg-[#6B1A2A] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Default Address</span>
                    )}
                    <p className="text-sm font-bold text-gray-900">{addr.firstName} {addr.lastName || ''}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{addr.address}</p>
                    <p className="text-xs leading-relaxed text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="mt-2 text-xs font-semibold text-gray-700">Phone: {addr.phone}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                    {!addr.isDefault && (
                      <button type="button" onClick={() => handleSetDefault(addr)} className="text-[11px] font-bold uppercase tracking-wider text-[#6B1A2A] hover:underline">
                        Make Default
                      </button>
                    )}
                    <button type="button" onClick={() => openEditAddress(addr)} className="ml-auto p-1.5 text-gray-500 hover:text-[#6B1A2A]" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-gray-400 hover:text-rose-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )
    }

    if (activeTab === 'settings') {
      return (
        <section className="rounded-xl border border-[#E8DCC4] bg-white p-6 shadow-sm space-y-8">
          <div>
            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-playfair text-2xl font-semibold tracking-wide text-gray-900">
                  Profile Preferences
                </h2>
                <p className="text-xs text-gray-500 mt-1">Update your personal account details.</p>
              </div>
              <button
                type="button"
                onClick={() => { if (editing) { handleSaveProfile() } else { setEditing(true) } }}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B1A2A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#521220] disabled:opacity-70"
              >
                {editing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {editing ? (saving ? 'Saving...' : 'Save Profile') : 'Edit Profile'}
              </button>
            </div>

            {saveError ? <p className="mb-4 text-xs font-semibold text-rose-600">{saveError}</p> : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Full Name</label>
                <input
                  value={profile.name}
                  readOnly={!editing}
                  onChange={event => setProfile(current => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-[#FDFBF7] px-4 py-3 text-sm text-gray-900 outline-none transition read-only:bg-gray-50 focus:border-[#6B1A2A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
                <input
                  value={profile.email}
                  readOnly={!editing}
                  onChange={event => setProfile(current => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-[#FDFBF7] px-4 py-3 text-sm text-gray-900 outline-none transition read-only:bg-gray-50 focus:border-[#6B1A2A]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Mobile Number</label>
                <input
                  value={profile.mobile}
                  readOnly={!editing}
                  onChange={event => setProfile(current => ({ ...current, mobile: event.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-[#FDFBF7] px-4 py-3 text-sm text-gray-900 outline-none transition read-only:bg-gray-50 focus:border-[#6B1A2A]"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-playfair mb-2 text-xl font-semibold text-gray-900">
              Security & Password
            </h3>
            <p className="text-xs text-gray-500 mb-6">Change your current password or request a reset OTP.</p>

            {passwordSuccess ? (
              <p className="mb-4 rounded-lg bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">{passwordSuccess}</p>
            ) : null}
            {passwordError ? (
              <p className="mb-4 rounded-lg bg-rose-50 p-3.5 text-xs font-semibold text-rose-800">{passwordError}</p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={event => { setPasswordForm(f => ({ ...f, currentPassword: event.target.value })); setPasswordError(''); setPasswordSuccess('') }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A]"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={event => { setPasswordForm(f => ({ ...f, newPassword: event.target.value })); setPasswordError(''); setPasswordSuccess('') }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A]"
                  placeholder="Min 6 chars"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={event => { setPasswordForm(f => ({ ...f, confirmPassword: event.target.value })); setPasswordError(''); setPasswordSuccess('') }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#6B1A2A]"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={async () => {
                  setPasswordError('')
                  setPasswordSuccess('')
                  if (!passwordForm.currentPassword) { setPasswordError('Current password is required.'); return }
                  if (passwordForm.newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return }
                  if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('New passwords do not match.'); return }
                  setChangingPassword(true)
                  try {
                    await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
                    setPasswordSuccess('Password changed successfully.')
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  } catch (err: any) {
                    setPasswordError(err?.message || 'Failed to change password.')
                  } finally {
                    setChangingPassword(false)
                  }
                }}
                disabled={changingPassword}
                className="rounded-lg bg-[#6B1A2A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#521220] disabled:opacity-70"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setForgotSent(false)
                  setPasswordError('')
                  setForgotLoading(true)
                  try {
                    await forgotPassword(session?.email || profile.email)
                    setForgotStep('otp-sent')
                    setPasswordSuccess('OTP sent to your email.')
                  } catch (err: any) {
                    setPasswordError(err?.message || 'Failed to send OTP.')
                  } finally {
                    setForgotLoading(false)
                  }
                }}
                disabled={forgotLoading}
                className="text-xs font-semibold text-[#6B1A2A] hover:underline disabled:opacity-50"
              >
                {forgotLoading ? 'Sending OTP...' : 'Forgot password? Reset via OTP'}
              </button>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <LogOut className="mx-auto mb-4 h-10 w-10 text-[#6B1A2A]" />
        <h2 className="font-playfair mb-2 text-2xl font-semibold text-gray-900">
          Ready to Logout?
        </h2>
        <p className="mx-auto mb-6 max-w-sm text-xs text-gray-500">End your Soil Goddess account session on this browser.</p>
        <button type="button" onClick={handleLogout} className="inline-flex justify-center rounded-lg bg-[#6B1A2A] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#521220]">
          Logout Now
        </button>
      </section>
    )
  }

  return (
    <main className="bg-[#FDFBF7] min-h-screen text-gray-900 pb-16 antialiased">
      {/* Luxury Dark Maroon Hero Banner */}
      <section className="relative overflow-hidden bg-[#300D14] text-white py-12 px-6 sm:px-12 lg:px-16 shadow-md">
        <div className="absolute inset-0 bg-[url('/borderdesign/flower-motif.png')] bg-contain bg-no-repeat opacity-[0.04] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D9B86E] via-[#F2C94C] to-[#D9B86E]" />
        
        <div className="relative z-10 mx-auto max-w-[1400px] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D9B86E] border border-[#D9B86E]/30 mb-3">
              <span>Soil Goddess Member</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-wide leading-tight">
              Hello, {displayAccount.name.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="font-sans mt-2 text-sm text-[#FAF6EE]/80 max-w-xl font-light">
              Welcome to your personal dashboard. Manage your orders, saved delivery addresses, and profile preferences seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <div className="font-playfair flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#D9B86E] bg-[#6B1A2A] text-xl font-bold text-white shadow-md">
              {displayAccount.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{displayAccount.name}</p>
              <p className="text-xs text-[#D9B86E] truncate">{displayAccount.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          
          {/* Desktop Navigation Sidebar */}
          <aside className="h-fit rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <nav className="hidden space-y-1.5 lg:block" aria-label="Account navigation">
              {tabs.map(({ id, label, Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full items-center gap-3.5 rounded-lg px-4 py-3.5 text-sm font-medium transition-all ${
                      active 
                        ? 'bg-[#6B1A2A] text-white font-bold shadow-sm border-l-4 border-[#D9B86E]' 
                        : 'text-gray-700 hover:bg-[#FDFBF7] hover:text-[#6B1A2A]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-[#D9B86E]' : 'text-gray-400'}`} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Mobile Scrollable Tabs */}
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Account navigation">
              {tabs.map(({ id, label, Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                      active ? 'bg-[#6B1A2A] text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Dynamic Content Panel */}
          <div className="min-w-0">{renderPanel()}</div>
        </div>
      </section>
    </main>
  )
}
