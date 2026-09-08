import { Request, Response } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { Op } from 'sequelize'

function computeGuestToken(orderId: number): string {
  return crypto.createHmac('sha256', env.COOKIE_SECRET)
    .update(orderId.toString())
    .digest('hex')
    .slice(0, 16)
}
import {
  Product,
  ProductVariant,
  Order,
  OrderItem,
  Coupon,
  CouponUsage,
  CouponCustomer,
} from '../../../models/index.js'
import { sequelize } from '../../../database/sequelize.js'
import { AppError } from '../../../utils/http.js'
import { env } from '../../../config/env.js'
import { checkServiceability } from '../../../services/ithink.service.js'
import { createCashfreeOrder, isOrderPaid, refundOrder } from '../../../services/cashfree.service.js'
import { createInvoiceForOrder } from '../../../services/invoice.service.js'
import { getCompanyInfo, getShippingConfig } from '../../../services/settings.service.js'
import { resolveAutoWelcomeDiscountPercentage } from '../../../services/guest-coupon.service.js'
import * as emailService from '../../../services/email.service.js'
import { plain } from './helpers.js'

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `TN-${date}-${suffix}`
}

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive().optional(),
    variantId: z.number().int().positive().optional(),
    name: z.string().min(1).max(180),
    sku: z.string().max(80).optional(),
    variantLabel: z.string().max(120).optional(),
    color: z.string().max(80).optional(),
    size: z.string().max(40).optional(),
    imageUrl: z.string().max(255).optional(),
    quantity: z.coerce.number().int().min(1),
    unitPrice: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
  })).min(1),
  customerEmail: z.string().email().optional(),
  paymentMethod: z.enum(['upi', 'card', 'netbanking']),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(1),
    phone: z.string().min(1),
  }).optional(),
  shippingTotal: z.coerce.number().min(0).default(0),
})

async function getValidatedShippingTotal(
  items: Array<{ productId?: number; quantity: number }>,
  pincode: string,
  cod: boolean,
  subtotal: number,
): Promise<number> {
  if (!pincode) return 0
  const shippingConfig = await getShippingConfig()
  if (shippingConfig.freeShippingEnabled && subtotal >= shippingConfig.freeShippingThreshold) return 0
  try {
    const productIds = [...new Set(items.map(i => i.productId).filter(Boolean) as number[])]
    const products = productIds.length > 0
      ? await Product.findAll({ where: { id: productIds }, attributes: ['id', 'weightKg'] })
      : []
    const weightMap = new Map(products.map(p => {
      const plainProduct = p.get({ plain: true }) as any
      return [plainProduct.id, Number(plainProduct.weightKg || 0.5)]
    }))

    const totalWeight = items.reduce((sum, item) => {
      const wt = weightMap.get(item.productId!) ?? 0.5
      return sum + wt * item.quantity
    }, 0)

    const couriers = await checkServiceability({
      deliveryPincode: pincode,
      weight: Math.max(totalWeight, 0.5),
      cod,
      declaredValue: subtotal,
    })

    if (couriers.length > 0) {
      const lowest = couriers.reduce((min, c) => c.rate < min.rate ? c : min)
      return lowest.rate
    }
    return Number(process.env.FALLBACK_SHIPPING_RATE) || 60
  } catch (err: any) {
    console.error('[Shipping Validation] Failed to recalculate shipping:', err?.message || err)
    return Number(process.env.FALLBACK_SHIPPING_RATE) || 60
  }
}

