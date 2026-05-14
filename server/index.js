import 'dotenv/config'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import cookieParser from 'cookie-parser'
import express from 'express'
import {
  featureCatalog,
  getDefaultFeaturesForTemplate,
  getDevicePackageById,
  getPlanMeta,
  getTemplateById,
  planCatalog,
} from '../src/data/companies.js'
import {
  clearSessionCookie,
  createSessionToken,
  getSessionCookieOptions,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  verifyPassword,
} from './auth.js'
import { prisma } from './db.js'
import { serializeCompany, serializeUser } from './serializers.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const distPath = resolve(process.cwd(), 'dist')
const indexHtmlPath = resolve(distPath, 'index.html')
const orderedFeatureIds = featureCatalog.map((feature) => feature.id)

app.use(express.json())
app.use(cookieParser())
app.use('/api', (_request, response, next) => {
  response.set('Cache-Control', 'no-store')
  next()
})

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

function sendError(response, statusCode, message) {
  response.status(statusCode).json({ error: message })
}

function normalizeFeatureIds(enabledFeatures, templateId) {
  const requestedFeatures = Array.isArray(enabledFeatures)
    ? enabledFeatures.filter((featureId) => orderedFeatureIds.includes(featureId))
    : getDefaultFeaturesForTemplate(templateId)

  return orderedFeatureIds.filter((featureId) => requestedFeatures.includes(featureId))
}

function validateCompanyPayload(payload, { requirePassword = true } = {}) {
  const name = payload?.name?.trim()
  const contact = payload?.contact?.trim()
  const email = normalizeEmail(payload?.email)
  const phone = payload?.phone?.trim()
  const city = payload?.city?.trim()
  const password = payload?.password?.trim() || ''

  if (!name || !contact || !email || !phone || !city) {
    return { error: 'Please fill in the company and admin details.' }
  }

  if (requirePassword && password.length < 6) {
    return { error: 'Choose a password with at least 6 characters.' }
  }

  const template = getTemplateById(payload?.templateId)
  const safePlan = planCatalog[payload?.plan] ? payload.plan : template.recommendedPlan
  const planMeta = getPlanMeta(safePlan)
  const devicePackage = getDevicePackageById(payload?.devicePackageId)
  const vehicleCount = Math.max(Number(payload?.vehicleCount) || 0, 1)
  const trackingDeviceUnitPrice = Math.max(
    Number(payload?.trackingDeviceUnitPrice) ||
      devicePackage.defaultPricing.trackingDeviceUnitPrice,
    0
  )
  const dashcamUnitPrice =
    devicePackage.id === 'tracking_dashcam'
      ? Math.max(
          Number(payload?.dashcamUnitPrice) ||
            devicePackage.defaultPricing.dashcamUnitPrice,
          0
        )
      : 0
  const yearlySubscriptionUnitPrice = Math.max(
    Number(payload?.yearlySubscriptionUnitPrice) ||
      devicePackage.defaultPricing.yearlySubscriptionUnitPrice,
    0
  )

  return {
    data: {
      name,
      contact,
      email,
      phone,
      city,
      password,
      templateId: template.id,
      logo: template.icon,
      plan: safePlan,
      monthlyFee: planMeta.monthlyFee,
      vehicleCount,
      vehicleLimit: Math.max(planMeta.vehicleLimit, vehicleCount),
      devicePackageId: devicePackage.id,
      trackingDeviceUnitPrice,
      dashcamUnitPrice,
      yearlySubscriptionUnitPrice,
      enabledFeatures: normalizeFeatureIds(payload?.enabledFeatures, template.id),
      status: 'trial',
    },
  }
}

async function touchSessionAndCompany(auth) {
  const now = new Date()
  const updates = [
    prisma.session.update({
      where: { id: auth.session.id },
      data: { lastSeenAt: now },
    }),
  ]

  if (auth.user.role === 'admin' && auth.user.companyId) {
    updates.push(
      prisma.company.update({
        where: { id: auth.user.companyId },
        data: { lastActiveAt: now },
      })
    )
  }

  await Promise.all(updates)
}

