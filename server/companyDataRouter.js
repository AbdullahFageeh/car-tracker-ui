import { Router } from 'express'
import { normalizeEmail } from './auth.js'
import { prisma } from './db.js'
import {
  serializeCustomer,
  serializeDriver,
  serializeVehicle,
} from './serializers.js'

const companyDataRouter = Router({ mergeParams: true })
const RIYADH_CENTER = {
  lat: 24.7136,
  lng: 46.6753,
}
const DRIVER_STATUSES = ['active', 'off_duty', 'inactive']
const FUEL_TYPES = ['petrol', 'diesel', 'electric']
const ZONE_SCOPES = ['city', 'country']

function sendError(response, statusCode, message) {
  response.status(statusCode).json({ error: message })
}

function hasOwn(payload, key) {
  return Object.prototype.hasOwnProperty.call(payload || {}, key)
}

function normalizeOptionalText(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || null
}

function parseOptionalDate(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseOptionalInt(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function parseRequiredFloat(value, fallback) {
  const parsed = Number(value ?? fallback)
  return Number.isFinite(parsed) ? parsed : null
}

function parseRequiredInt(value, fallback) {
  const parsed = Number(value ?? fallback)
  return Number.isInteger(parsed) ? parsed : null
}

function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

async function getAuthorizedCompany(request, response) {
  const companyId = request.params.companyId?.trim()

  if (!companyId) {
    sendError(response, 400, 'Company ID is required.')
    return null
  }

  if (
    request.auth.user.role === 'admin' &&
    request.auth.user.companyId !== companyId
  ) {
    sendError(
      response,
      403,
      'You can only access records for your own company workspace.'
    )
    return null
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    sendError(response, 404, 'Company not found.')
    return null
  }

  return company
}

async function syncCompanyVehicleCount(transaction, companyId) {
  const vehicleCount = await transaction.vehicle.count({
    where: { companyId },
  })

  await transaction.company.update({
    where: { id: companyId },
    data: {
      vehicleCount,
      lastActiveAt: new Date(),
    },
  })
}

function validateDriverPayload(payload, { partial = false } = {}) {
  const data = {}

  if (!partial || hasOwn(payload, 'name')) {
    const name = payload?.name?.trim()

    if (!name) {
      return { error: 'Driver name is required.' }
    }

    data.name = name
  }

  if (!partial || hasOwn(payload, 'phone')) {
    data.phone = normalizeOptionalText(payload?.phone)
  }

  if (!partial || hasOwn(payload, 'email')) {
    const email = normalizeOptionalText(payload?.email)
    data.email = email ? normalizeEmail(email) : null
  }

  if (!partial || hasOwn(payload, 'licenseNumber')) {
    data.licenseNumber = normalizeOptionalText(payload?.licenseNumber)
  }

  if (!partial || hasOwn(payload, 'status')) {
    const status = payload?.status || 'active'

    if (!DRIVER_STATUSES.includes(status)) {
      return {
        error: `Driver status must be one of: ${DRIVER_STATUSES.join(', ')}.`,
      }
    }

    data.status = status
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: 'Provide at least one driver field to update.' }
  }

  return { data }
}

function validateCustomerPayload(payload, { partial = false } = {}) {
  const data = {}

  if (!partial || hasOwn(payload, 'name')) {
    const name = payload?.name?.trim()

    if (!name) {
      return { error: 'Customer name is required.' }
    }

    data.name = name
  }

  if (!partial || hasOwn(payload, 'phone')) {
    const phone = payload?.phone?.trim()

    if (!phone) {
      return { error: 'Customer phone is required.' }
    }

    data.phone = phone
  }

  if (!partial || hasOwn(payload, 'nationalId')) {
    const nationalId = payload?.nationalId?.trim()

    if (!nationalId) {
      return { error: 'Customer national ID is required.' }
    }

    data.nationalId = nationalId
  }

  if (!partial || hasOwn(payload, 'email')) {
    const email = payload?.email?.trim()

    if (!email) {
      return { error: 'Customer email is required.' }
    }

    data.email = normalizeEmail(email)
  }

  if (!partial || hasOwn(payload, 'joinedDate')) {
    const joinedDate = parseOptionalDate(payload?.joinedDate)

    if (payload?.joinedDate && !joinedDate) {
      return { error: 'Customer joined date must be a valid date.' }
    }

    data.joinedDate = joinedDate || new Date()
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: 'Provide at least one customer field to update.' }
  }

  return { data }
}

