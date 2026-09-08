import { Request, Response } from 'express'
import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import QRCode from 'qrcode'
import { Event, EventBooking } from '../../models/index.js'
import { sequelize } from '../../database/sequelize.js'
import { createCashfreeOrder, isOrderPaid } from '../../services/cashfree.service.js'
import { sendEventBookingConfirmationEmail, sendAdminEventBookingAlert } from '../../services/email.service.js'
import { sendBookingConfirmationWhatsApp } from '../../services/whatsapp.service.js'
import { getCompanyInfo } from '../../services/settings.service.js'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/http.js'

const BOOKING_CUTOFF_MINUTES = 60
const MAX_QUANTITY = 10

function eventStartDate(event: any): Date {
  return new Date(`${event.eventDate}T${event.startTime}:00`)
}

function eventEndDate(event: any): Date {
  return new Date(`${event.eventDate}T${event.endTime}:00`)
}

function bookingWindowFor(event: any, now = new Date()): {
  isUpcoming: boolean
  isPast: boolean
  bookingClosed: boolean
  closesAt: string
} {
  const start = eventStartDate(event)
  const closesAtDate = new Date(start.getTime() - BOOKING_CUTOFF_MINUTES * 60 * 1000)
  return {
    isUpcoming: now < start,
    isPast: now >= start,
    bookingClosed: now >= closesAtDate,
    closesAt: closesAtDate.toISOString(),
  }
}

async function paidSeats(eventId: number, transaction?: any): Promise<number> {
  const rows = await EventBooking.findAll({
    where: { eventId, paymentStatus: 'paid' },
    attributes: ['quantity'],
    transaction,
  })
  return rows.reduce((sum, row) => sum + Number(row.get('quantity') ?? 0), 0)
}

export function toPublicEvent(plain: any, now = new Date()): Record<string, unknown> {
  const window = bookingWindowFor(plain, now)

  let rawImages: string[] = []
  if (Array.isArray(plain.images)) {
    rawImages = plain.images.filter((img: unknown) => typeof img === 'string' && img.trim().length > 0)
  } else if (typeof plain.images === 'string') {
    try {
      const parsed = JSON.parse(plain.images)
      if (Array.isArray(parsed)) {
        rawImages = parsed.filter((img: unknown) => typeof img === 'string' && img.trim().length > 0)
      }
    } catch {
      rawImages = []
    }
  }

  const images = rawImages.length > 0 ? rawImages : (plain.imageUrl ? [plain.imageUrl] : [])

  return {
    id: plain.id,
    name: plain.name,
    slug: plain.slug,
    description: plain.description,
    imageUrl: plain.imageUrl || (images[0] ?? null),
    images,
    videoUrl: plain.videoUrl || null,
    eventDate: plain.eventDate,
    startTime: plain.startTime,
    endTime: plain.endTime,
    price: Number(plain.price),
    mode: plain.mode,
    venueAddress: plain.venueAddress,
    capacity: plain.capacity,
    ...window,
  }
}

export const listEvents = async (_req: Request, res: Response) => {
  const events = await Event.findAll({
    where: { isActive: true },
    order: [['eventDate', 'ASC'], ['startTime', 'ASC']],
  })
  const now = new Date()
  const result = await Promise.all(
    events.map(async (e) => {
      const plain = e.get({ plain: true }) as any
      const pub = toPublicEvent(plain, now)
      if (plain.capacity) {
        pub.seatsLeft = Math.max(0, Number(plain.capacity) - await paidSeats(plain.id))
      }
      return pub
    }),
  )
  res.json({ events: result })
}

export const getEventBySlug = async (req: Request, res: Response) => {
  const event = await Event.findOne({ where: { slug: req.params.slug, isActive: true } })
  if (!event) throw new AppError(404, 'Event not found.')
  const plain = event.get({ plain: true }) as any
  const pub = toPublicEvent(plain) as Record<string, any>
  if (plain.capacity) {
    pub.seatsLeft = Math.max(0, Number(plain.capacity) - await paidSeats(plain.id))
  }
  res.json({ event: pub })
}

