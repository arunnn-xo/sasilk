import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, LogOut, Menu, X } from 'lucide-react'
import { adminLogout, getAdminMe, getOrderPipelineCounts } from '../services/api'
import { isSidebarSection, sidebarItems } from '../app/resources'

const stageBadgeClass: Record<string, string> = {
  'pending-payment': 'bg-yellow-100 text-yellow-800',
  new: 'bg-[#FAF4E8] text-[#8B6B1F] border border-[#D9B86E]/40',
  packing: 'bg-amber-100 text-amber-800',
  dispatched: 'bg-[#FBF7F8] text-[#6B1A2A] border border-[#6B1A2A]/20',
  'out-for-delivery': 'bg-amber-50 text-amber-900',
  delivered: 'bg-emerald-100 text-emerald-800',
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
    <div className="flex flex-col h-full bg-[#1A050B] text-white">
      {/* Brand */}
      <div className="px-4 pt-5 pb-5 flex items-center justify-center border-b border-white/[0.08]">
        <div className="w-full max-w-[224px] h-[84px] bg-white rounded-2xl shadow-md border border-[#D9B86E]/40 flex items-center justify-center p-2 overflow-hidden">
          <img src="/logo.png" alt="Soil Goddess Logo" className="w-full h-full object-contain scale-[1.95]" />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pt-4 pb-6 overflow-y-auto custom-scrollbar">
        {sidebarItems.map(entry => {
          if (isSidebarSection(entry)) {
            const isOpen = sectionsOpen[entry.label] ?? false
            return (
              <div key={entry.label} className="mb-1">
                <button
                  type="button"
                  onClick={() => setSectionsOpen(prev => ({ ...prev, [entry.label]: !isOpen }))}
                  className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.18em] text-[#D9B86E]/90 hover:bg-white/[0.06] hover:text-white transition-all duration-200"
                >
                  <entry.Icon className="h-4 w-4 shrink-0 text-[#D9B86E]" />
                  <span className="flex-1 text-left">{entry.label}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[#D9B86E]" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[#D9B86E]" />
                  )}
                </button>
                {isOpen ? (
                  <div className="ml-3 mt-1 space-y-1 border-l border-[#D9B86E]/20 pl-2.5">
                    {entry.children.map(child => {
                      const count = child.badgeKey ? (counts[child.badgeKey] ?? 0) : 0
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={closeMobile}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-[#6B1A2A] text-white font-bold shadow-sm border-l-2 border-[#D9B86E]'
                                : 'text-[#FAF6EE]/75 hover:bg-white/[0.06] hover:text-white'
                            }`
                          }
                        >
                          <child.Icon className="h-4 w-4 shrink-0 text-[#D9B86E]/80 group-hover:text-[#D9B86E]" />
                          <span className="flex-1">{child.label}</span>
                          {count > 0 && child.badgeKey ? (
                            <span className="rounded-full bg-[#D9B86E] text-[#1A050B] px-2 py-0.5 text-[10px] font-black leading-none shadow-sm">
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
                `group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6B1A2A] text-white font-bold shadow-sm border-l-2 border-[#D9B86E]'
                    : 'text-[#FAF6EE]/75 hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <entry.Icon className="h-4 w-4 shrink-0 text-[#D9B86E]/80 group-hover:text-[#D9B86E]" />
              <span className="flex-1">{entry.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F080D] relative">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#1A050B] shadow-xl border-r border-[#D9B86E]/20 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#1A050B] shadow-2xl border-r border-[#D9B86E]/20 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={closeMobile}
          className="absolute right-3 top-3 rounded-lg p-2 text-[#FAF6EE]/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="lg:pl-[260px] relative z-10">
        {/* Desktop Top Header */}
        <header className="sticky top-0 z-20 hidden lg:flex items-center justify-between border-b border-[#EFE8DA] bg-[#FAF6EE]/90 backdrop-blur-md px-8 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#7A6065] uppercase tracking-wider">Store Management</span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Store Action */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-btn-primary !px-4 !py-2 !rounded-lg !text-xs !no-underline"
            >
              View Storefront
            </a>

            <div className="h-6 w-px bg-[#EFE8DA]" />

            {/* User Avatar */}
            <div 
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white shadow-sm bg-[#6B1A2A] border border-[#D9B86E]/50"
            >
              {initial}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="group flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold text-[#1F080D] bg-white border border-[#EFE8DA] hover:bg-[#FAF6EE] hover:text-[#6B1A2A] transition-all duration-200"
            >
              <LogOut className="h-3.5 w-3.5 text-[#6B1A2A] transition-transform group-hover:scale-110" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EFE8DA] bg-[#FAF6EE]/95 backdrop-blur-md px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-[#6B1A2A] transition-colors hover:bg-black/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="h-10 w-24 shrink-0 bg-white rounded-lg shadow-sm border border-[#EFE8DA] flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-[1.85]" />
            </div>
            <span className="font-bold text-[#300D14] text-sm">Soil Goddess Admin</span>
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
