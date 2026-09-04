/**
 * SASilk / Soil Goddess Event Booking Transactional Notifications
 * ADVERSARIAL STRESS TEST & ATTACK HARNESS
 *
 * Authored by: Challenger 1 (critic / specialist)
 *
 * Test Sections:
 * 1. High-Throughput & Concurrency Stress (500+ simultaneous dispatches & formatting)
 * 2. Malformed, Non-Standard, Dirty & Malicious Phone Numbers (SQLi, XSS, ReDoS, E.164 edge cases)
 * 3. Third-Party Network Exceptions, Timeouts, HTTP 4xx/5xx, Corrupted JSON
 * 4. Missing / Null / Undefined / Corrupted Data Payloads (Fuzzing optional & required fields)
 * 5. Async Non-Blocking Detached Execution Verification
 */

import QRCode from 'qrcode'
import {
  normalizeMobileNumber,
  formatBookingWhatsAppMessage,
  sendBookingConfirmationWhatsApp,
  EventBookingNotificationData,
} from '../src/services/whatsapp.service.js'
import {
  sendEventBookingConfirmationEmail,
  sendAdminEventBookingAlert,
} from '../src/services/email.service.js'
import { env } from '../src/config/env.js'

interface StressTestResult {
  section: string
  id: string
  name: string
  passed: boolean
  durationMs: number
  error?: string
  details?: string
}

