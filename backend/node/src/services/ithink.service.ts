import { env } from '../config/env.js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IthinkAuthPayload {
  access_token: string
  secret_key: string
}

interface IthinkServiceabilityResponse {
  status: boolean
  message: string
  data?: {
    is_serviceable?: boolean
    cod_available?: boolean
    prepaid_available?: boolean
  }
}

interface IthinkRateResponse {
  status: boolean
  message: string
  data?: {
    total_charge?: number
    estimated_delivery_days?: string | number
  }
}

interface IthinkOrderResponse {
  status: boolean
  message: string
  data?: {
    order_id?: string | number
    shipment_id?: string | number
    awb_number?: string
    label_url?: string
    tracking_url?: string
  }
}

interface IthinkCancelResponse {
  status: boolean
  message: string
}

interface IthinkTrackResponse {
  status: boolean
  message: string
  data?: Array<{
    awb_number?: string
    current_status?: string
    scan_detail?: Array<{ status?: string; date?: string; location?: string }>
  }>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = (env as any).ITHINK_API_BASE_URL || 'https://my.ithinklogistics.com/api_v3'
const IS_TEST = env.SHIPPING_ENV === 'test'

// ─── Status Map ───────────────────────────────────────────────────────────────

export const ITHINK_STATUS_MAP: Record<string, string> = {
  // Booking states
  'Booked': 'dispatched',
  'Shipment Booked': 'dispatched',
  'In Transit': 'dispatched',
  'Intransit': 'dispatched',
  'Pickup Scheduled': 'dispatched',
  'Picked Up': 'dispatched',
  // Delivery states
  'Out For Delivery': 'out_for_delivery',
  'Out for Delivery': 'out_for_delivery',
  'Delivered': 'delivered',
  // Return / Exception
  'RTO Initiated': 'rto',
  'RTO In Transit': 'rto',
  'RTO Delivered': 'returned',
  'Return': 'returned',
  'Returned': 'returned',
  // Cancelled
  'Cancelled': 'cancelled',
  'Cancellation Requested': 'cancelled',
}

export function mapIthinkStatus(status: string): string | null {
  return ITHINK_STATUS_MAP[status] || null
}

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────

function authPayload(): IthinkAuthPayload {
  return {
    access_token: (env as any).ITHINK_ACCESS_TOKEN || '',
    secret_key: (env as any).ITHINK_SECRET_KEY || '',
  }
}

async function apiPost<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const url = `${BASE}/${endpoint}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...authPayload(), ...body }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`iThink API error (${res.status}) at ${endpoint}: ${text}`)
  }
  return res.json() as Promise<T>
}

async function apiGet<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const url = `${BASE}/${endpoint}${qs}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'access-token': (env as any).ITHINK_ACCESS_TOKEN || '',
      'secret-key': (env as any).ITHINK_SECRET_KEY || '',
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`iThink API error (${res.status}) at ${endpoint}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ─── Mock Helpers (SHIPPING_ENV=test) ────────────────────────────────────────

function mockOrderId(): string {
  return `ITHINK-TEST-${Date.now()}`
}

function mockAwb(): string {
  return `TEST${Math.floor(Math.random() * 9000000000 + 1000000000)}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if a delivery pincode is serviceable.
 * Returns an array of available courier options with rate + ETA.
 * Maintains identical signature to the old shiprocket.service.ts.
 */
export async function checkServiceability(params: {
  deliveryPincode: string
  weight: number
  cod?: boolean
  declaredValue?: number
}): Promise<Array<{ courier_name: string; rate: number; estimated_delivery_days: string }>> {

  if (IS_TEST) {
    console.log('[iThink TEST] checkServiceability mock for pincode:', params.deliveryPincode)
    return [{ courier_name: 'iThink Logistics (Test)', rate: 60, estimated_delivery_days: '5-7 days' }]
  }

  if (!(env as any).ITHINK_ACCESS_TOKEN) {
    throw new Error('iThink Logistics credentials not configured')
  }

  try {
    // Step 1: Check serviceability
    const svcRes = await apiPost<IthinkServiceabilityResponse>('pincode/check', {
      pincode: params.deliveryPincode,
      type: params.cod ? 'cod' : 'prepaid',
    })

    if (!svcRes.status || !svcRes.data?.is_serviceable) {
      return []
    }

    // Step 2: Get rate
    const rateRes = await apiPost<IthinkRateResponse>('rate/get', {
      from_pincode: env.WAREHOUSE_PINCODE || '641104',
      to_pincode: params.deliveryPincode,
      weight: String(params.weight),
      cod: params.cod ? '1' : '0',
      declared_value: String(params.declaredValue || 0),
    })

    const rate = rateRes.data?.total_charge ?? 60
    const eta = String(rateRes.data?.estimated_delivery_days ?? '5-7 days')

    return [{ courier_name: 'iThink Logistics', rate, estimated_delivery_days: eta }]
  } catch (err: any) {
    console.error('[iThink] checkServiceability failed:', err.message)
    return []
  }
}

/**
 * Create a shipment booking with iThink Logistics.
 * Returns order_id, shipment_id, awb_code (AWB is usually returned immediately by iThink).
 * Maintains identical signature to the old shiprocket.service.ts createShipment.
 */
export async function createShipment(order: {
  orderId: number
  orderNumber: string
  orderDate: string
  billingCustomerName: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingPincode: string
  billingPhone: string
  orderItems: Array<{ name: string; sku: string; quantity: number; price: number }>
  paymentMethod: string
  weight?: number
  lengthCm?: number
  breadthCm?: number
  heightCm?: number
  subTotal?: number
  grandTotal?: number
}): Promise<{ order_id: string | number; shipment_id: string | number; status: string; awb_code?: string; label_url?: string }> {

  if (IS_TEST) {
    const fakeOrderId = mockOrderId()
    const fakeAwb = mockAwb()
    console.log(`[iThink TEST] createShipment mock — order: ${order.orderNumber}, fake_order_id: ${fakeOrderId}, fake_awb: ${fakeAwb}`)
    return {
      order_id: fakeOrderId,
      shipment_id: fakeOrderId,
      status: 'Booked',
      awb_code: fakeAwb,
      label_url: '',
    }
  }

  if (!(env as any).ITHINK_ACCESS_TOKEN) {
    throw new Error('iThink Logistics credentials not configured')
  }

  const nameParts = order.billingCustomerName.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Customer'
  const lastName = nameParts.slice(1).join(' ') || ''

  const orderItems = order.orderItems.map(item => ({
    name: item.name,
    qty: item.quantity,
    price: item.price,
    sku: item.sku || 'SKU',
  }))

  const body = {
    order_id: order.orderNumber,
    order_date: order.orderDate,
    warehouse_code: (env as any).ITHINK_WAREHOUSE_CODE || 'Primary',
    consignee: {
      name: `${firstName} ${lastName}`.trim(),
      address: order.billingAddress,
      address2: '',
      city: order.billingCity,
      state: order.billingState,
      pincode: order.billingPincode,
      phone: order.billingPhone,
      country: 'India',
    },
    product_detail: orderItems,
    order_type: order.paymentMethod === 'cod' ? 'cod' : 'prepaid',
    payment_mode: order.paymentMethod === 'cod' ? 'cod' : 'prepaid',
    collectible_amount: order.paymentMethod === 'cod' ? String(order.grandTotal ?? 0) : '0',
    total_amount: String(order.grandTotal ?? 0),
    quantity: String(order.orderItems.reduce((s, i) => s + i.quantity, 0)),
    weight: String(order.weight ?? 0.5),
    length: String(order.lengthCm ?? 10),
    breadth: String(order.breadthCm ?? 10),
    height: String(order.heightCm ?? 5),
    comment: `Order #${order.orderNumber}`,
  }

  const res = await apiPost<IthinkOrderResponse>('order/add', body)

  if (!res.status) {
    throw new Error(`iThink order creation failed: ${res.message}`)
  }

  return {
    order_id: res.data?.order_id ?? order.orderNumber,
    shipment_id: res.data?.shipment_id ?? res.data?.order_id ?? order.orderNumber,
    status: 'Booked',
    awb_code: res.data?.awb_number,
    label_url: res.data?.label_url,
  }
}

/**
 * Get AWB for a booked order.
 * On iThink, AWB is usually returned in createShipment — this is a fallback fetch.
 */
export async function getAwb(orderId: string | number): Promise<{ awb_code: string; label_url?: string; courier_name?: string }> {
  if (IS_TEST) {
    console.log(`[iThink TEST] getAwb mock — orderId: ${orderId}`)
    return { awb_code: mockAwb(), courier_name: 'iThink Logistics (Test)' }
  }

  const res = await apiPost<IthinkOrderResponse>('order/get_awb', { order_id: String(orderId) })
  if (!res.status || !res.data?.awb_number) {
    throw new Error(`iThink getAwb failed: ${res.message}`)
  }
  return {
    awb_code: res.data.awb_number,
    label_url: res.data?.label_url,
    courier_name: 'iThink Logistics',
  }
}

/**
 * Generate pickup / manifest for a shipment.
 * On iThink this maps to manifest generation.
 */
export async function generatePickup(shipmentId: string | number): Promise<{ pickup_token: string; pickup_date: string; pickup_time: string; status: string }> {
  if (IS_TEST) {
    console.log(`[iThink TEST] generatePickup mock — shipmentId: ${shipmentId}`)
    return { pickup_token: `PKUP-TEST-${Date.now()}`, pickup_date: new Date().toISOString().split('T')[0], pickup_time: '10:00', status: 'Scheduled' }
  }

  try {
    const res = await apiPost<{ status: boolean; message: string; data?: { manifest_url?: string } }>('shipment/manifest', {
      shipment_id: [String(shipmentId)],
    })
    return {
      pickup_token: String(shipmentId),
      pickup_date: new Date().toISOString().split('T')[0],
      pickup_time: '10:00',
      status: res.status ? 'Scheduled' : 'Failed',
    }
  } catch (err: any) {
    console.error('[iThink] generatePickup failed:', err.message)
    return { pickup_token: String(shipmentId), pickup_date: '', pickup_time: '', status: 'Failed' }
  }
}

/**
 * Cancel an iThink order.
 */
export async function cancelOrder(orderId: string): Promise<{ status: string; message: string }> {
  if (IS_TEST) {
    console.log(`[iThink TEST] cancelOrder mock — orderId: ${orderId}`)
    return { status: 'success', message: 'Order cancelled (test mode)' }
  }

  const res = await apiPost<IthinkCancelResponse>('order/cancel', { order_id: orderId })
  return { status: res.status ? 'success' : 'failed', message: res.message }
}

/**
 * Track a shipment by AWB number.
 */
export async function trackShipment(awbNumber: string): Promise<unknown> {
  if (IS_TEST) {
    console.log(`[iThink TEST] trackShipment mock — awb: ${awbNumber}`)
    return { status: true, data: [{ awb_number: awbNumber, current_status: 'In Transit' }] }
  }

  return apiPost<IthinkTrackResponse>('order/track', {
    awb_number_list: [awbNumber],
  })
}
