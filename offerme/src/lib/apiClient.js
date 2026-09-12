const BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const adminApi = {
  shops: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/admin/shops${qs ? `?${qs}` : ''}`)
  },
  users: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/admin/users${qs ? `?${qs}` : ''}`)
  },
}