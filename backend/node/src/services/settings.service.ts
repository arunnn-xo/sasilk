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

export interface HomeNewArrivalsConfig {
  enabled: boolean
  limit: number
}

export interface GuestDiscountPopupConfig {
  enabled: boolean
  discountPercentage: number
  message: string
}

export interface IntroVideoConfig {
  enabled: boolean
  videoUrl: string
  posterUrl?: string
  skipEnabled: boolean
  skipAfterSeconds: number
  showOncePerSession: boolean
}

const defaultCompany: CompanyInfo = {
  name: 'Soil Goddess',
  address: '108, Heritage Handloom Arcade, Temple Road, Kanchipuram',
  city: 'Tamil Nadu — 631502',
  gstin: '33ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  phone: '+91 8822664432',
  email: 'care@soilgoddess.com',
  invoicePrefix: 'SG',
  logoUrl: '/logo.png',
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

const defaultHomeNewArrivals: HomeNewArrivalsConfig = {
  enabled: true,
  limit: 4,
}

export const defaultIntroVideoConfig: IntroVideoConfig = {
  enabled: false,
  videoUrl: '',
  posterUrl: '',
  skipEnabled: true,
  skipAfterSeconds: 0,
  showOncePerSession: true,
}

let cachedCompany: CompanyInfo | null = null
let cachedShipping: ShippingConfig | null = null
let cachedGuestDiscountPopup: GuestDiscountPopupConfig | null = null
let cachedHomeNewArrivals: HomeNewArrivalsConfig | null = null
let cachedIntroVideoConfig: IntroVideoConfig | null = null

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

export async function getHomeNewArrivalsConfig(): Promise<HomeNewArrivalsConfig> {
  if (cachedHomeNewArrivals) return cachedHomeNewArrivals
  const setting = await Setting.findOne({ where: { key: 'home_new_arrivals_config' } })
  if (!setting) return defaultHomeNewArrivals
  const value = setting.get('value') as Record<string, unknown>
  cachedHomeNewArrivals = {
    enabled: Boolean(value.enabled),
    limit: Math.min(12, Math.max(1, Number(value.limit) || 4)),
  }
  return cachedHomeNewArrivals
}

export function invalidateHomeNewArrivalsCache() {
  cachedHomeNewArrivals = null
}

export async function getIntroVideoConfig(): Promise<IntroVideoConfig> {
  if (cachedIntroVideoConfig) return cachedIntroVideoConfig
  const setting = await Setting.findOne({ where: { key: 'intro_video_config' } })
  if (!setting) return defaultIntroVideoConfig
  let rawValue = setting.get('value') as unknown
  if (typeof rawValue === 'string') {
    try {
      rawValue = JSON.parse(rawValue)
    } catch {
      rawValue = {}
    }
  }
  const value = (rawValue && typeof rawValue === 'object' ? rawValue : {}) as Record<string, unknown>
  cachedIntroVideoConfig = {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : defaultIntroVideoConfig.enabled,
    videoUrl: typeof value.videoUrl === 'string' ? value.videoUrl.trim() : defaultIntroVideoConfig.videoUrl,
    posterUrl: typeof value.posterUrl === 'string' ? value.posterUrl.trim() : defaultIntroVideoConfig.posterUrl,
    skipEnabled: typeof value.skipEnabled === 'boolean' ? value.skipEnabled : defaultIntroVideoConfig.skipEnabled,
    skipAfterSeconds: typeof value.skipAfterSeconds === 'number' && !isNaN(value.skipAfterSeconds)
      ? Math.min(30, Math.max(0, value.skipAfterSeconds))
      : (typeof value.skipAfterSeconds === 'string' && !isNaN(Number(value.skipAfterSeconds))
        ? Math.min(30, Math.max(0, Number(value.skipAfterSeconds)))
        : defaultIntroVideoConfig.skipAfterSeconds),
    showOncePerSession: typeof value.showOncePerSession === 'boolean'
      ? value.showOncePerSession
      : defaultIntroVideoConfig.showOncePerSession,
  }
  return cachedIntroVideoConfig
}

export function invalidateIntroVideoCache(): void {
  cachedIntroVideoConfig = null
}

