import { apiFetch, apiPost } from '@/lib/api'

export type OrderData = {
  id: number
  orderNumber: string
  customerId: number
  status: string
  paymentStatus: string
  subtotal: number
  shippingTotal: number
  grandTotal: number
  shippingAddress: Record<string, unknown>
  items: OrderItemData[]
  createdAt: string
}

export type OrderItemData = {
  id: number
  productId: number
  name: string
  sku: string
  variantLabel: string
  quantity: number
  unitPrice: number
  total: number
}

export type CreateOrderInput = {
  items: { productId: number; variantId?: number; quantity: number; price: number }[]
  shippingAddress: {
    fullName: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: 'cod' | 'razorpay'
  couponCode?: string
}

export async function createOrder(data: CreateOrderInput): Promise<OrderData> {
  const res = await apiFetch('/storefront/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function createRazorpayOrder(data: { amount: number; currency?: string }): Promise<{ id: string; amount: number; currency: string }> {
  return apiPost('/storefront/orders/create-razorpay-order', data)
}

export async function verifyPayment(data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string; orderId: number }): Promise<{ message: string }> {
  return apiPost('/storefront/orders/verify-payment', data)
}

export async function calculateShipping(data: { pincode: string; items: { weight?: number; quantity: number }[] }): Promise<{ shippingTotal: number; estimatedDays: string }> {
  return apiPost('/storefront/orders/calculate-shipping', data)
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon: { code: string; type: string; value: number } }> {
  return apiPost('/storefront/orders/validate-coupon', { code, subtotal })
}

export async function fetchOrders(): Promise<OrderData[]> {
  const res = await apiFetch('/storefront/orders')
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function fetchOrderById(id: number | string): Promise<OrderData> {
  const res = await apiFetch(`/storefront/orders/${id}`)
  if (!res.ok) throw new Error('Failed to fetch order')
  return res.json()
}