function validateVehiclePayload(payload, { partial = false } = {}) {
  const data = {}

  if (!partial || hasOwn(payload, 'name')) {
    const name = payload?.name?.trim()

    if (!name) {
      return { error: 'Vehicle name is required.' }
    }

    data.name = name
  }

  if (!partial || hasOwn(payload, 'plate')) {
    const plate = payload?.plate?.trim()

    if (!plate) {
      return { error: 'Vehicle plate is required.' }
    }

    data.plate = plate
  }

  if (!partial || hasOwn(payload, 'driverId')) {
    data.driverId = payload?.driverId?.trim() || null
  }

  if (!partial || hasOwn(payload, 'icon')) {
    data.icon = normalizeOptionalText(payload?.icon) || '🚗'
  }

  if (!partial || hasOwn(payload, 'photo')) {
    data.photo = normalizeOptionalText(payload?.photo)
  }

  if (!partial || hasOwn(payload, 'color')) {
    data.color = normalizeOptionalText(payload?.color)
  }

  if (!partial || hasOwn(payload, 'year')) {
    const year = parseOptionalInt(payload?.year)

    if (payload?.year !== undefined && payload?.year !== '' && year === null) {
      return { error: 'Vehicle year must be a whole number.' }
    }

    data.year = year
  }

  if (!partial || hasOwn(payload, 'fuelType')) {
    const fuelType = payload?.fuelType || 'petrol'

    if (!FUEL_TYPES.includes(fuelType)) {
      return {
        error: `Fuel type must be one of: ${FUEL_TYPES.join(', ')}.`,
      }
    }

    data.fuelType = fuelType
  }

  if (!partial || hasOwn(payload, 'lat')) {
    const lat = parseRequiredFloat(payload?.lat, RIYADH_CENTER.lat)

    if (lat === null) {
      return { error: 'Vehicle latitude must be a valid number.' }
    }

    data.lat = lat
  }

  if (!partial || hasOwn(payload, 'lng')) {
    const lng = parseRequiredFloat(payload?.lng, RIYADH_CENTER.lng)

    if (lng === null) {
      return { error: 'Vehicle longitude must be a valid number.' }
    }

    data.lng = lng
  }

  if (!partial || hasOwn(payload, 'speed')) {
    const speed = parseRequiredInt(payload?.speed, 0)

    if (speed === null) {
      return { error: 'Vehicle speed must be a whole number.' }
    }

    data.speed = Math.max(speed, 0)
  }

  if (!partial || hasOwn(payload, 'engineOn')) {
    data.engineOn = parseBoolean(payload?.engineOn, false)
  }

  if (!partial || hasOwn(payload, 'mileage')) {
    const mileage = parseRequiredInt(payload?.mileage, 0)

    if (mileage === null) {
      return { error: 'Vehicle mileage must be a whole number.' }
    }

    data.mileage = Math.max(mileage, 0)
  }

  if (!partial || hasOwn(payload, 'zoneScope')) {
    const zoneScope = payload?.zoneScope || 'city'

    if (!ZONE_SCOPES.includes(zoneScope)) {
      return {
        error: `Vehicle zone scope must be one of: ${ZONE_SCOPES.join(', ')}.`,
      }
    }

    data.zoneScope = zoneScope
  }

  if (!partial || hasOwn(payload, 'speedLimit')) {
    const speedLimit = parseRequiredInt(payload?.speedLimit, 120)

    if (speedLimit === null) {
      return { error: 'Vehicle speed limit must be a whole number.' }
    }

    data.speedLimit = Math.max(speedLimit, 0)
  }

  if (!partial || hasOwn(payload, 'lastOilChangeKm')) {
    const lastOilChangeKm = parseOptionalInt(payload?.lastOilChangeKm)

    if (
      payload?.lastOilChangeKm !== undefined &&
      payload?.lastOilChangeKm !== '' &&
      lastOilChangeKm === null
    ) {
      return { error: 'Vehicle last oil change mileage must be a whole number.' }
    }

    data.lastOilChangeKm = lastOilChangeKm
  }

  if (!partial || hasOwn(payload, 'nextOilChangeKm')) {
    const nextOilChangeKm = parseOptionalInt(payload?.nextOilChangeKm)

    if (
      payload?.nextOilChangeKm !== undefined &&
      payload?.nextOilChangeKm !== '' &&
      nextOilChangeKm === null
    ) {
      return { error: 'Vehicle next oil change mileage must be a whole number.' }
    }

    data.nextOilChangeKm = nextOilChangeKm
  }

  if (!partial || hasOwn(payload, 'nextServiceDate')) {
    const nextServiceDate = parseOptionalDate(payload?.nextServiceDate)

    if (payload?.nextServiceDate && !nextServiceDate) {
      return { error: 'Vehicle next service date must be a valid date.' }
    }

    data.nextServiceDate = nextServiceDate
  }

  if (partial && Object.keys(data).length === 0) {
    return { error: 'Provide at least one vehicle field to update.' }
  }

  return { data }
}

