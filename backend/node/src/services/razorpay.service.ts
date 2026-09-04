import Razorpay from 'razorpay'
import { createHmac } from 'crypto'
import { env } from '../config/env.js'
import { AppError } from '../utils/http.js'

const instance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

function describeRazorpayError(err: any): string {
  if (!err) return 'Unknown Razorpay error.'
  const desc = err?.error?.description ?? err?.description ?? ''
  if (typeof desc === 'string' && desc.trim()) return desc.trim()
  if (typeof err?.message === 'string' && err.message.trim() && !err.message.includes('{')) return err.message.trim()
  if (typeof err?.code === 'string') return err.code
  return 'Unknown Razorpay error.'
}

export function razorpayFailure(err: any): never {
  const status = Number(err?.statusCode)
  const code: string = Number(status) === 401 ? 'Razorpay authentication failed. Check your Razorpay API keys.' : 'Razorpay request failed.'
  throw new AppError(status >= 400 && status < 600 ? status : 502, `${code} (${describeRazorpayError(err)})`)
}

export type RazorpayOrder = {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export async function createRazorpayOrder(params: {
  amount: number
  receipt: string
  notes?: Record<string, string>
}): Promise<RazorpayOrder> {
  try {
    const order = await instance.orders.create({
      amount: Math.round(params.amount * 100),
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes ?? {},
    })
    return order as unknown as RazorpayOrder
  } catch (err) {
    console.error('[Razorpay] orders.create failed:', err)
    return razorpayFailure(err)
  }
}

export function verifyPayment(params: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}): boolean {
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`
  const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return expectedSignature === params.razorpaySignature
}

export async function fetchPayment(paymentId: string) {
  try {
    return await instance.payments.fetch(paymentId)
  } catch (err) {
    console.error('[Razorpay] payments.fetch failed:', err)
    return razorpayFailure(err)
  }
}

export async function capturePayment(paymentId: string, amount: number) {
  try {
    return await instance.payments.capture(paymentId, Math.round(amount * 100), 'INR')
  } catch (err) {
    console.error('[Razorpay] payments.capture failed:', err)
    return razorpayFailure(err)
  }
}

export async function refundPayment(paymentId: string, amount?: number): Promise<any> {
  const opts: Record<string, unknown> = {}
  if (amount != null) {
    opts.amount = Math.round(amount * 100) // Razorpay expects paise
  }
  try {
    return await instance.payments.refund(paymentId, opts)
  } catch (err) {
    console.error('[Razorpay] payments.refund failed:', err)
    return razorpayFailure(err)
  }
}
