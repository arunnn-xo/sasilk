import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock, Download, FileText, Loader2, Mail, Navigation, Package, PackageX, RefreshCcw, RotateCcw, ShoppingBag, Truck, XCircle } from 'lucide-react'
import { apiBaseUrl, generateInvoice, getInvoice, getOrderDetail, transitionOrderStatus, resolveImageUrl, apiFetch, downloadBlob, sendRecoveryEmail } from '../services/api'
import { displayValue } from './ResourceShared'

const pipelineStages = [
  { key: 'pending', label: 'Pending', Icon: Clock },
  { key: 'confirmed', label: 'Confirmed', Icon: ClipboardCheck },
  { key: 'packing', label: 'Packing', Icon: Package },
  { key: 'dispatched', label: 'Dispatched', Icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', Icon: Navigation },
  { key: 'delivered', label: 'Delivered', Icon: CheckCircle2 },
  { key: 'rto', label: 'RTO', Icon: RotateCcw },
  { key: 'returned', label: 'Returned', Icon: PackageX },
]

const nextStageMap: Record<string, { status: string; label: string }> = {
  pending_payment: { status: 'pending', label: 'Confirm COD' },
  pending: { status: 'confirmed', label: 'Confirm Order' },
  confirmed: { status: 'packing', label: 'Move to Packing' },
  packing: { status: 'dispatched', label: 'Dispatch Order' },
  dispatched: { status: 'out_for_delivery', label: 'Assign Delivery Agent' },
  out_for_delivery: { status: 'delivered', label: 'Mark as Delivered' },
}

function formatDate(val: unknown): string {
  if (!val) return '–'
  const d = new Date(String(val))
  if (isNaN(d.getTime())) return String(val)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const backStage = searchParams.get('from') || 'pending'
  const queryClient = useQueryClient()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentPhone, setAgentPhone] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceGenerating, setInvoiceGenerating] = useState(false)
  const [invoiceRegenerating, setInvoiceRegenerating] = useState(false)
  const [recoverySending, setRecoverySending] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => getOrderDetail(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (!id) return
    setInvoiceLoading(true)
    getInvoice(id)
      .then(res => setInvoice(res.item as Record<string, unknown> | null))
      .catch(() => setInvoice(null))
      .finally(() => setInvoiceLoading(false))
  }, [id, data]) // re-fetch when order data changes

  async function handleGenerateInvoice() {
    if (!id) return
    setInvoiceGenerating(true)
    try {
      const res = await generateInvoice(id)
      setInvoice(res.item as Record<string, unknown>)
      const inv = res.item as Record<string, unknown> | undefined
      downloadBlob(`/admin/orders/${id}/invoice/pdf`, `${String(inv?.invoiceNumber || `invoice-${id}`)}.pdf`).catch(() => {})
    } catch (e: any) {
      setError(e.message || 'Failed to generate invoice')
      setTimeout(() => setError(''), 6000)
    } finally {
      setInvoiceGenerating(false)
    }
  }

  const order = data?.item as Record<string, unknown> | undefined
  const items = (order?.items as Array<Record<string, unknown>>) || []
  const customer = order?.Customer as Record<string, unknown> | undefined
  const shippingAddress = order?.shippingAddress as Record<string, unknown> | null | undefined
  const currentStatus = (order?.status as string) || ''
  const paymentStatus = (order?.paymentStatus as string) || ''
  const isTerminal = currentStatus === 'delivered' || currentStatus === 'cancelled' || currentStatus === 'rto' || currentStatus === 'returned'
  const nextAction = nextStageMap[currentStatus]
  const needsAgent = currentStatus === 'dispatched'

  const transitionMut = useMutation({
    mutationFn: (payload: { nextStatus: string; deliveryAgentName?: string; deliveryAgentPhone?: string; trackingNumber?: string; cancellationReason?: string }) =>
      transitionOrderStatus(id!, payload.nextStatus, payload),
    onSuccess: () => {
      setShowConfirm(false)
      setShowCancelConfirm(false)
      setAgentName('')
      setAgentPhone('')
      setTrackingNumber('')
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['order-pipeline-counts'] })
      queryClient.invalidateQueries({ queryKey: ['orders-pipeline'] })
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed.')
      setTimeout(() => setError(''), 6000)
    },
  })

  function handleAdvance() {
    if (!nextAction) return
    transitionMut.mutate({
      nextStatus: nextAction.status,
      deliveryAgentName: agentName.trim() || undefined,
      deliveryAgentPhone: agentPhone.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Loading order details…</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--burgundy-soft)]">
          <ShoppingBag className="h-7 w-7 text-[var(--burgundy)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--muted)]">Order not found.</p>
        <button type="button" onClick={() => navigate(`/orders/${backStage}`)}
          className="inline-flex items-center gap-2 rounded border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => navigate(`/orders/${backStage}`)}
          className="inline-flex items-center gap-2 rounded border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]">
          <ArrowLeft className="h-4 w-4" /> Orders
        </button>
        <span className="text-[var(--muted)]">›</span>
        <span className="text-sm font-semibold text-[var(--text)]">
          {order.status === 'pending_payment' ? 'Abandoned Checkout' : String(order.orderNumber || `#${order.id}`)}
        </span>
      </div>

      {error ? (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>
      ) : null}
      {successMsg ? (
        <div className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-300">{successMsg}</div>
      ) : null}

      <section className="admin-card rounded-lg p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--burgundy)]">Order Details</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--gold)] md:text-4xl">
              {order.status === 'pending_payment' ? 'Not assigned yet' : String(order.orderNumber || '')}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <a
              href={`${apiBaseUrl}/admin/orders/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] transition-colors hover:bg-[var(--panel-strong)]"
              title="Download PDF"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </a>
            <span className="admin-badge text-sm px-3 py-1.5">₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}</span>
            <span className={`admin-badge px-3 py-1.5 text-sm ${paymentStatus === 'paid' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
              {displayValue(paymentStatus)}
            </span>
            <span className={`admin-badge px-3 py-1.5 text-sm ${currentStatus === 'delivered' ? 'admin-badge-success' : currentStatus === 'cancelled' ? 'admin-badge-muted' : 'admin-badge-info'}`}>
              {displayValue(currentStatus)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="admin-card rounded-lg p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--burgundy)]">Customer & Shipping</h2>
            <span className={`admin-badge ${customer ? 'admin-badge-success' : 'admin-badge-muted'}`}>
              {customer ? 'Customer' : 'Guest'}
            </span>
          </div>
          <div className="space-y-3">
            {customer ? (
              <>
                <div><p className="text-[11px] font-semibold text-[var(--muted)]">Name</p><p className="font-semibold text-[var(--text)]">{String(customer.name || '')}</p></div>
                <div><p className="text-[11px] font-semibold text-[var(--muted)]">Email</p><p className="text-sm text-[var(--text)]">{String(customer.email || order.customerEmail || '')}</p></div>
                <div><p className="text-[11px] font-semibold text-[var(--muted)]">Phone</p><p className="text-sm text-[var(--text)]">{String(customer.mobile || order.customerMobile || '')}</p></div>
              </>
            ) : (
              <div><p className="text-[11px] font-semibold text-[var(--muted)]">Email</p><p className="text-sm text-[var(--text)]">{String(order.customerEmail || 'Guest')}</p></div>
            )}
            {shippingAddress ? (
              <div className="mt-4 border-t border-[var(--line)] pt-3">
                <p className="text-[11px] font-semibold text-[var(--muted)]">Shipping Address</p>
                <p className="mt-1 text-sm text-[var(--text)]">
                  {[shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(' ')}<br />
                  {String(shippingAddress.address || '')}<br />
                  {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ')}
                  {shippingAddress.pincode ? ` — ${shippingAddress.pincode}` : ''}<br />
                  Phone: {String(shippingAddress.phone || '')}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="admin-card rounded-lg p-5 lg:col-span-2">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--burgundy)]">Order Items ({items.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <th className="pb-2 pr-2">#</th>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">HSN/SAC</th>
                  <th className="pb-2 pr-3">Variant</th>
                  <th className="pb-2 pr-3 text-right">Qty</th>
                  <th className="pb-2 pr-3 text-right">Rate</th>
                  <th className="pb-2 pr-3 text-right">Taxable</th>
                  <th className="pb-2 pr-3 text-right">GST%</th>
                  <th className="pb-2 pr-3 text-right">GST Amt</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const gstRate = Number(item.gstRate ?? item.taxRate ?? 5)
                  const hsnCode = String(item.hsnCode || item.hsn || '5804')
                  const qty = Number(item.quantity || 0)
                  const unitPrice = Number(item.unitPrice || 0)
                  const lineTotal = Number(item.total || 0)
                  const taxableValue = parseFloat((lineTotal * 100 / (100 + gstRate)).toFixed(2))
                  const gstAmount = parseFloat((lineTotal - taxableValue).toFixed(2))

                  return (
                    <tr key={idx} className="border-b border-[var(--line)] last:border-0">
                      <td className="py-3 pr-2 text-xs text-[var(--muted)]">{idx + 1}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-[var(--line)] bg-[var(--panel-strong)]">
                            <img src={resolveImageUrl(item.imageUrl) || '/placeholder.png'} alt={String(item.name || '')}
                              className="h-full w-full object-contain"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text)]">{String(item.name || '')}</p>
                            {item.sku ? <p className="text-[11px] text-[var(--muted)]">SKU: {String(item.sku)}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-xs text-[var(--muted)]">{hsnCode}</td>
                      <td className="py-3 pr-3 text-xs text-[var(--muted)]">
                        {[String(item.variantLabel || ''), String(item.color || ''), String(item.size || '')].filter(Boolean).join(' / ') || '–'}
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold">{qty}</td>
                      <td className="py-3 pr-3 text-right">₹{unitPrice.toLocaleString('en-IN')}</td>
                      <td className="py-3 pr-3 text-right text-[var(--muted)]">₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 pr-3 text-right text-[var(--muted)]">{gstRate}%</td>
                      <td className="py-3 pr-3 text-right text-[var(--muted)]">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 text-right font-bold">₹{lineTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                {(() => {
                  const slabTotals: Record<number, { cgst: number; sgst: number; taxable: number }> = {}
                  let totalTaxable = 0
                  let totalGstAmt = 0

                  items.forEach((item: any) => {
                    const gstRate = Number(item.gstRate ?? item.taxRate ?? 5)
                    const lineTotal = Number(item.total || 0)
                    const taxableValue = parseFloat((lineTotal * 100 / (100 + gstRate)).toFixed(2))
                    const gstAmount = parseFloat((lineTotal - taxableValue).toFixed(2))

                    totalTaxable += taxableValue
                    totalGstAmt += gstAmount

                    if (!slabTotals[gstRate]) slabTotals[gstRate] = { cgst: 0, sgst: 0, taxable: 0 }
                    slabTotals[gstRate].cgst += gstAmount / 2
                    slabTotals[gstRate].sgst += gstAmount / 2
                    slabTotals[gstRate].taxable += taxableValue
                  })

                  const sortedSlabs = Object.keys(slabTotals).map(Number).sort((a, b) => a - b)

                  return (
                    <>
                      <tr className="border-t border-[var(--line)]">
                        <td colSpan={7} />
                        <td colSpan={2} className="pt-3 pr-4 text-right text-xs font-semibold text-[var(--muted)]">Subtotal (incl. GST)</td>
                        <td className="pt-3 text-right font-semibold">₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</td>
                      </tr>

                      {totalGstAmt > 0 && (
                        <tr>
                          <td colSpan={7} />
                          <td colSpan={2} className="pr-4 text-right text-xs font-semibold text-[var(--muted)]">Taxable Value</td>
                          <td className="text-right font-semibold text-[var(--muted)]">₹{totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}

                      {sortedSlabs.map(slab => {
                        const t = slabTotals[slab]
                        const gstLineTotal = t.cgst + t.sgst
                        return (
                          <tr key={slab}>
                            <td colSpan={7} />
                            <td colSpan={2} className="pr-4 text-right text-xs font-semibold text-[var(--muted)]">GST ({slab}%)</td>
                            <td className="text-right font-semibold text-[var(--muted)]">₹{gstLineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        )
                      })}

                      {order && Number(order.discount || 0) > 0 ? (
                        <tr>
                          <td colSpan={7} />
                          <td colSpan={2} className="pr-4 text-right text-xs font-semibold text-[var(--muted)]">
                            Discount {order.couponCode ? `(${order.couponCode})` : ''}
                          </td>
                          <td className="text-right font-semibold text-red-500">-₹{Number(order.discount).toLocaleString('en-IN')}</td>
                        </tr>
                      ) : null}

                      <tr>
                        <td colSpan={7} />
                        <td colSpan={2} className="pr-4 text-right text-xs font-semibold text-[var(--muted)]">Shipping</td>
                        <td className="text-right font-semibold">{Number(order.shippingTotal || 0) === 0 ? 'Free' : `₹${Number(order.shippingTotal).toLocaleString('en-IN')}`}</td>
                      </tr>

                      <tr className="border-t border-[var(--line)]">
                        <td colSpan={7} />
                        <td colSpan={2} className="py-2 pr-4 text-right text-sm font-bold text-[var(--burgundy)]">Grand Total</td>
                        <td className="py-2 text-right text-sm font-bold text-[var(--burgundy)]">₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    </>
                  )
                })()}
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      {/* Recovery Email — Abandoned Checkouts Only */}
      {currentStatus === 'pending_payment' && (
        <section className="admin-card rounded-lg p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--burgundy)]">Cart Recovery Email</h2>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--muted)]">
                Send a recovery email to remind the customer to complete their checkout.
              </p>
              {(() => {
                const meta = (order.metadata as Record<string, unknown>) || {}
                const count = Number(meta.recoveryEmailCount || 0)
                return count > 0 ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Sent {count}/3 times{meta.recoveryEmailLastSent ? ` — last: ${formatDate(meta.recoveryEmailLastSent)}` : ''}
                  </p>
                ) : null
              })()}
            </div>
            <button
              type="button"
              onClick={async () => {
                setRecoverySending(true)
                try {
                  const res = await sendRecoveryEmail(id!)
                  setSuccessMsg(res.message || 'Recovery email sent!')
                  setTimeout(() => setSuccessMsg(''), 4000)
                  queryClient.invalidateQueries({ queryKey: ['order-detail', id] })
                } catch (e: any) {
                  setError(e.message || 'Failed to send recovery email')
                  setTimeout(() => setError(''), 6000)
                } finally {
                  setRecoverySending(false)
                }
              }}
              disabled={recoverySending || Number(((order.metadata as Record<string, unknown>) || {}).recoveryEmailCount || 0) >= 3}
              className="inline-flex items-center gap-1.5 rounded bg-[var(--gold)] px-4 py-2 text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {recoverySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
              {recoverySending ? 'Sending...' : 'Send Recovery Email'}
            </button>
          </div>
        </section>
      )}

      {/* Invoice */}
      {currentStatus !== 'pending_payment' && (
        <section className="admin-card rounded-lg p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--burgundy)]">Invoice</h2>
          {invoiceLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--gold)]" />
              <p className="text-sm text-[var(--muted)]">Loading invoice...</p>
            </div>
          ) : invoice ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text)]">
                  {String(invoice.invoiceNumber || '')}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Date: {String(invoice.invoiceDate || '')} &middot; Status:{' '}
                  <span className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'cancelled' ? 'text-red-500' : 'text-amber-600'}`}>
                    {invoice.status === 'unpaid' ? 'PENDING' : String(invoice.status || '').toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={async () => {
                  setInvoiceRegenerating(true)
                  try {
                    const res = await apiFetch<{ item: Record<string, unknown> }>(`/admin/orders/${id}/invoice/regenerate`, { method: 'PUT' })
                    setInvoice(res.item)
                  } catch (e: any) {
                    setError(e.message || 'Failed to regenerate invoice')
                    setTimeout(() => setError(''), 6000)
                  } finally {
                    setInvoiceRegenerating(false)
                  }
                }} disabled={invoiceRegenerating}
                  className="inline-flex items-center gap-1.5 rounded border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] transition-colors hover:bg-[var(--panel-strong)] disabled:opacity-50"
                >
                  {invoiceRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => downloadBlob(`/admin/orders/${id}/invoice/pdf`, `${invoice?.invoiceNumber || `invoice-${id}`}.pdf`).catch(() => {})}
                  className="inline-flex items-center gap-1.5 rounded border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--gold)] transition-colors hover:bg-[var(--burgundy-soft)]"
                >
                  <Download className="h-3.5 w-3.5" /> Download Invoice
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">No invoice generated yet.</p>
              <button
                type="button"
                onClick={handleGenerateInvoice}
                disabled={invoiceGenerating}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--gold)] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {invoiceGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                {invoiceGenerating ? 'Generating...' : 'Generate Invoice'}
              </button>
            </div>
          )}
        </section>
      )}

      {currentStatus !== 'pending_payment' && (
        <section className="admin-card rounded-lg p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--burgundy)]">Delivery & Tracking</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-[11px] font-semibold text-[var(--muted)]">Delivery Agent</p>
              <p className="font-semibold text-[var(--text)]">{order.deliveryAgentName ? String(order.deliveryAgentName) : '–'}</p></div>
            <div><p className="text-[11px] font-semibold text-[var(--muted)]">Agent Phone</p>
              <p className="text-sm text-[var(--text)]">{order.deliveryAgentPhone ? String(order.deliveryAgentPhone) : '–'}</p></div>
            <div><p className="text-[11px] font-semibold text-[var(--muted)]">Tracking Number</p>
              <p className="font-mono text-sm text-[var(--text)]">{order.trackingNumber ? String(order.trackingNumber) : '–'}</p></div>
            <div><p className="text-[11px] font-semibold text-[var(--muted)]">Dispatched At</p>
              <p className="text-sm text-[var(--text)]">{formatDate(order.dispatchedAt)}</p></div>
            <div><p className="text-[11px] font-semibold text-[var(--muted)]">Delivered At</p>
              <p className="text-sm text-[var(--text)]">{formatDate(order.deliveredAt)}</p></div>
            {(order.metadata as any)?.shiprocketOrderId ? (
              <>
                <div><p className="text-[11px] font-semibold text-[var(--muted)]">Shiprocket Order ID</p>
                  <p className="font-mono text-sm text-[var(--text)]">{(order.metadata as any).shiprocketOrderId}</p></div>
                <div><p className="text-[11px] font-semibold text-[var(--muted)]">Shiprocket Shipment ID</p>
                  <p className="font-mono text-sm text-[var(--text)]">{(order.metadata as any).shiprocketShipmentId}</p></div>
                {(order.metadata as any).shiprocketCourierName ? (
                  <div><p className="text-[11px] font-semibold text-[var(--muted)]">Courier</p>
                    <p className="text-sm text-[var(--text)]">{(order.metadata as any).shiprocketCourierName}</p></div>
                ) : null}
                {(order.metadata as any).shiprocketAwbCode ? (
                  <div><p className="text-[11px] font-semibold text-[var(--muted)]">AWB Code</p>
                    <p className="font-mono text-sm font-semibold text-[var(--text)]">{(order.metadata as any).shiprocketAwbCode}</p></div>
                ) : null}
                {(order.metadata as any).shiprocketPickupStatus ? (
                  <div><p className="text-[11px] font-semibold text-[var(--muted)]">Pickup</p>
                    <p className="text-sm text-[var(--text)]">
                      {(order.metadata as any).shiprocketPickupStatus}
                      {(order.metadata as any).shiprocketPickupDate ? ` — ${(order.metadata as any).shiprocketPickupDate}` : ''}
                    </p></div>
                ) : null}
                {(order.metadata as any).shiprocketLabelUrl ? (
                  <div className="sm:col-span-3">
                    <a
                      href={(order.metadata as any).shiprocketLabelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Shipping Label
                    </a>
                  </div>
                ) : null}
              </>
            ) : (order.metadata as any)?.shiprocketError ? (
              <div className="sm:col-span-3">
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  Shiprocket Error: {(order.metadata as any).shiprocketError}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {currentStatus !== 'pending_payment' && (
        <section className="admin-card rounded-lg p-6">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--burgundy)]">Status Timeline</h2>
          
          {/* Horizontal timeline for large screens */}
          <div className="hidden lg:flex items-start justify-between relative px-4 py-4">
            {/* Background Connecting Line */}
            <div className="absolute top-[18px] left-[6%] right-[6%] h-[3px] bg-[var(--line)] -z-10" />
            
            {pipelineStages.map((stage, idx) => {
              const stageIdx = pipelineStages.findIndex(s => s.key === currentStatus)
              const isActive = idx <= stageIdx
              const isCurrent = idx === stageIdx
              
              return (
                <div key={stage.key} className="flex flex-col items-center flex-1 relative group">
                  {/* Connecting Line Progress (only for active steps) */}
                  {idx > 0 && idx <= stageIdx && (
                    <div 
                      className="absolute top-[18px] right-[50%] left-[-50%] h-[3px] bg-green-500 -z-10"
                    />
                  )}
                  
                  {/* Node Circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                    isCurrent ? 'bg-[var(--burgundy)] text-white ring-4 ring-[var(--burgundy-soft)] scale-110'
                      : isActive ? 'bg-green-600 text-white shadow-md'
                      : 'bg-[var(--panel-strong)] text-[var(--muted)] border border-[var(--line)]'
                  }`}>
                    <stage.Icon className="h-4.5 w-4.5" />
                  </div>
                  
                  {/* Text Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-xs font-bold transition-colors ${
                      isCurrent ? 'text-[var(--burgundy)]'
                        : isActive ? 'text-green-700'
                        : 'text-[var(--muted)]'
                    }`}>
                      {stage.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vertical timeline for mobile screens */}
          <div className="lg:hidden flex flex-col gap-6 pl-4 py-2 relative">
            {/* Vertical Connecting Line */}
            <div className="absolute left-[18px] top-4 bottom-4 w-[3px] bg-[var(--line)]" />
            
            {pipelineStages.map((stage, idx) => {
              const stageIdx = pipelineStages.findIndex(s => s.key === currentStatus)
              const isActive = idx <= stageIdx
              const isCurrent = idx === stageIdx
              
              return (
                <div key={stage.key} className="flex items-center gap-4 relative">
                  {/* Vertical Connecting Line Progress (active steps) */}
                  {idx > 0 && idx <= stageIdx && (
                    <div 
                      className="absolute left-[18px] top-[-24px] h-[24px] w-[3px] bg-green-500"
                    />
                  )}
                  
                  {/* Node Circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                    isCurrent ? 'bg-[var(--burgundy)] text-white ring-4 ring-[var(--burgundy-soft)] scale-105'
                      : isActive ? 'bg-green-600 text-white'
                      : 'bg-[var(--panel-strong)] text-[var(--muted)] border border-[var(--line)]'
                  }`}>
                    <stage.Icon className="h-4.5 w-4.5" />
                  </div>
                  
                  {/* Text Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${
                      isCurrent ? 'text-[var(--burgundy)]'
                        : isActive ? 'text-green-700'
                        : 'text-[var(--muted)]'
                    }`}>
                      {stage.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Actions */}
      {!isTerminal && currentStatus !== 'pending_payment' ? (
        <section className="admin-card rounded-lg p-5">
          {needsAgent && !showConfirm ? (
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Agent Name</label>
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Auto-filled on dispatch" className="admin-input w-full rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Agent Phone</label>
                <input type="text" value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="Auto-filled on dispatch" className="admin-input w-full rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Tracking Number</label>
                <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Auto-filled from AWB" className="admin-input w-full rounded px-3 py-2 text-sm" />
              </div>
            </div>
          ) : null}

          <div className="flex gap-3">
            {nextAction ? (
              <button type="button"
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 rounded bg-[var(--gold)] px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:opacity-90">
                <Check className="h-4 w-4" /> {nextAction.label}
              </button>
            ) : null}
            <button type="button" onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center gap-2 rounded border border-red-300 px-6 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50">
              <XCircle className="h-4 w-4" /> Cancel Order
            </button>
          </div>

          {showConfirm && nextAction ? (
            <div className="mt-4 flex items-center gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 dark:bg-amber-950/20">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Move to "{nextAction.label.replace('Move to ', '').replace('Mark as ', '').replace('Assign Delivery Agent', 'Out for Delivery')}"?
              </p>
              <button type="button" onClick={handleAdvance} disabled={transitionMut.isPending}
                className="inline-flex items-center gap-1.5 rounded bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-70">
                {transitionMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Confirm
              </button>
              <button type="button" onClick={() => setShowConfirm(false)} disabled={transitionMut.isPending}
                className="rounded border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:bg-[var(--panel-strong)] disabled:opacity-50">Cancel</button>
            </div>
          ) : null}
        </section>
      ) : null}

      {currentStatus === 'cancelled' ? (
        <section className="admin-card rounded-lg p-5">
          <div className="flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 dark:bg-red-950/20">
            <span className="text-lg text-red-600"><XCircle className="h-5 w-5" /></span>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">This order has been cancelled.</p>
          </div>
        </section>
      ) : null}

      {showCancelConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--burgundy)]">Cancel Order</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Are you sure you want to cancel order <strong>{String(order.orderNumber || '')}</strong>?
                </p>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Reason (optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Why is this order being cancelled?"
                    rows={3}
                    className="admin-input w-full rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowCancelConfirm(false); setCancelReason('') }} disabled={transitionMut.isPending}
                className="rounded border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--burgundy)] hover:bg-[var(--gold-soft)] disabled:opacity-50">No</button>
              <button type="button" onClick={() => transitionMut.mutate({ nextStatus: 'cancelled', cancellationReason: cancelReason.trim() || undefined })} disabled={transitionMut.isPending}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                {transitionMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {transitionMut.isPending ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
