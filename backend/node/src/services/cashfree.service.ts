import { Cashfree, CFEnvironment } from 'cashfree-pg'
import { env } from '../config/env.js'
import { AppError } from '../utils/http.js'

const cashfree = new Cashfree(
  env.NODE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  env.CASHFREE_CLIENT_ID,
  env.CASHFREE_CLIENT_SECRET,
)

export type CashfreeOrder = {
  order_id: string
  order_amount: number
  order_currency: string
  order_status: string
  payment_session_id: string
  cf_order_id: number
}

export type CashfreePayment = {
  cf_payment_id: number
  order_id: string
  payment_status: string
  payment_amount?: number
  order_amount?: number
  payment_time?: string
  error_details?: { error_code?: string; error_description?: string; error_reason?: string } | null
}

function describeCashfreeError(err: any): string {
  const msg =
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    err?.message ??
    ''
  if (typeof msg === 'string' && msg.trim()) return msg.trim()
  return 'Unknown Cashfree error.'
}

export function cashfreeFailure(err: any): never {
  const status = Number(err?.response?.status) || Number(err?.statusCode)
  const code: string =
    status === 401
      ? 'Cashfree authentication failed. Check your Cashfree API keys.'
      : 'Cashfree request failed.'
  throw new AppError(status >= 400 && status < 600 ? status : 502, `${code} (${describeCashfreeError(err)})`)
}

function randomRefId(): string {
  return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export async function createCashfreeOrder(params: {
  amount: number
  orderId: string
  customerId: string
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  returnUrl: string
  notifyUrl: string
}): Promise<CashfreeOrder> {
  const request = {
    order_id: params.orderId,
    order_amount: Math.round(params.amount * 100) / 100,
    order_currency: 'INR',
    customer_details: {
      customer_id: params.customerId,
      ...(params.customerName ? { customer_name: params.customerName } : {}),
      ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
      ...(params.customerPhone ? { customer_phone: params.customerPhone } : {}),
    },
    order_meta: {
      return_url: params.returnUrl,
      notify_url: params.notifyUrl,
    },
  }
  try {
    const response = await cashfree.PGCreateOrder(request as any)
    return response.data as unknown as CashfreeOrder
  } catch (err) {
    console.error('[Cashfree] PGCreateOrder failed:', err)
    return cashfreeFailure(err)
  }
}

export async function getOrderPayments(orderId: string): Promise<CashfreePayment[]> {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId)
    return (response.data as unknown as CashfreePayment[]) ?? []
  } catch (err) {
    console.error('[Cashfree] PGOrderFetchPayments failed:', err)
    return cashfreeFailure(err)
  }
}

export async function isOrderPaid(orderId: string): Promise<{ paid: boolean; paymentId?: string; payments: CashfreePayment[] }> {
  const payments = await getOrderPayments(orderId)
  const success = payments.find(p => p.payment_status === 'SUCCESS')
  return {
    paid: Boolean(success),
    paymentId: success ? String(success.cf_payment_id) : undefined,
    payments,
  }
}

export async function refundOrder(orderId: string, amount?: number, note?: string): Promise<any> {
  const request: Record<string, unknown> = {
    refund_id: randomRefId(),
    refund_amount: amount != null ? Math.round(amount * 100) / 100 : undefined,
    ...(note ? { refund_note: note } : {}),
  }
  if (request.refund_amount === undefined) delete request.refund_amount
  try {
    const response = await cashfree.PGOrderCreateRefund(orderId, request as any)
    return response.data
  } catch (err) {
    console.error('[Cashfree] PGOrderCreateRefund failed:', err)
    return cashfreeFailure(err)
  }
}

export function verifyWebhookSignature(signature: string, rawBody: string, timestamp: string): any {
  try {
    return cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp)
  } catch (err: any) {
    throw new AppError(400, `Invalid Cashfree webhook signature: ${err?.message || 'unknown'}`)
  }
}
