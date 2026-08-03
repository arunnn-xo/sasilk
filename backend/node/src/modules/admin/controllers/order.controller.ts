import { Request, Response } from 'express'
import { z } from 'zod'
import { Op } from 'sequelize'
import { sequelize } from '../../../database/sequelize.js'
import {
  Order,
  OrderItem,
  Customer,
  Product,
  ProductVariant,
  OrderStatusHistory,
  Coupon,
  CouponUsage,
} from '../../../models/index.js'
import { createShipment, assignAwb, generatePickup, cancelShiprocketOrder } from '../../../services/shiprocket.service.js'
import { sendBackInStockEmail, sendAbandonedCartEmail, sendShippingEmail, sendDeliveryEmail, sendCancellationEmail, sendOrderConfirmationEmail, sendPackingEmail, sendOutForDeliveryEmail, sendRtoEmail, sendReturnedEmail, sendAdminOrderNotification } from '../../../services/email.service.js'
import { generateOrderPdf } from '../../../services/order-pdf.service.js'
import { generateAddressesPdf } from '../../../services/order-addresses-pdf.service.js'
import { syncInvoiceStatus } from '../../../services/invoice.service.js'
import { writeAuditLog } from '../../../services/audit.service.js'
import { AppError } from '../../../utils/http.js'
import { adminId, paginationSchema, idParam } from './utils.js'
import { env } from '../../../config/env.js'

export const statusMap: Record<string, { status: string }> = {
  'pending-payment': { status: 'pending_payment' },
  'pending': { status: 'pending' },
  'confirmed': { status: 'confirmed' },
  'packing': { status: 'packing' },
  'dispatched': { status: 'dispatched' },
  'out-for-delivery': { status: 'out_for_delivery' },
  'delivered': { status: 'delivered' },
  'cancelled': { status: 'cancelled' },
  'rto': { status: 'rto' },
  'returned': { status: 'returned' },
}

