import { apiFetch } from '@/lib/api'

export type AddressData = {
  id: number
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}

export async function fetchAddresses(): Promise<AddressData[]> {
  const res = await apiFetch('/auth/addresses')
  if (!res.ok) throw new Error('Failed to fetch addresses')
  return res.json()
}

export async function createAddress(data: {
  firstName: string
  lastName?: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault?: boolean
}): Promise<AddressData> {
  const res = await apiFetch('/auth/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create address')
  return res.json()
}

export async function updateAddress(id: number, data: Partial<{
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  pincode: string
  phone: string
  isDefault: boolean
}>): Promise<AddressData> {
  const res = await apiFetch(`/auth/addresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update address')
  return res.json()
}

export async function deleteAddress(id: number): Promise<{ message: string }> {
  const res = await apiFetch(`/auth/addresses/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete address')
  return res.json()
}

export async function setDefaultAddress(id: number): Promise<AddressData> {
  return updateAddress(id, { isDefault: true })
}
