import { Request, Response } from 'express'
import { z } from 'zod'
import { Op } from 'sequelize'
import { Event, EventBooking } from '../../../models/index.js'
import { writeAuditLog } from '../../../services/audit.service.js'
import { AppError } from '../../../utils/http.js'
import { slugify } from '../../../utils/slug.js'
import { adminId } from './utils.js'

export const eventSchema = z.object({
  name: z.string().min(2, 'Event name is required.').max(180),
  description: z.string().max(5000).optional().default(''),
  imageUrl: z.string().max(255).optional().nullable().default(null),
  images: z
    .array(z.string().max(1000))
    .optional()
    .nullable()
    .default([])
    .transform(v => (Array.isArray(v) ? v.filter((img): img is string => typeof img === 'string' && img.trim().length > 0) : [])),
  videoUrl: z
    .string()
    .max(512, 'Video URL cannot exceed 512 characters.')
    .optional()
    .nullable()
    .default(null)
    .transform(v => (v && v.trim() ? v.trim() : null)),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date (YYYY-MM-DD) is required.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid start time (HH:MM) is required.'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Valid end time (HH:MM) is required.'),
  price: z.coerce.number().min(0).max(10000000),
  mode: z.enum(['offline', 'online', 'both']),
  venueAddress: z.string().max(2000).optional().nullable().default(null),
  zoomLink: z.string().url('Valid Zoom link is required.').max(512).optional().nullable().default(null),
  capacity: z.coerce.number().int().positive().optional().nullable().default(null),
  isActive: z.boolean().optional().default(true),
})

function validateModeFields(body: z.infer<typeof eventSchema>) {
  if (['offline', 'both'].includes(body.mode) && !body.venueAddress) {
    throw new AppError(400, 'Venue address is required for offline/both events.')
  }
  if (['online', 'both'].includes(body.mode) && !body.zoomLink) {
    throw new AppError(400, 'Zoom link is required for online/both events.')
  }
}

async function uniqueSlug(name: string, excludeId?: number) {
  const base = slugify(name) || `event-${Date.now()}`
  let candidate = base
  let suffix = 2
  while (await Event.findOne({ where: { slug: candidate, ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}) } })) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  return candidate
}

function localToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function validateEventSchedule(body: { eventDate?: string; startTime?: string; endTime?: string }, existing: any = {}) {
  const date = body.eventDate ?? existing.eventDate
  const start = body.startTime ?? existing.startTime
  const end = body.endTime ?? existing.endTime
  if (date && start && end && end <= start) {
    throw new AppError(400, 'End time must be after the start time.')
  }
  if (date && start && new Date(`${date}T${start}:00`) <= new Date()) {
    throw new AppError(400, 'Event start must be in the future.')
  }
}

export const listEvents = async (req: Request, res: Response) => {
  const includePast = req.query.includePast === 'true'
  const where: any = {}
  if (!includePast) {
    where.eventDate = { [Op.gte]: localToday() }
  }
  const events = await Event.findAll({ where, order: [['eventDate', 'DESC']] })
  const result = await Promise.all(
    events.map(async (e: any) => {
      const plain = e.get({ plain: true })
      const seats = await EventBooking.findAll({
        where: { eventId: plain.id, paymentStatus: 'paid' },
        attributes: ['quantity'],
      })
      const paidBookings = seats.reduce((sum, b) => sum + Number(b.get('quantity') ?? 0), 0)
      return { ...plain, paidBookings }
    }),
  )
  res.json({ events: result })
}

export const getEvent = async (req: Request, res: Response) => {
  const event = await Event.findByPk(req.params.id)
  if (!event) throw new AppError(404, 'Event not found.')
  res.json({ event })
}

