'use client'

import { useParams } from 'next/navigation'
import AdminProductForm from '@/components/admin/ProductForm'

export default function AdminProductEditPage() {
  const params = useParams()
  return <AdminProductForm productId={Number(params.id)} isNew={false} />
}
