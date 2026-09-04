import { Router } from 'express'
import storefrontRoutes from '../modules/storefront/storefront.routes.js'
import authRoutes from '../modules/auth/auth.routes.js'
import addressRoutes from '../modules/address/address.routes.js'
import adminAuthRoutes from '../modules/admin-auth/admin-auth.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import priceDropRoutes from '../modules/admin/price-drop.routes.js'
import emailCampaignRoutes from '../modules/admin/email-campaign.routes.js'
import stockNotificationRoutes from '../modules/admin/stock-notification.routes.js'
import webhookRoutes from '../modules/webhook/webhook.routes.js'
import cartRoutes from '../modules/cart/cart.routes.js'
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js'
import eventsRoutes from '../modules/events/events.routes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'threads-of-tn-api' })
})

router.use('/storefront', storefrontRoutes)
router.use('/storefront/cart', cartRoutes)
router.use('/storefront/wishlist', wishlistRoutes)
router.use('/auth', authRoutes)
router.use('/auth/addresses', addressRoutes)
router.use('/storefront/events', eventsRoutes)
router.use('/admin/auth', adminAuthRoutes)
router.use('/admin/price-drops', priceDropRoutes)
router.use('/admin/email-campaigns', emailCampaignRoutes)
router.use('/admin/stock-notifications', stockNotificationRoutes)
router.use('/admin', adminRoutes)
router.use('/webhook', webhookRoutes)

export default router