export const createEvent = async (req: Request, res: Response) => {
  const parsed = eventSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }
  validateModeFields(parsed.data)
  validateEventSchedule(parsed.data)

  const data: any = { ...parsed.data }
  if (data.videoUrl !== undefined) {
    data.videoUrl = data.videoUrl && data.videoUrl.trim() ? data.videoUrl.trim() : null
  }
  if (!data.imageUrl && data.images?.length) {
    data.imageUrl = data.images[0]
  } else if (data.imageUrl && (!data.images || !data.images.length)) {
    data.images = [data.imageUrl]
  }

  const event = await Event.create({
    ...data,
    slug: await uniqueSlug(parsed.data.name),
  })

  await writeAuditLog({
    adminId: adminId(req),
    action: 'CREATE',
    entity: 'event',
    entityId: String(event.get('id')),
    details: { name: parsed.data.name },
  })
  res.status(201).json({ event })
}

export const updateEvent = async (req: Request, res: Response) => {
  const event = await Event.findByPk(req.params.id)
  if (!event) throw new AppError(404, 'Event not found.')

  const parsed = eventSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const data: any = { ...parsed.data }
  if (data.name) {
    data.slug = await uniqueSlug(data.name, Number(req.params.id))
  }
  if (data.videoUrl !== undefined) {
    data.videoUrl = data.videoUrl && data.videoUrl.trim() ? data.videoUrl.trim() : null
  }
  if (!data.imageUrl && data.images?.length) {
    data.imageUrl = data.images[0]
  } else if (data.imageUrl && (!data.images || !data.images.length)) {
    data.images = [data.imageUrl]
  }

  const merged = { ...event.get({ plain: true }), ...data }
  validateModeFields(merged)
  validateEventSchedule(merged)

  await event.update(data)
  await writeAuditLog({
    adminId: adminId(req),
    action: 'UPDATE',
    entity: 'event',
    entityId: String(event.get('id')),
    details: { name: data.name ?? event.get('name') },
  })
  res.json({ event })
}

export const deleteEvent = async (req: Request, res: Response) => {
  const event = await Event.findByPk(req.params.id)
  if (!event) throw new AppError(404, 'Event not found.')
  const paidCount = await EventBooking.count({ where: { eventId: event.get('id'), paymentStatus: 'paid' } })
  if (paidCount > 0) {
    throw new AppError(400, 'Cannot delete an event that already has paid bookings. Deactivate it instead.')
  }
  await event.destroy()
  await writeAuditLog({ adminId: adminId(req), action: 'DELETE', entity: 'event', entityId: String(event.get('id')) })
  res.json({ success: true })
}

export const listBookings = async (req: Request, res: Response) => {
  const eventId = Number(req.params.id)
  if (!Number.isInteger(eventId) || eventId <= 0) throw new AppError(400, 'Invalid event id.')
  const statusFilter = req.query.status as string | undefined
  const where: any = { eventId }
  if (statusFilter && ['pending', 'paid', 'failed', 'refunded'].includes(statusFilter)) {
    where.paymentStatus = statusFilter
  }
  const bookings = await EventBooking.findAll({
    where,
    order: [['id', 'DESC']],
    attributes: ['id', 'bookingNumber', 'customerName', 'customerEmail', 'customerMobile', 'mode', 'quantity', 'total', 'paymentStatus', 'checkedIn', 'checkInAt', 'qrToken', 'zoomLink', 'createdAt'],
  })
  res.json({ bookings })
}

const checkInSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required.'),
})

export const checkIn = async (req: Request, res: Response) => {
  const parsed = checkInSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new AppError(400, parsed.error.errors.map(e => e.message).join('; '))
  }

  const booking = await EventBooking.findOne({ where: { qrToken: parsed.data.qrToken } })
  if (!booking) throw new AppError(404, 'QR token not found.')
  if (booking.get('paymentStatus') !== 'paid') {
    throw new AppError(400, 'This booking is not paid.')
  }
  if (booking.get('checkedIn')) {
    return res.json({ success: true, alreadyCheckedIn: true, booking })
  }

  await booking.update({ checkedIn: true, checkInAt: new Date() })
  res.json({ success: true, alreadyCheckedIn: false, booking })
}

export const toggleCheckIn = async (req: Request, res: Response) => {
  const booking = await EventBooking.findByPk(req.params.bookingId)
  if (!booking) throw new AppError(404, 'Booking not found.')
  const value = booking.get('checkedIn') ? false : true
  await booking.update({ checkedIn: value, checkInAt: value ? new Date() : null })
  res.json({ success: true, booking })
}