export const validTransitions: Record<string, string[]> = {
  pending_payment: ['pending', 'confirmed', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packing', 'cancelled'],
  packing: ['dispatched', 'out_for_delivery', 'cancelled'],
  dispatched: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled', 'rto'],
  delivered: [],
  rto: ['returned', 'cancelled'],
  returned: [],
}

// Hands a coupon back when an order stops being a sale. Without this the
// customer's per-user allowance and the coupon's global usage limit stay burnt
// on an order that was cancelled or sent back, so they can never spend it
// again. Idempotent: the usage row is the record of the claim, so once it is
// gone a repeat call does nothing — cancelling an already-returned order can't
// decrement twice.
async function releaseCouponForOrder(orderId: number): Promise<void> {
  const usage = await CouponUsage.findOne({ where: { orderId } })
  if (!usage) return

  const { couponId } = usage.get({ plain: true }) as any
  await usage.destroy()
  // used_count is UNSIGNED — an unguarded decrement at zero would underflow to
  // a huge number and permanently disable the coupon.
  await Coupon.decrement('usedCount', {
    by: 1,
    where: { id: couponId, usedCount: { [Op.gt]: 0 } },
  })
}

export const transitionSchema = z.object({
  nextStatus: z.enum(['pending', 'confirmed', 'packing', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled', 'rto', 'returned']),
  deliveryAgentName: z.string().max(120).optional(),
  deliveryAgentPhone: z.string().max(20).optional(),
  trackingNumber: z.string().max(80).optional(),
  cancellationReason: z.string().max(500).optional(),
})

export const getPipelineCounts = async (_req: Request, res: Response) => {
  const rows = await Order.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status'],
    paranoid: false,
    raw: true,
  }) as unknown as Array<{ status: string; count: string }>

  const countsByStatus = new Map(rows.map(r => [r.status, Number(r.count)]))

  const counts: Record<string, number> = {}
  for (const [key, cfg] of Object.entries(statusMap)) {
    counts[key] = countsByStatus.get(cfg.status) ?? 0
  }
  res.json({ counts })
}

export const getPipelineStage = async (req: Request, res: Response) => {
  const { stage } = req.params
  const cfg = statusMap[stage]
  if (!cfg) throw new AppError(404, 'Invalid pipeline stage.')

  const { page, perPage } = paginationSchema.parse(req.query)
  const where = { status: cfg.status }

  const [rows, total] = await Promise.all([
    Order.findAll({
      where,
      order: [['id', 'DESC']],
      offset: (page - 1) * perPage,
      limit: perPage,
      paranoid: false,
    }),
    Order.count({ where, paranoid: false }),
  ])

  res.json({
    items: rows.map((row: any) => row.get({ plain: true })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  })
}

export const getOrderDetail = async (req: Request, res: Response) => {
  const { id } = idParam.parse(req.params)
  const order = await Order.findByPk(id, {
    paranoid: false,
    include: [
      { model: OrderItem, as: 'items' },
      { model: Customer },
    ],
  })
  if (!order) throw new AppError(404, 'Order not found.')
  res.json({ item: order.get({ plain: true }) })
}

export const transitionOrder = async (req: Request, res: Response) => {
  const { id } = idParam.parse(req.params)
  const body = transitionSchema.parse(req.body)

  const order = await Order.findByPk(id)
  if (!order) throw new AppError(404, 'Order not found.')

  const currentStatus = order.getDataValue('status') as string
  const allowed = validTransitions[currentStatus]
  if (!allowed || !allowed.includes(body.nextStatus)) {
    throw new AppError(422, `Cannot transition from '${currentStatus}' to '${body.nextStatus}'. Allowed: ${(allowed || []).join(', ') || 'none'}`)
  }

  const updates: Record<string, unknown> = { status: body.nextStatus }
  let shiprocketSyncError: string | undefined

  if (body.nextStatus === 'packing' || body.nextStatus === 'dispatched') {
    const isPackingFlow = body.nextStatus === 'packing'
    if (!isPackingFlow) {
      updates.dispatchedAt = new Date()
    }
    if (body.trackingNumber) updates.trackingNumber = body.trackingNumber

    try {
      const fullOrder = await Order.findByPk(id, {
        include: [
          { model: OrderItem, as: 'items' },
          { model: Customer },
        ],
      })
      if (fullOrder) {
        const o = fullOrder.get({ plain: true }) as any
        const shipAddr = o.shippingAddress || {}
        const paymentMethod = o.metadata?.paymentMethod || 'cod'
        const custName = o.Customer?.name || [shipAddr.firstName, shipAddr.lastName].filter(Boolean).join(' ') || 'Customer'

        // Fetch product dimensions for Shiprocket
        const orderProductIds = (o.items || [])
          .map((item: any) => item.productId)
          .filter(Boolean)
        const products = orderProductIds.length > 0
          ? await Product.findAll({ where: { id: orderProductIds }, attributes: ['id', 'weightKg', 'lengthCm', 'breadthCm', 'heightCm'] })
          : []
        const dims = products.reduce((acc: Record<string, any>, p: any) => {
          acc[p.id] = { weightKg: p.weightKg, lengthCm: p.lengthCm, breadthCm: p.breadthCm, heightCm: p.heightCm }
          return acc
        }, {})
        const maxWeight = Math.max(...(o.items || []).map((item: any) => {
          const p = dims[item.productId]
          return p?.weightKg ? Number(p.weightKg) * item.quantity : 0
        }).filter(Boolean), 0.5)
        const maxLength = Math.max(...(o.items || []).map((item: any) => {
          const p = dims[item.productId]
          return p?.lengthCm ? Number(p.lengthCm) : 0
        }).filter(Boolean), 10)
        const maxBreadth = Math.max(...(o.items || []).map((item: any) => {
          const p = dims[item.productId]
          return p?.breadthCm ? Number(p.breadthCm) : 0
        }).filter(Boolean), 10)
        const maxHeight = Math.max(...(o.items || []).map((item: any) => {
          const p = dims[item.productId]
          return p?.heightCm ? Number(p.heightCm) : 0
        }).filter(Boolean), 5)

        const existingMeta = o.metadata || {}

        if (isPackingFlow) {
          // Packing: Create Shiprocket order only, keep status as packing
          const srRes = await createShipment({
            orderId: o.id,
            orderNumber: o.orderNumber,
            orderDate: new Date(o.createdAt).toISOString().split('T')[0],
            billingCustomerName: custName,
            billingAddress: shipAddr.address || o.customerEmail || '',
            billingCity: shipAddr.city || '',
            billingState: shipAddr.state || '',
            billingPincode: shipAddr.pincode || '',
            billingPhone: shipAddr.phone || '',
            paymentMethod,
            orderItems: (o.items || []).map((item: any) => ({
              name: item.name,
              sku: item.sku || '',
              quantity: item.quantity,
              price: Number(item.unitPrice),
            })),
            subTotal: Number(o.subtotal || 0),
            grandTotal: Number(o.grandTotal || 0),
            weight: maxWeight,
            lengthCm: maxLength,
            breadthCm: maxBreadth,
            heightCm: maxHeight,
          })

          const newMeta: Record<string, unknown> = {
            ...existingMeta,
            shiprocketOrderId: srRes.order_id,
            shiprocketShipmentId: srRes.shipment_id,
            shiprocketStatus: srRes.status,
          }

          // If AWB already assigned on creation
          if (srRes.awb_code) {
            newMeta.shiprocketAwbCode = srRes.awb_code
            newMeta.shiprocketLabelUrl = srRes.label_url
          }

          updates.metadata = newMeta
          if ((newMeta.shiprocketAwbCode as string) && !updates.trackingNumber) {
            updates.trackingNumber = newMeta.shiprocketAwbCode as string
          }
          // Stay in packing — do NOT override status
        } else {
          // Dispatched: Assign AWB + pickup for existing Shiprocket order
          const srOrderId = existingMeta.shiprocketOrderId as number | undefined
          const srShipmentId = existingMeta.shiprocketShipmentId as number | undefined

          let shipmentId = srShipmentId

          // If no Shiprocket order exists yet, create one
          if (!srOrderId) {
            const srRes = await createShipment({
              orderId: o.id,
              orderNumber: o.orderNumber,
              orderDate: new Date(o.createdAt).toISOString().split('T')[0],
              billingCustomerName: custName,
              billingAddress: shipAddr.address || o.customerEmail || '',
              billingCity: shipAddr.city || '',
              billingState: shipAddr.state || '',
              billingPincode: shipAddr.pincode || '',
              billingPhone: shipAddr.phone || '',
              paymentMethod,
              orderItems: (o.items || []).map((item: any) => ({
                name: item.name,
                sku: item.sku || '',
                quantity: item.quantity,
                price: Number(item.unitPrice),
              })),
              subTotal: Number(o.subtotal || 0),
              grandTotal: Number(o.grandTotal || 0),
              weight: maxWeight,
              lengthCm: maxLength,
              breadthCm: maxBreadth,
              heightCm: maxHeight,
            })
            existingMeta.shiprocketOrderId = srRes.order_id
            existingMeta.shiprocketShipmentId = srRes.shipment_id
            existingMeta.shiprocketStatus = srRes.status
            shipmentId = srRes.shipment_id
            if (srRes.awb_code) {
              existingMeta.shiprocketAwbCode = srRes.awb_code
              existingMeta.shiprocketLabelUrl = srRes.label_url
            }
          }

          let courierName: string | null = null

          // Assign AWB (if not already assigned)
          if (shipmentId && !existingMeta.shiprocketAwbCode) {
            try {
              const awbRes = await assignAwb(shipmentId)
              existingMeta.shiprocketAwbCode = awbRes.awb_code
              existingMeta.shiprocketLabelUrl = awbRes.label_url
              existingMeta.shiprocketCourierName = awbRes.courier_name
              courierName = awbRes.courier_name
            } catch (awbErr: any) {
              existingMeta.shiprocketAwbError = awbErr.message
            }
          } else if (existingMeta.shiprocketAwbCode) {
            courierName = (existingMeta.shiprocketCourierName as string) || null
          }

          // Generate pickup
          if (shipmentId) {
            try {
              const pickupRes = await generatePickup(shipmentId)
              existingMeta.shiprocketPickupToken = pickupRes.pickup_token
              existingMeta.shiprocketPickupDate = pickupRes.pickup_date
              existingMeta.shiprocketPickupTime = pickupRes.pickup_time
              existingMeta.shiprocketPickupStatus = pickupRes.status
            } catch (pickErr: any) {
              existingMeta.shiprocketPickupError = pickErr.message
            }
          }

          updates.metadata = existingMeta
          if ((existingMeta.shiprocketAwbCode as string) && !updates.trackingNumber) {
            updates.trackingNumber = existingMeta.shiprocketAwbCode as string
          }
          updates.deliveryAgentName = courierName || (existingMeta.shiprocketCourierName as string) || 'Shiprocket'
          updates.deliveryAgentPhone = 'Track via Shiprocket'
          // Status stays as dispatched — admin manually moves to out_for_delivery
        }
      }
    } catch (srErr: any) {
      shiprocketSyncError = srErr.message || 'Shiprocket sync failed'
      const existingMeta = (order.get({ plain: true }) as any).metadata || {}
      updates.metadata = {
        ...existingMeta,
        shiprocketError: shiprocketSyncError,
      }
      // Shiprocket sync failed — don't advance the visible status, so the
      // admin can see the error and retry instead of the order silently
      // showing "Dispatched"/"Packing" with no real shipment behind it.
      updates.status = isPackingFlow ? 'packing' : currentStatus
    }
  }
  if (body.nextStatus === 'out_for_delivery') {
    updates.deliveryAgentName = body.deliveryAgentName
    updates.deliveryAgentPhone = body.deliveryAgentPhone
    if (body.trackingNumber) updates.trackingNumber = body.trackingNumber
  }
  if (body.nextStatus === 'delivered') {
    updates.deliveredAt = new Date()
  }

  // COD confirmation: deduct stock + apply coupon when moving out of pending_payment,
  // whether the admin sends it straight to 'pending' or directly to 'confirmed' — both
  // are valid per validTransitions, but only 'pending' used to be handled here, so a
  // pending_payment → confirmed transition silently skipped stock deduction/coupon
  // application while still emailing the customer an "Order Confirmed" notice.
  if (currentStatus === 'pending_payment' && (body.nextStatus === 'pending' || body.nextStatus === 'confirmed')) {
    const o = (order.get({ plain: true }) as any)
    const paymentMethod = o.metadata?.paymentMethod as string | undefined

    if (paymentMethod === 'cod') {
      const orderItems = await OrderItem.findAll({ where: { orderId: id } })
      for (const item of orderItems) {
        const itemPlain = item.get({ plain: true }) as any
        if (itemPlain.variantId) {
          const v = await ProductVariant.findOne({ where: { id: itemPlain.variantId } })
          if (v) {
            const currentStock = (v as any).stockQty ?? 0
            if (currentStock < itemPlain.quantity) {
              throw new AppError(400, `Insufficient stock for "${itemPlain.name}". Only ${currentStock} left.`)
            }
            await v.update({ stockQty: currentStock - itemPlain.quantity })
          }
        } else if (itemPlain.productId) {
          const p = await Product.findOne({ where: { id: itemPlain.productId } })
          if (p) {
            const currentStock = (p as any).stockQty ?? 0
            if (currentStock < itemPlain.quantity) {
              throw new AppError(400, `Insufficient stock for "${itemPlain.name}". Only ${currentStock} left.`)
            }
            await p.update({ stockQty: currentStock - itemPlain.quantity })
          }
        }
      }

      // Apply coupon usage if present. The existing-row guard matches the two
      // storefront confirmation paths: without it, this admin transition racing
      // the customer's own self-confirm would write a second usage row for the
      // same order and count the coupon twice.
      if (o.couponId) {
        const existing = await CouponUsage.findOne({ where: { orderId: id } })
        if (!existing) {
          await CouponUsage.create({
            couponId: o.couponId,
            orderId: id,
            customerId: o.customerId || null,
            customerEmail: o.customerEmail || null,
            discountAmount: o.discount || 0,
          })
          await Coupon.increment('usedCount', { by: 1, where: { id: o.couponId } })
        }
      }

      // Mark COD as confirmed in metadata
      const existingMeta = o.metadata || {}
      updates.metadata = {
        ...existingMeta,
        codConfirmedAt: new Date().toISOString(),
      }

      // The storefront's self-service confirmCodOrder notifies admin on COD confirmation —
      // this admin-initiated transition was a separate code path that skipped it entirely.
      sendAdminOrderNotification(env.ADMIN_EMAIL, o).catch((err: any) => {
        console.error(`[Order ${o.orderNumber}] Admin notification failed:`, err.message)
      })
    }
  }

  if (body.nextStatus === 'cancelled') {
    const o = (order.get({ plain: true }) as any)
    updates.cancelledAt = new Date()
    if (body.cancellationReason) updates.cancellationReason = body.cancellationReason

    // Restore stock only if it was previously deducted
    // Stock is deducted when admin confirms (pending_payment → pending) for COD,
    // or when payment is verified for online orders.
    // Only restore if we're past the pending_payment stage (stock was deducted).
    const shouldRestore = currentStatus !== 'pending_payment'
    if (shouldRestore) {
      const orderItems = await OrderItem.findAll({ where: { orderId: id } })
      for (const item of orderItems) {
        const itemPlain = item.get({ plain: true }) as any
        if (itemPlain.variantId) {
          await ProductVariant.increment('stockQty', {
            by: itemPlain.quantity,
            where: { id: itemPlain.variantId },
          })
        } else if (itemPlain.productId) {
          await Product.increment('stockQty', {
            by: itemPlain.quantity,
            where: { id: itemPlain.productId },
          })
        }
      }
    }

    // A cancelled order is not a sale, so give the coupon back alongside the stock.
    await releaseCouponForOrder(Number(id))

    // Cancel Shiprocket order
    if (currentStatus !== 'confirmed') {
      const srOrderId = o.metadata?.shiprocketOrderId
      if (srOrderId) {
        try {
          const cancelRes = await cancelShiprocketOrder(String(srOrderId))
          const existingMeta = o.metadata || {}
          updates.metadata = {
            ...existingMeta,
            shiprocketCancelStatus: cancelRes.status,
            shiprocketCancelMessage: cancelRes.message,
          }
        } catch (cancelErr: any) {
          const existingMeta = o.metadata || {}
          updates.metadata = {
            ...existingMeta,
            shiprocketCancelError: cancelErr.message,
          }
        }
      }
    }
  }

  // 'returned' means the courier has physically handed the parcel back to us — restore
  // stock at this point. (An RTO that's cancelled instead of marked returned is already
  // covered by the 'cancelled' branch above, since currentStatus !== 'pending_payment'.)
  if (body.nextStatus === 'returned') {
    const orderItems = await OrderItem.findAll({ where: { orderId: id } })
    for (const item of orderItems) {
      const itemPlain = item.get({ plain: true }) as any
      if (itemPlain.variantId) {
        await ProductVariant.increment('stockQty', {
          by: itemPlain.quantity,
          where: { id: itemPlain.variantId },
        })
      } else if (itemPlain.productId) {
        await Product.increment('stockQty', {
          by: itemPlain.quantity,
          where: { id: itemPlain.productId },
        })
      }
    }

    // Goods came back, so the sale didn't stand — release the coupon too. RTO
    // deliberately isn't handled here: it always moves on to 'returned' or
    // 'cancelled', both of which release, so doing it at RTO would be premature.
    await releaseCouponForOrder(Number(id))
  }

  await order.update(updates)

  await OrderStatusHistory.create({
    orderId: id,
    fromStatus: currentStatus,
    toStatus: updates.status as string || body.nextStatus,
    changedBy: adminId(req),
    changedByType: 'admin',
    notes: body.cancellationReason || (shiprocketSyncError ? `Attempted move to '${body.nextStatus}' — Shiprocket sync failed: ${shiprocketSyncError}` : undefined),
  })

  syncInvoiceStatus(Number(id)).catch(() => {})

  const finalStatus = updates.status as string || body.nextStatus
  await writeAuditLog({
    adminId: adminId(req),
    action: 'TRANSITION',
    entity: 'order',
    entityId: id,
    details: { from: currentStatus, to: finalStatus, ...updates },
  })

  // Send customer email notifications for key status transitions
  const freshOrder = await Order.findByPk(id, {
    include: [{ model: OrderItem, as: 'items' }, { model: Customer }],
  })
  const plainOrder = freshOrder?.get({ plain: true }) as Record<string, unknown> | undefined
  if (plainOrder) {
    const custEmail = (
      ((plainOrder.Customer as Record<string, unknown> | undefined)?.email as string)
      || (plainOrder.customerEmail as string)
      || ''
    ).trim()

    console.log(`[Order ${plainOrder.orderNumber}] Status transition: ${currentStatus} → ${finalStatus} | Customer email: "${custEmail || 'NOT FOUND'}"`)

    if (custEmail) {
      if (finalStatus === 'confirmed' && currentStatus === 'pending_payment') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending order confirmation email...`)
        sendOrderConfirmationEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Confirmation email failed:`, err.message)
        })
      } else if (finalStatus === 'pending' && currentStatus === 'pending_payment') {
        // COD confirmation: send order confirmation email
        console.log(`[Order ${plainOrder.orderNumber}] Sending COD confirmation email...`)
        sendOrderConfirmationEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] COD confirmation email failed:`, err.message)
        })
      } else if (finalStatus === 'packing') {
        // "Your order is being packed" notification
        console.log(`[Order ${plainOrder.orderNumber}] Sending packing notification email...`)
        sendPackingEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Packing email failed:`, err.message)
        })
      } else if (finalStatus === 'dispatched') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending shipping email...`)
        sendShippingEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Shipping email failed:`, err.message)
        })
      } else if (finalStatus === 'delivered') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending delivery email...`)
        sendDeliveryEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Delivery email failed:`, err.message)
        })
      } else if (finalStatus === 'cancelled') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending cancellation email...`)
        sendCancellationEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Cancellation email failed:`, err.message)
        })
      } else if (finalStatus === 'out_for_delivery') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending out-for-delivery email...`)
        sendOutForDeliveryEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Out-for-delivery email failed:`, err.message)
        })
      } else if (finalStatus === 'rto') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending RTO email...`)
        sendRtoEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] RTO email failed:`, err.message)
        })
      } else if (finalStatus === 'returned') {
        console.log(`[Order ${plainOrder.orderNumber}] Sending returned email...`)
        sendReturnedEmail(custEmail, plainOrder).catch((err: any) => {
          console.error(`[Order ${plainOrder.orderNumber}] Returned email failed:`, err.message)
        })
      } else {
        console.log(`[Order ${plainOrder.orderNumber}] No email trigger for status: ${finalStatus}`)
      }
    } else {
      console.warn(`[Order ${plainOrder.orderNumber}] No customer email found — skipping notification`)
    }
  } else {
    console.error(`[Order ${id}] Could not re-fetch order after transition — email not sent`)
  }

  res.json({ item: order.get({ plain: true }) })
}


