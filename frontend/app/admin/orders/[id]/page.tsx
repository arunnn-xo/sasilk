'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchOrderDetail, transitionOrder, type OrderData } from '@/lib/services/admin.service'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, ChevronRight } from 'lucide-react'

const stageLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  packing: 'Packing',
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const nextActions: Record<string, { label: string; nextStatus: string; color: string }[]> = {
  confirmed: [
    { label: 'Move to Packing', nextStatus: 'packing', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Cancel Order', nextStatus: 'cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
  packing: [
    { label: 'Mark Dispatched', nextStatus: 'dispatched', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Cancel Order', nextStatus: 'cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
  dispatched: [
    { label: 'Out for Delivery', nextStatus: 'out_for_delivery', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Cancel Order', nextStatus: 'cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
  out_for_delivery: [
    { label: 'Mark Delivered', nextStatus: 'delivered', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'Cancel Order', nextStatus: 'cancelled', color: 'bg-red-500 hover:bg-red-600' },
  ],
  delivered: [],
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [deliveryFields, setDeliveryFields] = useState({ deliveryAgentName: '', deliveryAgentPhone: '', trackingNumber: '' })

  useEffect(() => {
    fetchOrderDetail(id).then(res => {
      setOrder(res.item)
      setDeliveryFields({
        deliveryAgentName: res.item.deliveryAgentName || '',
        deliveryAgentPhone: res.item.deliveryAgentPhone || '',
        trackingNumber: res.item.trackingNumber || '',
      })
    }).catch(() => setError('Failed to load order')).finally(() => setLoading(false))
  }, [id])

  const handleTransition = async (nextStatus: string) => {
    setActionLoading(nextStatus)
    setError('')
    try {
      const payload: Record<string, unknown> = { nextStatus }
      if (nextStatus === 'out_for_delivery' || nextStatus === 'dispatched') {
        if (nextStatus === 'out_for_delivery') {
          payload.deliveryAgentName = deliveryFields.deliveryAgentName
          payload.deliveryAgentPhone = deliveryFields.deliveryAgentPhone
        }
        if (deliveryFields.trackingNumber) payload.trackingNumber = deliveryFields.trackingNumber
      }
      const res = await transitionOrder(id, payload as any)
      setOrder(res.item)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition failed')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="p-8 text-center text-gold">Loading...</div>
  if (!order) return <div className="p-8 text-center text-red-400">Order not found.</div>

  const actions = nextActions[order.status] || []

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gold hover:text-gold mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gold">Order #{order.orderNumber}</h1>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize bg-burgundy text-gold`}>
          {stageLabels[order.status] || order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-burgundy rounded-xl border border-gold p-5">
            <h2 className="font-semibold text-gold mb-4 flex items-center gap-2"><Package className="h-4 w-4" /> Items</h2>
            {order.items?.length ? (
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-3 items-start p-2 -mx-2 rounded-lg hover:bg-burgundy">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 rounded object-cover bg-burgundy" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gold truncate">{item.name}</p>
                      <p className="text-xs text-gold">Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-medium text-gold">₹{Number(item.total).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gold">No items</p>
            )}

            <div className="border-t border-gold mt-4 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gold"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between text-gold"><span>Shipping</span><span>₹{Number(order.shippingTotal).toLocaleString()}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{Number(order.discount).toLocaleString()}</span></div>}
              {order.gstTotal > 0 && <div className="flex justify-between text-gold"><span>GST</span><span>₹{Number(order.gstTotal).toLocaleString()}</span></div>}
              <div className="flex justify-between font-semibold text-gold pt-1.5 border-t border-gold"><span>Total</span><span>₹{Number(order.grandTotal).toLocaleString()}</span></div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-burgundy rounded-xl border border-gold p-5">
              <h2 className="font-semibold text-gold mb-3 flex items-center gap-2"><Truck className="h-4 w-4" /> Shipping Address</h2>
              <pre className="text-sm text-gold font-sans whitespace-pre-wrap">{JSON.stringify(order.shippingAddress, null, 2)}</pre>
            </div>
          )}

          {/* Delivery Info */}
          {(order.deliveryAgentName || order.deliveryAgentPhone || order.trackingNumber) && (
            <div className="bg-burgundy rounded-xl border border-gold p-5">
              <h2 className="font-semibold text-gold mb-3">Delivery Info</h2>
              {order.deliveryAgentName && <p className="text-sm text-gold">Agent: {order.deliveryAgentName}</p>}
              {order.deliveryAgentPhone && <p className="text-sm text-gold">Phone: {order.deliveryAgentPhone}</p>}
              {order.trackingNumber && <p className="text-sm text-gold">Tracking: {order.trackingNumber}</p>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {actions.length > 0 && (
            <div className="bg-burgundy rounded-xl border border-gold p-5">
              <h2 className="font-semibold text-gold mb-4">Actions</h2>
              <div className="space-y-2">
                {actions.map(action => {
                  const needsDeliveryInfo = action.nextStatus === 'out_for_delivery'
                  return (
                    <div key={action.nextStatus}>
                      {needsDeliveryInfo && (
                        <div className="space-y-2 mb-3">
                          <input
                            type="text"
                            placeholder="Delivery agent name *"
                            value={deliveryFields.deliveryAgentName}
                            onChange={e => setDeliveryFields(p => ({ ...p, deliveryAgentName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40"
                          />
                          <input
                            type="text"
                            placeholder="Delivery agent phone *"
                            value={deliveryFields.deliveryAgentPhone}
                            onChange={e => setDeliveryFields(p => ({ ...p, deliveryAgentPhone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40"
                          />
                        </div>
                      )}
                      {(action.nextStatus === 'dispatched' || needsDeliveryInfo) && (
                        <input
                          type="text"
                          placeholder="Tracking number (optional)"
                          value={deliveryFields.trackingNumber}
                          onChange={e => setDeliveryFields(p => ({ ...p, trackingNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gold rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 mb-2"
                        />
                      )}
                      <button
                        onClick={() => handleTransition(action.nextStatus)}
                        disabled={actionLoading !== null || (needsDeliveryInfo && (!deliveryFields.deliveryAgentName || !deliveryFields.deliveryAgentPhone))}
                        className={`w-full py-2 text-gold text-sm font-semibold rounded-lg transition disabled:opacity-40 ${action.color}`}
                      >
                        {actionLoading === action.nextStatus ? 'Processing...' : action.label}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Customer info */}
          {order.customer && (
            <div className="bg-burgundy rounded-xl border border-gold p-5">
              <h2 className="font-semibold text-gold mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Customer
              </h2>
              <p className="text-sm font-medium text-gold">{order.customer.name}</p>
              <p className="text-xs text-gold">{order.customer.email}</p>
              {order.customer.mobile && <p className="text-xs text-gold">{order.customer.mobile}</p>}
            </div>
          )}

          {/* Payment */}
          <div className="bg-burgundy rounded-xl border border-gold p-5">
            <h2 className="font-semibold text-gold mb-3">Payment</h2>
            <p className="text-sm text-gold">Status: <span className="font-medium capitalize">{order.paymentStatus.replace(/_/g, ' ')}</span></p>
            {order.couponCode && <p className="text-sm text-gold">Coupon: {order.couponCode}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