export const createOrder = async (req: Request, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const auth = (req as any).auth
  const { items, customerEmail, paymentMethod, shippingAddress, shippingTotal } = parsed.data
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  // Validate shippingTotal on backend
  let validatedShippingTotal = shippingTotal
  if (shippingAddress?.pincode) {
    validatedShippingTotal = await getValidatedShippingTotal(
      items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress.pincode,
      false,
      subtotal
    )
  }
  const grandTotal = subtotal + validatedShippingTotal

  // Verify prices against database and check stock
  const productIds = [...new Set(items.filter(i => i.productId).map(i => i.productId!))]
  const variantIds = [...new Set(items.filter(i => i.variantId).map(i => i.variantId!))]

  const [products, variants]: [any[], any[]] = await Promise.all([
    productIds.length > 0
      ? Product.findAll({ where: { id: productIds } })
      : Promise.resolve([]),
    variantIds.length > 0
      ? ProductVariant.findAll({ where: { id: variantIds } })
      : Promise.resolve([]),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const variantMap = new Map(variants.map(v => [v.id, v]))
  const variantProductMap = new Map(variants.map(v => [v.id, v.productId]))

  for (const item of items) {
    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant) throw new AppError(400, `Variant ${item.variantId} not found.`)
      const dbPrice = Number(variant.price)
      if (Math.abs(dbPrice - item.unitPrice) > 1) {
        throw new AppError(400, `Price mismatch for "${item.name}". Expected ₹${dbPrice}, got ₹${item.unitPrice}.`)
      }
      let availableStock = Number(variant.stockQty)
      if (availableStock < item.quantity) {
        throw new AppError(400, `Insufficient stock for "${item.name}" (Size: ${item.size || '—'}). Only ${availableStock} left.`)
      }
    } else if (item.productId) {
      const product = productMap.get(item.productId)
      if (!product) throw new AppError(400, `Product ${item.productId} not found.`)
      const dbPrice = Number(product.price)
      if (Math.abs(dbPrice - item.unitPrice) > 1) {
        throw new AppError(400, `Price mismatch for "${item.name}". Expected ₹${dbPrice}, got ₹${item.unitPrice}.`)
      }
      if (product.stockQty < item.quantity) {
        throw new AppError(400, `Insufficient stock for "${item.name}". Only ${product.stockQty} left.`)
      }
    }
  }

  // Calculate GST totals
  let gstTotal = 0
  let taxableAmount = 0
  for (const item of items) {
    let gstRate = 0
    if (item.variantId) {
      const pid = variantProductMap.get(item.variantId)
      const p = pid ? productMap.get(pid) : null
      gstRate = p ? Number(p.gstRate || 0) : 0
    } else if (item.productId) {
      const p = productMap.get(item.productId)
      gstRate = p ? Number(p.gstRate || 0) : 0
    }
    if (gstRate > 0) {
      taxableAmount += Math.round(item.total * 100 / (100 + gstRate) * 100) / 100
      gstTotal += Math.round(item.total * gstRate / (100 + gstRate) * 100) / 100
    } else {
      taxableAmount += item.total
    }
  }

  const result = await sequelize.transaction(async (t) => {
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customerId: auth?.sub ?? null,
      customerEmail: customerEmail ?? auth?.email ?? null,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal,
      shippingTotal: validatedShippingTotal,
      grandTotal,
      gstTotal: Math.round(gstTotal * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      shippingAddress: shippingAddress ?? null,
      metadata: { paymentMethod },
    }, { transaction: t })

    const orderItems = await OrderItem.bulkCreate(
      items.map(item => ({
        orderId: order.get('id') as number,
        productId: item.productId ?? null,
        variantId: item.variantId ?? null,
        name: item.name,
        sku: item.sku ?? null,
        variantLabel: item.variantLabel ?? null,
        color: item.color ?? null,
        size: item.size ?? null,
        imageUrl: item.imageUrl ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      { transaction: t },
    )

    // Deduct stock with row lock
    for (const item of items) {
      if (item.variantId) {
        const v = await ProductVariant.findOne({
          where: { id: item.variantId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        })
        if (v) {
          const currentStock = (v as any).stockQty ?? 0
          if (currentStock < item.quantity) {
            throw new AppError(400, `Insufficient stock for "${item.name}". Only ${currentStock} left.`)
          }
          await v.update({ stockQty: currentStock - item.quantity }, { transaction: t })
        }
      } else if (item.productId) {
        const p = await Product.findOne({
          where: { id: item.productId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        })
        if (p) {
          const currentStock = (p as any).stockQty ?? 0
          if (currentStock < item.quantity) {
            throw new AppError(400, `Insufficient stock for "${item.name}". Only ${currentStock} left.`)
          }
          await p.update({ stockQty: currentStock - item.quantity }, { transaction: t })
        }
      }
    }

    return { order, orderItems }
  })

  const orderIdNum = result.order.get('id') as number
  const guestToken = !auth ? computeGuestToken(orderIdNum) : undefined

  res.status(201).json({
    order: plain(result.order),
    items: result.orderItems.map(row => plain(row)),
    guestToken,
  })

  // Async: create invoice + send confirmation emails (fire-and-forget)
  const orderId = result.order.get('id') as number
  const orderNumber = result.order.get('orderNumber') as string
  const adminEmail = env.ADMIN_EMAIL

  Promise.all([
    createInvoiceForOrder(orderId, { sendEmail: false }),
    getCompanyInfo(),
    // Re-fetch with items so the email shows the full item breakdown
    Order.findByPk(orderId, { include: [{ model: OrderItem, as: 'items' }] }),
  ]).then(([, company, fullOrder]) => {
    const orderWithItems = fullOrder ? plain(fullOrder) : plain(result.order)
    const customerEmailTo = ((auth?.email || customerEmail || '') as string)
    if (customerEmailTo) {
      emailService.sendOrderConfirmationEmail(customerEmailTo, orderWithItems, company).catch((err: any) => {
        console.error(`[Order ${orderNumber}] Customer email failed:`, err.message)
      })
    }
    return emailService.sendAdminOrderNotification(adminEmail, orderWithItems, company)
  }).catch((err: any) => {
    console.error(`[Order ${orderNumber}] Post-order notification failed:`, err.message)
  })
}

// An order the customer never actually completed: either it's still stuck at the
// pending-payment checkpoint (checkout was abandoned), or the payment gateway reported
// it as failed before the customer ever confirmed (payment.failed webhook cancels these
// straight from pending_payment and stamps cashfreeFailureReason). Neither should ever
// be visible to the customer as a placed order.
function isAbandonedCheckout(order: any): boolean {
  if (order.status === 'pending_payment') return true
  if (order.status === 'cancelled' && order.metadata && order.metadata.cashfreeFailureReason) return true
  return false
}

export const getOrders = async (req: Request, res: Response) => {
  const auth = (req as any).auth
  const orders = await Order.findAll({
    where: { customerId: auth.sub },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['createdAt', 'DESC']],
  })
  const visible = orders.map(row => plain<any>(row)).filter(order => !isAbandonedCheckout(order))
  res.json({ orders: visible })
}

export const getOrderById = async (req: Request, res: Response) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: 'items' }],
  })
  if (!order) throw new AppError(404, 'Order not found')

  const auth = (req as any).auth
  const plainOrder = plain<any>(order)

  if (auth) {
    if (plainOrder.customerEmail && plainOrder.customerEmail !== auth.email) {
      throw new AppError(403, 'You can only view your own orders.')
    }
  } else {
    const token = (req.query.token as string) || ''
    const expectedToken = computeGuestToken(Number(req.params.id))
    if (!token || token !== expectedToken) {
      throw new AppError(403, 'Authentication required to view this order.')
    }
  }

  if (isAbandonedCheckout(plainOrder)) throw new AppError(404, 'Order not found')

  res.json({ order: plainOrder })
}