const stressResults: StressTestResult[] = []

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`)
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`[ASSERTION FAILED]: ${message} (Expected: "${expected}", Actual: "${actual}")`)
  }
}

function assertIncludes(haystack: string, needle: string, message: string) {
  if (!haystack || !haystack.includes(needle)) {
    throw new Error(`[ASSERTION FAILED]: ${message} (Did not find "${needle}" in output)`)
  }
}

async function runAdversarialTest(
  section: string,
  id: string,
  name: string,
  fn: () => Promise<void> | void
): Promise<void> {
  const start = performance.now()
  try {
    await fn()
    const durationMs = Math.round((performance.now() - start) * 100) / 100
    stressResults.push({ section, id, name, passed: true, durationMs })
    console.log(`  [PASS] [${id}] ${name} (${durationMs}ms)`)
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100
    stressResults.push({ section, id, name, passed: false, durationMs, error: err?.message || String(err) })
    console.error(`  [FAIL] [${id}] ${name} (${durationMs}ms) -> ${err?.message || err}`)
  }
}

async function main() {
  console.log('================================================================================')
  console.log('  EMPIRICAL ADVERSARIAL STRESS HARNESS — NOTIFICATION SERVICES')
  console.log('================================================================================\n')

  // ============================================================================
  // SECTION 1: HIGH-THROUGHPUT & CONCURRENCY STRESS
  // ============================================================================
  console.log('--- SECTION 1: High-Throughput & Concurrency Stress ---')

  await runAdversarialTest(
    'Concurrency',
    'STRESS-CONC-01',
    '500 concurrent WhatsApp formatting and mock dispatch calls in parallel',
    async () => {
      const concurrencyCount = 500
      const promises: Promise<any>[] = []

      for (let i = 0; i < concurrencyCount; i++) {
        const payload: EventBookingNotificationData = {
          customerName: `Customer ${i}`,
          customerEmail: `customer${i}@example.com`,
          customerMobile: `98765${String(10000 + (i % 90000)).substring(0, 5)}`,
          bookingNumber: `STRESS-CONC-${i}`,
          eventName: `High Concurrency Session ${i % 10}`,
          eventDate: '2026-10-15',
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          mode: i % 2 === 0 ? 'online' : 'offline',
          quantity: (i % 4) + 1,
          total: (i % 3) * 500,
          zoomLink: i % 2 === 0 ? `https://zoom.us/j/${i}` : null,
          venueAddress: i % 2 !== 0 ? `Venue Hall #${i % 5}` : null,
        }

        promises.push(
          (async () => {
            const msg = formatBookingWhatsAppMessage(payload)
            assert(msg.length > 50, `Message length should be > 50 for item ${i}`)
            const res = await sendBookingConfirmationWhatsApp(payload)
            assert(res.success, `Dispatch should succeed for item ${i}`)
            return res
          })()
        )
      }

      const results = await Promise.all(promises)
      assertEqual(results.length, concurrencyCount, `All ${concurrencyCount} requests must resolve`)
    }
  )

  await runAdversarialTest(
    'Concurrency',
    'STRESS-CONC-02',
    '100 concurrent offline QR code generation + email template render calls',
    async () => {
      const count = 100
      const promises: Promise<any>[] = []

      for (let i = 0; i < count; i++) {
        promises.push(
          (async () => {
            const bookingNumber = `STRESS-QR-${i}`
            const qrToken = `SOILGODDESS-EV-${bookingNumber}`
            const qrBuffer = await QRCode.toBuffer(qrToken, {
              type: 'png',
              width: 300,
              margin: 2,
              color: { dark: '#300D14', light: '#FFFFFF' },
            })
            assert(qrBuffer.length > 500, `QR buffer should be valid PNG for ${i}`)

            await sendEventBookingConfirmationEmail(
              `guest${i}@example.com`,
              {
                bookingNumber,
                customerName: `Guest ${i}`,
                customerEmail: `guest${i}@example.com`,
                customerMobile: '9876543210',
                quantity: 2,
                total: 1000,
                mode: 'offline',
                qrToken,
              },
              {
                name: 'Silk Masterclass',
                eventDate: '2026-11-01',
                startTime: '10:00',
                endTime: '13:00',
                mode: 'offline',
                venueAddress: 'Weaving Guild, Kanchipuram',
              }
            )
          })()
        )
      }

      await Promise.all(promises)
      assert(true, '100 concurrent QR generation & email renders resolved with zero failure')
    }
  )

  await runAdversarialTest(
    'Concurrency',
    'STRESS-CONC-03',
    '100 concurrent Admin Alert email dispatches with zero memory / lockup issue',
    async () => {
      const count = 100
      const promises: Promise<any>[] = []

      for (let i = 0; i < count; i++) {
        promises.push(
          sendAdminEventBookingAlert(
            'admin@threadsoftn.com',
            {
              bookingNumber: `ADM-CONC-${i}`,
              customerName: `VIP Guest ${i}`,
              customerEmail: `vip${i}@example.com`,
              customerMobile: `987654321${i % 10}`,
              quantity: (i % 5) + 1,
              total: i * 250,
              mode: i % 2 === 0 ? 'offline' : 'online',
              paymentStatus: i % 2 === 0 ? 'paid' : 'pending',
              razorpayPaymentId: i % 2 === 0 ? `pay_${i}` : null,
              createdAt: new Date().toISOString(),
            },
            {
              name: `Admin Alert Event ${i}`,
              eventDate: '2026-11-15',
              startTime: '09:00',
              endTime: '12:00',
              mode: i % 2 === 0 ? 'offline' : 'online',
            }
          )
        )
      }

      await Promise.all(promises)
      assert(true, '100 concurrent admin alert emails completed')
    }
  )

  // ============================================================================
  // SECTION 2: MALFORMED, NON-STANDARD, DIRTY & MALICIOUS PHONE NUMBERS
  // ============================================================================
  console.log('\n--- SECTION 2: Malformed, Non-Standard, Dirty & Malicious Phone Numbers ---')

  const dirtyPhoneCases = [
    { label: 'Alphabetical string', input: 'callmenow', expected: null },
    { label: 'Mixed alphanumeric', input: '9840abc123', expected: null },
    { label: 'Very short number (2 digits)', input: '91', expected: null },
    { label: 'Short number (5 digits)', input: '98765', expected: null },
    { label: '9 digits Indian without leading code', input: '987654321', expected: null },
    { label: 'Invalid starting digit 0 for 10-digit', input: '0123456789', expected: null },
    { label: 'Invalid starting digit 1 for 10-digit', input: '1234567890', expected: null },
    { label: 'Invalid starting digit 5 for 10-digit', input: '5555555555', expected: null },
    { label: 'SQL Injection: simple quote escape', input: "' OR '1'='1", expected: null },
    { label: 'SQL Injection: drop table statement', input: "'; DROP TABLE users; --", expected: null },
    { label: 'SQL Injection: union select', input: "' UNION SELECT * FROM events--", expected: null },
    { label: 'XSS: script tag injection', input: '<script>alert("XSS")</script>', expected: null },
    { label: 'XSS: img onerror payload', input: '<img src=x onerror=alert(1)>', expected: null },
    { label: 'Control chars and null bytes', input: '98765\0\r\n\t43210', expected: null },
    { label: 'Emoji overload', input: '🌾🌱🌿9876543210🌾🌿', expected: null },
    { label: 'Valid 10-digit Indian (6xxx)', input: '6381234567', expected: '916381234567' },
    { label: 'Valid 10-digit Indian (7xxx)', input: '7890123456', expected: '917890123456' },
    { label: 'Valid 10-digit Indian (8xxx)', input: '8901234567', expected: '918901234567' },
    { label: 'Valid 10-digit Indian (9xxx)', input: '9876543210', expected: '919876543210' },
    { label: 'Valid 0-prefixed 11-digit Indian', input: '09876543210', expected: '919876543210' },
    { label: 'Valid +91-prefixed formatted', input: '+91 (987) 654-3210', expected: '919876543210' },
    { label: 'Valid dots separated', input: '9876.543.210', expected: '919876543210' },
    { label: 'Valid already normalized 12-digit Indian', input: '919876543210', expected: '919876543210' },
    { label: 'International: US E.164 (11 digits)', input: '+12125550199', expected: '12125550199' },
    { label: 'International: UK E.164 (12 digits)', input: '+442079460919', expected: '442079460919' },
    { label: 'International: Singapore E.164 (10 digits)', input: '+6591234567', expected: '6591234567' },
    { label: 'International: Max length E.164 (15 digits)', input: '123456789012345', expected: '123456789012345' },
    { label: 'Overly long (16+ digits)', input: '1234567890123456789', expected: null },
  ]

  for (let idx = 0; idx < dirtyPhoneCases.length; idx++) {
    const testCase = dirtyPhoneCases[idx]
    const testId = `STRESS-MOB-${String(idx + 1).padStart(2, '0')}`
    await runAdversarialTest('PhoneValidation', testId, `Phone Normalization: ${testCase.label}`, () => {
      const result = normalizeMobileNumber(testCase.input)
      assertEqual(result, testCase.expected, `Input "${testCase.input}" should yield "${testCase.expected}"`)
    })
  }

  await runAdversarialTest(
    'PhoneValidation',
    'STRESS-MOB-REDOS',
    'ReDoS Resistance: 50,000 characters of spaces, hyphens, parentheses, and dots',
    () => {
      const maliciousLength = 50000
      const pattern = ' -().'.repeat(maliciousLength / 5)
      const dirtyInput = `+91${pattern}9876543210`
      const t0 = performance.now()
      const normalized = normalizeMobileNumber(dirtyInput)
      const elapsed = performance.now() - t0
      assertEqual(normalized, '919876543210', 'Extremely long formatted string must clean safely')
      assert(elapsed < 100, `ReDoS check should execute in < 100ms (took ${elapsed.toFixed(2)}ms)`)
    }
  )

  await runAdversarialTest(
    'PhoneValidation',
    'STRESS-MOB-DISPATCH',
    'Direct WhatsApp Dispatch with malicious inputs returns handled error without unhandled rejection',
    async () => {
      const maliciousNumbers = [
        "'; DROP TABLE bookings; --",
        '<script>alert("XSS")</script>',
        'invalid-short',
        '',
        null as any,
        undefined as any,
      ]

      for (const num of maliciousNumbers) {
        const res = await sendBookingConfirmationWhatsApp({
          customerName: 'Attack Vector User',
          customerEmail: 'attacker@example.com',
          customerMobile: num,
          bookingNumber: 'ATK-001',
          eventName: 'Hacking Conference',
          eventDate: '2026-10-10',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          mode: 'online',
          quantity: 1,
          total: 0,
        })
        assert(!res.success, `Dispatch should fail safely for input: "${num}"`)
        assert(Boolean(res.error), 'Error description must be provided')
      }
    }
  )

  // ============================================================================
  // SECTION 3: SIMULATING THIRD-PARTY NETWORK EXCEPTIONS / TIMEOUTS
  // ============================================================================
  console.log('\n--- SECTION 3: Simulating Third-Party Network Exceptions & Timeouts ---')

  const originalFetch = globalThis.fetch

  // Test Meta Provider: Network Connection Failure (ECONNREFUSED / fetch failed)
  await runAdversarialTest(
    'NetworkResilience',
    'STRESS-NET-01',
    'Meta Provider: Network connection failure (fetch TypeError / ECONNREFUSED) handled gracefully',
    async () => {
      const originalProvider = env.WHATSAPP_PROVIDER
      const originalToken = env.WHATSAPP_ACCESS_TOKEN
      const originalPhoneId = env.WHATSAPP_PHONE_NUMBER_ID

      try {
        ;(env as any).WHATSAPP_PROVIDER = 'meta'
        ;(env as any).WHATSAPP_ACCESS_TOKEN = 'mock_valid_token'
        ;(env as any).WHATSAPP_PHONE_NUMBER_ID = '100200300400'

        // Intercept global fetch to simulate network exception
        globalThis.fetch = async () => {
          throw new TypeError('fetch failed: connect ECONNREFUSED 157.240.22.35:443')
        }

        const res = await sendBookingConfirmationWhatsApp({
          customerName: 'Ramanathan',
          customerEmail: 'ram@example.com',
          customerMobile: '9876543210',
          bookingNumber: 'NET-ERR-01',
          eventName: 'Network Test Session',
          eventDate: '2026-10-20',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          mode: 'online',
          quantity: 1,
          total: 0,
        })

        assert(!res.success, 'Result should report success: false on network error')
        assertEqual(res.provider, 'meta', 'Provider should be meta')
        assertIncludes(res.error || '', 'fetch failed', 'Error message should capture network failure')
      } finally {
        ;(env as any).WHATSAPP_PROVIDER = originalProvider
        ;(env as any).WHATSAPP_ACCESS_TOKEN = originalToken
        ;(env as any).WHATSAPP_PHONE_NUMBER_ID = originalPhoneId
        globalThis.fetch = originalFetch
      }
    }
  )

  // Test Meta Provider: Request Timeout (AbortError)
  await runAdversarialTest(
    'NetworkResilience',
    'STRESS-NET-02',
    'Meta Provider: Request timeout (AbortError) handled gracefully',
    async () => {
      const originalProvider = env.WHATSAPP_PROVIDER
      const originalToken = env.WHATSAPP_ACCESS_TOKEN
      const originalPhoneId = env.WHATSAPP_PHONE_NUMBER_ID

      try {
        ;(env as any).WHATSAPP_PROVIDER = 'meta'
        ;(env as any).WHATSAPP_ACCESS_TOKEN = 'mock_valid_token'
        ;(env as any).WHATSAPP_PHONE_NUMBER_ID = '100200300400'

        globalThis.fetch = async () => {
          const err = new Error('The operation was aborted due to timeout')
          err.name = 'AbortError'
          throw err
        }

        const res = await sendBookingConfirmationWhatsApp({
          customerName: 'Subramanian',
          customerEmail: 'subbu@example.com',
          customerMobile: '9876543210',
          bookingNumber: 'NET-TIMEOUT-02',
          eventName: 'Timeout Test Session',
          eventDate: '2026-10-20',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          mode: 'online',
          quantity: 1,
          total: 0,
        })

        assert(!res.success, 'Result should report success: false on timeout')
        assertEqual(res.provider, 'meta', 'Provider should be meta')
        assertIncludes(res.error || '', 'aborted', 'Error message should capture timeout')
      } finally {
        ;(env as any).WHATSAPP_PROVIDER = originalProvider
        ;(env as any).WHATSAPP_ACCESS_TOKEN = originalToken
        ;(env as any).WHATSAPP_PHONE_NUMBER_ID = originalPhoneId
        globalThis.fetch = originalFetch
      }
    }
  )

  // Test Meta Provider: HTTP 500 Server Error & Corrupt Non-JSON Response
  await runAdversarialTest(
    'NetworkResilience',
    'STRESS-NET-03',
    'Meta Provider: HTTP 500 Server Error with non-JSON HTML body handled gracefully',
    async () => {
      const originalProvider = env.WHATSAPP_PROVIDER
      const originalToken = env.WHATSAPP_ACCESS_TOKEN
      const originalPhoneId = env.WHATSAPP_PHONE_NUMBER_ID

      try {
        ;(env as any).WHATSAPP_PROVIDER = 'meta'
        ;(env as any).WHATSAPP_ACCESS_TOKEN = 'mock_valid_token'
        ;(env as any).WHATSAPP_PHONE_NUMBER_ID = '100200300400'

        globalThis.fetch = async () => {
          return {
            ok: false,
            status: 500,
            json: async () => {
              throw new Error('Unexpected token < in JSON at position 0')
            },
          } as any
        }

        const res = await sendBookingConfirmationWhatsApp({
          customerName: 'Annamalai',
          customerEmail: 'annamalai@example.com',
          customerMobile: '9876543210',
          bookingNumber: 'NET-500-03',
          eventName: 'Server Error Session',
          eventDate: '2026-10-20',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          mode: 'online',
          quantity: 1,
          total: 0,
        })

        assert(!res.success, 'Result should report success: false on HTTP 500')
        assertEqual(res.provider, 'meta', 'Provider should be meta')
        assertIncludes(res.error || '', '500', 'Error message should record HTTP 500')
      } finally {
        ;(env as any).WHATSAPP_PROVIDER = originalProvider
        ;(env as any).WHATSAPP_ACCESS_TOKEN = originalToken
        ;(env as any).WHATSAPP_PHONE_NUMBER_ID = originalPhoneId
        globalThis.fetch = originalFetch
      }
    }
  )

  // Test Webhook / Aggregator Provider (Interakt / Aisensy): Network failure
  await runAdversarialTest(
    'NetworkResilience',
    'STRESS-NET-04',
    'Webhook / Aggregator Provider: API failure (HTTP 503 Service Unavailable) handled gracefully',
    async () => {
      const originalProvider = env.WHATSAPP_PROVIDER
      const originalUrl = env.WHATSAPP_API_URL
      const originalKey = env.WHATSAPP_API_KEY

      try {
        ;(env as any).WHATSAPP_PROVIDER = 'interakt'
        ;(env as any).WHATSAPP_API_URL = 'https://api.interakt.ai/v1/public/message/'
        ;(env as any).WHATSAPP_API_KEY = 'mock_interakt_key'

        globalThis.fetch = async () => {
          return {
            ok: false,
            status: 503,
            json: async () => ({ message: 'Service Temporarily Unavailable' }),
          } as any
        }

        const res = await sendBookingConfirmationWhatsApp({
          customerName: 'Venkatesh',
          customerEmail: 'venkat@example.com',
          customerMobile: '9876543210',
          bookingNumber: 'NET-WEBHOOK-04',
          eventName: 'Aggregator Failure Test',
          eventDate: '2026-10-20',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          mode: 'online',
          quantity: 1,
          total: 0,
        })

        assert(!res.success, 'Result should report success: false on 503')
        assertEqual(res.provider, 'interakt', 'Provider should be interakt')
        assertIncludes(res.error || '', '503', 'Error message should record HTTP 503')
      } finally {
        ;(env as any).WHATSAPP_PROVIDER = originalProvider
        ;(env as any).WHATSAPP_API_URL = originalUrl
        ;(env as any).WHATSAPP_API_KEY = originalKey
        globalThis.fetch = originalFetch
      }
    }
  )

  // Test Webhook Provider: Network DNS / Socket Disconnection
  await runAdversarialTest(
    'NetworkResilience',
    'STRESS-NET-05',
    'Webhook Provider: DNS failure / ENOTFOUND handled gracefully without crash',
    async () => {
      const originalProvider = env.WHATSAPP_PROVIDER
      const originalUrl = env.WHATSAPP_API_URL

      try {
        ;(env as any).WHATSAPP_PROVIDER = 'webhook'
        ;(env as any).WHATSAPP_API_URL = 'https://non-existent-domain-xyz-12345.com/webhook'

        globalThis.fetch = async () => {
          throw new Error('getaddrinfo ENOTFOUND non-existent-domain-xyz-12345.com')
        }

        const res = await sendBookingConfirmationWhatsApp({
          customerName: 'Geetha',
          customerEmail: 'geetha@example.com',
          customerMobile: '9876543210',
          bookingNumber: 'NET-DNS-05',
          eventName: 'DNS Failure Test',
          eventDate: '2026-10-20',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          mode: 'offline',
          quantity: 1,
          total: 500,
        })

        assert(!res.success, 'Result should report success: false on ENOTFOUND')
        assertEqual(res.provider, 'webhook', 'Provider should be webhook')
        assertIncludes(res.error || '', 'ENOTFOUND', 'Error message should record ENOTFOUND')
      } finally {
        ;(env as any).WHATSAPP_PROVIDER = originalProvider
        ;(env as any).WHATSAPP_API_URL = originalUrl
        globalThis.fetch = originalFetch
      }
    }
  )

  // ============================================================================
  // SECTION 4: NULL / UNDEFINED / FUZZED PAYLOAD FIELDS
  // ============================================================================
  console.log('\n--- SECTION 4: Null / Undefined / Fuzzed Payload Fields ---')

  await runAdversarialTest(
    'PayloadFuzzing',
    'STRESS-PAY-01',
    'WhatsApp Formatter: Completely empty object with null/undefined values everywhere',
    () => {
      const emptyPayload: EventBookingNotificationData = {
        customerName: null as any,
        customerEmail: undefined as any,
        customerMobile: null as any,
        bookingNumber: undefined as any,
        eventName: null as any,
        eventDate: undefined as any,
        startTime: null as any,
        endTime: undefined as any,
        mode: null as any,
        quantity: null as any,
        total: undefined as any,
        venueAddress: null,
        zoomLink: undefined,
        companyName: undefined,
        supportPhone: null as any,
        supportEmail: undefined,
      }

      const msg = formatBookingWhatsAppMessage(emptyPayload)
      assert(typeof msg === 'string', 'Message must be a string')
      assert(msg.length > 50, 'Message must render template fallbacks without crashing')
      assertIncludes(msg, 'Valued Guest', 'Should fallback to default customer name')
      assertIncludes(msg, 'Soil Goddess', 'Should fallback to default company name')
      assertIncludes(msg, 'FREE', 'Undefined total should fallback to FREE')
    }
  )

  await runAdversarialTest(
    'PayloadFuzzing',
    'STRESS-PAY-02',
    'Customer Email: Null/undefined nested properties and corrupted fields',
    async () => {
      await sendEventBookingConfirmationEmail(
        'test@example.com',
        {
          bookingNumber: null,
          customerName: undefined,
          quantity: null,
          total: undefined,
          mode: 'unknown_mode',
          qrToken: null,
          zoomLink: undefined,
        } as any,
        {
          name: null,
          title: undefined,
          eventDate: null,
          startTime: undefined,
          endTime: null,
          venueAddress: undefined,
        } as any,
        null as any
      )
      assert(true, 'Customer email gracefully tolerated completely null/corrupted payload')
    }
  )

  await runAdversarialTest(
    'PayloadFuzzing',
    'STRESS-PAY-03',
    'Admin Alert Email: Null/undefined nested properties and corrupted fields',
    async () => {
      await sendAdminEventBookingAlert(
        '',
        {
          bookingNumber: null,
          customerName: undefined,
          customerEmail: null,
          customerMobile: undefined,
          quantity: null,
          total: undefined,
          mode: 'unknown_mode',
          paymentStatus: null,
          razorpayPaymentId: undefined,
          createdAt: 'invalid-date-string',
        } as any,
        {
          name: null,
          eventDate: undefined,
          startTime: null,
          endTime: undefined,
        } as any,
        undefined
      )
      assert(true, 'Admin alert email gracefully tolerated completely null/corrupted payload')
    }
  )

  await runAdversarialTest(
    'PayloadFuzzing',
    'STRESS-PAY-04',
    'Boundary Values: Extreme negative quantities, NaN, and Infinity numbers',
    () => {
      const weirdPayload: EventBookingNotificationData = {
        customerName: 'Weird Numbers User',
        customerEmail: 'weird@example.com',
        customerMobile: '9876543210',
        bookingNumber: 'WEIRD-01',
        eventName: 'Weird Numbers Masterclass',
        eventDate: '2026-10-30',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        mode: 'online',
        quantity: -5,
        total: NaN as any,
      }

      const msg = formatBookingWhatsAppMessage(weirdPayload)
      assert(typeof msg === 'string', 'Message rendered')
      assertIncludes(msg, 'Weird Numbers Masterclass', 'Event name rendered')
    }
  )

  await runAdversarialTest(
    'PayloadFuzzing',
    'STRESS-PAY-05',
    'Boundary Strings: 10,000 character event title and venue address text',
    () => {
      const hugeString = 'Soil Goddess Sustainable Handloom '.repeat(300) // ~10,500 chars
      const payload: EventBookingNotificationData = {
        customerName: 'Long Text User',
        customerEmail: 'long@example.com',
        customerMobile: '9876543210',
        bookingNumber: 'LONG-01',
        eventName: hugeString,
        eventDate: '2026-10-31',
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        mode: 'offline',
        quantity: 1,
        total: 100,
        venueAddress: hugeString,
      }

      const msg = formatBookingWhatsAppMessage(payload)
      assert(msg.length > 10000, 'Massive text successfully formatted without truncation crash')
    }
  )

  // ============================================================================
  // SECTION 5: ASYNC NON-BLOCKING DETACHED DISPATCH ISOLATION
  // ============================================================================
  console.log('\n--- SECTION 5: Async Non-Blocking Detached Dispatch Simulation ---')

  await runAdversarialTest(
    'AsyncDetachment',
    'STRESS-ASYNC-01',
    'Simulated controller setImmediate dispatch isolates errors from synchronous execution',
    async () => {
      let synchronousReturned = false
      let detachedResolved = false

      const simulateControllerFlow = async () => {
        // Fast sync/await DB logic simulation
        const bookingId = 999
        synchronousReturned = true

        // Detached async notification dispatch matching events.controller.ts
        setImmediate(async () => {
          try {
            await Promise.allSettled([
              sendBookingConfirmationWhatsApp({
                customerName: 'Async User',
                customerEmail: 'async@example.com',
                customerMobile: '9876543210',
                bookingNumber: 'ASYNC-001',
                eventName: 'Async Test',
                eventDate: '2026-11-01',
                startTime: '10:00 AM',
                endTime: '11:00 AM',
                mode: 'online',
                quantity: 1,
                total: 0,
              }),
              sendEventBookingConfirmationEmail('async@example.com', { bookingNumber: 'ASYNC-001' }, {}),
              sendAdminEventBookingAlert('admin@threadsoftn.com', { bookingNumber: 'ASYNC-001' }, {}),
            ])
            detachedResolved = true
          } catch (e) {
            console.error('Detached pipeline error:', e)
          }
        })

        return { success: true, bookingId }
      }

      const response = await simulateControllerFlow()
      assertEqual(synchronousReturned, true, 'Controller returned immediately')
      assertEqual(response.success, true, 'Response was successful')

      // Wait for setImmediate tick to complete
      await new Promise((resolve) => setTimeout(resolve, 50))
      assertEqual(detachedResolved, true, 'Detached background notification promise completed')
    }
  )

  // ============================================================================
  // SUMMARY REPORT
  // ============================================================================
  console.log('\n================================================================================')
  console.log('  ADVERSARIAL STRESS TEST EXECUTION SUMMARY')
  console.log('================================================================================')

  const total = stressResults.length
  const passed = stressResults.filter((r) => r.passed).length
  const failed = stressResults.filter((r) => !r.passed).length
  const passRate = Math.round((passed / total) * 100)

  console.log(`Total Stress Tests: ${total}`)
  console.log(`Passed:             ${passed}`)
  console.log(`Failed:             ${failed}`)
  console.log(`Pass Rate:          ${passRate}%`)

  const sectionSummary: Record<string, { passed: number; total: number }> = {}
  for (const r of stressResults) {
    if (!sectionSummary[r.section]) sectionSummary[r.section] = { passed: 0, total: 0 }
    sectionSummary[r.section].total += 1
    if (r.passed) sectionSummary[r.section].passed += 1
  }

  console.log('\nSection Breakdown:')
  for (const [section, stats] of Object.entries(sectionSummary)) {
    console.log(`  - ${section}: ${stats.passed}/${stats.total} passed (${Math.round((stats.passed / stats.total) * 100)}%)`)
  }

  if (failed > 0) {
    console.error('\nAdversarial Test Failures:')
    for (const r of stressResults.filter((r) => !r.passed)) {
      console.error(`  - [${r.id}] ${r.name}: ${r.error}`)
    }
    process.exit(1)
  } else {
    console.log('\n>>> ALL ADVERSARIAL STRESS TESTS PASSED (100% PASS RATE) <<<\n')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Fatal Adversarial Test Suite Error:', err)
  process.exit(1)
})
