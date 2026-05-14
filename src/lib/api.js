async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed.')
  }

  return payload
}

export function getSession() {
  return request('/api/auth/session')
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function signupTrial(payload) {
  return request('/api/auth/trial-signup', {
    method: 'POST',
    body: payload,
  })
}

export function logout() {
  return request('/api/auth/logout', {
    method: 'POST',
  })
}

export function updateProfile(payload) {
  return request('/api/account/profile', {
    method: 'PATCH',
    body: payload,
  })
}

export function changePassword(payload) {
  return request('/api/account/change-password', {
    method: 'POST',
    body: payload,
  })
}

export function createCompany(payload) {
  return request('/api/platform/companies', {
    method: 'POST',
    body: payload,
  })
}
