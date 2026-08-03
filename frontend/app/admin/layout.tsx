'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AdminAuthProvider, useAdminAuth } from '@/lib/context/AdminAuthContext'
import AdminLayout from '@/components/admin/AdminLayout'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login')
    }
  }, [isLoading, isAuthenticated, isLoginPage, router])

  if (isLoading) return null

  if (!isAuthenticated && !isLoginPage) return null

  return isLoginPage ? <>{children}</> : <AdminLayout>{children}</AdminLayout>
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminAuthProvider>
  )
}
