'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/context/AdminAuthContext'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Ticket, 
  Image as ImageIcon, 
  Megaphone, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Store, 
  PlusCircle, 
  Search,
  Bell,
  UserCheck
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, logout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex font-sans text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Soft UI Vibrant Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto shadow-2xl shadow-blue-500/20 flex flex-col justify-between ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#2563EB] flex items-center justify-center font-black text-lg shadow-md">
                .S
              </div>
              <div>
                <span className="block leading-tight text-base font-extrabold">Silk Admin</span>
                <span className="block text-[11px] text-blue-100 font-normal">Dashboard Panel</span>
              </div>
            </Link>
            <button className="lg:hidden text-white/80 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Primary Action Button (Pill shaped, gold/yellow accent matching reference) */}
          <div className="px-5 pt-6 pb-2">
            <Link 
              href="/admin/products"
              className="w-full flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold py-3 px-4 rounded-full shadow-lg shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              <PlusCircle className="h-5 w-5 text-slate-950" />
              <span>Create Product</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-blue-200/80 mb-2">Menu</p>
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-inner backdrop-blur-md font-semibold' 
                      : 'text-blue-100/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10 backdrop-blur-sm">
          {admin && (
            <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{admin.name}</p>
                <p className="text-xs text-blue-200 truncate capitalize">{admin.role}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4 shrink-0 text-blue-200" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Soft UI Topbar Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center px-6 lg:px-8 gap-4 sticky top-0 z-30 justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button className="lg:hidden text-slate-600 hover:text-slate-900" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Search Input matching reference UI */}
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Type in to search .."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100/80 border-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center relative transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <Link 
              href="/" 
              target="_blank"
              className="flex items-center gap-2 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3.5 py-2 rounded-full transition-colors"
            >
              <Store className="h-3.5 w-3.5" />
              View Store
            </Link>

            {admin && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-bold text-slate-800 leading-none">{admin.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Admin</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Soft UI Canvas */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

