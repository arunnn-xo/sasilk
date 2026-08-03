'use client'

import { useEffect, useState } from 'react'
import { fetchDashboard, type DashboardStats } from '@/lib/services/admin.service'
import { Package, ShoppingBag, Users, Image as ImageIcon, Tags, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

const iconMap: Record<string, React.ReactNode> = {
  Products: <Package className="h-5 w-5 text-blue-600" />,
  Categories: <Tags className="h-5 w-5 text-emerald-600" />,
  Customers: <Users className="h-5 w-5 text-purple-600" />,
  Orders: <ShoppingBag className="h-5 w-5 text-amber-600" />,
  Banners: <ImageIcon className="h-5 w-5 text-rose-600" />,
}

const colorMap: Record<string, string> = {
  Products: 'bg-blue-50 border-blue-100 text-blue-600',
  Categories: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  Customers: 'bg-purple-50 border-purple-100 text-purple-600',
  Orders: 'bg-amber-50 border-amber-100 text-amber-600',
  Banners: 'bg-rose-50 border-rose-100 text-rose-600',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
      .then(res => setStats(res.stats))
      .catch(() => setStats([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Work Report & Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back! Here is what's happening with your store today.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200/80 text-xs font-semibold text-slate-600">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>This Month</span>
          </div>
        </div>
      </div>

      {/* Floating White Cards Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100/80 animate-pulse">
              <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-20 mb-2" />
              <div className="h-7 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {stats?.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border ${colorMap[s.label] || 'bg-slate-50 text-slate-600'}`}>
                  {iconMap[s.label] || <TrendingUp className="h-5 w-5 text-slate-600" />}
                </div>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +4.2%
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Visual Data Chart / Soft UI Panel (Matching reference style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Work Report Visual Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Performance Report</h2>
              <p className="text-xs text-slate-400">Monthly overview of sales, orders, and customer activity</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center text-xs font-medium text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block mr-1.5" /> Performance</span>
              <span className="flex items-center text-xs font-medium text-slate-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block mr-1.5" /> Attendance</span>
            </div>
          </div>

          {/* Soft SVG Wave / Chart Visualization */}
          <div className="h-52 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {[40, 65, 30, 80, 55, 90, 45, 70, 85, 60, 95, 75, 100].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full max-w-[28px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div 
                    style={{ height: `${height}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all rounded-t-xl"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Summary Floating Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">Easily manage your catalog and store configurations.</p>

            <div className="space-y-3">
              <Link 
                href="/admin/products"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Manage Products</p>
                    <p className="text-[11px] text-slate-400">Add, edit or update stock</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link 
                href="/admin/orders"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">View Orders</p>
                    <p className="text-[11px] text-slate-400">Track and manage customer orders</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </Link>

              <Link 
                href="/admin/categories"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Tags className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Categories</p>
                    <p className="text-[11px] text-slate-400">Organize your store collections</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

