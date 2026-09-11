import fs from 'node:fs'
import path from 'node:path'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error-handler.js'
import { initAssociations } from './models/index.js'

initAssociations()

const allowedOrigins = new Set([
  env.FRONTEND_URL,
  env.ADMIN_PANEL_URL,
  'http://localhost:3000',
  'http://localhost:5173',
])

export const app = express()

app.set('trust proxy', 1)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(compression())
app.use(express.json({
  limit: '2mb',
  verify: (req: any, _res, buf) => { req.rawBody = buf },
}))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(env.COOKIE_SECRET))
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    const clean = origin.replace(/\/$/, '')
    const isAllowed =
      env.NODE_ENV === 'development' ||
      allowedOrigins.has(origin) ||
      allowedOrigins.has(clean) ||
      clean.endsWith('.vercel.app') ||
      clean.includes('localhost') ||
      clean.includes('127.0.0.1')
    if (isAllowed) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  credentials: true,
}))

function createAuthLimiter(message: string, limit: number, windowMinutes = 15) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  })
}

const customerLoginLimiter = createAuthLimiter('Too many login attempts. Please try again after 15 minutes.', 10)
const adminLoginLimiter = createAuthLimiter('Too many admin login attempts. Please try again after 15 minutes.', 10)
const registerLimiter = createAuthLimiter('Too many registration attempts. Please try again later.', 5, 60)
const forgotPasswordLimiter = createAuthLimiter('Too many password reset requests. Please try again after 15 minutes.', 5)

app.use('/api/auth/login', customerLoginLimiter)
app.use('/api/auth/register', registerLimiter)
app.use('/api/auth/forgot-password', forgotPasswordLimiter)
app.use('/api/admin/auth/login', adminLoginLimiter)

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {

    const origin = req.headers.origin
    const referer = req.headers.referer
    if (origin && (origin === env.FRONTEND_URL || origin === env.ADMIN_PANEL_URL)) {
      return true
    }
    if (referer) {
      if (referer.startsWith(env.FRONTEND_URL) || referer.startsWith(env.ADMIN_PANEL_URL)) {
        return true
      }
    }
    
    const ip = req.ip || req.socket.remoteAddress
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
  },
}))

app.use('/api', routes)

const DEFAULT_SAREE_FALLBACK = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'

app.use('/uploads', (req, res, next) => {
  if (req.path.toLowerCase().endsWith('.svg')) {
    return res.status(403).json({ error: 'SVG files are blocked for security reasons.' })
  }
  const filename = req.path.replace(/^\/+/, '')
  const localFile = path.resolve('uploads', filename)
  if (!fs.existsSync(localFile)) {
    // Missing local file on Render disk — redirect to fallback saree image to prevent 404 white cards
    return res.redirect(302, DEFAULT_SAREE_FALLBACK)
  }
  next()
}, express.static('uploads'))
app.use(errorHandler)