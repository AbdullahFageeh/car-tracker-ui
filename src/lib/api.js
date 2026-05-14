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

function companyResourcePath(companyId, resource, resourceId) {
  const basePath = `/api/companies/${encodeURIComponent(companyId)}/${resource}`
  return resourceId
    ? `${basePath}/${encodeURIComponent(resourceId)}`
    : basePath
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

export function getCompanyVehicles(companyId) {
  return request(companyResourcePath(companyId, 'vehicles'))
}

export function createVehicle(companyId, payload) {
  return request(companyResourcePath(companyId, 'vehicles'), {
    method: 'POST',
    body: payload,
  })
}

export function updateVehicle(companyId, vehicleId, payload) {
  return request(companyResourcePath(companyId, 'vehicles', vehicleId), {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteVehicle(companyId, vehicleId) {
  return request(companyResourcePath(companyId, 'vehicles', vehicleId), {
    method: 'DELETE',
  })
}

export function getCompanyDrivers(companyId) {
  return request(companyResourcePath(companyId, 'drivers'))
}

export function createDriver(companyId, payload) {
  return request(companyResourcePath(companyId, 'drivers'), {
    method: 'POST',
    body: payload,
  })
}

export function updateDriver(companyId, driverId, payload) {
  return request(companyResourcePath(companyId, 'drivers', driverId), {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteDriver(companyId, driverId) {
  return request(companyResourcePath(companyId, 'drivers', driverId), {
    method: 'DELETE',
  })
}

export function getCompanyCustomers(companyId) {
  return request(companyResourcePath(companyId, 'customers'))
}

export function createCustomer(companyId, payload) {
  return request(companyResourcePath(companyId, 'customers'), {
    method: 'POST',
    body: payload,
  })
}

export function updateCustomer(companyId, customerId, payload) {
  return request(companyResourcePath(companyId, 'customers', customerId), {
    method: 'PATCH',
    body: payload,
  })
}

export function deleteCustomer(companyId, customerId) {
  return request(companyResourcePath(companyId, 'customers', customerId), {
    method: 'DELETE',
  })
}