const calculateShippingSchema = z.object({
  pincode: z.string().min(6).max(10),
  items: z.array(z.object({
    weight: z.coerce.number().min(0).default(0.5),
    quantity: z.coerce.number().int().min(1),
  })).min(1),
  cod: z.boolean().default(false),
  subtotal: z.number().min(0).optional(),
})

export const calculateShipping = async (req: Request, res: Response) => {
  const parsed = calculateShippingSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const totalWeight = parsed.data.items.reduce((sum, i) => sum + i.weight * i.quantity, 0)

  const shippingConfig = await getShippingConfig()
  if (shippingConfig.freeShippingEnabled && parsed.data.subtotal != null && parsed.data.subtotal >= shippingConfig.freeShippingThreshold) {
    return res.json({
      shippingOptions: [{ courierName: 'Free Shipping', rate: 0, estimatedDays: '2-5 business days' }],
    })
  }

  try {
    const couriers = await checkServiceability({
      deliveryPincode: parsed.data.pincode,
      weight: Math.max(totalWeight, 0.5),
      cod: parsed.data.cod,
      declaredValue: parsed.data.subtotal,
    })

    const sorted = couriers.sort((a, b) => a.rate - b.rate)

    res.json({
      shippingOptions: sorted.map(c => ({
        courierName: c.courier_name,
        rate: c.rate,
        estimatedDays: c.estimated_delivery_days,
      })),
    })
  } catch (err: any) {
    console.error('[Shipping] Shiprocket serviceability failed:', err?.message || err)
    // Fallback: use flat-rate shipping instead of free
    const FALLBACK_RATE = Number(process.env.FALLBACK_SHIPPING_RATE) || 60
    const FALLBACK_DAYS = process.env.FALLBACK_SHIPPING_DAYS || '5-7 days'
    res.json({
      shippingOptions: [{ courierName: 'Standard Shipping', rate: FALLBACK_RATE, estimatedDays: FALLBACK_DAYS }],
      fallback: true,
    })
  }
}

// A coupon's usedCount only moves once payment is confirmed, so checkouts still
// sitting in pending_payment hold a claim the counter cannot see yet. On a
// limited coupon that lets many more people than the limit allows pass
// validation at the same time, since every one of them reads the same stale
// count. Counting those in-flight holds closes the window. Rows older than the
// window are ignored so abandoned checkouts can't block the coupon forever.
const COUPON_HOLD_WINDOW_MS = 15 * 60 * 1000

async function countInFlightCouponHolds(couponId: number): Promise<number> {
  return Order.count({
    where: {
      couponId,
      status: 'pending_payment',
      createdAt: { [Op.gte]: new Date(Date.now() - COUPON_HOLD_WINDOW_MS) },
    },
  })
}

// True when the coupon has no headroom left once in-flight checkouts are counted.
async function isCouponUsageLimitReached(plainCoupon: any): Promise<boolean> {
  if (plainCoupon.usageLimit === null || plainCoupon.usageLimit <= 0) return false
  const held = await countInFlightCouponHolds(plainCoupon.id)
  return Number(plainCoupon.usedCount) + held >= Number(plainCoupon.usageLimit)
}

// The per-user limit is checked when the order is created, but the usage row
// that backs that check is only written once payment succeeds. Two checkouts
// opened at the same time therefore both read a clean slate and both receive
// the discount.
//
// It cannot be prevented at creation time: an unpaid order that is about to be
// paid and one the customer abandoned look identical, so refusing on the
// strength of an unpaid order would block the far more common case of somebody
// dismissing the payment window and immediately trying again.
//
// By the time we get here that ambiguity is gone — this one really was paid. If
// the customer is already at their limit on other orders, the discount was not
// theirs to take, and the only honest remedy after capture is a full refund and
// cancellation. That mirrors how an order is handled when its stock turns out
// to be gone after payment.
async function enforceCouponPerUserLimitOrRefund(
  couponId: number,
  orderId: number,
  plainOrder: any,
  order: any,
  cashfreeOrderId?: string,
): Promise<void> {
  const customerId = plainOrder.customerId ?? null
  if (!customerId) return

  const coupon = await Coupon.findByPk(couponId)
  if (!coupon) return
  const perUserLimit = Number((coupon.get({ plain: true }) as any).perUserLimit || 0)
  if (perUserLimit <= 0) return

  // Only usages booked by OTHER orders count — this one has not recorded its
  // own yet, and a retried confirmation of this same order must not trip it.
  const alreadyUsed = await CouponUsage.count({
    where: { couponId, customerId, orderId: { [Op.ne]: orderId } },
  })
  if (alreadyUsed < perUserLimit) return

  console.error(
    `[Order ${plainOrder.orderNumber}] Coupon ${couponId} is past its per-customer limit ` +
    `(customer ${customerId} has ${alreadyUsed} use(s), limit ${perUserLimit}). Refunding order ${cashfreeOrderId}.`,
  )
  if (cashfreeOrderId) {
    try {
      await refundOrder(cashfreeOrderId)
    } catch (refundErr: any) {
      console.error(
        `[Order ${plainOrder.orderNumber}] CRITICAL: refund FAILED for order ${cashfreeOrderId}:`,
        refundErr.message,
      )
    }
  }

  // Read metadata off the live instance rather than the pre-claim snapshot, so
  // keys written since then are not clobbered.
  const currentMetadata = (order.get({ plain: true }) as any).metadata || {}
  await order.update({
    status: 'cancelled',
    paymentStatus: 'refunded',
    metadata: {
      ...currentMetadata,
      cashfreeOrderId,
      refundReason: `Coupon per-customer limit of ${perUserLimit} already reached`,
      refundedAt: new Date().toISOString(),
    },
  })

  throw new AppError(
    400,
    'Order cancelled: this coupon has already been used the maximum number of times on your account. ' +
    'A full refund has been initiated and will reflect in 5-7 business days.',
  )
}

const validateCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
})

export const validateCoupon = async (req: Request, res: Response) => {
  const parsed = validateCouponSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const auth = (req as any).auth
  const { code, subtotal } = parsed.data

  if (!auth?.sub) {
    return res.json({ valid: false, message: 'Coupons are available for registered customers. Please login to apply a coupon.' })
  }

  const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } })
  if (!coupon) {
    return res.json({ valid: false, message: 'Invalid coupon code.' })
  }

  const plainCoupon = coupon.get({ plain: true }) as any

  // Validation checks
  if (!plainCoupon.active) return res.json({ valid: false, message: 'This coupon is no longer active.' })

  const now = new Date()
  if (plainCoupon.startsAt && new Date(plainCoupon.startsAt) > now) {
    return res.json({ valid: false, message: 'This coupon is not yet valid.' })
  }
  if (plainCoupon.expiresAt && new Date(plainCoupon.expiresAt) < now) {
    return res.json({ valid: false, message: 'This coupon has expired.' })
  }

  if (await isCouponUsageLimitReached(plainCoupon)) {
    return res.json({ valid: false, message: 'This coupon has reached its usage limit.' })
  }

  const restrictedCount = await CouponCustomer.count({ where: { couponId: plainCoupon.id } })
  if (restrictedCount > 0) {
    const isEligible = await CouponCustomer.findOne({ where: { couponId: plainCoupon.id, customerId: auth.sub } })
    if (!isEligible) {
      return res.json({ valid: false, message: 'This coupon isn\'t available for your account.' })
    }
  }

  if (Number(plainCoupon.minCartValue) > 0 && subtotal < Number(plainCoupon.minCartValue)) {
    return res.json({ valid: false, message: `Minimum cart value of ₹${Number(plainCoupon.minCartValue).toFixed(2)} required.` })
  }

  const customerId = auth?.sub ?? null
  const customerEmail = auth?.email ?? null
  if (plainCoupon.perUserLimit > 0 && (customerId || customerEmail)) {
    const whereClause: any = { couponId: plainCoupon.id }
    if (customerId) whereClause.customerId = customerId
    else if (customerEmail) whereClause.customerEmail = customerEmail

    const usageCount = await CouponUsage.count({ where: whereClause })
    if (usageCount >= plainCoupon.perUserLimit) {
      return res.json({ valid: false, message: `You have used this coupon ${usageCount} time${usageCount > 1 ? 's' : ''}.` })
    }
  }

  // Calculate discount
  let discountAmount = 0
  if (plainCoupon.type === 'percentage') {
    discountAmount = Math.round((subtotal * Number(plainCoupon.value)) / 100 * 100) / 100
    if (plainCoupon.maxDiscount !== null && Number(plainCoupon.maxDiscount) > 0) {
      discountAmount = Math.min(discountAmount, Number(plainCoupon.maxDiscount))
    }
  } else if (plainCoupon.type === 'fixed') {
    discountAmount = Math.min(Number(plainCoupon.value), subtotal)
  }

  res.json({
    valid: true,
    coupon: {
      code: plainCoupon.code,
      type: plainCoupon.type,
      value: plainCoupon.value,
      description: plainCoupon.description,
    },
    discount: {
      amount: discountAmount,
      label: plainCoupon.type === 'percentage'
        ? `${plainCoupon.value}% off`
        : `₹${Number(plainCoupon.value).toFixed(2)} off`,
    },
  })
}

const autoDiscountSchema = z.object({
  subtotal: z.coerce.number().min(0),
})

// Checks whether the current customer qualifies for the admin-configured
// "guest → registered → first purchase" welcome discount. No coupon record
// is involved — the percentage set in the popup settings is applied
// directly. Returns { valid: false } for guests, returning customers, or
// when the feature is disabled.
export const getAutoDiscount = async (req: Request, res: Response) => {
  const parsed = autoDiscountSchema.safeParse(req.query)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }
  const { subtotal } = parsed.data

  const auth = (req as any).auth
  const customerId = auth?.sub ?? null

  const percentage = await resolveAutoWelcomeDiscountPercentage(customerId)
  if (!percentage) {
    return res.json({ valid: false })
  }

  const discountAmount = Math.round((subtotal * percentage) / 100 * 100) / 100

  res.json({
    valid: true,
    discount: {
      amount: discountAmount,
      percentage,
      label: `${percentage}% off — Welcome discount`,
    },
  })
}

const createPaidOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive().optional(),
    variantId: z.number().int().positive().optional(),
    name: z.string().min(1).max(180),
    sku: z.string().max(80).optional(),
    variantLabel: z.string().max(120).optional(),
    color: z.string().max(80).optional(),
    size: z.string().max(40).optional(),
    imageUrl: z.string().max(255).optional(),
    quantity: z.coerce.number().int().min(1),
    unitPrice: z.coerce.number().min(0),
    total: z.coerce.number().min(0),
  })).min(1),
  customerEmail: z.string().email().optional(),
  paymentMethod: z.enum(['upi', 'card', 'netbanking']),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(1),
    phone: z.string().min(1),
  }).optional(),
  shippingTotal: z.coerce.number().min(0).default(0),
  couponCode: z.string().max(50).optional(),
})