companyDataRouter.use(async (request, response, next) => {
  const company = await getAuthorizedCompany(request, response)

  if (!company) {
    return
  }

  request.company = company
  next()
})

companyDataRouter.get('/drivers', async (request, response) => {
  const drivers = await prisma.driver.findMany({
    where: { companyId: request.company.id },
    include: {
      _count: {
        select: { vehicles: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  response.json({
    drivers: drivers.map(serializeDriver),
  })
})

companyDataRouter.post('/drivers', async (request, response) => {
  const validated = validateDriverPayload(request.body)

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  if (validated.data.email) {
    const duplicateEmail = await prisma.driver.findFirst({
      where: {
        companyId: request.company.id,
        email: validated.data.email,
      },
    })

    if (duplicateEmail) {
      sendError(response, 409, 'Another driver already uses this email.')
      return
    }
  }

  const driver = await prisma.$transaction(async (transaction) => {
    const createdDriver = await transaction.driver.create({
      data: {
        ...validated.data,
        companyId: request.company.id,
      },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })

    return createdDriver
  })

  response.status(201).json({
    driver: serializeDriver(driver),
  })
})

companyDataRouter.patch('/drivers/:driverId', async (request, response) => {
  const existingDriver = await prisma.driver.findFirst({
    where: {
      id: request.params.driverId,
      companyId: request.company.id,
    },
  })

  if (!existingDriver) {
    sendError(response, 404, 'Driver not found.')
    return
  }

  const validated = validateDriverPayload(request.body, { partial: true })

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  if (validated.data.email) {
    const duplicateEmail = await prisma.driver.findFirst({
      where: {
        companyId: request.company.id,
        email: validated.data.email,
        NOT: { id: existingDriver.id },
      },
    })

    if (duplicateEmail) {
      sendError(response, 409, 'Another driver already uses this email.')
      return
    }
  }

  const driver = await prisma.$transaction(async (transaction) => {
    const updatedDriver = await transaction.driver.update({
      where: { id: existingDriver.id },
      data: validated.data,
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })

    return updatedDriver
  })

  response.json({
    driver: serializeDriver(driver),
  })
})

companyDataRouter.delete('/drivers/:driverId', async (request, response) => {
  const existingDriver = await prisma.driver.findFirst({
    where: {
      id: request.params.driverId,
      companyId: request.company.id,
    },
  })

  if (!existingDriver) {
    sendError(response, 404, 'Driver not found.')
    return
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.driver.delete({
      where: { id: existingDriver.id },
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })
  })

  response.json({ ok: true })
})

companyDataRouter.get('/customers', async (request, response) => {
  const customers = await prisma.customer.findMany({
    where: { companyId: request.company.id },
    orderBy: { name: 'asc' },
  })

  response.json({
    customers: customers.map(serializeCustomer),
  })
})

companyDataRouter.post('/customers', async (request, response) => {
  const validated = validateCustomerPayload(request.body)

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  const duplicateCustomer = await prisma.customer.findFirst({
    where: {
      companyId: request.company.id,
      OR: [
        { email: validated.data.email },
        { nationalId: validated.data.nationalId },
      ],
    },
  })

  if (duplicateCustomer) {
    sendError(
      response,
      409,
      'A customer with this email or national ID already exists.'
    )
    return
  }

  const customer = await prisma.$transaction(async (transaction) => {
    const createdCustomer = await transaction.customer.create({
      data: {
        ...validated.data,
        companyId: request.company.id,
      },
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })

    return createdCustomer
  })

  response.status(201).json({
    customer: serializeCustomer(customer),
  })
})

companyDataRouter.patch('/customers/:customerId', async (request, response) => {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: request.params.customerId,
      companyId: request.company.id,
    },
  })

  if (!existingCustomer) {
    sendError(response, 404, 'Customer not found.')
    return
  }

  const validated = validateCustomerPayload(request.body, { partial: true })

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  const duplicateCustomerFilters = [
    validated.data.email ? { email: validated.data.email } : null,
    validated.data.nationalId
      ? { nationalId: validated.data.nationalId }
      : null,
  ].filter(Boolean)

  const duplicateCustomer =
    duplicateCustomerFilters.length > 0
      ? await prisma.customer.findFirst({
          where: {
            companyId: request.company.id,
            NOT: { id: existingCustomer.id },
            OR: duplicateCustomerFilters,
          },
        })
      : null

  if (duplicateCustomer) {
    sendError(
      response,
      409,
      'A customer with this email or national ID already exists.'
    )
    return
  }

  const customer = await prisma.$transaction(async (transaction) => {
    const updatedCustomer = await transaction.customer.update({
      where: { id: existingCustomer.id },
      data: validated.data,
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })

    return updatedCustomer
  })

  response.json({
    customer: serializeCustomer(customer),
  })
})

companyDataRouter.delete('/customers/:customerId', async (request, response) => {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      id: request.params.customerId,
      companyId: request.company.id,
    },
  })

  if (!existingCustomer) {
    sendError(response, 404, 'Customer not found.')
    return
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.customer.delete({
      where: { id: existingCustomer.id },
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })
  })

  response.json({ ok: true })
})

