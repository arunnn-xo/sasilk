import { Router } from 'express'
import { z } from 'zod'
import { Order, OrderItem, Customer, Product, ProductVariant, EventBooking } from '../../models/index.js'
import { mapIthinkStatus } from '../../services/ithink.service.js'
import { sendShippingEmail, sendDeliveryEmail, sendOutForDeliveryEmail, sendRtoEmail, sendReturnedEmail, sendCancellationEmail } from '../../services/email.service.js'
import { verifyWebhookSignature } from '../../services/cashfree.service.js'
import { processPaidOrder } from '../storefront/controllers/order.controller.js'
import { confirmPaidBooking } from '../events/events.controller.js'

const router = Router()

const ithinkWebhookSchema = z.object({
  awb_number: z.string().optional(),
  order_id: z.string().optional(),
  shipment_id: z.union([z.number(), z.string()]).optional(),
  current_status: z.string().optional(),
  status: z.string().optional(),
  courier_name: z.string().optional(),
  delivery_date: z.string().optional(),
  rto_date: z.string().optional(),
  rto_reason: z.string().optional(),
})

router.post('/ithink', async (req, res) => {
  try {
    const rawBody = req.body?.data
      ? (typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data)
      : req.body

    const parsed = ithinkWebhookSchema.parse(rawBody)
    const statusStr = parsed.current_status || parsed.status || ''
    const internalStatus = mapIthinkStatus(statusStr)

    if (!internalStatus) {
      return res.status(200).json({ ok: true, skipped: `Unknown iThink status: ${statusStr}` })
    }

    // Match order by AWB code or order_id
    let order = null
    if (parsed.awb_number) {
      order = await Order.findOne({ where: { trackingNumber: parsed.awb_number } })
    }
    if (!order && parsed.order_id) {
      order = await Order.findOne({ where: { orderNumber: parsed.order_id } })
    }

    if (!order) {
      return res.status(200).json({ ok: false, reason: `Order not found for AWB: ${parsed.awb_number} / orderId: ${parsed.order_id}` })
    }

    const currentStatus = order.getDataValue('status') as string

    const existingMeta = (order.get({ plain: true }) as any).metadata || {}
    const updates: Record<string, unknown> = {
      status: internalStatus,
      metadata: {
        ...existingMeta,
        ithinkShipmentId: parsed.shipment_id,
        ithinkStatus: statusStr,
        ithinkCourierName: parsed.courier_name,
        ithinkDeliveryDate: parsed.delivery_date,
        ithinkRtoDate: parsed.rto_date,
        ithinkRtoReason: parsed.rto_reason,
      },
    }

    if (parsed.awb_number) {
      (updates.metadata as Record<string, unknown>).ithinkAwbCode = parsed.awb_number
    }

    if (internalStatus === 'delivered') {
      updates.deliveredAt = new Date()
    }

    if (!order.getDataValue('trackingNumber') && parsed.awb_number) {
      updates.trackingNumber = parsed.awb_number
    }

    // Restore stock when courier cancels or returns the parcel
    const isNewTransition = currentStatus !== internalStatus
    if (isNewTransition && currentStatus !== 'pending_payment' && (internalStatus === 'cancelled' || internalStatus === 'returned')) {
      const orderItems = await OrderItem.findAll({ where: { orderId: order.getDataValue('id') } })
      for (const item of orderItems) {
        const itemPlain = item.get({ plain: true }) as any
        if (itemPlain.variantId) {
          await ProductVariant.increment('stockQty', { by: itemPlain.quantity, where: { id: itemPlain.variantId } })
        } else if (itemPlain.productId) {
          await Product.increment('stockQty', { by: itemPlain.quantity, where: { id: itemPlain.productId } })
        }
      }
    }

    await order.update(updates)

    const details: Record<string, unknown> = {
      from: currentStatus,
      to: internalStatus,
      ithinkStatus: statusStr,
      shipmentId: parsed.shipment_id,
    }

    try {
      const { writeAuditLog } = await import('../../services/audit.service.js')
      await writeAuditLog({
        action: 'WEBHOOK',
        entity: 'order',
        entityId: order.getDataValue('id') as number,
        details,
      })
    } catch {
    }

    // Send customer email notifications for key status changes via webhook.
    // Only email when this is genuinely a NEW status the order is entering.
    if (isNewTransition) {
      const freshOrder = await Order.findByPk(order.getDataValue('id'), {
        include: [{ model: OrderItem, as: 'items' }, { model: Customer }],
      })
      if (freshOrder) {
        const plainOrder = freshOrder.get({ plain: true }) as Record<string, unknown>
        const custEmail = ((plainOrder.Customer as Record<string, unknown> | undefined)?.email as string)
          || (plainOrder.customerEmail as string)
        if (custEmail) {
          if (internalStatus === 'dispatched') {
            sendShippingEmail(custEmail, plainOrder).catch((err: any) => {
              console.error(`[iThink Webhook] Shipping email failed for ${parsed.order_id}:`, err.message)
            })
          } else if (internalStatus === 'out_for_delivery') {
            sendOutForDeliveryEmail(custEmail, plainOrder).catch((err: any) => {
              console.error(`[iThink Webhook] Out-for-delivery email failed for ${parsed.order_id}:`, err.message)
            })
          } else if (internalStatus === 'delivered') {
            sendDeliveryEmail(custEmail, plainOrder).catch((err: any) => {
              console.error(`[iThink Webhook] Delivery email failed for ${parsed.order_id}:`, err.message)
            })
          } else if (internalStatus === 'rto') {
            sendRtoEmail(custEmail, plainOrder).catch((err: any) => {
              console.error(`[iThink Webhook] RTO email failed for ${parsed.order_id}:`, err.message)
            })
          } else if (internalStatus === 'returned') {
            sendReturnedEmail(custEmail, plainOrder).catch((err: any) => {
              console.error(`[iThink Webhook] Returned email failed for ${parsed.order_id}:`, err.message)
            })
          } else if (internalStatus === 'cancelled') {
            sendCancellationEmail(custEmail, plainOrder).catch((err: any) => {
              console.error(`[iThink Webhook] Cancellation email failed for ${parsed.order_id}:`, err.message)
            })
          }
        }
      }
    }

    res.status(200).json({ ok: true, orderId: parsed.order_id, newStatus: internalStatus })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(200).json({ ok: false, reason: 'Validation failed', issues: err.issues })
    }
    console.error('[iThink Webhook] error:', err)
    res.status(200).json({ ok: false, reason: err.message })
  }
})