async function buildAuthPayload(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  })

  if (!user) {
    return { user: null, companies: [] }
  }

  if (user.role === 'master') {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return {
      user: serializeUser(user),
      companies: companies.map(serializeCompany),
    }
  }

  if (!user.company) {
    return { user: null, companies: [] }
  }

  return {
    user: serializeUser(user),
    companies: [serializeCompany(user.company)],
  }
}

async function getAuthContext(request) {
  const token = request.cookies?.[SESSION_COOKIE_NAME]

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      user: {
        include: { company: true },
      },
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return {
    token,
    session,
    user: session.user,
  }
}

async function createSession(userId, response) {
  const token = createSessionToken()

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  })

  response.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
}

async function requireAuth(request, response, next) {
  const auth = await getAuthContext(request)

  if (!auth) {
    clearSessionCookie(response)
    sendError(response, 401, 'Please sign in to continue.')
    return
  }

  request.auth = auth
  next()
}

function requireMaster(request, response, next) {
  if (request.auth.user.role !== 'master') {
    sendError(response, 403, 'This action is only available to platform admins.')
    return
  }

  next()
}

app.get('/api/auth/session', async (request, response) => {
  const auth = await getAuthContext(request)

  if (!auth) {
    clearSessionCookie(response)
    response.json({ user: null, companies: [] })
    return
  }

  await touchSessionAndCompany(auth)
  response.json(await buildAuthPayload(auth.user.id))
})

app.post('/api/auth/login', async (request, response) => {
  const email = normalizeEmail(request.body?.email)
  const password = request.body?.password || ''
  const requiredRole = request.body?.accountType === 'master' ? 'master' : 'admin'

  if (!email || !password) {
    sendError(response, 400, 'Please enter email and password.')
    return
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  })

  if (!user || user.role !== requiredRole) {
    sendError(response, 401, 'Incorrect email or password.')
    return
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash)

  if (!passwordMatches) {
    sendError(response, 401, 'Incorrect email or password.')
    return
  }

  if (user.role === 'admin' && user.companyId) {
    await prisma.company.update({
      where: { id: user.companyId },
      data: { lastActiveAt: new Date() },
    })
  }

  await createSession(user.id, response)
  response.json(await buildAuthPayload(user.id))
})

app.post('/api/auth/trial-signup', async (request, response) => {
  const validated = validateCompanyPayload(request.body)

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  const { data } = validated
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    sendError(response, 409, 'An account with this email already exists.')
    return
  }

  const passwordHash = await hashPassword(data.password)
  const createdUser = await prisma.$transaction(async (transaction) => {
    const company = await transaction.company.create({
      data: {
        name: data.name,
        logo: data.logo,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        city: data.city,
        plan: data.plan,
        monthlyFee: data.monthlyFee,
        vehicleCount: data.vehicleCount,
        vehicleLimit: data.vehicleLimit,
        status: data.status,
        templateId: data.templateId,
        devicePackageId: data.devicePackageId,
        trackingDeviceUnitPrice: data.trackingDeviceUnitPrice,
        dashcamUnitPrice: data.dashcamUnitPrice,
        yearlySubscriptionUnitPrice: data.yearlySubscriptionUnitPrice,
        enabledFeatures: data.enabledFeatures,
        lastActiveAt: new Date(),
      },
    })

    return transaction.user.create({
      data: {
        name: data.contact,
        email: data.email,
        passwordHash,
        role: 'admin',
        phone: data.phone,
        companyId: company.id,
      },
    })
  })

  await createSession(createdUser.id, response)
  response.status(201).json(await buildAuthPayload(createdUser.id))
})

app.post('/api/auth/logout', async (request, response) => {
  const token = request.cookies?.[SESSION_COOKIE_NAME]

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    })
  }

  clearSessionCookie(response)
  response.json({ ok: true })
})

