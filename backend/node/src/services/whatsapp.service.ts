import { env } from '../config/env.js'

export interface EventBookingNotificationData {
  customerName: string
  customerEmail: string
  customerMobile: string
  bookingNumber: string
  eventName: string
  eventDate: string
  startTime: string
  endTime: string
  mode: 'offline' | 'online'
  quantity: number
  total: number
  venueAddress?: string | null
  zoomLink?: string | null
  companyName?: string
  supportPhone?: string
  supportEmail?: string
}

export interface WhatsAppSendResult {
  success: boolean
  provider: string
  messageId?: string
  recipient: string
  error?: string
}

/**
 * Normalizes customer mobile numbers to standard E.164 / international format (e.g. 919876543210).
 * Handles 10-digit Indian numbers, +91 prefixes, leading zeroes, dashes, and whitespace.
 * Returns null and logs a warning for invalid or missing inputs to prevent crashes.
 */
export function normalizeMobileNumber(rawMobile: string | null | undefined): string | null {
  if (!rawMobile || typeof rawMobile !== 'string') {
    console.warn('[WhatsApp] Missing or invalid mobile number input:', rawMobile)
    return null
  }

  // Remove whitespace, dashes, parentheses, dots
  let cleaned = rawMobile.trim().replace(/[\s\-().]/g, '')

  if (!cleaned) {
    console.warn('[WhatsApp] Mobile number is empty after trimming.')
    return null
  }

  // Remove leading '+'
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }

  // If 10 digits starting with 6, 7, 8, 9 (standard Indian mobile)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `91${cleaned}`
  }

  // If 11 digits starting with 0 followed by 6-9 and 9 digits (e.g. 09876543210)
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `91${cleaned.substring(1)}`
  }

  // If 12 digits starting with 91 followed by 6-9 and 9 digits (e.g. 919876543210)
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned
  }

  // If international number with country code (10 to 15 digits)
  if (/^\d{10,15}$/.test(cleaned)) {
    return cleaned
  }

  console.warn(`[WhatsApp] Invalid mobile number skipped: "${rawMobile}"`)
  return null
}

/**
 * Formats a rich, personalized branded WhatsApp confirmation message for event bookings.
 * Customizes content based on event mode (offline venue vs online webinar link).
 */
export function formatBookingWhatsAppMessage(data: EventBookingNotificationData): string {
  const brand = data.companyName || 'Soil Goddess'
  const supportPhone = data.supportPhone || '+91 8822664432'
  const supportEmail = data.supportEmail || 'care@soilgoddess.com'
  const customerName = data.customerName?.trim() || 'Valued Guest'
  const amountStr = Number(data.total) <= 0 ? 'FREE (₹0.00)' : `₹${Number(data.total).toFixed(2)}`

  const lines: string[] = [
    `🌿 *${brand}* — Booking Confirmation 🌿`,
    ``,
    `Hello *${customerName}*,`,
    `Thank you for registering! Your event booking has been confirmed successfully.`,
    ``,
    `📋 *Booking Ref:* ${data.bookingNumber}`,
    `✨ *Event:* ${data.eventName}`,
    `📅 *Date:* ${data.eventDate}`,
    `⏰ *Time:* ${data.startTime} – ${data.endTime}`,
    `🎟️ *Seats / Quantity:* ${data.quantity}`,
    `💰 *Amount Paid:* ${amountStr}`,
    `🏷️ *Mode:* ${data.mode === 'offline' ? 'In-Person (Offline)' : 'Online Webinar'}`,
  ]

  if (data.mode === 'offline') {
    lines.push(
      ``,
      `📍 *Venue Address:*`,
      `${data.venueAddress?.trim() || 'Details will be announced shortly'}`,
      ``,
      `📌 *Check-in Reminder:* Please arrive 15 minutes before the session starts and present your Booking ID or QR pass at the entrance.`
    )
  } else {
    lines.push(
      ``,
      `🔗 *Webinar / Zoom Joining Link:*`,
      `${data.zoomLink?.trim() || 'Joining link will be sent prior to the session.'}`,
      ``,
      `📌 *Webinar Instructions:* Please join 5 minutes prior to the start time with a stable internet connection.`
    )
  }

  lines.push(
    ``,
    `Need assistance?`,
    `📞 Phone: ${supportPhone}`,
    `✉️ Email: ${supportEmail}`,
    ``,
    `We look forward to hosting you! ✨`,
    `*Team ${brand}*`
  )

  return lines.join('\n')
}

/**
 * Generates an instant Click-to-Chat WhatsApp deep link URL.
 * Works immediately on Mobile, Desktop, and Web WhatsApp without needing third-party API keys.
 */
export function buildWhatsAppShareUrl(data: EventBookingNotificationData): string {
  const normalized = normalizeMobileNumber(data.customerMobile) || ''
  const text = formatBookingWhatsAppMessage(data)
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
}

/**
 * Dispatch message via Mock provider (local development & fallback mode).
 */
