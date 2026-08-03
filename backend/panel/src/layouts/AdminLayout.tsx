import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, LogOut, Menu, X } from 'lucide-react'
import { adminLogout, getAdminMe, getOrderPipelineCounts } from '../services/api'
import { isSidebarSection, sidebarItems } from '../app/resources'

const stageBadgeClass: Record<string, string> = {
  'pending-payment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  packing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  dispatched: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'out-for-delivery': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({ Products: true, Orders: true })
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    getAdminMe()
      .then(data => setAdmin(data.admin))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  useEffect(() => {
    const fetchCounts = () => {
      getOrderPipelineCounts()
        .then(data => setCounts(data.counts))
        .catch(() => {})
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const initial = 'S'

  async function logout() {
    await adminLogout().catch(() => null)
    navigate('/login', { replace: true })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1E40AF] text-white">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 flex flex-col gap-4 items-center text-center">
        <div className="w-52 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Soil Goddess Logo" className="w-full h-full object-contain scale-[1.85]" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-white leading-tight">Soil Goddess</h2>
          <p className="text-[11px] font-bold text-blue-200 tracking-wider uppercase mt-1">Admin Portal</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3.5 pb-6 overflow-y-auto custom-scrollbar">
        {sidebarItems.map(entry => {
          if (isSidebarSection(entry)) {
            const isOpen = sectionsOpen[entry.label] ?? false
            return (
              <div key={entry.label} className="mb-1">
                <button
                  type="button"
                  onClick={() => setSectionsOpen(prev => ({ ...prev, [entry.label]: !isOpen }))}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-blue-200/80 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  <entry.Icon className="h-4 w-4 shrink-0 text-blue-200" />
                  <span className="flex-1 text-left">{entry.label}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-blue-200" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-blue-200" />
                  )}
                </button>
                {isOpen ? (
                  <div className="ml-3 mt-1 space-y-1 border-l border-white/20 pl-3">
                    {entry.children.map(child => {
                      const count = child.badgeKey ? (counts[child.badgeKey] ?? 0) : 0
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={closeMobile}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                              isActive
                                ? 'bg-white text-[#1E40AF] shadow-md shadow-blue-900/20 font-bold translate-x-1'
                                : 'text-blue-50/90 hover:bg-white/15 hover:text-white hover:translate-x-1 hover:shadow-sm'
                            }`
                          }
                        >
                          <child.Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{child.label}</span>
                          {count > 0 && child.badgeKey ? (
                            <span className="rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black leading-none shadow-sm">
                              {count}
                            </span>
                          ) : null}
                        </NavLink>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          }

          return (
            <NavLink
              key={entry.path}
              to={entry.path}
              end={entry.path === '/'}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 rounded-lg px-4 py-3 text-[14px] font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-[#1E40AF] shadow-md shadow-blue-900/20 font-bold translate-x-1'
                    : 'text-blue-50/90 hover:bg-white/15 hover:text-white hover:translate-x-1 hover:shadow-sm'
                }`
              }
            >
              <entry.Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{entry.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-800 relative">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#1E40AF] shadow-2xl lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#1E40AF] shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={closeMobile}
          className="absolute right-3 top-3 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="lg:pl-[260px] relative z-10">
        {/* Desktop Top Header */}
        <header className="sticky top-0 z-20 hidden lg:flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-8 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Store Management</span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Store Action */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold px-4 py-2 rounded-lg shadow-md shadow-amber-500/20 text-xs transition-all transform hover:-translate-y-0.5"
            >
              View Storefront
            </a>

            <div className="h-6 w-px bg-slate-200" />

            {/* User Avatar */}
            <div 
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white shadow-md bg-[#1E40AF] border border-blue-200"
            >
              {initial}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="group flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <LogOut className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="h-10 w-24 shrink-0 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-[1.85]" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Soil Goddess Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