export const createPaidOrder = async (req: Request, res: Response) => {
  const parsed = createPaidOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const auth = (req as any).auth
  const { items, customerEmail, paymentMethod, shippingAddress, shippingTotal, couponCode } = parsed.data
  for (const item of items) {
    if (!item.productId && !item.variantId) {
      throw new AppError(400, `Item "${item.name}" has no product or variant ID.`)
    }
  }
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  // Validate shippingTotal on backend
  let validatedShippingTotal = shippingTotal
  if (shippingAddress?.pincode) {
    validatedShippingTotal = await getValidatedShippingTotal(
      items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress.pincode,
      false,
      subtotal
    )
  }

  // Validate coupon if the customer typed one themselves.
  let couponId: number | null = null
  let couponCodeSaved: string | null = null
  let discountAmount = 0
  let effectiveShippingTotal = validatedShippingTotal
  let welcomeDiscountApplied = false

  if (couponCode) {
    if (!auth?.sub) throw new AppError(400, 'Coupons are available for registered customers. Please login to apply a coupon.')

    const coupon = await Coupon.findOne({ where: { code: couponCode.toUpperCase() } })
    if (!coupon) throw new AppError(400, 'Invalid coupon code.')

    const plainCoupon = coupon.get({ plain: true }) as any

    // Validate all conditions
    if (!plainCoupon.active) throw new AppError(400, 'This coupon is no longer active.')
    const now = new Date()
    if (plainCoupon.startsAt && new Date(plainCoupon.startsAt) > now) throw new AppError(400, 'This coupon is not yet valid.')
    if (plainCoupon.expiresAt && new Date(plainCoupon.expiresAt) < now) throw new AppError(400, 'This coupon has expired.')
    if (await isCouponUsageLimitReached(plainCoupon)) throw new AppError(400, 'Coupon usage limit reached.')

    const restrictedCount = await CouponCustomer.count({ where: { couponId: plainCoupon.id } })
    if (restrictedCount > 0) {
      const isEligible = await CouponCustomer.findOne({ where: { couponId: plainCoupon.id, customerId: auth.sub } })
      if (!isEligible) throw new AppError(400, 'This coupon isn\'t available for your account.')
    }

    if (Number(plainCoupon.minCartValue) > 0 && subtotal < Number(plainCoupon.minCartValue)) {
      throw new AppError(400, `Minimum cart value of ₹${Number(plainCoupon.minCartValue).toFixed(2)} required.`)
    }

    const customerId = auth?.sub ?? null
    const customerEmail2 = customerEmail ?? null
    if (plainCoupon.perUserLimit > 0 && (customerId || customerEmail2)) {
      const whereClause: any = { couponId: plainCoupon.id }
      if (customerId) whereClause.customerId = customerId
      else if (customerEmail2) whereClause.customerEmail = customerEmail2
      const usageCount = await CouponUsage.count({ where: whereClause })
      if (usageCount >= plainCoupon.perUserLimit) throw new AppError(400, `You have already used this coupon.`)
    }

    // Calculate discount
    if (plainCoupon.type === 'percentage') {
      discountAmount = Math.round((subtotal * Number(plainCoupon.value)) / 100 * 100) / 100
      if (plainCoupon.maxDiscount !== null && Number(plainCoupon.maxDiscount) > 0) {
        discountAmount = Math.min(discountAmount, Number(plainCoupon.maxDiscount))
      }
    } else if (plainCoupon.type === 'fixed') {
      discountAmount = Math.min(Number(plainCoupon.value), subtotal)
    }

    couponId = plainCoupon.id
    couponCodeSaved = plainCoupon.code
  } else {
    // No manual coupon — check if this customer qualifies for the admin-configured
    // first-order welcome discount. Percentage comes straight from settings, no
    // coupon record involved, so there's nothing here that can be "misconfigured".
    const welcomePercentage = await resolveAutoWelcomeDiscountPercentage(auth?.sub ?? null)
    if (welcomePercentage) {
      discountAmount = Math.round((subtotal * welcomePercentage) / 100 * 100) / 100
      welcomeDiscountApplied = true
    }
  }

  // Fetch products for GST rate lookup
  const productIds = [...new Set(items.filter(i => i.productId).map(i => i.productId!))]
  const variantIds = [...new Set(items.filter(i => i.variantId).map(i => i.variantId!))]
  const [gstProducts, gstVariants]: [any[], any[]] = await Promise.all([
    productIds.length > 0 ? Product.findAll({ where: { id: productIds } }) : Promise.resolve([]),
    variantIds.length > 0 ? ProductVariant.findAll({ where: { id: variantIds } }) : Promise.resolve([]),
  ])
  const gstProductMap = new Map(gstProducts.map(p => [p.id, p]))
  const gstVariantProductMap = new Map(gstVariants.map(v => [v.id, v.productId]))
  const gstVariantFullMap = new Map(gstVariants.map(v => [v.id, v]))

  // Verify prices against database
  for (const item of items) {
    if (item.variantId) {
      const variant = gstVariantFullMap.get(item.variantId)
      if (!variant) throw new AppError(400, `Variant ${item.variantId} not found.`)
      const dbPrice = Number(variant.price)
      if (Math.abs(dbPrice - item.unitPrice) > 1) {
        throw new AppError(400, `Price mismatch for "${item.name}". Expected ${'\u20B9'}${dbPrice}, got ${'\u20B9'}${item.unitPrice}.`)
      }
    } else if (item.productId) {
      const product = gstProductMap.get(item.productId)
      if (!product) throw new AppError(400, `Product ${item.productId} not found.`)
      const dbPrice = Number(product.price)
      if (Math.abs(dbPrice - item.unitPrice) > 1) {
        throw new AppError(400, `Price mismatch for "${item.name}". Expected ${'\u20B9'}${dbPrice}, got ${'\u20B9'}${item.unitPrice}.`)
      }
    }
  }

  // Verify stock availability BEFORE creating Razorpay order
  for (const item of items) {
    if (item.variantId) {
      const variant = gstVariantFullMap.get(item.variantId)
      if (variant) {
        const availableStock = Number((variant as any).stockQty ?? 0)
        if (availableStock < item.quantity) {
          throw new AppError(400, `Insufficient stock for "${item.name}". Only ${availableStock} left.`)
        }
      }
    } else if (item.productId) {
      const product = gstProductMap.get(item.productId)
      if (product) {
        const availableStock = Number((product as any).stockQty ?? 0)
        if (availableStock < item.quantity) {
          throw new AppError(400, `Insufficient stock for "${item.name}". Only ${availableStock} left.`)
        }
      }
    }
  }

  // GST is charged on what the customer actually pays, so the coupon / welcome
  // discount is apportioned across the lines before the tax is backed out of
  // them. Listed prices are GST-inclusive, hence the total*rate/(100+rate)
  // form. Computing this on the pre-discount total instead makes the invoice
  // report tax on money that was never charged, and it stops reconciling with
  // grandTotal.
  const discountBase = subtotal > 0 ? Math.min(discountAmount, subtotal) : 0
  let discountAllocated = 0

  let gstTotal = 0
  let taxableAmount = 0
  items.forEach((item, index) => {
    let gstRate = 0
    if (item.variantId) {
      const pid = gstVariantProductMap.get(item.variantId)
      const p = pid ? gstProductMap.get(pid) : null
      gstRate = p ? Number(p.gstRate || 0) : 0
    } else if (item.productId) {
      const p = gstProductMap.get(item.productId)
      gstRate = p ? Number(p.gstRate || 0) : 0
    }

    // Proportional share of the discount. The final line takes whatever is
    // left rather than its own rounded share, so the parts always add back up
    // to exactly discountBase instead of drifting a paisa either way.
    let lineDiscount = 0
    if (discountBase > 0) {
      lineDiscount = index === items.length - 1
        ? discountBase - discountAllocated
        : Math.round((item.total / subtotal) * discountBase * 100) / 100
      discountAllocated += lineDiscount
    }
    const lineTotal = Math.max(0, item.total - lineDiscount)

    if (gstRate > 0) {
      taxableAmount += Math.round(lineTotal * 100 / (100 + gstRate) * 100) / 100
      gstTotal += Math.round(lineTotal * gstRate / (100 + gstRate) * 100) / 100
    } else {
      taxableAmount += lineTotal
    }
  })

  const orderShippingConfig = await getShippingConfig()
  if (orderShippingConfig.freeShippingEnabled && orderShippingConfig.freeShippingThreshold > 0 && subtotal >= orderShippingConfig.freeShippingThreshold) {
    effectiveShippingTotal = 0
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount)
  const grandTotal = discountedSubtotal + effectiveShippingTotal
  const orderNumber = generateOrderNumber()

  // COD is currently disabled — every order goes through the payment gateway.
  let cashfreeOrder: any
  const cashfreeOrderId = `sf_${orderNumber}`
  try {
    cashfreeOrder = await createCashfreeOrder({
      amount: grandTotal,
      orderId: cashfreeOrderId,
      customerId: auth?.sub ? `cust_${auth.sub}` : `guest_${Math.random().toString(36).slice(2, 10)}`,
      customerName: null,
      customerEmail: customerEmail ?? auth?.email ?? null,
      customerPhone: shippingAddress?.phone ?? null,
      returnUrl: `${env.API_URL}/api/storefront/payment-return?order_id={order_id}`,
      notifyUrl: `${env.API_URL}/api/webhook/cashfree`,
    })
  } catch (err: any) {
    throw new AppError(502, `Payment gateway error: ${err.message}`)
  }

  // Step 1: always create the order as 'pending_payment' first, on its own —
  // this is the abandoned-checkout checkpoint for BOTH payment methods. If
  // the customer never completes (closes the Razorpay popup, loses
  // connection mid-COD-confirm, etc.), this is the row that shows up under
  // Abandoned Checkouts instead of leaving no trace at all.
  const draftResult = await sequelize.transaction(async (t) => {
    const order = await Order.create({
      orderNumber,
      customerId: auth?.sub ?? null,
      customerEmail: customerEmail ?? auth?.email ?? null,
      status: 'pending_payment',
      paymentStatus: 'pending',
      subtotal,
      shippingTotal: effectiveShippingTotal,
      grandTotal,
      gstTotal: Math.round(gstTotal * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      discount: discountAmount,
      couponId,
      couponCode: couponCodeSaved,
      shippingAddress: shippingAddress ?? null,
      metadata: {
        paymentMethod,
        cashfreeOrderId,
        ...(welcomeDiscountApplied ? { welcomeDiscountApplied: true } : {}),
      },
    }, { transaction: t })

    await OrderItem.bulkCreate(
      items.map(item => ({
        orderId: order.get('id') as number,
        productId: item.productId ?? null,
        variantId: item.variantId ?? null,
        name: item.name,
        sku: item.sku ?? null,
        variantLabel: item.variantLabel ?? null,
        color: item.color ?? null,
        size: item.size ?? null,
        imageUrl: item.imageUrl ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      { transaction: t },
    )

    return order
  })

  const orderIdNum = draftResult.get('id') as number

  // Step 2: COD stays at pending_payment — admin confirms manually from
  // Abandoned Checkouts tab. Stock is deducted on confirmation, not at creation.
  // Online orders also stay at pending_payment and get promoted from verify-payment.

  const guestToken = !auth ? computeGuestToken(orderIdNum) : undefined

  res.status(201).json({
    cashfreeOrderId: cashfreeOrder?.order_id ?? null,
    paymentSessionId: cashfreeOrder?.payment_session_id ?? null,
    amount: cashfreeOrder?.order_amount ?? 0,
    currency: cashfreeOrder?.order_currency ?? 'INR',
    orderId: orderIdNum,
    status: 'pending_payment',
    guestToken,
  })
}

const verifyPaymentSchema = z.object({
  cashfreeOrderId: z.string().min(1),
  orderId: z.number().int().positive(),
})

export const verifyPayment = async (req: Request, res: Response) => {
  const parsed = verifyPaymentSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const { cashfreeOrderId, orderId } = parsed.data

  const order = await Order.findByPk(orderId)
  if (!order) {
    throw new AppError(404, 'Order not found')
  }

  const plainOrder = plain<any>(order)
  if (plainOrder.paymentStatus === 'paid') {
    const existingOrder = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }],
    })
    const auth = (req as any).auth
    const guestToken = !auth ? computeGuestToken(orderId) : undefined
    return res.json({ order: plain<any>(existingOrder), guestToken })
  }

  const payment = await isOrderPaid(cashfreeOrderId)
  if (!payment.paid) {
    throw new AppError(400, 'Payment is not successful yet. Please try again.')
  }

  await processPaidOrder(orderId, { cashfreePaymentId: payment.paymentId!, cashfreeOrderId })

  const auth = (req as any).auth
  const updatedOrder = plain<any>(await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: 'items' }],
  }))

  const guestToken = !auth ? computeGuestToken(orderId) : undefined

  res.json({ order: updatedOrder, guestToken })
}