function sendMockWhatsApp(recipient: string, messageText: string): WhatsAppSendResult {
  const messageId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  console.log(`[WhatsApp Mock] ========================================`)
  console.log(`[WhatsApp Mock] Automated message dispatched to: +${recipient}`)
  console.log(`[WhatsApp Mock] Message ID: ${messageId}`)
  console.log(`[WhatsApp Mock] Payload:`)
  console.log(messageText)
  console.log(`[WhatsApp Mock] Click-to-Chat Preview: https://wa.me/${recipient}?text=${encodeURIComponent(messageText)}`)
  console.log(`[WhatsApp Mock] ========================================`)

  return {
    success: true,
    provider: 'mock',
    messageId,
    recipient,
  }
}

/**
 * Dispatch message via UltraMsg REST API gateway.
 */
async function sendUltraMsgWhatsApp(
  recipient: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const instanceId = env.WHATSAPP_INSTANCE_ID
  const token = env.WHATSAPP_TOKEN || env.WHATSAPP_API_KEY

  if (!instanceId || !token) {
    console.warn('[WhatsApp:UltraMsg] Missing WHATSAPP_INSTANCE_ID or WHATSAPP_TOKEN. Falling back to mock.')
    return sendMockWhatsApp(recipient, messageText)
  }

  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`
  const params = new URLSearchParams()
  params.append('token', token)
  params.append('to', `+${recipient}`)
  params.append('body', messageText)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const resJson: any = await response.json().catch(() => ({}))

    if (!response.ok || resJson.error) {
      const errorMsg = JSON.stringify(resJson)
      console.error(`[WhatsApp:UltraMsg] API Error: ${errorMsg}`)
      return { success: false, provider: 'ultramsg', recipient, error: errorMsg }
    }

    const messageId = resJson.id || `ultramsg-${Date.now()}`
    console.log(`[WhatsApp:UltraMsg] Successfully sent message to +${recipient} (ID: ${messageId})`)
    return { success: true, provider: 'ultramsg', messageId: String(messageId), recipient }
  } catch (err: any) {
    console.error('[WhatsApp:UltraMsg] Network error:', err?.message || err)
    return { success: false, provider: 'ultramsg', recipient, error: err?.message }
  }
}

/**
 * Dispatch message via Twilio WhatsApp API.
 */
async function sendTwilioWhatsApp(
  recipient: string,
  messageText: string
): Promise<WhatsAppSendResult> {
  const accountSid = env.WHATSAPP_INSTANCE_ID || env.WHATSAPP_API_KEY
  const authToken = env.WHATSAPP_TOKEN || env.WHATSAPP_ACCESS_TOKEN
  const fromNumber = env.WHATSAPP_PHONE_NUMBER_ID || 'whatsapp:+14155238886'

  if (!accountSid || !authToken) {
    console.warn('[WhatsApp:Twilio] Missing Twilio Account SID or Auth Token. Falling back to mock.')
    return sendMockWhatsApp(recipient, messageText)
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const params = new URLSearchParams()
  params.append('From', fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`)
  params.append('To', `whatsapp:+${recipient}`)
  params.append('Body', messageText)

  try {
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader,
      },
      body: params.toString(),
    })

    const resJson: any = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMsg = JSON.stringify(resJson)
      console.error(`[WhatsApp:Twilio] API Error: ${errorMsg}`)
      return { success: false, provider: 'twilio', recipient, error: errorMsg }
    }

    const messageId = resJson.sid || `twilio-${Date.now()}`
    console.log(`[WhatsApp:Twilio] Successfully sent message to +${recipient} (SID: ${messageId})`)
    return { success: true, provider: 'twilio', messageId: String(messageId), recipient }
  } catch (err: any) {
    console.error('[WhatsApp:Twilio] Network error:', err?.message || err)
    return { success: false, provider: 'twilio', recipient, error: err?.message }
  }
}

/**
 * Dispatch message via Meta WhatsApp Cloud API (Graph API v20.0).
 */
async function sendMetaWhatsApp(
  recipient: string,
  messageText: string,
  data: EventBookingNotificationData
): Promise<WhatsAppSendResult> {
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    console.warn(
      '[WhatsApp] Meta credentials missing (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN). Gracefully falling back to mock mode.'
    )
    return sendMockWhatsApp(recipient, messageText)
  }

  const url = env.WHATSAPP_API_URL || `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`

  const body = env.WHATSAPP_TEMPLATE_NAME
    ? {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'template',
        template: {
          name: env.WHATSAPP_TEMPLATE_NAME,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: data.customerName || 'Customer' },
                { type: 'text', text: data.bookingNumber },
                { type: 'text', text: data.eventName },
                { type: 'text', text: data.eventDate },
                { type: 'text', text: `${data.startTime} - ${data.endTime}` },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: {
          preview_url: true,
          body: messageText,
        },
      }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const resJson: any = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorDetail = JSON.stringify(resJson)
      console.error(`[WhatsApp:Meta] API error HTTP ${response.status}: ${errorDetail}`)
      return {
        success: false,
        provider: 'meta',
        recipient,
        error: `Meta API HTTP ${response.status}: ${resJson.error?.message || errorDetail}`,
      }
    }

    const messageId = resJson.messages?.[0]?.id || `meta-${Date.now()}`
    console.log(`[WhatsApp:Meta] Message successfully sent to +${recipient} (ID: ${messageId})`)

    return {
      success: true,
      provider: 'meta',
      messageId,
      recipient,
    }
  } catch (err: any) {
    console.error('[WhatsApp:Meta] Network exception:', err?.message || err)
    return {
      success: false,
      provider: 'meta',
      recipient,
      error: err?.message || 'Meta WhatsApp dispatch network error',
    }
  }
}