const bookSchema = z.object({
  customerName: z.string().min(2, 'Name is required.').max(140),
  customerEmail: z.string().email('A valid email is required.').max(190),
  customerMobile: z.string().regex(/^[6-9]\d{9}$/, 'A valid 10-digit mobile number is required.'),
  mode: z.enum(['offline', 'online']),
  quantity: z.number().int().min(1).max(MAX_QUANTITY).default(1),
})

function generateBookingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = randomBytes(3).toString('hex').toUpperCase()
  return `EV-${ts}-${rand}`
}

export const createBooking = async (req: Request, res: Response) => {
  const parsed = bookSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const event = await Event.findOne({ where: { slug: req.params.slug, isActive: true } })
  if (!event) throw new AppError(404, 'Event not found.')
  const plain = event.get({ plain: true }) as any

  const now = new Date()
  const window = bookingWindowFor(plain, now)
  if (window.bookingClosed) {
    throw new AppError(400, 'Booking closed. Bookings open until 1 hour before the event start time.')
  }
  if (window.isPast) {
    throw new AppError(400, 'This event has already started.')
  }

  const { customerName, customerEmail, customerMobile, mode, quantity } = parsed.data
  if (plain.mode === 'offline' && mode !== 'offline') {
    throw new AppError(400, 'This event is in-person only.')
  }
  if (plain.mode === 'online' && mode !== 'online') {
    throw new AppError(400, 'This event is online only.')
  }
  if (mode === 'offline' && !plain.venueAddress) {
    throw new AppError(400, 'Venue address is not set for this event.')
  }
  if (mode === 'online' && !plain.zoomLink) {
    throw new AppError(400, 'Zoom link is not set for this event.')
  }

  if (plain.capacity) {
    const seatsTaken = await paidSeats(plain.id)
    if (seatsTaken + quantity > Number(plain.capacity)) {
      throw new AppError(400, `Only ${Math.max(0, Number(plain.capacity) - seatsTaken)} seat(s) left for this event.`)
    }
  }

  const unitPrice = Number(plain.price)
  const total = Math.round(unitPrice * quantity * 100) / 100
  const bookingNumber = generateBookingNumber()

  const insertBooking = (t?: any) => {
    const payload = {
      bookingNumber,
      eventId: plain.id,
      customerId: (req as any).auth?.sub ?? null,
      customerName,
      customerEmail,
      customerMobile,
      mode,
      quantity,
      unitPrice,
      total,
      paymentStatus: 'pending' as const,
      gatewayOrderId: null,
    }
    return t ? EventBooking.create(payload, { transaction: t }) : EventBooking.create(payload)
  }

  const reserveSeat = async (t: any) => {
    const locked = await Event.findByPk(plain.id, { transaction: t, lock: t.LOCK.UPDATE })
    if (!locked) throw new AppError(404, 'Event not found.')
    const lockedPlain: any = locked.get({ plain: true })
    const seatsTaken = await paidSeats(plain.id, t)
    const capacity = Number(lockedPlain.capacity)
    if (capacity && seatsTaken + quantity > capacity) {
      throw new AppError(400, `Only ${Math.max(0, capacity - seatsTaken)} seat(s) left for this event.`)
    }
    return insertBooking(t)
  }

  if (total <= 0) {
    let booking: any
    try {
      booking = await sequelize.transaction(async (t) => reserveSeat(t))
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError(400, 'Booking could not be completed. Please try again.')
    }
    await confirmPaidBooking(booking.get('id') as number, null)
    res.status(201).json({
      bookingId: booking.get('id'),
      bookingNumber,
      cashfreeOrderId: null,
      amount: 0,
      currency: 'INR',
      status: 'confirmed',
    })
    return
  }

  let cashfreeOrder: any
  const cashfreeOrderId = `ev_${bookingNumber}`
  try {
    cashfreeOrder = await createCashfreeOrder({
      amount: total,
      orderId: cashfreeOrderId,
      customerId: `evcust_${bookingNumber}`,
      customerName,
      customerEmail,
      customerPhone: customerMobile,
      returnUrl: `${env.API_URL}/api/storefront/payment-return?order_id={order_id}`,
      notifyUrl: `${env.API_URL}/api/webhook/cashfree`,
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(502, `Payment gateway error: ${err instanceof Error ? err.message : String(err)}`)
  }

  const auth = (req as any).auth
  let booking: any
  try {
    booking = await sequelize.transaction(async (t) => {
      const locked = await Event.findByPk(plain.id, { transaction: t, lock: t.LOCK.UPDATE })
      if (!locked) throw new AppError(404, 'Event not found.')
      const lockedPlain: any = locked.get({ plain: true })
      const seatsTaken = await paidSeats(plain.id, t)
      const capacity = Number(lockedPlain.capacity)
      if (capacity && seatsTaken + quantity > capacity) {
        throw new AppError(400, `Only ${Math.max(0, capacity - seatsTaken)} seat(s) left for this event.`)
      }
      return EventBooking.create(
        {
          bookingNumber,
          eventId: plain.id,
          customerId: auth?.sub ?? null,
          customerName,
          customerEmail,
          customerMobile,
          mode,
          quantity,
          unitPrice,
          total,
          paymentStatus: 'pending',
          gatewayOrderId: cashfreeOrder?.order_id ?? null,
        },
        { transaction: t },
      )
    })
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(400, 'Booking could not be completed. Please try again.')
  }

  res.status(201).json({
    bookingId: booking.get('id'),
    bookingNumber,
    cashfreeOrderId: cashfreeOrder?.order_id ?? null,
    paymentSessionId: cashfreeOrder?.payment_session_id ?? null,
    amount: cashfreeOrder?.order_amount ?? 0,
    currency: cashfreeOrder?.order_currency ?? 'INR',
    status: 'pending_payment',
  })
}

const verifySchema = z.object({
  cashfreeOrderId: z.string().min(1),
  bookingId: z.number().int().positive(),
})

export async function confirmPaidBooking(bookingId: number, gatewayPaymentId: string | null = null): Promise<void> {
  const booking = await EventBooking.findByPk(bookingId, { include: [{ model: Event, as: 'event' }] })
  if (!booking) throw new AppError(404, 'Booking not found.')
  if (booking.get('paymentStatus') === 'paid') return

  const event: any = booking.get('event')
  const eventPlain = event ? (typeof event.get === 'function' ? event.get({ plain: true }) : event) : {}
  const bookingPlain = booking.get({ plain: true }) as any
  const updates: Record<string, unknown> = {
    paymentStatus: 'paid',
    gatewayPaymentId: gatewayPaymentId ?? null,
  }

  if (bookingPlain.mode === 'offline') {
    const qrToken = bookingPlain.qrToken || `SOILGODDESS-EV-${randomBytes(12).toString('hex').toUpperCase()}`
    const qrImage = bookingPlain.qrImage || (await QRCode.toDataURL(qrToken, { margin: 1 }))
    updates.qrToken = qrToken
    updates.qrImage = qrImage
  }

  await booking.update(updates)

  const updatedBooking = {
    ...bookingPlain,
    ...updates,
  }

  // Asynchronous detached dispatch: notifications never block API response or throw to callers
  setImmediate(async () => {
    try {
      const company = await getCompanyInfo().catch(() => undefined)
      await Promise.allSettled([
        // 1. Customer Confirmation Email
        sendEventBookingConfirmationEmail(
          updatedBooking.customerEmail,
          updatedBooking,
          eventPlain,
          company,
        ).catch((err: any) => {
          console.error('[Events] Customer confirmation email failed:', err?.message || err)
        }),

        // 2. Admin Alert Email
        sendAdminEventBookingAlert(
          env.ADMIN_EMAIL,
          updatedBooking,
          eventPlain,
          company,
        ).catch((err: any) => {
          console.error('[Events] Admin event booking alert failed:', err?.message || err)
        }),

        // 3. Customer WhatsApp Notification
        sendBookingConfirmationWhatsApp({
          customerName: updatedBooking.customerName,
          customerEmail: updatedBooking.customerEmail,
          customerMobile: updatedBooking.customerMobile,
          bookingNumber: updatedBooking.bookingNumber,
          eventName: eventPlain.name || eventPlain.title || 'Soil Goddess Event',
          eventDate: eventPlain.eventDate || '',
          startTime: eventPlain.startTime || '',
          endTime: eventPlain.endTime || '',
          mode: updatedBooking.mode,
          quantity: Number(updatedBooking.quantity || 1),
          total: Number(updatedBooking.total || 0),
          venueAddress: eventPlain.venueAddress || null,
          zoomLink: updatedBooking.zoomLink || eventPlain.zoomLink || null,
          companyName: company?.name,
          supportPhone: company?.phone,
          supportEmail: company?.email,
        }).catch((err: any) => {
          console.error('[Events] Customer WhatsApp confirmation failed:', err?.message || err)
        }),
      ])
    } catch (pipelineErr: any) {
      console.error('[Events] Error in asynchronous notification pipeline:', pipelineErr?.message || pipelineErr)
    }
  })
}

export const verifyBookingPayment = async (req: Request, res: Response) => {
  const parsed = verifySchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }
  const { cashfreeOrderId, bookingId } = parsed.data

  const booking = await EventBooking.findByPk(bookingId)
  if (!booking) throw new AppError(404, 'Booking not found.')
  if (booking.get('gatewayOrderId') !== cashfreeOrderId) {
    throw new AppError(400, 'Cashfree order does not match this booking.')
  }

  const { paid, paymentId } = await isOrderPaid(cashfreeOrderId)
  if (!paid) {
    throw new AppError(400, 'Payment verification failed.')
  }

  await confirmPaidBooking(bookingId, paymentId ?? null)

  const freshBooking = await EventBooking.findByPk(bookingId, {
    include: [{ model: Event, as: 'event', attributes: ['zoomLink'] }],
  })
  const fresh = freshBooking!.get({ plain: true }) as any
  res.json({
    success: true,
    booking: {
      id: fresh.id,
      bookingNumber: fresh.bookingNumber,
      paymentStatus: fresh.paymentStatus,
      mode: fresh.mode,
      quantity: fresh.quantity,
      total: Number(fresh.total),
      customerName: fresh.customerName,
      qrToken: fresh.qrToken ?? null,
      qrImage: fresh.qrImage ?? null,
      zoomLink: fresh.mode === 'online' ? (fresh.event?.zoomLink ?? null) : null,
      event: null,
    },
  })
}

export const getBooking = async (req: Request, res: Response) => {
  const booking = await EventBooking.findByPk(req.params.bookingId, {
    include: [{ model: Event, as: 'event', attributes: ['name', 'eventDate', 'startTime', 'endTime', 'venueAddress', 'zoomLink'] }],
  })
  if (!booking) throw new AppError(404, 'Booking not found.')
  const plain = booking.get({ plain: true }) as any
  res.json({
    booking: {
      id: plain.id,
      bookingNumber: plain.bookingNumber,
      paymentStatus: plain.paymentStatus,
      mode: plain.mode,
      quantity: plain.quantity,
      total: Number(plain.total),
      customerName: plain.customerName,
      qrToken: plain.qrToken ?? null,
      qrImage: plain.qrImage ?? null,
      zoomLink: plain.mode === 'online' ? (plain.event?.zoomLink ?? null) : null,
      event: plain.event,
    },
  })
}

export const getMyBookings = async (req: Request, res: Response) => {
  const auth = (req as any).auth
  if (!auth?.sub) throw new AppError(401, 'Authentication required')
  const bookings = await EventBooking.findAll({
    where: { customerId: auth.sub },
    include: [{ model: Event, as: 'event', attributes: ['name', 'eventDate', 'startTime', 'endTime', 'venueAddress', 'zoomLink'] }],
    order: [['createdAt', 'DESC']],
  })
  const list = bookings.map((row) => {
    const plain = row.get({ plain: true }) as any
    return {
      id: plain.id,
      bookingNumber: plain.bookingNumber,
      paymentStatus: plain.paymentStatus,
      mode: plain.mode,
      quantity: plain.quantity,
      total: Number(plain.total),
      createdAt: plain.createdAt,
      qrImage: plain.qrImage ?? null,
      zoomLink: plain.mode === 'online' && plain.paymentStatus === 'paid' ? (plain.event?.zoomLink ?? null) : null,
      event: plain.event,
    }
  })
  res.json({ bookings: list })
}