app.patch('/api/account/profile', requireAuth, async (request, response) => {
  const name = request.body?.name?.trim()
  const email = normalizeEmail(request.body?.email)
  const phone = request.body?.phone?.trim() || ''
  const language = request.body?.language || 'en'
  const timezone = request.body?.timezone || 'Asia/Riyadh'
  const units = request.body?.units || 'metric'

  if (!name || !email) {
    sendError(response, 400, 'Please fill in your name and email.')
    return
  }

  const duplicateUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: request.auth.user.id },
    },
  })

  if (duplicateUser) {
    sendError(response, 409, 'Another account already uses this email.')
    return
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: request.auth.user.id },
      data: {
        name,
        email,
        phone,
        language,
        timezone,
        units,
      },
    })

    if (request.auth.user.role === 'admin' && request.auth.user.companyId) {
      await transaction.company.update({
        where: { id: request.auth.user.companyId },
        data: {
          contact: name,
          email,
          phone,
          lastActiveAt: new Date(),
        },
      })
    }
  })

  response.json(await buildAuthPayload(request.auth.user.id))
})

app.post('/api/account/change-password', requireAuth, async (request, response) => {
  const currentPassword = request.body?.currentPassword || ''
  const newPassword = request.body?.newPassword || ''

  if (!currentPassword || !newPassword) {
    sendError(response, 400, 'Please fill all password fields.')
    return
  }

  if (newPassword.length < 6) {
    sendError(response, 400, 'Password must be at least 6 characters.')
    return
  }

  const passwordMatches = await verifyPassword(
    currentPassword,
    request.auth.user.passwordHash
  )

  if (!passwordMatches) {
    sendError(response, 400, 'Current password is incorrect.')
    return
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.auth.user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    }),
    prisma.session.deleteMany({
      where: {
        userId: request.auth.user.id,
        NOT: { tokenHash: hashSessionToken(request.auth.token) },
      },
    }),
  ])

  response.json({ ok: true })
})

app.post(
  '/api/platform/companies',
  requireAuth,
  requireMaster,
  async (request, response) => {
    const validated = validateCompanyPayload(request.body)

    if (validated.error) {
      sendError(response, 400, validated.error)
      return
    }

    const { data } = validated
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      sendError(response, 409, 'An account with this email already exists.')
      return
    }

    const passwordHash = await hashPassword(data.password)
    const company = await prisma.$transaction(async (transaction) => {
      const createdCompany = await transaction.company.create({
        data: {
          name: data.name,
          logo: data.logo,
          contact: data.contact,
          email: data.email,
          phone: data.phone,
          city: data.city,
          plan: data.plan,
          monthlyFee: data.monthlyFee,
          vehicleCount: data.vehicleCount,
          vehicleLimit: data.vehicleLimit,
          status: data.status,
          templateId: data.templateId,
          devicePackageId: data.devicePackageId,
          trackingDeviceUnitPrice: data.trackingDeviceUnitPrice,
          dashcamUnitPrice: data.dashcamUnitPrice,
          yearlySubscriptionUnitPrice: data.yearlySubscriptionUnitPrice,
          enabledFeatures: data.enabledFeatures,
          lastActiveAt: new Date(),
        },
      })

      await transaction.user.create({
        data: {
          name: data.contact,
          email: data.email,
          passwordHash,
          role: 'admin',
          phone: data.phone,
          companyId: createdCompany.id,
        },
      })

      return createdCompany
    })

    response.status(201).json({ company: serializeCompany(company) })
  }
)

if (existsSync(indexHtmlPath)) {
  app.use(express.static(distPath))

  app.use((request, response, next) => {
    if (!['GET', 'HEAD'].includes(request.method) || request.path.startsWith('/api/')) {
      next()
      return
    }

    response.sendFile(indexHtmlPath)
  })
}

app.use((error, _request, response, next) => {
  void next
  if (error instanceof SyntaxError && 'body' in error) {
    sendError(response, 400, 'Invalid JSON payload.')
    return
  }

  console.error(error)
  sendError(response, 500, 'Something went wrong on the server.')
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
