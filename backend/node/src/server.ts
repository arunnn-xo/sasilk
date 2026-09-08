import bcrypt from 'bcryptjs'
import cron from 'node-cron'
import { env } from './config/env.js'
import { app } from './app.js'
import { assertDatabaseConnection, ensureDatabaseExists, sequelize } from './database/sequelize.js'
import { runMigrations } from './database/migrate.js'
import { Admin } from './models/index.js'
import { expireOldCoupons } from './services/coupon-expiry.service.js'

async function start() {
  await ensureDatabaseExists()
  await assertDatabaseConnection()
  await runMigrations()

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12)
  await Admin.findOrCreate({
    where: { email: env.ADMIN_EMAIL },
    defaults: {
      name: 'Threads Admin',
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: 'super_admin',
      status: 'active',
    },
  })

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Threads of TN API running on http://0.0.0.0:${env.PORT}/api`)
  })

  // ── Coupon auto-expiry ──────────────────────────────────────────────
  // Run once immediately at startup to fix any stale coupons, then
  // repeat every hour at minute 0 (e.g. 01:00, 02:00, 03:00 …).
  await expireOldCoupons()
  cron.schedule('0 * * * *', expireOldCoupons, { timezone: 'Asia/Kolkata' })
  console.log('[CouponExpiry] 🕐 Hourly expiry job scheduled (Asia/Kolkata).')
}

start().catch(error => {
  console.error('Failed to start API:', error)
  process.exit(1)
})
