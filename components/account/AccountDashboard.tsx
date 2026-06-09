'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowRight,
  Edit3,
  Grid2X2,
  Home,
  LogOut,
  MapPin,
  Package,
  Save,
  Settings,
  ShoppingBag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type AccountTab = 'dashboard' | 'orders' | 'address' | 'settings' | 'logout'

const account = {
  initials: 'AA',
  name: 'Arun arun',
  email: 'arunnn3333rrr@gmail.com',
  mobile: '+91 98765 43210',
}

const ACCOUNT_READY_KEY = 'soil_goddess_account_ready'

const tabs: Array<{ id: AccountTab; label: string; Icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', Icon: Grid2X2 },
  { id: 'orders', label: 'Orders', Icon: ShoppingBag },
  { id: 'address', label: 'Address', Icon: MapPin },
  { id: 'settings', label: 'Settings', Icon: Settings },
  { id: 'logout', label: 'Logout', Icon: LogOut },
]

const orderStats = [
  { label: 'Total', value: 0 },
  { label: 'Awaiting', value: 0 },
  { label: 'Delivered', value: 0 },
  { label: 'Cancelled', value: 0 },
]

type AddressFields = {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

const emptyAddress: AddressFields = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
}

function EmptyOrdersPanel({ title = 'Recent orders', showViewAll = true }: { title?: string; showViewAll?: boolean }) {
  return (
    <section className="rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] p-4 sm:p-6 lg:p-7">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-2xl font-semibold leading-tight text-[#6B1A2A] sm:text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
          {title}
        </h2>
        {showViewAll ? (
          <button type="button" className="self-start text-base font-semibold text-[#6B1A2A] transition hover:text-[#C9A84C] sm:self-auto sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            View all
          </button>
        ) : null}
      </div>

      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E8DCC4] bg-[#FAF6EE]/45 px-4 py-7 text-center sm:min-h-[210px] sm:px-5 sm:py-8">
        <Package className="mb-5 h-8 w-8 text-[#8F8982] sm:mb-6 sm:h-9 sm:w-9" strokeWidth={1.8} />
        <p className="mb-5 text-lg text-[#2A1A1E] sm:text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
          No orders found yet.
        </p>
        <Link
          href="/products/soft-silk-woven-zari-saree"
          className="inline-flex w-full items-center justify-center rounded-md bg-[#6B1A2A] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#4A0F1C] sm:w-auto"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Start shopping
        </Link>
      </div>
    </section>
  )
}

export default function AccountDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: account.name,
    email: account.email,
    mobile: account.mobile,
  })
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [address, setAddress] = useState<AddressFields | null>(null)
  const [addressDraft, setAddressDraft] = useState<AddressFields>(emptyAddress)
  const [addressError, setAddressError] = useState('')

  function updateAddressField<Key extends keyof AddressFields>(key: Key, value: AddressFields[Key]) {
    setAddressDraft(current => ({ ...current, [key]: value }))
    setAddressError('')
  }

  function openAddressForm() {
    setAddressDraft(address ?? emptyAddress)
    setAddressFormOpen(true)
    setAddressError('')
  }

  function saveAddress() {
    const requiredFields: Array<keyof AddressFields> = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode']
    const missingField = requiredFields.find(field => !addressDraft[field].trim())

    if (missingField) {
      setAddressError('Please fill all required address details.')
      return
    }

    setAddress(addressDraft)
    setAddressFormOpen(false)
    setAddressError('')
  }

  const renderPanel = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-5 sm:space-y-7">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-4">
            {orderStats.map(stat => (
              <article key={stat.label} className="min-w-0 rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-5 shadow-[0_10px_30px_rgba(74,15,28,0.04)] sm:px-5 sm:py-6">
                <p className="mb-3 break-words text-sm uppercase tracking-[0.08em] text-[#2A1A1E] sm:text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stat.label}
                </p>
                <p className="text-3xl font-bold leading-none text-[#6B1A2A] sm:text-4xl">{stat.value}</p>
              </article>
            ))}
          </div>
          <EmptyOrdersPanel />
        </div>
      )
    }

    if (activeTab === 'orders') {
      return <EmptyOrdersPanel title="Orders" showViewAll={false} />
    }

    if (activeTab === 'address') {
      return (
        <section className="rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] p-4 sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#7A6065]">Address</p>
              <h2 className="break-words text-2xl font-semibold leading-tight text-[#6B1A2A] sm:text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Delivery address
              </h2>
            </div>
            <button
              type="button"
              onClick={addressFormOpen ? saveAddress : openAddressForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#6B1A2A] px-5 py-3 font-semibold text-white transition hover:bg-[#4A0F1C] sm:w-auto"
            >
              {addressFormOpen ? 'Save Address' : address ? 'Edit Address' : 'Add Address'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {addressFormOpen ? (
            <div className="rounded-lg border border-[#E8DCC4] bg-white p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Full name *</span>
                  <input
                    value={addressDraft.fullName}
                    onChange={event => updateAddressField('fullName', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="Arun arun"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Mobile *</span>
                  <input
                    value={addressDraft.phone}
                    onChange={event => updateAddressField('phone', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Address line 1 *</span>
                  <input
                    value={addressDraft.line1}
                    onChange={event => updateAddressField('line1', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="House number, street, area"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Address line 2</span>
                  <input
                    value={addressDraft.line2}
                    onChange={event => updateAddressField('line2', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="Landmark, apartment, optional"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">City *</span>
                  <input
                    value={addressDraft.city}
                    onChange={event => updateAddressField('city', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="Chennai"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">State *</span>
                  <input
                    value={addressDraft.state}
                    onChange={event => updateAddressField('state', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="Tamil Nadu"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Pincode *</span>
                  <input
                    value={addressDraft.pincode}
                    onChange={event => updateAddressField('pincode', event.target.value)}
                    className="w-full rounded-md border border-[#E8DCC4] bg-[#FFFCF7] px-4 py-3 text-sm outline-none transition focus:border-[#6B1A2A]"
                    placeholder="600001"
                  />
                </label>
              </div>

              {addressError ? <p className="mt-4 text-sm font-semibold text-[#A34336]">{addressError}</p> : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAddressFormOpen(false)
                    setAddressError('')
                  }}
                  className="inline-flex w-full justify-center rounded-md border border-[#E8DCC4] px-5 py-3 font-semibold text-[#6B1A2A] transition hover:bg-[#F5EDD6] sm:w-auto"
                >
                  Cancel
                </button>
                <button type="button" onClick={saveAddress} className="inline-flex w-full justify-center rounded-md bg-[#6B1A2A] px-5 py-3 font-semibold text-white transition hover:bg-[#4A0F1C] sm:w-auto">
                  Save Address
                </button>
              </div>
            </div>
          ) : address ? (
            <div className="rounded-lg border border-[#E8DCC4] bg-[#FAF6EE]/45 p-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <Home className="mt-1 h-5 w-5 shrink-0 text-[#6B1A2A]" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="break-words text-lg font-semibold text-[#2A1A1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Default delivery address
                    </h3>
                    <span className="w-fit rounded-full bg-[#6B1A2A] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">Default</span>
                  </div>
                  <p className="font-semibold text-[#2A1A1E]">{address.fullName}</p>
                  <p className="mt-1 text-sm leading-6 text-[#7A6065]">{address.phone}</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7A6065]">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#E8DCC4] bg-[#FAF6EE]/45 p-4 sm:p-5">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <Home className="mt-1 h-5 w-5 shrink-0 text-[#6B1A2A]" />
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-semibold text-[#2A1A1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    No default address yet
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7A6065]">
                    Add a delivery address to make checkout faster for your next SOIL GODDESS order.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )
    }

    if (activeTab === 'settings') {
      return (
        <section className="rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] p-4 sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#E8DCC4] pb-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#7A6065]">Settings</p>
              <h2 className="break-words text-2xl font-semibold leading-tight text-[#6B1A2A] sm:text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Profile preferences
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditing(current => !current)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#6B1A2A] px-5 py-3 font-semibold text-white transition hover:bg-[#4A0F1C] sm:w-auto"
            >
              {editing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {editing ? 'Save' : 'Edit'}
            </button>
          </div>

          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Name</span>
              <input
                value={profile.name}
                readOnly={!editing}
                onChange={event => setProfile(current => ({ ...current, name: event.target.value }))}
                className="w-full rounded-md border border-[#E8DCC4] bg-white px-4 py-3 text-sm text-[#2A1A1E] outline-none transition read-only:text-[#7A6065] focus:border-[#6B1A2A]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Email</span>
              <input
                value={profile.email}
                readOnly={!editing}
                onChange={event => setProfile(current => ({ ...current, email: event.target.value }))}
                className="w-full rounded-md border border-[#E8DCC4] bg-white px-4 py-3 text-sm text-[#2A1A1E] outline-none transition read-only:text-[#7A6065] focus:border-[#6B1A2A]"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#2A1A1E]">Mobile</span>
              <input
                value={profile.mobile}
                readOnly={!editing}
                onChange={event => setProfile(current => ({ ...current, mobile: event.target.value }))}
                className="w-full rounded-md border border-[#E8DCC4] bg-white px-4 py-3 text-sm text-[#2A1A1E] outline-none transition read-only:text-[#7A6065] focus:border-[#6B1A2A]"
              />
            </label>
          </div>
        </section>
      )
    }

    return (
      <section className="rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] p-5 text-center sm:p-8">
        <LogOut className="mx-auto mb-5 h-9 w-9 text-[#6B1A2A] sm:h-10 sm:w-10" />
        <h2 className="mb-3 text-2xl font-semibold text-[#6B1A2A] sm:text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
          Logout
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#7A6065]">Logout will clear the saved account shortcut on this device.</p>
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(ACCOUNT_READY_KEY)
            router.push('/')
          }}
          className="inline-flex w-full justify-center rounded-md bg-[#6B1A2A] px-6 py-3 font-semibold text-white transition hover:bg-[#4A0F1C] sm:w-auto"
        >
          Logout and go home
        </button>
      </section>
    )
  }

  return (
    <main className="bg-[#FAF6EE] text-[#2A1A1E]">
      <section className="border-b border-[#E8DCC4] bg-[#FAF6EE]">
        <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-8 sm:py-10 lg:px-16 xl:px-24">
          <p className="mb-3 text-sm uppercase tracking-[0.1em] text-[#6B1A2A]" style={{ fontFamily: 'Playfair Display, serif' }}>
            My Account
          </p>
          <h1 className="mb-3 break-words text-3xl font-semibold leading-tight text-[#6B1A2A] sm:mb-4 sm:text-4xl md:text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Hello, Arun
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[#2A1A1E] sm:text-xl sm:leading-8 md:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
            Manage orders, addresses, and profile preferences.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-7 sm:px-8 sm:py-10 lg:px-16 xl:px-24">
        <div className="grid min-w-0 gap-5 sm:gap-7 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-lg border border-[#E8DCC4] bg-[#FFFCF7] p-4 shadow-[0_12px_35px_rgba(74,15,28,0.05)] sm:p-6">
            <div className="mb-5 flex min-w-0 items-center gap-3 border-b border-[#E8DCC4] pb-5 sm:mb-6 sm:gap-4 sm:pb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/45 bg-[#F5EDD6] text-xl font-semibold text-[#6B1A2A] sm:h-16 sm:w-16 sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                {account.initials}
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold leading-tight text-[#2A1A1E] sm:text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {account.name}
                </h2>
                <p className="mt-1 break-all text-sm leading-5 text-[#7A6065] sm:break-words sm:text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {account.email}
                </p>
              </div>
            </div>

            <nav className="hidden space-y-3 lg:block" aria-label="Account navigation">
              {tabs.map(({ id, label, Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex w-full min-w-0 items-center gap-3 rounded-md px-4 py-3 text-left text-xl font-semibold transition xl:text-2xl ${
                      active ? 'bg-[#6B1A2A] text-white shadow-[inset_4px_0_0_#C9A84C]' : 'text-[#2A1A1E] hover:bg-[#F5EDD6] hover:text-[#6B1A2A]'
                    }`}
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                )
              })}
            </nav>

            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden" aria-label="Account navigation">
              {tabs.map(({ id, label, Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                      active ? 'border-[#6B1A2A] bg-[#6B1A2A] text-white' : 'border-[#E8DCC4] bg-white text-[#2A1A1E]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                )
              })}
            </nav>
          </aside>

          <div>{renderPanel()}</div>
        </div>
      </section>
    </main>
  )
}