companyDataRouter.get('/vehicles', async (request, response) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { companyId: request.company.id },
    include: {
      driver: true,
    },
    orderBy: { plate: 'asc' },
  })

  response.json({
    vehicles: vehicles.map(serializeVehicle),
  })
})

companyDataRouter.post('/vehicles', async (request, response) => {
  const validated = validateVehiclePayload(request.body)

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  const duplicateVehicle = await prisma.vehicle.findFirst({
    where: {
      companyId: request.company.id,
      plate: validated.data.plate,
    },
  })

  if (duplicateVehicle) {
    sendError(response, 409, 'Another vehicle already uses this plate.')
    return
  }

  if (validated.data.driverId) {
    const existingDriver = await prisma.driver.findFirst({
      where: {
        id: validated.data.driverId,
        companyId: request.company.id,
      },
    })

    if (!existingDriver) {
      sendError(response, 400, 'Assigned driver was not found in this company.')
      return
    }
  }

  const vehicle = await prisma.$transaction(async (transaction) => {
    const createdVehicle = await transaction.vehicle.create({
      data: {
        ...validated.data,
        companyId: request.company.id,
      },
      include: {
        driver: true,
      },
    })

    await syncCompanyVehicleCount(transaction, request.company.id)

    return createdVehicle
  })

  response.status(201).json({
    vehicle: serializeVehicle(vehicle),
  })
})

companyDataRouter.patch('/vehicles/:vehicleId', async (request, response) => {
  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      id: request.params.vehicleId,
      companyId: request.company.id,
    },
  })

  if (!existingVehicle) {
    sendError(response, 404, 'Vehicle not found.')
    return
  }

  const validated = validateVehiclePayload(request.body, { partial: true })

  if (validated.error) {
    sendError(response, 400, validated.error)
    return
  }

  if (validated.data.plate) {
    const duplicateVehicle = await prisma.vehicle.findFirst({
      where: {
        companyId: request.company.id,
        plate: validated.data.plate,
        NOT: { id: existingVehicle.id },
      },
    })

    if (duplicateVehicle) {
      sendError(response, 409, 'Another vehicle already uses this plate.')
      return
    }
  }

  if (hasOwn(validated.data, 'driverId') && validated.data.driverId) {
    const existingDriver = await prisma.driver.findFirst({
      where: {
        id: validated.data.driverId,
        companyId: request.company.id,
      },
    })

    if (!existingDriver) {
      sendError(response, 400, 'Assigned driver was not found in this company.')
      return
    }
  }

  const vehicle = await prisma.$transaction(async (transaction) => {
    const updatedVehicle = await transaction.vehicle.update({
      where: { id: existingVehicle.id },
      data: validated.data,
      include: {
        driver: true,
      },
    })

    await transaction.company.update({
      where: { id: request.company.id },
      data: { lastActiveAt: new Date() },
    })

    return updatedVehicle
  })

  response.json({
    vehicle: serializeVehicle(vehicle),
  })
})

companyDataRouter.delete('/vehicles/:vehicleId', async (request, response) => {
  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      id: request.params.vehicleId,
      companyId: request.company.id,
    },
  })

  if (!existingVehicle) {
    sendError(response, 404, 'Vehicle not found.')
    return
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.vehicle.delete({
      where: { id: existingVehicle.id },
    })

    await syncCompanyVehicleCount(transaction, request.company.id)
  })

  response.json({ ok: true })
})

export { companyDataRouter }
