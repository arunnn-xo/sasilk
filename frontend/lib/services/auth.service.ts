import { apiFetch, apiPost } from '@/lib/api'

export type CustomerData = {
  id: number
  name: string
  email: string
  mobile: string
  status: string
}

export type AuthResponse = {
  customer: CustomerData
  token?: string
  message?: string
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  return data
}

export async function loginWithOtp(mobile: string, otp: string): Promise<AuthResponse> {
  const res = await apiFetch('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'OTP verification failed')
  return data
}

export async function sendOtp(mobile: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/send-otp', { mobile })
}

export async function register(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  acceptTerms?: boolean
}): Promise<AuthResponse> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Registration failed')
  return json
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/forgot-password', { email })
}

export async function resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/reset-password', data)
}

export async function fetchProfile(): Promise<CustomerData> {
  const res = await apiFetch('/auth/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function updateProfile(data: Partial<{ name: string; email: string; mobile: string }>): Promise<CustomerData> {
  const res = await apiFetch('/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' })
}