// ─── Cashfree Webhook ─────────────────────────────────
router.post('/cashfree', async (req: any, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string
    const timestamp = req.headers['x-webhook-timestamp'] as string
    const rawBody = req.rawBody ? Buffer.from(req.rawBody).toString('utf8') : null
    if (signature && rawBody) {
      try {
        verifyWebhookSignature(signature, rawBody, timestamp)
      } catch {
        return res.status(200).json({ ok: false, reason: 'Invalid signature' })
      }
    } else {
      console.warn('[Webhook] Cashfree signature/rawBody missing — skipping signature verification')
    }

    const type = req.body?.type
    const data = req.body?.data || {}
    const order = data.order || {}
    const payment = data.payment || {}
    const cashfreeOrderId = order.order_id

    if (!cashfreeOrderId) {
      return res.status(200).json({ ok: false, reason: 'Missing order_id' })
    }

    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      // Event bookings are matched before product orders so each flow stays independent.
      const eventBooking = await EventBooking.findOne({
        where: { gatewayOrderId: cashfreeOrderId, paymentStatus: 'pending' },
      })
      if (eventBooking) {
        const bookingId = eventBooking.get('id') as number
        if (eventBooking.get('paymentStatus') !== 'paid') {
          await confirmPaidBooking(bookingId, payment.cf_payment_id != null ? String(payment.cf_payment_id) : null)
        }
        console.log(`[Webhook] Payment confirmed for event booking ${eventBooking.get('bookingNumber')}`)
        return res.status(200).json({ ok: true, bookingId })
      }

      const orders = await Order.findAll({
        where: { status: 'pending_payment' },
      })

      let matched: any = null
      for (const o of orders) {
        const meta = o.get('metadata') as Record<string, unknown> | null
        if (meta?.cashfreeOrderId === cashfreeOrderId) {
          matched = o
          break
        }
      }

      if (!matched) {
        return res.status(200).json({ ok: false, reason: `Order with cashfreeOrderId ${cashfreeOrderId} not found in pending_payment` })
      }

      const matchedId = matched.get('id') as number
      if ((matched.get('paymentStatus') as string) !== 'paid') {
        await processPaidOrder(matchedId, {
          cashfreePaymentId: payment.cf_payment_id != null ? String(payment.cf_payment_id) : '',
          cashfreeOrderId,
          webhookConfirmed: true,
        })
      }

      console.log(`[Webhook] Payment confirmed for order ${matched.get('orderNumber')} via Cashfree webhook`)
      return res.status(200).json({ ok: true, orderId: matched.get('orderNumber') })
    }

    if (type === 'PAYMENT_FAILED_WEBHOOK') {
      await EventBooking.update(
        { paymentStatus: 'failed', gatewayPaymentId: payment.cf_payment_id != null ? String(payment.cf_payment_id) : null },
        { where: { gatewayOrderId: cashfreeOrderId, paymentStatus: 'pending' } },
      )
      const orders = await Order.findAll({ where: { status: 'pending_payment' } })
      for (const o of orders) {
        const meta = o.get('metadata') as Record<string, unknown> | null
        if (meta?.cashfreeOrderId === cashfreeOrderId) {
          const existingMeta = (o.get({ plain: true }) as any).metadata || {}
          await o.update({
            status: 'cancelled',
            metadata: {
              ...existingMeta,
              cashfreeOrderId,
              cashfreePaymentId: payment.cf_payment_id != null ? String(payment.cf_payment_id) : null,
              cashfreeFailureReason: payment.error_details?.error_description || payment.payment_message || 'Unknown',
              failedAt: new Date().toISOString(),
            },
          })
          console.log(`[Webhook] Payment failed for order ${o.get('orderNumber')}`)
          break
        }
      }
      return res.status(200).json({ ok: true })
    }

    res.status(200).json({ ok: true, skipped: `Unhandled event: ${type}` })
  } catch (err: any) {
    console.error('[Webhook] Cashfree error:', err)
    res.status(200).json({ ok: false, reason: err.message })
  }
})

export default router
