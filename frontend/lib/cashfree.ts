export type CashfreeInstance = {
  checkout: (options: { paymentSessionId: string; redirectTarget?: string }) => Promise<{ redirect?: string; order?: { order_status?: string; order_id?: string; order_amount?: number } }>
}

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => CashfreeInstance
  }
}

export function getCashfreeMode(): 'sandbox' | 'production' {
  return process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? 'production' : 'sandbox'
}

export function loadCashfreeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve()

    const existing = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Cashfree SDK failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.async = true

    const timeout = setTimeout(() => reject(new Error('Cashfree SDK load timed out')), 15000)
    script.onload = () => { clearTimeout(timeout); resolve() }
    script.onerror = () => { clearTimeout(timeout); reject(new Error('Failed to load Cashfree SDK')) }

    document.body.appendChild(script)
  })
}

export async function openCashfreeCheckout(paymentSessionId: string): Promise<void> {
  if (!paymentSessionId) throw new Error('Missing payment session ID')
  await loadCashfreeScript()
  const cashfree = window.Cashfree!({ mode: getCashfreeMode() })
  const result = await cashfree.checkout({ paymentSessionId, redirectTarget: '_modal' })
  if (result?.redirect && result.redirect !== '/') {
    window.location.href = result.redirect
    return
  }
}