export const sendRecoveryEmail = async (req: Request, res: Response) => {
  const { id } = idParam.parse(req.params)

  const order = await Order.findByPk(id, {
    paranoid: false,
    include: [
      { model: OrderItem, as: 'items' },
      { model: Customer },
    ],
  })
  if (!order) throw new AppError(404, 'Order not found.')

  const currentStatus = order.getDataValue('status') as string
  if (currentStatus !== 'pending_payment') {
    throw new AppError(400, 'Recovery emails can only be sent for abandoned checkout orders (pending_payment).')
  }

  const existingMeta = (order.get({ plain: true }) as any).metadata || {}
  const recoveryCount = Number(existingMeta.recoveryEmailCount || 0)
  if (recoveryCount >= 3) {
    throw new AppError(400, 'Maximum recovery email limit (3) reached for this order.')
  }

  const customerEmail = ((order.get('Customer') as Record<string, unknown> | undefined)?.email as string)
    || (order.getDataValue('customerEmail') as string)
    || ''
  if (!customerEmail) throw new AppError(400, 'No customer email found for this order.')

  const plainOrder = order.get({ plain: true }) as Record<string, unknown>

  await sendAbandonedCartEmail(customerEmail, plainOrder)

  await order.update({
    metadata: {
      ...existingMeta,
      recoveryEmailCount: recoveryCount + 1,
      recoveryEmailLastSent: new Date().toISOString(),
    },
  })

  await writeAuditLog({
    adminId: adminId(req),
    action: 'SEND_RECOVERY_EMAIL',
    entity: 'order',
    entityId: id,
    details: { email: customerEmail, recoveryCount: recoveryCount + 1 },
  })

  res.json({ ok: true, message: `Recovery email sent to ${customerEmail}`, recoveryCount: recoveryCount + 1 })
}

export const getOrderPdf = async (req: Request, res: Response) => {
  const { id } = idParam.parse(req.params)
  const order = await Order.findByPk(id, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: Customer },
    ],
  })
  if (!order) throw new AppError(404, 'Order not found.')

  const plain = order.get({ plain: true }) as Record<string, unknown>

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="order-${plain.orderNumber || id}.pdf"`)

  const doc = generateOrderPdf(plain)
  doc.pipe(res)
}

export const getConfirmedAddressesPdf = async (req: Request, res: Response) => {
  const orders = await Order.findAll({
    where: { status: 'confirmed' },
    order: [['id', 'DESC']],
    paranoid: false,
  })

  const plains = orders.map((o: any) => o.get({ plain: true }) as Record<string, unknown>)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="confirmed-addresses-${new Date().toISOString().split('T')[0]}.pdf"`)

  const doc = generateAddressesPdf(plains)
  doc.pipe(res)
}
