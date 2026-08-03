import { Setting } from '../models/index.js'

export interface CompanyInfo {
  name: string
  address: string
  city: string
  gstin: string
  pan: string
  phone: string
  email: string
  invoicePrefix: string
  logoUrl: string
}

export interface ShippingConfig {
  freeShippingEnabled: boolean
  freeShippingThreshold: number
}

export interface GuestDiscountPopupConfig {
  enabled: boolean
  discountPercentage: number
  message: string
}

const defaultCompany: CompanyInfo = {
  name: 'Threads of TN',
  address: '123, Rangapuri Street, Kanchipuram',
  city: 'Tamil Nadu — 631501',
  gstin: '33ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  phone: '+91 8822664432',
  email: 'hello@threadsoftn.com',
  invoicePrefix: 'INV',
  logoUrl: '/uploads/threads-of-tn-logo.png',
}

const defaultShipping: ShippingConfig = {
  freeShippingEnabled: false,
  freeShippingThreshold: 0,
}

const defaultGuestDiscountPopup: GuestDiscountPopupConfig = {
  enabled: false,
  discountPercentage: 10,
  message: 'Register now and get {percentage}% OFF on your purchase!',
}

let cachedCompany: CompanyInfo | null = null
let cachedShipping: ShippingConfig | null = null
let cachedGuestDiscountPopup: GuestDiscountPopupConfig | null = null

export async function getCompanyInfo(): Promise<CompanyInfo> {
  if (cachedCompany) return cachedCompany
  const setting = await Setting.findOne({ where: { key: 'company_info' } })
  if (!setting) return defaultCompany
  const value = setting.get('value') as Record<string, unknown>
  cachedCompany = { ...defaultCompany, ...value } as CompanyInfo
  return cachedCompany
}

export function invalidateCompanyCache() {
  cachedCompany = null
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  if (cachedShipping) return cachedShipping
  const setting = await Setting.findOne({ where: { key: 'shipping_config' } })
  if (!setting) return defaultShipping
  const value = setting.get('value') as Record<string, unknown>
  cachedShipping = {
    freeShippingEnabled: Boolean(value.freeShippingEnabled),
    freeShippingThreshold: Number(value.freeShippingThreshold) || 0,
  }
  return cachedShipping
}

export function invalidateShippingCache() {
  cachedShipping = null
}

export async function getGuestDiscountPopupConfig(): Promise<GuestDiscountPopupConfig> {
  if (cachedGuestDiscountPopup) return cachedGuestDiscountPopup
  const setting = await Setting.findOne({ where: { key: 'guest_discount_popup' } })
  if (!setting) return defaultGuestDiscountPopup
  const value = setting.get('value') as Record<string, unknown>
  cachedGuestDiscountPopup = {
    enabled: Boolean(value.enabled),
    discountPercentage: Number(value.discountPercentage) || 0,
    message: typeof value.message === 'string' && value.message.trim() ? value.message : defaultGuestDiscountPopup.message,
  }
  return cachedGuestDiscountPopup
}

export function invalidateGuestDiscountPopupCache() {
  cachedGuestDiscountPopup = null
}