// ─── Shared post-payment processing ──────────────────

type PaymentDetails = {
  cashfreePaymentId: string
  cashfreeOrderId?: string
  webhookConfirmed?: boolean
}

export async function processPaidOrder(orderId: number, details: PaymentDetails): Promise<void> {
  // Both the frontend's verifyPayment call and the Razorpay webhook's payment.captured
  // handler can invoke this for the same order around the same time. A plain
  // "if already paid, return" check is a read-then-write race — two concurrent callers
  // can both pass it before either commits, double-deducting stock and double-sending
  // emails. Claim the order inside a row lock first so only one caller proceeds; the
  // other sees paid/processing and returns immediately.
  const claimedOrder = await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE })
    if (!order) throw new AppError(404, 'Order not found')
    const current = plain<any>(order)
    if (current.paymentStatus === 'paid' || current.paymentStatus === 'processing') return null
    await order.update({ paymentStatus: 'processing' }, { transaction: t })
    return current
  })
  if (!claimedOrder) return

  const order = (await Order.findByPk(orderId))!
  const plainOrder = claimedOrder
  const couponId = plainOrder.couponId
  const discountAmount = Number(plainOrder.discount || 0)

  // Runs before stock is touched: if this order has to be refunded there is
  // then nothing to restore.
  if (couponId) {
    await enforceCouponPerUserLimitOrRefund(couponId, Number(orderId), plainOrder, order, details.cashfreeOrderId)
  }

  // Deduct stock inside locked transaction — auto-refund on failure
  const orderItems = await OrderItem.findAll({ where: { orderId } })
  try {
    await sequelize.transaction(async (t) => {
      for (const item of orderItems) {
        const itemPlain = plain<any>(item)
        if (itemPlain.variantId) {
          const v = await ProductVariant.findOne({
            where: { id: itemPlain.variantId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          })
          if (v) {
            const currentStock = (v as any).stockQty ?? 0
            if (currentStock < itemPlain.quantity) {
              throw new AppError(400, `Insufficient stock for "${itemPlain.name}". Only ${currentStock} left.`)
            }
            await v.update({ stockQty: currentStock - itemPlain.quantity }, { transaction: t })
          }
        } else if (itemPlain.productId) {
          const p = await Product.findOne({
            where: { id: itemPlain.productId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          })
          if (p) {
            const currentStock = (p as any).stockQty ?? 0
            if (currentStock < itemPlain.quantity) {
              throw new AppError(400, `Insufficient stock for "${itemPlain.name}". Only ${currentStock} left.`)
            }
            await p.update({ stockQty: currentStock - itemPlain.quantity }, { transaction: t })
          }
        }
      }
    })
  } catch (stockErr: any) {
    // Stock deduction failed after payment — issue automatic refund
    const cashfreeOrderId = details.cashfreeOrderId
    try {
      await refundOrder(cashfreeOrderId!)
      console.error(`[Order ${orderId}] Stock insufficient after payment. Full refund issued for order ${cashfreeOrderId}.`)
    } catch (refundErr: any) {
      console.error(`[Order ${orderId}] CRITICAL: Refund FAILED for order ${cashfreeOrderId}:`, refundErr.message)
    }
    // Mark order as cancelled + refunded
    await order.update({
      status: 'cancelled',
      paymentStatus: 'refunded',
      metadata: {
        ...(plainOrder.metadata || {}),
        cashfreeOrderId,
        refundReason: stockErr.message || 'Insufficient stock after payment',
        refundedAt: new Date().toISOString(),
      },
    })
    throw new AppError(400, `Order cancelled: ${stockErr.message || 'Insufficient stock'}. A full refund has been initiated and will reflect in 5-7 business days.`)
  }

  await order.update({
    status: 'pending',
    paymentStatus: 'paid',
    metadata: {
      ...(plainOrder.metadata || {}),
      cashfreePaymentId: details.cashfreePaymentId,
      cashfreeOrderId: details.cashfreeOrderId,
      ...(details.webhookConfirmed ? { webhookConfirmed: true } : {}),
      paidAt: new Date().toISOString(),
    },
  })

  // Record coupon usage for paid orders. Guarded by orderId so a retried or
  // webhook-duplicated confirmation of the SAME order can't count twice.
  if (couponId) {
    const existing = await CouponUsage.findOne({ where: { orderId: Number(orderId) } })
    if (!existing) {
      await CouponUsage.create({
        couponId,
        orderId: Number(orderId),
        customerId: plainOrder.customerId ?? null,
        customerEmail: plainOrder.customerEmail ?? null,
        discountAmount,
      })
      await Coupon.increment('usedCount', { by: 1, where: { id: couponId } })
    }
  }

  // Async: create invoice + confirmation emails (fire and forget)
  // Re-fetch with items to ensure email shows full item breakdown
  const updatedOrder = plain<any>(await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: 'items' }],
  }))
  const adminEmail = env.ADMIN_EMAIL
  const orderNumber = updatedOrder.orderNumber
  Promise.all([
    createInvoiceForOrder(orderId, { sendEmail: false }),
    getCompanyInfo(),
  ]).then(([, company]) => {
    const customerEmailTo = (updatedOrder.customerEmail || '') as string
    if (customerEmailTo) {
      emailService.sendOrderConfirmationEmail(customerEmailTo, updatedOrder, company).catch((err: any) => {
        console.error(`[Order ${orderNumber}] Customer email failed:`, err.message)
      })
    }
    return emailService.sendAdminOrderNotification(adminEmail, updatedOrder, company)
  }).catch((err: any) => {
    console.error(`[Order ${orderNumber}] Post-order notification failed:`, err.message)
  })
}

