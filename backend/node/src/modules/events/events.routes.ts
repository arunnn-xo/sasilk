import { Router } from 'express'
import { optionalCustomerAuth, requireCustomerAuth } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/http.js'
import * as eventsController from './events.controller.js'

const router = Router()

router.get('/', asyncHandler(eventsController.listEvents))
router.get('/my-bookings', requireCustomerAuth, asyncHandler(eventsController.getMyBookings))

// IMPORTANT: /bookings/* routes MUST be registered BEFORE /:slug wildcard
// otherwise /:slug catches "bookings" as a slug and returns 404
router.post('/bookings/:bookingId/verify', asyncHandler(eventsController.verifyBookingPayment))
router.get('/bookings/:bookingId', asyncHandler(eventsController.getBooking))

router.get('/:slug', asyncHandler(eventsController.getEventBySlug))
router.post('/:slug/book', optionalCustomerAuth, asyncHandler(eventsController.createBooking))

export default router