/**
 * Dispatch message via Webhook or Third-Party Aggregators (Interakt, Aisensy, Wati, Fast2SMS).
 */
async function sendWebhookWhatsApp(
  provider: string,
  recipient: string,
  messageText: string,
  data: EventBookingNotificationData
): Promise<WhatsAppSendResult> {
  const apiUrl = env.WHATSAPP_API_URL
  const apiKey = env.WHATSAPP_API_KEY

  if (!apiUrl) {
    console.warn(
      `[WhatsApp] WHATSAPP_API_URL is not configured for provider "${provider}". Gracefully falling back to mock mode.`
    )
    return sendMockWhatsApp(recipient, messageText)
  }

  const payload = {
    provider,
    recipient,
    to: recipient,
    phone: recipient,
    message: messageText,
    text: messageText,
    data: {
      bookingNumber: data.bookingNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerMobile: data.customerMobile,
      eventName: data.eventName,
      eventDate: data.eventDate,
      startTime: data.startTime,
      endTime: data.endTime,
      mode: data.mode,
      quantity: data.quantity,
      total: data.total,
      venueAddress: data.venueAddress,
      zoomLink: data.zoomLink,
    },
    timestamp: new Date().toISOString(),
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['Authorization'] = apiKey.startsWith('Bearer ') || apiKey.startsWith('Basic ')
      ? apiKey
      : `Bearer ${apiKey}`
    headers['x-api-key'] = apiKey
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const resJson: any = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${JSON.stringify(resJson)}`
      console.error(`[WhatsApp:${provider}] Provider returned error: ${errorMsg}`)
      return {
        success: false,
        provider,
        recipient,
        error: errorMsg,
      }
    }

    const messageId =
      resJson?.id || resJson?.messageId || resJson?.msgId || `${provider}-${Date.now()}`
    console.log(`[WhatsApp:${provider}] Message dispatched to +${recipient} (ID: ${messageId})`)

    return {
      success: true,
      provider,
      messageId: String(messageId),
      recipient,
    }
  } catch (err: any) {
    console.error(`[WhatsApp:${provider}] Dispatch network failure:`, err?.message || err)
    return {
      success: false,
      provider,
      recipient,
      error: err?.message || `${provider} dispatch error`,
    }
  }
}

/**
 * Sends a WhatsApp booking confirmation message to the customer.
 * Validates mobile number, builds formatted message, and routes to configured provider adapter.
 * Resilient against provider downtime and invalid recipient numbers.
 */
export async function sendBookingConfirmationWhatsApp(
  data: EventBookingNotificationData
): Promise<WhatsAppSendResult> {
  try {
    const normalizedMobile = normalizeMobileNumber(data.customerMobile)

    if (!normalizedMobile) {
      console.warn(
        `[WhatsApp] Skipped sending notification: invalid or missing customer mobile "${data.customerMobile}" for booking ${data.bookingNumber}`
      )
      return {
        success: false,
        provider: 'none',
        recipient: data.customerMobile || '',
        error: 'Invalid or missing mobile number',
      }
    }

    const messageText = formatBookingWhatsAppMessage(data)
    const provider = env.WHATSAPP_PROVIDER || 'mock'

    switch (provider) {
      case 'meta':
        return await sendMetaWhatsApp(normalizedMobile, messageText, data)

      case 'ultramsg':
        return await sendUltraMsgWhatsApp(normalizedMobile, messageText)

      case 'twilio':
        return await sendTwilioWhatsApp(normalizedMobile, messageText)

      case 'webhook':
      case 'interakt':
      case 'aisensy':
      case 'wati':
      case 'fast2sms':
        return await sendWebhookWhatsApp(provider, normalizedMobile, messageText, data)

      case 'mock':
      default:
        return sendMockWhatsApp(normalizedMobile, messageText)
    }
  } catch (error: any) {
    console.error('[WhatsApp] Unexpected error during notification dispatch:', error?.message || error)
    return {
      success: false,
      provider: env.WHATSAPP_PROVIDER || 'mock',
      recipient: data?.customerMobile || '',
      error: error?.message || 'Unexpected WhatsApp dispatch error',
    }
  }
}