const confirmCodSchema = z.object({
  guestToken: z.string().optional(),
})

export const confirmCodOrder = async (req: Request, res: Response) => {
  const { id } = req.params
  const orderId = Number(id)
  if (!orderId) throw new AppError(400, 'Invalid order ID.')

  const auth = (req as any).customerAuth as { sub?: number; email?: string } | undefined

  const order = await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: 'items' }],
  })
  if (!order) throw new AppError(404, 'Order not found.')

  const plainOrder = plain<any>(order)

  // Verify ownership: either authenticated customer or valid guest token
  if (auth?.sub) {
    if (plainOrder.customerId && plainOrder.customerId !== auth.sub) {
      throw new AppError(403, 'Access denied.')
    }
  } else {
    const body = confirmCodSchema.parse(req.body)
    if (!body.guestToken) throw new AppError(401, 'Authentication required.')
    const expectedToken = computeGuestToken(orderId)
    if (body.guestToken !== expectedToken) throw new AppError(403, 'Invalid guest token.')
  }

  // Must be a pending_payment COD order
  if (plainOrder.status !== 'pending_payment') {
    throw new AppError(400, 'This order cannot be confirmed.')
  }
  const paymentMethod = plainOrder.metadata?.paymentMethod
  if (paymentMethod !== 'cod') {
    throw new AppError(400, 'This is not a COD order.')
  }

  const couponId = plainOrder.couponId
  const discountAmount = Number(plainOrder.discount || 0)

  // Deduct stock + apply coupon in a transaction
  const orderItems = await OrderItem.findAll({ where: { orderId } })
  await sequelize.transaction(async (t) => {
    for (const item of orderItems) {
      const itemPlain = plain<any>(item)
      if (itemPlain.variantId) {
        const v = await ProductVariant.findOne({
          where: { id: itemPlain.variantId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        })
        if (v) {
          const currentStock = (v as any).stockQty ?? 0
          if (currentStock < itemPlain.quantity) {
            throw new AppError(400, `Insufficient stock for "${itemPlain.name}". Only ${currentStock} left.`)
          }
          await v.update({ stockQty: currentStock - itemPlain.quantity }, { transaction: t })
        }
      } else if (itemPlain.productId) {
        const p = await Product.findOne({
          where: { id: itemPlain.productId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        })
        if (p) {
          const currentStock = (p as any).stockQty ?? 0
          if (currentStock < itemPlain.quantity) {
            throw new AppError(400, `Insufficient stock for "${itemPlain.name}". Only ${currentStock} left.`)
          }
          await p.update({ stockQty: currentStock - itemPlain.quantity }, { transaction: t })
        }
      }
    }

    if (couponId) {
      const existing = await CouponUsage.findOne({ where: { orderId } })
      if (!existing) {
        await CouponUsage.create({
          couponId,
          orderId,
          customerId: plainOrder.customerId ?? null,
          customerEmail: plainOrder.customerEmail ?? null,
          discountAmount,
        }, { transaction: t })
        await Coupon.increment('usedCount', { by: 1, where: { id: couponId }, transaction: t })
      }
    }

    await order.update({
      status: 'pending',
      metadata: {
        ...(plainOrder.metadata || {}),
        codConfirmedAt: new Date().toISOString(),
      },
    }, { transaction: t })
  })

  // Async: create invoice + confirmation emails
  const updatedOrder = plain<any>(await Order.findByPk(orderId, {
    include: [{ model: OrderItem, as: 'items' }],
  }))
  const adminEmail = env.ADMIN_EMAIL
  const orderNumber = updatedOrder.orderNumber
  Promise.all([
    createInvoiceForOrder(orderId, { sendEmail: false }),
    getCompanyInfo(),
  ]).then(([, company]) => {
    const customerEmailTo = (updatedOrder.customerEmail || '') as string
    if (customerEmailTo) {
      emailService.sendOrderConfirmationEmail(customerEmailTo, updatedOrder, company).catch((err: any) => {
        console.error(`[Order ${orderNumber}] Customer email failed:`, err.message)
      })
    }
    return emailService.sendAdminOrderNotification(adminEmail, updatedOrder, company)
  }).catch((err: any) => {
    console.error(`[Order ${orderNumber}] Post-order notification failed:`, err.message)
  })

  res.json({ ok: true, status: 'pending', message: 'COD order confirmed.' })
}
