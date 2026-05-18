import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || 'fleet_tracker_session'
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30

export function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  }
}

export function clearSessionCookie(response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}
